/**
 * PollingHelper - Generic polling utilities
 * 
 * Provides utilities for polling operations until a condition is met.
 * Useful for waiting for data updates, status changes, or async operations.
 * 
 * Usage:
 * ```typescript
 * import { PollingHelper } from '../support/helpers/PollingHelper';
 * 
 * await PollingHelper.pollUntil(
 *   async () => {
 *     const status = await getOrderStatus();
 *     return status === 'completed';
 *   },
 *   { timeout: 30000, interval: 2000 }
 * );
 * ```
 */

export interface PollingOptions {
  /**
   * Maximum time to poll (ms)
   * @default 30000
   */
  timeout?: number;

  /**
   * Interval between polls (ms)
   * @default 500
   */
  interval?: number;

  /**
   * Description for error messages
   * @default 'condition'
   */
  description?: string;

  /**
   * Callback invoked on each poll attempt
   */
  onPoll?: (attempt: number, elapsed: number) => void;

  /**
   * Throw error on timeout or return false
   * @default true
   */
  throwOnTimeout?: boolean;
}

export class PollingHelper {
  /**
   * Poll until condition is met or timeout
   * 
   * @param condition - Async function that returns true when condition met
   * @param options - Polling configuration
   * @returns True if condition met, false if timeout (when throwOnTimeout = false)
   * @throws Error if timeout and throwOnTimeout = true
   * 
   * @example
   * await PollingHelper.pollUntil(
   *   async () => {
   *     const count = await getItemCount();
   *     return count > 0;
   *   },
   *   { timeout: 10000, interval: 1000 }
   * );
   */
  static async pollUntil(
    condition: () => Promise<boolean>,
    options: PollingOptions = {}
  ): Promise<boolean> {
    const {
      timeout = 30000,
      interval = 500,
      description = 'condition',
      onPoll,
      throwOnTimeout = true,
    } = options;

    const startTime = Date.now();
    let attempt = 0;

    while (Date.now() - startTime < timeout) {
      attempt++;
      const elapsed = Date.now() - startTime;

      if (onPoll) {
        onPoll(attempt, elapsed);
      }

      try {
        if (await condition()) {
          return true; // Condition met!
        }
      } catch (error) {
        // Continue polling even if condition check throws
        console.log(`⚠️ Polling error (attempt ${attempt}): ${(error as Error).message}`);
      }

      // Wait before next poll
      await this.sleep(interval);
    }

    // Timeout reached
    if (throwOnTimeout) {
      throw new Error(
        `Timeout waiting for ${description} after ${timeout}ms (${attempt} attempts)`
      );
    }

    return false;
  }

  /**
   * Poll for specific value
   * 
   * Polls until getValue() returns expectedValue or timeout.
   * 
   * @param getValue - Async function that returns current value
   * @param expectedValue - Expected value to match
   * @param options - Polling configuration
   * @returns The value when matched
   * @throws Error if timeout
   * 
   * @example
   * const status = await PollingHelper.pollForValue(
   *   async () => await getOrderStatus('ORD-123'),
   *   'completed',
   *   { timeout: 30000, interval: 2000 }
   * );
   */
  static async pollForValue<T>(
    getValue: () => Promise<T>,
    expectedValue: T,
    options: PollingOptions = {}
  ): Promise<T> {
    let currentValue: T | undefined;

    await this.pollUntil(
      async () => {
        currentValue = await getValue();
        return currentValue === expectedValue;
      },
      {
        ...options,
        description: options.description || `value to equal ${expectedValue}`,
      }
    );

    return currentValue as T;
  }

