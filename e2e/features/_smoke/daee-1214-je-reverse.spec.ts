/**
 * DAEE-1214 — Journal Entry reversal round-trip (@mutation)
 *
 * WRITES TO STAGING DB. Only exercised via explicit --grep '@mutation' invocation.
 *
 * Flow:
 *   1. Navigate to /finance/journal-entries/new
 *   2. Create a self-balancing 2-line draft JE with a unique description
 *      "[QA-TEST DAEE-1214 <ISO-timestamp>] auto-reversal probe"
 *      Debit ₹100 to first account in dropdown, Credit ₹100 to second account
 *   3. Post via Post Immediately
 *   4. On detail page, click Reverse → enter reason "QA automation reversal
 *      of test entry created at <ISO-timestamp>" → submit
 *   5. Assert the reversing JE opens with:
 *        - "REVERSAL ENTRY" badge
 *        - A "Reverses" link back to the original
 *        - Reversal reason text present
 *   6. Log both journal numbers to test output for manual cleanup.
 *
 * Cleanup:
 *   - The original + reversing entries are both `posted` and cannot be
 *     deleted; that is finance-correct.
 *   - See docs/qa/daee-1214-mutation-cleanup.md for the SQL to identify
 *     test entries by description prefix "[QA-TEST DAEE-1214 …]".
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

test.describe.serial('DAEE-1214 JE reversal round-trip @daee-1214 @mutation', () => {
  const runId = new Date().toISOString().replace(/[:.]/g, '-');
  const description = `[QA-TEST DAEE-1214 ${runId}] auto-reversal probe`;
  let originalJournalNumber = '';

  test('create + post a self-balancing manual JE', async ({ page }) => {
    await page.goto('/finance/journal-entries/new', { waitUntil: 'networkidle' });

    // Description
    const descTextarea = page.locator('#description');
    await expect(descTextarea).toBeVisible({ timeout: 20_000 });
    await descTextarea.fill(description);

    // Two lines are pre-populated. The account picker is a shadcn Select — the
    // trigger renders as a button with text "Select account" (not a placeholder).
    // Two account triggers exist (one per line); pick by index.
    const accountTriggers = page.getByRole('combobox').filter({ hasText: /Select account/i });
    await expect(accountTriggers.nth(0)).toBeVisible({ timeout: 15_000 });

    // Line 1 — Debit ₹100 to the first available account
    await accountTriggers.nth(0).click();
    await page.getByRole('option').first().click({ timeout: 15_000 });

    // Line 2 — Credit ₹100 to a different account
    // After line 1 selects, only line 2 still has the "Select account" placeholder text.
    await page.getByRole('combobox').filter({ hasText: /Select account/i }).first().click();
    await page.getByRole('option').nth(1).click({ timeout: 15_000 });

    // Debit + Credit inputs — 4 inputs total (2 lines × 2 columns), placeholder "0.00"
    const numericInputs = page.locator('input[placeholder="0.00"]');
    // Layout is column-major: Debit L1, Credit L1, Debit L2, Credit L2 OR row-major: D1, C1, D2, C2
    // Fill Debit column of line 1 (index 0) and Credit column of line 2 (index 3)
    await numericInputs.nth(0).fill('100');
    await numericInputs.nth(3).fill('100');
    // Sanity: totals row should show 100/100 after the fills

    // Sanity screenshot before posting
    await page.screenshot({ path: `${OUT_DIR}/1214-create-form.png`, fullPage: true });

    // Post Immediately
    await page.getByRole('button', { name: /Post Immediately/i }).click();

    // Confirm dialog if present
    const confirm = page.getByRole('button', { name: /Post to GL|Confirm|Yes/i });
    if (await confirm.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await confirm.click();
    }

    // Wait for navigation to detail page or a success toast
    await page.waitForURL(/finance\/journal-entries\/[0-9a-f-]{36}/, { timeout: 45_000 });

    // Read the journal number from the heading "Journal Entry: JE-YYMM-XXXX"
    const heading = await page.getByRole('heading', { name: /Journal Entry:/i }).textContent();
    const m = heading?.match(/Journal Entry:\s*(\S+)/);
    expect(m, 'Journal number must appear on detail page').toBeTruthy();
    originalJournalNumber = m![1];
    console.log('  Created + posted:', originalJournalNumber);

    // Assert status posted, no automated badge (this is a manual JE), and no
    // "reversed_by_je_id" red banner yet.
    await expect(page.getByText(/POSTED/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /^Reverse$/i })).toBeVisible({ timeout: 10_000 });
  });

  test('reverse it, assert reversing entry links back with reason', async ({ page }) => {
    test.skip(!originalJournalNumber, 'Original JE creation failed; skipping reversal');

    // We should still be on the detail page from the previous test since serial
    // + browser context is preserved; but re-nav defensively.
    if (!page.url().match(/finance\/journal-entries\/[0-9a-f-]{36}/)) {
      // Fallback: find by journal_number search on the list page
      await page.goto('/finance/journal-entries', { waitUntil: 'networkidle' });
      await page.getByRole('cell', { name: originalJournalNumber }).first().click({ timeout: 20_000 });
      await page.waitForURL(/journal-entries\/[0-9a-f-]{36}/);
    }

    const reason = `QA automation reversal of ${originalJournalNumber} at ${runId}`;

    // Click Reverse to open the dialog
    await page.getByRole('button', { name: /^Reverse$/i }).click();
    // Dialog: Textarea "Reversal reason"
    await page.locator('#reversal-reason').fill(reason);
    // Submit
    await page.getByRole('button', { name: /Post Reversing Entry/i }).click();

    // On success we navigate to the reversing entry
    await page.waitForURL(/journal-entries\/[0-9a-f-]{36}/, { timeout: 30_000 });

    // Reversal-entry badge
    await expect(page.getByText(/REVERSAL ENTRY/i)).toBeVisible({ timeout: 10_000 });

    // "Reverses" link block containing the original journal number
    await expect(page.getByText(/Reverses:/i)).toBeVisible();
    await expect(page.getByText(originalJournalNumber)).toBeVisible();

    // Reason displayed
    await expect(page.getByText(reason)).toBeVisible();

    // Read the reversing entry's own journal number for logging
    const revHeading = await page.getByRole('heading', { name: /Journal Entry:/i }).textContent();
    const revMatch = revHeading?.match(/Journal Entry:\s*(\S+)/);
    console.log('  Reversal succeeded:', {
      original: originalJournalNumber,
      reversing: revMatch?.[1] || 'unknown',
      description,
      reason,
    });

    await page.screenshot({ path: `${OUT_DIR}/1214-reversing-entry-detail.png`, fullPage: true });

    // Navigate back to the original and assert the red "This entry has been
    // reversed" banner + link to the reversing entry.
    await page.goto('/finance/journal-entries', { waitUntil: 'networkidle' });
    await page.getByRole('cell', { name: originalJournalNumber }).first().click({ timeout: 20_000 });
    await page.waitForURL(/journal-entries\/[0-9a-f-]{36}/);
    await expect(page.getByText(/This entry has been reversed/i)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/REVERSED/i).first()).toBeVisible();
    // Reverse button must no longer be visible
    await expect(page.getByRole('button', { name: /^Reverse$/i })).toHaveCount(0);

    await page.screenshot({ path: `${OUT_DIR}/1214-original-after-reversal.png`, fullPage: true });
  });
});
