import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

When('I open dealers list page', async function ({ page }) {
  await page.goto('/dealers', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');

  const loadingText = page.getByText(/Initializing|Loading permissions/i).first();
  if (await loadingText.isVisible().catch(() => false)) {
    await expect(loadingText).toBeHidden({ timeout: 30000 });
  }
});

Then('the dealers list should show {string} column', async function ({ page }, columnName: string) {
  const table = page.locator('table').first();
  await expect(table).toBeVisible({ timeout: 20000 });
  await expect(table.getByRole('columnheader', { name: new RegExp(columnName, 'i') })).toBeVisible({
    timeout: 10000,
  });
});

Then('at least one dealer row should display city in the location column', async function ({ page }) {
  const cityIconInLocationColumn = page.locator('table tbody tr td:nth-child(5) svg.text-purple-500');
  await expect(cityIconInLocationColumn.first()).toBeVisible({ timeout: 20000 });
  const iconCount = await cityIconInLocationColumn.count();
  expect(iconCount).toBeGreaterThan(0);
});
