/**
 * ValidationHelper - Common validation utilities
 * 
 * Provides reusable validation functions for common data types and formats.
 * Useful for form validation, data verification, and test assertions.
 * 
 * Usage:
 * ```typescript
 * import { ValidationHelper } from '../support/helpers/ValidationHelper';
 * 
 * if (!ValidationHelper.isValidEmail(email)) {
 *   throw new Error('Invalid email format');
 * }
 * ```
 */

export class ValidationHelper {
  // ==========================================
  // Email Validation
  // ==========================================

  /**
   * Validate email format
   * 
   * @param email - Email address to validate
   * @returns True if email format is valid
   * 
   * @example
   * ValidationHelper.isValidEmail('user@example.com'); // true
   * ValidationHelper.isValidEmail('invalid-email'); // false
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ==========================================
  // Phone Validation
  // ==========================================

  /**
   * Validate Indian mobile number format
   * 
   * Accepts:
   * - 10 digits: 9876543210
   * - With +91: +919876543210
   * - With country code: 919876543210
   * 
   * @param phone - Phone number to validate
   * @returns True if valid Indian mobile format
   * 
   * @example
   * ValidationHelper.isValidIndianMobile('9876543210'); // true
   * ValidationHelper.isValidIndianMobile('+919876543210'); // true
   */
  static isValidIndianMobile(phone: string): boolean {
    const mobileRegex = /^(\+91|91)?[6-9]\d{9}$/;
    return mobileRegex.test(phone.replace(/\s+/g, ''));
  }

  // ==========================================
  // GSTIN Validation
  // ==========================================

  /**
   * Validate GSTIN format
   * 
   * GSTIN format: 15 alphanumeric characters
   * Pattern: 22AAAAA0000A1Z5
   * 
   * @param gstin - GSTIN to validate
   * @returns True if valid GSTIN format
   * 
   * @example
   * ValidationHelper.isValidGSTIN('22AAAAA0000A1Z5'); // true
   */
  static isValidGSTIN(gstin: string): boolean {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  }

  // ==========================================
  // Date Validation
  // ==========================================

  /**
   * Validate date string is in ISO format (YYYY-MM-DD)
   * 
   * @param dateString - Date string to validate
   * @returns True if valid ISO date format
   * 
   * @example
   * ValidationHelper.isValidISODate('2024-01-15'); // true
   * ValidationHelper.isValidISODate('15/01/2024'); // false
   */
  static isValidISODate(dateString: string): boolean {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoDateRegex.test(dateString)) return false;

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Validate date is within range
   * 
   * @param dateString - Date string to validate
   * @param minDate - Minimum allowed date
   * @param maxDate - Maximum allowed date
   * @returns True if date is within range
   * 
   * @example
   * ValidationHelper.isDateInRange(
   *   '2024-01-15',
   *   new Date('2024-01-01'),
   *   new Date('2024-12-31')
   * ); // true
   */
  static isDateInRange(
    dateString: string,
    minDate: Date,
    maxDate: Date
  ): boolean {
    const date = new Date(dateString);
    if (!(date instanceof Date) || isNaN(date.getTime())) return false;

    return date >= minDate && date <= maxDate;
  }

  // ==========================================
  // Number Validation
  // ==========================================

  /**
   * Validate number is within range
   * 
   * @param value - Value to validate
   * @param min - Minimum allowed value (inclusive)
   * @param max - Maximum allowed value (inclusive)
   * @returns True if value is within range
   * 
   * @example
   * ValidationHelper.isInRange(5, 1, 10); // true
   * ValidationHelper.isInRange(15, 1, 10); // false
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  /**
   * Validate number is positive
   * 
   * @param value - Value to validate
   * @returns True if value is positive (> 0)
   * 
   * @example
   * ValidationHelper.isPositive(5); // true
   * ValidationHelper.isPositive(-5); // false
   * ValidationHelper.isPositive(0); // false
   */
  static isPositive(value: number): boolean {
    return value > 0;
  }

  /**
   * Validate number is non-negative
   * 
   * @param value - Value to validate
   * @returns True if value is >= 0
   * 
   * @example
   * ValidationHelper.isNonNegative(5); // true
   * ValidationHelper.isNonNegative(0); // true
   * ValidationHelper.isNonNegative(-5); // false
   */
  static isNonNegative(value: number): boolean {
    return value >= 0;
  }

  // ==========================================
  // String Validation
  // ==========================================

  /**
   * Validate string is not empty (after trimming)
   * 
   * @param value - String to validate
   * @returns True if string has content
   * 
   * @example
   * ValidationHelper.isNotEmpty('test'); // true
   * ValidationHelper.isNotEmpty('  '); // false
   * ValidationHelper.isNotEmpty(''); // false
   */
  static isNotEmpty(value: string): boolean {
    return value.trim().length > 0;
  }

