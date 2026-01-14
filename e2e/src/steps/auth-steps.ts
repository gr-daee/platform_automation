import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { LoginPage } from '../pages/auth/LoginPage';
import {
  getUserByEmail,
  getUserSessions,
  hasUserCompletedMFA,
  getLatestSession,
} from '../support/db-helper';
import { testContext } from '../support/test-context';
import { transactionExtractor } from '../support/transaction-extractor';
import { logger } from '../support/logger';

/**
 * Step Definitions for Authentication Feature
 * 
 * Implements the "Sandwich Method":
 * 1. DB BEFORE: Query database state before action
 * 2. UI ACTION: Perform user interaction via Page Object
 * 3. DB AFTER: Verify database state changed as expected
 * 
 * Standards:
 * - Use semantic locators via Page Object Model
 * - Read credentials from environment variables
 * - Generate TOTP codes dynamically using otpauth
 * - Verify both UI and database state
 */

const { Given, When, Then } = createBdd();

// Shared state within scenario
let loginPage: LoginPage;
let userEmail: string;
let userId: string;
let initialSessionCount: number;

// ==========================================
// Given Steps (Preconditions)
// ==========================================

Given('I am on the login page', async ({ page }) => {
  const stepName = 'I am on the login page';
  testContext.logStep('Given', stepName);
  
  // Capture screenshot before navigation (debug mode)
  if (testContext.isDebugModeEnabled()) {
    await testContext.captureScreenshot(page, stepName, { action: 'before_navigation' });
  }
  
  loginPage = new LoginPage(page);
  await loginPage.navigateTo();
  
  // Capture screenshot after navigation (debug mode)
  if (testContext.isDebugModeEnabled()) {
    await testContext.captureScreenshot(page, stepName, { action: 'after_navigation' });
  }
  
  logger.info('Navigated to login page');
  console.log('✅ Navigated to login page');
});

// ==========================================
// When Steps (Actions)
// ==========================================

When('I enter valid admin credentials', async ({}) => {
  // Support both new multi-tenant pattern and legacy pattern
  userEmail = process.env.TEST_PRIMARY_ADMIN_EMAIL || process.env.TEST_USER_ADMIN_EMAIL!;
  const password = process.env.TEST_PRIMARY_ADMIN_PASSWORD || process.env.TEST_USER_ADMIN_PASSWORD!;
  
  if (!userEmail || !password) {
    throw new Error(
      'Admin credentials not found in environment variables.\n' +
      'Expected: TEST_PRIMARY_ADMIN_EMAIL (or TEST_USER_ADMIN_EMAIL) and TEST_PRIMARY_ADMIN_PASSWORD (or TEST_USER_ADMIN_PASSWORD)'
    );
  }
  
  console.log('📧 Using admin email:', userEmail);
  
  // 🎬 UI ACTION - No DB check by default (DB validation is optional and added on need basis)
  await loginPage.fillEmail(userEmail);
  await loginPage.fillPassword(password);
  
  console.log('✅ Credentials entered');
});

When('I submit the login form', async ({}) => {
  await loginPage.clickSignIn();
  console.log('✅ Login form submitted');
});

When('I generate and enter a valid TOTP code', async ({}) => {
  // Support both new multi-tenant pattern and legacy pattern
  const totpSecret = process.env.TEST_PRIMARY_ADMIN_TOTP_SECRET || process.env.TEST_USER_ADMIN_TOTP_SECRET!;
  
  if (!totpSecret) {
    throw new Error(
      'Admin TOTP secret not found in environment variables.\n' +
      'Expected: TEST_PRIMARY_ADMIN_TOTP_SECRET (or TEST_USER_ADMIN_TOTP_SECRET)'
    );
  }
  
  console.log('🔢 Generating TOTP code...');
  const totpCode = loginPage.generateTOTPCode(totpSecret, userEmail);
  console.log('🔑 TOTP code generated (masked):', totpCode.replace(/./g, '*'));
  
  await loginPage.fillTOTPCode(totpCode);
  console.log('✅ TOTP code entered');
});

When('I submit the TOTP verification', async ({ page }) => {
  await loginPage.clickVerifyTOTP();
  console.log('✅ TOTP verification submitted');
  
  // Wait a moment for auth state to update
  await page.waitForTimeout(2000);
});

When('I enter an invalid TOTP code {string}', async ({}, invalidCode: string) => {
  console.log('❌ Entering invalid TOTP code:', invalidCode);
  await loginPage.fillTOTPCode(invalidCode);
  console.log('✅ Invalid TOTP code entered');
});

When('I enter admin email {string}', async ({}, email: string) => {
  userEmail = email;
  await loginPage.fillEmail(email);
  console.log('✅ Email entered:', email);
});

When('I enter an incorrect password {string}', async ({}, password: string) => {
  await loginPage.fillPassword(password);
  console.log('✅ Incorrect password entered');
});

When('I submit the login form without entering credentials', async ({}) => {
  // Attempt to submit without filling fields
  await loginPage.clickSignIn();
  console.log('✅ Attempted to submit empty form');
});

// ==========================================
// Then Steps (Assertions)
// ==========================================

Then('I should see the TOTP verification step', async ({ page }) => {
  const stepName = 'I should see the TOTP verification step';
  testContext.logStep('Then', stepName);
  
  // Validation steps ALWAYS capture screenshots (per requirements: "All validation steps should capture screenshot")
  await testContext.captureScreenshot(page, stepName, { action: 'before_validation' });
  
  await loginPage.waitForTOTPStep();
  await loginPage.verifyOnTOTPStep();
  
  // Capture screenshot after validation
  await testContext.captureScreenshot(page, stepName, { action: 'after_validation' });
  
  logger.info('TOTP verification step displayed');
  console.log('✅ TOTP verification step displayed');
});

