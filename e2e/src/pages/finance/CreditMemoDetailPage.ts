import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';
import { selectOptionNameRegexForInvoiceNumber } from '../../support/finance-select-helpers';

/**
 * Credit Memo detail page object.
 *
 * Source: ../web_app/src/app/finance/credit-memos/[id]/page.tsx
 */
export class CreditMemoDetailPage extends BasePage {
  readonly applyToInvoiceButton: Locator;
  readonly postToGLButton: Locator;
  readonly invoiceTrigger: Locator;
  readonly applyAmountInput: Locator;
  readonly applyCreditButton: Locator;
  readonly headerReverseButton: Locator;

  constructor(page: Page) {
    super(page);
    this.applyToInvoiceButton = page.getByRole('button', { name: /Apply to Invoice/i });
    this.postToGLButton = page.getByRole('button', { name: /Post to GL/i });
    this.invoiceTrigger = page.locator('#invoice');
    this.applyAmountInput = page.locator('#amount');
    this.applyCreditButton = page.getByRole('button', { name: /^Apply Credit$/i });
    this.headerReverseButton = page
      .locator('div')
      .filter({ has: page.getByRole('link', { name: /Back/i }) })
      .getByRole('button', { name: /^Reverse$/i })
      .first();
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/finance\/credit-memos\/[a-f0-9-]+/, { timeout: 10000 });
    await expect(this.page.getByText(/Credit Memo Details/i)).toBeVisible({ timeout: 10000 });
  }

  async openApplyDialog(): Promise<void> {
    await expect(this.applyToInvoiceButton).toBeVisible({ timeout: 10000 });
    await this.applyToInvoiceButton.click();
    await expect(this.page.getByRole('dialog')).toBeVisible({ timeout: 10000 });
  }

  async selectInvoice(invoiceNumber: string): Promise<void> {
    await this.invoiceTrigger.click();
    await this.page.getByRole('option', { name: selectOptionNameRegexForInvoiceNumber(invoiceNumber) }).click();
  }

  async setApplyAmount(amount: string): Promise<void> {
    await this.fillInput(this.applyAmountInput, amount);
  }

  /**
   * Sets apply amount when the value may exceed the HTML max attribute (negative / overflow tests).
   */
  async setApplyAmountForNegativeTest(amount: string): Promise<void> {
    await this.applyAmountInput.evaluate((el) => {
      (el as HTMLInputElement).removeAttribute('max');
    });
    await this.fillInput(this.applyAmountInput, amount);
  }

  async submitApply(): Promise<void> {
    await this.applyCreditButton.click();
    await expect(this.page.getByRole('dialog')).toBeHidden({ timeout: 30000 });
  }

  async clickApplyCreditWithoutClosingDialog(): Promise<void> {
    await this.applyCreditButton.click();
  }

  async expectApplyDialogVisible(): Promise<void> {
    await expect(this.page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
  }

  async openInvoiceSelectorInApplyDialog(): Promise<void> {
    await this.invoiceTrigger.click();
  }

  async expectApplyCreditButtonDisabled(): Promise<void> {
    await expect(this.applyCreditButton).toBeDisabled();
  }

  async clickPostToGL(): Promise<void> {
    await expect(this.postToGLButton).toBeVisible({ timeout: 15000 });
    await this.postToGLButton.click();
  }

  async expectPostToGLSuccessToast(): Promise<void> {
    await expect(
      this.page.locator('[data-sonner-toast]').filter({ hasText: /posted to GL successfully/i }).first()
    ).toBeVisible({ timeout: 90000 });
  }

  async expectPostToGLButtonHidden(): Promise<void> {
    await expect(this.postToGLButton).toBeHidden({ timeout: 15000 });
  }

  /**
   * Application History: reverse the row matching the given invoice number.
   */
  async openReverseDialogForInvoiceApplication(invoiceNumber: string): Promise<void> {
    const row = this.page.locator('tbody tr').filter({ hasText: new RegExp(invoiceNumber, 'i') }).first();
    await row.scrollIntoViewIfNeeded();
    await row.getByRole('button', { name: /^Reverse$/i }).click();
    await expect(this.page.getByText(/Reverse Credit Memo Application/i)).toBeVisible({ timeout: 10000 });
  }

  reverseDialogRoot(): Locator {
    return this.page.getByRole('alertdialog').filter({ hasText: /Reverse Credit Memo Application/i });
  }

  async expectConfirmReversalDisabled(): Promise<void> {
    await expect(this.reverseDialogRoot().getByRole('button', { name: /Confirm Reversal/i })).toBeDisabled();
  }

  async expectConfirmReversalEnabled(): Promise<void> {
    await expect(this.reverseDialogRoot().getByRole('button', { name: /Confirm Reversal/i })).toBeEnabled();
  }

  async clearReverseApplicationReason(): Promise<void> {
    await this.page.locator('#reverse-reason').clear();
  }

  async cancelReverseApplicationDialog(): Promise<void> {
    await this.reverseDialogRoot().getByRole('button', { name: /^Cancel$/i }).click();
    await expect(this.page.getByText(/Reverse Credit Memo Application/i)).toBeHidden({ timeout: 10000 });
  }

  async fillReverseApplicationReason(text: string): Promise<void> {
    await this.page.locator('#reverse-reason').fill(text);
  }

  async confirmApplicationReversal(): Promise<void> {
    await this.page.getByRole('button', { name: /Confirm Reversal/i }).click();
    await expect(this.page.getByText(/Reverse Credit Memo Application/i)).toBeHidden({ timeout: 20000 });
  }

  async expectApplicationHistoryRowShowsReversed(invoiceNumber: string): Promise<void> {
    const row = this.page.locator('tbody tr').filter({ hasText: new RegExp(invoiceNumber, 'i') }).first();
    await expect(row.getByText('Reversed', { exact: true })).toBeVisible({ timeout: 15000 });
  }

  async expectApplicationHistoryRowHasNoReverseButton(invoiceNumber: string): Promise<void> {
    const row = this.page.locator('tbody tr').filter({ hasText: new RegExp(invoiceNumber, 'i') }).first();
    await expect(row.getByRole('button', { name: /^Reverse$/i })).toHaveCount(0);
  }

  async expectApplicationReversedSuccessToast(): Promise<void> {
    await expect(
      this.page.locator('[data-sonner-toast]').filter({ hasText: /Application reversed successfully/i }).first()
    ).toBeVisible({ timeout: 30000 });
  }

  async expectFullCreditMemoReverseActionVisible(): Promise<void> {
    await expect(this.headerReverseButton).toBeVisible({ timeout: 10000 });
  }
}
