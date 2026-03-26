import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * Cash Receipt Detail Page Object
 *
 * Source: ../web_app/src/app/finance/cash-receipts/[id]/page.tsx
 * Purpose: View receipt details, navigate to Apply to Invoices, verify applications and EPD.
 */
export class CashReceiptDetailPage extends BasePage {
  readonly pageTitle: Locator;
  readonly applyToInvoicesButton: Locator;
  readonly backButton: Locator;
  readonly applicationsTable: Locator;
  readonly totalReceiptAmount: Locator;
  readonly amountUnapplied: Locator;
  /** Amount summary card: "Amount Applied" label and value */
  readonly amountAppliedLabel: Locator;
  readonly amountAppliedValue: Locator;
  /** Amount summary card: "EPD Discount Given" label and value */
  readonly epdDiscountGivenLabel: Locator;
  readonly epdDiscountGivenValue: Locator;
  /** Amount summary card: "CCN Issued" label and value (EPD discount amount) */
  readonly ccnIssuedLabel: Locator;
  readonly ccnIssuedValue: Locator;
  /** Amount summary card: "Balance (Unapplied)" */
  readonly balanceUnappliedLabel: Locator;
  /** Un-apply button on application row or page */
  readonly unapplyButton: Locator;
  /** Un-apply dialog */
  readonly unapplyDialog: Locator;
  readonly unapplyReasonInput: Locator;
  readonly unapplyConfirmButton: Locator;
  /** Journal Entries table (audit trail) */
  readonly journalEntriesTable: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('h1, h2').filter({ hasText: /CR-|cash receipt|receipt/i }).first();
    this.applyToInvoicesButton = page.getByRole('button', { name: /Apply to Invoices/i });
    this.backButton = page.getByRole('link', { name: /Back/i }).or(page.getByRole('button', { name: /Back/i }));
    // Table under "Applications to Invoices" card (Source: [id]/page.tsx - table with Invoice, Amount, CCN Amount columns)
    this.applicationsTable = page
      .locator('table')
      .filter({ has: page.locator('th').filter({ hasText: 'Invoice' }) })
      .first();
    this.totalReceiptAmount = page.getByText('Total Receipt Amount').locator('..').locator('..').getByText(/₹|[\d,.]/).first();
    this.amountUnapplied = page.getByText('Balance (Unapplied)').locator('..').locator('..').getByText(/₹|[\d,.]/).first();
    this.amountAppliedLabel = page.getByText('Amount Applied', { exact: false }).first();
    this.amountAppliedValue = this.amountAppliedLabel.locator('..').locator('..').getByText(/₹|[\d,.]/).first();
    this.epdDiscountGivenLabel = page.getByText('EPD Discount Given', { exact: false }).first();
    this.epdDiscountGivenValue = this.epdDiscountGivenLabel.locator('..').locator('..').getByText(/₹|[\d,.]/).last();
    this.ccnIssuedLabel = page.getByText('CCN Issued', { exact: false }).first();
    // Use the last numeric value within the CCN Issued container to avoid
    // accidentally picking up "Net Cash Applied" or other summary values.
    this.ccnIssuedValue = this.ccnIssuedLabel.locator('..').locator('..').getByText(/₹|[\d,.]/).last();
    this.balanceUnappliedLabel = page.getByText('Balance (Unapplied)', { exact: false }).first();
    this.unapplyButton = page.getByRole('button', { name: /Un-apply/i });
    this.unapplyDialog = page.getByRole('dialog').filter({ hasText: /Un-apply Cash Receipt/i });
    this.unapplyReasonInput = page.getByLabel(/Un-apply Reason/i);
    this.unapplyConfirmButton = page.getByRole('button', { name: /Un-apply Payment/i });
    this.journalEntriesTable = page
      .locator('table')
      .filter({ has: page.locator('th').filter({ hasText: /Journal Number/i }) })
      .first();
  }

  async goto(receiptId: string): Promise<void> {
    await this.navigateTo(`/finance/cash-receipts/${receiptId}`);
    await this.page.waitForLoadState('domcontentloaded');
    await this.waitForDetailPageLoaded();
  }

  /**
   * Wait for "Loading cash receipt..." to disappear and main content to be visible.
   * Uses a single-element locator (page title) to avoid Playwright strict mode violation.
   */
  async waitForDetailPageLoaded(): Promise<void> {
    const loadingText = this.page.getByText('Loading cash receipt...', { exact: false });
    await loadingText.waitFor({ state: 'hidden', timeout: 20000 }).catch(() => {});
    // Page marker can vary; accept any stable receipt-detail marker.
    const markerChecks = await Promise.all([
      this.pageTitle.isVisible().catch(() => false),
      this.backButton.isVisible().catch(() => false),
      this.totalReceiptAmount.isVisible().catch(() => false),
      this.amountUnapplied.isVisible().catch(() => false),
      this.journalEntriesTable.isVisible().catch(() => false),
    ]);
    const hasAnyMarker = markerChecks.some(Boolean);
    if (!hasAnyMarker) await this.page.waitForTimeout(1500);
  }

  async verifyPageLoaded(receiptNumber?: string): Promise<void> {
    await expect(this.page).toHaveURL(/\/finance\/cash-receipts\/[a-f0-9-]+/, { timeout: 10000 });
    await this.waitForDetailPageLoaded();
    if (receiptNumber) {
      await expect(this.page.getByText(receiptNumber, { exact: false })).toBeVisible({ timeout: 10000 });
    }
  }

  async clickApplyToInvoices(): Promise<void> {
    await this.applyToInvoicesButton.click();
    await this.page.waitForURL(/\/apply/, { timeout: 5000 });
  }

  async verifyApplicationCreated(invoiceNumber: string, timeoutMs = 5000): Promise<void> {
    await expect(this.applicationsTable).toBeVisible({ timeout: 10000 });
    await this.applicationsTable.scrollIntoViewIfNeeded();
    await expect(this.applicationsTable.getByText(invoiceNumber, { exact: false })).toBeVisible({ timeout: timeoutMs });
  }

  async verifyEPDDiscount(amount: number): Promise<void> {
    const discountCell = this.applicationsTable
      .locator('div, td')
      .filter({ hasText: new RegExp(String(amount), 'i') });
    await expect(discountCell.first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Parse a currency string like "₹7.00" or mixed text like "₹7.00(7.0%)IACSP/CN/000139" into a number.
   * Uses the first numeric token as the amount and ignores trailing percentage or codes.
   */
  private parseCurrency(text: string | null | undefined): number {
    const raw = (text || '').replace(/₹/g, '');
    const match = raw.match(/-?\d[\d,]*(?:\.\d+)?/);
    const numericToken = match ? match[0].replace(/,/g, '') : '';
    const value = numericToken === '' ? NaN : Number(numericToken);
    if (Number.isNaN(value)) {
      throw new Error(`Unable to parse currency from text: "${text || ''}"`);
    }
    return value;
  }

  /**
   * Get the EPD discount amount from the Amount Summary card.
   *
   * Priority:
   * 1. "EPD Discount Given" value (if visible)
   * 2. "CCN Issued" value (current UI label for EPD CCN)
   * 3. Fallback: first numeric discount value in the applications table
   */
  async getEPDDiscountAmount(): Promise<number> {

    // 1) Prefer explicit "EPD Discount Given" card value if present
    if (await this.epdDiscountGivenValue.isVisible().catch(() => false)) {
      const text = await this.epdDiscountGivenValue.textContent();
      return this.parseCurrency(text);
    }

    // 2) Fallback to "CCN Issued" amount (what UI currently shows)
    if (await this.ccnIssuedValue.isVisible().catch(() => false)) {
      const text = await this.ccnIssuedValue.textContent();
      return this.parseCurrency(text);
    }

    // 3) Last resort: find discount amount in applications table
    const discountCell = this.applicationsTable
      .locator('td')
      .filter({ hasText: /₹|discount|ccn/i })
      .first();

    await expect(discountCell).toBeVisible({ timeout: 5000 });
    const text = await discountCell.textContent();
    return this.parseCurrency(text);
  }

  /**
   * Get the EPD discount amount for a specific invoice from the Applications table
   * using the CCN Amount/Discount column, to avoid ambiguity with other summary values.
   */
  async getEPDDiscountAmountForInvoice(invoiceNumber: string): Promise<number> {
    await expect(this.applicationsTable).toBeVisible({ timeout: 10000 });

    const row = this.applicationRow(invoiceNumber);
    await expect(row).toBeVisible({ timeout: 7000 });

    const discountCell = row.getByRole('cell').nth(CashReceiptDetailPage.APPLICATIONS_COL_CCN_DISCOUNT);
    await expect(discountCell).toBeVisible({ timeout: 5000 });
    const text = await discountCell.textContent();
    return this.parseCurrency(text);
  }

  /** Verify amount summary card shows Amount Applied and EPD Discount Given (labels or values visible). */
  async verifyAmountSummaryVisible(): Promise<void> {
    await expect(this.amountAppliedLabel).toBeVisible({ timeout: 5000 });
    await expect(this.balanceUnappliedLabel).toBeVisible({ timeout: 5000 });
  }

  /** Verify EPD discount is displayed (label or applications table discount column). */
  async verifyEPDDiscountDisplayed(): Promise<void> {
    const hasLabel = await this.epdDiscountGivenLabel.isVisible().catch(() => false);
    const hasDiscountInTable = await this.applicationsTable
      .getByText(/Discount|EPD|CCN Amount/i)
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasLabel || hasDiscountInTable).toBe(true);
  }

  /**
   * Verify application row and expanded EPD details for a specific invoice.
   *
   * Source: [id]/page.tsx — Applications to Invoices is a <table> with columns:
   * # (0), Invoice (1), Applied On (2), Amount (3), CCN Amount/Discount (4), Status (5), Reversal (6), Actions (7).
   * Discount cell has a <button> that toggles the EPD breakdown row.
   */
  private static readonly APPLICATIONS_COL_AMOUNT = 3;
  private static readonly APPLICATIONS_COL_CCN_DISCOUNT = 4;

  async verifyApplicationDetails(
    invoiceNumber: string,
    expectedAppliedAmount: number,
    expectedDiscountAmount: number
  ): Promise<void> {
    // 0) Applications table is only on the receipt detail page; ensure it has loaded
    await expect(this.applicationsTable).toBeVisible({ timeout: 10000 });

    // 1) Find the table row for this invoice (tbody tr that contains the invoice number)
    const row = this.applicationsTable
      .locator('tbody tr')
      .filter({ hasText: invoiceNumber })
      .first();

    await expect(row).toBeVisible({ timeout: 7000 });

    // 2) Verify Amount and CCN/Discount in the correct cells (avoid strict mode: /100/ matches many elements)
    const amountCell = row.getByRole('cell').nth(CashReceiptDetailPage.APPLICATIONS_COL_AMOUNT);
    const discountCell = row.getByRole('cell').nth(CashReceiptDetailPage.APPLICATIONS_COL_CCN_DISCOUNT);
    await expect(amountCell).toContainText(String(expectedAppliedAmount), { timeout: 5000 });
    await expect(discountCell).toContainText(String(expectedDiscountAmount), { timeout: 5000 });

    // 3) Expand EPD/CCN details only when there is discount (button and breakdown row exist)
    if (expectedDiscountAmount > 0) {
      const expandButton = discountCell.getByRole('button').first();
      await expandButton.click();

      // 4) Verify expanded EPD/CCN panel
      const expandedRow = this.applicationsTable
        .locator('tbody tr')
        .filter({ hasText: /EPD Slab Applied|CCN \(Credit Note\) Generated|Early Payment Discount Applied/i })
        .first();
      await expect(expandedRow).toBeVisible({ timeout: 5000 });
      await expect(expandedRow).toContainText(String(expectedAppliedAmount));
      await expect(expandedRow).toContainText(String(expectedDiscountAmount));
    }
  }

  private applicationRow(invoiceNumber: string): Locator {
    return this.applicationsTable
      .locator('tbody tr')
      .filter({ hasText: invoiceNumber })
      .first();
  }

  private async ensureApplicationExpanded(invoiceNumber: string): Promise<Locator> {
    await expect(this.applicationsTable).toBeVisible({ timeout: 10000 });

    const row = this.applicationRow(invoiceNumber);
    await expect(row).toBeVisible({ timeout: 7000 });

    const discountCell = row.getByRole('cell').nth(CashReceiptDetailPage.APPLICATIONS_COL_CCN_DISCOUNT);
    const expandedRow = this.applicationsTable
      .locator('tbody tr')
      .filter({ hasText: /EPD Slab Applied|CCN \(Credit Note\) Generated|Early Payment Discount Applied/i })
      .first();

    if (!(await expandedRow.isVisible().catch(() => false))) {
      await discountCell.getByRole('button').first().click();
      await expect(expandedRow).toBeVisible({ timeout: 5000 });
    }

    return expandedRow;
  }

  async verifyCCNDetailsFromExpandedRow(invoiceNumber: string, expectedDiscountAmount: number): Promise<void> {
    const expandedRow = await this.ensureApplicationExpanded(invoiceNumber);

    // Link comes from: /finance/credit-memos/{id} with visible text = credit_memo_number (e.g. IACSP/CN/000133)
    const ccnLink = expandedRow.getByRole('link').filter({ hasText: /\/CN\/\d+/i }).first();
    await expect(ccnLink).toBeVisible({ timeout: 5000 });
    const ccnNumber = (await ccnLink.textContent())?.trim();
    if (!ccnNumber) throw new Error('Unable to read CCN number from CCN hyperlink text.');

    // CCN link may open in same tab or a popup/new tab depending on frontend behavior.
    const popupPromise = this.page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
    const sameTabPromise = this.page
      .waitForURL(/\/finance\/credit-memos\/[^/?#]+/i, {
        timeout: 10000,
        waitUntil: 'domcontentloaded',
      })
      .then(() => this.page)
      .catch(() => null);

    await ccnLink.click();

    const popup = await popupPromise;
    const ccnPage = popup ?? (await sameTabPromise);
    if (!ccnPage) {
      throw new Error('CCN link click did not navigate to credit memo page in same tab or popup.');
    }
    if (popup) {
      await popup.waitForLoadState('domcontentloaded');
      await popup.waitForURL(/\/finance\/credit-memos\/[^/?#]+/i, {
        timeout: 15000,
        waitUntil: 'domcontentloaded',
      });
    }

    // Credit memo detail page shows h1 = credit_memo_number and key cards/labels.
    await expect(ccnPage.getByRole('heading', { name: ccnNumber })).toBeVisible({ timeout: 10000 });
    await expect(ccnPage.getByText(/Credit Memo Information/i)).toBeVisible({ timeout: 10000 });
    // Scope CCN number check to the \"Credit Memo Number\" field container to avoid strict-mode conflicts
    const creditMemoNumberContainer = ccnPage
      .getByText(/Credit Memo Number/i)
      .locator('..')
      .locator('..');
    await expect(creditMemoNumberContainer.getByText(ccnNumber, { exact: false })).toBeVisible({
      timeout: 10000,
    });
    // Scope discount/credit amount to the Total Credit Amount card to avoid strict-mode violations
    const totalCreditCard = ccnPage
      .getByText(/Total Credit Amount/i)
      .locator('..')
      .locator('..');
    await expect(totalCreditCard).toBeVisible({ timeout: 10000 });
    await expect(totalCreditCard.getByText(new RegExp(String(expectedDiscountAmount), 'i'))).toBeVisible({
      timeout: 10000,
    });

    if (popup) {
      await popup.close();
      await expect(this.page).toHaveURL(/\/finance\/cash-receipts\/[a-f0-9-]+/i, { timeout: 10000 });
    } else {
      await this.page.goBack();
      await expect(this.page).toHaveURL(/\/finance\/cash-receipts\/[a-f0-9-]+/i, { timeout: 10000 });
    }
  }

  /** Returns true if the receipt detail page shows at least one Journal Entry (link or table). */
  async isJournalEntrySectionVisible(): Promise<boolean> {
    const viewJeLink = this.page.getByRole('link', { name: /View Journal Entry/i }).first();
    if (await viewJeLink.isVisible().catch(() => false)) return true;
    if (await this.journalEntriesTable.isVisible().catch(() => false)) {
      const linkCount = await this.journalEntriesTable.locator('tbody').getByRole('link').count();
      return linkCount > 0;
    }
    return false;
  }

  async verifyJournalEntryDetailsFromReceipt(): Promise<void> {
    // Receipt detail page has either a "View Journal Entry" link or a "Journal Entries" table with links.
    const viewJeLink = this.page.getByRole('link', { name: /View Journal Entry/i }).first();

    let jeLink: Locator;
    if (await viewJeLink.isVisible().catch(() => false)) {
      jeLink = viewJeLink;
    } else {
      await expect(this.journalEntriesTable).toBeVisible({ timeout: 10000 });
      jeLink = this.journalEntriesTable.locator('tbody').getByRole('link').first();
    }

    await expect(jeLink).toBeVisible({ timeout: 10000 });
    const jeNumber = (await jeLink.textContent())?.trim() || '';

    await Promise.all([
      this.page.waitForURL(/\/finance\/journal-entries\/[a-f0-9-]+/i, {
        timeout: 15000,
        waitUntil: 'domcontentloaded',
      }),
      jeLink.click(),
    ]);

    // Journal Entry detail page: "Journal Entry: {journal_number}" and a lines table with Debit/Credit headers.
    if (jeNumber) {
      await expect(this.page.getByText(new RegExp(`Journal Entry:\\s*${jeNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'))).toBeVisible({
        timeout: 10000,
      });
    } else {
      await expect(this.page.getByText(/Journal Entry:/i)).toBeVisible({ timeout: 10000 });
    }
    await expect(this.page.getByText(/Balance Status/i)).toBeVisible({ timeout: 10000 });
    await expect(this.page.getByRole('columnheader', { name: /Debit/i })).toBeVisible({ timeout: 10000 });
    await expect(this.page.getByRole('columnheader', { name: /Credit/i })).toBeVisible({ timeout: 10000 });

    await this.page.goBack();
    await expect(this.page).toHaveURL(/\/finance\/cash-receipts\/[a-f0-9-]+/i, { timeout: 10000 });
  }

  /** Click first Un-apply button (e.g. on application row). */
  async clickUnapply(): Promise<void> {
    await this.unapplyButton.first().click();
    await expect(this.unapplyDialog).toBeVisible({ timeout: 5000 });
  }

  /** Fill un-apply reason and confirm. Call after clickUnapply(). */
  async confirmUnapply(reason: string = 'E2E test un-apply'): Promise<void> {
    await this.unapplyReasonInput.fill(reason);
    await this.unapplyConfirmButton.click();
    await expect(this.unapplyDialog).toBeHidden({ timeout: 10000 });
  }

  /** Full un-apply flow: click Un-apply, fill reason, confirm. */
  async unapplyReceipt(reason: string = 'E2E test un-apply'): Promise<void> {
    await this.clickUnapply();
    await this.confirmUnapply(reason);
  }

  /** Reverse Cash Receipt dialog (header toolbar — not application row). */
  get reverseReceiptDialog(): Locator {
    return this.page.getByRole('dialog', { name: /Reverse Cash Receipt/i });
  }

  async openReverseCashReceiptDialog(): Promise<void> {
    const headerReverse = this.page
      .locator('div')
      .filter({ has: this.page.getByRole('link', { name: /Back/i }) })
      .getByRole('button', { name: 'Reverse', exact: true })
      .first();
    await expect(headerReverse).toBeVisible({ timeout: 15000 });
    await headerReverse.click();
    await expect(this.reverseReceiptDialog).toBeVisible({ timeout: 10000 });
  }

  async fillCashReceiptReversalReason(text: string): Promise<void> {
    await this.page.locator('#reversal_reason').fill(text);
  }

  async confirmReverseCashReceipt(options?: { expectDialogToClose?: boolean }): Promise<void> {
    await this.reverseReceiptDialog.getByRole('button', { name: /Reverse Receipt/i }).click();

    const expectToClose = options?.expectDialogToClose !== false;
    if (!expectToClose) return;

    await expect(this.reverseReceiptDialog).toBeHidden({ timeout: 60000 });
  }

  async reverseCashReceipt(reason: string): Promise<void> {
    await this.openReverseCashReceiptDialog();
    await this.fillCashReceiptReversalReason(reason);
    await this.confirmReverseCashReceipt();
  }
}
