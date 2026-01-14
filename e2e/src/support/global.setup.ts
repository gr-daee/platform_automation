import { chromium, FullConfig } from '@playwright/test';
import * as TOTP from 'otpauth';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { testContext } from './test-context';

/**
 * Global Setup for DAEE Platform E2E Tests
 * 
 * Purpose: Pre-authenticate an admin user and save storage state
 * Benefits:
 * - Tests start already authenticated (faster execution)
 * - Reduces load on authentication system
 * - Consistent starting point for all tests
 * 
 * Flow:
 * 1. Load admin credentials from .env.local
 * 2. Launch browser and navigate to login
 * 3. Fill email/password and submit
 * 4. Wait for TOTP verification step
 * 5. Generate TOTP code using otpauth library
 * 6. Enter TOTP code and verify
 * 7. Wait for successful redirect to /notes
 * 8. Save authentication state to e2e/.auth/admin.json
 */

async function globalSetup(config: FullConfig) {
  console.log('\n🔧 ===== GLOBAL SETUP START =====\n');
  
  // Clean up screenshots from previous test runs before starting
  // This ensures screenshots from run 1 don't appear in run 2 (even in quick successions)
  testContext.cleanupAllScreenshots();
  
  // Load environment variables
  dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });
  
  const baseURL = process.env.TEST_BASE_URL || config.use?.baseURL || 'http://localhost:3000';
  
  // Support both new multi-tenant pattern and legacy pattern
  const adminEmail = process.env.TEST_PRIMARY_ADMIN_EMAIL || process.env.TEST_USER_ADMIN_EMAIL;
  const adminPassword = process.env.TEST_PRIMARY_ADMIN_PASSWORD || process.env.TEST_USER_ADMIN_PASSWORD;
  const adminTotpSecret = process.env.TEST_PRIMARY_ADMIN_TOTP_SECRET || process.env.TEST_USER_ADMIN_TOTP_SECRET;
  
  // Validate required environment variables
  if (!adminEmail || !adminPassword || !adminTotpSecret) {
    throw new Error(
      '❌ Admin credentials missing from .env.local:\n' +
      `  TEST_PRIMARY_ADMIN_EMAIL (or TEST_USER_ADMIN_EMAIL): ${adminEmail ? '✓' : '✗'}\n` +
      `  TEST_PRIMARY_ADMIN_PASSWORD (or TEST_USER_ADMIN_PASSWORD): ${adminPassword ? '✓' : '✗'}\n` +
      `  TEST_PRIMARY_ADMIN_TOTP_SECRET (or TEST_USER_ADMIN_TOTP_SECRET): ${adminTotpSecret ? '✓' : '✗'}\n` +
      'Please check your .env.local file.\n' +
      'See docs/framework/setup/ENV_VARIABLE_ORGANIZATION.md for multi-tenant pattern.'
    );
  }
  
  console.log('📧 Admin Email:', adminEmail);
  console.log('🔐 TOTP Secret:', adminTotpSecret.substring(0, 4) + '...');
  console.log('🌐 Base URL:', baseURL);
  
  // Ensure .auth directory exists
  const authDir = path.resolve(__dirname, '../../.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
    console.log('📁 Created .auth directory');
  }
  
  // Launch browser for authentication
  console.log('\n🚀 Launching browser...');
  const browser = await chromium.launch({
    headless: process.env.HEADED !== 'true',
  });
  
  const context = await browser.newContext({
    baseURL,
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to login page
    console.log('📍 Navigating to login page...');
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    
    // Wait for login form to be visible
    console.log('⏳ Waiting for login form...');
    await page.waitForSelector('input#email', { state: 'visible', timeout: 10000 });
    
    // Fill in credentials
    console.log('✍️  Filling email...');
    await page.locator('input#email').fill(adminEmail);
    
    console.log('✍️  Filling password...');
    await page.locator('input#password').fill(adminPassword);
    
    // Submit login form
    // Use form context to get the submit button (not Google sign-in)
    console.log('🔘 Clicking Sign In button...');
    const signInButton = page.locator('form').getByRole('button', { name: 'Sign In', exact: true });
    await signInButton.click();
    
    // Wait for TOTP verification step
    console.log('⏳ Waiting for TOTP verification step...');
    await page.waitForSelector('input#totp-code, input#verify-code', {
      state: 'visible',
      timeout: 15000,
    });
    
    console.log('✅ TOTP verification step reached');
    
    // Generate TOTP code
    console.log('🔢 Generating TOTP code...');
    const totp = new TOTP.TOTP({
      issuer: 'DAEE',
      label: adminEmail,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: adminTotpSecret,
    });
    
    const totpCode = totp.generate();
    console.log('🔑 TOTP Code generated:', totpCode.replace(/./g, '*'));
    
    // Enter TOTP code
    console.log('✍️  Entering TOTP code...');
    const totpInput = page.locator('input#totp-code, input#verify-code').first();
    await totpInput.fill(totpCode);
    
    // Submit TOTP verification
    console.log('🔘 Clicking Verify button...');
    const verifyButton = page.getByRole('button', { name: /Verify/i }).first();
    await verifyButton.click();
    
    // Wait for successful authentication
    console.log('⏳ Waiting for authentication to complete...');
    
    // Wait for either success message or redirect to /notes
    try {
      await Promise.race([
        page.waitForURL('**/notes', { timeout: 15000 }),
        page.waitForSelector('text=Welcome!', { state: 'visible', timeout: 15000 }),
      ]);
      console.log('✅ Authentication successful!');
    } catch (error) {
      // Take screenshot for debugging
      const screenshotPath = path.resolve(__dirname, '../../.auth/setup-failure.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.error('📸 Screenshot saved:', screenshotPath);
      throw new Error('Failed to verify successful authentication. Check screenshot.');
    }
    
    // Give a moment for auth state to stabilize
    await page.waitForTimeout(2000);
    
    // Verify we're on the expected page
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    
    if (!currentUrl.includes('/notes')) {
      console.warn('⚠️  Warning: Expected to be on /notes page, but currently on:', currentUrl);
    }
    
    // Save storage state
    const storageStatePath = path.resolve(__dirname, '../../.auth/admin.json');
    await context.storageState({ path: storageStatePath });
    console.log('💾 Storage state saved:', storageStatePath);
    
    // Verify storage state was created
    if (!fs.existsSync(storageStatePath)) {
      throw new Error('❌ Failed to save storage state file');
    }
    
    const statSize = fs.statSync(storageStatePath).size;
    console.log('📊 Storage state size:', statSize, 'bytes');
    
    if (statSize < 100) {
      throw new Error('❌ Storage state file is too small, authentication may have failed');
    }
    
    console.log('\n✅ ===== GLOBAL SETUP COMPLETE =====\n');
    
  } catch (error: any) {
    console.error('\n❌ ===== GLOBAL SETUP FAILED =====');
    console.error('Error:', error.message);
    
    // Take screenshot for debugging
    try {
      const screenshotPath = path.resolve(__dirname, '../../.auth/setup-error.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.error('📸 Error screenshot saved:', screenshotPath);
    } catch (screenshotError) {
      console.error('Failed to save error screenshot:', screenshotError);
    }
    
    throw error;
  } finally {
    await browser.close();
    console.log('🔒 Browser closed');
  }
}

export default globalSetup;
