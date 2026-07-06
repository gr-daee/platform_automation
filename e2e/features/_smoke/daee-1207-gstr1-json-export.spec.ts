/**
 * DAEE-1207 — GSTR-1 QRMP quarterly JSON export byte content
 *
 * Deterministic byte check: click Quarterly (QRMP), pick a quarter, trigger
 * JSON export, parse the file, assert `fp` = MMYYYY of quarter-END month per
 * portal rule (062025 for Apr-Jun 2025, 032026 for Jan-Mar 2026, etc.).
 *
 * No mutations, no cleanup required.
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

test.describe('DAEE-1207 GSTR-1 QRMP JSON export @daee-1207', () => {
  test('quarterly JSON stamps return period = MMYYYY of quarter-end', async ({ page }) => {
    await page.goto('/finance/compliance/gstr1', { waitUntil: 'networkidle' });

    // Wait for the GSTIN selector to populate + auto-select
    await expect(page.getByText(/Period Mode/i).first()).toBeVisible({ timeout: 30_000 });

    // Switch to Quarterly (QRMP)
    await page.getByRole('button', { name: /Quarterly.*QRMP/i }).click();

    // The quarter selector auto-picks the newest quarter. Capture the label
    // that's currently selected so we can compute the expected return period.
    // The Quarter select is a SearchableSelect — the trigger button shows the
    // selected label like "FY 2024-25 Q4 (Jan–Mar 2025)".
    const quarterLabel = await page.locator('button:has-text("FY"), div:has-text("FY 20")').first().textContent();
    console.log('  Quarter selected:', quarterLabel);
    expect(quarterLabel, 'Quarter label must be visible').toBeTruthy();

    // Wait for GSTR-1 data to load so the Export menu is enabled
    await page.waitForLoadState('networkidle');
    // The Refresh + Export buttons live in the summary card header
    await page.waitForTimeout(2000); // small settle for the tabs to populate

    // Trigger JSON export via the Export dropdown → JSON option
    const downloadPromise = page.waitForEvent('download', { timeout: 60_000 });
    await page.getByRole('button', { name: /^Export/i }).first().click();
    // The dropdown item is either "Export JSON" or "JSON"
    const jsonOption = page
      .getByRole('menuitem', { name: /JSON/i })
      .or(page.getByRole('option', { name: /JSON/i }))
      .or(page.getByText(/Export JSON|GSTR-1 JSON/i));
    await jsonOption.first().click();

    const dl = await downloadPromise;
    const localPath = path.join(OUT_DIR, `1207-${Date.now()}.json`);
    await dl.saveAs(localPath);
    console.log('  JSON saved:', localPath, 'name:', dl.suggestedFilename());

    // Parse + assert
    const raw = fs.readFileSync(localPath, 'utf8');
    const json = JSON.parse(raw);
    console.log('  Top-level keys:', Object.keys(json).slice(0, 10));

    // GSTR-1 government JSON has `fp` at top level = filing period MMYYYY
    const fp: string | undefined = json.fp;
    expect(fp, 'Filing period `fp` must be present').toBeTruthy();
    expect(fp).toMatch(/^\d{6}$/);
    console.log('  fp =', fp);

    // Compute expected fp from the current-selected quarter label.
    // Label examples: "FY 2024-25 Q4 (Jan–Mar 2025)" -> quarter-end = Mar 2025 -> fp=032025
    // "FY 2025-26 Q1 (Apr–Jun 2025)" -> quarter-end = Jun 2025 -> fp=062025
    const label = quarterLabel || '';
    const qMatch = label.match(/Q(\d)/);
    const yearMatch = label.match(/\((?:[A-Za-z–\-]+\s+){0,3}(\d{4})\)/);
    expect(qMatch, 'Could not read Q number from label').toBeTruthy();
    expect(yearMatch, 'Could not read year from label').toBeTruthy();
    const q = parseInt(qMatch![1], 10);
    const year = parseInt(yearMatch![1], 10);
    const quarterEndMonth = { 1: 6, 2: 9, 3: 12, 4: 3 }[q]!;
    const expectedFp = `${String(quarterEndMonth).padStart(2, '0')}${year}`;
    console.log('  Expected fp:', expectedFp, `(Q${q} of ${year})`);
    expect(fp).toBe(expectedFp);
  });
});
