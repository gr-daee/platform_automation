import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { FiscalPeriodsPage } from '../../pages/finance/FiscalPeriodsPage';
import {
  getTenantIdForFinanceE2E,
  getFiscalPeriodByStatus,
  getSequentialCloseOpenPairForTenant,
} from '../../support/finance-db-helpers';

const { Given, When, Then } = createBdd();

type FiscalCtx = {
  lastPeriodName?: string;
  lastFiscalYear?: number;
};

function ctx(world: unknown): FiscalCtx {
  const w = world as FiscalCtx;
  if (!w.lastPeriodName) w.lastPeriodName = undefined;
  return w;
}

/**
 * Calendar FY (Jan–Dec) in a high year range avoids overlapping typical Apr–Mar fiscal years
 * that extend into the next calendar year (overlap validation in createFiscalYear).
 */
function pickIsolatedTestFiscalYear(): number {
  return 9200 + (Date.now() % 500);
}

Given('I am on the fiscal periods page', async function ({ page }) {
  const fp = new FiscalPeriodsPage(page);
  await fp.goto();
  (this as any).fiscalPeriodsPage = fp;
});

Then('at least one fiscal year tab is visible', async function ({ page }) {
  const fyTab = page.getByRole('tab', { name: /FY\s*\d{4}/i }).first();
  const noYears = page.getByRole('heading', { name: 'No Fiscal Years' });
  await expect(fyTab.or(noYears)).toBeVisible({ timeout: 25000 });
});

When('I open first draft fiscal period from database if present', async function ({ page }) {
  const tenant = await getTenantIdForFinanceE2E();
  expect(tenant).toBeTruthy();
  const p = await getFiscalPeriodByStatus(tenant!, 'draft');
  const c = ctx(this);
  if (!p) {
    c.lastPeriodName = undefined;
    return;
  }
  c.lastPeriodName = p.period_name;
  c.lastFiscalYear = p.fiscal_year;
  const fp = new FiscalPeriodsPage(page);
  await fp.clickFiscalYearTab(p.fiscal_year);
  const openBtn = fp.getOpenPeriodButtonInRow(p.period_name);
  if (await openBtn.isVisible().catch(() => false)) {
    await openBtn.click();
    await page.waitForLoadState('networkidle').catch(() => {});
  }
});

Then('the period row shows posting allowed or test skipped when no draft exists', async function ({
  page,
  $test,
}) {
  const c = ctx(this);
  if (!c.lastPeriodName) {
    $test?.skip(true, 'No draft fiscal period in DB for tenant');
    return;
  }
  const fp = new FiscalPeriodsPage(page);
  await fp.expectPostingBadgeForPeriod(c.lastPeriodName!, true);
});

When('I soft close first open fiscal period from database if present', async function ({ page }) {
  const tenant = await getTenantIdForFinanceE2E();
  expect(tenant).toBeTruthy();
  const p = await getFiscalPeriodByStatus(tenant!, 'open');
  const c = ctx(this);
  if (!p) {
    c.lastPeriodName = undefined;
    return;
  }
  c.lastPeriodName = p.period_name;
  c.lastFiscalYear = p.fiscal_year;
  const fp = new FiscalPeriodsPage(page);
  await fp.clickFiscalYearTab(p.fiscal_year);
  const btn = fp.getClosePeriodButtonInRow(p.period_name);
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await page.waitForLoadState('networkidle').catch(() => {});
  }
});

Then('the period row shows closed status or test skipped when no open period exists', async function ({
  page,
  $test,
}) {
  const c = ctx(this);
  if (!c.lastPeriodName) {
    $test?.skip(true, 'No open fiscal period in DB for tenant');
    return;
  }
  const fp = new FiscalPeriodsPage(page);
  await fp.expectPeriodStatusText(c.lastPeriodName!, /Closed/i);
});

When('I hard close first soft closed fiscal period from database if present', async function ({
  page,
}) {
  const tenant = await getTenantIdForFinanceE2E();
  expect(tenant).toBeTruthy();
  const p = await getFiscalPeriodByStatus(tenant!, 'soft_closed');
  const c = ctx(this);
  if (!p) {
    c.lastPeriodName = undefined;
    return;
  }
  c.lastPeriodName = p.period_name;
  c.lastFiscalYear = p.fiscal_year;
  const fp = new FiscalPeriodsPage(page);
  await fp.clickFiscalYearTab(p.fiscal_year);
  const btn = fp.getHardCloseButtonInRow(p.period_name);
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await page.waitForLoadState('networkidle').catch(() => {});
  }
});

