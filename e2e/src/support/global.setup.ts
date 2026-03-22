import { chromium, FullConfig } from '@playwright/test';
import * as TOTP from 'otpauth';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { testContext } from './test-context';
import { 
  getUserProfile, 
  getProfilesToAuthenticate, 
  hasProfile,
  displayProfilesSummary,
  type UserProfile 
} from './config/user-profiles.config';

/**
 * Clean up previous test reports and artifacts
 * Similar to Extent Reports cleanup - ensures fresh start for each test run
 * 
 * Configuration:
 * - CLEAN_ALLURE_RESULTS=true: Clean allure-results/ (fresh start, no accumulation)
 * - CLEAN_ALLURE_RESULTS=false or unset: Keep allure-results/ (accumulate results)
 * - Always cleans: allure-report/, playwright-report/, test-results/ (generated reports)
 */
function cleanupPreviousReports(): void {
  const projectRoot = path.resolve(__dirname, '../../../');
  const cleanAllureResults = process.env.CLEAN_ALLURE_RESULTS === 'true';
  
  // Always clean generated reports (HTML reports)
  const reportDirsToClean = [
    path.join(projectRoot, 'allure-report'),
    path.join(projectRoot, 'playwright-report'),
    path.join(projectRoot, 'test-results'),
  ];

  // Conditionally clean raw results based on env var
  if (cleanAllureResults) {
    reportDirsToClean.push(path.join(projectRoot, 'allure-results'));
  }

  console.log('🧹 Cleaning up previous test reports and artifacts...');
  if (cleanAllureResults) {
    console.log('   ℹ️  CLEAN_ALLURE_RESULTS=true - Starting fresh (no result accumulation)');
  } else {
    console.log('   ℹ️  Allure results will accumulate (set CLEAN_ALLURE_RESULTS=true for fresh start)');
  }

  reportDirsToClean.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`   ✅ Cleaned: ${path.basename(dir)}/`);
      } catch (error) {
        console.warn(`   ⚠️  Failed to clean ${path.basename(dir)}/:`, (error as Error).message);
      }
    }
  });

  // Recreate directories that are needed
  const requiredDirs = [
    path.join(projectRoot, 'allure-results'),
    path.join(projectRoot, 'test-results'),
  ];

  requiredDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  console.log('✅ Cleanup complete\n');
}

/**
 * Multi-User Global Setup for DAEE Platform E2E Tests
 *
 * Purpose: Pre-authenticate multiple user profiles and save storage state files
 * Benefits:
 * - Tests start already authenticated (faster execution)
 * - Different tests can run as different users (role-based routing)
 * - Storage state is browser-agnostic (reused across chromium, firefox, webkit)
 * - Scalable to N tenants × M roles
 *
 * Flow:
 * 1. Load user profiles from config/user-profiles.config.ts
 * 2. Determine which profiles to authenticate (env var or all)
 * 3. For each profile: launch browser, login, TOTP verify, save storage state
 * 4. Tests use appropriate storageState via Playwright project config (tag-based routing)
 *
 * Configuration:
 * - User profiles: e2e/src/support/config/user-profiles.config.ts
 * - Env variables: .env.local (per-profile credentials)
 * - Selective auth: TEST_AUTH_PROFILES=iacs-md,super-admin (optional)
 *
 * Auth files created (dynamic based on profiles):
 * - admin.json - Super Admin (cross-tenant)
 * - iacs-md.json - IACS MD User (O2C primary)
 * - iacs-finance-admin.json - IACS Finance Admin (Finance primary)
 * - iacs-warehouse-manager.json - IACS Warehouse Manager (Warehouse primary)
 * - demo-admin.json - Demo Tenant Admin
 * - (more as configured in user-profiles.config.ts)
 */

interface UserCredentials {
  name: string;
  email: string;
  password: string;
  totpSecret: string;
  authFile: string;
  tenant?: string;
  role?: string;
  permissions?: string[];
}

function getCliArgValues(flagName: string): string[] {
  const values: string[] = [];
  for (let i = 0; i < process.argv.length; i += 1) {
    const token = process.argv[i];
    if (token === flagName) {
      const next = process.argv[i + 1];
      if (next && !next.startsWith('-')) values.push(next);
      continue;
    }
    if (token.startsWith(`${flagName}=`)) {
      values.push(token.slice(flagName.length + 1));
    }
  }
  return values.flatMap(v => v.split(',').map(p => p.trim()).filter(Boolean));
}

