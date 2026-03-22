import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * Finance AR Aging Report Page Object Model
 *
 * Source: ../web_app/src/app/finance/ar-aging/page.tsx
 *
 * Purpose: `/finance/ar-aging` — aging summary, filters, exports, tabs, snapshots UX.
 */
export class ARAgingPage extends BasePage {
  readonly pageHeading: Locator;
  readonly filtersToggleButton: Locator;
  readonly exportPdfButton: Locator;
  readonly exportExcelButton: Locator;
  readonly dealerSearchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole('heading', { name: 'AR Aging Report', exact: true });
    /** Toolbar toggle only (not "Apply Filters"). */
    this.filtersToggleButton = page.getByRole('button', { name: /^Filters/i }).first();
    this.exportPdfButton = page.getByRole('button', { name: /Export PDF/i });
    this.exportExcelButton = page.getByRole('button', { name: /Export Excel/i });
    this.dealerSearchInput = page.getByPlaceholder(/Search by dealer name, code, or invoice number/i);
  }

  async goto(): Promise<void> {
    await this.navigateTo('/finance/ar-aging');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async gotoLegacyReportsPath(): Promise<void> {
    await this.page.goto('/finance/reports/ar-aging', { waitUntil: 'domcontentloaded' });
  }

  async verifyPageShellVisible(): Promise<void> {
    await expect(this.pageHeading).toBeVisible({ timeout: 20000 });
  }

  /**
   * Dealer Summary tab finished loading: table header or empty receivables copy.
   */
  async waitForDealerSummaryReady(timeoutMs: number = 90000): Promise<void> {
    await expect(
      this.page
        .getByRole('columnheader', { name: 'Dealer Code' })
        .or(this.page.getByText('No outstanding receivables', { exact: true }))
    ).toBeVisible({ timeout: timeoutMs });
  }

  async expectDealerSummaryOrEmptyVisible(): Promise<void> {
    await this.waitForDealerSummaryReady();
  }

  /** Dealer Summary table adds this column when aging basis is due date (after data reload). */
  async expectDealerSummaryNotDueColumnVisible(): Promise<void> {
    await expect(this.page.getByRole('columnheader', { name: 'Not Due' })).toBeVisible({ timeout: 90000 });
  }

  async toggleFiltersPanel(): Promise<void> {
    await this.filtersToggleButton.click();
  }

  async expectFilterOptionsPanelVisible(): Promise<void> {
    await expect(this.page.getByText('Filter Options', { exact: true })).toBeVisible({ timeout: 10000 });
  }

  async expectFilterOptionsPanelHidden(): Promise<void> {
    await expect(this.page.getByText('Filter Options', { exact: true })).toBeHidden({ timeout: 5000 });
  }

  async selectAgingBasisDueDate(): Promise<void> {
    await this.page.locator('#aging_basis').click();
    await this.page.getByRole('option', { name: /Due Date \(ECL/i }).click();
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 5000 }).catch(() => {});
  }

  async clickApplyFilters(): Promise<void> {
    await this.page.getByRole('button', { name: 'Apply Filters', exact: true }).click();
  }

  async searchDealersAndInvoices(text: string): Promise<void> {
    await this.dealerSearchInput.fill(text);
  }

  async expectNoDealersMatchSearchMessage(): Promise<void> {
    await expect(this.page.getByText('No dealers found matching your search', { exact: true })).toBeVisible({
      timeout: 15000,
    });
  }

  async clickTab(tabName: string): Promise<void> {
    await this.page.getByRole('tab', { name: tabName, exact: true }).click();
  }

  async expectInvoiceDetailTabContentVisible(): Promise<void> {
    await expect(
      this.page
        .getByRole('columnheader', { name: 'Invoice Number' })
        .or(this.page.getByText('No outstanding invoices', { exact: true }))
    ).toBeVisible({ timeout: 30000 });
  }

  async expectSnapshotsTabContentVisible(): Promise<void> {
    await expect(
      this.page
        .getByRole('heading', { name: 'AR Aging Snapshots' })
        .or(this.page.getByText('No snapshots yet', { exact: true }))
    ).toBeVisible({ timeout: 45000 });
  }

  async expectDealerSummaryTabActiveContent(): Promise<void> {
    await this.expectDealerSummaryOrEmptyVisible();
  }

  async clickExportExcel(): Promise<void> {
    await this.exportExcelButton.click();
  }

  async clickExportPdf(): Promise<void> {
    await this.exportPdfButton.click();
  }

  async isExportExcelEnabled(): Promise<boolean> {
    return this.exportExcelButton.isEnabled();
  }

  async isExportPdfEnabled(): Promise<boolean> {
    return this.exportPdfButton.isEnabled();
  }

  async expectExportExcelSuccessToast(): Promise<void> {
    await expect(
      this.page.locator('[data-sonner-toast]').filter({ hasText: /AR Aging Report exported to Excel successfully/i }).first()
    ).toBeVisible({ timeout: 30000 });
  }

  async expectExportPdfSuccessToast(): Promise<void> {
    await expect(
      this.page.locator('[data-sonner-toast]').filter({ hasText: /AR Aging Report PDF exported successfully/i }).first()
    ).toBeVisible({ timeout: 90000 });
  }

  async openGenerateSnapshotDialog(): Promise<void> {
    await this.page.getByRole('button', { name: /Generate Snapshot/i }).click();
  }

  async cancelGenerateSnapshotDialog(): Promise<void> {
    await this.page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  }

  async expectGenerateSnapshotDialogVisible(): Promise<void> {
    await expect(
      this.page.getByRole('dialog').getByRole('heading', { name: 'Generate AR Aging Snapshot', exact: true })
    ).toBeVisible({ timeout: 10000 });
  }

  async expectGenerateSnapshotDialogHidden(): Promise<void> {
    await expect(this.page.getByRole('dialog')).toBeHidden({ timeout: 5000 });
  }
}
