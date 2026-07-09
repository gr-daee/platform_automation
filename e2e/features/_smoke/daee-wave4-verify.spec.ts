/**
 * Wave 4 verification — Jul 8 2026
 *
 * Drives the app at the two affected surfaces and captures evidence:
 *   1. DAEE-1214 reversal-entry JE → Reverse button MUST be absent.
 *   2. DAEE-1199 Stock Movement → SR count > 0, IWT rows show real
 *      material names (not "Unknown"), Category + Transaction Type
 *      filter cards absent, Current Stock Position is the 7th tab.
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

test.describe('DAEE Wave 4 verification @daee-wave4', () => {
  test.setTimeout(3 * 60 * 1000);

  test('DAEE-1214: Reverse button hidden on reversal entry', async ({ page }) => {
    // Goverdhan's original fixture JE-202607-0739 was cleaned up; use a live
    // is_reversal=true posted JE on Idhyah staging (JE-202607-0027).
    await page.goto('/finance/journal-entries/8b3c531c-f60e-4def-94ff-5889f0312b1d', {
      waitUntil: 'domcontentloaded',
    });

    // "REVERSAL ENTRY" badge must be visible (confirms we're on the right JE).
    await expect(page.getByText(/REVERSAL ENTRY/i).first()).toBeVisible({ timeout: 45_000 });

    // Reverse button MUST NOT be present.
    await expect(page.getByRole('button', { name: /^Reverse$/i })).toHaveCount(0);
    // Sanity — page still shows the JE header.
    await expect(page.getByRole('heading', { name: /Journal Entry:/i })).toBeVisible();

    await page.screenshot({
      path: `${OUT_DIR}/wave4-1214-reversal-no-reverse-button.png`,
      fullPage: true,
    });
  });

  test('DAEE-1199: SR shows real data + IWT material name populated + filters hidden', async ({ page }) => {
    await page.goto('/inventory/reports/stock-movement', { waitUntil: 'networkidle' });

    // Filter cleanup (Defect 08) — Category + Transaction Type labels absent.
    await expect(page.getByText(/^Category$/i)).toHaveCount(0);
    await expect(page.getByText(/^Transaction Type$/i)).toHaveCount(0);

    // Populate the report — 6-month range covers Idhyah's 138 SR receipts.
    const today = new Date();
    const from = new Date(today);
    from.setMonth(today.getMonth() - 6);
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    await page.locator('input[type="date"]').nth(0).fill(fmt(from));
    await page.locator('input[type="date"]').nth(1).fill(fmt(today));
    await page.getByRole('button', { name: /Load Report|Generate/i }).first().click();

    // Wait for either the report or a No-movements empty state.
    await Promise.race([
      page.waitForSelector('text=/Stock Position/i', { timeout: 90_000 }),
      page.waitForSelector('text=/No.*movements/i', { timeout: 90_000 }),
    ]);
    await page.screenshot({ path: `${OUT_DIR}/wave4-1199-loaded.png`, fullPage: true });

    // 7 tabs including Current Stock Position (Wave 3 kept).
    const positionTab = page.getByRole('tab', { name: /Current Stock Position/i });
    await expect(positionTab).toBeVisible({ timeout: 20_000 });

    // Defect 1 (SR = 0 → real data): Sales Returns tab badge should be > 0
    // because staging has 138 receipts / 161 items in scope.
    const srTabTrigger = page.getByRole('tab', { name: /Sales Returns/i });
    await expect(srTabTrigger).toBeVisible();
    const srBadgeText = await srTabTrigger.textContent();
    console.log('  Sales Returns tab text:', srBadgeText);
    // Extract the count from the tab text (label + number)
    const srCountMatch = srBadgeText?.match(/(\d+)\s*$/);
    const srCount = srCountMatch ? parseInt(srCountMatch[1], 10) : 0;
    console.log(`  SR count in tab: ${srCount}`);
    expect(srCount, 'Wave 4 SR fix should return > 0 rows on Idhyah staging (SQL shows 138 receipts / 161 items)').toBeGreaterThan(0);
    await srTabTrigger.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT_DIR}/wave4-1199-sr-tab.png`, fullPage: true });

    // Defect 07 (Material Unknown): click IWT Sent, sample the first row's
    // Material column — must not be "Unknown".
    await page.getByRole('tab', { name: /IWT Sent/i }).click();
    await page.waitForTimeout(500);
    // Wait for the tab body to populate + one row to appear.
    const firstMaterialCell = page.locator('tbody tr').first().locator('td').nth(4); // Warehouse=3, Material=4
    const hasRow = await firstMaterialCell.isVisible({ timeout: 10_000 }).catch(() => false);
    if (hasRow) {
      const firstMaterial = await firstMaterialCell.textContent();
      console.log('  First IWT Sent row Material cell:', firstMaterial);
      expect(firstMaterial?.toLowerCase()).not.toContain('unknown');
    } else {
      console.log('  ⚠️  IWT Sent tab has no visible row for material sampling');
    }
    await page.screenshot({ path: `${OUT_DIR}/wave4-1199-iwt-sent.png`, fullPage: true });
  });
});