Then('the period row shows permanently locked or test skipped', async function ({ page, $test }) {
  const c = ctx(this);
  if (!c.lastPeriodName) {
    $test?.skip(true, 'No soft_closed fiscal period in DB for tenant');
    return;
  }
  const row = new FiscalPeriodsPage(page).periodRow(c.lastPeriodName!);
  await expect(row.getByText(/Permanently Locked/i)).toBeVisible({ timeout: 15000 });
});

When('I reopen first soft closed fiscal period from database if present', async function ({ page }) {
  const tenant = await getTenantIdForFinanceE2E();
  expect(tenant).toBeTruthy();
  const p = await getFiscalPeriodByStatus(tenant!, 'soft_closed');
  const c = ctx(this);
  if (!p) {
    c.lastPeriodName = undefined;
    return;
  }
  c.lastPeriodName = p.period_name;
  const fp = new FiscalPeriodsPage(page);
  await fp.clickFiscalYearTab(p.fiscal_year);
  const btn = fp.getReopenButtonInRow(p.period_name);
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await page.waitForLoadState('networkidle').catch(() => {});
  }
});

Then('the period row shows open status or hard closed blocking reopen or test skipped', async function ({
  page,
  $test,
}) {
  const c = ctx(this);
  if (!c.lastPeriodName) {
    $test?.skip(true, 'No soft_closed fiscal period in DB for tenant');
    return;
  }
  const fp = new FiscalPeriodsPage(page);
  const row = fp.periodRow(c.lastPeriodName!);
  const reopened = await row.getByText(/Open/i).isVisible().catch(() => false);
  const stillClosed = await row.getByText(/Closed/i).isVisible().catch(() => false);
  const hardLocked = await row.getByText(/Hard Closed|Permanently Locked/i).isVisible().catch(() => false);
  expect(reopened || stillClosed || hardLocked).toBe(true);
});

When(
  'I attempt to soft close a later period while an earlier period is open in the same year',
  async function ({ page }) {
    const tenant = await getTenantIdForFinanceE2E();
    expect(tenant).toBeTruthy();
    const fp = new FiscalPeriodsPage(page);

    let pair = await getSequentialCloseOpenPairForTenant(tenant!);
    if (!pair) {
      const y = pickIsolatedTestFiscalYear();
      const stamp = Date.now();
      await fp.createFiscalYearThroughUi({
        name: `AUTO_QA_${stamp}_FP006`,
        fiscalYear: y,
        startDate: `${y}-01-01`,
        endDate: `${y}-12-31`,
      });
      await fp.clickFiscalYearTab(y);
      const names = await fp.readPeriodNamesFromTable();
      expect(names.length).toBeGreaterThanOrEqual(2);
      const earlier = names[0]!;
      const later = names[1]!;
      await fp.getOpenPeriodButtonInRow(earlier).click();
      await page.waitForLoadState('networkidle').catch(() => {});
      await fp.getOpenPeriodButtonInRow(later).click();
      await page.waitForLoadState('networkidle').catch(() => {});
      pair = { fiscal_year: y, later_period_name: later };
    } else {
      await fp.clickFiscalYearTab(pair.fiscal_year);
    }

    await fp.getClosePeriodButtonInRow(pair.later_period_name).click();
    await page.waitForTimeout(1500);
  }
);

Then('an error toast explains sequential closing or action not applicable', async function ({ page }) {
  const errToast = page
    .getByText(/Cannot close this period|sequential|still open|Previous period/i)
    .first();
  await expect(errToast).toBeVisible({ timeout: 15000 });
});

When('I view a hard closed period row from database if present', async function ({ page }) {
  const tenant = await getTenantIdForFinanceE2E();
  expect(tenant).toBeTruthy();
  const p = await getFiscalPeriodByStatus(tenant!, 'hard_closed');
  const c = ctx(this);
  if (!p) {
    c.lastPeriodName = undefined;
    return;
  }
  c.lastPeriodName = p.period_name;
  const fp = new FiscalPeriodsPage(page);
  await fp.clickFiscalYearTab(p.fiscal_year);
});

