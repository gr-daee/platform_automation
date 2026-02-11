import { chromium, FullConfig } from '@playwright/test';
import * as TOTP from 'otpauth';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { testContext } from './test-context';

/**
 * Multi-User Global Setup for DAEE Platform
 *
 * NOTE: The canonical implementation is in global.setup.ts which is wired in playwright.config.
 * This file is kept for reference. Selectors match AnimatedLoginFlow.tsx (input#totp-code, input#verify-code).
 *
 * Creates separate authentication files for different users/tenants/roles:
 * - admin.json - Super Admin (system-level access)
 * - iacs-md.json - IACS MD User (tenant: IACS, role: MD)
 *
 * Each test uses storageState via Playwright project config (testMatch determines which auth file).
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
  user: UserCredentials
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

    // Wait for login form (use IDs from AnimatedLoginFlow)
    console.log('⏳ Waiting for login form...');
    await page.waitForSelector('input#email', { state: 'visible', timeout: 10000 });

    // Fill credentials
    console.log('✍️  Filling email...');
    await page.locator('input#email').fill(user.email);
    await page.locator('input#password').fill(user.password);

    // Click Sign In - use form context for stability
    console.log('🔘 Clicking Sign In button...');
    const signInButton = page.locator('form').getByRole('button', { name: 'Sign In', exact: true });
    await signInButton.click();

    // Wait for TOTP step (totp-setup: #totp-code, totp-verify: #verify-code)
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
    await page.waitForURL(/\/(notes|dashboard|home|o2c)/, { timeout: 15000 });
    console.log('✅ Authentication successful!');
    console.log('📍 Current URL:', page.url());
    
    // Save storage state
    const authDir = path.resolve(__dirname, '../../.auth');
    const authFilePath = path.join(authDir, user.authFile);
    await context.storageState({ path: authFilePath });
    
    const fileSize = fs.statSync(authFilePath).size;
    console.log(`💾 Storage state saved: ${user.authFile}`);
    console.log(`📊 Storage state size: ${fileSize} bytes`);
    
    await browser.close();
    console.log(`✅ ${user.name} authentication complete!\n`);
  } catch (error) {
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
    // Super Admin (legacy/default)
    {
      name: 'Super Admin',
      email: process.env.TEST_PRIMARY_ADMIN_EMAIL || process.env.TEST_USER_ADMIN_EMAIL || '',
      password: process.env.TEST_PRIMARY_ADMIN_PASSWORD || process.env.TEST_USER_ADMIN_PASSWORD || '',
      totpSecret: process.env.TEST_PRIMARY_ADMIN_TOTP_SECRET || process.env.TEST_USER_ADMIN_TOTP_SECRET || '',
      authFile: 'admin.json',
      tenant: 'Demo Tenant',
      role: 'Super Admin',
    },
    // IACS MD User
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
      await authenticateUser(baseURL, user);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to authenticate ${user.name}:`, error);
      failureCount++;
      
      // If Super Admin fails, throw error (critical)
      if (user.name === 'Super Admin') {
        throw new Error(`Critical: Super Admin authentication failed. Cannot proceed with tests.`);
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
