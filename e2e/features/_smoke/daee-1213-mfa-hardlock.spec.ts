/**
 * DAEE-1213 security regression — URL-bar MFA bypass must fail.
 *
 * Repro (Goverdhan 2026-07-12, Tanuj 2026-07-14):
 *   1. Log in with email + password.
 *   2. On the TOTP screen, DO NOT enter a TOTP code.
 *   3. Paste a protected module URL (e.g. /notes) in the address bar.
 *   4. Old behaviour: user landed on /notes with an aal1 session.
 *   5. Fixed behaviour: browser is redirected to /login?step=totp-verify
 *      (or /login?step=totp-setup if the user has no verified TOTP factor).
 *
 * Coverage of the Def-1..Def-4 fix stack on `pavan/DAEE-1213-server-gate`:
 *   - middleware default-deny (Def-1)
 *   - server-side layout gates (Def-3)
 *   - verified-factor check (Def-4)
 *
 * This is a NON-mutating security probe — no writes, no state changes.
 * Safe to run against staging without approval.
 */
import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Fresh browser context — no saved auth. The test itself performs the
// partial (password-only) login, so we must NOT inherit the aal2 storage
// state that the rest of the smoke suite uses.
test.use({ storageState: { cookies: [], origins: [] } });

// Every top-level protected module. All routes verified as existing
// page.tsx files in web_app. Non-existent routes yield 404 (Next.js 15
// short-circuits middleware for unmatched URLs) — that's a Next.js
// behavior, not a bypass, and would produce a false positive here.
const PROTECTED_ROUTES = [
  '/notes',
  '/finance/reports/dealer-outstanding',
  '/o2c/invoices',
  '/inventory/reports/stock-movement',
  '/warehouse-management/iwt',
  '/products',
  '/admin/roles',
  '/hrms/employees',
  '/sales-crm/sales-categories',
  '/job-work',
  '/dealer-applications',
  '/p2p/grn',
  '/plant-production',
] as const;

// Dev-mode Next.js cold-compiles heavy routes on first hit (30-60s each).
// Give the whole test 4 minutes and each nav its own 60s window.
test.setTimeout(240_000);

test(
  'DAEE-1213: password-only login cannot access protected routes via URL bar @security @daee-1213',
  async ({ page, context }, testInfo) => {
    page.setDefaultNavigationTimeout(60_000);
    const email = process.env.IACS_MD_USER_EMAIL || '';
    const password = process.env.IACS_MD_USER_PASSWORD || '';
    expect(email, 'IACS_MD_USER_EMAIL missing').not.toBe('');
    expect(password, 'IACS_MD_USER_PASSWORD missing').not.toBe('');

    // Capture browser console errors — surfaced in test output for debug.
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // === Step 1: password-only login ===
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.locator('input#email').fill(email);
    await page.locator('input#password').fill(password);
    await page.locator('form').getByRole('button', { name: 'Sign In', exact: true }).click();

    // === Step 2: wait for TOTP screen (proof we're at aal1 checkpoint) ===
    await page.waitForSelector('input#totp-code, input#verify-code', { timeout: 30_000 });
    await page.screenshot({
      path: testInfo.outputPath('01-totp-screen-reached.png'),
      fullPage: true,
    });

    // Sanity: Supabase auth cookie present but session is aal1 (unverified TOTP).
    const cookies = await context.cookies();
    const hasAuthCookie = cookies.some(
      (c) => c.name.startsWith('sb-') || c.name.toLowerCase().includes('auth')
    );
    expect(hasAuthCookie, 'Supabase auth cookie should be set after password login').toBe(true);

    // === Step 3: URL-bar navigate to each protected route ===
    const results: Array<{ route: string; finalUrl: string; blocked: boolean }> = [];

    for (const route of PROTECTED_ROUTES) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      // Small settle for any client-side redirect from ProtectedPageWrapper.
      await page
        .waitForURL((u) => /\/login/.test(u.pathname), { timeout: 5_000 })
        .catch(() => {
          /* not-blocked case falls through to the assertion below */
        });

      const url = new URL(page.url());
      const finalPath = `${url.pathname}${url.search}`;
      const blocked = finalPath.startsWith('/login');

      results.push({ route, finalUrl: finalPath, blocked });
      console.log(
        `[DAEE-1213] ${route} → ${finalPath} ${blocked ? '✅ BLOCKED' : '❌ ALLOWED THROUGH'}`
      );

      // Failure evidence — screenshot the leaked page.
      if (!blocked) {
        await page.screenshot({
          path: testInfo.outputPath(`FAIL-${route.replace(/\//g, '_')}.png`),
          fullPage: true,
        });
      }
    }

    // === Step 4: assert all routes blocked ===
    const bypasses = results.filter((r) => !r.blocked);
    const summaryLines = results
      .map((r) => `  ${r.blocked ? '✅' : '❌'} ${r.route.padEnd(48)} → ${r.finalUrl}`)
      .join('\n');
    console.log(`\n[DAEE-1213 SUMMARY]\n${summaryLines}\n`);

    if (bypasses.length > 0) {
      console.log('[DAEE-1213] Console errors during test:', consoleErrors);
    }

    expect(
      bypasses,
      `URL-bar MFA bypass allowed on ${bypasses.length} route(s):\n${JSON.stringify(bypasses, null, 2)}`
    ).toEqual([]);
  }
);