  /**
   * Poll until value changes from initial value
   * 
   * Useful for waiting for status changes, data updates, etc.
   * 
   * @param getValue - Async function that returns current value
   * @param options - Polling configuration
   * @returns The new value when changed
   * @throws Error if timeout
   * 
   * @example
   * const newStatus = await PollingHelper.pollForChange(
   *   async () => await getOrderStatus('ORD-123'),
   *   { timeout: 30000, interval: 2000 }
   * );
   */
  static async pollForChange<T>(
    getValue: () => Promise<T>,
    options: PollingOptions = {}
  ): Promise<T> {
    const initialValue = await getValue();
    let currentValue: T = initialValue;

    await this.pollUntil(
      async () => {
        currentValue = await getValue();
        return currentValue !== initialValue;
      },
      {
        ...options,
        description: options.description || 'value to change',
      }
    );

    return currentValue;
  }

  /**
   * Poll until count reaches expected value
   * 
   * Useful for waiting for items to appear/disappear in lists.
   * 
   * @param getCount - Async function that returns current count
   * @param expectedCount - Expected count to match
   * @param options - Polling configuration
   * @returns The count when matched
   * @throws Error if timeout
   * 
   * @example
   * await PollingHelper.pollForCount(
   *   async () => await page.locator('.item').count(),
   *   5,
   *   { timeout: 10000, interval: 500 }
   * );
   */
  static async pollForCount(
    getCount: () => Promise<number>,
    expectedCount: number,
    options: PollingOptions = {}
  ): Promise<number> {
    return this.pollForValue(getCount, expectedCount, {
      ...options,
      description: options.description || `count to equal ${expectedCount}`,
    });
  }

  /**
   * Poll until value meets custom condition
   * 
   * More flexible than pollForValue - allows custom comparison logic.
   * 
   * @param getValue - Async function that returns current value
   * @param predicate - Function that returns true when value matches condition
   * @param options - Polling configuration
   * @returns The value when condition met
   * @throws Error if timeout
   * 
   * @example
   * const orders = await PollingHelper.pollUntilMatches(
   *   async () => await getOrders(),
   *   (orders) => orders.length > 0 && orders[0].status === 'completed',
   *   { timeout: 30000, interval: 2000, description: 'orders to be completed' }
   * );
   */
  static async pollUntilMatches<T>(
    getValue: () => Promise<T>,
    predicate: (value: T) => boolean,
    options: PollingOptions = {}
  ): Promise<T> {
    let currentValue: T | undefined;

    await this.pollUntil(
      async () => {
        currentValue = await getValue();
        return predicate(currentValue);
      },
      options
    );

    return currentValue as T;
  }

  /**
   * Poll with exponential backoff
   * 
   * Increases interval between polls exponentially.
   * Useful for operations that may take variable time.
   * 
   * @param condition - Async function that returns true when condition met
   * @param timeout - Maximum time to poll (ms)
   * @param initialInterval - Initial interval (ms)
   * @param backoffMultiplier - Multiplier for exponential backoff
   * @param maxInterval - Maximum interval cap (ms)
   * @param description - Description for error messages
   * @returns True if condition met
   * @throws Error if timeout
   * 
   * @example
   * await PollingHelper.pollWithBackoff(
   *   async () => await isJobComplete(),
   *   60000,
   *   1000,
   *   2,
   *   10000,
   *   'job completion'
   * );
   */
  static async pollWithBackoff(
    condition: () => Promise<boolean>,
    timeout: number = 30000,
    initialInterval: number = 500,
    backoffMultiplier: number = 2,
    maxInterval: number = 5000,
    description: string = 'condition'
  ): Promise<boolean> {
    const startTime = Date.now();
    let attempt = 0;
    let currentInterval = initialInterval;

    while (Date.now() - startTime < timeout) {
      attempt++;

      try {
        if (await condition()) {
          return true; // Condition met!
        }
      } catch (error) {
        console.log(`⚠️ Polling error (attempt ${attempt}): ${(error as Error).message}`);
      }

      // Wait with exponential backoff
      await this.sleep(currentInterval);
      currentInterval = Math.min(currentInterval * backoffMultiplier, maxInterval);
    }

    throw new Error(
      `Timeout waiting for ${description} after ${timeout}ms (${attempt} attempts)`
    );
  }

  /**
   * Sleep for specified duration
   * 
   * @param ms - Duration in milliseconds
   */
  private static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
