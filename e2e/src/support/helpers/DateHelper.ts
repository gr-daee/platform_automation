/**
 * DateHelper - Date manipulation and formatting utilities
 * 
 * Provides utilities for date arithmetic, formatting, and comparison.
 * Useful for test data generation, date range calculations, and assertions.
 * 
 * Usage:
 * ```typescript
 * import { DateHelper } from '../support/helpers/DateHelper';
 * 
 * const today = DateHelper.getCurrentDate();
 * const nextWeek = DateHelper.addDays(today, 7);
 * const formatted = DateHelper.formatDate(nextWeek, 'YYYY-MM-DD');
 * ```
 */

export class DateHelper {
  // ==========================================
  // Date Creation
  // ==========================================

  /**
   * Get current date (midnight, local timezone)
   * 
   * @returns Current date with time set to 00:00:00
   * 
   * @example
   * DateHelper.getCurrentDate(); // 2024-01-15 00:00:00
   */
  static getCurrentDate(): Date {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }

  /**
   * Get current date and time
   * 
   * @returns Current date with current time
   * 
   * @example
   * DateHelper.getCurrentDateTime(); // 2024-01-15 14:30:45
   */
  static getCurrentDateTime(): Date {
    return new Date();
  }

  /**
   * Create date from ISO string (YYYY-MM-DD)
   * 
   * @param isoDate - ISO date string
   * @returns Date object
   * 
   * @example
   * DateHelper.fromISOString('2024-01-15'); // 2024-01-15 00:00:00
   */
  static fromISOString(isoDate: string): Date {
    return new Date(isoDate);
  }

  // ==========================================
  // Date Arithmetic
  // ==========================================

  /**
   * Add days to date
   * 
   * @param date - Base date
   * @param days - Number of days to add (can be negative)
   * @returns New date
   * 
   * @example
   * DateHelper.addDays(new Date('2024-01-15'), 7); // 2024-01-22
   * DateHelper.addDays(new Date('2024-01-15'), -7); // 2024-01-08
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Add months to date
   * 
   * @param date - Base date
   * @param months - Number of months to add (can be negative)
   * @returns New date
   * 
   * @example
   * DateHelper.addMonths(new Date('2024-01-15'), 2); // 2024-03-15
   */
  static addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  /**
   * Add years to date
   * 
   * @param date - Base date
   * @param years - Number of years to add (can be negative)
   * @returns New date
   * 
   * @example
   * DateHelper.addYears(new Date('2024-01-15'), 1); // 2025-01-15
   */
  static addYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  /**
   * Subtract days from date
   * 
   * @param date - Base date
   * @param days - Number of days to subtract
   * @returns New date
   * 
   * @example
   * DateHelper.subtractDays(new Date('2024-01-15'), 7); // 2024-01-08
   */
  static subtractDays(date: Date, days: number): Date {
    return this.addDays(date, -days);
  }

  /**
   * Subtract months from date
   * 
   * @param date - Base date
   * @param months - Number of months to subtract
   * @returns New date
   * 
   * @example
   * DateHelper.subtractMonths(new Date('2024-03-15'), 2); // 2024-01-15
   */
  static subtractMonths(date: Date, months: number): Date {
    return this.addMonths(date, -months);
  }

  /**
   * Subtract years from date
   * 
   * @param date - Base date
   * @param years - Number of years to subtract
   * @returns New date
   * 
   * @example
   * DateHelper.subtractYears(new Date('2024-01-15'), 1); // 2023-01-15
   */
  static subtractYears(date: Date, years: number): Date {
    return this.addYears(date, -years);
  }

  // ==========================================
  // Date Formatting
  // ==========================================

