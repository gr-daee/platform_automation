import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * EPD Configuration Page Object
 *
 * Source: ../web_app/src/app/finance/epd-configuration/page.tsx
 * Purpose: EPD slab configuration - add/edit slabs, Preview Calculator, Show Inactive.
 */
export class EPDConfigurationPage extends BasePage {
  readonly pageHeading: Locator;
  readonly tabSlabs: Locator;
  readonly tabPreviewCalculator: Locator;
  readonly tabDefaultSlabs: Locator;
  readonly addSlabButton: Locator;
  readonly refreshButton: Locator;
  readonly showInactiveCheckbox: Locator;
  readonly slabsTable: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole('heading', { name: /EPD Slab Configuration/i });
    this.tabSlabs = page.getByRole('tab', { name: /EPD Slabs/i }).or(page.getByRole('button', { name: /EPD Slabs/i }));
    this.tabPreviewCalculator = page.getByRole('tab', { name: /Preview Calculator/i }).or(page.getByRole('button', { name: /Preview Calculator/i }));
    this.tabDefaultSlabs = page.getByRole('tab', { name: /Default Slabs/i }).or(page.getByRole('button', { name: /Default Slabs/i }));
    this.addSlabButton = page.getByRole('button', { name: /Add Slab/i });
    this.refreshButton = page.getByRole('button', { name: /Refresh/i });
    this.showInactiveCheckbox = page.getByRole('checkbox', { name: /Show Inactive/i });
    this.slabsTable = page.locator('table').filter({ has: page.getByText(/Days Range|Discount %/i) });
  }

  async goto(): Promise<void> {
    await this.navigateTo('/finance/epd-configuration');
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/finance\/epd-configuration/, { timeout: 10000 });
    await expect(this.pageHeading).toBeVisible({ timeout: 10000 });
    await expect(this.tabSlabs).toBeVisible({ timeout: 5000 });
  }

  /** Open Add Slab dialog and fill Days From, Days To, Discount %. */
  async openAddSlabDialog(): Promise<void> {
    await this.addSlabButton.click();
    await expect(this.page.getByRole('dialog').filter({ hasText: /Create EPD Slab/i })).toBeVisible({ timeout: 5000 });
  }

  async fillSlabForm(daysFrom: number, daysTo: number, discountPercent: number): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByLabel(/Days From/i).fill(String(daysFrom));
    await dialog.getByLabel(/Days To/i).fill(String(daysTo));
    await dialog.getByLabel(/Discount Percentage/i).fill(String(discountPercent));
  }

  async submitCreateSlab(): Promise<void> {
    await this.page.getByRole('dialog').getByRole('button', { name: /Create Slab/i }).click();
  }

  async cancelCreateSlab(): Promise<void> {
    await this.page.getByRole('dialog').getByRole('button', { name: /Cancel/i }).click();
  }

  /** Assert slab row visible with days range text e.g. "0 - 7 days". */
  async verifySlabExists(daysFrom: number, daysTo: number): Promise<void> {
    const row = this.slabsTable.getByRole('row').filter({ hasText: `${daysFrom}` }).filter({ hasText: `${daysTo}` });
    await expect(row).toBeVisible({ timeout: 10000 });
  }

  /** Assert toast contains error message (validation). */
  async expectToastError(messageSubstring: string | RegExp): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]').filter({ hasText: messageSubstring });
    await expect(toast).toBeVisible({ timeout: 8000 });
  }

  /** Assert success toast for slab creation (match toast that contains success text, not a prior toast). */
  async expectSlabCreatedToast(): Promise<void> {
    const successToast = this.page.locator('[data-sonner-toast]').filter({ hasText: /created successfully|EPD slab created/i });
    await expect(successToast).toBeVisible({ timeout: 10000 });
  }

  async clickTabPreviewCalculator(): Promise<void> {
    await this.tabPreviewCalculator.click();
    await this.page.waitForTimeout(300);
  }

  async fillPreviewCalculator(dueDate: string, paymentDate: string, amount: number): Promise<void> {
    await this.page.getByLabel(/Invoice Due Date/i).fill(dueDate);
    await this.page.getByLabel(/Payment Date/i).fill(paymentDate);
    await this.page.getByLabel(/EPD Eligible Amount/i).fill(String(amount));
  }

  async clickCalculateEPD(): Promise<void> {
    await this.page.getByRole('button', { name: /Calculate EPD/i }).click();
  }

  /** Assert Preview Calculator result shows discount % and amount. */
  async verifyPreviewResultVisible(): Promise<void> {
    await expect(
      this.page.getByText(/Days Before Due|Applicable Rate|EPD discount based/i).first()
    ).toBeVisible({ timeout: 10000 });
  }

  async setShowInactive(checked: boolean): Promise<void> {
    const isChecked = await this.showInactiveCheckbox.isChecked().catch(() => false);
    if (isChecked !== checked) {
      await this.showInactiveCheckbox.click();
      await this.page.waitForTimeout(400);
    }
  }

  /** Seed default slabs when no slabs exist (button visible in empty state). */
  async clickSeedDefaultSlabs(): Promise<void> {
    await this.page.getByRole('button', { name: /Seed Default/i }).click();
  }

  /** Get the table row for slab with given days range (e.g. 31-45). */
  slabRow(daysFrom: number, daysTo: number): Locator {
    return this.slabsTable
      .getByRole('row')
      .filter({ hasText: `${daysFrom}` })
      .filter({ hasText: `${daysTo}` });
  }

  /** Open Edit dialog for the slab with given days range; click Pencil in that row. */
  async clickEditSlab(daysFrom: number, daysTo: number): Promise<void> {
    const row = this.slabRow(daysFrom, daysTo);
    await expect(row).toBeVisible({ timeout: 10000 });
    await row.scrollIntoViewIfNeeded();
    const editButton = row.getByRole('button').first();
    await editButton.click();
    await expect(this.page.getByRole('dialog').filter({ hasText: /Edit EPD Slab/i })).toBeVisible({ timeout: 5000 });
  }

  /** In open Edit (or Create) dialog, set only Discount Percentage. */
  async setDialogDiscountPercent(percent: number): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByLabel(/Discount Percentage/i).fill(String(percent));
  }

  /** Click Update Slab in the Edit dialog. */
  async submitUpdateSlab(): Promise<void> {
    await this.page.getByRole('dialog').getByRole('button', { name: /Update Slab/i }).click();
  }

  /** Assert success toast for slab update. */
  async expectSlabUpdatedToast(): Promise<void> {
    await this.waitForToast(/updated successfully|EPD slab updated/i, 8000);
  }

  /** Assert slab row shows expected discount (e.g. 7.5%). */
  async verifySlabDiscount(daysFrom: number, daysTo: number, discountPercent: number): Promise<void> {
    const row = this.slabRow(daysFrom, daysTo);
    await expect(row).toBeVisible({ timeout: 5000 });
    await expect(row.getByText(new RegExp(String(discountPercent), 'i'))).toBeVisible();
  }

  /** Return true if a slab row for the given days range is visible in the table (active slabs). */
  async hasSlabRow(daysFrom: number, daysTo: number): Promise<boolean> {
    const row = this.slabRow(daysFrom, daysTo);
    return row.isVisible().catch(() => false);
  }

  /**
   * Deactivate the slab for the given days range.
   * Clicks the Deactivate (Trash) button in the row and confirms in the AlertDialog.
   */
  async deactivateSlab(daysFrom: number, daysTo: number): Promise<void> {
    const row = this.slabRow(daysFrom, daysTo);
    await expect(row).toBeVisible({ timeout: 10000 });
    await row.scrollIntoViewIfNeeded();
    const deactivateButton = row.getByRole('button').nth(1);
    await deactivateButton.click();
    const dialog = this.page.getByRole('dialog').or(this.page.getByRole('alertdialog')).filter({ hasText: /Deactivate EPD Slab/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await dialog.getByRole('button', { name: /Deactivate/i }).click();
    const deactivatedToast = this.page.locator('[data-sonner-toast]').filter({ hasText: /deactivated|EPD slab deactivated/i });
    await expect(deactivatedToast).toBeVisible({ timeout: 8000 });
    await this.page.waitForTimeout(500);
  }

  /**
   * If a slab for the given days range exists in the table, deactivate it.
   * Use before creating a slab to avoid "overlaps with existing range" and restore initial state.
   */
  async deactivateSlabIfExists(daysFrom: number, daysTo: number): Promise<void> {
    const exists = await this.hasSlabRow(daysFrom, daysTo);
    if (exists) await this.deactivateSlab(daysFrom, daysTo);
  }
}
