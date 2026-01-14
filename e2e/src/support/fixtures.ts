import { test as base, Given as GivenBase, When as WhenBase, Then as ThenBase } from 'playwright-bdd';
import { testContext } from './test-context';
import { transactionExtractor } from './transaction-extractor';
import { logger } from './logger';

/**
 * Custom fixtures for DAEE Platform tests
 * 
 * Provides:
 * - testContext: Test context manager for screenshots, logging, and data extraction
 * - transactionExtractor: Utilities to extract transaction IDs and other data
 * - logger: Structured logging system
 */

// Extend base test with custom fixtures
export const test = base.extend<{
  testContext: typeof testContext;
  transactionExtractor: typeof transactionExtractor;
  logger: typeof logger;
}>({
  testContext: async ({}, use) => {
    // Initialize test context if needed
    await use(testContext);
  },
  transactionExtractor: async ({}, use) => {
    await use(transactionExtractor);
  },
  logger: async ({}, use) => {
    await use(logger);
  },
});

export { expect } from '@playwright/test';

// Export BDD decorators
export const Given = GivenBase;
export const When = WhenBase;
export const Then = ThenBase;

// Export utilities for direct use in step definitions
export { testContext, transactionExtractor, logger };