  /**
   * Format date as ISO string (YYYY-MM-DD)
   * 
   * @param date - Date to format
   * @returns ISO date string
   * 
   * @example
   * DateHelper.formatDate(new Date('2024-01-15')); // '2024-01-15'
   */
  static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Format date with custom pattern
   * 
   * Supported tokens:
   * - YYYY: 4-digit year
   * - YY: 2-digit year
   * - MM: 2-digit month
   * - M: month without leading zero
   * - DD: 2-digit day
   * - D: day without leading zero
   * 
   * @param date - Date to format
   * @param pattern - Format pattern
   * @returns Formatted date string
   * 
   * @example
   * DateHelper.formatDateCustom(new Date('2024-01-05'), 'DD/MM/YYYY'); // '05/01/2024'
   * DateHelper.formatDateCustom(new Date('2024-01-05'), 'D/M/YY'); // '5/1/24'
   */
  static formatDateCustom(date: Date, pattern: string): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return pattern
      .replace('YYYY', year.toString())
      .replace('YY', year.toString().slice(-2))
      .replace('MM', String(month).padStart(2, '0'))
      .replace('M', month.toString())
      .replace('DD', String(day).padStart(2, '0'))
      .replace('D', day.toString());
  }

  /**
   * Format date and time as ISO string (YYYY-MM-DD HH:mm:ss)
   * 
   * @param date - Date to format
   * @returns ISO datetime string
   * 
   * @example
   * DateHelper.formatDateTime(new Date('2024-01-15 14:30:45')); 
   * // '2024-01-15 14:30:45'
   */
  static formatDateTime(date: Date): string {
    const dateStr = this.formatDate(date);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${dateStr} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * Format date for display (e.g., "January 15, 2024")
   * 
   * @param date - Date to format
   * @param locale - Locale for formatting (default: 'en-US')
   * @returns Human-readable date string
   * 
   * @example
   * DateHelper.formatDateLong(new Date('2024-01-15')); // 'January 15, 2024'
   */
  static formatDateLong(date: Date, locale: string = 'en-US'): string {
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // ==========================================
  // Date Range Calculations
  // ==========================================

  /**
   * Get start of month for given date
   * 
   * @param date - Date
   * @returns First day of month
   * 
   * @example
   * DateHelper.getMonthStart(new Date('2024-01-15')); // 2024-01-01
   */
  static getMonthStart(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  /**
   * Get end of month for given date
   * 
   * @param date - Date
   * @returns Last day of month
   * 
   * @example
   * DateHelper.getMonthEnd(new Date('2024-01-15')); // 2024-01-31
   */
  static getMonthEnd(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  /**
   * Get start of year for given date
   * 
   * @param date - Date
   * @returns First day of year
   * 
   * @example
   * DateHelper.getYearStart(new Date('2024-06-15')); // 2024-01-01
   */
  static getYearStart(date: Date): Date {
    return new Date(date.getFullYear(), 0, 1);
  }

  /**
   * Get end of year for given date
   * 
   * @param date - Date
   * @returns Last day of year
   * 
   * @example
   * DateHelper.getYearEnd(new Date('2024-06-15')); // 2024-12-31
   */
  static getYearEnd(date: Date): Date {
    return new Date(date.getFullYear(), 11, 31);
  }

  /**
   * Get first day of week (Monday)
   * 
   * @param date - Date
   * @returns Monday of the week
   * 
   * @example
   * DateHelper.getWeekStart(new Date('2024-01-17')); // 2024-01-15 (Monday)
   */
  static getWeekStart(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Adjust for Monday as first day
    result.setDate(result.getDate() + diff);
    return result;
  }

  /**
   * Get last day of week (Sunday)
   * 
   * @param date - Date
   * @returns Sunday of the week
   * 
   * @example
   * DateHelper.getWeekEnd(new Date('2024-01-17')); // 2024-01-21 (Sunday)
   */
  static getWeekEnd(date: Date): Date {
    const weekStart = this.getWeekStart(date);
    return this.addDays(weekStart, 6);
  }

  // ==========================================
  // Date Comparison
  // ==========================================

  /**
   * Check if two dates are the same day (ignoring time)
   * 
   * @param date1 - First date
   * @param date2 - Second date
   * @returns True if same day
   * 
   * @example
   * DateHelper.isSameDay(
   *   new Date('2024-01-15 10:00'),
   *   new Date('2024-01-15 18:00')
   * ); // true
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Check if date is today
   * 
   * @param date - Date to check
   * @returns True if today
   * 
   * @example
   * DateHelper.isToday(new Date()); // true
   */
  static isToday(date: Date): boolean {
    return this.isSameDay(date, new Date());
  }

  /**
   * Check if date is in the past
   * 
   * @param date - Date to check
   * @returns True if in the past
   * 
   * @example
   * DateHelper.isPast(new Date('2020-01-01')); // true
   */
  static isPast(date: Date): boolean {
    return date < new Date();
  }

  /**
   * Check if date is in the future
   * 
   * @param date - Date to check
   * @returns True if in the future
   * 
   * @example
   * DateHelper.isFuture(new Date('2030-01-01')); // true
   */
  static isFuture(date: Date): boolean {
    return date > new Date();
  }

  /**
   * Get difference between two dates in days
   * 
   * @param date1 - First date
   * @param date2 - Second date
   * @returns Number of days difference (positive if date1 > date2)
   * 
   * @example
   * DateHelper.daysBetween(
   *   new Date('2024-01-20'),
   *   new Date('2024-01-15')
   * ); // 5
   */
  static daysBetween(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
    const diff = date1.getTime() - date2.getTime();
    return Math.round(diff / oneDay);
  }

  /**
   * Get age in years from birthdate
   * 
   * @param birthdate - Date of birth
   * @returns Age in years
   * 
   * @example
   * DateHelper.getAge(new Date('1990-01-15')); // 34 (as of 2024)
   */
  static getAge(birthdate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
      age--;
    }
    
    return age;
  }

  // ==========================================
  // Financial Period Helpers
  // ==========================================

  /**
   * Get financial year for given date (Apr-Mar in India)
   * 
   * @param date - Date
   * @returns Financial year string (e.g., '2023-24')
   * 
   * @example
   * DateHelper.getFinancialYear(new Date('2024-01-15')); // '2023-24'
   * DateHelper.getFinancialYear(new Date('2024-06-15')); // '2024-25'
   */
  static getFinancialYear(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Financial year starts in April (month = 3, 0-indexed)
    if (month < 3) {
      return `${year - 1}-${year.toString().slice(-2)}`;
    } else {
      return `${year}-${(year + 1).toString().slice(-2)}`;
    }
  }

  /**
   * Get quarter for given date
   * 
   * @param date - Date
   * @returns Quarter number (1-4)
   * 
   * @example
   * DateHelper.getQuarter(new Date('2024-01-15')); // 1
   * DateHelper.getQuarter(new Date('2024-06-15')); // 2
   */
  static getQuarter(date: Date): number {
    return Math.floor(date.getMonth() / 3) + 1;
  }
}
