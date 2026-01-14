/**
 * Transaction ID Extractor for DAEE Platform Automation
 * 
 * Provides utilities to extract transaction-specific information from:
 * - UI elements (data attributes, text content)
 * - API responses (intercepted requests)
 * - URL parameters
 * - Common patterns (order IDs, transaction IDs, etc.)
 */

import { Page, Route } from '@playwright/test';
import { logger } from './logger';

interface ExtractionPattern {
  selector?: string;
  attribute?: string;
  textPattern?: RegExp;
  urlPattern?: RegExp;
}

class TransactionExtractor {
  /**
   * Extract transaction ID from common UI patterns
   */
  async extractTransactionId(page: Page, customSelector?: string): Promise<string | null> {
    try {
      // Try custom selector first
      if (customSelector) {
        const element = page.locator(customSelector).first();
        if (await element.isVisible().catch(() => false)) {
          const value = await element.textContent();
          if (value) {
            logger.debug(`Extracted transaction ID from custom selector: ${value}`);
            return value.trim();
          }
        }
      }

      // Try common data attributes
      const dataAttributes = [
        '[data-transaction-id]',
        '[data-order-id]',
        '[data-txn-id]',
        '[data-id]',
        '.transaction-id',
        '.order-id',
        '.txn-id',
      ];

      for (const selector of dataAttributes) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible().catch(() => false)) {
            const value = await element.getAttribute('data-transaction-id') ||
                         await element.getAttribute('data-order-id') ||
                         await element.getAttribute('data-txn-id') ||
                         await element.getAttribute('data-id') ||
                         await element.textContent();
            if (value && value.trim()) {
              logger.debug(`Extracted transaction ID from ${selector}: ${value.trim()}`);
              return value.trim();
            }
          }
        } catch {
          // Continue to next selector
        }
      }

      // Try text patterns
      const textPatterns = [
        /Order\s*#?\s*([A-Z0-9-]+)/i,
        /Transaction\s*ID[:\s]+([A-Z0-9-]+)/i,
        /Txn\s*ID[:\s]+([A-Z0-9-]+)/i,
        /ID[:\s]+([A-Z0-9-]{8,})/i,
      ];

      const pageText = await page.textContent('body').catch(() => '');
      for (const pattern of textPatterns) {
        const match = pageText?.match(pattern);
        if (match && match[1]) {
          logger.debug(`Extracted transaction ID from text pattern: ${match[1]}`);
          return match[1].trim();
        }
      }

      logger.debug('No transaction ID found');
      return null;
    } catch (error: any) {
      logger.warn(`Error extracting transaction ID: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract order ID (alias for extractTransactionId)
   */
  async extractOrderId(page: Page): Promise<string | null> {
    return this.extractTransactionId(page);
  }

  /**
   * Extract value from specific selector
   */
  async extractFromSelector(
    page: Page,
    selector: string,
    attribute?: string
  ): Promise<string | null> {
    try {
      const element = page.locator(selector).first();
      if (!(await element.isVisible().catch(() => false))) {
        return null;
      }

      let value: string | null = null;
      if (attribute) {
        value = await element.getAttribute(attribute);
      } else {
        value = await element.textContent();
      }

      if (value && value.trim()) {
        logger.debug(`Extracted from selector ${selector}: ${value.trim()}`);
        return value.trim();
      }

      return null;
    } catch (error: any) {
      logger.warn(`Error extracting from selector ${selector}: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract ID from URL
   */
  async extractFromURL(page: Page, pattern?: RegExp): Promise<string | null> {
    try {
      const url = page.url();
      
      // Default patterns for common URL structures
      const defaultPatterns = [
        /\/orders\/([A-Z0-9-]+)/i,
        /\/transactions\/([A-Z0-9-]+)/i,
        /\/indents\/([A-Z0-9-]+)/i,
        /\/invoices\/([A-Z0-9-]+)/i,
        /\/id\/([A-Z0-9-]+)/i,
        /[?&]id=([A-Z0-9-]+)/i,
      ];

      const patterns = pattern ? [pattern] : defaultPatterns;

      for (const regex of patterns) {
        const match = url.match(regex);
        if (match && match[1]) {
          logger.debug(`Extracted ID from URL: ${match[1]}`);
          return match[1].trim();
        }
      }

      return null;
    } catch (error: any) {
      logger.warn(`Error extracting from URL: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract from API response (requires route interception)
   */
  async extractFromAPIResponse(
    route: Route,
    responsePattern?: RegExp
  ): Promise<string | null> {
    try {
      const response = await route.fetch();
      const responseText = await response.text();
      
      // Try to parse as JSON
      let jsonData: any = null;
      try {
        jsonData = JSON.parse(responseText);
      } catch {
        // Not JSON, use text
      }

      // Default patterns for common response structures
      const defaultPatterns = [
        /"id"\s*:\s*"([A-Z0-9-]+)"/i,
        /"transaction_id"\s*:\s*"([A-Z0-9-]+)"/i,
        /"order_id"\s*:\s*"([A-Z0-9-]+)"/i,
      ];

      const patterns = responsePattern ? [responsePattern] : defaultPatterns;

      // Try JSON first
      if (jsonData) {
        if (jsonData.id) return String(jsonData.id);
        if (jsonData.transaction_id) return String(jsonData.transaction_id);
        if (jsonData.order_id) return String(jsonData.order_id);
        if (jsonData.data?.id) return String(jsonData.data.id);
      }

      // Try text patterns
      for (const regex of patterns) {
        const match = responseText.match(regex);
        if (match && match[1]) {
          logger.debug(`Extracted ID from API response: ${match[1]}`);
          return match[1].trim();
        }
      }

      return null;
    } catch (error: any) {
      logger.warn(`Error extracting from API response: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract multiple values using a pattern
   */
  async extractMultiple(
    page: Page,
    pattern: ExtractionPattern
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    try {
      // Extract from selector
      if (pattern.selector) {
        const value = await this.extractFromSelector(
          page,
          pattern.selector,
          pattern.attribute
        );
        if (value) {
          results[pattern.selector] = value;
        }
      }

      // Extract from text pattern
      if (pattern.textPattern) {
        const pageText = await page.textContent('body').catch(() => '');
        const match = pageText?.match(pattern.textPattern);
        if (match) {
          // Extract all named groups
          Object.keys(match.groups || {}).forEach((key) => {
            results[key] = match.groups![key];
          });
        }
      }

      // Extract from URL
      if (pattern.urlPattern) {
        const urlId = await this.extractFromURL(page, pattern.urlPattern);
        if (urlId) {
          results.url_id = urlId;
        }
      }
    } catch (error: any) {
      logger.warn(`Error in extractMultiple: ${error.message}`);
    }

    return results;
  }
}

// Export singleton instance
export const transactionExtractor = new TransactionExtractor();
