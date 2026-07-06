/**
 * One-off fresh IACS-MD login → saves state to /tmp/iacs-md-fresh.json.
 * Run once via the smoke config; the 6-ticket smoke reuses the saved file.
 */
import { test, expect } from '@playwright/test';
import * as TOTP from 'otpauth';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load the platform_automation .env (dev creds + TOTP secret)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const OUT = '/tmp/iacs-md-fresh.json';

test.use({ storageState: { cookies: [], origins: [] } });

test('fresh login for iacs-md @login-only', async ({ page, context }) => {
  const email = process.env.IACS_MD_USER_EMAIL || '';
  const password = process.env.IACS_MD_USER_PASSWORD || '';
  const totpSecret = process.env.IACS_MD_USER_TOTP_SECRET || '';
  expect(email, 'IACS_MD_USER_EMAIL missing').not.toBe('');
  expect(password, 'IACS_MD_USER_PASSWORD missing').not.toBe('');
  expect(totpSecret, 'IACS_MD_USER_TOTP_SECRET missing').not.toBe('');

  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.locator('input#email').fill(email);
  await page.locator('input#password').fill(password);
  await page.locator('form').getByRole('button', { name: 'Sign In', exact: true }).click();

  await page.waitForSelector('input#totp-code, input#verify-code', { timeout: 30_000 });

  const totp = new TOTP.TOTP({
    issuer: 'DAEE',
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: totpSecret,
  });
  await page.locator('input#totp-code, input#verify-code').first().fill(totp.generate());
  // Submit the TOTP form (Verify Code button)
  await page.getByRole('button', { name: /Verify Code/i }).click();

  // Land on the dashboard OR any post-auth route
  await page.waitForURL((u) => !/\/login/.test(u.pathname), { timeout: 45_000 });

  await context.storageState({ path: OUT });
  console.log(`✅ Fresh iacs-md storage state saved to ${OUT}`);
});
