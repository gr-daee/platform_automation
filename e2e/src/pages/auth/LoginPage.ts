import { Page, Locator, expect } from '@playwright/test';
import * as TOTP from 'otpauth';
import { BasePage } from '../../support/base/BasePage';

/**
 * Login Page Object Model for DAEE Platform
 * 
 * Source: ../web_app/src/app/login/components/AnimatedLoginFlow.tsx
 * 
 * This POM handles the complete authentication flow:
 * 1. Email/Password login
 * 2. TOTP verification (for existing users)
 * 3. TOTP setup (for new users)
 * 4. Success confirmation
 * 
 * The login flow uses shadcn/ui components (Radix primitives).
 * Locators follow semantic selector priority:
 * 1. data-testid (if available)
 * 2. getByRole
 * 3. getByPlaceholder
 * 4. getByText
 * 5. ID selectors
 */
export class LoginPage extends BasePage {
  
  // ==========================================
  // Login Step Locators
  // ==========================================
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly passwordToggle: Locator;
  readonly signInButton: Locator;
  readonly googleSignInButton: Locator;
  
  // ==========================================
  // TOTP Verification Step Locators
  // ==========================================
  readonly totpCodeInput: Locator;
  readonly verifyButton: Locator;
  
  // ==========================================
  // TOTP Setup Step Locators (for new users)
  // ==========================================
  readonly setupTotpCodeInput: Locator;
  readonly verifyEnableButton: Locator;
  readonly qrCodeContainer: Locator;
  readonly totpSecretText: Locator;
  
  // ==========================================
  // Success & Error Indicators
  // ==========================================
  readonly successMessage: Locator;
  readonly welcomeHeading: Locator;
  readonly errorAlert: Locator;
  readonly toastMessage: Locator;

  constructor(page: Page) {
    super(page);
    
    // Login form elements (Step 1)
    this.emailInput = page.locator('input#email');
    this.passwordInput = page.locator('input#password');
    this.passwordToggle = page.getByRole('button').filter({ hasText: /eye/i });
    // Use form context to get the submit button (not Google sign-in)
    this.signInButton = page.locator('form').getByRole('button', { name: 'Sign In', exact: true });
    this.googleSignInButton = page.getByRole('button', { name: /Google/i });
    
    // TOTP verification elements (Step 3 - for existing users)
    this.totpCodeInput = page.locator('input#verify-code');
    this.verifyButton = page.getByRole('button', { name: /Verify Code/i });
    
    // TOTP setup elements (Step 2 - for new users)
    this.setupTotpCodeInput = page.locator('input#totp-code');
    this.verifyEnableButton = page.getByRole('button', { name: /Verify & Enable/i });
    this.qrCodeContainer = page.locator('[dangerouslySetInnerHTML]').first();
    this.totpSecretText = page.locator('div.font-mono').filter({ hasText: /^[A-Z2-7]{16,}$/ });
    
    // Success indicators
    this.successMessage = page.getByText('Welcome!');
    this.welcomeHeading = page.getByRole('heading', { name: /Welcome/i });
    
    // Error handling
    this.errorAlert = page.locator('[role="alert"]');
    this.toastMessage = page.locator('[data-sonner-toast]');
  }

  // ==========================================
  // Navigation
  // ==========================================
  
  /**
   * Navigate to the login page
   */
  async navigateTo(): Promise<void> {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
    await expect(this.emailInput).toBeVisible({ timeout: 10000 });
  }

  // ==========================================
  // Login Form Actions
  // ==========================================
  
  /**
   * Fill in email address
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }
  
  /**
   * Fill in password
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }
  
  /**
   * Toggle password visibility
   */
  async togglePasswordVisibility(): Promise<void> {
    await this.passwordToggle.click();
  }
  
  /**
   * Click the Sign In button
   */
  async clickSignIn(): Promise<void> {
    await this.signInButton.click();
  }
  
  /**
   * Fill login credentials and submit
   */
  async submitLoginForm(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSignIn();
  }

  // ==========================================
  // TOTP Verification Actions
  // ==========================================
  
  /**
   * Wait for TOTP verification step to appear
   * This indicates successful email/password authentication
   */
  async waitForTOTPStep(): Promise<void> {
    await expect(
      this.totpCodeInput.or(this.setupTotpCodeInput)
    ).toBeVisible({ timeout: 15000 });
  }
  
  /**
   * Fill in TOTP verification code
   */
  async fillTOTPCode(code: string): Promise<void> {
    // Try both possible inputs (setup or verify)
    const visibleInput = await this.totpCodeInput.or(this.setupTotpCodeInput).first();
    await visibleInput.fill(code);
  }
  
  /**
   * Generate TOTP code from secret
   * 
   * @param secret - Base32 encoded TOTP secret
   * @returns 6-digit TOTP code
   */
  generateTOTPCode(secret: string, email: string = 'user@daee.test'): string {
    const totp = new TOTP.TOTP({
      issuer: 'DAEE',
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret,
    });
    
    return totp.generate();
  }
  
