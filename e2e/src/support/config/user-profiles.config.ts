/**
 * User Profile Configuration System
 * 
 * Manages multi-tenant, multi-role user authentication for E2E tests.
 * Supports N tenants × M roles scalability.
 * 
 * Usage:
 * - getUserProfile('iacs-md') - Get specific profile
 * - getProfilesByTenant('IACS') - Get all IACS users
 * - getProfilesByRole('Finance Admin') - Get all finance admins
 */

export interface UserProfile {
  id: string;
  email: string;
  password: string;
  totpSecret: string;
  tenant: string;
  role: string;
  displayName: string;
  storageStatePath: string;
  permissions: string[];
  testDataScope: string; // For data isolation
  description?: string;
}

/**
 * User Profile Matrix
 * Add new users here to scale testing across roles and tenants
 * 
 * TEMPORARY LIMITATION (Feb 2026):
 * - Currently only 'iacs-md' is active
 * - Other profiles commented out to reduce complexity during initial test development
 * - Will be re-enabled in 4-5 weeks when we have a sizable number of tests
 * - To re-enable: Uncomment the profiles below and ensure .env.local has credentials
 */
export const USER_PROFILES: Record<string, UserProfile> = {
  // ==========================================
  // IACS Tenant Users
  // ==========================================
  
  'iacs-md': {
    id: 'iacs-md',
    email: process.env.IACS_MD_USER_EMAIL!,
    password: process.env.IACS_MD_USER_PASSWORD!,
    totpSecret: process.env.IACS_MD_USER_TOTP_SECRET!,
    tenant: 'IACS',
    role: 'Managing Director',
    displayName: 'IACS MD User',
    storageStatePath: 'e2e/.auth/iacs-md.json',
    permissions: ['o2c:*', 'finance:read', 'warehouse:read'],
    testDataScope: 'iacs',
    description: 'Managing Director with full O2C access, read-only Finance and Warehouse',
  },
  
  // TODO: Re-enable after 4-5 weeks when we have more tests
  // 'iacs-finance-admin': {
  //   id: 'iacs-finance-admin',
  //   email: process.env.IACS_FINANCE_ADMIN_EMAIL || 'finance.admin@iacs.com',
  //   password: process.env.IACS_FINANCE_ADMIN_PASSWORD || 'SecurePassword123!',
  //   totpSecret: process.env.IACS_FINANCE_ADMIN_TOTP_SECRET || 'JBSWY3DPEHPK3PXP',
  //   tenant: 'IACS',
  //   role: 'Finance Admin',
  //   displayName: 'IACS Finance Admin',
  //   storageStatePath: 'e2e/.auth/iacs-finance-admin.json',
  //   permissions: ['finance:*', 'o2c:read'],
  //   testDataScope: 'iacs',
  //   description: 'Finance Admin with full Finance module access, read-only O2C',
  // },
  
  // TODO: Re-enable after 4-5 weeks when we have more tests
  // 'iacs-warehouse-manager': {
  //   id: 'iacs-warehouse-manager',
  //   email: process.env.IACS_WAREHOUSE_MANAGER_EMAIL || 'warehouse@iacs.com',
  //   password: process.env.IACS_WAREHOUSE_MANAGER_PASSWORD || 'SecurePassword123!',
  //   totpSecret: process.env.IACS_WAREHOUSE_MANAGER_TOTP_SECRET || 'JBSWY3DPEHPK3PXP',
  //   tenant: 'IACS',
  //   role: 'Warehouse Manager',
  //   displayName: 'IACS Warehouse Manager',
  //   storageStatePath: 'e2e/.auth/iacs-warehouse-manager.json',
  //   permissions: ['warehouse:*', 'o2c:read'],
  //   testDataScope: 'iacs',
  //   description: 'Warehouse Manager with full Warehouse access, read-only O2C',
  // },
  
  // ==========================================
  // Demo Tenant Users
  // ==========================================
  
  // TODO: Re-enable after 4-5 weeks when we have more tests
  // 'demo-admin': {
  //   id: 'demo-admin',
  //   email: process.env.DEMO_ADMIN_EMAIL || 'admin@demo.com',
  //   password: process.env.DEMO_ADMIN_PASSWORD || 'SecurePassword123!',
  //   totpSecret: process.env.DEMO_ADMIN_TOTP_SECRET || 'JBSWY3DPEHPK3PXP',
  //   tenant: 'Demo Tenant',
  //   role: 'Super Admin',
  //   displayName: 'Demo Admin',
  //   storageStatePath: 'e2e/.auth/demo-admin.json',
  //   permissions: ['*:*'],
  //   testDataScope: 'demo',
  //   description: 'Super Admin for Demo Tenant with all permissions',
  // },
  
  // TODO: Re-enable after 4-5 weeks when we have more tests
  // 'demo-finance-manager': {
  //   id: 'demo-finance-manager',
  //   email: process.env.DEMO_FINANCE_MANAGER_EMAIL || 'finance@demo.com',
  //   password: process.env.DEMO_FINANCE_MANAGER_PASSWORD || 'SecurePassword123!',
  //   totpSecret: process.env.DEMO_FINANCE_MANAGER_TOTP_SECRET || 'JBSWY3DPEHPK3PXP',
  //   tenant: 'Demo Tenant',
  //   role: 'Finance Manager',
  //   displayName: 'Demo Finance Manager',
  //   storageStatePath: 'e2e/.auth/demo-finance-manager.json',
  //   permissions: ['finance:*'],
  //   testDataScope: 'demo',
  //   description: 'Finance Manager for Demo Tenant with finance-only access',
  // },
  
  // ==========================================
  // Super Admin (Cross-Tenant)
  // ==========================================
  
  // TODO: Re-enable after 4-5 weeks when we have more tests
  // 'super-admin': {
  //   id: 'super-admin',
  //   email: process.env.TEST_PRIMARY_ADMIN_EMAIL!,
  //   password: process.env.TEST_PRIMARY_ADMIN_PASSWORD!,
  //   totpSecret: process.env.TEST_PRIMARY_ADMIN_TOTP_SECRET!,
  //   tenant: 'Demo Tenant',
  //   role: 'Super Admin',
  //   displayName: 'Super Admin',
  //   storageStatePath: 'e2e/.auth/admin.json',
  //   permissions: ['*:*'],
  //   testDataScope: 'global',
  //   description: 'Global Super Admin with access to all tenants and modules',
  // },
};

