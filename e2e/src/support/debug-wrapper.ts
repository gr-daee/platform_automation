/**
 * Debug Mode Wrapper for DAEE Platform Automation
 * 
 * Automatically captures screenshots at every step when debug mode is enabled.
 * Wraps step definitions to add debug capabilities.
 */

import { Page } from '@playwright/test';
import { testContext } from './test-context';
import { logger } from './logger';

type StepFunction = (...args: any[]) => Promise<any>;
type StepType = 'Given' | 'When' | 'Then';

/**
 * Wrap a step function to automatically capture screenshots in debug mode
 */
export function wrapStepForDebug(
  stepType: StepType,
  stepName: string,
  stepFunction: StepFunction
): StepFunction {
  return async (...args: any[]) => {
    const isDebug = testContext.isDebugModeEnabled();
    
    // Set current step in context
    testContext.setCurrentStep(stepType, stepName);
    testContext.logStep(stepType, stepName);
    
    // Extract page from args (BDD steps receive { page } as first arg)
    let page: Page | undefined;
    if (args[0] && typeof args[0] === 'object' && 'page' in args[0]) {
      page = args[0].page;
    }
    
    // Capture screenshot before step execution (if debug mode and page available)
    if (isDebug && page) {
      try {
        await testContext.captureScreenshot(page, stepName, {
          action: 'before_step',
          stepType,
        });
        logger.debug(`Screenshot captured before step: ${stepName}`);
      } catch (error: any) {
        logger.warn(`Failed to capture screenshot before step: ${error.message}`);
      }
    }
    
    let stepError: Error | null = null;
    let stepResult: any;
    
    try {
      // Execute the step
      stepResult = await stepFunction(...args);
      
      // Capture screenshot after successful step execution (if debug mode)
      if (isDebug && page) {
        try {
          await testContext.captureScreenshot(page, stepName, {
            action: 'after_step',
            stepType,
            success: true,
          });
          logger.debug(`Screenshot captured after step: ${stepName}`);
        } catch (error: any) {
          logger.warn(`Failed to capture screenshot after step: ${error.message}`);
        }
      }
      
      return stepResult;
    } catch (error: any) {
      stepError = error;
      
      // Capture screenshot on error (always, not just in debug mode)
      if (page) {
        try {
          await testContext.captureScreenshot(page, stepName, {
            action: 'on_error',
            stepType,
            error: error.message,
          });
          logger.error(`Screenshot captured on error: ${stepName}`, {
            error: error.message,
          });
        } catch (screenshotError: any) {
          logger.warn(`Failed to capture error screenshot: ${screenshotError.message}`);
        }
      }
      
      // Re-throw the error
      throw error;
    }
  };
}

/**
 * Helper to wrap multiple steps at once
 */
export function wrapStepsForDebug(
  steps: Record<string, { type: StepType; fn: StepFunction }>
): Record<string, StepFunction> {
  const wrapped: Record<string, StepFunction> = {};
  
  for (const [stepName, { type, fn }] of Object.entries(steps)) {
    wrapped[stepName] = wrapStepForDebug(type, stepName, fn);
  }
  
  return wrapped;
}

/**
 * Initialize test context for a new test
 */
export function initializeTestContext(testName: string): void {
  testContext.initialize(testName);
  logger.debug(`Test context initialized: ${testName}`);
}
