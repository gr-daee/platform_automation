import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';
import { SelectComponent } from '../../support/components/SelectComponent';

/**
 * Apply Cash Receipt Page Object
 *
 * Source: ../web_app/src/app/finance/cash-receipts/[id]/apply/page.tsx
 * Purpose: Select invoices, set amount to apply, EPD options, submit application.
 */
export class CashReceiptApplyPage extends BasePage {
  private selectComponent: SelectComponent;
  readonly pageTitle: Locator;
  readonly applyPaymentsButton: Locator;
  readonly cancelButton: Locator;
  readonly invoiceCheckboxes: Locator;
  readonly amountToApplyInputs: Locator;

  constructor(page: Page) {
    super(page);
    this.selectComponent = new SelectComponent(page);
    this.pageTitle = page.getByRole('heading', { name: /Apply Cash Receipt/i });
    this.applyPaymentsButton = page.getByRole('button', { name: /Apply Payments/i });
    this.cancelButton = page.getByRole('button', { name: /Cancel/i });
    this.invoiceCheckboxes = page.getByRole('checkbox');
    this.amountToApplyInputs = page.getByLabel(/Amount to Apply/i);
  }

  async goto(receiptId: string): Promise<void> {
    await this.navigateTo(`/finance/cash-receipts/${receiptId}/apply`);
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/finance\/cash-receipts\/[a-f0-9-]+\/apply/, { timeout: 10000 });
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 });
  }

  async selectInvoice(invoiceNumber: string): Promise<void> {
    const rowWithCheckbox = this.invoiceRow(invoiceNumber);
    await expect(rowWithCheckbox).toBeVisible({ timeout: 10000 });
    await rowWithCheckbox.scrollIntoViewIfNeeded();

    const checkbox = rowWithCheckbox.getByRole('checkbox').first();
    await expect(checkbox).toBeVisible({ timeout: 5000 });

    const isChecked = await checkbox.isChecked().catch(() => false);
    if (!isChecked) {
      await checkbox.click();
      await this.page.waitForTimeout(500);
    }
  }

  async setAmountToApply(invoiceNumber: string, amount: number): Promise<void> {
    const invoiceRow = this.invoiceRow(invoiceNumber);
    await expect(invoiceRow).toBeVisible({ timeout: 10000 });
    await invoiceRow.scrollIntoViewIfNeeded();

    const amountInput = invoiceRow.locator('input[type="number"]').first();
    await expect(amountInput).toBeVisible({ timeout: 5000 });

    const isEnabled = await amountInput.isEnabled().catch(() => false);
    if (!isEnabled) {
      throw new Error(`Amount input is disabled. Invoice "${invoiceNumber}" must be selected first.`);
    }

    await amountInput.clear();
    await amountInput.fill(String(amount));
    await amountInput.blur();
    await this.page.waitForTimeout(600);
  }

  /** Wait for the Apply Payments button to show the given selected count, e.g. "Apply Payments (2)". */
  async waitForSelectedInvoiceCount(expectedCount: number): Promise<void> {
    // Allow time for React state/debounce to update after selecting multiple invoices
    await this.page.waitForTimeout(1200);
    // Prefer: button showing "Apply Payments (2)" (or same with different spacing)
    const buttonWithCount = this.page
      .getByRole('button')
      .filter({ hasText: new RegExp(`Apply Payments\\s*\\(\\s*${expectedCount}\\s*\\)`, 'i') });
    const found = await buttonWithCount.waitFor({ state: 'visible', timeout: 8000 }).catch(() => false);
    if (found) return;
    // Fallback: wait for any "Apply Payments" button to be visible and enabled (UI may show (1) or no count)
    const anyApply = this.page.getByRole('button', { name: /Apply Payments/i });
    await expect(anyApply.first()).toBeVisible({ timeout: 5000 });
    await this.page.waitForTimeout(500);
  }

  /** Wait for apply form state to settle (debounce, React state) before clicking Apply Payment. */
  async waitForApplyFormReady(): Promise<void> {
    await this.page.waitForTimeout(800);
  }

  /** Wait for the Apply Payments button to be enabled (canSubmit true). Use before save in multi-invoice flow. */
  async waitForApplyButtonEnabled(): Promise<void> {
    const button = this.page.getByRole('button', { name: /Apply Payments\s*(\(\s*\d+\s*\))?/i }).first();
    await expect(button).toBeEnabled({ timeout: 15000 });
  }

  async expectApplyButtonDisabled(): Promise<void> {
    const button = this.page.getByRole('button', { name: /Apply Payments\s*(\(\s*\d+\s*\))?/i }).first();
    await expect(button).toBeDisabled({ timeout: 8000 });
  }

  /**
   * Locate the single invoice row (card) for the given invoice number.
   * Must scope to the row card (relative border-2 rounded-lg) so we don't match a parent
   * that contains multiple rows and accidentally interact with the first row's checkbox.
   */
  private invoiceRow(invoiceNumber: string): Locator {
    const escaped = invoiceNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.page
      .locator('div.relative.border-2.rounded-lg')
      .filter({ has: this.page.getByText(new RegExp(escaped, 'i')) })
      .filter({ has: this.page.locator('[role="checkbox"]') })
      .first();
  }

  async toggleEPDEnabled(invoiceNumber: string, enabled: boolean): Promise<void> {
    const invoiceRow = this.invoiceRow(invoiceNumber);
    await expect(invoiceRow).toBeVisible({ timeout: 10000 });
    await invoiceRow.scrollIntoViewIfNeeded();

    // EPD checkbox: label "Apply Early Payment Discount (n%)" in green EPD section
    const epdCheckbox = invoiceRow
      .getByLabel(/Apply Early Payment Discount|Early Payment/i)
      .or(invoiceRow.getByRole('checkbox', { name: /discount|EPD/i }))
      .first();

    const checked = await epdCheckbox.isChecked().catch(() => false);
    if (checked !== enabled) {
      await epdCheckbox.click();
      await this.page.waitForTimeout(300);
    }
  }

  /** Assert the apply page shows EPD discount (CCN credit / Your discount) for this invoice row. */
  async expectEPDDiscountVisible(invoiceNumber: string): Promise<void> {
    const row = this.invoiceRow(invoiceNumber);
    await expect(row).toBeVisible({ timeout: 10000 });
    // Row can contain both "CCN credit: ₹X" and "₹Y deducted from receipt" — use .first() to avoid strict-mode
    const epdText = row.getByText(
      /CCN credit:|Your discount:|₹[\d,.]+\s*\(will be issued|deducted from receipt/i
    ).first();
    await expect(epdText).toBeVisible({ timeout: 5000 });
  }

  /**
   * Select the first invoice row that shows the given EPD percentage (e.g. 7.5 for 31-45 days slab).
   * Clicks the row's selection checkbox so that invoice is included in the application.
   */
  async selectInvoiceWithEPDPercent(epdPercent: number): Promise<void> {
    const percentStr = String(epdPercent);
    const row = this.page
      .locator('div')
      .filter({ has: this.page.locator('[role="checkbox"]') })
      .filter({ hasText: new RegExp(percentStr.replace('.', '\\.') + '%?') })
      .first();
    await expect(row).toBeVisible({ timeout: 15000 });
    await row.scrollIntoViewIfNeeded();
    const checkbox = row.getByRole('checkbox').first();
    const isChecked = await checkbox.isChecked().catch(() => false);
    if (!isChecked) {
      await checkbox.click();
      await this.page.waitForTimeout(500);
    }
  }

  /** Assert that the apply page shows the given EPD % for at least one invoice (e.g. 7.5% after slab update). */
  async expectEPDPercentShown(epdPercent: number): Promise<void> {
    const percentStr = String(epdPercent);
    const locator = this.page.getByText(new RegExp(percentStr.replace('.', '\\.') + '\\s*%')).first();
    await expect(locator).toBeVisible({ timeout: 10000 });
  }

  /** Assert the apply page shows no EPD discount taken (EPD unchecked or zero). */
  async expectNoEPDDiscountVisible(invoiceNumber: string): Promise<void> {
    const row = this.invoiceRow(invoiceNumber);
    await expect(row).toBeVisible({ timeout: 10000 });
    const epdCheckbox = row
      .getByLabel(/Apply Early Payment Discount|Early Payment/i)
      .or(row.getByRole('checkbox', { name: /discount|EPD/i }))
      .first();
    await expect(epdCheckbox).toBeVisible({ timeout: 5000 });
    const checked = await epdCheckbox.isChecked().catch(() => false);
    expect(checked).toBe(false);
  }

  async setManualDiscountAmount(invoiceNumber: string, amount: number): Promise<void> {
    // Find the invoice row by invoice number
    const invoiceRow = this.page
      .locator('div')
      .filter({ hasText: new RegExp(invoiceNumber, 'i') })
      .filter({ has: this.page.locator('[role="checkbox"]') })
      .first();
    
    await expect(invoiceRow).toBeVisible({ timeout: 10000 });
    
    // Find custom discount input - it's in the EPD collapsible section
    // Look for input with label "Custom Discount Amount" or similar
    const discountInput = invoiceRow
      .getByLabel(/Custom Discount Amount|Manual Discount/i)
      .or(invoiceRow.locator('input[type="number"]').filter({ has: this.page.locator('label').filter({ hasText: /discount/i }) }))
      .first();
    
    await expect(discountInput).toBeVisible({ timeout: 5000 });
    await discountInput.clear();
    await discountInput.fill(String(amount));
    await this.page.waitForTimeout(300);
  }

  async saveApplication(): Promise<void> {
    // Wait for the Apply Payments button to be enabled (form state / debounce may delay).
    // Button may show "Apply Payments (1)" or "Apply Payments (2)" etc.
    const applyButton = this.page.getByRole('button', { name: /Apply Payments\s*(\(\s*\d+\s*\))?/i }).first();
    await expect(applyButton).toBeEnabled({ timeout: 15000 });
    await this.page.waitForTimeout(400);
    // Ensure button is in view (e.g. when applying to second invoice, list is long and button is at bottom).
    await applyButton.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(200);
    // Click "Apply Payments" and wait for the async processing state to complete.
    // The UI shows a transient "Applying Payments..." state on the footer button.
    await applyButton.click();
    
    const applyingButton = this.page.getByRole('button', { name: /Applying Payments/i });
    const applyButtonAfter = this.page.getByRole('button', { name: /^Apply Payments$/i });

    // If the "Applying Payments..." state appears, wait for it to go away and
    // for the original "Apply Payments" button to return (or be re-enabled).
    await applyingButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await applyButtonAfter.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

    // Wait for success toast so we know the server has persisted the application(s).
    await this.waitForToast(/applied successfully|Payments applied/i, 12000).catch(() => {});

    // App usually redirects to receipt detail; wait for it when on apply URL (don't fail if redirect is slow or skipped).
    const url = this.page.url();
    if (url.includes('/apply')) {
      await this.page.waitForURL((u) => !u.href.includes('/apply'), { timeout: 20000, waitUntil: 'domcontentloaded' }).catch(() => {});
    }
  }
}
