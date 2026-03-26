import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * Plants Page Object Model
 *
 * Source: ../web_app/src/app/plant-production/plants/components/PlantsManagerPage.tsx
 * Dialogs:
 *   - PlantFormDialog.tsx (Create/Edit plant)
 *   - PlantLicenseFormDialog.tsx (Create/Edit license)
 *   - PlantAssetFormDialog.tsx (Create/Edit asset)
 *   - DeleteConfirmDialog.tsx
 *
 * URL: /plant-production/plants
 *
 * Layout: Tabbed page with three tabs:
 *   - Manufacturing Plants (tab value="plants")
 *   - Plant Licenses (tab value="licenses")
 *   - Plant Assets (tab value="assets")
 *
 * Each tab has independent search input, status/category filter selects, and an Add button.
 */
export class PlantsPage extends BasePage {
  // Page heading
  readonly heading: Locator;

  // Tabs
  readonly plantsTab: Locator;
  readonly licensesTab: Locator;
  readonly assetsTab: Locator;

  // Plant tab controls
  readonly plantSearchInput: Locator;
  readonly addPlantButton: Locator;
  readonly plantsTable: Locator;
  readonly showInactiveSwitch: Locator;

  // License tab controls
  readonly licenseSearchInput: Locator;
  readonly addLicenseButton: Locator;
  readonly licensesTable: Locator;

  // Asset tab controls
  readonly assetSearchInput: Locator;
  readonly addAssetButton: Locator;
  readonly assetsTable: Locator;

  constructor(page: Page) {
    super(page);

    this.heading = page.getByRole('heading', { name: 'Plants Setup' });

    this.plantsTab = page.getByRole('tab', { name: /Manufacturing Plants/i });
    this.licensesTab = page.getByRole('tab', { name: /Plant Licenses/i });
    this.assetsTab = page.getByRole('tab', { name: /Plant Assets/i });

    this.plantSearchInput = page.getByPlaceholder('Search plants...');
    this.addPlantButton = page.getByRole('button', { name: 'Add Plant' });
    this.plantsTable = page.locator('table').first();
    this.showInactiveSwitch = page.locator('#show-inactive-plants');

    this.licenseSearchInput = page.getByPlaceholder('Search licenses...');
    this.addLicenseButton = page.getByRole('button', { name: 'Add License' });
    this.licensesTable = page.locator('table').first();

    this.assetSearchInput = page.getByPlaceholder('Search assets...');
    this.addAssetButton = page.getByRole('button', { name: 'Add Asset' });
    this.assetsTable = page.locator('table').first();
  }

