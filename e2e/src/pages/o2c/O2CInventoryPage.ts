import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * O2C Inventory list (read-only verification for E2E).
 *
 * Source: ../web_app/src/app/o2c/inventory/page.tsx, O2CInventoryManagerPage, InventoryTable
 */
export class O2CInventoryPage extends BasePage {
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByPlaceholder(/search inventory/i);
  }

  async goto(): Promise<void> {
    await this.navigateTo('/o2c/inventory');
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page.getByText(/inventory items/i).first()).toBeVisible({ timeout: 20000 });
  }

  async searchInventory(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.page.waitForTimeout(1200);
  }

  /** Warehouse filter is the first combobox in the InventoryTable filter row. */
  async selectWarehouseFilterByName(warehouseNameSubstring: string): Promise<void> {
    const warehouseCombo = this.page.getByRole('combobox').first();
    await warehouseCombo.click();
    await this.page.waitForTimeout(300);
    await this.page.getByRole('option', { name: new RegExp(warehouseNameSubstring.replace(/\s+/g, '\\s*'), 'i') }).click();
    await this.page.waitForTimeout(800);
  }

  async expectNoInventoryRowsMessage(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: /no inventory items found/i })).toBeVisible({
      timeout: 15000,
    });
  }
}
