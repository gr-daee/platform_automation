import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

export class HierarchicalProductSalesReportPage extends BasePage {
  readonly heading: Locator;
  readonly quickPeriodThisMonth: Locator;
  readonly generateReportButton: Locator;
  readonly exportExcelButton: Locator;
  readonly dealerRows: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Hierarchical Product Sales Report' });
    this.quickPeriodThisMonth = page.getByRole('button', { name: 'This Month' });
    this.generateReportButton = page.getByRole('button', { name: /Generate Report|Generating/ });
    this.exportExcelButton = page.getByRole('button', { name: /Excel|Exporting/ });
    this.dealerRows = page.locator('div').filter({ hasText: /DEALER|prod/i });
  }

  async navigate(): Promise<void> {
    await this.navigateTo('/o2c/reports/hierarchical-product-sales');
    await expect(this.heading).toBeVisible({ timeout: 10000 });
  }

  async generateThisMonthReport(): Promise<void> {
    await this.quickPeriodThisMonth.click();
    await this.generateReportButton.click();
    await expect(this.page.getByText('GRAND TOTAL')).toBeVisible({ timeout: 45000 });
  }

  async clickExportDetailedExcel(): Promise<void> {
    await this.exportExcelButton.click();
  }
}
