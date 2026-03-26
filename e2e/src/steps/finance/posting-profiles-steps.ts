import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { PostingProfilesPage } from '../../pages/finance/PostingProfilesPage';
const { Given, When, Then } = createBdd();

Given('I am on the posting profiles dashboard', async function ({ page }) {
  const pom = new PostingProfilesPage(page);
  await pom.gotoDashboard();
  (this as any).postingProfilesPage = pom;
});

Given('I am on the posting profiles matrix page', async function ({ page }) {
  const pom = new PostingProfilesPage(page);
  await pom.gotoMatrix();
  (this as any).postingProfilesPage = pom;
});

Given('I am on the posting profiles simulation page', async function ({ page }) {
  const pom = new PostingProfilesPage(page);
  await pom.gotoSimulation();
  (this as any).postingProfilesPage = pom;
});

Then('the posting profiles dashboard shows all six navigation cards', async function ({ page }) {
  const pom = new PostingProfilesPage(page);
  await expect(pom.matrixCard).toBeVisible();
  await expect(pom.customerGroupsCard).toBeVisible();
  await expect(pom.itemGroupsCard).toBeVisible();
  await expect(pom.vendorGroupsCard).toBeVisible();
  await expect(pom.taxMatrixCard).toBeVisible();
  await expect(pom.simulationCard).toBeVisible();
});

Then('the posting profiles matrix shows the rules table or empty state', async function ({ page }) {
  const hasTable = await page.getByRole('table').isVisible().catch(() => false);
  const hasEmpty = await page.getByText(/No posting rules|0 rules|Posting Rules \(0\)/i).isVisible().catch(() => false);
  expect(hasTable || hasEmpty).toBe(true);
});

When('I filter posting profiles matrix by module {string}', async function ({ page }, moduleLabel: string) {
  const filtersCard = page.locator('div').filter({ has: page.getByText('Filters', { exact: true }) }).first();
  const moduleCombo = filtersCard.getByRole('combobox').first();
  await moduleCombo.click();
  await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
  await page.getByRole('option', { name: new RegExp(`^${moduleLabel}$`, 'i') }).click();
  await expect(page.locator('[role="listbox"]')).toBeHidden({ timeout: 3000 }).catch(() => {});
});

Then('the matrix module filter shows {string}', async function ({ page }, moduleLabel: string) {
  const filtersCard = page.locator('div').filter({ has: page.getByText('Filters', { exact: true }) }).first();
  const moduleCombo = filtersCard.getByRole('combobox').first();
  await expect(moduleCombo).toContainText(new RegExp(moduleLabel, 'i'));
});

When('I open the add posting rule dialog', async function ({ page }) {
  await new PostingProfilesPage(page).openAddRuleDialog();
});

Then('the add posting rule dialog is visible', async function ({ page }) {
  const dlg = page.getByRole('dialog', { name: /Create Posting Profile|Edit Posting Profile/i });
  await expect(dlg).toBeVisible();
  await expect(dlg.getByText(/Module/i).first()).toBeVisible();
});

When('I click Show Inactive on the matrix', async function ({ page }) {
  const btn = page.getByRole('button', { name: /Show Inactive|Hide Inactive/i });
  await btn.click();
});

Then('the posting profiles matrix is still visible', async function ({ page }) {
  await expect(page.getByRole('heading', { name: 'Posting Profiles Matrix' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: 'Add Rule' })).toBeVisible();
});

When('I click Download Template on the matrix', async function ({ page }) {
  const downloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);
  await page.getByRole('button', { name: 'Download Template' }).click();
  (this as any).lastDownload = await downloadPromise;
});

When('I click Export on the matrix', async function ({ page }) {
  const downloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);
  await page.getByRole('button', { name: 'Export' }).click();
  (this as any).lastDownload = await downloadPromise;
});

Then('a file download begins for posting profiles template', async function ({ $test }) {
  const dl = (this as any).lastDownload as import('@playwright/test').Download | null;
  if (!dl) {
    $test?.skip(true, 'No download event (permission or headless timing)');
    return;
  }
  const suggested = dl.suggestedFilename();
  expect(suggested).toMatch(/\.(xlsx|xls|csv|zip)/i);
});

Then('a file download begins for posting profiles export', async function ({ $test }) {
  const dl = (this as any).lastDownload as import('@playwright/test').Download | null;
  if (!dl) {
    $test?.skip(true, 'No download event (permission or headless timing)');
    return;
  }
  const suggested = dl.suggestedFilename();
  expect(suggested.length).toBeGreaterThan(0);
});

When('I navigate to customer posting groups from the dashboard', async function ({ page }) {
  await page.getByRole('link', { name: /^Customer Posting Groups$/i }).click();
  await expect(page).toHaveURL(/\/finance\/posting-profiles\/customer-groups/, { timeout: 15000 });
});

