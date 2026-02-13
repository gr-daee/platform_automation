/**
 * StringHelper - String manipulation utilities
 * 
 * Provides utilities for string generation, formatting, and transformation.
 * Useful for creating test data, formatting display values, and text processing.
 * 
 * Usage:
 * ```typescript
 * import { StringHelper } from '../support/helpers/StringHelper';
 * 
 * const uniqueName = StringHelper.generateUniqueTestData('Order');
 * const email = StringHelper.generateRandomEmail('test');
 * ```
 */

export class StringHelper {
  // ==========================================
  // Test Data Generation
  // ==========================================

  /**
   * Generate unique test data with AUTO_QA_ prefix and timestamp
   * 
   * Format: AUTO_QA_{timestamp}_{prefix}
   * 
   * @param prefix - Prefix for the test data (e.g., 'Order', 'Indent', 'Dealer')
   * @param includeRandom - Include random string for extra uniqueness (default: false)
   * @returns Unique test data string
   * 
   * @example
   * StringHelper.generateUniqueTestData('Order'); 
   * // 'AUTO_QA_1705320000000_Order'
   * 
   * StringHelper.generateUniqueTestData('Dealer', true);
   * // 'AUTO_QA_1705320000000_Dealer_abc123'
   */
  static generateUniqueTestData(prefix: string, includeRandom: boolean = false): string {
    const timestamp = Date.now();
    const base = `AUTO_QA_${timestamp}_${prefix}`;
    
    if (includeRandom) {
      const randomStr = this.generateRandomString(6);
      return `${base}_${randomStr}`;
    }
    
    return base;
  }

  /**
   * Generate random string of specified length
   * 
   * @param length - Length of random string
   * @param charset - Character set to use (default: alphanumeric lowercase)
   * @returns Random string
   * 
   * @example
   * StringHelper.generateRandomString(8); // 'a3f7k9m2'
   * StringHelper.generateRandomString(6, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'); // 'KFMQXZ'
   */
  static generateRandomString(
    length: number,
    charset: string = 'abcdefghijklmnopqrstuvwxyz0123456789'
  ): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  /**
   * Generate random email address
   * 
   * @param prefix - Email prefix (default: 'test')
   * @param domain - Email domain (default: 'example.com')
   * @param includeTimestamp - Include timestamp for uniqueness (default: true)
   * @returns Random email address
   * 
   * @example
   * StringHelper.generateRandomEmail('user'); 
   * // 'user_1705320000000@example.com'
   * 
   * StringHelper.generateRandomEmail('test', 'automation.com', false);
   * // 'test_abc123@automation.com'
   */
  static generateRandomEmail(
    prefix: string = 'test',
    domain: string = 'example.com',
    includeTimestamp: boolean = true
  ): string {
    const uniquePart = includeTimestamp 
      ? Date.now().toString()
      : this.generateRandomString(6);
    
    return `${prefix}_${uniquePart}@${domain}`;
  }

  /**
   * Generate random phone number (Indian format)
   * 
   * @param includeCountryCode - Include +91 prefix (default: false)
   * @returns Random Indian mobile number
   * 
   * @example
   * StringHelper.generateRandomPhone(); // '9876543210'
   * StringHelper.generateRandomPhone(true); // '+919876543210'
   */
  static generateRandomPhone(includeCountryCode: boolean = false): string {
    // Indian mobile: starts with 6-9, followed by 9 digits
    const firstDigit = Math.floor(Math.random() * 4) + 6; // 6-9
    const remainingDigits = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    const phone = `${firstDigit}${remainingDigits}`;
    
    return includeCountryCode ? `+91${phone}` : phone;
  }

  // ==========================================
  // String Formatting
  // ==========================================

  /**
   * Format number as currency (INR)
   * 
   * @param amount - Amount to format
   * @param includeSymbol - Include currency symbol (default: true)
   * @returns Formatted currency string
   * 
   * @example
   * StringHelper.formatCurrency(1234.56); // '₹1,234.56'
   * StringHelper.formatCurrency(1234.56, false); // '1,234.56'
   */
  static formatCurrency(amount: number, includeSymbol: boolean = true): string {
    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    
    return includeSymbol ? `₹${formatted}` : formatted;
  }

