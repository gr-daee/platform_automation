import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';
import { SelectComponent } from '../../support/components/SelectComponent';

/**
 * Hierarchical Sales Report Page Object Model
 *
 * Source: ../web_app/src/app/o2c/reports/hierarchical-sales/page.tsx
 * Content: ../web_app/src/app/o2c/reports/hierarchical-sales/components/HierarchicalSalesContent.tsx
 *
 * Purpose: Manages Hierarchical Sales Report page interactions (filters, generate, summary, hierarchy, export).
 *
 * Key Features:
 * - Quick period buttons (This Month, Quarter, Year)
 * - From/To date inputs, State/Region/Territory filters
 * - Generate Report, Expand All, Collapse All, Export Excel
 * - Empty state and no-data state
 */
export class HierarchicalSalesReportPage extends BasePage {
  private selectComponent: SelectComponent;

  readonly pageHeading: Locator;
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly generateReportButton: Locator;
  readonly quickPeriodThisMonth: Locator;
  readonly quickPeriodThisQuarter: Locator;
  readonly quickPeriodThisYear: Locator;
  readonly stateDropdown: Locator;
  readonly regionDropdown: Locator;
  readonly territoryDropdown: Locator;
  readonly expandAllButton: Locator;
  readonly collapseAllButton: Locator;
  readonly exportExcelButton: Locator;
  readonly emptyStateMessage: Locator;
  readonly noDataStateMessage: Locator;
  readonly grandTotalRow: Locator;
  readonly salesByGeographyCard: Locator;

  constructor(page: Page) {
    super(page);
    this.selectComponent = new SelectComponent(page);

    // Use only heading (h1) to avoid strict mode: breadcrumb also contains "Hierarchical Sales Report"
    this.pageHeading = page.getByRole('heading', { name: 'Hierarchical Sales Report', level: 1 });
    this.fromDateInput = page.getByLabel('From Date *').or(page.locator('input#from-date'));
    this.toDateInput = page.getByLabel('To Date *').or(page.locator('input#to-date'));
    this.generateReportButton = page.getByRole('button', { name: /Generate Report|Generating/ });
    this.quickPeriodThisMonth = page.getByRole('button', { name: 'This Month' });
    this.quickPeriodThisQuarter = page.getByRole('button', { name: 'This Quarter' });
    this.quickPeriodThisYear = page.getByRole('button', { name: 'This Year' });
    this.stateDropdown = page.getByRole('combobox').filter({ has: page.locator('text=State') }).or(
      page.locator('label').filter({ hasText: /State \(GSTIN\)/i }).locator('..').getByRole('combobox')
    );
    this.regionDropdown = page.locator('label').filter({ hasText: /^Region$/i }).locator('..').getByRole('combobox').or(
      page.getByRole('combobox').filter({ has: page.getByText('Region') })
    );
    this.territoryDropdown = page.locator('label').filter({ hasText: /^Territory$/i }).locator('..').getByRole('combobox').or(
      page.getByRole('combobox').filter({ has: page.getByText('Territory') })
    );
    this.expandAllButton = page.getByRole('button', { name: 'Expand All' });
    this.collapseAllButton = page.getByRole('button', { name: 'Collapse All' });
    this.exportExcelButton = page.getByRole('button', { name: /Export Excel|Exporting/ });
    this.emptyStateMessage = page.getByText('No Report Generated');
    this.noDataStateMessage = page.getByText('No Sales Data Found');
    this.grandTotalRow = page.getByText('GRAND TOTAL');
    this.salesByGeographyCard = page.getByText('Sales by Geography');
  }

  async navigate(): Promise<void> {
    await this.navigateTo('/o2c/reports/hierarchical-sales');
    await this.page.waitForLoadState('networkidle', { timeout: 15000 });
  }

