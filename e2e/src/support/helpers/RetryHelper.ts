/**
 * RetryHelper - Generic retry logic with exponential backoff
 * 
 * Provides utilities for retrying operations that may fail intermittently.
 * Useful for network requests, flaky UI interactions, or polling operations.
 * 
 * Usage:
 * ```typescript
 * import { RetryHelper } from '../support/helpers/RetryHelper';
 * 
 * const result = await RetryHelper.retry(
 *   async () => {
 *     const response = await fetch('/api/data');
 *     return response.json();
 *   },
 *   { maxAttempts: 3, initialDelay: 1000, backoffMultiplier: 2 }
 * );
 * ```
 */

export interface RetryOptions {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxAttempts?: number;

  /**
   * Initial delay between retries (ms)
   * @default 1000
   */
  initialDelay?: number;

  /**
   * Multiplier for exponential backoff
   * @default 2
   */
  backoffMultiplier?: number;

  /**
   * Maximum delay cap (ms)
   * @default 10000
   */
  maxDelay?: number;

  /**
   * Custom function to determine if error is retryable
   * @default () => true (retry all errors)
   */
  shouldRetry?: (error: Error, attempt: number) => boolean;

  /**
   * Callback invoked before each retry
   */
  onRetry?: (error: Error, attempt: number, delay: number) => void;

  /**
   * Description for logging
   */
  description?: string;
}

export class RetryHelper {
  /**
   * Retry an async operation with exponential backoff
   * 
   * @param operation - Async function to retry
   * @param options - Retry configuration options
   * @returns Result of successful operation
   * @throws Error if all attempts fail
   * 
   * @example
   * const data = await RetryHelper.retry(
   *   async () => {
   *     const response = await fetch('/api/orders');
   *     if (!response.ok) throw new Error('API error');
   *     return response.json();
   *   },
   *   { maxAttempts: 3, initialDelay: 1000 }
   * );
   */
  static async retry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      initialDelay = 1000,
      backoffMultiplier = 2,
      maxDelay = 10000,
      shouldRetry = () => true,
      onRetry,
      description = 'operation',
    } = options;

    let lastError: Error | null = null;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Check if we should retry this error
        if (!shouldRetry(lastError, attempt)) {
          throw lastError;
        }

        // Don't wait after last attempt
        if (attempt === maxAttempts) {
          break;
        }

        // Call retry callback
        if (onRetry) {
          onRetry(lastError, attempt, delay);
        } else {
          console.log(
            `⚠️ ${description} failed (attempt ${attempt}/${maxAttempts}): ${lastError.message}`
          );
          console.log(`   Retrying in ${delay}ms...`);
        }

        // Wait before next attempt
        await this.sleep(delay);

        // Calculate next delay with exponential backoff (capped)
        delay = Math.min(delay * backoffMultiplier, maxDelay);
      }
    }

    throw new Error(
      `${description} failed after ${maxAttempts} attempts.\n` +
        `Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Retry until condition is true or timeout
   * 
   * Similar to polling, but with retry semantics.
   * 
   * @param condition - Async function that returns true when condition met
   * @param options - Retry configuration
   * @returns void on success
   * @throws Error if condition not met within attempts
   * 
   * @example
   * await RetryHelper.retryUntil(
   *   async () => {
   *     const element = await page.locator('.item');
   *     return (await element.count()) > 0;
   *   },
   *   { maxAttempts: 10, initialDelay: 500 }
   * );
   */
  static async retryUntil(
    condition: () => Promise<boolean>,
    options: RetryOptions = {}
  ): Promise<void> {
    await this.retry(
      async () => {
        const result = await condition();
        if (!result) {
          throw new Error('Condition not met');
        }
        return result;
      },
      options
    );
  }

  /**
   * Retry with custom error handling
   * 
   * Only retries on specific error types or messages.
   * 
   * @param operation - Async function to retry
   * @param isRetryableError - Function to check if error is retryable
   * @param options - Retry configuration
   * 
   * @example
   * await RetryHelper.retryOn(
   *   async () => await apiCall(),
   *   (error) => error.message.includes('timeout') || error.message.includes('ECONNRESET'),
   *   { maxAttempts: 5 }
   * );
   */
  static async retryOn<T>(
    operation: () => Promise<T>,
    isRetryableError: (error: Error) => boolean,
    options: RetryOptions = {}
  ): Promise<T> {
    return this.retry(operation, {
      ...options,
      shouldRetry: (error) => isRetryableError(error),
    });
  }

  /**
   * Sleep for specified duration
   * 
   * @param ms - Duration in milliseconds
   */
  private static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get retry delay for specific attempt (exponential backoff calculation)
   * 
   * @param attempt - Attempt number (1-indexed)
   * @param initialDelay - Initial delay (ms)
   * @param backoffMultiplier - Multiplier for exponential backoff
   * @param maxDelay - Maximum delay cap (ms)
   * @returns Calculated delay for this attempt
   * 
   * @example
   * const delay = RetryHelper.getDelay(3, 1000, 2, 10000); // 4000ms
   */
  static getDelay(
    attempt: number,
    initialDelay: number = 1000,
    backoffMultiplier: number = 2,
    maxDelay: number = 10000
  ): number {
    const delay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
    return Math.min(delay, maxDelay);
  }
}