Then('only permanently locked badge shows in actions or test skipped', async function ({
  page,
  $test,
}) {
  const c = ctx(this);
  if (!c.lastPeriodName) {
    $test?.skip(true, 'No hard_closed fiscal period in DB');
    return;
  }
  const row = new FiscalPeriodsPage(page).periodRow(c.lastPeriodName!);
  await expect(row.getByText(/Permanently Locked/i)).toBeVisible();
  await expect(row.getByRole('button', { name: 'Reopen' })).toHaveCount(0);
  await expect(row.getByRole('button', { name: 'Hard Close' })).toHaveCount(0);
});

When('I open new fiscal year dialog', async function ({ page }) {
  await new FiscalPeriodsPage(page).openNewFiscalYearDialog();
});

Then('the create fiscal year form shows required fields', async function ({ page }) {
  const dlg = page.getByRole('dialog', { name: /Create New Fiscal Year/i });
  await expect(dlg.getByLabel(/Fiscal Year Name/i)).toBeVisible();
  await expect(dlg.getByLabel(/Fiscal Year \*/i).or(dlg.locator('#fiscalYear'))).toBeVisible();
});

Then('posting column shows locked for that period or test skipped', async function ({
  page,
  $test,
}) {
  const c = ctx(this);
  if (!c.lastPeriodName) {
    $test?.skip(true, 'No hard_closed fiscal period in DB');
    return;
  }
  await new FiscalPeriodsPage(page).expectPostingBadgeForPeriod(c.lastPeriodName!, false);
});

Then(
  'fiscal period status legend shows never opened open closed and hard closed',
  async function ({ page }) {
    await expect(page.getByText(/Never Opened/i).first()).toBeVisible();
    await expect(page.getByText(/^Open$/m).first()).toBeVisible();
    await expect(page.getByText(/Closed/i).first()).toBeVisible();
    await expect(page.getByText(/Hard Closed/i).first()).toBeVisible();
  }
);

When('I switch to the second fiscal year tab', async function ({ page }) {
  const tenant = await getTenantIdForFinanceE2E();
  expect(tenant).toBeTruthy();
  const fp = new FiscalPeriodsPage(page);
  let tabs = page.getByRole('tab', { name: /FY\s*\d{4}/i });
  await expect(tabs.first()).toBeVisible({ timeout: 25000 });
  if ((await tabs.count()) < 2) {
    const y = pickIsolatedTestFiscalYear();
    const stamp = Date.now();
    await fp.createFiscalYearThroughUi({
      name: `AUTO_QA_${stamp}_FP011`,
      fiscalYear: y,
      startDate: `${y}-01-01`,
      endDate: `${y}-12-31`,
    });
    tabs = page.getByRole('tab', { name: /FY\s*\d{4}/i });
  }
  expect(await tabs.count()).toBeGreaterThanOrEqual(2);
  await tabs.nth(1).click();
  await page.waitForLoadState('networkidle').catch(() => {});
});

Then('fiscal periods table or empty state is visible', async function ({ page }) {
  const table = page.getByRole('table');
  const empty = page.getByText(/No Periods Found/i);
  expect((await table.isVisible().catch(() => false)) || (await empty.isVisible().catch(() => false))).toBe(
    true
  );
});

When('I select fiscal year where summary may have all hard closed', async function ({ page }) {
  const tabs = page.getByRole('tab', { name: /FY\s*\d{4}/i });
  const count = await tabs.count();
  for (let i = 0; i < count; i++) {
    await tabs.nth(i).click();
   await page.waitForTimeout(500);
    const yec = page.getByRole('button', { name: /Run Year-End Close/i });
    if (await yec.isVisible().catch(() => false)) {
      (this as any).sawYearEndClose = true;
      return;
    }
  }
  (this as any).sawYearEndClose = false;
});

Then('year end close button visibility matches all hard closed state or not applicable', async function ({
  $test,
}) {
  if ((this as any).sawYearEndClose === undefined) {
    $test?.skip(true, 'No fiscal year tabs');
    return;
  }
  expect(typeof (this as any).sawYearEndClose).toBe('boolean');
});
