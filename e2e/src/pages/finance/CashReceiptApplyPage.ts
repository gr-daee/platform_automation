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
    // Find the invoice number text (displayed in div with font-semibold text-lg)
    const invoiceNumberDiv = this.page
      .locator('div.font-semibold.text-lg')
      .filter({ hasText: new RegExp(invoiceNumber, 'i') })
      .first();
    
    await expect(invoiceNumberDiv).toBeVisible({ timeout: 10000 });
    
    // Navigate up to the parent row container (div with border-2 rounded-lg)
    const invoiceRow = invoiceNumberDiv.locator('..').locator('..').locator('..').filter({ hasText: invoiceNumber }).first();
    
    // Alternative: find row by looking for the container that has both the invoice number and a checkbox
    // The row structure: div (container) > div (grid) > div (checkbox container) > Checkbox
    const rowWithCheckbox = this.page
      .locator('div')
      .filter({ hasText: new RegExp(invoiceNumber, 'i') })
      .filter({ has: this.page.locator('[role="checkbox"]') })
      .first();
    
    await expect(rowWithCheckbox).toBeVisible({ timeout: 10000 });
    
    // Find checkbox within the row
    const checkbox = rowWithCheckbox.getByRole('checkbox').first();
    await expect(checkbox).toBeVisible({ timeout: 5000 });
    
    // Check if already selected, if not, click it
    const isChecked = await checkbox.isChecked().catch(() => false);
    if (!isChecked) {
      await checkbox.click();
      // Wait for selection state to update (UI might highlight the row)
      await this.page.waitForTimeout(500);
    }
  }

  async setAmountToApply(invoiceNumber: string, amount: number): Promise<void> {
    // Find the invoice row by invoice number (same as selectInvoice)
    const invoiceRow = this.page
      .locator('div')
      .filter({ hasText: new RegExp(invoiceNumber, 'i') })
      .filter({ has: this.page.locator('[role="checkbox"]') })
      .first();
    
    await expect(invoiceRow).toBeVisible({ timeout: 10000 });
    
    // Find the "Cash to Apply" input - it's the input[type="number"] within this row
    // There should be only one number input per invoice row
    const amountInput = invoiceRow.locator('input[type="number"]').first();
    
    await expect(amountInput).toBeVisible({ timeout: 5000 });
    
    // Ensure input is enabled (checkbox must be checked first)
    const isEnabled = await amountInput.isEnabled().catch(() => false);
    if (!isEnabled) {
      throw new Error(`Amount input is disabled. Invoice "${invoiceNumber}" must be selected first.`);
    }
    
    // Clear and fill the amount
    await amountInput.clear();
    await amountInput.fill(String(amount));
    await this.page.waitForTimeout(300); // Wait for onChange to process
  }

  async toggleEPDEnabled(invoiceNumber: string, enabled: boolean): Promise<void> {
    // Find the invoice row by invoice number
    const invoiceRow = this.page
      .locator('div')
      .filter({ hasText: new RegExp(invoiceNumber, 'i') })
      .filter({ has: this.page.locator('[role="checkbox"]') })
      .first();
    
    await expect(invoiceRow).toBeVisible({ timeout: 10000 });
    
    // Find EPD checkbox - it's in the collapsible EPD section
    // Look for checkbox with label containing "Early Payment Discount" or similar
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
    await this.applyPaymentsButton.click();
    await this.waitForToast(/applied successfully|Payments applied/i, 10000);
  }
}