  /**
   * Click the TOTP verify button
   * Handles both "Verify Code" and "Verify & Enable" buttons
   */
  async clickVerifyTOTP(): Promise<void> {
    const verifyBtn = await this.verifyButton.or(this.verifyEnableButton).first();
    await verifyBtn.click();
  }
  
  /**
   * Complete TOTP verification with generated code
   * 
   * @param totpSecret - Base32 TOTP secret
   * @param email - User email (for TOTP label)
   */
  async completeTOTPVerification(totpSecret: string, email: string): Promise<void> {
    await this.waitForTOTPStep();
    const code = this.generateTOTPCode(totpSecret, email);
    await this.fillTOTPCode(code);
    await this.clickVerifyTOTP();
  }

  // ==========================================
  // Success Verification
  // ==========================================
  
  /**
   * Wait for successful authentication and redirect
   * Expected destination: /notes
   */
  async waitForSuccessRedirect(): Promise<void> {
    // Wait for either success message or direct redirect
    await Promise.race([
      this.page.waitForURL('**/notes', { timeout: 20000 }),
      expect(this.successMessage).toBeVisible({ timeout: 20000 }),
    ]);
  }
  
  /**
   * Verify user is on the notes page (successful login)
   */
  async verifyOnNotesPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/notes/, { timeout: 10000 });
  }
  
  /**
   * Verify success toast message appears
   */
  async verifySuccessToast(message?: string): Promise<void> {
    if (message) {
      await expect(this.toastMessage.filter({ hasText: message })).toBeVisible({
        timeout: 5000,
      });
    } else {
      await expect(
        this.toastMessage.filter({ hasText: /success|authenticated|completed/i })
      ).toBeVisible({ timeout: 5000 });
    }
  }

  // ==========================================
  // Error Verification
  // ==========================================
  
  /**
   * Verify error message is displayed
   */
  async verifyErrorMessage(expectedMessage?: string): Promise<void> {
    // Use more specific locator to avoid matching route announcer
    // Target only the Sonner toast (has data-sonner-toast attribute)
    // Exclude route announcer by filtering out elements with id="__next-route-announcer__"
    const toastLocator = this.page.locator('[data-sonner-toast]').filter({
      hasNot: this.page.locator('#__next-route-announcer__')
    });
    
    // Also check for role="alert" but exclude route announcer
    const alertLocator = this.page.locator('[role="alert"]').filter({
      hasNot: this.page.locator('#__next-route-announcer__')
    });
    
    // Wait for either toast or alert (excluding route announcer)
    await expect(toastLocator.or(alertLocator).first()).toBeVisible({
      timeout: 5000,
    });
    
    if (expectedMessage) {
      await expect(
        this.page.getByText(expectedMessage, { exact: false })
      ).toBeVisible();
    }
  }
  
  /**
   * Verify user remains on TOTP verification step (failed verification)
   */
  async verifyOnTOTPStep(): Promise<void> {
    await expect(
      this.totpCodeInput.or(this.setupTotpCodeInput)
    ).toBeVisible({ timeout: 5000 });
  }

  // ==========================================
  // Complete Login Flow
  // ==========================================
  
  /**
   * Perform complete login with TOTP
   * This is the main method for tests
   * 
   * @param email - User email
   * @param password - User password
   * @param totpSecret - Base32 TOTP secret
   * 
   * @example
   * const loginPage = new LoginPage(page);
   * await loginPage.performLogin(
   *   'admin@daee.test',
   *   'password123',
   *   'JBSWY3DPEHPK3PXP'
   * );
   */
  async performLogin(
    email: string,
    password: string,
    totpSecret: string
  ): Promise<void> {
    console.log('🔐 Starting login flow for:', email);
    
    // Step 1: Submit login credentials
    console.log('  📧 Filling credentials...');
    await this.submitLoginForm(email, password);
    
    // Step 2: Wait for TOTP step
    console.log('  ⏳ Waiting for TOTP verification...');
    await this.waitForTOTPStep();
    
    // Step 3: Complete TOTP verification
    console.log('  🔢 Generating and entering TOTP code...');
    await this.completeTOTPVerification(totpSecret, email);
    
    // Step 4: Verify success
    console.log('  ✅ Waiting for successful authentication...');
    await this.waitForSuccessRedirect();
    
    console.log('🎉 Login complete!');
  }
  
  /**
   * Perform login with invalid TOTP (for negative testing)
   * 
   * @param email - User email
   * @param password - User password
   * @param invalidCode - Invalid TOTP code (e.g., "000000")
   */
  async performLoginWithInvalidTOTP(
    email: string,
    password: string,
    invalidCode: string = '000000'
  ): Promise<void> {
    console.log('🔐 Starting login flow with invalid TOTP for:', email);
    
    await this.submitLoginForm(email, password);
    await this.waitForTOTPStep();
    await this.fillTOTPCode(invalidCode);
    await this.clickVerifyTOTP();
    
    // Don't wait for success - expect error instead
    console.log('❌ Expecting TOTP verification to fail...');
  }
}
