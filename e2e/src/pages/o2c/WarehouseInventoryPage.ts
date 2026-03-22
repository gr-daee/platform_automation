import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * Warehouse Inventory (WH-INV) — list shell at `/o2c/inventory`.
 *
 * Source: ../web_app/src/app/o2c/inventory/page.tsx,
 *         ../web_app/src/app/o2c/components/O2CInventoryManagerPage.tsx
 *
 * **Route note:** Canonical URL may move to `/warehouses/inventory`; keep `LIST_PATH` in one place.
 */
export class WarehouseInventoryPage extends BasePage {
  /** Current app route; update when product migrates to warehouse path. */
  static readonly LIST_PATH = '/o2c/inventory';

  readonly pageHeading: Locator;
  readonly pageSubtitle: Locator;
  readonly refreshButton: Locator;
  readonly addInventoryButton: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole('heading', { name: 'Inventory Management', exact: true });
    this.pageSubtitle = page.getByText('Manage inventory across warehouses and zones with real-time tracking', {
      exact: true,
    });
    this.refreshButton = page.getByRole('button', { name: 'Refresh', exact: true });
    this.addInventoryButton = page.getByRole('button', { name: 'Add Inventory', exact: true });
    this.searchInput = page.getByPlaceholder('Search inventory (min 3 characters)...');
  }

  async goto(): Promise<void> {
    await this.navigateTo(WarehouseInventoryPage.LIST_PATH);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyPageShellVisible(): Promise<void> {
    await expect(this.pageHeading).toBeVisible({ timeout: 30000 });
  }

  async expectAnalyticsCardsVisible(): Promise<void> {
    await expect(this.page.getByText('Total Items', { exact: true }).first()).toBeVisible({ timeout: 60000 });
    await expect(this.page.getByText('Low Stock Items', { exact: true }).first()).toBeVisible();
    await expect(this.page.getByText('Total Allocated', { exact: true }).first()).toBeVisible();
  }

  async clickTab(tabLabel: RegExp | string): Promise<void> {
    const pattern = typeof tabLabel === 'string' ? new RegExp(`^${tabLabel}`, 'i') : tabLabel;
    await this.page.getByRole('tab', { name: pattern }).click();
  }

  /** Inventory Items tab: grid has Product column after load (empty dataset still has headers). */
  async waitForInventoryGridReady(): Promise<void> {
    await expect(this.page.getByRole('columnheader', { name: 'Product', exact: true })).toBeVisible({
      timeout: 120000,
    });
  }

  /** Card title is a `div` (shadcn CardTitle), not a heading — anchor on search + grid. */
  async expectInventoryItemsTabContentVisible(): Promise<void> {
    await expect(this.searchInput).toBeVisible({ timeout: 120000 });
    await this.waitForInventoryGridReady();
  }

  async expectAllocationsTabContentVisible(): Promise<void> {
    const allocationsPanel = this.page.getByRole('tabpanel').filter({
      has: this.page.getByPlaceholder('Search allocations...'),
    });
    await expect(allocationsPanel).toBeVisible({ timeout: 60000 });
    await expect(this.page.getByPlaceholder('Search allocations...')).toBeVisible();
  }

  async expectAnalyticsTabContentVisible(): Promise<void> {
    await expect(
      this.page
        .getByRole('heading', { name: 'Inventory Analytics Dashboard', exact: true })
        .or(this.page.getByText('Loading dashboard...', { exact: true }))
        .or(this.page.getByText('No dashboard data available', { exact: true }))
    ).toBeVisible({ timeout: 90000 });
  }

  async expectSettingsComingSoonVisible(): Promise<void> {
    await expect(this.page.getByRole('button', { name: 'Coming Soon', exact: true })).toBeVisible({
      timeout: 15000,
    });
  }

  /** Filters + grid + pagination live under the Inventory Items tabpanel. */
  inventoryTabPanel(): Locator {
    return this.page.getByRole('tabpanel', { name: /^Inventory Items$/ });
  }

  async selectInventoryWarehouseAll(): Promise<void> {
    const panel = this.inventoryTabPanel();
    await panel.getByRole('combobox').nth(0).click();
    await this.page.getByRole('option', { name: 'All Warehouses', exact: true }).click();
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 5000 });
    await expect(this.page.getByRole('button', { name: 'Refresh', exact: true })).toBeEnabled({ timeout: 120000 });
  }

  async selectInventoryStatus(optionLabel: string): Promise<void> {
    const panel = this.inventoryTabPanel();
    await panel.getByRole('combobox').nth(2).click();
    await this.page.getByRole('option', { name: optionLabel, exact: true }).click();
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 5000 });
    await expect(this.page.getByRole('button', { name: 'Refresh', exact: true })).toBeEnabled({ timeout: 120000 });
  }

  async expectInventoryResultsSummaryContainsSearchQuery(query: string): Promise<void> {
    const esc = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await expect(this.inventoryTabPanel().getByText(new RegExp(`Search:\\s*"${esc}"`))).toBeVisible({
      timeout: 60000,
    });
  }

  async expectInventoryResultsSummaryWaitingForChars(): Promise<void> {
    await expect(
      this.inventoryTabPanel().getByText(/Waiting for 3\+ characters to search/)
    ).toBeVisible({ timeout: 15000 });
  }

  async clickInventoryNextPage(): Promise<void> {
    await this.waitForInventoryGridReady();
    const indicator = this.page.getByText(/^Page \d+ of \d+$/);
    const before = await indicator.textContent();
    const buttonRow = indicator.locator('..');
    await buttonRow.getByRole('button').nth(2).click();
    await expect(this.page.getByRole('button', { name: 'Refresh', exact: true })).toBeEnabled({ timeout: 120000 });
    await expect(indicator).not.toHaveText(before ?? '');
  }

  async expectInventoryPaginationPageNumberGreaterThan(n: number): Promise<void> {
    const indicator = this.page.getByText(/^Page (\d+) of \d+$/);
    await expect(indicator).toBeVisible();
    const text = await indicator.textContent();
    const m = text?.match(/^Page (\d+) of/);
    expect(m).toBeTruthy();
    expect(parseInt(m![1], 10)).toBeGreaterThan(n);
  }

  async selectInventoryPageSize(label: string): Promise<void> {
    const panel = this.inventoryTabPanel();
    await panel.getByRole('combobox').nth(3).click();
    await this.page.getByRole('option', { name: label, exact: true }).click();
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 5000 });
    await expect(this.page.getByRole('button', { name: 'Refresh', exact: true })).toBeEnabled({ timeout: 120000 });
  }
}