function detectEdRequirementFromSelection(): boolean {
  const grepTokens = [...getCliArgValues('--grep'), ...getCliArgValues('-g')].join(' ');
  if (/P2P-P4-TC-003|requires-iacs-ed|@iacs-ed|FIN-AR-TC-009|FIN-DL-TC-008|FIN-CM-TC-022/i.test(grepTokens)) return true;

  const featurePaths = process.argv.filter(arg => arg.endsWith('.feature'));
  for (const featurePath of featurePaths) {
    try {
      const content = fs.readFileSync(featurePath, 'utf8');
      if (/@requires-iacs-ed/i.test(content)) return true;
    } catch {
      // Ignore unreadable paths and continue detection.
    }
  }

  return false;
}

function getProfilesToAuthenticateForCurrentRun(): string[] {
  // Explicit env override always wins.
  if (process.env.TEST_AUTH_PROFILES) {
    return getProfilesToAuthenticate();
  }

  const selectedProjects = getCliArgValues('--project');
  const profiles = new Set<string>();

  // Map selected projects to their primary auth profiles.
  if (selectedProjects.length === 0 || selectedProjects.includes('iacs-md')) {
    if (hasProfile('iacs-md')) profiles.add('iacs-md');
  }
  if (selectedProjects.length === 0 || selectedProjects.includes('iacs-ed')) {
    if (hasProfile('iacs-ed')) profiles.add('iacs-ed');
  }
  if (selectedProjects.includes('iacs-finance') || selectedProjects.includes('multi-user-iacs-finance')) {
    if (hasProfile('iacs-finance-admin')) profiles.add('iacs-finance-admin');
  }
  if (selectedProjects.includes('iacs-warehouse') || selectedProjects.includes('multi-user-iacs-warehouse')) {
    if (hasProfile('iacs-warehouse-manager')) profiles.add('iacs-warehouse-manager');
  }
  if (selectedProjects.includes('super-admin') || selectedProjects.includes('multi-user-super-admin')) {
    if (hasProfile('super-admin')) profiles.add('super-admin');
  }

  // Secondary approver session is only needed for tagged scenarios.
  if (detectEdRequirementFromSelection() && hasProfile('iacs-ed')) {
    profiles.add('iacs-ed');
  }

  // Safe fallback if no mapping matched.
  if (profiles.size === 0) {
    return getProfilesToAuthenticate().filter(p => p !== 'iacs-ed');
  }

  return [...profiles];
}