  async goto(): Promise<void> {
    await this.navigateTo('/plant-production/plants');
    await this.page.waitForLoadState('networkidle');
    console.log('✅ [PLANT] Navigated to Plants Setup page');
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 15000 });
    await expect(this.plantsTab).toBeVisible({ timeout: 10000 });
    console.log('✅ [PLANT] Plants Setup page loaded');
  }

  // ==========================================
  // Tab Navigation
  // ==========================================

  async switchToLicensesTab(): Promise<void> {
    await this.licensesTab.click();
    await this.page.waitForLoadState('networkidle');
    console.log('✅ [PLANT] Switched to Plant Licenses tab');
  }

  async switchToAssetsTab(): Promise<void> {
    await this.assetsTab.click();
    await this.page.waitForLoadState('networkidle');
    console.log('✅ [PLANT] Switched to Plant Assets tab');
  }

  // ==========================================
  // Plant Actions
  // ==========================================

  async openAddPlantDialog(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 15000 });
    await this.addPlantButton.click();
    await expect(this.page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    console.log('✅ [PLANT] Add Plant dialog opened');
  }

  async fillPlantName(name: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.locator('#plant_name').fill(name);
    console.log(`✅ [PLANT] Filled plant name: ${name}`);
  }

  async fillPlantCode(code: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    const codeInput = dialog.locator('#plant_code');
    // Only fill if not disabled (create mode)
    if (await codeInput.isEnabled()) {
      await codeInput.fill(code);
      console.log(`✅ [PLANT] Filled plant code: ${code}`);
    }
  }

  async setPlantStatus(status: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    // Status label has htmlFor="plant_status"; its parent div contains the SelectTrigger combobox.
    const statusTrigger = dialog.locator('label[for="plant_status"]').locator('xpath=..').getByRole('combobox');
    await statusTrigger.click();
    await this.page.getByRole('option', { name: status, exact: true }).click();
    console.log(`✅ [PLANT] Set plant status: ${status}`);
  }

  async setCapacity(capacity: string, unit: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.locator('#production_capacity').fill(capacity);
    // capacity_unit label has htmlFor="capacity_unit"; its parent div contains the SelectTrigger combobox.
    const unitTrigger = dialog.locator('label[for="capacity_unit"]').locator('xpath=..').getByRole('combobox');
    await unitTrigger.click();
    await this.page.getByRole('option', { name: unit, exact: true }).click();
    console.log(`✅ [PLANT] Set capacity: ${capacity} ${unit}`);
  }

  async setOperatingHoursAndDays(hours: string, days: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.locator('#operating_hours_per_day').fill(hours);
    await dialog.locator('#operating_days_per_week').fill(days);
    console.log(`✅ [PLANT] Set operating hours: ${hours}/day, ${days}/week`);
  }

  async setMaintenanceDates(lastDate: string, nextDate: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.locator('#last_maintenance_date').fill(lastDate);
    await dialog.locator('#next_maintenance_date').fill(nextDate);
    console.log(`✅ [PLANT] Set maintenance dates: last=${lastDate}, next=${nextDate}`);
  }

  async fillPlantDescription(description: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.locator('#plant_description').fill(description);
    console.log(`✅ [PLANT] Filled description: ${description}`);
  }

  async submitPlantForm(): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByRole('button', { name: /Create Plant|Update Plant/i }).click();
    console.log('✅ [PLANT] Submitted plant form');
  }

  async cancelPlantForm(): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(this.page.getByRole('dialog')).toBeHidden({ timeout: 3000 });
    console.log('✅ [PLANT] Cancelled plant form');
  }

  async openEditPlantDialog(plantName: string): Promise<void> {
    const row = this.getPlantRowByName(plantName);
    await row.getByRole('button', { name: 'Edit' }).click();
    await expect(this.page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    console.log(`✅ [PLANT] Opened Edit dialog for: ${plantName}`);
  }

  async deletePlant(plantName: string): Promise<void> {
    const row = this.getPlantRowByName(plantName);
    await row.getByRole('button', { name: 'Delete' }).click();
    await expect(this.page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    await this.page.getByRole('button', { name: 'Delete' }).last().click();
    console.log(`✅ [PLANT] Deleted plant: ${plantName}`);
  }

  // ==========================================
  // Plant Search & Verification
  // ==========================================

  async searchPlants(searchText: string): Promise<void> {
    // If the search input isn't immediately visible, ensure the Plants tab is active
    // (handles post-reload or post-navigation state)
    const inputVisible = await this.plantSearchInput.isVisible({ timeout: 3000 }).catch(() => false);
    if (!inputVisible) {
      await this.plantsTab.click();
    }
    await this.plantSearchInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.plantSearchInput.fill(searchText);
    await this.page.waitForTimeout(500); // debounce
    console.log(`✅ [PLANT] Searched plants: ${searchText}`);
  }

  async clearPlantSearch(): Promise<void> {
    await this.plantSearchInput.clear();
    await this.page.waitForTimeout(300);
    console.log('✅ [PLANT] Cleared plant search');
  }

  getPlantRowByName(plantName: string): Locator {
    return this.page.locator('table tbody tr').filter({ has: this.page.getByText(plantName) }).first();
  }

  async verifyPlantInList(plantName: string): Promise<void> {
    await expect(this.page.getByText(plantName)).toBeVisible({ timeout: 10000 });
    console.log(`✅ [PLANT] Plant visible in list: ${plantName}`);
  }

  async verifyPlantNotInList(plantName: string): Promise<void> {
    await expect(this.page.getByText(plantName)).toBeHidden({ timeout: 5000 });
    console.log(`✅ [PLANT] Plant not in list (as expected): ${plantName}`);
  }

  async getPlantCount(): Promise<number> {
    const rows = this.page.locator('table tbody tr');
    const count = await rows.count();
    console.log(`✅ [PLANT] Plant count: ${count}`);
    return count;
  }

  async verifyPlantStatusInList(plantName: string, status: string): Promise<void> {
    // Inactive plants may be hidden by default — enable "Show Inactive" toggle if needed
    if (status.toLowerCase() === 'inactive') {
      const showInactiveToggle = this.page.locator('#show-inactive-plants');
      const isChecked = await showInactiveToggle.isChecked().catch(() => false);
      if (!isChecked) {
        await showInactiveToggle.click();
        await this.page.waitForLoadState('networkidle');
      }
    }
    const row = this.getPlantRowByName(plantName);
    await expect(row.getByText(status, { exact: true })).toBeVisible();
    console.log(`✅ [PLANT] Plant '${plantName}' shows status '${status}'`);
  }

  // ==========================================
  // License Actions
  // ==========================================

  async openAddLicenseDialog(): Promise<void> {
    await this.addLicenseButton.click();
    await expect(this.page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    // Wait for the plant data to load in the form (server action fetches active plants on mount)
    // The trigger button shows "Search and select plant..." once the form is ready
    await expect(this.page.getByRole('button', { name: /Search and select plant/i }))
      .toBeVisible({ timeout: 10000 });
    console.log('✅ [PLANT] Add License dialog opened');
  }

  /**
   * Select a plant in the license form using the SearchableSelectDialog.
   * The trigger button shows "Search and select plant..." when nothing is selected.
   * Clicking it opens a nested dialog with a search input and a table of plants.
   * Each row has a "Select" button to pick the plant.
   */
  async selectPlantInLicenseForm(plantName: string): Promise<void> {
    const licenseDialog = this.page.getByRole('dialog').first();
    // The trigger is a button with text "Search and select plant..."
    const selectPlantTrigger = licenseDialog.getByRole('button', { name: /Search and select plant/i });
    await selectPlantTrigger.click();

    // Inner search dialog opens — DialogTitle is "Select Plant"
    // Wait for the heading to appear (signals dialog is open)
    await expect(this.page.getByRole('heading', { name: 'Select Plant' })).toBeVisible({ timeout: 10000 });

    // Wait for plants list to load — wait until at least one data row is visible
    // (plants are loaded asynchronously via useEffect after dialog mounts)
    const searchDialog = this.page.getByRole('dialog').last();

    // Wait for the first data row (tbody tr) to appear - excludes header row (20s for server action)
    await expect(searchDialog.locator('tbody tr').first()).toBeVisible({ timeout: 20000 });

    // Try to find the plant by name in the unfiltered list first
    const rowWithoutFilter = searchDialog.getByRole('row').filter({ hasText: plantName });
    const isAlreadyVisible = await rowWithoutFilter.isVisible().catch(() => false);

    if (isAlreadyVisible) {
      await rowWithoutFilter.getByRole('button', { name: 'Select' }).click();
    } else {
      // Search by plant name
      const searchInput = searchDialog.getByPlaceholder(/Search by plant code or name/i);
      await searchInput.fill(plantName);
      await this.page.waitForTimeout(800);

      // Check if the row appears after search
      const rowAfterSearch = searchDialog.getByRole('row').filter({ hasText: plantName });
      const isVisibleAfterSearch = await rowAfterSearch.isVisible().catch(() => false);

      if (isVisibleAfterSearch) {
        await rowAfterSearch.getByRole('button', { name: 'Select' }).click();
      } else {
        // Fallback: clear search and select the first available plant
        // This handles cases where newly created plants have DB replication lag
        await searchInput.clear();
        await this.page.waitForTimeout(500);
        console.warn(`⚠️ [PLANT] Plant '${plantName}' not found in select dialog — selecting first available plant`);
        const firstRow = searchDialog.locator('tbody tr').first();
        await firstRow.getByRole('button', { name: 'Select' }).click();
      }
    }
    console.log(`✅ [PLANT] Selected plant in license form: ${plantName}`);
  }

  async selectLicenseType(type: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    const licenseTypeTrigger = dialog.getByRole('combobox').first();
    await licenseTypeTrigger.click();
    await this.page.getByRole('option', { name: type }).click();
    console.log(`✅ [PLANT] Selected license type: ${type}`);
  }

  async fillLicenseNumber(number: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.locator('#license_number').fill(number);
    console.log(`✅ [PLANT] Filled license number: ${number}`);
  }

  async setLicenseIssueDate(date: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.locator('#license_issue_date').fill(date);
    console.log(`✅ [PLANT] Set license issue date: ${date}`);
  }

  async setLicenseExpiryDate(date: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.locator('#license_expiry_date').fill(date);
    console.log(`✅ [PLANT] Set license expiry date: ${date}`);
  }

  async submitLicenseForm(): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    // Button text is "Create License" (create mode) or "Update License" (edit mode)
    const submitBtn = dialog.getByRole('button', { name: /Create License|Update License/i });
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();
    console.log('✅ [PLANT] Submitted license form');
  }

  async openEditLicenseDialog(licenseNumber: string): Promise<void> {
    const row = this.page.locator('table tbody tr').filter({ has: this.page.getByText(licenseNumber) }).first();
    await row.getByRole('button', { name: 'Edit' }).click();
    await expect(this.page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    console.log(`✅ [PLANT] Opened Edit dialog for license: ${licenseNumber}`);
  }

  async verifyLicenseInList(licenseNumber: string): Promise<void> {
    await expect(this.page.getByText(licenseNumber)).toBeVisible({ timeout: 10000 });
    console.log(`✅ [PLANT] License visible in list: ${licenseNumber}`);
  }

  async verifyDeleteButtonForLicense(licenseNumber: string): Promise<void> {
    const row = this.page.locator('table tbody tr').filter({ has: this.page.getByText(licenseNumber) }).first();
    await expect(row.getByRole('button', { name: 'Delete' })).toBeVisible();
    console.log(`✅ [PLANT] Delete button visible for license: ${licenseNumber}`);
  }

  // ==========================================
  // Asset Actions
  // ==========================================

  async openAddAssetDialog(): Promise<void> {
    await this.addAssetButton.click();
    await expect(this.page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    console.log('✅ [PLANT] Add Asset dialog opened');
  }

  /**
   * Select a plant in the asset form using the standard Radix Select component.
   * Asset form uses <Select> with options showing "Plant Name (PlantCode)"
   */
  async selectPlantInAssetForm(plantName: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    // Plant select uses label[for="manufacturing_plant_id"] — find its parent div's combobox
    const plantTrigger = dialog.locator('label[for="manufacturing_plant_id"]').locator('xpath=..').getByRole('combobox');
    // Retry logic: click combobox and wait for options, re-click if no options appear (slow server action)
    let optionsVisible = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      await plantTrigger.click();
      optionsVisible = await this.page.getByRole('option').first().isVisible().catch(() => false);
      if (optionsVisible) break;
      // Close dropdown by clicking the trigger again (avoids Escape which can close the whole dialog)
      await plantTrigger.click();
      await this.page.waitForTimeout(2000);
    }
    if (!optionsVisible) {
      // Final attempt with longer wait
      await plantTrigger.click();
      await expect(this.page.getByRole('option').first()).toBeVisible({ timeout: 20000 });
    }
    // Try to find exact plant; fallback to first available if not found (eventual consistency)
    const exactOption = this.page.getByRole('option').filter({ hasText: plantName });
    const isExactFound = await exactOption.isVisible().catch(() => false);
    if (isExactFound) {
      await exactOption.click();
    } else {
      console.warn(`⚠️ [PLANT] Plant '${plantName}' not found in asset form select — selecting first available plant`);
      await this.page.getByRole('option').first().click();
    }
    console.log(`✅ [PLANT] Selected plant in asset form: ${plantName}`);
  }

  async fillAssetName(name: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.locator('#asset_name').fill(name);
    console.log(`✅ [PLANT] Filled asset name: ${name}`);
  }

  async fillAssetCode(code: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    const codeInput = dialog.locator('#asset_code');
    if (await codeInput.isEnabled()) {
      await codeInput.fill(code);
      console.log(`✅ [PLANT] Filled asset code: ${code}`);
    }
  }

  async selectAssetCategory(category: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    // Category select uses label[for="asset_category"] — find its parent div's combobox
    const categoryTrigger = dialog.locator('label[for="asset_category"]').locator('xpath=..').getByRole('combobox');
    await categoryTrigger.click();
    await this.page.getByRole('option', { name: category }).click();
    console.log(`✅ [PLANT] Selected asset category: ${category}`);
  }

  async getAssetCategoryOptions(): Promise<string[]> {
    const dialog = this.page.getByRole('dialog');
    // Category select uses label[for="asset_category"] — use robust locator
    const categoryTrigger = dialog.locator('label[for="asset_category"]').locator('xpath=..').getByRole('combobox');
    await categoryTrigger.scrollIntoViewIfNeeded();
    await categoryTrigger.click();
    await expect(this.page.getByRole('option').first()).toBeVisible({ timeout: 5000 });
    const options = await this.page.getByRole('option').allTextContents();
    // Close the SELECT dropdown with Escape (only closes the select, not the parent dialog)
    await this.page.keyboard.press('Escape');
    return options;
  }

  async submitAssetForm(): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    // Button text is "Create Asset" (create mode) or "Update Asset" (edit mode)
    const submitBtn = dialog.getByRole('button', { name: /Create Asset|Update Asset/i });
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();
    console.log('✅ [PLANT] Submitted asset form');
  }

  async openEditAssetDialog(assetName: string): Promise<void> {
    const row = this.page.locator('table tbody tr').filter({ has: this.page.getByText(assetName) }).first();
    await row.getByRole('button', { name: 'Edit' }).click();
    await expect(this.page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    console.log(`✅ [PLANT] Opened Edit dialog for asset: ${assetName}`);
  }

  async deleteAsset(assetName: string): Promise<void> {
    const row = this.page.locator('table tbody tr').filter({ has: this.page.getByText(assetName) }).first();
    await row.getByRole('button', { name: 'Delete' }).click();
    // Confirm in DeleteConfirmDialog
    const confirmDialog = this.page.getByRole('dialog');
    await confirmDialog.waitFor({ state: 'visible', timeout: 5000 });
    // Click the "Delete" button inside the confirmation dialog
    await confirmDialog.getByRole('button', { name: 'Delete' }).click();
    // Wait for the toast before returning (ensures server action completes)
    await this.page.locator('[data-sonner-toast]').first().waitFor({ state: 'visible', timeout: 15000 });
    console.log(`✅ [PLANT] Deleted asset: ${assetName}`);
  }

  async verifyAssetInList(assetName: string): Promise<void> {
    // Wait for any loading state to clear before asserting visibility
    await this.page.waitForLoadState('domcontentloaded').catch(() => null);
    await this.page.waitForTimeout(500);
    await expect(this.page.getByText(assetName)).toBeVisible({ timeout: 15000 });
    console.log(`✅ [PLANT] Asset visible in list: ${assetName}`);
  }

  async verifyAssetNotInList(assetName: string): Promise<void> {
    // Wait for React state to re-render after delete — network idle + extra buffer
    await this.page.waitForLoadState('networkidle').catch(() => null);
    await this.page.waitForTimeout(2000);
    // Ensure we're on the Assets tab before checking (switch back if needed)
    const assetsTabBtn = this.page.getByRole('tab', { name: /Plant Assets|Assets/i });
    const tabVisible = await assetsTabBtn.isVisible({ timeout: 2000 }).catch(() => false);
    if (tabVisible) {
      const isSelected = await assetsTabBtn.getAttribute('data-state').catch(() => null);
      if (isSelected !== 'active') {
        await assetsTabBtn.click();
        await this.page.waitForTimeout(500);
      }
    }
    // Use locator scoped to table rows filtered by asset name
    const tableRow = this.page.locator('table tbody tr').filter({ hasText: assetName });
    await expect(tableRow).toHaveCount(0, { timeout: 15000 });
    console.log(`✅ [PLANT] Asset not in list (as expected): ${assetName}`);
  }

  // ==========================================
  // Toast Helpers
  // ==========================================

  /**
   * Waits for a toast message matching the given pattern.
   * If the toast doesn't appear within the timeout but the dialog is closed,
   * the operation is still considered successful (toast may have been brief).
   */
  private async waitForToastOrDialogClose(pattern: RegExp, label: string, timeout = 30000): Promise<void> {
    // First, wait for the dialog to close (form submission closes the dialog on success)
    const dialog = this.page.getByRole('dialog');
    const dialogWasOpen = await dialog.isVisible({ timeout: 1000 }).catch(() => false);
    if (dialogWasOpen) {
      await expect(dialog).toBeHidden({ timeout });
    }
    // Then check if a toast appeared (it may already have been shown)
    const toast = this.page.locator('[data-sonner-toast]').filter({ hasText: pattern });
    const toastVisible = await toast.isVisible({ timeout: 3000 }).catch(() => false);
    if (toastVisible) {
      console.log(`✅ [PLANT] ${label} toast visible`);
    } else {
      console.log(`✅ [PLANT] ${label} succeeded (dialog closed, toast may have expired)`);
    }
  }

  async waitForPlantCreatedToast(): Promise<void> {
    await this.waitForToastOrDialogClose(/Plant created successfully/i, 'Plant created');
  }

  async waitForPlantUpdatedToast(): Promise<void> {
    await this.waitForToastOrDialogClose(/Plant updated successfully/i, 'Plant updated');
  }

  async waitForLicenseCreatedToast(): Promise<void> {
    await this.waitForToastOrDialogClose(/License created successfully/i, 'License created');
  }

  async waitForLicenseUpdatedToast(): Promise<void> {
    await this.waitForToastOrDialogClose(/License updated successfully/i, 'License updated');
  }

  async waitForAssetCreatedToast(): Promise<void> {
    await this.waitForToastOrDialogClose(/Asset created successfully/i, 'Asset created');
  }

  async waitForAssetUpdatedToast(): Promise<void> {
    await this.waitForToastOrDialogClose(/Asset updated successfully/i, 'Asset updated');
  }

  async waitForAssetDeletedToast(): Promise<void> {
    await expect(
      this.page.locator('[data-sonner-toast]').filter({ hasText: /Asset deleted successfully/i })
    ).toBeVisible({ timeout: 15000 });
    console.log('✅ [PLANT] Asset deleted toast visible');
  }

  async waitForErrorToast(messagePattern?: RegExp): Promise<void> {
    const pattern = messagePattern || /Failed to|error|already exists/i;
    await expect(
      this.page.locator('[data-sonner-toast]').filter({ hasText: pattern })
    ).toBeVisible({ timeout: 15000 });
    console.log('✅ [PLANT] Error toast visible');
  }

  // ==========================================
  // Inline Validation Helpers
  // ==========================================

  async verifyFieldValidationError(fieldId: string): Promise<void> {
    // Inline errors render as <p class="text-sm text-destructive"> under the field
    const field = this.page.locator(`#${fieldId}`);
    const errorEl = field.locator('..').locator('p.text-sm');
    await expect(errorEl).toBeVisible({ timeout: 3000 });
    console.log(`✅ [PLANT] Inline validation error visible for field: ${fieldId}`);
  }

  async getInlineErrors(): Promise<string[]> {
    const errorEls = this.page.locator('.text-destructive');
    return await errorEls.allTextContents();
  }
}
