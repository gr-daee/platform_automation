import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * Purchase Orders List Page Object Model (Phase 4)
 *
 * Source: ../web_app/src/app/p2p/purchase-orders/page.tsx (expected)
 *
 * Purpose: View PO list and open a PO detail.
 */
export class PurchaseOrdersPage extends BasePage {
  readonly heading: Locator;
  readonly table: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: /Purchase Orders/i });
    this.table = page.locator('table');
    this.emptyState = page.getByText(/No purchase orders found|No .* found|empty/i);
  }

  async goto(): Promise<void> {
    await this.navigateTo('/p2p/purchase-orders');
    await this.page.waitForLoadState('networkidle');
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 15000 });
  }

  async openFirstPurchaseOrder(): Promise<void> {
    const firstRow = this.page.locator('table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 15000 });
    await firstRow.click();
    await this.page.waitForURL(/\/p2p\/purchase-orders\/[^/]+$/);
  }

  async openFirstByStatus(status: string): Promise<void> {
    const row = this.page.locator('table tbody tr').filter({ hasText: status }).first();
    await expect(row).toBeVisible({ timeout: 15000 });
    await row.click();
    await this.page.waitForURL(/\/p2p\/purchase-orders\/[^/]+$/);
  }

  async hasAtLeastOnePO(): Promise<boolean> {
    const hasRows = (await this.page.locator('table tbody tr').count()) > 0;
    const emptyVisible = await this.emptyState.isVisible().catch(() => false);
    return hasRows && !emptyVisible;
  }
}

