/**
 * Test Context Manager for DAEE Platform Automation
 * 
 * Manages test execution context including:
 * - Current step tracking
 * - Transaction IDs and extracted information
 * - Screenshot capture with metadata
 * - Test artifacts attachment
 */

import { Page, test as playwrightTest } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { logger } from './logger';

interface TestContextData {
  testName?: string;
  currentStep?: {
    type: 'Given' | 'When' | 'Then';
    name: string;
  };
  transactionIds: string[];
  extractedData: Record<string, any>;
  screenshots: Array<{
    path: string;
    stepName: string;
    context?: Record<string, any>;
    timestamp: string;
  }>;
}

class TestContext {
  private context: TestContextData;
  private screenshotDir: string;
  private isDebugMode: boolean;

  constructor() {
    this.context = {
      transactionIds: [],
      extractedData: {},
      screenshots: [],
    };
    
    this.isDebugMode = process.env.DEBUG_MODE === 'true';
    
    // Determine screenshot directory
    const customPath = process.env.DEBUG_SCREENSHOT_PATH;
    this.screenshotDir = customPath 
      ? path.resolve(process.cwd(), customPath)
      : path.resolve(process.cwd(), 'test-results', 'debug-screenshots');
    
    // Clean up ALL screenshots before starting each test run
    // This ensures screenshots from previous runs don't appear in current run reports
    this.cleanupAllScreenshots();
    
    // Ensure screenshot directory exists
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  /**
   * Clean up ALL screenshots from previous test runs
   * Clears the directory before each test run to avoid mixing screenshots from different runs
   * This is called automatically in constructor, but can also be called explicitly
   */
  cleanupAllScreenshots(): void {
    try {
      if (!fs.existsSync(this.screenshotDir)) {
        return;
      }

      const files = fs.readdirSync(this.screenshotDir);
      let deletedCount = 0;

      for (const file of files) {
        if (!file.endsWith('.png')) {
          continue;
        }

        const filePath = path.join(this.screenshotDir, file);
        fs.unlinkSync(filePath);
        deletedCount++;
      }

      if (deletedCount > 0) {
        logger.debug(`Cleaned up ${deletedCount} screenshot(s) from previous test run(s)`);
        console.log(`🧹 Cleaned up ${deletedCount} screenshot(s) from previous test run(s)`);
      }
    } catch (error: any) {
      logger.warn(`Failed to cleanup screenshots: ${error.message}`);
    }
  }

  /**
   * Initialize test context for a new test
   */
  initialize(testName: string): void {
    this.context = {
      testName,
      transactionIds: [],
      extractedData: {},
      screenshots: [],
    };
    logger.debug(`Test context initialized for: ${testName}`, { testName });
  }

  /**
   * Set current step
   */
  setCurrentStep(stepType: 'Given' | 'When' | 'Then', stepName: string): void {
    this.context.currentStep = { type: stepType, name: stepName };
    logger.debug(`Current step set: ${stepType} - ${stepName}`, {}, stepType, stepName);
  }

  /**
   * Get current test context
   */
  getContext(): TestContextData {
    return { ...this.context };
  }

  /**
   * Capture screenshot with metadata
   */
  async captureScreenshot(
    page: Page,
    stepName: string,
    context?: Record<string, any>
  ): Promise<string | null> {
    try {
      // Generate screenshot filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const testName = this.context.testName?.replace(/[^a-zA-Z0-9]/g, '_') || 'test';
      const stepNameSafe = stepName.replace(/[^a-zA-Z0-9]/g, '_');
      const contextStr = context?.action ? `_${context.action}` : '';
      const transactionStr = context?.transactionId ? `_txn_${context.transactionId}` : '';
      
      const filename = `${testName}_${stepNameSafe}_${timestamp}${contextStr}${transactionStr}.png`;
      const filepath = path.join(this.screenshotDir, filename);

      // Capture screenshot
      await page.screenshot({ path: filepath, fullPage: true });
      
      // Store screenshot metadata
      this.context.screenshots.push({
        path: filepath,
        stepName,
        context,
        timestamp: new Date().toISOString(),
      });

      // Attach to test report within step context
      // Note: playwright-bdd wraps BDD steps in test.step() internally
      // Attachments made with testInfo.attach() within a BDD step should associate with that step
      // However, Monocart reporter has a limitation: attachments in nested steps may not
      // display in the step tree view, but will appear in the Attachments section
      try {
        // Attach directly - this should associate with the current BDD step context
        // (since we're called from within a BDD step which is wrapped in test.step())
        await playwrightTest.info().attach(filename, {
          path: filepath,
          contentType: 'image/png',
        });
      } catch (attachError) {
        // If attach fails (e.g., not in test context), just log
        logger.debug('Could not attach screenshot to report', { error: attachError });
      }

      logger.debug(`Screenshot captured: ${filename}`, { filepath, stepName, context });
      return filepath;
    } catch (error: any) {
      logger.error(`Failed to capture screenshot: ${error.message}`, { error: error.message, stepName });
      return null;
    }
  }

  /**
   * Add transaction ID to context
   */
  addTransactionId(transactionId: string): void {
    if (!this.context.transactionIds.includes(transactionId)) {
      this.context.transactionIds.push(transactionId);
      logger.info(`Transaction ID captured: ${transactionId}`, { transactionId });
    }
  }

  /**
   * Add extracted data to context
   */
  addExtractedData(key: string, value: any): void {
    this.context.extractedData[key] = value;
    logger.debug(`Extracted data: ${key} = ${value}`, { key, value });
  }

  /**
   * Get all transaction IDs
   */
  getTransactionIds(): string[] {
    return [...this.context.transactionIds];
  }

  /**
   * Get extracted data
   */
  getExtractedData(): Record<string, any> {
    return { ...this.context.extractedData };
  }

  /**
   * Log step execution
   */
  logStep(stepType: 'Given' | 'When' | 'Then', stepName: string, details?: Record<string, any>): void {
    this.setCurrentStep(stepType, stepName);
    logger.logStep(stepType, stepName, details);
  }

  /**
   * Attach content to test report
   */
  async attachToReport(name: string, content: string | Buffer, contentType: string): Promise<void> {
    try {
      await playwrightTest.info().attach(name, {
        body: content,
        contentType,
      });
      logger.debug(`Attached to report: ${name}`, { name, contentType });
    } catch (error: any) {
      logger.warn(`Could not attach to report: ${name}`, { error: error.message });
    }
  }

  /**
   * Check if debug mode is enabled
   */
  isDebugModeEnabled(): boolean {
    return this.isDebugMode;
  }

  /**
   * Get screenshot directory
   */
  getScreenshotDir(): string {
    return this.screenshotDir;
  }

  /**
   * Clear context (for cleanup)
   */
  clear(): void {
    this.context = {
      transactionIds: [],
      extractedData: {},
      screenshots: [],
    };
  }
}

// Export singleton instance
export const testContext = new TestContext();
