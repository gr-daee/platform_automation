import { chromium } from '@playwright/test';
import * as TOTP from 'otpauth';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

/**
 * Multi-User Authentication Setup
 * 
 * Creates separate storage state files for different user profiles:
 * - admin.json - Super Admin (default for most tests)
 * - iacs-md.json - IACS MD User (for O2C tests)
 * - finance.json - Finance Manager (for finance tests)
 * - warehouse.json - Warehouse Manager (for warehouse tests)
 * 
 * Usage in playwright.config.ts:
 * storageState: 'e2e/.auth/iacs-md.json'
 */

interface UserProfile {
  name: string;
  emailEnv: string;
  passwordEnv: string;
  totpSecretEnv: string;
  filename: string;
}

const USER_PROFILES: UserProfile[] = [
  {
    name: 'Super Admin',
    emailEnv: 'TEST_PRIMARY_ADMIN_EMAIL',
    passwordEnv: 'TEST_PRIMARY_ADMIN_PASSWORD',
    totpSecretEnv: 'TEST_PRIMARY_ADMIN_TOTP_SECRET',
    filename: 'admin.json',
  },
  {
    name: 'IACS MD User',
    emailEnv: 'IACS_MD_USER_EMAIL',
    passwordEnv: 'IACS_MD_USER_PASSWORD',
    totpSecretEnv: 'IACS_MD_USER_TOTP_SECRET',
    filename: 'iacs-md.json',
  },
];

async function authenticateUser(
  baseURL: string,
  email: string,
  password: string,
  totpSecret: string,
  profileName: string
): Promise<any> {
  console.log(`\n🔐 Authenticating: ${profileName} (${email})`);
  
  const browser = await chromium.launch({
    headless: process.env.HEADED !== 'true',
  });
  
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  
  try {
    // Navigate to login
    console.log('📍 Navigating to login page...');
    await page.goto('/login');
    
    // Wait for login form
    console.log('⏳ Waiting for login form...');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    // Fill credentials
    console.log('✍️  Filling credentials...');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    
    // Click Sign In
    console.log('🔘 Clicking Sign In button...');
    await page.click('button[type="submit"]:has-text("Sign In")');
    
    // Wait for TOTP step
    console.log('⏳ Waiting for TOTP verification step...');
    await page.waitForSelector('input[placeholder*="6-digit"]', { timeout: 10000 });
    console.log('✅ TOTP verification step reached');
    
    // Generate TOTP
    console.log('🔢 Generating TOTP code...');
    const totp = new TOTP.TOTP({
      issuer: 'DAEE',
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: totpSecret,
    });
    const totpCode = totp.generate();
    console.log('🔑 TOTP Code generated: ******');
    
    // Enter TOTP
    console.log('✍️  Entering TOTP code...');
    await page.fill('input[placeholder*="6-digit"]', totpCode);
    
    // Click Verify
    console.log('🔘 Clicking Verify button...');
    await page.click('button[type="submit"]:has-text("Verify")');
    
    // Wait for authentication
    console.log('⏳ Waiting for authentication to complete...');
    await page.waitForURL(/\/(notes|dashboard|home)/, { timeout: 15000 });
    console.log('✅ Authentication successful!');
    console.log('📍 Current URL:', page.url());
    
    // Save storage state
    const storageState = await context.storageState();
    await browser.close();
    
    return storageState;
  } catch (error) {
    await browser.close();
    throw error;
  }
}

export async function setupAuthProfiles(baseURL: string = 'http://localhost:3000') {
  console.log('\n🔧 ===== MULTI-USER AUTH SETUP START =====\n');
  
  // Load environment variables
  dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });
  
  // Ensure .auth directory exists
  const authDir = path.resolve(__dirname, '../../.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
    console.log('📁 Created .auth directory');
  }
  
  // Authenticate each user profile
  for (const profile of USER_PROFILES) {
    const email = process.env[profile.emailEnv];
    const password = process.env[profile.passwordEnv];
    const totpSecret = process.env[profile.totpSecretEnv];
    
    if (!email || !password || !totpSecret) {
      console.log(`⏭️  Skipping ${profile.name} (credentials not configured)`);
      continue;
    }
    
    try {
      const storageState = await authenticateUser(
        baseURL,
        email,
        password,
        totpSecret,
        profile.name
      );
      
      // Save to file
      const authFile = path.join(authDir, profile.filename);
      fs.writeFileSync(authFile, JSON.stringify(storageState, null, 2));
      
      const fileSize = fs.statSync(authFile).size;
      console.log(`💾 Storage state saved: ${authFile}`);
      console.log(`📊 File size: ${fileSize} bytes`);
      console.log(`✅ ${profile.name} authentication complete!\n`);
    } catch (error) {
      console.error(`❌ Failed to authenticate ${profile.name}:`, error);
      // Continue with other profiles
    }
  }
  
  console.log('✅ ===== MULTI-USER AUTH SETUP COMPLETE =====\n');
}

// Export for use in global setup
export default async function globalSetup() {
  const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000';
  await setupAuthProfiles(baseURL);
}