Then('I should see a success message', async ({ page }) => {
  const stepName = 'I should see a success message';
  testContext.logStep('Then', stepName);
  
  // Capture screenshot before validation
  await testContext.captureScreenshot(page, stepName, { action: 'before_validation' });
  
  // Check for success message or redirect
  await loginPage.waitForSuccessRedirect();
  
  // Try to extract transaction ID if available
  const transactionId = await transactionExtractor.extractTransactionId(page);
  if (transactionId) {
    testContext.addTransactionId(transactionId);
    logger.info('Transaction ID extracted', { transactionId });
  }
  
  // Capture screenshot after validation with transaction ID if found
  await testContext.captureScreenshot(page, stepName, {
    action: 'after_validation',
    transactionId: transactionId || undefined,
  });
  
  logger.info('Success message or redirect detected', transactionId ? { transactionId } : undefined);
  console.log('✅ Success message or redirect detected');
});

Then('I should be redirected to the notes page', async ({ page }) => {
  const stepName = 'I should be redirected to the notes page';
  testContext.logStep('Then', stepName);
  
  // Capture screenshot before validation
  await testContext.captureScreenshot(page, stepName, { action: 'before_validation' });
  
  await loginPage.verifyOnNotesPage();
  
  // Try to extract any ID from URL
  const urlId = await transactionExtractor.extractFromURL(page);
  if (urlId) {
    testContext.addExtractedData('url_id', urlId);
    logger.info('ID extracted from URL', { urlId });
  }
  
  // Capture screenshot after validation
  await testContext.captureScreenshot(page, stepName, {
    action: 'after_validation',
    urlId: urlId || undefined,
  });
  
  logger.info('Redirected to notes page', urlId ? { urlId } : undefined);
  console.log('✅ Redirected to notes page');
});

// DB Validation Step - Available for use when needed
// Uncomment and add to feature file when DB validation is required for specific tests
// 
// Then('the user session should be authenticated in the database', async ({}) => {
//   // 🥪 SANDWICH METHOD - DB AFTER
//   console.log('🔍 [DB AFTER] Verifying authentication in database...');
//   
//   if (!userId) {
//     throw new Error('User ID not set - cannot verify database state');
//   }
//   
//   // Verify new session was created
//   const sessionsAfter = await getUserSessions(userId);
//   console.log('📊 [DB AFTER] Sessions after login:', sessionsAfter.length);
//   
//   expect(sessionsAfter.length).toBeGreaterThan(initialSessionCount);
//   console.log('✅ [DB AFTER] New session created');
//   
//   // Verify MFA completed (AAL2)
//   const hasMFA = await hasUserCompletedMFA(userId);
//   expect(hasMFA).toBe(true);
//   console.log('✅ [DB AFTER] MFA completed (AAL2)');
//   
//   // Verify latest session details
//   const latestSession = await getLatestSession(userId);
//   expect(latestSession).toBeTruthy();
//   expect(latestSession.aal).toBe('aal2');
//   expect(latestSession.user_id).toBe(userId);
//   
//   console.log('📊 [DB AFTER] Latest session ID:', latestSession.id);
//   console.log('📊 [DB AFTER] AAL level:', latestSession.aal);
//   console.log('📊 [DB AFTER] Factor ID:', latestSession.factor_id);
//   
//   console.log('✅ [DB VERIFICATION COMPLETE] User authenticated with MFA');
// });

Then('I should see an error message', async ({ page }) => {
  const stepName = 'I should see an error message';
  testContext.logStep('Then', stepName);
  
  // Capture screenshot before validation (important for error scenarios)
  await testContext.captureScreenshot(page, stepName, { action: 'before_validation' });
  
  await loginPage.verifyErrorMessage();
  
  // Capture screenshot after validation to show error message
  await testContext.captureScreenshot(page, stepName, { action: 'after_validation' });
  
  logger.info('Error message displayed');
  console.log('✅ Error message displayed');
});

Then('I should remain on the TOTP verification step', async ({ page }) => {
  const stepName = 'I should remain on the TOTP verification step';
  testContext.logStep('Then', stepName);
  
  // Capture screenshot for validation
  await testContext.captureScreenshot(page, stepName, { action: 'validation' });
  
  await loginPage.verifyOnTOTPStep();
  
  logger.info('Still on TOTP verification step');
  console.log('✅ Still on TOTP verification step');
});

Then('I should remain on the login page', async ({ page }) => {
  const stepName = 'I should remain on the login page';
  testContext.logStep('Then', stepName);
  
  // Capture screenshot for validation
  await testContext.captureScreenshot(page, stepName, { action: 'validation' });
  
  expect(page.url()).toContain('/login');
  await expect(loginPage.emailInput).toBeVisible();
  
  logger.info('Still on login page');
  console.log('✅ Still on login page');
});

Then('the login form should show validation errors', async ({ page }) => {
  const stepName = 'the login form should show validation errors';
  testContext.logStep('Then', stepName);
  
  // Capture screenshot before validation
  await testContext.captureScreenshot(page, stepName, { action: 'before_validation' });
  
  // HTML5 validation or visible error messages
  const emailInput = loginPage.emailInput;
  const passwordInput = loginPage.passwordInput;
  
  // Check if inputs are marked as invalid
  const emailInvalid = await emailInput.evaluate((el: any) => !el.validity?.valid);
  const passwordInvalid = await passwordInput.evaluate((el: any) => !el.validity?.valid);
  
  expect(emailInvalid || passwordInvalid).toBe(true);
  
  // Capture screenshot after validation to show error state
  await testContext.captureScreenshot(page, stepName, { action: 'after_validation' });
  
  logger.info('Form validation errors displayed');
  console.log('✅ Form validation errors displayed');
});
