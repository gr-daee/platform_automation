import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * O2C — Create Sales Return Order wizard (`/o2c/sales-returns/new`).
 *
 * Source: ../web_app/src/app/o2c/sales-returns/new/page.tsx
 */
export class CreateSalesReturnOrderPage extends BasePage {
  static readonly CREATE_PATH = '/o2c/sales-returns/new';

  readonly pageHeading: Locator;
  /** Card for step 1 — invoice/dealer triggers change accessible name after selection (no longer "Select Invoice..."). */
  readonly step1Card: Locator;
  readonly selectInvoiceTrigger: Locator;
  readonly selectDealerTrigger: Locator;
  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole('heading', { name: /create sales return order/i });
    this.step1Card = page.getByRole('heading', { name: /step 1: select invoice/i }).locator('..');
    this.selectInvoiceTrigger = this.step1Card.getByRole('button').nth(0);
    this.selectDealerTrigger = this.step1Card.getByRole('button').nth(1);
  }

  async goto(): Promise<void> {
    await this.navigateTo(CreateSalesReturnOrderPage.CREATE_PATH);
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.pageHeading).toBeVisible({ timeout: 60000 });
  }

  /** Step 1 loads invoices/dealers async; avoid racing the SearchableSelectDialog. */
  async waitForStep1SelectorsReady(): Promise<void> {
    await expect(this.selectInvoiceTrigger).not.toContainText(/loading invoices/i, { timeout: 120000 });
    await expect(this.selectDealerTrigger).not.toContainText(/loading dealers/i, { timeout: 120000 });
  }

  /** Open “Select Invoice” dialog, server-search, pick row matching invoice number. */
  async selectInvoiceFromDialogByNumber(invoiceNumber: string): Promise<void> {
    await this.waitForStep1SelectorsReady();
    await this.selectInvoiceTrigger.click();
    const dialog = this.page.getByRole('dialog', { name: /select invoice/i });
    await expect(dialog).toBeVisible();
    const search = dialog.getByPlaceholder(/search by invoice number/i);
    await search.fill(invoiceNumber);
    const dataRow = dialog.locator('tbody tr').filter({ hasText: invoiceNumber }).first();
    await expect(dataRow).toBeVisible({ timeout: 60000 });
    await dataRow.getByRole('button', { name: 'Select', exact: true }).click();
    await expect(dialog).toBeHidden({ timeout: 15000 });
    await expect(this.selectInvoiceTrigger).toContainText(invoiceNumber, { timeout: 15000 });
  }

  /**
   * UI auto-fills dealer from invoice when `dealers` contains `dealer_id`; if that misses (timing / edge data),
   * open the dealer dialog and select by `dealer_code` (matches `getDealers` list).
   */
  async expectDealerTriggerShowsDealerName(dealerNameSubstring: string, dealerCode?: string): Promise<void> {
    const sub = dealerNameSubstring.trim().slice(0, 40);
    await expect(this.selectDealerTrigger).not.toContainText(/loading dealers/i, { timeout: 60000 });
    try {
      await expect(this.selectDealerTrigger).toContainText(sub, { timeout: 10000 });
    } catch {
      const code = dealerCode?.trim();
      if (!code) {
        throw new Error('Dealer did not auto-fill and no dealer_code was provided for dialog fallback');
      }
      await this.selectDealerFromDialogBySearchTerm(code);
      await expect(this.selectDealerTrigger).toContainText(sub, { timeout: 15000 });
    }
  }

  /** Dealer dialog uses client-side filter on loaded dealers (search by name, code, etc.). */
  async selectDealerFromDialogBySearchTerm(searchTerm: string): Promise<void> {
    await this.selectDealerTrigger.click();
    const dialog = this.page.getByRole('dialog', { name: /select dealer/i });
    await expect(dialog).toBeVisible();
    const search = dialog.getByPlaceholder(/search by dealer name/i);
    await search.fill(searchTerm);
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const dataRow = dialog.locator('tbody tr').filter({ hasText: new RegExp(escaped, 'i') }).first();
    await expect(dataRow).toBeVisible({ timeout: 60000 });
    await dataRow.getByRole('button', { name: 'Select', exact: true }).click();
    await expect(dialog).toBeHidden({ timeout: 15000 });
  }

  /** Radix Select — trigger `#returnReason` (wizard step 1). */
  async chooseReturnReasonOption(optionLabel: string): Promise<void> {
    await this.page.locator('#returnReason').click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    await this.page.getByRole('option', { name: optionLabel }).click();
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 5000 });
  }

  async fillReturnNotes(notes: string): Promise<void> {
    await this.page.getByLabel(/return notes/i).fill(notes);
  }

  async clickLoadInvoiceItems(): Promise<void> {
    await this.page.getByRole('button', { name: /load invoice items/i }).click();
    await expect(this.page.getByRole('heading', { name: /step 2: select items to return/i })).toBeVisible({
      timeout: 120000,
    });
  }

  async setFirstReturnQuantity(qty: string): Promise<void> {
    await this.page.getByLabel('Return Quantity').first().fill(qty);
  }

  /**
   * Parse "Available: N" for line index N in step 2.
   * Returns null when UI text cannot be parsed (line not loaded or structure changed).
   */
  async getAvailableToReturnByLineIndex(index: number): Promise<number | null> {
    const step2Card = this.page.getByRole('heading', { name: /step 2: select items to return/i }).locator('..');
    const avail = step2Card.getByText(/Available:\s*[\d.]+/).nth(index);
    const visible = await avail.isVisible().catch(() => false);
    if (!visible) return null;
    const text = await avail.textContent();
    const m = text?.match(/Available:\s*([\d.]+)/);
    if (!m?.[1]) return null;
    return parseFloat(m[1]);
  }

  /**
   * Smart test-data-safe selection:
   * - scans all return quantity inputs
   * - finds a line with available_to_return > 0
   * - fills a safe quantity (<= available)
   * Returns metadata for downstream assertions.
   */
  async setSmartReturnQuantityForAnyEligibleLine(preferredQty = 1): Promise<{
    lineIndex: number;
    usedQty: number;
    availableQty: number;
  }> {
    const inputs = this.page.getByLabel('Return Quantity');
    const count = await inputs.count();
    expect(count, 'No return quantity inputs found in step 2').toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const enabled = await input.isEnabled().catch(() => false);
      if (!enabled) continue;
      const available = await this.getAvailableToReturnByLineIndex(i);
      if (available === null || available <= 0) continue;
      const use = Math.min(preferredQty, available);
      const useStr = Number.isInteger(use) ? String(use) : String(Number(use.toFixed(3)));
      await input.click();
      await input.clear();
      await input.fill(useStr);
      return { lineIndex: i, usedQty: use, availableQty: available };
    }

    throw new Error(
      'No eligible return line with positive available quantity was found. ' +
        'Likely data drift (already returned quantities) for selected invoice.'
    );
  }

  /** Parses “Available: N” from first return line (step 2). */
  async getFirstLineAvailableToReturn(): Promise<number> {
    const step2Card = this.page.getByRole('heading', { name: /step 2: select items to return/i }).locator('..');
    const avail = step2Card.getByText(/Available:\s*[\d.]+/).first();
    await expect(avail).toBeVisible({ timeout: 15000 });
    const text = await avail.textContent();
    const m = text?.match(/Available:\s*([\d.]+)/);
    expect(m?.[1], `could not parse available qty from "${text}"`).toBeTruthy();
    return parseFloat(m![1]);
  }

  /**
   * SR-PH6-TC-003 — `alert()` when no line has return qty > 0.
   * Register `dialog` handler first so `alert()` is dismissed immediately and the JS thread does not stall automation.
   */
  async clickReviewWithNoItemsSelectedExpectAlert(): Promise<void> {
    const reviewBtn = this.page.getByRole('button', { name: /review \(0 items selected\)/i });
    await expect(reviewBtn).toBeVisible();
    this.page.once('dialog', async (d) => {
      expect(d.message()).toMatch(/select at least one item/i);
      await d.accept();
    });
    await reviewBtn.evaluate((el: HTMLButtonElement) => {
      el.click();
    });
    await expect(this.page.getByRole('heading', { name: /step 2: select items to return/i })).toBeVisible();
  }

  /**
   * SR-PH6-TC-004 — `alert()` when qty exceeds `available_to_return`.
   */
  async setFirstReturnQuantityExceedingAvailableExpectAlert(): Promise<void> {
    const inputs = this.page.getByLabel('Return Quantity');
    const count = await inputs.count();
    expect(count, 'No return quantity inputs found in step 2').toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const enabled = await input.isEnabled().catch(() => false);
      if (!enabled) continue;
      const max = await this.getAvailableToReturnByLineIndex(i);
      if (max === null || max <= 0) continue;
      const bad = max + 999;
      await input.evaluate((el: HTMLInputElement) => {
        el.removeAttribute('max');
      });
      const badStr = String(bad);
      this.page.once('dialog', async (d) => {
        expect(d.message()).toMatch(/cannot exceed|available quantity/i);
        await d.accept();
      });
      await input.click();
      await input.clear();
      await this.page.keyboard.type(badStr);
      await expect(this.page.getByRole('heading', { name: /step 2: select items to return/i })).toBeVisible();
      return;
    }

    throw new Error('No eligible line with positive available quantity found to validate quantity-exceed guardrail.');
  }

  async clickReviewSelectedItems(): Promise<void> {
    await this.page.getByRole('button', { name: /review \(\d+ items selected\)/i }).click();
    await expect(this.page.getByRole('heading', { name: /step 3: review & submit/i })).toBeVisible({
      timeout: 30000,
    });
  }

  async clickSubmitCreateReturnOrder(): Promise<void> {
    await this.page.getByRole('button', { name: 'Create Return Order', exact: true }).click();
  }

  async expectRedirectToReturnDetail(): Promise<void> {
    await expect(this.page).toHaveURL(/\/o2c\/sales-returns\/(?!new)[a-zA-Z0-9-]+\/?$/, {
      timeout: 120000,
    });
  }

  /** Status badge for `pending` maps to “Pending Receipt” on detail page. */
  async expectDetailShowsPendingReceipt(): Promise<void> {
    await expect(this.page.getByText('Pending Receipt', { exact: true }).first()).toBeVisible({
      timeout: 30000,
    });
  }
}