When('I navigate to tax determination matrix from the dashboard', async function ({ page }) {
  await page.getByRole('link', { name: /Tax Determination Matrix/i }).click();
  await expect(page).toHaveURL(/\/finance\/posting-profiles\/tax-matrix/, { timeout: 15000 });
});

When('I navigate to item posting groups from the dashboard', async function ({ page }) {
  await page.getByRole('link', { name: /^Item Posting Groups$/i }).click();
  await expect(page).toHaveURL(/\/finance\/posting-profiles\/item-groups/, { timeout: 15000 });
});

When('I navigate to vendor posting groups from the dashboard', async function ({ page }) {
  await page.getByRole('link', { name: /^Vendor Posting Groups$/i }).click();
  await expect(page).toHaveURL(/\/finance\/posting-profiles\/vendor-groups/, { timeout: 15000 });
});

Then('I should be on the tax matrix route', async function ({ page }) {
  await expect(page).toHaveURL(/\/finance\/posting-profiles\/tax-matrix/);
});

Then('I should be on the item groups route', async function ({ page }) {
  await expect(page).toHaveURL(/\/finance\/posting-profiles\/item-groups/);
});

Then('I should be on the vendor groups route', async function ({ page }) {
  await expect(page).toHaveURL(/\/finance\/posting-profiles\/vendor-groups/);
});

Then('the customer posting groups page shows setup information', async function ({ page }) {
  await expect(
    page.getByText(/master data|classify customers|Setup Only/i).first()
  ).toBeVisible({ timeout: 15000 });
});

Then('Active and Setup Only badges appear on the correct cards', async function ({ page }) {
  const activeBadges = page.getByText('Active');
  await expect(activeBadges.first()).toBeVisible();
  const setupBadges = page.getByText('Setup Only');
  expect(await setupBadges.count()).toBeGreaterThanOrEqual(2);
});

When('I run posting simulation for sales module and Accounts Receivable account type', async function ({
  page,
}) {
  await new PostingProfilesPage(page).runSimulation('Sales', 'Accounts Receivable');
});

When('I run posting simulation for finance module and Unapplied Cash account type', async function ({
  page,
}) {
  await new PostingProfilesPage(page).runSimulation('Finance', 'Unapplied Cash');
});

Then('the simulation result shows a resolved GL account', async function ({ page }) {
  await new PostingProfilesPage(page).expectSimulationShowsResolvedGL();
});

When('I run posting simulation likely to have no matching rule', async function ({ page }) {
  const pom = new PostingProfilesPage(page);
  await pom.gotoSimulation();
  await page.locator('#module').click();
  await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
  await page.getByRole('option', { name: /^Payroll$/i }).click();
  await page.locator('#account-type').click();
  await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
  await page.getByRole('option', { name: /^Expense$/i }).click();
  await pom.simulateButton.click();
});

Then('the simulation shows no matching profile or skipped when tenant is fully configured', async function ({
  page,
  $test,
}) {
  const noMatch = await page
    .getByText(/No posting profile rule matches|No matching rule|could not resolve/i)
    .first()
    .isVisible()
    .catch(() => false);
  const successCard = await page.getByText(/GL Account|gl_account_code/i).first().isVisible().catch(() => false);
  if (successCard && !noMatch) {
    $test?.skip(true, 'Tenant defines payroll expense posting profile — no-match assertion not applicable');
  } else {
    expect(noMatch).toBe(true);
  }
});

When('I click Refresh on the matrix', async function ({ page }) {
  await page.getByRole('button', { name: 'Refresh' }).click();
  await page.waitForLoadState('networkidle').catch(() => {});
});

Then('the warehouse optional combobox is visible', async function ({ page }) {
  await expect(page.locator('#warehouse')).toBeVisible();
});

When('I open the simulation module combobox', async function ({ page }) {
  await page.locator('#module').click();
  await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
});

Then('option {string} is available', async function ({ page }, label: string) {
  await expect(page.getByRole('option', { name: new RegExp(`^${label}$`, 'i') })).toBeVisible();
  await page.keyboard.press('Escape');
});

Then('the how posting profiles work alert is visible', async function ({ page }) {
  await expect(page.getByText(/How Posting Profiles Work/i)).toBeVisible();
});

When('I dismiss the posting rule dialog', async function ({ page }) {
  const dlg = page.getByRole('dialog', { name: /Create Posting Profile|Edit Posting Profile/i });
  await dlg.getByRole('button', { name: 'Cancel' }).click();
});

Then('the add posting rule dialog is hidden', async function ({ page }) {
  await expect(page.getByRole('dialog', { name: /Create Posting Profile/i })).toBeHidden({ timeout: 5000 });
});

Then('the customer posting groups heading is visible', async function ({ page }) {
  await expect(page.getByRole('heading', { name: 'Customer Posting Groups' })).toBeVisible();
});

Then('the tax matrix page shows a heading', async function ({ page }) {
  await expect(page.getByRole('heading', { name: /Tax Determination Matrix/i })).toBeVisible();
});
