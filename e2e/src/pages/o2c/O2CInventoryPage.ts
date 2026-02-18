/**
 * O2C Inventory Page Object Model
 *
 * Source: ../web_app/src/app/o2c/inventory/page.tsx, O2CInventoryManagerPage, InventoryTable
 * Purpose: Interact with /o2c/inventory - search product, filter warehouse, read table (Available, Allocated, Net Available).
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

export interface InventorySnapshotFromUI {
  available: number;
  allocated: number;
  netAvailable: number;
  productId: string;  // not from UI; leave empty or from row if needed
  warehouseId: string;
  inventoryIds: string[];
  rows: { available: number; allocated: number; netAvailable: number }[];
}

export class O2CInventoryPage extends BasePage {
  private readonly inventoryPath = '/o2c/inventory';

  readonly searchInput: Locator;
  /** First combobox in filters = Warehouse dropdown (All Warehouses / Kurnook Warehouse). */
  readonly warehouseSelectTrigger: Locator;
  readonly table: Locator;
  readonly tableBodyRows: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByPlaceholder(/Search inventory.*min 3 characters/i);
    this.warehouseSelectTrigger = page.getByRole('combobox').first();
    this.table = page.getByRole('table');
    this.tableBodyRows = this.table.getByRole('row').filter({ hasNot: page.getByRole('columnheader') });
  }

  async goto(): Promise<void> {
    await this.page.goto(this.inventoryPath);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait until the inventory table has loaded (has at least one data row or empty state).
   */
  async waitForTableLoaded(timeoutMs = 15000): Promise<void> {
    await expect(this.table).toBeVisible({ timeout: timeoutMs });
    await this.page.waitForTimeout(500);
  }

  /**
   * Search inventory by product code (min 3 characters). Triggers server-side search.
   */
  async searchByProductCode(productCode: string): Promise<void> {
    await this.searchInput.fill(productCode);
    await this.page.waitForTimeout(800);
  }

  /**
   * Select warehouse by name (substring match). Opens combobox and selects option containing the name.
   */
  async selectWarehouseByName(warehouseNameSubstring: string): Promise<void> {
    await this.warehouseSelectTrigger.click();
    await this.page.waitForTimeout(400);
    const option = this.page.getByRole('option').filter({ hasText: new RegExp(warehouseNameSubstring, 'i') }).first();
    await option.click();
    await this.page.waitForTimeout(600);
  }

  /**
   * Parse locale-formatted number (e.g. "1,234" or "1234") to number.
   */
  private parseNumber(text: string): number {
    const cleaned = (text || '0').replace(/,/g, '').trim();
    const n = parseInt(cleaned, 10);
    return Number.isNaN(n) ? 0 : n;
  }

  /**
   * Get Available and Allocated from the first data row of the table.
   * Table columns: 0=Product, 1=Location, 2=Available, 3=Allocated, 4=Net Available, 5=Status, 6=Last Updated, 7=Actions
   */
  async getFirstRowAvailableAndAllocated(): Promise<{ available: number; allocated: number; netAvailable: number } | null> {
    const rows = this.tableBodyRows;
    const count = await rows.count();
    if (count === 0) return null;
    const firstRow = rows.first();
    const cells = firstRow.getByRole('cell');
    const availableText = await cells.nth(2).textContent();
    const allocatedText = await cells.nth(3).textContent();
    const netAvailableText = await cells.nth(4).textContent();
    const available = this.parseNumber(availableText || '0');
    const allocated = this.parseNumber(allocatedText || '0');
    const netAvailable = this.parseNumber(netAvailableText || '0');
    return { available, allocated, netAvailable: netAvailable || (available - allocated) };
  }

  /**
   * Aggregate Available/Allocated across all visible data rows (e.g. multiple batches for same product/warehouse).
   */
  async getAggregatedAvailableAllocatedFromVisibleRows(): Promise<{ available: number; allocated: number; netAvailable: number }> {
    const rows = this.tableBodyRows;
    const count = await rows.count();
    let available = 0;
    let allocated = 0;
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const cells = row.getByRole('cell');
      const a = this.parseNumber(await cells.nth(2).textContent() || '0');
      const b = this.parseNumber(await cells.nth(3).textContent() || '0');
      available += a;
      allocated += b;
    }
    return { available, allocated, netAvailable: available - allocated };
  }

  /**
   * Full flow: navigate to inventory, search product, select warehouse, wait for table, return snapshot from first row (or aggregated).
   * Returns null if no data rows are visible (filters did not match or no inventory).
   */
  async noteInventoryFromUI(
    productCode: string,
    warehouseNameSubstring: string,
    aggregateAllVisibleRows = true
  ): Promise<InventorySnapshotFromUI | null> {
    await this.goto();
    await this.waitForTableLoaded();
    await this.searchByProductCode(productCode);
    await this.selectWarehouseByName(warehouseNameSubstring);
    await this.page.waitForTimeout(1500);
    const rowCount = await this.tableBodyRows.count();
    if (rowCount === 0) return null;
    if (aggregateAllVisibleRows) {
      const agg = await this.getAggregatedAvailableAllocatedFromVisibleRows();
      return {
        available: agg.available,
        allocated: agg.allocated,
        netAvailable: agg.netAvailable,
        productId: '',
        warehouseId: '',
        inventoryIds: [],
        rows: [{ available: agg.available, allocated: agg.allocated, netAvailable: agg.netAvailable }],
      };
    }
    const first = await this.getFirstRowAvailableAndAllocated();
    if (!first) return null;
    return {
      ...first,
      productId: '',
      warehouseId: '',
      inventoryIds: [],
      rows: [first],
    };
  }
}
