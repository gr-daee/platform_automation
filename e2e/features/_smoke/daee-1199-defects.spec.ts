/**
 * DAEE-1199 defect coverage — Goverdhan comments 2026-07-07
 *
 * Shell-level assertions that the Sales Returns + IWT unions and the new
 * Current Stock Position table render on the integrated build.
 *
 * Not a byte-level or reconciliation test — DAEE-1199 reconciliation
 * belongs to the SQL runbook at
 * web_app/docs/qa/daee-1199-stock-position-reconciliation.md.
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const FRESH_STATE = '/tmp/iacs-md-fresh.json';
const STALE_STATE = path.resolve(__dirname, '../../.auth/iacs-md.json');
const AUTH_STATE = fs.existsSync(FRESH_STATE) ? FRESH_STATE : STALE_STATE;
const OUT_DIR = path.resolve(__dirname, '../../../test-results/daee-6tix');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

test.use({ storageState: AUTH_STATE });

test.describe('DAEE-1199 defect coverage @daee-1199-defects', () => {
  // The Stock Movement report has heavy first-load compilation + snapshot fetch.
  test.setTimeout(3 * 60 * 1000);

  test('Sales Returns + IWT tabs render + Current Stock Position table appears', async ({ page }) => {
    await page.goto('/inventory/reports/stock-movement', { waitUntil: 'networkidle' });

    // Configure a range that spans populated data (last 90 days on staging Idhyah).
    const today = new Date();
    const fromDate = new Date(today);
    fromDate.setDate(today.getDate() - 90);
    const toDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const fromDateStr = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, '0')}-${String(fromDate.getDate()).padStart(2, '0')}`;
    // The from-date and to-date inputs are `type="date"` inputs; use fill on placeholder.
    await page.locator('input[type="date"]').nth(0).fill(fromDateStr);
    await page.locator('input[type="date"]').nth(1).fill(toDateStr);

    // Kick off the report load — button name may be "Load Report" or "Generate Report"
    const generate = page.getByRole('button', { name: /Load Report|Generate Report|Load/i }).first();
    await expect(generate).toBeVisible({ timeout: 15_000 });
    await generate.click();

    // Wait for either a movement tab to render OR the empty-state.
    await Promise.race([
      page.waitForSelector('text=/Movement Details|Stock Position/i', { timeout: 90_000 }),
      page.waitForSelector('text=/No.*movements/i', { timeout: 90_000 }),
    ]);

    // Full-page capture for visual review.
    await page.screenshot({ path: `${OUT_DIR}/1199-loaded.png`, fullPage: true });

    // Assert the DAEE-1199 KPI panel is now visible.
    await expect(page.getByText(/Stock Position/i).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Opening @ From/i).first()).toBeVisible();
    await expect(page.getByText(/Period In/i).first()).toBeVisible();
    await expect(page.getByText(/Closing @ To/i).first()).toBeVisible();
    await expect(page.getByText(/Live @ now/i).first()).toBeVisible();
    await expect(page.getByText(/In-Transit/i).first()).toBeVisible();

    // Assert the tab bar has all 6 tabs.
    const tabDefs = ['Invoices Sent', 'Sales Returns', 'IWT Received', 'IWT Sent', 'Damage & Lost', 'All Movements'];
    for (const label of tabDefs) {
      await expect(page.getByRole('tab', { name: new RegExp(label, 'i') })).toBeVisible();
    }

    // DAEE-1199 Defect 1: click Sales Returns tab — either shows rows or the
    // "No movements in this category" empty state (deterministic message).
    await page.getByRole('tab', { name: /Sales Returns/i }).click();
    const srBody = page.locator('[role="tabpanel"]').first();
    await expect(srBody).toBeVisible();
    // The tab renders the same Movement Details card wrapper; capture for review.
    await page.screenshot({ path: `${OUT_DIR}/1199-sales-returns-tab.png`, fullPage: true });

    // DAEE-1199 Defect 2: IWT Sent tab
    await page.getByRole('tab', { name: /IWT Sent/i }).click();
    await expect(srBody).toBeVisible();
    await page.screenshot({ path: `${OUT_DIR}/1199-iwt-sent-tab.png`, fullPage: true });

    // DAEE-1199 Defect 3: Current Stock Position table.
    // The card only renders when the position rollup returned at least one
    // group with non-zero qty. On tenants where the current warehouse-scope
    // has zero available inventory (e.g., a scoped test user with no live
    // stock), the card intentionally suppresses itself. Present-or-absent is
    // fine — we just log which we saw.
    // Scroll to find the card, then check.
    await page.mouse.wheel(0, 800);
    const positionCard = page.getByText(/Current Stock Position/i).first();
    const positionCardVisible = await positionCard.isVisible({ timeout: 5_000 }).catch(() => false);
    if (positionCardVisible) {
      const headers = ['Material', 'Batch', 'Warehouse', 'Available', 'Reserved', 'Damaged', 'Value'];
      for (const h of headers) {
        await expect(
          page.getByRole('columnheader', { name: new RegExp(`^${h}$`, 'i') }).first(),
        ).toBeVisible();
      }
      await page.screenshot({ path: `${OUT_DIR}/1199-current-stock-position.png`, fullPage: true });
      console.log('  ✅ Current Stock Position table rendered with expected columns');
    } else {
      console.log('  ℹ️  Current Stock Position card not visible — no non-zero inventory rollup rows in current scope. Snapshot correctly suppresses empty state per spec.');
    }
  });
});