/**
 * Get user profile by ID
 * @throws Error if profile not found
 */
export function getUserProfile(profileId: string): UserProfile {
  const profile = USER_PROFILES[profileId];
  
  if (!profile) {
    const availableProfiles = Object.keys(USER_PROFILES).join(', ');
    throw new Error(
      `User profile '${profileId}' not found.\n` +
      `Available profiles: ${availableProfiles}`
    );
  }
  
  // Validate required env vars
  if (!profile.email || !profile.password || !profile.totpSecret) {
    throw new Error(
      `Missing environment variables for profile '${profileId}'.\n` +
      `Required: ${profileId.toUpperCase()}_EMAIL, ${profileId.toUpperCase()}_PASSWORD, ${profileId.toUpperCase()}_TOTP_SECRET`
    );
  }
  
  return profile;
}

/**
 * Get all profiles for a specific tenant
 */
export function getProfilesByTenant(tenant: string): UserProfile[] {
  return Object.values(USER_PROFILES).filter(p => p.tenant === tenant);
}

/**
 * Get all profiles for a specific role
 */
export function getProfilesByRole(role: string): UserProfile[] {
  return Object.values(USER_PROFILES).filter(p => p.role === role);
}

/**
 * Get all profile IDs
 */
export function getAllProfileIds(): string[] {
  return Object.keys(USER_PROFILES);
}

/**
 * Check if profile exists
 */
export function hasProfile(profileId: string): boolean {
  return profileId in USER_PROFILES;
}

/**
 * Get profiles to authenticate (from env var or all)
 */
export function getProfilesToAuthenticate(): string[] {
  const envProfiles = process.env.TEST_AUTH_PROFILES;
  
  if (envProfiles) {
    const requestedProfiles = envProfiles.split(',').map(p => p.trim());
    const invalidProfiles = requestedProfiles.filter(p => !hasProfile(p));
    
    if (invalidProfiles.length > 0) {
      throw new Error(
        `Invalid profile(s) in TEST_AUTH_PROFILES: ${invalidProfiles.join(', ')}\n` +
        `Available: ${getAllProfileIds().join(', ')}`
      );
    }
    
    return requestedProfiles;
  }
  
  // Default: authenticate all profiles
  return getAllProfileIds();
}

/**
 * Display user profiles summary
 */
export function displayProfilesSummary(): void {
  console.log('\n📋 Available User Profiles:\n');
  
  const tenants = [...new Set(Object.values(USER_PROFILES).map(p => p.tenant))];
  
  tenants.forEach(tenant => {
    console.log(`🏢 ${tenant}:`);
    const tenantProfiles = getProfilesByTenant(tenant);
    tenantProfiles.forEach(profile => {
      console.log(`   - ${profile.displayName} (${profile.role})`);
      console.log(`     ID: ${profile.id}`);
      console.log(`     Permissions: ${profile.permissions.join(', ')}`);
      console.log(`     Storage: ${profile.storageStatePath}`);
    });
    console.log('');
  });
}
