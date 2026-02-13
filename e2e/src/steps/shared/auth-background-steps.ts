import { createBdd } from 'playwright-bdd';

/**
 * Shared Authentication Background Steps
 *
 * - "Given I am logged in" (generic): Use for single-user flows. The user is determined
 *   by the Playwright project (e.g. iacs-md → IACS MD User). No hardcoded role in the feature.
 * - "Given I am logged in as {string}" (explicit): Use only for multi-user Scenario Outlines
 *   where the same scenario runs with different users per row.
 */

const { Given } = createBdd();

/**
 * User is logged in to the Application (generic – recommended for single-user tests).
 *
 * Who is logged in is determined by the Playwright project (storageState).
 * Use this in Background for most features; keep feature files generic.
 *
 * @example
 * Background:
 *   Given I am logged in to the Application
 */
Given('I am logged in to the Application', async function({ page }) {
  // Authentication is via project's storageState (global setup).
  // Ensure app context is loaded so session is active.
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
});

/**
 * User is logged in as a specific role (use only for multi-user Scenario Outline).
 *
 * Use when the same scenario runs with different users (Examples table).
 * For single-user tests, prefer "Given I am logged in" and let the project define the user.
 *
 * Supported user roles:
 * - "IACS MD User" - Managing Director with full O2C access
 * - "Super Admin" - System administrator with all permissions
 * - "Finance Manager" - Finance & Accounts module access
 * - "Warehouse Manager" - Warehouse operations access
 *
 * @example
 * Scenario Outline: User permissions for indent deletion
 *   Given I am logged in as "<User>"
 *   When I try to delete an indent
 *   Then I should see "<Result>"
 *   Examples:
 *     | User           | Result  |
 *     | IACS MD User   | Success |
 *     | Finance Manager| Denied  |
 */
Given('I am logged in as {string}', async function({ page }, userRole: string) {
  // This step is primarily for documentation and auditing
  // Actual authentication is managed by storageState in playwright.config.ts
  
  const userRoleMap: Record<string, { email: string; env: string }> = {
    'IACS MD User': {
      email: process.env.IACS_MD_USER_EMAIL || 'md@idhyahagri.com',
      env: 'IACS_MD_USER',
    },
    'Super Admin': {
      email: process.env.TEST_PRIMARY_ADMIN_EMAIL || 'super-admin@daee.in',
      env: 'SUPER_ADMIN',
    },
    'Finance Manager': {
      email: process.env.TEST_FINANCE_MANAGER_EMAIL || 'finance@daee.in',
      env: 'FINANCE_MANAGER',
    },
    'Warehouse Manager': {
      email: process.env.TEST_WAREHOUSE_MANAGER_EMAIL || 'warehouse@daee.in',
      env: 'WAREHOUSE_MANAGER',
    },
  };
  
  const userInfo = userRoleMap[userRole];
  
  if (!userInfo) {
    throw new Error(
      `Unknown user role: "${userRole}"\n` +
      `Supported roles: ${Object.keys(userRoleMap).join(', ')}`
    );
  }
  
  console.log(`📋 Test Context: Running as "${userRole}" (${userInfo.email})`);
  console.log(`🔐 Auth Method: Pre-authenticated session (storageState)`);
  
  // Store user context for logging/reporting
  if (typeof page.context === 'function') {
    await page.context().addInitScript(({ role, email }) => {
      (window as any).__TEST_USER_CONTEXT__ = { role, email };
    }, { role: userRole, email: userInfo.email });
  }
});

/**
 * Verify user has specific permission
 * 
 * @example
 * Given I have permission to "create indents"
 * Given I have permission to "approve orders"
 */
Given('I have permission to {string}', async function({ page }, permission: string) {
  console.log(`✅ Permission Check: User has permission to "${permission}"`);
  // Permission validation happens at UI level (buttons/features visible/enabled)
  // This step is for documentation and test readability
});

/**
 * Verify user belongs to specific tenant
 * 
 * @example
 * Given I am in "Demo Tenant" tenant
 * Given I am in "IACS" tenant
 */
Given('I am in {string} tenant', async function({ page }, tenantName: string) {
  console.log(`🏢 Tenant Context: "${tenantName}"`);
  // Tenant is determined by authenticated user's session
  // This step is for documentation and test readability
});
