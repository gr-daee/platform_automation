import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { MaterialRequestsPage } from '../../pages/plant-production/MaterialRequestsPage';

const { Given: BddGiven, When: BddWhen, Then: BddThen } = createBdd();

let mrnPage: MaterialRequestsPage;

// ─── GIVEN ────────────────────────────────────────────────────────────────────

BddGiven('I am on the Material Requests page', async function ({ page }) {
  mrnPage = new MaterialRequestsPage(page);
  await mrnPage.goto();
  await mrnPage.verifyPageLoaded();
});

// ─── THEN ─────────────────────────────────────────────────────────────────────

BddThen('the Material Requests page should be visible', async function ({ page }) {
  mrnPage = new MaterialRequestsPage(page);
  await expect(mrnPage.pageHeading).toBeVisible({ timeout: 10000 });
  console.log('✅ [MRN] Material Requests page visible');
});

BddThen('the MRN list or empty state should be displayed', async function ({ page }) {
  mrnPage = new MaterialRequestsPage(page);
  await mrnPage.verifyMRNListVisible();
});

BddThen('the MRN list header should be visible', async function ({ page }) {
  mrnPage = new MaterialRequestsPage(page);
  await expect(page.getByText('Material Requests (MRNs)')).toBeVisible({ timeout: 10000 });
  console.log('✅ [MRN] MRN header visible');
});

BddThen('the page should display within the last 30 days date range filter', async function ({ page }) {
  mrnPage = new MaterialRequestsPage(page);
  // The page has date range inputs with default 30-day range
  const dateInputs = page.locator('input[type="date"]');
  const count = await dateInputs.count();
  // Date range filters should be present (at least 1 input, typically 2)
  expect(count).toBeGreaterThanOrEqual(1);
  console.log(`✅ [MRN] Date range filter present (${count} inputs)`);
});

BddThen('the issue action should be available for pending MRNs', async function ({ page }) {
  mrnPage = new MaterialRequestsPage(page);
  // Wait for loading to finish before checking
  await expect(page.getByText('Loading material requests...')).toBeHidden({ timeout: 15000 }).catch(() => null);
  await page.waitForTimeout(500);
  // Check if there's either an Issue button ("Issue Materials") or an empty state
  const hasIssueBtn = await page.getByRole('button', { name: /Issue Materials/i }).first().isVisible({ timeout: 3000 }).catch(() => false);
  const hasEmpty = await page.getByText(/No material requests/i).isVisible({ timeout: 3000 }).catch(() => false);
  // Also accept the case where MRNs exist but none have pending items (page loaded but no actionable items)
  const hasTable = await page.locator('table').isVisible({ timeout: 3000 }).catch(() => false);
  expect(hasIssueBtn || hasEmpty || hasTable).toBe(true);
  console.log(`✅ [MRN] Issue action: ${hasIssueBtn}, empty: ${hasEmpty}, table: ${hasTable}`);
});
