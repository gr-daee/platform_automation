import { expect, test, type Page } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { WarehouseInventoryPage } from '../../pages/o2c/WarehouseInventoryPage';

const { Given, When, Then } = createBdd();

function ctxPage(self: unknown, page: Page): WarehouseInventoryPage {
  const c = self as { whInvPage?: WarehouseInventoryPage };
  return c.whInvPage ?? new WarehouseInventoryPage(page);
}

Given('I am on the warehouse inventory page', async function ({ page }) {
  const p = new WarehouseInventoryPage(page);
  await p.goto();
  await p.verifyPageShellVisible();
  (this as { whInvPage: WarehouseInventoryPage }).whInvPage = p;
});

Then('I should see warehouse inventory heading and subtitle', async function ({ page }) {
  const p = ctxPage(this, page);
  await expect(p.pageHeading).toBeVisible();
  await expect(p.pageSubtitle).toBeVisible();
});

Then('warehouse inventory analytics cards should be visible', async function ({ page }) {
  const p = ctxPage(this, page);
  await p.expectAnalyticsCardsVisible();
});

Then('inventory items tab should show inventory grid', async function ({ page }) {
  const p = ctxPage(this, page);
  await p.expectInventoryItemsTabContentVisible();
});

When('I open the warehouse inventory Allocations tab', async function ({ page }) {
  const p = ctxPage(this, page);
  await p.clickTab(/^Allocations/);
});

Then('warehouse inventory allocations content should be visible', async function ({ page }) {
  const p = ctxPage(this, page);
  await p.expectAllocationsTabContentVisible();
});

When('I open the warehouse inventory Analytics tab', async function ({ page }) {
  const p = ctxPage(this, page);
  await p.clickTab('Analytics');
});

Then('warehouse inventory analytics tab content should be visible', async function ({ page }) {
  const p = ctxPage(this, page);
  await p.expectAnalyticsTabContentVisible();
});

When('I open the warehouse inventory Settings tab', async function ({ page }) {
  const p = ctxPage(this, page);
  await p.clickTab('Settings');
});

Then('warehouse inventory settings should show coming soon', async function ({ page }) {
  const p = ctxPage(this, page);
  await p.expectSettingsComingSoonVisible();
});

When('I type {string} into warehouse inventory search', async function ({ page }, text: string) {
  const p = ctxPage(this, page);
  await p.searchInput.fill(text);
});

Then('warehouse inventory search should require three characters message', async function ({ page }) {
  const p = ctxPage(this, page);
  await expect(p.page.getByText('Type at least 3 characters to search', { exact: true })).toBeVisible({
    timeout: 10000,
  });
});

When('I refresh warehouse inventory list', async function ({ page }) {
  const p = ctxPage(this, page);
  await expect(p.refreshButton).toBeEnabled();
  await p.refreshButton.click();
  await expect(p.refreshButton).toBeEnabled({ timeout: 120000 });
});

Then('warehouse inventory grid should be ready', async function ({ page }) {
  const p = ctxPage(this, page);
  await p.waitForInventoryGridReady();
});

When('I select warehouse inventory status {string}', async function ({ page }, optionLabel: string) {
  const p = ctxPage(this, page);
  await p.selectInventoryStatus(optionLabel);
});

When(
  'I select warehouse inventory warehouse matching {string}',
  async function ({ page }, substring: string) {
    const p = ctxPage(this, page);
    await p.inventoryTabPanel().getByRole('combobox').nth(0).click();
    const opts = page.getByRole('option', { name: new RegExp(substring, 'i') });
    if ((await opts.count()) < 1) {
      await page.keyboard.press('Escape');
      test.skip(true, `No warehouse option matching "${substring}" in this tenant.`);
    }
    await opts.first().click();
    await expect(page.locator('[role="listbox"]')).toBeHidden({ timeout: 5000 });
    await expect(page.getByRole('button', { name: 'Refresh', exact: true })).toBeEnabled({ timeout: 120000 });
  }
);

When('I reset warehouse inventory warehouse filter to all', async function ({ page }) {
  const p = ctxPage(this, page);
  await p.selectInventoryWarehouseAll();
});

Then(
  'warehouse inventory results summary should include search query {string}',
  async function ({ page }, query: string) {
    const p = ctxPage(this, page);
    await p.expectInventoryResultsSummaryContainsSearchQuery(query);
  }
);

Then('warehouse inventory results summary should show waiting for search characters', async function ({ page }) {
  const p = ctxPage(this, page);
  await p.expectInventoryResultsSummaryWaitingForChars();
});

When('I go to the next warehouse inventory results page', async function ({ page }) {
  const p = ctxPage(this, page);
  await p.waitForInventoryGridReady();
  const indicator = page.getByText(/^Page \d+ of \d+$/);
  const text = await indicator.textContent();
  if (text?.trim() === 'Page 1 of 1') {
    test.skip(true, 'Inventory fits on one page in this environment; pagination not testable.');
  }
  await p.clickInventoryNextPage();
});

Then('warehouse inventory pagination page index should be greater than {int}', async function ({ page }, n: number) {
  const p = ctxPage(this, page);
  await p.expectInventoryPaginationPageNumberGreaterThan(n);
});

When('I set warehouse inventory page size to {string}', async function ({ page }, label: string) {
  const p = ctxPage(this, page);
  await p.selectInventoryPageSize(label);
});

Then('warehouse inventory page size control should show {string}', async function ({ page }, label: string) {
  const p = ctxPage(this, page);
  await expect(p.inventoryTabPanel().getByRole('combobox').nth(3)).toContainText(label);
});

Then(
  'warehouse inventory footer end index should be at most {int}',
  async function ({ page }, maxEnd: number) {
    const row = page.getByText(/^Showing \d+ to \d+ of \d+ inventory items$/).first();
    await expect(row).toBeVisible({ timeout: 60000 });
    const t = await row.textContent();
    const m = t?.match(/^Showing (\d+) to (\d+) of (\d+) inventory items$/);
    expect(m).toBeTruthy();
    expect(parseInt(m![2], 10)).toBeLessThanOrEqual(maxEnd);
  }
);
