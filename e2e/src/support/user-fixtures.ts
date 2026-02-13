import { test as base } from '@playwright/test';
import * as path from 'path';

/**
 * Custom Playwright Fixtures for Multi-User Testing
 * 
 * Extends base Playwright test with ability to use different user contexts.
 * Tests can override the default storageState by using fixtures.
 * 
 * Usage in step definitions:
 * 
 * import { test } from '../../support/user-fixtures';
 * 
 * Given('I am logged in as IACS MD User', async ({ iacsUser }) => {
 *   // Test will use IACS MD User context
 * });
 */

type UserFixtures = {
  superAdmin: void;
  iacsUser: void;
  financeManager: void;
  warehouseManager: void;
};

export const test = base.extend<UserFixtures>({
  // Super Admin fixture
  superAdmin: [async ({ browser }, use) => {
    const authFile = path.resolve(__dirname, '../../.auth/admin.json');
    const context = await browser.newContext({ storageState: authFile });
    await use();
    await context.close();
  }, { scope: 'test' }],
  
  // IACS MD User fixture
  iacsUser: [async ({ browser }, use) => {
    const authFile = path.resolve(__dirname, '../../.auth/iacs-md.json');
    const context = await browser.newContext({ storageState: authFile });
    await use();
    await context.close();
  }, { scope: 'test' }],
  
  // Finance Manager fixture (future use)
  financeManager: [async ({ browser }, use) => {
    const authFile = path.resolve(__dirname, '../../.auth/finance.json');
    const context = await browser.newContext({ storageState: authFile });
    await use();
    await context.close();
  }, { scope: 'test' }],
  
  // Warehouse Manager fixture (future use)
  warehouseManager: [async ({ browser }, use) => {
    const authFile = path.resolve(__dirname, '../../.auth/warehouse.json');
    const context = await browser.newContext({ storageState: authFile });
    await use();
    await context.close();
  }, { scope: 'test' }],
});

export { expect } from '@playwright/test';

/**
 * User storage state file mapping
 * Used to dynamically load user contexts
 */
export const USER_AUTH_FILES = {
  'Super Admin': 'admin.json',
  'IACS MD User': 'iacs-md.json',
  'Finance Manager': 'finance.json',
  'Warehouse Manager': 'warehouse.json',
} as const;

export type UserRole = keyof typeof USER_AUTH_FILES;
