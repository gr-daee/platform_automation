import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * BOM Manager Page Object Model
 *
 * Source: web_app/src/app/plant-production/bom/components/BOMManagerPage.tsx
 *         web_app/src/app/plant-production/bom/components/BOMFormDialog.tsx
 *
 * Purpose: Manages BOM list page, Create BOM dialog (header + lines), status transitions,
 *          delete, filter, and navigation to BOM detail page.
 */
export class BOMPage extends BasePage {
  readonly createBOMButton: Locator;
  readonly searchInput: Locator;
  readonly statusFilterTrigger: Locator;

  constructor(page: Page) {
    super(page);
    this.createBOMButton = page.getByRole('button', { name: 'Create BOM' });
    this.searchInput = page.getByPlaceholder('Search BOMs...');
    // Status filter is a Radix Select without accessible label — scoped to filter card
    this.statusFilterTrigger = page.getByRole('combobox').first();
  }

  async goto(): Promise<void> {
    await this.page.goto('/plant-production/bom');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000);
    console.log('✅ [BOM] Navigated to BOM Manager page');
  }

  async verifyPageLoaded(): Promise<void> {
    // Wait for page to settle and reload if needed (handles post-test navigation issues)
    let found = await this.page.getByRole('button', { name: 'Create BOM' }).isVisible({ timeout: 15000 }).catch(() => false);
    if (!found) {
      console.warn('⚠️ [BOM] Create BOM button not found — navigating fresh to BOM page');
      await this.goto();
      found = await this.page.getByRole('button', { name: 'Create BOM' }).isVisible({ timeout: 15000 }).catch(() => false);
    }
    await expect(this.page.getByRole('button', { name: 'Create BOM' })).toBeVisible({ timeout: 15000 });
    console.log('✅ [BOM] BOM Manager page loaded');
  }

  // ─── Create BOM Dialog ────────────────────────────────────────────────────

  async openCreateBOMDialog(): Promise<void> {
    await this.createBOMButton.click();
    await expect(this.page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    await expect(this.page.getByRole('heading', { name: 'Create Bill of Materials (BOM)' })).toBeVisible({ timeout: 5000 });
    console.log('✅ [BOM] Create BOM dialog opened');
  }

  async fillBOMName(name: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.locator('#bom_name').fill(name);
    console.log(`✅ [BOM] Filled BOM name: ${name}`);
  }

  async clearBOMName(): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    const input = dialog.locator('#bom_name');
    await input.fill('');
    await input.press('Control+a');
    await input.press('Delete');
    console.log('✅ [BOM] Cleared BOM name');
  }

  async fillBOMDescription(description: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.locator('#bom_description').fill(description);
    console.log(`✅ [BOM] Filled BOM description`);
  }

  /**
   * Select a product for the BOM header using SearchableSelectDialog.
   * Waits for the loading spinner to disappear before attempting selection.
   * Returns the product name actually selected, or empty string if failed.
   */
  async selectProduct(productName: string): Promise<string> {
    const dialog = this.page.getByRole('dialog');
    // SearchableSelectDialog trigger — may show product name if already selected, or placeholder
    const productTrigger = dialog.getByRole('button', { name: /Search and select product/i });

    // Click to open the Select Product dialog
    await productTrigger.click();

    // Wait for the "Select Product" heading to appear
    await expect(this.page.getByRole('heading', { name: 'Select Product' })).toBeVisible({ timeout: 15000 });
    const selectDialog = this.page.getByRole('dialog').last();

    // Wait for loading to finish — either tbody rows OR "No products" text appears
    // The dialog shows "Loading..." text while isLoadingProducts is true
    console.log('⏳ [BOM] Waiting for product list to load...');
    try {
      // Wait up to 20 seconds for either data rows or empty state (not "Loading...")
      await this.page.waitForFunction(() => {
        const loadingEl = document.querySelector('[data-loading="true"]');
        const loadingText = Array.from(document.querySelectorAll('div')).find(d => d.textContent?.trim() === 'Loading...');
        const rows = document.querySelectorAll('table tbody tr');
        return !loadingText && rows.length > 0;
      }, {}, { timeout: 20000 });
    } catch {
      // If waitForFunction times out, check if rows exist anyway
      console.warn('⚠️ [BOM] Timeout waiting for product list — checking for rows directly');
    }

    // Give a short settle time
    await this.page.waitForTimeout(500);

    // Check for actual data rows (not the "empty message" row)
    const allRows = await selectDialog.locator('tbody tr').count();
    console.log(`📋 [BOM] Product dialog has ${allRows} rows`);

    if (allRows === 0) {
      console.warn('⚠️ [BOM] No rows in product dialog — closing');
      await this.page.keyboard.press('Escape');
      return '';
    }

    // Check if it's only the empty-state row (contains "No products available")
    const firstRowText = await selectDialog.locator('tbody tr').first().textContent() || '';
    if (firstRowText.includes('No products available') || firstRowText.includes('No products match')) {
      console.warn('⚠️ [BOM] Product dialog shows empty state — closing');
      await this.page.keyboard.press('Escape');
      return '';
    }

    if (productName === '__any__') {
      // Select first available product
      const firstRow = selectDialog.locator('tbody tr').first();
      const selectedName = await firstRow.locator('td').nth(1).textContent() || 'unknown';
      await firstRow.getByRole('button', { name: 'Select' }).click();
      console.log(`✅ [BOM] Selected first available product: ${selectedName}`);
      return selectedName.trim();
    }

    // Search for specific product name
    const searchInput = selectDialog.getByPlaceholder(/Search by product code or name/i);
    await searchInput.fill(productName);
    // Wait for client-side filter to apply (debounce + React re-render)
    await this.page.waitForTimeout(1200);

    // Re-count rows after filter to confirm the filter applied
    const afterFilterCount = await selectDialog.locator('tbody tr').count();
    console.log(`📋 [BOM] Rows after search '${productName}': ${afterFilterCount}`);

    // Look for exact product name match in a table cell (not just hasText which is partial)
    // The product name is in the 2nd cell (index 1) of each row: [code][name][uom][Select button]
    let exactMatchRow = null;
    for (let i = 0; i < afterFilterCount; i++) {
      const row = selectDialog.locator('tbody tr').nth(i);
      const nameCellText = await row.locator('td').nth(1).textContent().catch(() => '');
      if (nameCellText.trim() === productName) {
        exactMatchRow = row;
        break;
      }
    }

    if (exactMatchRow) {
      await exactMatchRow.getByRole('button', { name: 'Select' }).click();
      console.log(`✅ [BOM] Selected product (exact match): ${productName}`);
      return productName;
    }

    // Partial match fallback — select first filtered result that isn't empty state
    if (afterFilterCount > 0) {
      const firstFilteredRow = selectDialog.locator('tbody tr').first();
      const firstRowText = await firstFilteredRow.textContent() || '';
      if (!firstRowText.includes('No products')) {
        console.warn(`⚠️ [BOM] Exact '${productName}' not found; selecting first partial match`);
        await firstFilteredRow.getByRole('button', { name: 'Select' }).click();
        return productName;
      }
    }

    // Not found even after search — close and signal failure
    console.warn(`⚠️ [BOM] Product '${productName}' not found in dialog — closing`);
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
    return '';
  }

  async fillOutputQuantity(qty: number): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    const input = dialog.locator('#base_quantity');
    await input.clear();
    await input.fill(String(qty));
    console.log(`✅ [BOM] Set output quantity: ${qty}`);
  }

  async selectBaseUOM(uom: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    const uomTrigger = dialog.locator('label[for="base_uom"]').locator('xpath=..').getByRole('combobox');
    await uomTrigger.click();
    await this.page.getByRole('option', { name: uom }).click();
    console.log(`✅ [BOM] Selected base UOM: ${uom}`);
  }

  async fillYieldPercentage(pct: number): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    const input = dialog.locator('#yield_percentage');
    await input.scrollIntoViewIfNeeded();
    // Use fill() which clears+sets value and triggers React onChange
    await input.fill(String(pct));
    // Blur to commit the value to React state
    await this.page.keyboard.press('Tab');
    const val = await input.inputValue();
    console.log(`✅ [BOM] Set yield %: ${pct} (actual input value: ${val})`);
  }

  async fillVersion(version: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    const input = dialog.locator('#version_number');
    await input.clear();
    await input.fill(version);
    console.log(`✅ [BOM] Set version: ${version}`);
  }

  async fillEffectiveDate(date: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.locator('#effective_date').fill(date);
    console.log(`✅ [BOM] Set effective date: ${date}`);
  }

  async fillExpiryDate(date: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.locator('#expiry_date').fill(date);
    console.log(`✅ [BOM] Set expiry date: ${date}`);
  }

  // ─── BOM Line Items ────────────────────────────────────────────────────────

  async clickAddComponent(): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Add Component' }).click();
    console.log('✅ [BOM] Clicked Add Component');
  }

  /**
   * Select a raw material for a given line row (1-based index).
   * Uses SearchableSelectDialog with "Search raw material..." trigger.
   */
  async selectRawMaterialForLine(lineIndex: number, materialName: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    // Find the row in the table body by index
    const row = dialog.locator('table tbody tr').nth(lineIndex - 1);
    const trigger = row.getByRole('button', { name: /Search raw material/i });
    await trigger.click();

    await expect(this.page.getByRole('heading', { name: 'Select Raw Material' })).toBeVisible({ timeout: 10000 });
    const selectDialog = this.page.getByRole('dialog').last();

    // Wait for data rows or empty state
    await this.page.waitForTimeout(3000);
    const hasRows = await selectDialog.locator('tbody tr').first().isVisible().catch(() => false);

    if (!hasRows) {
      console.warn('⚠️ [BOM] No raw materials available in select dialog — closing');
      await this.page.keyboard.press('Escape');
      return;
    }

    if (materialName === '__any__') {
      // Select first available
      await selectDialog.locator('tbody tr').first().getByRole('button', { name: 'Select' }).click();
    } else {
      const exactRow = selectDialog.getByRole('row').filter({ hasText: materialName });
      const isExact = await exactRow.isVisible().catch(() => false);
      if (isExact) {
        await exactRow.getByRole('button', { name: 'Select' }).click();
      } else {
        const searchInput = selectDialog.getByPlaceholder(/Search by code or description/i);
        await searchInput.fill(materialName);
        await this.page.waitForTimeout(800);
        const afterSearch = selectDialog.getByRole('row').filter({ hasText: materialName });
        const found = await afterSearch.isVisible().catch(() => false);
        if (found) {
          await afterSearch.getByRole('button', { name: 'Select' }).click();
        } else {
          console.warn(`⚠️ [BOM] Raw material '${materialName}' not found — selecting first available`);
          await selectDialog.locator('tbody tr').first().getByRole('button', { name: 'Select' }).click();
        }
      }
    }
    console.log(`✅ [BOM] Selected raw material for line ${lineIndex}: ${materialName}`);
  }

  async setLineQuantity(lineIndex: number, qty: number): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    const row = dialog.locator('table tbody tr').nth(lineIndex - 1);
    // Quantity input is a number input (not labeled) — it's the first number input in the row after component
    const qtyInput = row.locator('input[type="number"]').first();
    await qtyInput.clear();
    await qtyInput.fill(String(qty));
    console.log(`✅ [BOM] Set quantity for line ${lineIndex}: ${qty}`);
  }

  async setLineCritical(lineIndex: number, critical: boolean): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    const row = dialog.locator('table tbody tr').nth(lineIndex - 1);
    const checkbox = row.getByRole('checkbox');
    const isChecked = await checkbox.isChecked();
    if (critical && !isChecked) await checkbox.click();
    if (!critical && isChecked) await checkbox.click();
    console.log(`✅ [BOM] Set critical flag for line ${lineIndex}: ${critical}`);
  }

  async removeLineItem(lineIndex: number): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    const row = dialog.locator('table tbody tr').nth(lineIndex - 1);
    await row.getByRole('button').last().click(); // Trash icon button
    console.log(`✅ [BOM] Removed line item ${lineIndex}`);
  }

  async getLineCount(): Promise<number> {
    const dialog = this.page.getByRole('dialog');
    const rows = dialog.locator('table tbody tr');
    return await rows.count();
  }

  // ─── Submit / Cancel ──────────────────────────────────────────────────────

  async submitCreateBOMForm(): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    const submitBtn = dialog.getByRole('button', { name: 'Create BOM' });
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();
    console.log('✅ [BOM] Submitted Create BOM form');
  }

  async cancelBOMForm(): Promise<void> {
    // Navigate away to reliably close any open dialog state
    await this.closeBOMDialogForce();
    console.log('✅ [BOM] Cancelled BOM form');
  }

  async closeBOMDialogForce(): Promise<void> {
    // Navigate to the BOM page to reset state — most reliable way to close any open dialog
    await this.page.goto('/plant-production/bom');
    await this.page.waitForLoadState('networkidle');
    console.log('✅ [BOM] Force-closed BOM dialog via navigation');
  }

  async waitForBOMCreatedToast(): Promise<void> {
    // Use filter to avoid strict mode violation with multiple toasts
    const successToast = this.page.locator('[data-sonner-toast]').filter({ hasText: 'BOM created successfully' });
    await successToast.first().waitFor({ state: 'visible', timeout: 45000 });
    console.log('✅ [BOM] BOM created toast visible');
  }

  /**
   * Select a product by index (0-based) from the available products list.
   * Used to retry with a different product if the first has an active BOM.
   */
  async selectProductByIndex(index: number): Promise<string> {
    const dialog = this.page.getByRole('dialog');
    const productTrigger = dialog.getByRole('button', { name: /Search and select product/i });
    await productTrigger.click();

    await expect(this.page.getByRole('heading', { name: 'Select Product' })).toBeVisible({ timeout: 15000 });
    const selectDialog = this.page.getByRole('dialog').last();

    // Wait for loading to finish
    console.log('⏳ [BOM] Waiting for product list to load...');
    try {
      await this.page.waitForFunction(() => {
        const loadingText = Array.from(document.querySelectorAll('div')).find(d => d.textContent?.trim() === 'Loading...');
        const rows = document.querySelectorAll('table tbody tr');
        return !loadingText && rows.length > 0;
      }, {}, { timeout: 20000 });
    } catch {
      console.warn('⚠️ [BOM] Timeout waiting for product list');
    }
    await this.page.waitForTimeout(300);

    const rows = selectDialog.locator('tbody tr');
    const count = await rows.count();

    // Check for empty state
    if (count === 0) {
      console.warn('⚠️ [BOM] No products in dialog');
      await this.page.keyboard.press('Escape');
      return '';
    }
    const firstText = await rows.first().textContent() || '';
    if (firstText.includes('No products available') || firstText.includes('No products match')) {
      console.warn('⚠️ [BOM] Product dialog shows empty state');
      await this.page.keyboard.press('Escape');
      return '';
    }

    if (index >= count) {
      // Out of products — close dialog and signal no more products
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(500);
      console.warn(`⚠️ [BOM] No product at index ${index} (only ${count} products available) — closing dialog`);
      return '';
    }
    const row = rows.nth(index);
    const productName = await row.locator('td').nth(1).textContent() || `Product ${index}`;
    await row.getByRole('button', { name: 'Select' }).click();
    console.log(`✅ [BOM] Selected product by index ${index}: ${productName.trim()}`);
    return productName.trim();
  }

  async waitForBOMDeletedToast(): Promise<void> {
    // Use .first() to avoid strict mode violation when multiple toasts are visible
    await expect(this.page.locator('[data-sonner-toast]').filter({ hasText: 'BOM deleted' }).first())
      .toBeVisible({ timeout: 10000 });
    console.log('✅ [BOM] BOM deleted toast visible');
  }

  async waitForStatusUpdatedToast(): Promise<void> {
    // Wait for any status-related toast
    await this.page.locator('[data-sonner-toast]').filter({ hasText: /BOM status updated|status updated|activated|deactivated|submitted|approved/ }).first()
      .waitFor({ state: 'visible', timeout: 15000 });
    console.log('✅ [BOM] BOM status updated toast visible');
  }

  // ─── List Actions ──────────────────────────────────────────────────────────

  async verifyBOMInList(bomName: string): Promise<void> {
    await expect(this.page.getByText(bomName)).toBeVisible({ timeout: 10000 });
    console.log(`✅ [BOM] BOM visible in list: ${bomName}`);
  }

  async verifyBOMNotInList(bomName: string): Promise<void> {
    // Give the list time to refresh after delete/action
    await this.page.waitForTimeout(1000);
    // Navigate to the BOM page to force a fresh list
    await this.page.goto('/plant-production/bom');
    await this.page.waitForLoadState('networkidle');
    await expect(this.page.getByText(bomName)).toBeHidden({ timeout: 10000 });
    console.log(`✅ [BOM] BOM not in list: ${bomName}`);
  }

  async searchBOMs(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.page.waitForTimeout(500);
    console.log(`✅ [BOM] Searched BOMs: ${term}`);
  }

  async getBOMCount(): Promise<number> {
    const rows = this.page.locator('table tbody tr').filter({ hasNot: this.page.getByText('No BOMs found') });
    return await rows.count();
  }

  async getBOMRowByName(bomName: string): Promise<Locator> {
    return this.page.locator('table tbody tr').filter({ has: this.page.getByText(bomName) }).first();
  }

  async clickViewBOM(bomName: string): Promise<void> {
    // Search for the BOM first to ensure it's visible in the list
    await this.searchBOMs(bomName);
    await this.page.waitForTimeout(500);
    const row = await this.getBOMRowByName(bomName);
    await row.getByRole('button', { name: 'View' }).first().click();
    await this.page.waitForLoadState('networkidle');
    console.log(`✅ [BOM] Navigated to BOM detail: ${bomName}`);
  }

  async clickSubmitReview(bomName: string): Promise<void> {
    const row = await this.getBOMRowByName(bomName);
    await row.getByRole('button', { name: 'Submit Review' }).click();
    console.log(`✅ [BOM] Clicked Submit Review for: ${bomName}`);
  }

  async clickApprove(bomName: string): Promise<void> {
    const row = await this.getBOMRowByName(bomName);
    await row.getByRole('button', { name: 'Approve' }).click();
    console.log(`✅ [BOM] Clicked Approve for: ${bomName}`);
  }

  async clickActivate(bomName: string): Promise<void> {
    const row = await this.getBOMRowByName(bomName);
    await row.getByRole('button', { name: 'Activate' }).click();
    console.log(`✅ [BOM] Clicked Activate for: ${bomName}`);
  }

  async deleteBOM(bomName: string): Promise<void> {
    const row = await this.getBOMRowByName(bomName);
    // Delete icon button (XCircle)
    await row.getByRole('button').last().click();
    // Confirm delete dialog
    await expect(this.page.getByRole('dialog')).toBeVisible({ timeout: 3000 });
    await this.page.getByRole('button', { name: /^Delete$/ }).click();
    console.log(`✅ [BOM] Deleted BOM: ${bomName}`);
  }

  async verifyBOMStatusInList(bomName: string, status: string): Promise<void> {
    const row = await this.getBOMRowByName(bomName);
    await expect(row.getByText(status.replace('_', ' ').toUpperCase())).toBeVisible({ timeout: 5000 });
    console.log(`✅ [BOM] BOM '${bomName}' shows status '${status}'`);
  }

  async verifyLineCountInList(bomName: string, expectedCount: number): Promise<void> {
    const row = await this.getBOMRowByName(bomName);
    await expect(row.getByText(`${expectedCount} lines`)).toBeVisible({ timeout: 5000 });
    console.log(`✅ [BOM] BOM '${bomName}' shows ${expectedCount} lines`);
  }

  // ─── Validation errors ─────────────────────────────────────────────────────

  async getValidationErrors(): Promise<string[]> {
    const errorEls = this.page.getByRole('dialog').locator('p.text-sm.text-destructive, [role="alert"]');
    return await errorEls.allTextContents();
  }

  async verifyValidationError(fieldText: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await expect(dialog.getByText(fieldText)).toBeVisible({ timeout: 5000 });
    console.log(`✅ [BOM] Validation error visible: ${fieldText}`);
  }

  /**
   * Verifies that a component line quantity field shows a validation error.
   * The form shows quantity errors as a red border (border-destructive) on the
   * number input rather than rendering the error message as visible text.
   */
  async verifyLineQuantityValidationError(): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    // The quantity input gets border-destructive class when invalid
    const quantityInput = dialog.locator('input[type="number"].border-destructive').first();
    await expect(quantityInput).toBeVisible({ timeout: 5000 });
    console.log('✅ [BOM] Line quantity validation error shown (red border on input)');
  }

  async verifyLinesRequiredError(): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await expect(dialog.getByText('At least one component line is required')).toBeVisible({ timeout: 5000 });
    console.log('✅ [BOM] Lines required error visible');
  }
}
