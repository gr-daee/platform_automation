import { Page, expect } from '@playwright/test';

/**
 * PageLoadHelper - Comprehensive Page Load Verification
 * 
 * Addresses flakiness in complex applications with variable load times (1-15s).
 * Combines multiple wait strategies to ensure page is fully stable before actions.
 * 
 * Usage:
 * ```typescript
 * const pageLoadHelper = new PageLoadHelper(page);
 * await pageLoadHelper.waitForPageLoad({
 *   waitForNetworkIdle: true,
 *   waitForLoadingIndicators: true,
 *   waitForAnimations: 300,
 *   timeout: 15000
 * });
 * ```
 */

export interface PageLoadConfig {
  /**
   * Wait for network idle (no network connections for 500ms)
   * @default true
   */
  waitForNetworkIdle?: boolean;

  /**
   * Wait for loading indicators to disappear
   * @default true
   */
  waitForLoadingIndicators?: boolean;

  /**
   * Wait for specific API calls to complete (e.g., ['/api/orders', '/api/dealers'])
   * @default []
   */
  waitForApiCalls?: string[];

  /**
   * Wait for animations/transitions to complete (in ms)
   * ShadCN/Radix components often have 200ms animations
   * @default 0
   */
  waitForAnimations?: number;

  /**
   * Wait for specific element to be visible (stability check)
   * @example 'h1' (page title), '[data-testid="content"]'
   */
  waitForElement?: string;

  /**
   * Wait for element to be stable (not animating/moving)
   * @default false
   */
  waitForStability?: boolean;

  /**
   * Maximum time to wait for page load (in ms)
   * @default 15000
   */
  timeout?: number;

  /**
   * Verbose logging for debugging
   * @default false
   */
  verbose?: boolean;
}

export class PageLoadHelper {
  constructor(private readonly page: Page) {}

  /**
   * Comprehensive page load verification
   * 
   * Combines multiple strategies to ensure page is fully loaded and stable.
   * Recommended for all page navigations and actions that trigger page changes.
   * 
   * @param config - Page load configuration options
   * @throws Error if page fails to load within timeout
   * 
   * @example
   * // Basic usage (default options)
   * await pageLoadHelper.waitForPageLoad();
   * 
   * @example
   * // Custom configuration for complex page
   * await pageLoadHelper.waitForPageLoad({
   *   waitForNetworkIdle: true,
   *   waitForLoadingIndicators: true,
   *   waitForApiCalls: ['/api/orders', '/api/dealers'],
   *   waitForAnimations: 300,
   *   waitForElement: 'h1',
   *   waitForStability: true,
   *   timeout: 20000,
   *   verbose: true
   * });
   */
  async waitForPageLoad(config?: PageLoadConfig): Promise<void> {
    const {
      waitForNetworkIdle = true,
      waitForLoadingIndicators = true,
      waitForApiCalls = [],
      waitForAnimations = 0,
      waitForElement,
      waitForStability = false,
      timeout = 15000,
      verbose = false,
    } = config || {};

    const startTime = Date.now();
    const log = (message: string) => {
      if (verbose) {
        const elapsed = Date.now() - startTime;
        console.log(`[PageLoadHelper +${elapsed}ms] ${message}`);
      }
    };

    try {
      log('Starting comprehensive page load verification...');

      // 1. Wait for DOM content loaded
      log('Waiting for DOMContentLoaded...');
      await this.page.waitForLoadState('domcontentloaded', { timeout });
      log('✓ DOMContentLoaded');

      // 2. Wait for network idle (optional)
      if (waitForNetworkIdle) {
        log('Waiting for network idle...');
        await this.page.waitForLoadState('networkidle', { timeout });
        log('✓ Network idle');
      }

      // 3. Wait for loading indicators (optional)
      if (waitForLoadingIndicators) {
        log('Checking for loading indicators...');
        await this.waitForLoadingIndicators(timeout);
        log('✓ Loading indicators cleared');
      }

      // 4. Wait for specific API calls (optional)
      if (waitForApiCalls.length > 0) {
        log(`Waiting for API calls: ${waitForApiCalls.join(', ')}`);
        await this.waitForNetworkRequests(waitForApiCalls, timeout);
        log('✓ API calls completed');
      }

      // 5. Wait for animations/transitions (optional)
      if (waitForAnimations > 0) {
        log(`Waiting ${waitForAnimations}ms for animations...`);
        await this.page.waitForTimeout(waitForAnimations);
        log('✓ Animations completed');
      }

      // 6. Wait for specific element (optional)
      if (waitForElement) {
        log(`Waiting for element: ${waitForElement}`);
        await this.page.waitForSelector(waitForElement, { state: 'visible', timeout });
        log('✓ Element visible');
      }

      // 7. Wait for element stability (optional)
      if (waitForStability && waitForElement) {
        log(`Checking stability of element: ${waitForElement}`);
        await this.waitForElementStable(waitForElement, timeout);
        log('✓ Element stable');
      }

      const totalTime = Date.now() - startTime;
      log(`✅ Page load complete (${totalTime}ms)`);
    } catch (error) {
      const totalTime = Date.now() - startTime;
      throw new Error(
        `Page load failed after ${totalTime}ms: ${(error as Error).message}\n` +
        `URL: ${this.page.url()}`
      );
    }
  }

