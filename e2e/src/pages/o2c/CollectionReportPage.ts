import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

export class CollectionReportPage extends BasePage {
  readonly heading: Locator;
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly quickPeriodTrigger: Locator;
  readonly loadReportButton: Locator;
  readonly exportExcelButton: Locator;
  readonly totalAmountCard: Locator;
  readonly collectionEfficiencyCard: Locator;
  readonly byPeriodTab: Locator;
  readonly summaryTab: Locator;
  readonly byDealerTab: Locator;
  readonly byRegionTab: Locator;
  readonly byPeriodRows: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: /Collection Report|Collections Report/i });
    this.fromDateInput = page.locator('input[type="date"]').first();
    this.toDateInput = page.locator('input[type="date"]').nth(1);
    this.quickPeriodTrigger = page.getByRole('combobox').first();
    this.loadReportButton = page.getByRole('button', { name: 'Load Report' });
    this.exportExcelButton = page.getByRole('button', { name: 'Export Excel' });
    this.totalAmountCard = page.getByText('Total Amount').first();
    this.collectionEfficiencyCard = page.getByText('Collections vs Outstanding %').first();
    this.summaryTab = page.getByRole('tab', { name: 'Summary' });
    this.byPeriodTab = page.getByRole('tab', { name: 'By Period' });
    this.byDealerTab = page.getByRole('tab', { name: 'By Dealer' });
    this.byRegionTab = page.getByRole('tab', { name: 'By Region' });
    this.byPeriodRows = page.locator('table tbody tr');
  }

  async navigate(): Promise<void> {
    await this.navigateTo('/o2c/reports/collection-report');
    await expect(this.page).toHaveURL(/\/o2c\/reports\/collection-report/, { timeout: 10000 });
    await expect(this.loadReportButton).toBeVisible({ timeout: 10000 });
  }

  async selectQuickPeriod(label: string): Promise<void> {
    await this.quickPeriodTrigger.click();
    await this.page.getByRole('option', { name: label }).click();
  }

  async clickLoadReport(): Promise<void> {
    await this.loadReportButton.click();
    await expect(this.loadReportButton).toBeVisible({ timeout: 30000 });
  }

  async waitForSummaryVisible(): Promise<void> {
    await expect(this.totalAmountCard).toBeVisible({ timeout: 30000 });
  }

  async openByPeriodTab(): Promise<void> {
    await this.byPeriodTab.click();
    await expect(this.byPeriodRows.first()).toBeVisible({ timeout: 10000 });
  }

  async getSummaryTotalAmount(): Promise<number> {
    const cardContainer = this.totalAmountCard.locator('..').locator('..');
    const amountText = (await cardContainer.locator('div.text-2xl').first().textContent()) || '0';
    return this.parseCurrency(amountText);
  }

  async getByPeriodTotalAmount(): Promise<number> {
    let total = 0;
    const rowCount = await this.byPeriodRows.count();
    for (let i = 0; i < rowCount; i++) {
      const row = this.byPeriodRows.nth(i);
      const amountText = (await row.locator('td').nth(2).textContent()) || '0';
      total += this.parseCurrency(amountText);
    }
    return total;
  }

  async openSummaryTab(): Promise<void> {
    await this.summaryTab.click();
    await expect(this.page.getByText('By Payment Method')).toBeVisible({ timeout: 10000 });
  }

  async getByPaymentMethodTotalAmount(): Promise<number> {
    await this.openSummaryTab();
    const paymentMethodCard = this.page.getByText('By Payment Method').locator('..').locator('..');
    const text = (await paymentMethodCard.textContent()) || '';
    const matches = text.match(/₹\s?[\d,]+(?:\.\d+)?/g) || [];
    return matches.reduce((sum, token) => sum + this.parseCurrency(token), 0);
  }

  async getByRegionTotalAmount(): Promise<number> {
    await this.byRegionTab.click();
    const rows = this.page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
    let total = 0;
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const amountText = (await rows.nth(i).locator('td').nth(2).textContent()) || '0';
      total += this.parseCurrency(amountText);
    }
    return total;
  }

  async getByDealerTotalAmount(): Promise<number> {
    await this.byDealerTab.click();
    const rows = this.page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
    let total = 0;
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const amountText = (await rows.nth(i).locator('td').nth(4).textContent()) || '0';
      total += this.parseCurrency(amountText);
    }
    return total;
  }

  private parseCurrency(input: string): number {
    const normalized = input.replace(/[^\d.-]/g, '');
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
}