  async verifyPageLoaded(): Promise<void> {
    const currentUrl = this.page.url();
    if (currentUrl.includes('/restrictedUser') || currentUrl.includes('/login')) {
      throw new Error(`Access denied or not logged in. Current URL: ${currentUrl}`);
    }
    await expect(this.page).toHaveURL(/\/o2c\/reports\/hierarchical-sales/, { timeout: 5000 });
    await expect(this.pageHeading).toBeVisible({ timeout: 10000 });
  }

  async setDateRange(fromDate: string, toDate: string): Promise<void> {
    await this.fromDateInput.fill(fromDate);
    await this.toDateInput.fill(toDate);
  }

  async clickQuickPeriod(period: 'month' | 'quarter' | 'year'): Promise<void> {
    switch (period) {
      case 'month':
        await this.quickPeriodThisMonth.click();
        break;
      case 'quarter':
        await this.quickPeriodThisQuarter.click();
        break;
      case 'year':
        await this.quickPeriodThisYear.click();
        break;
    }
  }

  async getFromDateValue(): Promise<string> {
    return (await this.fromDateInput.inputValue()) || '';
  }

  async getToDateValue(): Promise<string> {
    return (await this.toDateInput.inputValue()) || '';
  }

  async clickGenerateReport(): Promise<void> {
    await this.generateReportButton.click();
  }

  async isGenerateReportDisabled(): Promise<boolean> {
    return await this.generateReportButton.isDisabled();
  }

  async waitForReportLoaded(): Promise<void> {
    await expect(this.page.locator('[data-sonner-toast]')).toContainText(/Report generated|dealers across/i, { timeout: 30000 });
    // Use only GRAND TOTAL to avoid strict mode: "States" also matches "All states" in the State combobox
    await expect(this.grandTotalRow).toBeVisible({ timeout: 15000 });
  }

  async verifyLoadingState(): Promise<void> {
    await expect(this.generateReportButton).toContainText('Generating');
  }

  async verifyEmptyState(): Promise<void> {
    await expect(this.emptyStateMessage).toBeVisible({ timeout: 10000 });
  }

  async verifyNoDataState(): Promise<void> {
    await expect(this.noDataStateMessage).toBeVisible({ timeout: 10000 });
  }

  async verifySummaryCardsVisible(): Promise<void> {
    await expect(this.page.getByText('States').first()).toBeVisible({ timeout: 5000 });
    await expect(this.grandTotalRow).toBeVisible({ timeout: 5000 });
  }

  async expandAll(): Promise<void> {
    await this.expandAllButton.click();
  }

  async collapseAll(): Promise<void> {
    await this.collapseAllButton.click();
  }

  async clickExportExcel(): Promise<void> {
    await this.exportExcelButton.click();
  }

  async isExportExcelDisabled(): Promise<boolean> {
    return await this.exportExcelButton.isDisabled();
  }

  async waitForExportSuccessToast(): Promise<void> {
    await expect(this.page.locator('[data-sonner-toast]')).toContainText('Excel file exported successfully', { timeout: 15000 });
  }

  async verifyExportButtonExportingState(): Promise<void> {
    await expect(this.exportExcelButton).toContainText('Exporting');
  }

  async selectState(value: string): Promise<void> {
    await this.selectComponent.selectByLabel('State (GSTIN)', value);
  }

  async selectRegion(value: string): Promise<void> {
    const trigger = this.page.locator('label').filter({ hasText: /^Region$/i }).locator('..').getByRole('combobox').first();
    await trigger.click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    await this.page.getByRole('option', { name: value }).click();
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 2000 });
  }

  async selectTerritory(value: string): Promise<void> {
    const trigger = this.page.locator('label').filter({ hasText: /^Territory$/i }).locator('..').getByRole('combobox').first();
    await trigger.click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    await this.page.getByRole('option', { name: value }).click();
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 2000 });
  }

  async verifyToastError(message: string): Promise<void> {
    await expect(this.page.locator('[data-sonner-toast]')).toContainText(message, { timeout: 5000 });
  }
}