  /**
   * Wait for common loading indicators to disappear
   * 
   * Checks for:
   * - Generic spinners and loading overlays
   * - ShadCN/Radix loading states
   * - Custom loading indicators with data-loading attribute
   * 
   * @param timeout - Maximum wait time (ms)
   */
  private async waitForLoadingIndicators(timeout: number): Promise<void> {
    const loadingSelectors = [
      // Generic loading indicators
      '.loading-spinner',
      '.loader',
      '[data-loading="true"]',
      '[aria-busy="true"]',
      
      // ShadCN/Radix loading states
      '[data-state="loading"]',
      '[data-loading]',
      
      // Common UI library patterns
      '.spinner',
      '.loading',
      '.overlay',
    ];

    // Check each selector, wait for it to disappear if present
    for (const selector of loadingSelectors) {
      try {
        const element = this.page.locator(selector).first();
        const isVisible = await element.isVisible({ timeout: 500 });
        
        if (isVisible) {
          await element.waitFor({ state: 'hidden', timeout });
        }
      } catch {
        // Element not found or already hidden - continue
      }
    }
  }

  /**
   * Wait for specific network requests to complete
   * 
   * Useful for ensuring API calls finish before proceeding.
   * 
   * @param urlPatterns - Array of URL patterns to wait for (e.g., ['/api/orders', '/api/dealers'])
   * @param timeout - Maximum wait time (ms)
   * 
   * @example
   * await pageLoadHelper.waitForNetworkRequests(['/api/orders', '/api/dealers'], 10000);
   */
  async waitForNetworkRequests(urlPatterns: string[], timeout: number): Promise<void> {
    const startTime = Date.now();
    const pendingRequests = new Set<string>(urlPatterns);

    // Listen for responses matching our patterns
    const responseHandler = (response: any) => {
      const url = response.url();
      for (const pattern of urlPatterns) {
        if (url.includes(pattern)) {
          pendingRequests.delete(pattern);
        }
      }
    };

    this.page.on('response', responseHandler);

    try {
      // Wait until all patterns are matched or timeout
      while (pendingRequests.size > 0) {
        if (Date.now() - startTime > timeout) {
          throw new Error(
            `Timeout waiting for network requests: ${Array.from(pendingRequests).join(', ')}`
          );
        }
        await this.page.waitForTimeout(100);
      }
    } finally {
      this.page.off('response', responseHandler);
    }
  }

  /**
   * Wait for element to be stable (not moving/animating)
   * 
   * Checks element's bounding box position multiple times to ensure
   * it's not animating or being repositioned by layout shifts.
   * 
   * @param selector - Element selector
   * @param timeout - Maximum wait time (ms)
   * @param checkInterval - Interval between stability checks (ms)
   * @param requiredStableChecks - Number of consecutive stable checks required
   * 
   * @example
   * await pageLoadHelper.waitForElementStable('button[type="submit"]', 5000);
   */
  async waitForElementStable(
    selector: string,
    timeout: number = 5000,
    checkInterval: number = 100,
    requiredStableChecks: number = 3
  ): Promise<void> {
    const startTime = Date.now();
    const element = this.page.locator(selector).first();

    // Ensure element is visible first
    await element.waitFor({ state: 'visible', timeout });

    let previousBox: any = null;
    let stableCount = 0;

    while (Date.now() - startTime < timeout) {
      const currentBox = await element.boundingBox();

      if (!currentBox) {
        throw new Error(`Element '${selector}' has no bounding box (may be hidden)`);
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
      `Element '${selector}' did not stabilize within ${timeout}ms. ` +
      `It may be continuously animating or affected by layout shifts.`
    );
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
   * await pageLoadHelper.waitForUrl(/\/orders\/\d+/, 10000);
   */
  async waitForUrl(urlPattern: string | RegExp, timeout: number = 15000): Promise<void> {
    await this.page.waitForURL(urlPattern, { timeout });
  }

  /**
   * Wait for toast/notification to appear and disappear
   * 
   * Useful for waiting for success/error messages before proceeding.
   * 
   * @param messagePattern - Text pattern to match in toast (regex or string)
   * @param timeout - Maximum wait time (ms)
   * 
   * @example
   * await pageLoadHelper.waitForToast('Successfully created', 5000);
   */
  async waitForToast(messagePattern: string | RegExp, timeout: number = 5000): Promise<void> {
    const toastSelector = '[data-sonner-toast], [role="status"], [role="alert"]';
    
    // Wait for toast to appear
    await this.page.waitForSelector(toastSelector, { state: 'visible', timeout });

    // Verify message matches
    const toast = this.page.locator(toastSelector).first();
    if (typeof messagePattern === 'string') {
      await expect(toast).toContainText(messagePattern, { timeout });
    } else {
      const text = await toast.textContent();
      if (!text || !messagePattern.test(text)) {
        throw new Error(`Toast message did not match pattern: ${messagePattern}`);
      }
    }

    // Wait for toast to disappear (optional - toasts auto-dismiss)
    // Commenting out as toasts may stay visible during test
    // await this.page.waitForSelector(toastSelector, { state: 'hidden', timeout });
  }

  /**
   * Poll for condition until true or timeout
   * 
   * Generic polling utility for custom wait conditions.
   * 
   * @param condition - Async function that returns true when condition met
   * @param timeout - Maximum wait time (ms)
   * @param interval - Check interval (ms)
   * @param description - Condition description for error message
   * 
   * @example
   * await pageLoadHelper.pollUntil(
   *   async () => {
   *     const count = await page.locator('.item').count();
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
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return; // Condition met!
      }
      await this.page.waitForTimeout(interval);
    }

    throw new Error(`Timeout waiting for ${description} after ${timeout}ms`);
  }
}
