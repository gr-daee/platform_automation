import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

When('I open page {string}', async function ({ page }, path: string) {
  (this as any).ca39CurrentPath = path;
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  const loadingText = page.getByText(/Initializing|Loading permissions/i).first();
  if (await loadingText.isVisible().catch(() => false)) {
    await expect(loadingText).toBeHidden({ timeout: 30000 });
  }
});

When('I prepare CA39 context for page {string}', async function ({ page }, path: string) {
  if (path === '/finance/audit-trail') {
    const showFilters = page.getByRole('button', { name: /show filters/i }).first();
    if (await showFilters.isVisible().catch(() => false)) {
      await showFilters.click();
    }
    return;
  }

  if (path === '/finance/fiscal-periods') {
    const newFiscalYear = page.getByRole('button', { name: /new fiscal year/i }).first();
    if (await newFiscalYear.isVisible().catch(() => false)) {
      await newFiscalYear.click();
    }
    return;
  }

  if (path === '/p2p/supplier-invoices/create') {
    const selectSupplier = page.getByRole('button', { name: /select supplier/i }).first();
    if (await selectSupplier.isVisible().catch(() => false)) {
      await selectSupplier.click();
    }
  }
});

When('I open tab {string}', async function ({ page }, tabName: string) {
  const tab = page.getByRole('tab', { name: new RegExp(tabName, 'i') }).first();
  await expect(tab).toBeVisible({ timeout: 10000 });
  await tab.click();
});

Then(
  'combobox under label {string} should support generic search query {string}',
  async function ({ page }, labelText: string, query: string) {
    const container = page.locator('div').filter({ hasText: new RegExp(labelText, 'i') }).first();
    const trigger = container.locator('[role="combobox"]').first();
    await expect(trigger).toBeVisible({ timeout: 15000 });
    await trigger.click();

    const searchInput = page.getByRole('textbox').first();
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    await searchInput.fill(query);
    await expect(searchInput).toHaveValue(query);
    await page.keyboard.press('Escape');
  }
);

Then(
  'page should expose a searchable combobox with query {string}',
  async function ({ page }, query: string) {
    const currentPath = ((this as any).ca39CurrentPath as string) || '';
    const dialog = page.getByRole('dialog').first();
    const dialogSearchInput = dialog.getByRole('textbox').first();

    // Some selectors open searchable dialog directly (without combobox role).
    if (
      currentPath === '/p2p/supplier-invoices/create' &&
      (await dialog.isVisible().catch(() => false)) &&
      (await dialogSearchInput.isVisible().catch(() => false))
    ) {
      await dialogSearchInput.fill(query);
      await expect(dialogSearchInput).toHaveValue(query);
      return;
    }

    // AR aging has searchable dealer input and page-level filters that may not expose role=combobox.
    if (currentPath === '/finance/ar-aging') {
      const arSearch = page
        .getByPlaceholder(/Search by dealer name, code, or invoice number/i)
        .first();
      await expect(arSearch).toBeVisible({ timeout: 10000 });
      await arSearch.fill(query);
      await expect(arSearch).toHaveValue(query);
      return;
    }

    const comboboxes = page.locator('[role="combobox"]');
    const count = await comboboxes.count();
    expect(count).toBeGreaterThan(0);

    let validated = false;
    for (let i = 0; i < Math.min(count, 12); i++) {
      const combo = comboboxes.nth(i);
      if (!(await combo.isVisible().catch(() => false))) continue;

      await combo.click({ timeout: 3000 }).catch(() => {});

      const textInput = page
        .locator('input[placeholder*="search" i], [role="dialog"] input[type="text"], [role="textbox"]')
        .first();

      const visible = await textInput
        .isVisible({ timeout: 1500 } as any)
        .catch(async () => await textInput.isVisible().catch(() => false));
      if (!visible) {
        await page.keyboard.press('Escape').catch(() => {});
        continue;
      }

      await textInput.fill(query);
      await expect(textInput).toHaveValue(query);
      await page.keyboard.press('Escape').catch(() => {});
      validated = true;
      break;
    }

    expect(validated).toBe(true);
  }
);

Then(
  'combobox {string} should support search input {string} with query {string}',
  async function ({ page }, triggerText: string, searchPlaceholder: string, query: string) {
    const escaped = triggerText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let trigger = page.getByRole('combobox', { name: new RegExp(escaped, 'i') }).first();
    if (!(await trigger.isVisible().catch(() => false))) {
      trigger = page.locator('[role="combobox"]').filter({ hasText: new RegExp(escaped, 'i') }).first();
    }
    await expect(trigger).toBeVisible({ timeout: 15000 });
    await trigger.click();

    const searchInput = page.getByPlaceholder(searchPlaceholder).first();
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    await searchInput.fill(query);
    await expect(searchInput).toHaveValue(query);

    // Keep assertion generic across enum/FK dropdowns: either options remain or no-results text appears.
    const option = page.getByRole('option').first();
    const noResults = page.getByText(/no .* found|no results/i).first();
    const hasOption = await option.isVisible().catch(() => false);
    const hasNoResults = await noResults.isVisible().catch(() => false);
    expect(hasOption || hasNoResults).toBe(true);

    await page.keyboard.press('Escape');
  }
);
