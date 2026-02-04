import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage - Base class for all Page Object Models
 * 
 * Provides common utilities and patterns used across all pages:
 * - Navigation helpers
 * - Wait strategies
 * - Common assertions
 * - Toast/Dialog handling
 * - Form interactions
 * 
 * All Page Objects MUST inherit from this class.
 * 
 * @example
 * export class OrdersPage extends BasePage {
 *   constructor(page: Page) {
 *     super(page);
 *   }
 * }
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  // ==========================================
  // Navigation Methods
  // ==========================================

  /**
   * Navigate to a specific URL path
   * Waits for network idle after navigation
   * 
   * @param path - URL path (e.g., '/orders', '/o2c/indents')
   * 
   * @example
   * await this.navigateTo('/orders');
   */
  async navigateTo(path: string): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate back in browser history
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Reload the current page
   */
  async reload(): Promise<void> {
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
  }

  // ==========================================
  // Toast Notification Methods
  // ==========================================

  /**
   * Wait for success toast message to appear
   * 
   * @param message - Optional specific message to match (uses regex if not exact)
   * @param timeout - Timeout in milliseconds (default: 5000ms)
   * 
   * @example
   * await this.waitForToast('Order created successfully');
   * await this.waitForToast(); // Any success message
   */
  async waitForToast(message?: string, timeout: number = 5000): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]');
    
    if (message) {
      await expect(toast).toContainText(message, { timeout });
    } else {
      await expect(toast).toBeVisible({ timeout });
    }
  }

  /**
   * Wait for success toast with common success patterns
   */
  async waitForSuccessToast(timeout: number = 5000): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]');
    await expect(toast).toContainText(/success|saved|created|updated|deleted/i, { timeout });
  }

  /**
   * Wait for error toast with specific or pattern message
   */
  async waitForErrorToast(message?: string, timeout: number = 5000): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]');
    
    if (message) {
      await expect(toast).toContainText(message, { timeout });
    } else {
      await expect(toast).toContainText(/error|failed|invalid/i, { timeout });
    }
  }

  /**
   * Verify toast appeared and dismiss it
   */
  async verifyAndDismissToast(message: string): Promise<void> {
    await this.waitForToast(message);
    
    // Click dismiss button if present
    const dismissButton = this.page.locator('[data-sonner-toast] button[aria-label="Close"]');
    if (await dismissButton.isVisible()) {
      await dismissButton.click();
    }
    
    // Wait for toast to disappear
    await expect(this.page.locator('[data-sonner-toast]')).toBeHidden();
  }

  // ==========================================
  // Dialog/Modal Methods
  // ==========================================

  /**
   * Wait for dialog to open (handles 200ms animation)
   * 
   * @param timeout - Timeout in milliseconds (default: 5000ms)
   * 
   * @example
   * await this.page.getByRole('button', { name: 'Add Product' }).click();
   * await this.waitForDialogOpen();
   */
  async waitForDialogOpen(timeout: number = 5000): Promise<void> {
    await expect(this.page.getByRole('dialog')).toBeVisible({ timeout });
  }

  /**
   * Wait for dialog to close (handles 200ms animation)
   */
  async waitForDialogClose(timeout: number = 5000): Promise<void> {
    await expect(this.page.getByRole('dialog')).toBeHidden({ timeout });
  }

  /**
   * Get dialog locator for scoped interactions
   * 
   * @example
   * const dialog = await this.getDialog();
   * await dialog.getByLabel('Name').fill('Product A');
   */
  getDialog(): Locator {
    return this.page.getByRole('dialog');
  }

  /**
   * Close dialog by clicking backdrop, X button, or Cancel button
   */
  async closeDialog(): Promise<void> {
    const dialog = this.getDialog();
    
    // Try Close/X button first
    const closeButton = dialog.getByRole('button', { name: /close|cancel/i });
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      // Click backdrop (outside dialog)
      await this.page.keyboard.press('Escape');
    }
    
    await this.waitForDialogClose();
  }

  // ==========================================
  // Form Interaction Methods
  // ==========================================

  /**
   * Fill input field (clears first, then fills)
   * 
   * @param locator - Input field locator
   * @param value - Value to fill
   * 
   * @example
   * await this.fillInput(this.nameInput, 'Product Name');
   */
  async fillInput(locator: Locator, value: string): Promise<void> {
    await locator.clear();
    await locator.fill(value);
  }

  /**
   * Fill multiple form fields at once
   * 
   * @param fields - Object with field labels as keys and values to fill
   * 
   * @example
   * await this.fillForm({
   *   'Name': 'Product A',
   *   'Quantity': '100',
   *   'Price': '29.99'
   * });
   */
  async fillForm(fields: Record<string, string>): Promise<void> {
    for (const [label, value] of Object.entries(fields)) {
      const input = this.page.getByLabel(label);
      await this.fillInput(input, value);
    }
  }

  /**
   * Submit form by clicking submit button
   * Waits for button with common submit text patterns
   */
  async submitForm(): Promise<void> {
    const submitButton = this.page.getByRole('button', { 
      name: /submit|save|create|update|confirm/i 
    });
    await submitButton.click();
  }

  /**
   * Verify form validation error appears
   * 
   * @param errorMessage - Expected error message
   * 
   * @example
   * await this.verifyValidationError('Email is required');
   */
  async verifyValidationError(errorMessage: string): Promise<void> {
    const alert = this.page.getByRole('alert');
    await expect(alert).toContainText(errorMessage);
  }

  // ==========================================
  // Wait Strategies
  // ==========================================

  /**
   * Wait for page to finish loading (networkidle state)
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for specific selector to appear
   */
  async waitForSelector(selector: string, timeout: number = 10000): Promise<void> {
    await this.page.waitForSelector(selector, { timeout });
  }

  /**
   * Wait for API response
   * 
   * @param urlPattern - URL pattern to match (string or regex)
   * @param status - Expected status code (default: 200)
   * 
   * @example
   * await this.waitForApiResponse('/api/orders', 200);
   * await this.waitForApiResponse(/\/api\/orders\/\d+/);
   */
  async waitForApiResponse(
    urlPattern: string | RegExp, 
    status: number = 200
  ): Promise<void> {
    await this.page.waitForResponse(
      response => 
        (typeof urlPattern === 'string' 
          ? response.url().includes(urlPattern)
          : urlPattern.test(response.url())
        ) && response.status() === status
    );
  }

  /**
   * Wait for element to be visible
   */
  async waitForVisible(locator: Locator, timeout: number = 10000): Promise<void> {
    await expect(locator).toBeVisible({ timeout });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForHidden(locator: Locator, timeout: number = 10000): Promise<void> {
    await expect(locator).toBeHidden({ timeout });
  }

  // ==========================================
  // Common Assertions
  // ==========================================

  /**
   * Verify current URL matches pattern
   * 
   * @param pattern - URL pattern (string or regex)
   * 
   * @example
   * await this.verifyUrl(/\/orders\/\d+/);
   * await this.verifyUrl('/orders/list');
   */
  async verifyUrl(pattern: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(pattern);
  }

  /**
   * Verify page title
   */
  async verifyTitle(title: string | RegExp): Promise<void> {
    await expect(this.page).toHaveTitle(title);
  }

  /**
   * Verify element is visible
   */
  async verifyVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  /**
   * Verify element is hidden
   */
  async verifyHidden(locator: Locator): Promise<void> {
    await expect(locator).toBeHidden();
  }

  /**
   * Verify element contains text
   */
  async verifyText(locator: Locator, text: string | RegExp): Promise<void> {
    await expect(locator).toContainText(text);
  }

  /**
   * Verify element has exact text
   */
  async verifyExactText(locator: Locator, text: string): Promise<void> {
    await expect(locator).toHaveText(text);
  }

  /**
   * Verify button is enabled
   */
  async verifyEnabled(locator: Locator): Promise<void> {
    await expect(locator).toBeEnabled();
  }

  /**
   * Verify button is disabled
   */
  async verifyDisabled(locator: Locator): Promise<void> {
    await expect(locator).toBeDisabled();
  }

  // ==========================================
  // Utility Methods
  // ==========================================

  /**
   * Take screenshot with custom name
   * 
   * @param name - Screenshot filename (without extension)
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `test-results/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Get element count
   */
  async getCount(locator: Locator): Promise<number> {
    return await locator.count();
  }

  /**
   * Check if element is visible (returns boolean, doesn't throw)
   */
  async isVisible(locator: Locator): Promise<boolean> {
    try {
      await expect(locator).toBeVisible({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get text content from element
   */
  async getText(locator: Locator): Promise<string> {
    return (await locator.textContent()) || '';
  }

  /**
   * Get input value
   */
  async getValue(locator: Locator): Promise<string> {
    return (await locator.inputValue()) || '';
  }

  /**
   * Click element with retry (handles occasional click interception)
   */
  async clickWithRetry(locator: Locator, retries: number = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await locator.click({ timeout: 5000 });
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.page.waitForTimeout(500);
      }
    }
  }

  /**
   * Hover over element
   */
  async hover(locator: Locator): Promise<void> {
    await locator.hover();
  }

  /**
   * Double click element
   */
  async doubleClick(locator: Locator): Promise<void> {
    await locator.dblclick();
  }

  /**
   * Right click element
   */
  async rightClick(locator: Locator): Promise<void> {
    await locator.click({ button: 'right' });
  }

  // ==========================================
  // Keyboard Interactions
  // ==========================================

  /**
   * Press keyboard key
   */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Type text with keyboard (simulates real typing)
   */
  async typeText(text: string, delay: number = 100): Promise<void> {
    await this.page.keyboard.type(text, { delay });
  }

  // ==========================================
  // File Upload
  // ==========================================

  /**
   * Upload file to input[type="file"]
   * 
   * @param inputLocator - File input locator
   * @param filePath - Absolute path to file
   * 
   * @example
   * await this.uploadFile(
   *   this.page.locator('input[type="file"]'),
   *   '/path/to/file.pdf'
   * );
   */
  async uploadFile(inputLocator: Locator, filePath: string): Promise<void> {
    await inputLocator.setInputFiles(filePath);
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(inputLocator: Locator, filePaths: string[]): Promise<void> {
    await inputLocator.setInputFiles(filePaths);
  }
}
