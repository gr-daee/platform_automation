import { Page, Locator, expect } from '@playwright/test';
import { PageLoadHelper } from '../helpers/PageLoadHelper';

/**
 * BasePage - Base class for all Page Object Models
 * 
 * Provides common utilities and patterns used across all pages:
 * - Navigation helpers
 * - Enhanced wait strategies (pollUntil, retryAction, waitForElementStable)
 * - Common assertions
 * - Toast/Dialog handling
 * - Form interactions
 * - Page load verification
 * 
 * Wait strategy: Prefer event-based waits (expect().toBeVisible(), waitForLoadState,
 * waitForResponse). Avoid page.waitForTimeout() — see automation-patterns "Replacing waitForTimeout".
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
  protected readonly pageLoadHelper: PageLoadHelper;

  constructor(protected readonly page: Page) {
    this.pageLoadHelper = new PageLoadHelper(page);
  }

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
   * Click element with retry (handles occasional click interception).
   * Prefer event-based waits over fixed delays; avoid page.waitForTimeout().
   */
  async clickWithRetry(locator: Locator, retries: number = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await locator.click({ timeout: 5000 });
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.page.waitForLoadState('domcontentloaded');
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

  // ==========================================
  // Enhanced Wait Methods (Flakiness Prevention)
  // ==========================================

  /**
   * Wait for page to be fully loaded and stable
   * 
   * Uses PageLoadHelper for comprehensive page load verification.
   * Recommended after navigation, page changes, or before critical actions.
   * 
   * @param config - Page load configuration (see PageLoadHelper)
   * 
   * @example
   * // Basic usage (default options)
   * await this.waitForPageStable();
   * 
   * @example
   * // Custom configuration
   * await this.waitForPageStable({
   *   waitForNetworkIdle: true,
   *   waitForLoadingIndicators: true,
   *   waitForAnimations: 300,
   *   timeout: 15000
   * });
   */
  async waitForPageStable(config?: any): Promise<void> {
    await this.pageLoadHelper.waitForPageLoad(config);
  }

  /**
   * Poll until condition is met or timeout
   * 
   * Useful for waiting for data to appear, counts to update, etc.
   * 
   * @param condition - Async function that returns true when condition met
   * @param timeout - Maximum wait time (ms)
   * @param interval - Check interval (ms)
   * @param description - Condition description for error message
   * 
   * @example
   * await this.pollUntil(
   *   async () => {
   *     const count = await this.page.locator('.item').count();
   *     return count > 0;
   *   },
   *   10000,
   *   500,
   *   'items to appear'
   * );
   */
  async pollUntil(
    condition: () => Promise<boolean>,
    timeout: number = 10000,
    interval: number = 500,
    description: string = 'condition'
  ): Promise<void> {
    await this.pageLoadHelper.pollUntil(condition, timeout, interval, description);
  }

  /**
   * Retry an action with exponential backoff
   * 
   * Useful for flaky operations (network requests, dynamic content).
   * 
   * @param action - Async action to retry
   * @param maxAttempts - Maximum number of attempts (default: 3)
   * @param initialDelay - Initial delay between retries in ms (default: 1000)
   * @param backoffMultiplier - Delay multiplier for exponential backoff (default: 2)
   * @param description - Action description for error message
   * 
   * @example
   * await this.retryAction(
   *   async () => {
   *     await this.page.getByRole('button', { name: 'Submit' }).click();
   *     await this.waitForToast('Success');
   *   },
   *   3,
   *   1000,
   *   2,
   *   'submit form'
   * );
   */
  async retryAction<T>(
    action: () => Promise<T>,
    maxAttempts: number = 3,
    initialDelay: number = 1000,
    backoffMultiplier: number = 2,
    description: string = 'action'
  ): Promise<T> {
    let lastError: Error | null = null;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await action();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          break; // Don't wait after last attempt
        }

        console.log(`⚠️ ${description} failed (attempt ${attempt}/${maxAttempts}), retrying in ${delay}ms...`);
        await this.page.waitForTimeout(delay);
        delay *= backoffMultiplier;
      }
    }

    throw new Error(
      `${description} failed after ${maxAttempts} attempts.\n` +
      `Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Wait for element to be stable (not moving/animating)
   * 
   * Checks element's bounding box position multiple times to ensure
   * it's not animating or being repositioned by layout shifts.
   * 
   * @param locator - Element locator
   * @param timeout - Maximum wait time (ms)
   * @param checkInterval - Interval between stability checks (ms)
   * @param requiredStableChecks - Number of consecutive stable checks required
   * 
   * @example
   * await this.waitForElementStable(
   *   this.page.getByRole('button', { name: 'Submit' }),
   *   5000
   * );
   */
  async waitForElementStable(
    locator: Locator,
    timeout: number = 5000,
    checkInterval: number = 100,
    requiredStableChecks: number = 3
  ): Promise<void> {
    const startTime = Date.now();

    // Ensure element is visible first
    await locator.waitFor({ state: 'visible', timeout });

    let previousBox: any = null;
    let stableCount = 0;

    while (Date.now() - startTime < timeout) {
      const currentBox = await locator.boundingBox();

      if (!currentBox) {
        throw new Error('Element has no bounding box (may be hidden)');
      }

      if (previousBox) {
        // Check if position is stable (within 1px tolerance for sub-pixel rendering)
        const isStable =
          Math.abs(currentBox.x - previousBox.x) < 1 &&
          Math.abs(currentBox.y - previousBox.y) < 1 &&
          Math.abs(currentBox.width - previousBox.width) < 1 &&
          Math.abs(currentBox.height - previousBox.height) < 1;

        if (isStable) {
          stableCount++;
          if (stableCount >= requiredStableChecks) {
            return; // Element is stable!
          }
        } else {
          stableCount = 0; // Reset if position changed
        }
      }

      previousBox = currentBox;
      await this.page.waitForTimeout(checkInterval);
    }

    throw new Error(
      `Element did not stabilize within ${timeout}ms. ` +
      `It may be continuously animating or affected by layout shifts.`
    );
  }

  /**
   * Wait for specific network request(s) to complete
   * 
   * Useful for ensuring API calls finish before proceeding.
   * 
   * @param urlPatterns - Array of URL patterns to wait for (e.g., ['/api/orders', '/api/dealers'])
   * @param timeout - Maximum wait time (ms)
   * 
   * @example
   * await this.waitForNetworkRequests(['/api/orders', '/api/dealers'], 10000);
   */
  async waitForNetworkRequests(urlPatterns: string[], timeout: number = 10000): Promise<void> {
    await this.pageLoadHelper.waitForNetworkRequests(urlPatterns, timeout);
  }

  /**
   * Wait for page URL to match expected pattern
   * 
   * Useful after navigation actions to ensure redirect completed.
   * 
   * @param urlPattern - URL pattern (regex or string)
   * @param timeout - Maximum wait time (ms)
   * 
   * @example
   * await this.waitForUrl(/\/orders\/\d+/, 10000);
   */
  async waitForUrl(urlPattern: string | RegExp, timeout: number = 15000): Promise<void> {
    await this.pageLoadHelper.waitForUrl(urlPattern, timeout);
  }
}
