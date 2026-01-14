/**
 * Structured Logging System for DAEE Platform Automation
 * 
 * Provides log levels (DEBUG, INFO, WARN, ERROR) with timestamps and context.
 * Logs are formatted for console output and can be written to files.
 */

import * as path from 'path';
import * as fs from 'fs';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  stepType?: string;
  stepName?: string;
}

class Logger {
  private logLevel: LogLevel;
  private logFile?: string;
  private isDebugMode: boolean;

  constructor() {
    // Get log level from environment or default to INFO
    const envLogLevel = process.env.DEBUG_LOG_LEVEL?.toUpperCase() || 'INFO';
    this.logLevel = LogLevel[envLogLevel as keyof typeof LogLevel] ?? LogLevel.INFO;
    
    // Check if debug mode is enabled
    this.isDebugMode = process.env.DEBUG_MODE === 'true';
    
    // If debug mode, set log level to DEBUG
    if (this.isDebugMode && this.logLevel > LogLevel.DEBUG) {
      this.logLevel = LogLevel.DEBUG;
    }
    
    // Optional log file path
    if (process.env.DEBUG_LOG_FILE) {
      this.logFile = process.env.DEBUG_LOG_FILE;
      // Ensure directory exists
      const logDir = path.dirname(this.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
  }

  /**
   * Format log entry for console output
   */
  private formatConsole(entry: LogEntry): string {
    const timestamp = entry.timestamp;
    const levelIcon = this.getLevelIcon(entry.level);
    const levelName = LogLevel[entry.level];
    
    let output = `${timestamp} ${levelIcon} [${levelName}]`;
    
    if (entry.stepType && entry.stepName) {
      output += ` [${entry.stepType}] ${entry.stepName}`;
    }
    
    output += ` ${entry.message}`;
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      output += ` | Context: ${JSON.stringify(entry.context)}`;
    }
    
    return output;
  }

  /**
   * Format log entry for file output (JSON)
   */
  private formatFile(entry: LogEntry): string {
    return JSON.stringify(entry) + '\n';
  }

  /**
   * Get icon for log level
   */
  private getLevelIcon(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return '🔍';
      case LogLevel.INFO:
        return 'ℹ️';
      case LogLevel.WARN:
        return '⚠️';
      case LogLevel.ERROR:
        return '❌';
      default:
        return '•';
    }
  }

  /**
   * Write log entry
   */
  private writeLog(level: LogLevel, message: string, context?: Record<string, any>, stepType?: string, stepName?: string): void {
    // Skip if log level is too low
    if (level < this.logLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      stepType,
      stepName,
    };

    // Console output
    console.log(this.formatConsole(entry));

    // File output (if configured)
    if (this.logFile) {
      try {
        fs.appendFileSync(this.logFile, this.formatFile(entry));
      } catch (error) {
        console.error('Failed to write to log file:', error);
      }
    }
  }

  /**
   * Log debug message (only in debug mode)
   */
  debug(message: string, context?: Record<string, any>, stepType?: string, stepName?: string): void {
    if (this.isDebugMode) {
      this.writeLog(LogLevel.DEBUG, message, context, stepType, stepName);
    }
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, any>, stepType?: string, stepName?: string): void {
    this.writeLog(LogLevel.INFO, message, context, stepType, stepName);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, any>, stepType?: string, stepName?: string): void {
    this.writeLog(LogLevel.WARN, message, context, stepType, stepName);
  }

  /**
   * Log error message
   */
  error(message: string, context?: Record<string, any>, stepType?: string, stepName?: string): void {
    this.writeLog(LogLevel.ERROR, message, context, stepType, stepName);
  }

  /**
   * Log step execution
   */
  logStep(stepType: 'Given' | 'When' | 'Then', stepName: string, details?: Record<string, any>): void {
    this.info(`Executing step: ${stepName}`, details, stepType, stepName);
  }

  /**
   * Check if debug mode is enabled
   */
  isDebug(): boolean {
    return this.isDebugMode;
  }
}

// Export singleton instance
export const logger = new Logger();
