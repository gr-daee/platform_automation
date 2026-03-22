import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * Warehouse Picklist modal (from Sales Order → View Picklist).
 *
 * Source: ../web_app/src/app/warehouse-management/warehouses/components/WarehousePicklistDialog.tsx
 */
export class WarehousePicklistDialogPage extends BasePage {
  readonly dialog: Locator;

  constructor(page: Page) {
    super(page);
    this.dialog = page.getByRole('dialog').filter({ hasText: /Warehouse Picklist/i });
  }

  async waitForLoaded(): Promise<void> {
    await expect(this.dialog).toBeVisible({ timeout: 30000 });
    await expect(this.dialog.getByText(/Loading Picklist/i)).toBeHidden({ timeout: 60000 });
    await expect(this.dialog.getByText(/Loading picklist data/i)).toBeHidden({ timeout: 60000 }).catch(() => {});
  }

  async clickStartPickingProcessIfVisible(): Promise<void> {
    const btn = this.dialog.getByRole('button', { name: /Start Picking Process/i });
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await this.page.waitForTimeout(500);
      await expect(this.dialog.getByRole('button', { name: /Start Picking Process/i })).toBeHidden({ timeout: 30000 }).catch(() => {});
    }
  }

  async openPickItemsTab(): Promise<void> {
    const tab = this.dialog.getByRole('tab', { name: /Pick Items/i });
    await expect(tab).toBeVisible({ timeout: 15000 });
    await tab.click();
    await this.page.waitForTimeout(400);
  }

  /** Tab panel that lists line items (avoids matching disabled Pick buttons in other tabs/footers). */
  private pickItemsPanel(): Locator {
    return this.dialog.getByRole('tabpanel').filter({ hasText: /FEFO Ordered|Items to Pick/i });
  }

  /**
   * Pick every line that still shows a Pick action (pending / picking), using FEFO batch confirm dialog.
   */
  async pickAllItemsWithBatchConfirm(): Promise<void> {
    const panel = this.pickItemsPanel();
    const maxRounds = 20;
    for (let round = 0; round < maxRounds; round += 1) {
      await expect(this.dialog.locator('.animate-spin').first()).toBeHidden({ timeout: 120000 }).catch(() => {});

      // Pending items: Start Pick then Pick (Pick disabled while isProcessing)
      const startPickBtn = panel.getByRole('button', { name: /^Start Pick$/i }).first();
      if (await startPickBtn.isVisible().catch(() => false)) {
        await startPickBtn.click();
        await this.page.waitForTimeout(600);
      }

      const pickBtn = panel.getByRole('button', { name: /^Pick$/i }).first();
      if (!(await pickBtn.isVisible().catch(() => false))) {
        break;
      }
      await expect(pickBtn).toBeEnabled({ timeout: 120000 });
      await pickBtn.click();

      const batchDialog = this.page.getByRole('alertdialog', { name: /Confirm Batch|Pick Remaining/i });
      await expect(batchDialog).toBeVisible({ timeout: 15000 });

      const confirmPick = batchDialog.getByRole('button', { name: /Confirm Pick/i });
      await expect(confirmPick).toBeEnabled({ timeout: 30000 });
      await confirmPick.click();

      await expect(batchDialog).toBeHidden({ timeout: 60000 });
      await this.page.waitForTimeout(1200);
    }
  }

  async clickCompletePicklist(): Promise<void> {
    const complete = this.dialog.getByRole('button', { name: /^Complete Picklist$/i });
    await expect(complete).toBeVisible({ timeout: 15000 });
    await expect(complete).toBeEnabled({ timeout: 15000 });
    await complete.click();
  }

  async confirmCompletePicklistInAlert(): Promise<void> {
    const confirm = this.page.getByRole('alertdialog', { name: /Complete Picklist/i });
    await expect(confirm).toBeVisible({ timeout: 10000 });
    await confirm.getByRole('button', { name: /^Complete Picklist$/i }).click();
    await expect(confirm).toBeHidden({ timeout: 60000 });
  }

  async waitForDialogClosed(): Promise<void> {
    await expect(this.dialog).toBeHidden({ timeout: 90000 });
  }
}
