import { Page, Locator, expect } from '@playwright/test';

/**
 * DialogComponent - Wrapper for ShadCN/Radix Dialog interactions
 * 
 * ShadCN Dialog uses Radix UI primitives with 200ms fade-in/fade-out animations.
 * Always wait for dialog visibility before interacting with its contents.
 * 
 * @example
 * const dialogComponent = new DialogComponent(page);
 * await dialogComponent.waitForOpen();
 * await dialogComponent.fillField('Name', 'Product A');
 * await dialogComponent.clickButton('Save');
 * await dialogComponent.waitForClose();
 */
export class DialogComponent {
  constructor(private readonly page: Page) {}

  /**
   * Get dialog locator for scoped interactions
   * 
   * @returns Dialog locator
   * 
   * @example
   * const dialog = dialogComponent.getDialog();
   * await dialog.getByLabel('Name').fill('Value');
   */
  getDialog(): Locator {
    return this.page.getByRole('dialog');
  }

  /**
   * Wait for dialog to open (handles 200ms animation)
   * 
   * @param timeout - Timeout in milliseconds (default: 5000ms)
   * 
   * @example
   * await page.getByRole('button', { name: 'Add Product' }).click();
   * await dialogComponent.waitForOpen();
   */
  async waitForOpen(timeout: number = 5000): Promise<void> {
    await expect(this.getDialog()).toBeVisible({ timeout });
  }

  /**
   * Wait for dialog to close (handles 200ms animation)
   * 
   * @param timeout - Timeout in milliseconds (default: 5000ms)
   * 
   * @example
   * await dialogComponent.clickButton('Close');
   * await dialogComponent.waitForClose();
   */
  async waitForClose(timeout: number = 5000): Promise<void> {
    await expect(this.getDialog()).toBeHidden({ timeout });
  }

  /**
   * Fill input field within dialog
   * 
   * @param label - Field label text
   * @param value - Value to fill
   * 
   * @example
   * await dialogComponent.fillField('Product Name', 'Laptop');
   * await dialogComponent.fillField('Quantity', '10');
   */
  async fillField(label: string, value: string): Promise<void> {
    const dialog = this.getDialog();
    const input = dialog.getByLabel(label);
    await input.clear();
    await input.fill(value);
  }

  /**
   * Fill multiple fields within dialog
   * 
   * @param fields - Object with field labels as keys and values to fill
   * 
   * @example
   * await dialogComponent.fillFields({
   *   'Name': 'Product A',
   *   'Price': '29.99',
   *   'Quantity': '100'
   * });
   */
  async fillFields(fields: Record<string, string>): Promise<void> {
    for (const [label, value] of Object.entries(fields)) {
      await this.fillField(label, value);
    }
  }

  /**
   * Click button within dialog
   * 
   * @param buttonName - Button text or name
   * 
   * @example
   * await dialogComponent.clickButton('Save');
   * await dialogComponent.clickButton('Cancel');
   */
  async clickButton(buttonName: string): Promise<void> {
    const dialog = this.getDialog();
    await dialog.getByRole('button', { name: buttonName }).click();
  }

  /**
   * Click button and wait for dialog to close
   * 
   * @param buttonName - Button text or name
   * 
   * @example
   * await dialogComponent.clickButtonAndWaitClose('Save');
   */
  async clickButtonAndWaitClose(buttonName: string): Promise<void> {
    await this.clickButton(buttonName);
    await this.waitForClose();
  }

  /**
   * Close dialog using X button
   * 
   * @example
   * await dialogComponent.closeWithX();
   */
  async closeWithX(): Promise<void> {
    const dialog = this.getDialog();
    const closeButton = dialog.getByRole('button', { name: /close/i }).or(
      dialog.locator('button[aria-label="Close"]')
    );
    await closeButton.click();
    await this.waitForClose();
  }

  /**
   * Close dialog using Cancel button
   * 
   * @example
   * await dialogComponent.closeWithCancel();
   */
  async closeWithCancel(): Promise<void> {
    await this.clickButtonAndWaitClose('Cancel');
  }

