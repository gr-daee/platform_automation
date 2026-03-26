import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * Work Orders Page Object Model
 *
 * Source: ../web_app/src/app/plant-production/work-orders/
 * Components: WorkOrdersManagerPage.tsx, WorkOrderFormDialog.tsx
 *
 * Covers:
 * - Production Work Orders list page
 * - Create / Edit Work Order dialog (BOM-driven + manual modes)
 * - Status filtering, search, approve, cancel, delete actions
 */
export class WorkOrdersPage extends BasePage {
  // ── Navigation ──────────────────────────────────────────────────────────────
  readonly url = '/plant-production/work-orders';

  // ── List page controls ──────────────────────────────────────────────────────
  readonly searchInput: Locator;
  readonly newWorkOrderButton: Locator;
  readonly statusFilterSelect: Locator;
  readonly sourceTypeFilterSelect: Locator;

  // ── Create/Edit dialog ───────────────────────────────────────────────────────
  get dialog(): Locator { return this.page.getByRole('dialog'); }

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByPlaceholder('Search work orders...');
    this.newWorkOrderButton = page.getByRole('button', { name: 'New Work Order' });
    this.statusFilterSelect = page.getByRole('combobox').nth(0);
    this.sourceTypeFilterSelect = page.getByRole('combobox').nth(2);
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
    console.log('✅ [WO] Navigated to Work Orders page');
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Production Work Orders' })).toBeVisible({ timeout: 15000 });
    console.log('✅ [WO] Work Orders page loaded');
  }

  // ── Dialog management ────────────────────────────────────────────────────────

  async openCreateDialog(): Promise<void> {
    await this.newWorkOrderButton.click();
    await this.dialog.waitFor({ state: 'visible', timeout: 10000 });
    // Wait for tenant config and options to load (isLoadingConfig + isLoadingOptions)
    await this.page.waitForTimeout(3000);
    console.log('✅ [WO] Create Work Order dialog opened');
  }

  async closeDialogForce(): Promise<void> {
    const isOpen = await this.dialog.isVisible().catch(() => false);
    if (isOpen) {
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(300);
    }
    // If still open, navigate away
    if (await this.dialog.isVisible().catch(() => false)) {
      await this.goto();
    }
    console.log('✅ [WO] Force-closed dialog');
  }

  // ── Form filling (BOM-driven mode) ───────────────────────────────────────────

  async selectBOMMode(mode: 'bom_driven' | 'manual'): Promise<void> {
    const label = mode === 'bom_driven' ? 'BOM-Driven' : 'Manual';
    const radio = this.dialog.getByRole('radio', { name: new RegExp(label, 'i') });
    const radioVisible = await radio.isVisible({ timeout: 3000 }).catch(() => false);
    if (radioVisible) {
      await radio.click();
      console.log(`✅ [WO] Selected ${label} mode`);
    }
  }

  async selectBOM(searchText = '__any__'): Promise<string> {
    const bomBtn = this.dialog.getByRole('button', { name: /Select BOM|Search.*BOM/i });
    await bomBtn.click();
    await this.page.waitForTimeout(500);

    const selectDialog = this.page.locator('[role="dialog"]').last();
    await selectDialog.waitFor({ state: 'visible', timeout: 15000 });

    // Wait for rows or empty state
    let hasRows = false;
    for (let i = 0; i < 15; i++) {
      const rowCount = await selectDialog.locator('tbody tr').count().catch(() => 0);
      const hasEmpty = await selectDialog.getByText(/No BOMs|No results/i).isVisible().catch(() => false);
      if (rowCount > 0 || hasEmpty) {
        hasRows = rowCount > 0;
        break;
      }
      await this.page.waitForTimeout(1000);
    }

    if (!hasRows) {
      await this.page.keyboard.press('Escape');
      console.warn('⚠️ [WO] No BOMs available in dialog');
      return '';
    }

    if (searchText !== '__any__') {
      const searchInput = selectDialog.getByPlaceholder(/search/i).first();
      await searchInput.fill(searchText);
      await this.page.waitForTimeout(800);
    }

    const firstRow = selectDialog.locator('tbody tr').first();
    const noData = await selectDialog.getByText(/No BOMs|No results/i).isVisible().catch(() => false);
    if (noData) {
      await this.page.keyboard.press('Escape');
      console.warn('⚠️ [WO] No matching BOMs found');
      return '';
    }

    const name = (await firstRow.locator('td').nth(1).textContent() || '').trim();
    await firstRow.getByRole('button', { name: 'Select' }).click();
    console.log(`✅ [WO] Selected BOM: ${name}`);
    return name;
  }

  async selectProduct(searchText = '__any__'): Promise<string> {
    // Wait for loading options to complete (button is disabled while isLoadingOptions=true)
    // Button contains "Select product..." text (or product name if already selected)
    const productBtn = this.dialog.locator('button').filter({ hasText: /Select product\.\.\./i }).first();
    // Wait for button to be attached and scroll into view
    await productBtn.waitFor({ state: 'attached', timeout: 20000 });
    await productBtn.scrollIntoViewIfNeeded().catch(() => null);
    // Wait for button to be visible AND enabled (may take a while for tenant config to load)
    await productBtn.waitFor({ state: 'visible', timeout: 20000 });
    await expect(productBtn).toBeEnabled({ timeout: 20000 });
    await productBtn.click();
    await this.page.waitForTimeout(500);

    const selectDialog = this.page.locator('[role="dialog"]').last();
    await selectDialog.waitFor({ state: 'visible', timeout: 15000 });

    // Wait for rows or empty state
    let hasRows = false;
    for (let i = 0; i < 15; i++) {
      const rowCount = await selectDialog.locator('tbody tr').count().catch(() => 0);
      const hasEmpty = await selectDialog.getByText(/No products|No results/i).isVisible().catch(() => false);
      if (rowCount > 0 || hasEmpty) {
        hasRows = rowCount > 0;
        break;
      }
      await this.page.waitForTimeout(1000);
    }

    if (searchText !== '__any__') {
      const searchInput = selectDialog.getByPlaceholder(/search/i).first();
      await searchInput.fill(searchText);
      await this.page.waitForTimeout(800);
    }

    const firstRow = selectDialog.locator('tbody tr').first();
    const noData = await selectDialog.getByText(/No products|No results/i).isVisible().catch(() => false);
    if (noData || !hasRows) {
      await this.page.keyboard.press('Escape');
      return '';
    }

    const name = (await firstRow.locator('td').nth(1).textContent() || '').trim();
    await firstRow.getByRole('button', { name: 'Select' }).click();
    console.log(`✅ [WO] Selected product: ${name}`);
    return name;
  }

  async selectPlant(searchText = '__any__'): Promise<string> {
    // The plant select button appears inside the dialog.
    // Wait for loading options to complete (isLoadingOptions=false → button enabled)
    const plantBtn = this.dialog.locator('button').filter({ hasText: /Select plant\.\.\./i }).first();
    // Wait for button to be attached to DOM first (may take time for plants to load)
    await plantBtn.waitFor({ state: 'attached', timeout: 20000 }).catch(() => null);
    // Scroll into view in case it's below the visible area of the dialog
    await plantBtn.scrollIntoViewIfNeeded().catch(() => null);
    const plantBtnVisible = await plantBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (!plantBtnVisible) {
      console.warn('⚠️ [WO] Plant select button not found — skipping plant selection');
      return '';
    }
    await expect(plantBtn).toBeEnabled({ timeout: 20000 });
    await this.page.waitForTimeout(500);

    await plantBtn.click();
    // Wait for a new dialog to appear (the SearchableSelectDialog)
    await this.page.waitForTimeout(1000);

    // Grab the dialog — may be scoped to the last/deepest one
    const selectDialog = this.page.locator('[role="dialog"]').last();
    const selectDialogVisible = await selectDialog.isVisible({ timeout: 10000 }).catch(() => false);
    if (!selectDialogVisible) {
      console.warn('⚠️ [WO] Plant selection dialog did not open');
      return '';
    }

    // Wait for rows or empty state (up to 15s)
    let hasRows = false;
    for (let i = 0; i < 15; i++) {
      const rowCount = await selectDialog.locator('tbody tr').count().catch(() => 0);
      const hasEmpty = await selectDialog.getByText(/No plants|No results/i).isVisible().catch(() => false);
      if (rowCount > 0 || hasEmpty) {
        hasRows = rowCount > 0;
        break;
      }
      await this.page.waitForTimeout(1000);
    }

    if (searchText !== '__any__') {
      const searchInput = selectDialog.getByPlaceholder(/search/i).first();
      await searchInput.fill(searchText);
      await this.page.waitForTimeout(800);
    }

    const firstRow = selectDialog.locator('tbody tr').first();
    const noData = await selectDialog.getByText(/No plants|No results/i).isVisible().catch(() => false);
    if (noData || !hasRows) {
      console.warn('⚠️ [WO] No plants available in dialog');
      await this.page.keyboard.press('Escape');
      return '';
    }

    const name = (await firstRow.locator('td').first().textContent() || '').trim();
    await firstRow.getByRole('button', { name: 'Select' }).click();
    await this.page.waitForTimeout(500);
    console.log(`✅ [WO] Selected plant: ${name}`);
    return name;
  }

  async fillQuantity(qty: number): Promise<void> {
    // WO form uses type="text" with inputMode="decimal" (not type="number")
    const input = this.dialog.getByLabel(/Quantity/i);
    const inputVisible = await input.isVisible({ timeout: 3000 }).catch(() => false);
    if (inputVisible) {
      await input.clear();
      await input.fill(String(qty));
    } else {
      // Fallback: find first text/decimal input in the dialog
      const textInput = this.dialog.locator('input[inputmode="decimal"], input[placeholder*="1000"], input[placeholder*="e.g"]').first();
      await textInput.fill(String(qty));
    }
    await this.page.keyboard.press('Tab');
    console.log(`✅ [WO] Set quantity: ${qty}`);
  }

  async fillPlannedStartDate(date: string): Promise<void> {
    const input = this.dialog.locator('#planned_start_date');
    const visible = await input.isVisible({ timeout: 3000 }).catch(() => false);
    if (visible) {
      await input.fill(date);
    } else {
      await this.dialog.locator('input[type="date"]').first().fill(date);
    }
    await this.page.keyboard.press('Tab');
    console.log(`✅ [WO] Set planned start: ${date}`);
  }

  async fillPlannedEndDate(date: string): Promise<void> {
    const input = this.dialog.locator('#planned_end_date');
    const visible = await input.isVisible({ timeout: 3000 }).catch(() => false);
    if (visible) {
      await input.fill(date);
    } else {
      await this.dialog.locator('input[type="date"]').nth(1).fill(date);
    }
    await this.page.keyboard.press('Tab');
    console.log(`✅ [WO] Set planned end: ${date}`);
  }

  async submitForm(): Promise<void> {
    // Button text: "Create Work Order" (create mode) or "Update Work Order" (edit mode)
    const submitBtn = this.dialog.getByRole('button', { name: /Create Work Order|Update Work Order/i });
    await submitBtn.waitFor({ state: 'visible', timeout: 10000 });
    await submitBtn.click();
    console.log('✅ [WO] Submitted work order form');
  }

  // ── List actions ─────────────────────────────────────────────────────────────

  async searchWorkOrders(text: string): Promise<void> {
    await this.searchInput.fill(text);
    await this.page.waitForTimeout(300);
    console.log(`✅ [WO] Searched: ${text}`);
  }

  async filterByStatus(status: string): Promise<void> {
    await this.statusFilterSelect.click();
    await this.page.getByRole('option', { name: status, exact: true }).click();
    await this.page.waitForTimeout(300);
    console.log(`✅ [WO] Filtered by status: ${status}`);
  }

  async getTableRows(): Promise<Locator> {
    return this.page.locator('table tbody tr');
  }

  async getWorkOrderRowByNumber(woNumber: string): Promise<Locator> {
    return this.page.locator('table tbody tr').filter({ hasText: woNumber }).first();
  }

  async clickViewWorkOrder(woNumber: string): Promise<void> {
    const row = await this.getWorkOrderRowByNumber(woNumber);
    await row.getByRole('button', { name: 'View' }).click();
    await this.page.waitForLoadState('networkidle');
    console.log(`✅ [WO] Navigated to work order detail: ${woNumber}`);
  }

  async clickApproveWorkOrder(woNumber: string): Promise<void> {
    const row = await this.getWorkOrderRowByNumber(woNumber);
    // Approve uses window.confirm — handle it
    this.page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await row.getByRole('button', { name: 'Approve' }).click();
    await this.page.locator('[data-sonner-toast]').first().waitFor({ state: 'visible', timeout: 15000 });
    console.log(`✅ [WO] Approved work order: ${woNumber}`);
  }

  async clickDeleteWorkOrder(woNumber: string): Promise<void> {
    const row = await this.getWorkOrderRowByNumber(woNumber);
    await row.getByRole('button', { name: 'Delete' }).click();
    // Confirm the delete dialog
    const confirmDialog = this.page.getByRole('dialog');
    await confirmDialog.waitFor({ state: 'visible', timeout: 5000 });
    await confirmDialog.getByRole('button', { name: 'Delete' }).click();
    await this.page.locator('[data-sonner-toast]').first().waitFor({ state: 'visible', timeout: 15000 });
    console.log(`✅ [WO] Deleted work order: ${woNumber}`);
  }

  async verifyWorkOrderInList(woNumber: string): Promise<void> {
    const row = this.page.locator('table tbody tr').filter({ hasText: woNumber });
    await expect(row.first()).toBeVisible({ timeout: 10000 });
    console.log(`✅ [WO] Work order visible in list: ${woNumber}`);
  }

  async verifyWorkOrderNotInList(woNumber: string): Promise<void> {
    await this.page.waitForTimeout(500);
    const visible = await this.page.locator('table tbody tr').filter({ hasText: woNumber }).isVisible().catch(() => false);
    expect(visible).toBe(false);
    console.log(`✅ [WO] Work order not visible in list: ${woNumber}`);
  }

  async getWorkOrderStatus(woNumber: string): Promise<string> {
    const row = await this.getWorkOrderRowByNumber(woNumber);
    // Status is in the 5th column (index 4)
    const statusText = (await row.locator('td').nth(4).textContent() || '').trim().toLowerCase();
    return statusText;
  }

  async waitForSuccessToast(): Promise<string> {
    const toast = this.page.locator('[data-sonner-toast]').first();
    await toast.waitFor({ state: 'visible', timeout: 60000 });
    const text = await toast.textContent() || '';
    console.log(`✅ [WO] Toast: ${text}`);
    return text;
  }
}
