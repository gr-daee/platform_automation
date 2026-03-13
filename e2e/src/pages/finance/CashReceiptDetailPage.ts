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
  /** Amount summary card: "Balance (Unapplied)" */
  readonly balanceUnappliedLabel: Locator;
  /** Un-apply button on application row or page */
  readonly unapplyButton: Locator;
  /** Un-apply dialog */
  readonly unapplyDialog: Locator;
  readonly unapplyReasonInput: Locator;
  readonly unapplyConfirmButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('h2').filter({ hasText: /CR-|receipt/i }).first();
    this.applyToInvoicesButton = page.getByRole('button', { name: /Apply to Invoices/i });
    this.backButton = page.getByRole('link', { name: /Back/i }).or(page.getByRole('button', { name: /Back/i }));
    this.applicationsTable = page.locator('table').filter({ has: page.getByText('Invoice') });
    this.totalReceiptAmount = page.getByText('Total Receipt Amount').locator('..').locator('..').getByText(/₹|[\d,.]/).first();
    this.amountUnapplied = page.getByText('Balance (Unapplied)').locator('..').locator('..').getByText(/₹|[\d,.]/).first();
    this.amountAppliedLabel = page.getByText('Amount Applied', { exact: false }).first();
    this.amountAppliedValue = this.amountAppliedLabel.locator('..').locator('..').getByText(/₹|[\d,.]/).first();
    this.epdDiscountGivenLabel = page.getByText('EPD Discount Given', { exact: false }).first();
    this.epdDiscountGivenValue = this.epdDiscountGivenLabel.locator('..').locator('..').getByText(/₹|[\d,.]/).first();
    this.balanceUnappliedLabel = page.getByText('Balance (Unapplied)', { exact: false }).first();
    this.unapplyButton = page.getByRole('button', { name: /Un-apply/i });
    this.unapplyDialog = page.getByRole('dialog').filter({ hasText: /Un-apply Cash Receipt/i });
    this.unapplyReasonInput = page.getByLabel(/Un-apply Reason/i);
    this.unapplyConfirmButton = page.getByRole('button', { name: /Un-apply Payment/i });
  }

  async goto(receiptId: string): Promise<void> {
    await this.navigateTo(`/finance/cash-receipts/${receiptId}`);
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  }

  async verifyPageLoaded(receiptNumber?: string): Promise<void> {
    await expect(this.page).toHaveURL(/\/finance\/cash-receipts\/[a-f0-9-]+/, { timeout: 10000 });
    if (receiptNumber) {
      await expect(this.page.getByText(receiptNumber, { exact: false })).toBeVisible({ timeout: 10000 });
    }
  }

  async clickApplyToInvoices(): Promise<void> {
    await this.applyToInvoicesButton.click();
    await this.page.waitForURL(/\/apply/, { timeout: 5000 });
  }

  async verifyApplicationCreated(invoiceNumber: string): Promise<void> {
    await expect(this.applicationsTable.getByText(invoiceNumber, { exact: false })).toBeVisible({ timeout: 5000 });
  }

  async verifyEPDDiscount(amount: number): Promise<void> {
    const discountCell = this.applicationsTable.locator('td').filter({ hasText: new RegExp(String(amount), 'i') });
    await expect(discountCell.first()).toBeVisible({ timeout: 5000 });
  }

  /** Verify amount summary card shows Amount Applied and EPD Discount Given (labels or values visible). */
  async verifyAmountSummaryVisible(): Promise<void> {
    await expect(this.amountAppliedLabel).toBeVisible({ timeout: 5000 });
    await expect(this.balanceUnappliedLabel).toBeVisible({ timeout: 5000 });
  }

  /** Verify EPD discount is displayed (label or applications table discount column). */
  async verifyEPDDiscountDisplayed(): Promise<void> {
    const hasLabel = await this.epdDiscountGivenLabel.isVisible().catch(() => false);
    const hasDiscountInTable = await this.applicationsTable.getByText(/Discount|EPD/i).first().isVisible().catch(() => false);
    expect(hasLabel || hasDiscountInTable).toBe(true);
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
}
