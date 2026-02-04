import { Page, expect } from '@playwright/test';

/**
 * ToastComponent - Wrapper for Sonner Toast notifications
 * 
 * DAEE platform uses Sonner for toast notifications.
 * Toasts appear with `data-sonner-toast` attribute and auto-dismiss after ~3000ms.
 * 
 * @example
 * const toastComponent = new ToastComponent(page);
 * await toastComponent.waitForSuccess('Order created successfully');
 */
export class ToastComponent {
  constructor(private readonly page: Page) {}

  /**
   * Wait for any toast to appear
   * 
   * @param timeout - Timeout in milliseconds (default: 5000ms)
   * 
   * @example
   * await toastComponent.waitForToast();
   */
  async waitForToast(timeout: number = 5000): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]');
    await expect(toast).toBeVisible({ timeout });
  }

  /**
   * Wait for toast with specific message
   * 
   * @param message - Expected toast message (partial match)
   * @param timeout - Timeout in milliseconds (default: 5000ms)
   * 
   * @example
   * await toastComponent.waitForMessage('Order created successfully');
   */
  async waitForMessage(message: string, timeout: number = 5000): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]');
    await expect(toast).toContainText(message, { timeout });
  }

  /**
   * Wait for toast with exact message
   * 
   * @param message - Exact toast message
   * @param timeout - Timeout in milliseconds (default: 5000ms)
   * 
   * @example
   * await toastComponent.waitForExactMessage('Saved successfully');
   */
  async waitForExactMessage(message: string, timeout: number = 5000): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]');
    await expect(toast).toHaveText(message, { timeout });
  }

  /**
   * Wait for success toast (matches common success patterns)
   * 
   * @param message - Optional specific success message
   * @param timeout - Timeout in milliseconds (default: 5000ms)
   * 
   * @example
   * await toastComponent.waitForSuccess('Created successfully');
   * await toastComponent.waitForSuccess(); // Any success message
   */
  async waitForSuccess(message?: string, timeout: number = 5000): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]');
    
    if (message) {
      await expect(toast).toContainText(message, { timeout });
    } else {
      await expect(toast).toContainText(/success|saved|created|updated|deleted|completed/i, { timeout });
    }
  }

  /**
   * Wait for error toast (matches common error patterns)
   * 
   * @param message - Optional specific error message
   * @param timeout - Timeout in milliseconds (default: 5000ms)
   * 
   * @example
   * await toastComponent.waitForError('Failed to create order');
   * await toastComponent.waitForError(); // Any error message
   */
  async waitForError(message?: string, timeout: number = 5000): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]');
    
    if (message) {
      await expect(toast).toContainText(message, { timeout });
    } else {
      await expect(toast).toContainText(/error|failed|invalid|unable|cannot/i, { timeout });
    }
  }

  /**
   * Wait for warning toast
   * 
   * @param message - Optional specific warning message
   * @param timeout - Timeout in milliseconds (default: 5000ms)
   * 
   * @example
   * await toastComponent.waitForWarning('Changes not saved');
   */
  async waitForWarning(message?: string, timeout: number = 5000): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]');
    
    if (message) {
      await expect(toast).toContainText(message, { timeout });
    } else {
      await expect(toast).toContainText(/warning|caution|note/i, { timeout });
    }
  }

  /**
   * Wait for info toast
   * 
   * @param message - Optional specific info message
   * @param timeout - Timeout in milliseconds (default: 5000ms)
   * 
   * @example
   * await toastComponent.waitForInfo('Processing in background');
   */
  async waitForInfo(message?: string, timeout: number = 5000): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]');
    
    if (message) {
      await expect(toast).toContainText(message, { timeout });
    } else {
      await expect(toast).toBeVisible({ timeout });
    }
  }

  /**
   * Verify toast appeared and dismiss it manually
   * 
   * @param message - Expected toast message
   * @param timeout - Timeout in milliseconds (default: 5000ms)
   * 
   * @example
   * await toastComponent.verifyAndDismiss('Saved successfully');
   */
  async verifyAndDismiss(message: string, timeout: number = 5000): Promise<void> {
    await this.waitForMessage(message, timeout);
    await this.dismiss();
  }

  /**
   * Dismiss toast by clicking close button
   * 
   * @example
   * await toastComponent.dismiss();
   */
  async dismiss(): Promise<void> {
    const closeButton = this.page.locator('[data-sonner-toast] button[aria-label="Close"]').or(
      this.page.locator('[data-sonner-toast] button').filter({ hasText: '×' })
    );
    
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
    
    // Wait for toast to disappear
    await this.waitForToastDisappear();
  }

  /**
   * Wait for toast to auto-dismiss
   * Default toast duration is ~3000ms
   * 
   * @param timeout - Timeout in milliseconds (default: 5000ms)
   * 
   * @example
   * await toastComponent.waitForSuccess('Saved');
   * await toastComponent.waitForToastDisappear();
   */
  async waitForToastDisappear(timeout: number = 5000): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]');
    await expect(toast).toBeHidden({ timeout });
  }

  /**
   * Get toast message text
   * 
   * @returns Toast message text
   * 
   * @example
   * const message = await toastComponent.getMessage();
   * console.log(message); // 'Order created successfully'
   */
  async getMessage(): Promise<string> {
    const toast = this.page.locator('[data-sonner-toast]');
    return (await toast.textContent()) || '';
  }

  /**
   * Get all visible toast messages
   * Useful when multiple toasts are displayed
   * 
   * @returns Array of toast message texts
   * 
   * @example
   * const messages = await toastComponent.getAllMessages();
   * console.log(messages); // ['Processing...', 'Complete!']
   */
  async getAllMessages(): Promise<string[]> {
    const toasts = this.page.locator('[data-sonner-toast]');
    return await toasts.allTextContents();
  }

  /**
   * Get count of visible toasts
   * 
   * @returns Number of visible toasts
   * 
   * @example
   * const count = await toastComponent.getCount();
   */
  async getCount(): Promise<number> {
    const toasts = this.page.locator('[data-sonner-toast]');
    return await toasts.count();
  }

  /**
   * Verify specific number of toasts are visible
   * 
   * @param expectedCount - Expected number of toasts
   * 
   * @example
   * await toastComponent.verifyCount(2);
   */
  async verifyCount(expectedCount: number): Promise<void> {
    const toasts = this.page.locator('[data-sonner-toast]');
    await expect(toasts).toHaveCount(expectedCount);
  }

  /**
   * Verify no toast is visible
   * 
   * @example
   * await toastComponent.verifyNoToast();
   */
  async verifyNoToast(): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]');
    await expect(toast).toBeHidden();
  }

  /**
   * Check if toast is currently visible (non-throwing)
   * 
   * @returns True if toast is visible
   * 
   * @example
   * if (await toastComponent.isVisible()) {
   *   await toastComponent.dismiss();
   * }
   */
  async isVisible(): Promise<boolean> {
    const toast = this.page.locator('[data-sonner-toast]');
    try {
      await expect(toast).toBeVisible({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for specific toast by index (0-based)
   * Useful when multiple toasts appear
   * 
   * @param index - Toast index (0 = first, 1 = second, etc.)
   * @param message - Expected message in that toast
   * @param timeout - Timeout in milliseconds (default: 5000ms)
   * 
   * @example
   * await toastComponent.waitForNthToast(0, 'Processing...');
   * await toastComponent.waitForNthToast(1, 'Complete!');
   */
  async waitForNthToast(index: number, message: string, timeout: number = 5000): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]').nth(index);
    await expect(toast).toContainText(message, { timeout });
  }

  /**
   * Wait for first toast with message
   * 
   * @param message - Expected message
   * @param timeout - Timeout in milliseconds (default: 5000ms)
   * 
   * @example
   * await toastComponent.waitForFirstToast('Processing...');
   */
  async waitForFirstToast(message: string, timeout: number = 5000): Promise<void> {
    await this.waitForNthToast(0, message, timeout);
  }

  /**
   * Wait for last toast with message
   * 
   * @param message - Expected message
   * @param timeout - Timeout in milliseconds (default: 5000ms)
   * 
   * @example
   * await toastComponent.waitForLastToast('Complete!');
   */
  async waitForLastToast(message: string, timeout: number = 5000): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]').last();
    await expect(toast).toContainText(message, { timeout });
  }

  /**
   * Dismiss all visible toasts
   * 
   * @example
   * await toastComponent.dismissAll();
   */
  async dismissAll(): Promise<void> {
    const toasts = this.page.locator('[data-sonner-toast]');
    const count = await toasts.count();
    
    for (let i = 0; i < count; i++) {
      const closeButton = toasts.nth(i).locator('button[aria-label="Close"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
    
    // Wait for all toasts to disappear
    await expect(toasts).toHaveCount(0);
  }

  /**
   * Verify toast contains action button
   * 
   * @param buttonText - Button text to look for
   * 
   * @example
   * await toastComponent.verifyHasAction('Undo');
   */
  async verifyHasAction(buttonText: string): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]');
    const actionButton = toast.getByRole('button', { name: buttonText });
    await expect(actionButton).toBeVisible();
  }

  /**
   * Click action button in toast
   * 
   * @param buttonText - Button text to click
   * 
   * @example
   * await toastComponent.clickAction('Undo');
   */
  async clickAction(buttonText: string): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]');
    const actionButton = toast.getByRole('button', { name: buttonText });
    await actionButton.click();
  }

  /**
   * Wait for toast with message matching regex pattern
   * 
   * @param pattern - Regex pattern to match
   * @param timeout - Timeout in milliseconds (default: 5000ms)
   * 
   * @example
   * await toastComponent.waitForPattern(/Order #\d+ created/);
   */
  async waitForPattern(pattern: RegExp, timeout: number = 5000): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]');
    await expect(toast).toContainText(pattern, { timeout });
  }

  /**
   * Verify toast type by checking for specific data attributes or classes
   * Note: Sonner toasts may have different data attributes based on type
   * 
   * @param type - Toast type ('success', 'error', 'warning', 'info')
   * 
   * @example
   * await toastComponent.verifyType('success');
   */
  async verifyType(type: 'success' | 'error' | 'warning' | 'info'): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]');
    
    // Sonner toasts may have data-type attribute
    const toastWithType = this.page.locator(`[data-sonner-toast][data-type="${type}"]`);
    
    // Fallback: check for common text patterns
    if (await toastWithType.count() === 0) {
      let pattern: RegExp;
      switch (type) {
        case 'success':
          pattern = /success|saved|created|updated|deleted/i;
          break;
        case 'error':
          pattern = /error|failed|invalid/i;
          break;
        case 'warning':
          pattern = /warning|caution/i;
          break;
        case 'info':
        default:
          await expect(toast).toBeVisible();
          return;
      }
      await expect(toast).toContainText(pattern);
    } else {
      await expect(toastWithType).toBeVisible();
    }
  }
}
