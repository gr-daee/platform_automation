/**
 * User Helper - Multi-Tenant, Multi-Role User Management
 * 
 * Purpose: Provides helper functions to retrieve test user credentials
 *          following the TEST_[TENANT]_[ROLE]_[FIELD] pattern
 * 
 * Usage:
 *   import { getTestUser } from '@support/user-helper';
 *   const admin = getTestUser('PRIMARY', 'ADMIN');
 *   await loginPage.performLogin(admin.email, admin.password, admin.totpSecret);
 */

export interface TestUser {
  email: string;
  password: string;
  totpSecret: string;
}

/**
 * Get test user credentials for a specific tenant and role
 * 
 * @param tenant - Tenant identifier (e.g., 'PRIMARY', 'SECONDARY', 'TENANT1')
 * @param role - User role (e.g., 'ADMIN', 'DEALER', 'ACCOUNTANT')
 * @returns Test user credentials
 * @throws Error if credentials are missing
 * 
 * @example
 * const primaryAdmin = getTestUser('PRIMARY', 'ADMIN');
 * const secondaryDealer = getTestUser('SECONDARY', 'DEALER');
 */
export function getTestUser(tenant: string, role: string): TestUser {
  const prefix = `TEST_${tenant}_${role}`;
  
  const email = process.env[`${prefix}_EMAIL`];
  const password = process.env[`${prefix}_PASSWORD`];
  const totpSecret = process.env[`${prefix}_TOTP_SECRET`];
  
  if (!email || !password || !totpSecret) {
    const missing = [];
    if (!email) missing.push(`${prefix}_EMAIL`);
    if (!password) missing.push(`${prefix}_PASSWORD`);
    if (!totpSecret) missing.push(`${prefix}_TOTP_SECRET`);
    
    throw new Error(
      `Missing test user credentials for ${tenant}/${role}:\n` +
      `  Missing variables: ${missing.join(', ')}\n` +
      `  Pattern: TEST_[TENANT]_[ROLE]_[FIELD]\n` +
      `  Expected: TEST_${tenant}_${role}_EMAIL, TEST_${tenant}_${role}_PASSWORD, TEST_${tenant}_${role}_TOTP_SECRET`
    );
  }
  
  return {
    email,
    password,
    totpSecret,
  };
}

/**
 * Get test user with backward compatibility for legacy pattern
 * Falls back to PRIMARY tenant if legacy pattern is used
 * 
 * @param role - User role (e.g., 'ADMIN', 'DEALER')
 * @param tenant - Optional tenant (defaults to 'PRIMARY')
 * @returns Test user credentials
 * 
 * @example
 * const admin = getTestUserByRole('ADMIN'); // Uses PRIMARY tenant
 * const dealer = getTestUserByRole('DEALER', 'SECONDARY'); // Uses SECONDARY tenant
 */
export function getTestUserByRole(role: string, tenant: string = 'PRIMARY'): TestUser {
  // Try new pattern first
  try {
    return getTestUser(tenant, role);
  } catch (error) {
    // Fallback to legacy pattern for backward compatibility
    const legacyPrefix = `TEST_USER_${role}`;
    const email = process.env[`${legacyPrefix}_EMAIL`];
    const password = process.env[`${legacyPrefix}_PASSWORD`];
    const totpSecret = process.env[`${legacyPrefix}_TOTP_SECRET`];
    
    if (email && password && totpSecret) {
      console.warn(
        `⚠️  Using legacy pattern TEST_USER_${role}_* for ${role}. ` +
        `Consider migrating to TEST_${tenant}_${role}_* pattern.`
      );
      return { email, password, totpSecret };
    }
    
    // Re-throw original error if legacy pattern also fails
    throw error;
  }
}

/**
 * Get all available test users for a tenant
 * 
 * @param tenant - Tenant identifier
 * @returns Map of role to test user credentials
 * 
 * @example
 * const primaryUsers = getAllTenantUsers('PRIMARY');
 * // Returns: { ADMIN: {...}, DEALER: {...}, ACCOUNTANT: {...} }
 */
export function getAllTenantUsers(tenant: string): Record<string, TestUser> {
  const users: Record<string, TestUser> = {};
  const roles = ['ADMIN', 'DEALER', 'ACCOUNTANT', 'SALES_MANAGER', 'WAREHOUSE_MANAGER'];
  
  for (const role of roles) {
    try {
      users[role] = getTestUser(tenant, role);
    } catch {
      // Skip roles that don't exist
    }
  }
  
  return users;
}

/**
 * List all available tenants based on environment variables
 * 
 * @returns Array of tenant identifiers found in environment
 * 
 * @example
 * const tenants = getAvailableTenants();
 * // Returns: ['PRIMARY', 'SECONDARY', 'TENANT1']
 */
export function getAvailableTenants(): string[] {
  const tenants = new Set<string>();
  const roles = ['ADMIN', 'DEALER', 'ACCOUNTANT'];
  
  // Scan environment variables for tenant patterns
  for (const [key] of Object.entries(process.env)) {
    if (key.startsWith('TEST_') && key.endsWith('_EMAIL')) {
      // Extract tenant from pattern: TEST_[TENANT]_[ROLE]_EMAIL
      const parts = key.split('_');
      if (parts.length >= 4 && parts[0] === 'TEST') {
        // Skip legacy pattern TEST_USER_*
        if (parts[1] !== 'USER') {
          tenants.add(parts[1]);
        }
      }
    }
  }
  
  return Array.from(tenants).sort();
}

/**
 * Validate that all required test users are configured
 * 
 * @param tenant - Tenant identifier
 * @param requiredRoles - Array of required roles
 * @throws Error if any required role is missing
 * 
 * @example
 * validateTestUsers('PRIMARY', ['ADMIN', 'DEALER']);
 */
export function validateTestUsers(tenant: string, requiredRoles: string[]): void {
  const missing: string[] = [];
  
  for (const role of requiredRoles) {
    try {
      getTestUser(tenant, role);
    } catch {
      missing.push(role);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required test users for tenant ${tenant}:\n` +
      `  Missing roles: ${missing.join(', ')}\n` +
      `  Required pattern: TEST_${tenant}_[ROLE]_EMAIL, TEST_${tenant}_[ROLE]_PASSWORD, TEST_${tenant}_[ROLE]_TOTP_SECRET`
    );
  }
}
