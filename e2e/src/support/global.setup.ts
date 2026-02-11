import { chromium, FullConfig } from '@playwright/test';
import * as TOTP from 'otpauth';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { testContext } from './test-context';

/**
 * Multi-User Global Setup for DAEE Platform E2E Tests
 *
 * Purpose: Pre-authenticate multiple user profiles and save storage state files
 * Benefits:
 * - Tests start already authenticated (faster execution)
 * - Different tests can run as different users (IACS MD, Super Admin, etc.)
 * - Storage state is browser-agnostic (reused across chromium, firefox, webkit)
 *
 * Flow:
 * 1. Load credentials from .env.local for each configured user
 * 2. For each user: launch browser, login, TOTP verify, save to e2e/.auth/{user}.json
 * 3. Tests use appropriate storageState via Playwright project config
 *
 * Auth files created:
 * - admin.json - Super Admin (default for most tests)
 * - iacs-md.json - IACS MD User (for O2C tests)
 */

interface UserCredentials {
  name: string;
  email: string;
  password: string;
  totpSecret: string;
  authFile: string;
  tenant?: string;
  role?: string;
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

  const browser = await chromium.launch({
    headless: process.env.HEADED !== 'true',
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

    // Give a moment for auth state to stabilize
    await page.waitForTimeout(2000);

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

  // Define all user profiles
  const users: UserCredentials[] = [
    // Super Admin (required - default for most tests)
    {
      name: 'Super Admin',
      email: process.env.TEST_PRIMARY_ADMIN_EMAIL || process.env.TEST_USER_ADMIN_EMAIL || '',
      password: process.env.TEST_PRIMARY_ADMIN_PASSWORD || process.env.TEST_USER_ADMIN_PASSWORD || '',
      totpSecret: process.env.TEST_PRIMARY_ADMIN_TOTP_SECRET || process.env.TEST_USER_ADMIN_TOTP_SECRET || '',
      authFile: 'admin.json',
      tenant: 'Demo Tenant',
      role: 'Super Admin',
    },
    // IACS MD User (for O2C tests)
    {
      name: 'IACS MD User',
      email: process.env.IACS_MD_USER_EMAIL || '',
      password: process.env.IACS_MD_USER_PASSWORD || '',
      totpSecret: process.env.IACS_MD_USER_TOTP_SECRET || '',
      authFile: 'iacs-md.json',
      tenant: 'IACS',
      role: 'Managing Director',
    },
  ];

  // Authenticate each user
  let successCount = 0;
  let failureCount = 0;

  for (const user of users) {
    // Skip if credentials not configured
    if (!user.email || !user.password || !user.totpSecret) {
      console.log(`⏭️  Skipping ${user.name} (credentials not configured in .env.local)`);
      failureCount++;
      continue;
    }

    try {
      await authenticateUser(baseURL, user, authDir);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to authenticate ${user.name}:`, (error as Error).message);
      failureCount++;

      // If Super Admin fails, throw error (critical - required for most tests)
      if (user.name === 'Super Admin') {
        throw new Error(
          'Critical: Super Admin authentication failed. Cannot proceed with tests. ' +
            'Ensure web app is running and freshly built. "Failed to find Server Action" may indicate build cache mismatch - restart web app.'
        );
      }
    }
  }

  console.log('\n📊 ===== AUTHENTICATION SUMMARY =====');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed/Skipped: ${failureCount}`);
  console.log('✅ ===== MULTI-USER GLOBAL SETUP COMPLETE =====\n');

  if (successCount === 0) {
    throw new Error('No users authenticated successfully. Check .env.local credentials.');
  }
}

export default globalSetup;