  /**
   * Truncate string to specified length with ellipsis
   * 
   * @param str - String to truncate
   * @param maxLength - Maximum length (including ellipsis)
   * @param ellipsis - Ellipsis string (default: '...')
   * @returns Truncated string
   * 
   * @example
   * StringHelper.truncate('Hello World', 8); // 'Hello...'
   * StringHelper.truncate('Short', 10); // 'Short'
   */
  static truncate(
    str: string,
    maxLength: number,
    ellipsis: string = '...'
  ): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - ellipsis.length) + ellipsis;
  }

  /**
   * Pad string to specified length
   * 
   * @param str - String to pad
   * @param length - Target length
   * @param padChar - Padding character (default: ' ')
   * @param padStart - Pad at start vs end (default: true)
   * @returns Padded string
   * 
   * @example
   * StringHelper.pad('5', 3, '0'); // '005'
   * StringHelper.pad('5', 3, '0', false); // '500'
   */
  static pad(
    str: string,
    length: number,
    padChar: string = ' ',
    padStart: boolean = true
  ): string {
    if (str.length >= length) return str;
    
    const padding = padChar.repeat(length - str.length);
    return padStart ? padding + str : str + padding;
  }

  // ==========================================
  // Case Conversion
  // ==========================================

  /**
   * Convert string to camelCase
   * 
   * @param str - String to convert
   * @returns camelCase string
   * 
   * @example
   * StringHelper.toCamelCase('hello world'); // 'helloWorld'
   * StringHelper.toCamelCase('hello-world'); // 'helloWorld'
   * StringHelper.toCamelCase('hello_world'); // 'helloWorld'
   */
  static toCamelCase(str: string): string {
    return str
      .replace(/[\s-_]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
      .replace(/^[A-Z]/, (char) => char.toLowerCase());
  }

  /**
   * Convert string to PascalCase
   * 
   * @param str - String to convert
   * @returns PascalCase string
   * 
   * @example
   * StringHelper.toPascalCase('hello world'); // 'HelloWorld'
   * StringHelper.toPascalCase('hello-world'); // 'HelloWorld'
   */
  static toPascalCase(str: string): string {
    const camel = this.toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  }

  /**
   * Convert string to snake_case
   * 
   * @param str - String to convert
   * @returns snake_case string
   * 
   * @example
   * StringHelper.toSnakeCase('helloWorld'); // 'hello_world'
   * StringHelper.toSnakeCase('Hello World'); // 'hello_world'
   */
  static toSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '_$1')
      .replace(/[\s-]+/g, '_')
      .toLowerCase()
      .replace(/^_/, '');
  }

  /**
   * Convert string to kebab-case
   * 
   * @param str - String to convert
   * @returns kebab-case string
   * 
   * @example
   * StringHelper.toKebabCase('helloWorld'); // 'hello-world'
   * StringHelper.toKebabCase('Hello World'); // 'hello-world'
   */
  static toKebabCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '-$1')
      .replace(/[\s_]+/g, '-')
      .toLowerCase()
      .replace(/^-/, '');
  }

  // ==========================================
  // String Manipulation
  // ==========================================

  /**
   * Capitalize first letter of string
   * 
   * @param str - String to capitalize
   * @returns Capitalized string
   * 
   * @example
   * StringHelper.capitalize('hello'); // 'Hello'
   */
  static capitalize(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Capitalize first letter of each word
   * 
   * @param str - String to capitalize
   * @returns Title case string
   * 
   * @example
   * StringHelper.titleCase('hello world'); // 'Hello World'
   */
  static titleCase(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => this.capitalize(word))
      .join(' ');
  }

  /**
   * Remove all whitespace from string
   * 
   * @param str - String to process
   * @returns String without whitespace
   * 
   * @example
   * StringHelper.removeWhitespace('hello   world'); // 'helloworld'
   */
  static removeWhitespace(str: string): string {
    return str.replace(/\s+/g, '');
  }

  /**
   * Normalize whitespace (trim and collapse multiple spaces)
   * 
   * @param str - String to normalize
   * @returns Normalized string
   * 
   * @example
   * StringHelper.normalizeWhitespace('  hello   world  '); // 'hello world'
   */
  static normalizeWhitespace(str: string): string {
    return str.trim().replace(/\s+/g, ' ');
  }

  /**
   * Extract numbers from string
   * 
   * @param str - String to extract from
   * @returns Array of numbers found in string
   * 
   * @example
   * StringHelper.extractNumbers('Order #123 costs $45.67'); // ['123', '45.67']
   */
  static extractNumbers(str: string): string[] {
    const matches = str.match(/\d+\.?\d*/g);
    return matches || [];
  }

  /**
   * Remove special characters (keep alphanumeric and spaces)
   * 
   * @param str - String to clean
   * @returns Cleaned string
   * 
   * @example
   * StringHelper.removeSpecialChars('Hello, World!'); // 'Hello World'
   */
  static removeSpecialChars(str: string): string {
    return str.replace(/[^a-zA-Z0-9\s]/g, '');
  }

  // ==========================================
  // String Comparison
  // ==========================================

  /**
   * Compare strings case-insensitively
   * 
   * @param str1 - First string
   * @param str2 - Second string
   * @returns True if strings are equal (case-insensitive)
   * 
   * @example
   * StringHelper.equalsIgnoreCase('Hello', 'hello'); // true
   */
  static equalsIgnoreCase(str1: string, str2: string): boolean {
    return str1.toLowerCase() === str2.toLowerCase();
  }

  /**
   * Check if string contains substring (case-insensitive)
   * 
   * @param str - String to search in
   * @param substring - Substring to find
   * @returns True if string contains substring
   * 
   * @example
   * StringHelper.containsIgnoreCase('Hello World', 'WORLD'); // true
   */
  static containsIgnoreCase(str: string, substring: string): boolean {
    return str.toLowerCase().includes(substring.toLowerCase());
  }

  /**
   * Check if string starts with prefix (case-insensitive)
   * 
   * @param str - String to check
   * @param prefix - Prefix to match
   * @returns True if string starts with prefix
   * 
   * @example
   * StringHelper.startsWithIgnoreCase('Hello World', 'HELLO'); // true
   */
  static startsWithIgnoreCase(str: string, prefix: string): boolean {
    return str.toLowerCase().startsWith(prefix.toLowerCase());
  }

  /**
   * Check if string ends with suffix (case-insensitive)
   * 
   * @param str - String to check
   * @param suffix - Suffix to match
   * @returns True if string ends with suffix
   * 
   * @example
   * StringHelper.endsWithIgnoreCase('Hello World', 'WORLD'); // true
   */
  static endsWithIgnoreCase(str: string, suffix: string): boolean {
    return str.toLowerCase().endsWith(suffix.toLowerCase());
  }
}