  /**
   * Close dialog using Escape key
   * 
   * @example
   * await dialogComponent.closeWithEscape();
   */
  async closeWithEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.waitForClose();
  }

  /**
   * Close dialog using backdrop click
   * Note: This may not work if dialog has `modal={true}` prop
   * 
   * @example
   * await dialogComponent.closeWithBackdrop();
   */
  async closeWithBackdrop(): Promise<void> {
    // Click outside dialog (on backdrop)
    await this.page.locator('[data-radix-dialog-overlay]').click({ position: { x: 5, y: 5 } });
    await this.waitForClose();
  }

  /**
   * Verify dialog title
   * 
   * @param expectedTitle - Expected title text
   * 
   * @example
   * await dialogComponent.verifyTitle('Add Product');
   */
  async verifyTitle(expectedTitle: string): Promise<void> {
    const dialog = this.getDialog();
    const title = dialog.getByRole('heading').first();
    await expect(title).toContainText(expectedTitle);
  }

  /**
   * Verify dialog description
   * 
   * @param expectedDescription - Expected description text
   * 
   * @example
   * await dialogComponent.verifyDescription('Enter product details below');
   */
  async verifyDescription(expectedDescription: string): Promise<void> {
    const dialog = this.getDialog();
    await expect(dialog).toContainText(expectedDescription);
  }

  /**
   * Verify button is enabled in dialog
   * 
   * @param buttonName - Button text or name
   * 
   * @example
   * await dialogComponent.verifyButtonEnabled('Save');
   */
  async verifyButtonEnabled(buttonName: string): Promise<void> {
    const dialog = this.getDialog();
    const button = dialog.getByRole('button', { name: buttonName });
    await expect(button).toBeEnabled();
  }

  /**
   * Verify button is disabled in dialog
   * 
   * @param buttonName - Button text or name
   * 
   * @example
   * await dialogComponent.verifyButtonDisabled('Save');
   */
  async verifyButtonDisabled(buttonName: string): Promise<void> {
    const dialog = this.getDialog();
    const button = dialog.getByRole('button', { name: buttonName });
    await expect(button).toBeDisabled();
  }

  /**
   * Verify field value in dialog
   * 
   * @param label - Field label text
   * @param expectedValue - Expected field value
   * 
   * @example
   * await dialogComponent.verifyFieldValue('Name', 'Product A');
   */
  async verifyFieldValue(label: string, expectedValue: string): Promise<void> {
    const dialog = this.getDialog();
    const input = dialog.getByLabel(label);
    await expect(input).toHaveValue(expectedValue);
  }

  /**
   * Verify validation error in dialog
   * 
   * @param errorMessage - Expected error message
   * 
   * @example
   * await dialogComponent.verifyError('Name is required');
   */
  async verifyError(errorMessage: string): Promise<void> {
    const dialog = this.getDialog();
    const alert = dialog.getByRole('alert');
    await expect(alert).toContainText(errorMessage);
  }

  /**
   * Get field value from dialog
   * 
   * @param label - Field label text
   * @returns Field value
   * 
   * @example
   * const name = await dialogComponent.getFieldValue('Name');
   */
  async getFieldValue(label: string): Promise<string> {
    const dialog = this.getDialog();
    const input = dialog.getByLabel(label);
    return await input.inputValue();
  }

  /**
   * Check if button exists in dialog
   * 
   * @param buttonName - Button text or name
   * @returns True if button exists
   * 
   * @example
   * const hasSave = await dialogComponent.hasButton('Save');
   */
  async hasButton(buttonName: string): Promise<boolean> {
    const dialog = this.getDialog();
    const button = dialog.getByRole('button', { name: buttonName });
    return await button.count() > 0;
  }

  /**
   * Check if field exists in dialog
   * 
   * @param label - Field label text
   * @returns True if field exists
   * 
   * @example
   * const hasName = await dialogComponent.hasField('Name');
   */
  async hasField(label: string): Promise<boolean> {
    const dialog = this.getDialog();
    const input = dialog.getByLabel(label);
    return await input.count() > 0;
  }

  /**
   * Select option from dropdown within dialog
   * 
   * @param dropdownLabel - Dropdown label text
   * @param optionValue - Option to select
   * 
   * @example
   * await dialogComponent.selectOption('Category', 'Electronics');
   */
  async selectOption(dropdownLabel: string, optionValue: string): Promise<void> {
    const dialog = this.getDialog();
    
    // Click combobox trigger
    await dialog.getByRole('combobox', { name: dropdownLabel }).click();
    
    // Wait for options to appear
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    
    // Select option
    await this.page.getByRole('option', { name: optionValue }).click();
  }

  /**
   * Upload file in dialog
   * 
   * @param fileInputLabel - File input label text
   * @param filePath - Path to file
   * 
   * @example
   * await dialogComponent.uploadFile('Profile Picture', '/path/to/image.png');
   */
  async uploadFile(fileInputLabel: string, filePath: string): Promise<void> {
    const dialog = this.getDialog();
    const fileInput = dialog.getByLabel(fileInputLabel);
    await fileInput.setInputFiles(filePath);
  }

  /**
   * Check checkbox within dialog
   * 
   * @param checkboxLabel - Checkbox label text
   * 
   * @example
   * await dialogComponent.checkBox('I agree to terms');
   */
  async checkBox(checkboxLabel: string): Promise<void> {
    const dialog = this.getDialog();
    const checkbox = dialog.getByRole('checkbox', { name: checkboxLabel });
    
    if (!(await checkbox.isChecked())) {
      await checkbox.click();
    }
  }

  /**
   * Uncheck checkbox within dialog
   * 
   * @param checkboxLabel - Checkbox label text
   * 
   * @example
   * await dialogComponent.uncheckBox('Send notifications');
   */
  async uncheckBox(checkboxLabel: string): Promise<void> {
    const dialog = this.getDialog();
    const checkbox = dialog.getByRole('checkbox', { name: checkboxLabel });
    
    if (await checkbox.isChecked()) {
      await checkbox.click();
    }
  }

  /**
   * Verify checkbox is checked
   * 
   * @param checkboxLabel - Checkbox label text
   * 
   * @example
   * await dialogComponent.verifyChecked('I agree to terms');
   */
  async verifyChecked(checkboxLabel: string): Promise<void> {
    const dialog = this.getDialog();
    const checkbox = dialog.getByRole('checkbox', { name: checkboxLabel });
    await expect(checkbox).toBeChecked();
  }

  /**
   * Verify checkbox is unchecked
   * 
   * @param checkboxLabel - Checkbox label text
   * 
   * @example
   * await dialogComponent.verifyUnchecked('Send notifications');
   */
  async verifyUnchecked(checkboxLabel: string): Promise<void> {
    const dialog = this.getDialog();
    const checkbox = dialog.getByRole('checkbox', { name: checkboxLabel });
    await expect(checkbox).not.toBeChecked();
  }

  /**
   * Wait for dialog loading state to complete
   * Useful when dialog content loads asynchronously
   * 
   * @param timeout - Timeout in milliseconds (default: 10000ms)
   * 
   * @example
   * await dialogComponent.waitForLoaded();
   */
  async waitForLoaded(timeout: number = 10000): Promise<void> {
    const dialog = this.getDialog();
    
    // Wait for loading indicator to disappear
    const loadingIndicator = dialog.locator('[role="progressbar"]').or(
      dialog.locator('[aria-busy="true"]')
    );
    
    await expect(loadingIndicator).toBeHidden({ timeout });
  }

  /**
   * Get dialog size class (for responsive testing)
   * 
   * @returns Dialog size class (sm, md, lg, xl, etc.)
   * 
   * @example
   * const size = await dialogComponent.getSize();
   * console.log(size); // 'sm:max-w-[95vw] xl:max-w-6xl'
   */
  async getSize(): Promise<string> {
    const dialog = this.getDialog();
    const dialogContent = dialog.locator('[role="dialog"]').first();
    return await dialogContent.getAttribute('class') || '';
  }
}
