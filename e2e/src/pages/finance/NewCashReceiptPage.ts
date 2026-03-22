import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';
import { SelectComponent } from '../../support/components/SelectComponent';

/**
 * New Cash Receipt Page Object
 *
 * Source: ../web_app/src/app/finance/cash-receipts/new/page.tsx
 * Purpose: Fill cash receipt form (customer, amount, bank account, etc.) and submit.
 */
export class NewCashReceiptPage extends BasePage {
  private selectComponent: SelectComponent;
  readonly pageTitle: Locator;
  readonly customerSelect: Locator;
  readonly receiptDateInput: Locator;
  readonly paymentMethodSelect: Locator;
  readonly totalAmountInput: Locator;
  readonly bankAccountSelect: Locator;
  readonly paymentReferenceInput: Locator;
  readonly depositDateInput: Locator;
  readonly notesTextarea: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.selectComponent = new SelectComponent(page);
    this.pageTitle = page.getByRole('heading', { name: /New Cash Receipt|Create Cash Receipt/i });
    // Customer: SearchableSelectDialog trigger is a Button with "Select customer..." when empty
    this.customerSelect = page.getByRole('button', { name: /Select customer/i });
    // Use unique IDs to avoid strict mode: getByLabel(/Date/i) matches both Receipt Date and Deposit Date
    this.receiptDateInput = page.locator('#receipt_date');
    // Payment Method: Try multiple locator strategies for robustness
    // First try getByLabel, then getByRole with name, then find combobox near Payment Method text
    this.paymentMethodSelect = page.getByLabel(/Payment Method/i)
      .or(page.getByRole('combobox', { name: /Payment Method/i }))
      .or(page.locator('label').filter({ hasText: /Payment Method/i }).locator('..').getByRole('combobox').first());
    this.totalAmountInput = page.locator('#total_receipt_amount');
    // Bank Account: SearchableSelectDialog trigger is a Button with "Select bank account..." when empty
    this.bankAccountSelect = page.getByRole('button', { name: /Select bank account/i });
    this.paymentReferenceInput = page.locator('#payment_reference');
    this.depositDateInput = page.locator('#deposit_date');
    this.notesTextarea = page.getByLabel(/Notes/i).or(page.locator('textarea'));
    this.saveButton = page.getByRole('button', { name: /Save|Create|Submit/i });
    this.cancelButton = page.getByRole('button', { name: /Cancel/i });
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/finance\/cash-receipts\/new/, { timeout: 10000 });
    await expect(this.pageTitle.or(this.page.getByText('New Cash Receipt'))).toBeVisible({ timeout: 10000 });
  }

  async selectCustomer(customerName: string): Promise<void> {
    // SearchableSelectDialog: trigger is a Button; clicking opens a dialog with title "Select Customer"
    console.log(`   🔍 Opening customer selection dialog...`);
    await expect(this.customerSelect).toBeVisible({ timeout: 10000 });
    await this.customerSelect.click();
    
    // Wait for "Select Customer" dialog to open
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByRole('heading', { name: /Select Customer/i })).toBeVisible({ timeout: 3000 });
    console.log(`   ✅ Dialog opened: "Select Customer"`);
    
    // Search input inside dialog (placeholder: "Search by name, code or GSTIN...")
    // The input is a controlled React component - we need to trigger onChange events properly
    const searchInput = dialog.getByPlaceholder(/Search by name, code or GSTIN/i);
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    console.log(`   🔍 Found search input, searching for customer: "${customerName}"`);
    
    // Focus the input first (important for React controlled components)
    await searchInput.focus();
    await this.page.waitForTimeout(100); // Small wait for focus
    
    // Clear any existing value
    await searchInput.clear();
    await this.page.waitForTimeout(100);
    
    // Type the customer name - type() triggers onChange events properly for React
    // Use delay to ensure each keystroke triggers onChange
    console.log(`   ⌨️  Typing customer name: "${customerName}"`);
    await searchInput.type(customerName, { delay: 80 });
    
    // Wait a bit for React to process the onChange and update filteredItems
    await this.page.waitForTimeout(300);
    
    // Verify the text was actually entered in the input
    const inputValue = await searchInput.inputValue();
    console.log(`   📝 Input value after typing: "${inputValue}"`);
    
    if (!inputValue || inputValue.trim() === '') {
      console.log(`   ⚠️  Input is empty, trying fill() as fallback...`);
      await searchInput.fill(customerName);
      await this.page.waitForTimeout(300);
      const retryValue = await searchInput.inputValue();
      console.log(`   📝 Input value after fill(): "${retryValue}"`);
    }
    
    // Wait for filter to apply - the table should update with filtered results
    const tableBody = dialog.locator('tbody');
    await expect(tableBody).toBeVisible({ timeout: 3000 });
    
    // Wait for React to process the onChange and update filteredItems
    // Check that the table has been filtered (either fewer rows or matching row appears)
    await this.page.waitForTimeout(400);
    
    // Get initial row count to verify filtering happened
    const allRows = tableBody.locator('tr');
    const rowCount = await allRows.count();
    console.log(`   📊 Table has ${rowCount} row(s) after search`);
    
    // Find the row containing customer name (search can match any part: name, code, or GSTIN)
    // Try multiple strategies: first word match, full name pattern, or dealer code
    const firstWord = customerName.split(' ')[0];
    let rowWithCustomer = tableBody.locator('tr').filter({ hasText: new RegExp(firstWord, 'i') }).first();
    
    // If no first word match, try full name pattern
    try {
      await expect(rowWithCustomer).toBeVisible({ timeout: 4000 });
      const rowText = await rowWithCustomer.textContent();
      console.log(`   ✅ Found matching row with "${firstWord}": "${rowText?.trim()}"`);
    } catch {
      console.log(`   ⚠️  First word "${firstWord}" match not found, trying full name pattern...`);
      rowWithCustomer = tableBody.locator('tr').filter({ hasText: new RegExp(customerName.replace(/\s+/g, '.*'), 'i') }).first();
      
      // If still no match, try dealer code pattern (e.g., "IACS5509")
      try {
        await expect(rowWithCustomer).toBeVisible({ timeout: 3000 });
        const rowText = await rowWithCustomer.textContent();
        console.log(`   ✅ Found matching row with full name pattern: "${rowText?.trim()}"`);
      } catch {
        const dealerCodeMatch = customerName.match(/IACS\d+/i);
        if (dealerCodeMatch) {
          console.log(`   🔍 Trying dealer code match: "${dealerCodeMatch[0]}"`);
          rowWithCustomer = tableBody.locator('tr').filter({ hasText: dealerCodeMatch[0] }).first();
          await expect(rowWithCustomer).toBeVisible({ timeout: 3000 });
          const rowText = await rowWithCustomer.textContent();
          console.log(`   ✅ Found matching row with dealer code: "${rowText?.trim()}"`);
        } else {
          // Last resort: if search didn't filter, try to find any row with customer name
          console.log(`   ⚠️  No filtered match found, checking all rows for customer name...`);
          const allRowTexts = await allRows.allTextContents();
          console.log(`   📋 All visible rows: ${allRowTexts.slice(0, 5).join(' | ')}...`);
          throw new Error(`Could not find customer "${customerName}" in search results. Input value: "${inputValue}"`);
        }
      }
    }
    
    // Verify row is visible (if not already verified above)
    try {
      await expect(rowWithCustomer).toBeVisible({ timeout: 2000 });
    } catch {
      // Row should already be visible from above, but verify anyway
      throw new Error(`Customer row not found after search. Searched for: "${customerName}", Input value: "${inputValue}"`);
    }
    
    // Click Select button in that row
    const selectButton = rowWithCustomer.getByRole('button', { name: /Select/i });
    await expect(selectButton).toBeVisible({ timeout: 3000 });
    console.log(`   ✅ Clicking Select button...`);
    await selectButton.click();
    
    // Wait for dialog to close
    await expect(dialog).toBeHidden({ timeout: 3000 });
    console.log(`   ✅ Dialog closed`);
    
    // Verify trigger button now shows selected customer (e.g. "IACS5509 - Ramesh ningappa diggai")
    await this.page.waitForTimeout(500);
    const selectedValue = await this.customerSelect.textContent({ timeout: 2000 }).catch(() => '');
    if (selectedValue && !selectedValue.includes('Select customer')) {
      console.log(`   ✅ Customer selected successfully: "${selectedValue}"`);
    } else {
      console.log(`   ⚠️  Customer selection verification: button shows "${selectedValue}"`);
    }
  }

  async setReceiptDate(date: string): Promise<void> {
    await this.receiptDateInput.fill(date);
  }

  async selectPaymentMethod(method: string): Promise<void> {
    // Prefer the explicit Payment Method locator defined in the constructor.
    // This keeps us anchored to the "Payment Method" label instead of relying
    // on combobox index ordering, which caused us to accidentally target the
    // "Reference No." dropdown.
    const paymentMethodCombobox = this.paymentMethodSelect;
    
    // Wait for element to be ready
    await expect(paymentMethodCombobox).toBeVisible({ timeout: 10000 });
    
    // Check if already selected (case-insensitive)
    try {
      const currentValue = await paymentMethodCombobox.textContent({ timeout: 2000 });
      if (currentValue && currentValue.toLowerCase().trim().includes(method.toLowerCase())) {
        console.log(`Payment Method "${method}" is already selected (current: "${currentValue}"), skipping...`);
        return;
      }
    } catch {
      // Ignore - element might not be ready yet, continue with selection
    }
    
    // Interact with combobox
    await paymentMethodCombobox.scrollIntoViewIfNeeded();
    await paymentMethodCombobox.click();
    
    // Wait for dropdown / popup to open. Different implementations may use
    // listbox, menu, or generic popover containers, so we look for the
    // container first and then search within it.
    const listContainer = this.page
      .locator('[role="listbox"], [role="menu"], [data-radix-select-viewport]')
      .first();
    await expect(listContainer).toBeVisible({ timeout: 5000 });
    
    // Select option using visible text inside the container instead of relying
    // solely on role="option" which may not be present for all UI libraries.
    const option = listContainer.getByText(new RegExp(method, 'i'), { exact: false }).first();
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();
    
    // Wait briefly for dropdown to close (container may be removed or hidden)
    await this.page.waitForTimeout(200);
  }

  async setTotalAmount(amount: number): Promise<void> {
    await this.totalAmountInput.fill(String(amount));
  }

  /**
   * Select bank account via SearchableSelectDialog (Button opens "Select Bank Account" dialog with table).
   * Pass accountName to search and select; or leave empty to select first available.
   */
  async selectBankAccount(accountName?: string): Promise<void> {
    await expect(this.bankAccountSelect).toBeVisible({ timeout: 10000 });
    await this.bankAccountSelect.click();
    
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByRole('heading', { name: /Select Bank Account/i })).toBeVisible({ timeout: 3000 });
    
    if (accountName) {
      const searchInput = dialog.getByPlaceholder(/Search by account|Search/i);
      await expect(searchInput).toBeVisible({ timeout: 3000 });
      await searchInput.fill(accountName);
      await this.page.waitForTimeout(400);
    }
    
    // Click first "Select" button in the table (first row)
    const selectButton = dialog.getByRole('button', { name: /Select/i }).first();
    await expect(selectButton).toBeVisible({ timeout: 5000 });
    await selectButton.click();
    
    await expect(dialog).toBeHidden({ timeout: 3000 });
  }

  async setPaymentReference(reference: string): Promise<void> {
    await this.paymentReferenceInput.fill(reference);
    // Verify reference was set
    const value = await this.paymentReferenceInput.inputValue();
    if (value === reference) {
      console.log(`   ✅ Payment reference set: "${reference}"`);
    }
  }

  async setDepositDate(date: string): Promise<void> {
    await this.depositDateInput.fill(date);
  }

  async setNotes(notes: string): Promise<void> {
    await this.notesTextarea.fill(notes);
  }

  async save(): Promise<void> {
    await this.saveButton.click();
    // App shows toast then immediately router.push() to detail; toast may unmount before we see it.
    // Treat navigation to detail page as success (reliable); optionally wait for toast briefly.
    await this.waitForSuccessToast(4000).catch(() => {});
    await expect(this.page).toHaveURL(/\/finance\/cash-receipts\/[a-f0-9-]+/, { timeout: 15000 });
  }

  async clickSave(): Promise<void> {
    await this.saveButton.click();
  }

  async fillMinimalForm(amount: number, customerName?: string): Promise<void> {
    // Fill minimal required fields
    const today = new Date().toISOString().split('T')[0];
    
    if (customerName) {
      await this.selectCustomer(customerName);
      // Wait for customer selection to complete and form to be ready
      await this.page.waitForTimeout(500);
    } else {
      // Select first available customer (SearchableSelectDialog pattern)
      await this.customerSelect.click();
      
      // Wait for dialog to open
      const dialog = this.page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 5000 });
      await expect(dialog.getByRole('heading', { name: /Select Customer/i })).toBeVisible({ timeout: 3000 });
      
      // Click first Select button in the table
      const firstSelectButton = dialog.getByRole('button', { name: /Select/i }).first();
      await expect(firstSelectButton).toBeVisible({ timeout: 5000 });
      await firstSelectButton.click();
      
      // Wait for dialog to close
      await expect(dialog).toBeHidden({ timeout: 3000 });
      await this.page.waitForTimeout(500); // Wait for selection to apply
    }
    
    await this.setReceiptDate(today);
    // Wait a bit before selecting payment method to ensure form is ready
    await this.page.waitForTimeout(300);
    await this.selectPaymentMethod('cheque');
    await this.setTotalAmount(amount);
    
    // Select first available bank account (SearchableSelectDialog)
    await this.selectBankAccount();
    
    await this.setDepositDate(today);
    await this.setPaymentReference(`AUTO_QA_${Date.now()}`);
  }
}
