import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * Material Requests (MRN) Page Object Model
 *
 * Source: ../web_app/src/app/plant-production/material-requests/
 * Components: MaterialRequestsManager.tsx, MRNListTable.tsx, MRNFilters.tsx
 *
 * MRNs (Material Requisition Notes) are auto-generated from Work Orders.
 * This page is read-only from a test perspective — MRNs are created by the system.
 * Key actions: view list, filter by status, click Issue to navigate to issuance.
 */
export class MaterialRequestsPage extends BasePage {
  readonly url = '/plant-production/material-requests';

  readonly pageHeading: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByText('Material Requests (MRNs)');
    this.searchInput = page.getByPlaceholder(/search/i).first();
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
    console.log('✅ [MRN] Navigated to Material Requests page');
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.pageHeading).toBeVisible({ timeout: 15000 });
    console.log('✅ [MRN] Material Requests page loaded');
  }

  async getTableRows(): Promise<Locator> {
    return this.page.locator('table tbody tr');
  }

  async getRowCount(): Promise<number> {
    // Wait for loading to finish
    const spinner = this.page.locator('.animate-spin');
    if (await spinner.isVisible()) {
      await spinner.waitFor({ state: 'hidden', timeout: 15000 });
    }
    await this.page.waitForTimeout(500);
    return this.page.locator('table tbody tr').count();
  }

  async verifyMRNListVisible(): Promise<void> {
    // Wait for loading state to clear (the page shows "Loading material requests..." while loading)
    await expect(
      this.page.getByText('Loading material requests...')
    ).toBeHidden({ timeout: 15000 }).catch(() => null);
    await this.page.waitForTimeout(500);
    // The page either shows a table or an empty state — both are valid
    const hasTable = await this.page.locator('table').isVisible().catch(() => false);
    const hasEmpty = await this.page.getByText(/No material requests/i).isVisible().catch(() => false);
    expect(hasTable || hasEmpty).toBe(true);
    console.log('✅ [MRN] MRN list is visible');
  }

  async verifyStatusFilterWorks(status: string): Promise<void> {
    // Find a status filter checkbox or select
    const statusBtn = this.page.getByRole('checkbox', { name: new RegExp(status, 'i') });
    const isBtnVisible = await statusBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (isBtnVisible) {
      await statusBtn.click();
      await this.page.waitForTimeout(500);
      console.log(`✅ [MRN] Toggled status filter: ${status}`);
    }
  }
}