  /**
   * Validate string length is within range
   * 
   * @param value - String to validate
   * @param minLength - Minimum length (inclusive)
   * @param maxLength - Maximum length (inclusive)
   * @returns True if string length is within range
   * 
   * @example
   * ValidationHelper.isLengthInRange('test', 1, 10); // true
   * ValidationHelper.isLengthInRange('test', 5, 10); // false
   */
  static isLengthInRange(
    value: string,
    minLength: number,
    maxLength: number
  ): boolean {
    const length = value.length;
    return length >= minLength && length <= maxLength;
  }

  /**
   * Validate string matches regex pattern
   * 
   * @param value - String to validate
   * @param pattern - Regex pattern to match
   * @returns True if string matches pattern
   * 
   * @example
   * ValidationHelper.matchesPattern('ABC123', /^[A-Z]{3}\d{3}$/); // true
   */
  static matchesPattern(value: string, pattern: RegExp): boolean {
    return pattern.test(value);
  }

  // ==========================================
  // Array Validation
  // ==========================================

  /**
   * Validate array is not empty
   * 
   * @param array - Array to validate
   * @returns True if array has at least one element
   * 
   * @example
   * ValidationHelper.isNotEmptyArray([1, 2, 3]); // true
   * ValidationHelper.isNotEmptyArray([]); // false
   */
  static isNotEmptyArray<T>(array: T[]): boolean {
    return Array.isArray(array) && array.length > 0;
  }

  /**
   * Validate array length is within range
   * 
   * @param array - Array to validate
   * @param minLength - Minimum length (inclusive)
   * @param maxLength - Maximum length (inclusive)
   * @returns True if array length is within range
   * 
   * @example
   * ValidationHelper.isArrayLengthInRange([1, 2, 3], 1, 5); // true
   */
  static isArrayLengthInRange<T>(
    array: T[],
    minLength: number,
    maxLength: number
  ): boolean {
    return array.length >= minLength && array.length <= maxLength;
  }

  // ==========================================
  // Object Validation
  // ==========================================

  /**
   * Validate object has required properties
   * 
   * @param obj - Object to validate
   * @param requiredProps - Array of required property names
   * @returns True if object has all required properties
   * 
   * @example
   * ValidationHelper.hasRequiredProps(
   *   { name: 'John', age: 30 },
   *   ['name', 'age']
   * ); // true
   */
  static hasRequiredProps<T extends object>(
    obj: T,
    requiredProps: string[]
  ): boolean {
    return requiredProps.every((prop) => prop in obj);
  }

  /**
   * Validate object property values are not null/undefined
   * 
   * @param obj - Object to validate
   * @param props - Array of property names to check
   * @returns True if all specified properties have non-null values
   * 
   * @example
   * ValidationHelper.hasNonNullProps(
   *   { name: 'John', age: null },
   *   ['name']
   * ); // true
   * 
   * ValidationHelper.hasNonNullProps(
   *   { name: 'John', age: null },
   *   ['name', 'age']
   * ); // false
   */
  static hasNonNullProps<T extends object>(
    obj: T,
    props: string[]
  ): boolean {
    return props.every((prop) => {
      const value = (obj as any)[prop];
      return value !== null && value !== undefined;
    });
  }

  // ==========================================
  // URL Validation
  // ==========================================

  /**
   * Validate URL format
   * 
   * @param url - URL to validate
   * @returns True if valid URL format
   * 
   * @example
   * ValidationHelper.isValidURL('https://example.com'); // true
   * ValidationHelper.isValidURL('not-a-url'); // false
   */
  static isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // ==========================================
  // Business Logic Validation
  // ==========================================

  /**
   * Validate quantity is valid for order
   * 
   * @param quantity - Quantity value
   * @param minQty - Minimum quantity (default: 1)
   * @param maxQty - Maximum quantity (default: 10000)
   * @returns True if quantity is within valid range
   * 
   * @example
   * ValidationHelper.isValidQuantity(5); // true
   * ValidationHelper.isValidQuantity(0); // false
   * ValidationHelper.isValidQuantity(15000, 1, 10000); // false
   */
  static isValidQuantity(
    quantity: number,
    minQty: number = 1,
    maxQty: number = 10000
  ): boolean {
    return Number.isInteger(quantity) && this.isInRange(quantity, minQty, maxQty);
  }

  /**
   * Validate amount is valid for financial transaction
   * 
   * @param amount - Amount value
   * @param minAmount - Minimum amount (default: 0.01)
   * @param maxAmount - Maximum amount (default: 10000000)
   * @returns True if amount is within valid range and has max 2 decimal places
   * 
   * @example
   * ValidationHelper.isValidAmount(99.99); // true
   * ValidationHelper.isValidAmount(0); // false
   * ValidationHelper.isValidAmount(99.999); // false (too many decimals)
   */
  static isValidAmount(
    amount: number,
    minAmount: number = 0.01,
    maxAmount: number = 10000000
  ): boolean {
    if (!this.isInRange(amount, minAmount, maxAmount)) return false;

    // Check decimal places (max 2)
    const decimalPlaces = (amount.toString().split('.')[1] || '').length;
    return decimalPlaces <= 2;
  }
}
