import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';
import { selectOptionNameRegexForInvoiceNumber } from '../../support/finance-select-helpers';

/**
 * New Credit Memo form page object.
 *
 * Source: ../web_app/src/app/finance/credit-memos/new/page.tsx
 */
export class NewCreditMemoPage extends BasePage {
  readonly pageTitle: Locator;
  readonly customerTrigger: Locator;
  readonly reasonDescription: Locator;
  readonly originalInvoiceTrigger: Locator;
  readonly lineDescription: Locator;
  readonly lineAmount: Locator;
  readonly addLineItemButton: Locator;
  readonly createCreditMemoButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole('heading', { name: /New Credit Memo/i });
    this.customerTrigger = page.getByRole('button', { name: /Select customer/i });
    this.reasonDescription = page.locator('#reason_description');
    this.originalInvoiceTrigger = page.locator('#original_invoice_id');
    this.lineDescription = page.locator('#line_description');
    this.lineAmount = page.locator('#line_amount');
    this.addLineItemButton = page.getByRole('button', { name: /Add Line Item/i });
    this.createCreditMemoButton = page.getByRole('button', { name: /Create Credit Memo/i });
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/finance\/credit-memos\/new/, { timeout: 10000 });
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 });
  }

  async selectCustomer(customerName: string): Promise<void> {
    await this.customerTrigger.click();
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 10000 });
    const search = dialog.getByPlaceholder(/Search by name or dealer code/i);
    await search.fill(customerName);
    const row = dialog.locator('tr').filter({ hasText: new RegExp(customerName, 'i') }).first();
    await expect(row).toBeVisible({ timeout: 10000 });
    await row.getByRole('button', { name: /Select/i }).click();
    await expect(dialog).toBeHidden({ timeout: 10000 });
  }

  /**
   * Maps API reason_code values to visible Select option labels on the new credit memo form.
   */
  async selectCreditReason(reasonCode: string): Promise<void> {
    const optionByCode: Record<string, RegExp> = {
      transport_allowance: /Transport Allowance/i,
      rounding_discount: /Rounding Discount/i,
      product_return: /Product Return/i,
      pricing_error: /Pricing Error/i,
      quality_issue: /Quality Issue/i,
      promotional_discount: /Promotional Discount/i,
      settlement_discount: /Settlement Discount/i,
      other: /^Other$/i,
    };
    const pattern = optionByCode[reasonCode] || new RegExp(reasonCode.replace(/_/g, '\\s+'), 'i');
    await this.page.getByRole('combobox', { name: /Credit Reason/i }).click();
    await this.page.getByRole('option', { name: pattern }).click();
  }

  async setReasonDescription(text: string): Promise<void> {
    await this.fillInput(this.reasonDescription, text);
  }

  async selectOriginalInvoice(invoiceNumber: string): Promise<void> {
    await this.originalInvoiceTrigger.click();
    await this.page.getByRole('option', { name: selectOptionNameRegexForInvoiceNumber(invoiceNumber) }).click();
  }

  async addLineItem(description: string, amount: string): Promise<void> {
    await this.fillInput(this.lineDescription, description);
    await this.fillInput(this.lineAmount, amount);
    await this.addLineItemButton.click();
  }

  async submit(): Promise<void> {
    await this.createCreditMemoButton.click();
    await expect(this.page).toHaveURL(/\/finance\/credit-memos\/[a-f0-9-]+$/, { timeout: 30000 });
  }
}