async function authenticateUser(
  baseURL: string,
  user: UserCredentials,
  authDir: string
): Promise<void> {
  console.log(`\n🔐 Authenticating: ${user.name}`);
  console.log(`📧 Email: ${user.email}`);
  if (user.tenant) console.log(`🏢 Tenant: ${user.tenant}`);
  if (user.role) console.log(`👤 Role: ${user.role}`);

  // In this repo, npm scripts set TEST_HEADED=true (not HEADED).
  // Treat either env as an indicator that we should launch headed browsers during auth setup.
  const headed = process.env.HEADED === 'true' || process.env.TEST_HEADED === 'true';
  const browser = await chromium.launch({
    headless: !headed,
  });

  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  try {
    // Navigate to login
    console.log('📍 Navigating to login page...');
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // Wait for login form
    console.log('⏳ Waiting for login form...');
    await page.waitForSelector('input#email', { state: 'visible', timeout: 10000 });

    // Fill credentials
    console.log('✍️  Filling email...');
    await page.locator('input#email').fill(user.email);
    console.log('✍️  Filling password...');
    await page.locator('input#password').fill(user.password);

    // Click Sign In - use form context for stability
    console.log('🔘 Clicking Sign In button...');
    const signInButton = page.locator('form').getByRole('button', { name: 'Sign In', exact: true });
    await signInButton.click();

    // Wait for TOTP step - use IDs from AnimatedLoginFlow (totp-setup uses #totp-code, totp-verify uses #verify-code)
    console.log('⏳ Waiting for TOTP verification step...');
    await page.waitForSelector('input#totp-code, input#verify-code', {
      state: 'visible',
      timeout: 15000,
    });
    console.log('✅ TOTP verification step reached');

    // Generate TOTP
    console.log('🔢 Generating TOTP code...');
    const totp = new TOTP.TOTP({
      issuer: 'DAEE',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: user.totpSecret,
    });
    const totpCode = totp.generate();
    console.log('🔑 TOTP Code generated: ******');

    // Enter TOTP
    console.log('✍️  Entering TOTP code...');
    const totpInput = page.locator('input#totp-code, input#verify-code').first();
    await totpInput.fill(totpCode);

    // Click Verify
    console.log('🔘 Clicking Verify button...');
    const verifyButton = page.getByRole('button', { name: /Verify/i }).first();
    await verifyButton.click();

    // Wait for authentication
    console.log('⏳ Waiting for authentication to complete...');
    try {
      await Promise.race([
        page.waitForURL(/\/(notes|dashboard|home|o2c)/, { timeout: 15000 }),
        page.waitForSelector('text=Welcome!', { state: 'visible', timeout: 15000 }),
      ]);
      console.log('✅ Authentication successful!');
    } catch (error) {
      const screenshotPath = path.join(authDir, `setup-failure-${user.authFile.replace('.json', '')}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.error('📸 Screenshot saved:', screenshotPath);
      throw new Error(`Failed to verify authentication for ${user.name}. Check screenshot.`);
    }

    console.log('📍 Current URL:', page.url());

    // Wait for network to settle so auth state is stable before saving storage
    await page.waitForLoadState('networkidle');

    // Save storage state
    const authFilePath = path.join(authDir, user.authFile);
    await context.storageState({ path: authFilePath });

    const fileSize = fs.statSync(authFilePath).size;
    console.log(`💾 Storage state saved: ${user.authFile}`);
    console.log(`📊 Storage state size: ${fileSize} bytes`);

    if (fileSize < 100) {
      throw new Error('❌ Storage state file is too small, authentication may have failed');
    }

    await browser.close();
    console.log(`✅ ${user.name} authentication complete!\n`);
  } catch (error: unknown) {
    const screenshotPath = path.join(authDir, `setup-error-${user.authFile.replace('.json', '')}.png`);
    try {
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.error('📸 Error screenshot saved:', screenshotPath);
    } catch (screenshotError) {
      console.error('Failed to save error screenshot:', screenshotError);
    }
    await browser.close();
    throw error;
  }
}

async function globalSetup(config: FullConfig) {
  console.log('\n🔧 ===== MULTI-USER GLOBAL SETUP START =====\n');

  // Clean up reports and artifacts from previous test runs (like Extent Reports cleanup)
  cleanupPreviousReports();

  // Clean up screenshots from previous test runs
  testContext.cleanupAllScreenshots();

  // Load environment variables
  dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });

  const baseURL = process.env.TEST_BASE_URL || config.use?.baseURL || 'http://localhost:3000';
  console.log('🌐 Base URL:', baseURL);

  // Ensure .auth directory exists
  const authDir = path.resolve(__dirname, '../../.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
    console.log('📁 Created .auth directory');
  }

  // Display available profiles
  displayProfilesSummary();

  // Get profiles to authenticate (from env override or run-aware defaults)
  const profilesToAuth = getProfilesToAuthenticateForCurrentRun();
  console.log(`🎯 Authenticating ${profilesToAuth.length} profile(s): ${profilesToAuth.join(', ')}\n`);

  // Convert profiles to UserCredentials format
  const users: UserCredentials[] = profilesToAuth.map(profileId => {
    try {
      const profile = getUserProfile(profileId);
      return {
        name: profile.displayName,
        email: profile.email,
        password: profile.password,
        totpSecret: profile.totpSecret,
        authFile: path.basename(profile.storageStatePath),
        tenant: profile.tenant,
        role: profile.role,
        permissions: profile.permissions,
      };
    } catch (error) {
      console.error(`❌ Error loading profile '${profileId}':`, (error as Error).message);
      throw error;
    }
  });

  // Authenticate each user
  let successCount = 0;
  let failureCount = 0;
  const failedProfiles: string[] = [];

  for (const user of users) {
    // Skip if credentials not configured
    if (!user.email || !user.password || !user.totpSecret) {
      console.log(`⏭️  Skipping ${user.name} (credentials not configured in .env.local)`);
      failureCount++;
      failedProfiles.push(user.name);
      continue;
    }

    try {
      await authenticateUser(baseURL, user, authDir);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to authenticate ${user.name}:`, (error as Error).message);
      failureCount++;
      failedProfiles.push(user.name);

      // TODO: Re-enable Super Admin check after 4-5 weeks when super-admin profile is active
      // If Super Admin fails, throw error (critical - required for most tests)
      // if (user.name === 'Super Admin') {
      //   throw new Error(
      //     'Critical: Super Admin authentication failed. Cannot proceed with tests. ' +
      //       'Ensure web app is running and freshly built. "Failed to find Server Action" may indicate build cache mismatch - restart web app.'
      //   );
      // }
    }
  }

  console.log('\n📊 ===== AUTHENTICATION SUMMARY =====');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed/Skipped: ${failureCount}`);
  if (failedProfiles.length > 0) {
    console.log(`⚠️  Failed profiles: ${failedProfiles.join(', ')}`);
  }
  console.log('✅ ===== MULTI-USER GLOBAL SETUP COMPLETE =====\n');

  if (successCount === 0) {
    throw new Error('No users authenticated successfully. Check .env.local credentials.');
  }
}

export default globalSetup;
