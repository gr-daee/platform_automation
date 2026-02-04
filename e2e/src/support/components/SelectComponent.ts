import { Page, expect } from '@playwright/test';

/**
 * SelectComponent - Wrapper for ShadCN/Radix Select interactions
 * 
 * ShadCN Select uses Radix UI primitives which require special interaction patterns.
 * Native Playwright methods like selectOption() don't work on these components.
 * 
 * Pattern: Click trigger (role="combobox") → Click option (role="option")
 * 
 * @example
 * const selectComponent = new SelectComponent(page);
 * await selectComponent.selectByLabel('Category', 'Electronics');
 */
export class SelectComponent {
  constructor(private readonly page: Page) {}

  /**
   * Select option by trigger label and option text
   * 
   * @param triggerLabel - Accessible name of the select trigger
   * @param optionValue - Text of the option to select
   * 
   * @example
   * await selectComponent.selectByLabel('Category', 'Electronics');
   * await selectComponent.selectByLabel('Status', 'Active');
   */
  async selectByLabel(triggerLabel: string, optionValue: string): Promise<void> {
    // Click the trigger to open dropdown
    await this.page.getByRole('combobox', { name: triggerLabel }).click();
    
    // Wait for listbox to appear
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    
    // Click the option
    await this.page.getByRole('option', { name: optionValue }).click();
    
    // Wait for listbox to disappear (dropdown closed)
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 2000 });
  }

  /**
   * Select option by data-testid attribute
   * 
   * @param testId - Test ID of the select trigger
   * @param optionValue - Text of the option to select
   * 
   * @example
   * await selectComponent.selectByTestId('category-select', 'Electronics');
   */
  async selectByTestId(testId: string, optionValue: string): Promise<void> {
    // Click the trigger
    await this.page.locator(`[data-testid="${testId}"]`).click();
    
    // Wait for listbox
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    
    // Select option
    await this.page.getByRole('option', { name: optionValue }).click();
    
    // Wait for dropdown to close
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 2000 });
  }

  /**
   * Select option by placeholder text
   * 
   * @param placeholder - Placeholder text of the select
   * @param optionValue - Text of the option to select
   * 
   * @example
   * await selectComponent.selectByPlaceholder('Select category...', 'Electronics');
   */
  async selectByPlaceholder(placeholder: string, optionValue: string): Promise<void> {
    // Find trigger by placeholder
    await this.page.getByPlaceholder(placeholder).click();
    
    // Wait for listbox
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    
    // Select option
    await this.page.getByRole('option', { name: optionValue }).click();
    
    // Wait for dropdown to close
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 2000 });
  }

  /**
   * Select option using exact match (case-sensitive)
   * 
   * @param triggerLabel - Accessible name of the select trigger
   * @param optionValue - Exact text of the option
   * 
   * @example
   * await selectComponent.selectExact('Status', 'In Progress');
   */
  async selectExact(triggerLabel: string, optionValue: string): Promise<void> {
    await this.page.getByRole('combobox', { name: triggerLabel }).click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    await this.page.getByRole('option', { name: optionValue, exact: true }).click();
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 2000 });
  }

  /**
   * Select option using regex pattern
   * 
   * @param triggerLabel - Accessible name of the select trigger
   * @param optionPattern - Regex pattern to match option text
   * 
   * @example
   * await selectComponent.selectByPattern('Category', /^Electronics/);
   */
  async selectByPattern(triggerLabel: string, optionPattern: RegExp): Promise<void> {
    await this.page.getByRole('combobox', { name: triggerLabel }).click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    await this.page.getByRole('option', { name: optionPattern }).click();
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 2000 });
  }

  /**
   * Select first option in dropdown
   * 
   * @param triggerLabel - Accessible name of the select trigger
   * 
   * @example
   * await selectComponent.selectFirst('Category');
   */
  async selectFirst(triggerLabel: string): Promise<void> {
    await this.page.getByRole('combobox', { name: triggerLabel }).click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    await this.page.getByRole('option').first().click();
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 2000 });
  }

  /**
   * Select nth option in dropdown (0-indexed)
   * 
   * @param triggerLabel - Accessible name of the select trigger
   * @param index - Index of option to select (0-based)
   * 
   * @example
   * await selectComponent.selectNth('Category', 2); // Select 3rd option
   */
  async selectNth(triggerLabel: string, index: number): Promise<void> {
    await this.page.getByRole('combobox', { name: triggerLabel }).click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    await this.page.getByRole('option').nth(index).click();
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 2000 });
  }

  /**
   * Verify selected value is displayed in trigger
   * 
   * @param triggerLabel - Accessible name of the select trigger
   * @param expectedValue - Expected displayed value
   * 
   * @example
   * await selectComponent.verifySelection('Category', 'Electronics');
   */
  async verifySelection(triggerLabel: string, expectedValue: string): Promise<void> {
    const trigger = this.page.getByRole('combobox', { name: triggerLabel });
    await expect(trigger).toContainText(expectedValue);
  }

  /**
   * Get currently selected value
   * 
   * @param triggerLabel - Accessible name of the select trigger
   * @returns Currently selected value text
   * 
   * @example
   * const selected = await selectComponent.getSelectedValue('Category');
   */
  async getSelectedValue(triggerLabel: string): Promise<string> {
    const trigger = this.page.getByRole('combobox', { name: triggerLabel });
    return (await trigger.textContent()) || '';
  }

  /**
   * Check if option exists in dropdown
   * 
   * @param triggerLabel - Accessible name of the select trigger
   * @param optionValue - Option text to check
   * @returns True if option exists
   * 
   * @example
   * const exists = await selectComponent.hasOption('Category', 'Electronics');
   */
  async hasOption(triggerLabel: string, optionValue: string): Promise<boolean> {
    await this.page.getByRole('combobox', { name: triggerLabel }).click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    
    const option = this.page.getByRole('option', { name: optionValue });
    const exists = await option.count() > 0;
    
    // Close dropdown
    await this.page.keyboard.press('Escape');
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 2000 });
    
    return exists;
  }

  /**
   * Get all available options in dropdown
   * 
   * @param triggerLabel - Accessible name of the select trigger
   * @returns Array of option texts
   * 
   * @example
   * const options = await selectComponent.getAllOptions('Category');
   * console.log(options); // ['Electronics', 'Furniture', 'Clothing']
   */
  async getAllOptions(triggerLabel: string): Promise<string[]> {
    await this.page.getByRole('combobox', { name: triggerLabel }).click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    
    const options = this.page.getByRole('option');
    const optionTexts = await options.allTextContents();
    
    // Close dropdown
    await this.page.keyboard.press('Escape');
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 2000 });
    
    return optionTexts;
  }

  /**
   * Get count of options in dropdown
   * 
   * @param triggerLabel - Accessible name of the select trigger
   * @returns Number of options
   * 
   * @example
   * const count = await selectComponent.getOptionCount('Category');
   */
  async getOptionCount(triggerLabel: string): Promise<number> {
    await this.page.getByRole('combobox', { name: triggerLabel }).click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    
    const count = await this.page.getByRole('option').count();
    
    // Close dropdown
    await this.page.keyboard.press('Escape');
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 2000 });
    
    return count;
  }

  /**
   * Clear selection (if clearable select)
   * 
   * @param triggerLabel - Accessible name of the select trigger
   * 
   * @example
   * await selectComponent.clearSelection('Category');
   */
  async clearSelection(triggerLabel: string): Promise<void> {
    const trigger = this.page.getByRole('combobox', { name: triggerLabel });
    
    // Look for clear button (usually an X icon)
    const clearButton = trigger.locator('button[aria-label="Clear"]').or(
      trigger.locator('[role="button"]').filter({ hasText: '×' })
    );
    
    if (await clearButton.isVisible()) {
      await clearButton.click();
    } else {
      console.warn('Clear button not found - select may not be clearable');
    }
  }

  /**
   * Verify dropdown is open
   * 
   * @example
   * await selectComponent.verifyDropdownOpen();
   */
  async verifyDropdownOpen(): Promise<void> {
    await expect(this.page.locator('[role="listbox"]')).toBeVisible();
  }

  /**
   * Verify dropdown is closed
   * 
   * @example
   * await selectComponent.verifyDropdownClosed();
   */
  async verifyDropdownClosed(): Promise<void> {
    await expect(this.page.locator('[role="listbox"]')).toBeHidden();
  }

  /**
   * Search in select dropdown (for searchable selects)
   * 
   * @param triggerLabel - Accessible name of the select trigger
   * @param searchText - Text to search
   * @param optionValue - Option to select from filtered results
   * 
   * @example
   * await selectComponent.searchAndSelect('Product', 'laptop', 'Gaming Laptop');
   */
  async searchAndSelect(
    triggerLabel: string, 
    searchText: string, 
    optionValue: string
  ): Promise<void> {
    // Open dropdown
    await this.page.getByRole('combobox', { name: triggerLabel }).click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    
    // Type search text (most searchable selects have an input that appears)
    const searchInput = this.page.locator('[role="combobox"] input');
    if (await searchInput.isVisible()) {
      await searchInput.fill(searchText);
      await this.page.waitForTimeout(300); // Wait for filter
    }
    
    // Select option from filtered results
    await this.page.getByRole('option', { name: optionValue }).click();
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 2000 });
  }
}
