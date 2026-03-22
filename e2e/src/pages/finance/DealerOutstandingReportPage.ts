import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';

/**
 * Dealer Outstanding Report Page Object Model
 *
 * Source: ../web_app/src/app/finance/reports/dealer-outstanding/page.tsx (DAE-281)
 *
 * Purpose: `/finance/reports/dealer-outstanding` — 15-day due-date aging, filters, exports, drill-down.
 */
export class DealerOutstandingReportPage extends BasePage {
  readonly pageHeading: Locator;
  /** Card title is not always `role="heading"` in the DOM; match visible text. */
  readonly reportFiltersLabel: Locator;
  readonly loadReportButton: Locator;
  readonly exportCsvButton: Locator;
  readonly exportPdfButton: Locator;
  readonly asOfDateInput: Locator;
  readonly minOutstandingInput: Locator;
  readonly outstandingByDealerHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole('heading', { name: 'Dealer Outstanding Report', exact: true });
    this.reportFiltersLabel = page.getByText('Report Filters', { exact: true });
    this.loadReportButton = page.getByRole('button', { name: 'Load Report', exact: true });
    this.exportCsvButton = page.getByRole('button', { name: 'CSV', exact: true });
    this.exportPdfButton = page.getByRole('button', { name: 'PDF', exact: true });
    this.asOfDateInput = page.locator('input[type="date"]').first();
    this.minOutstandingInput = page.locator('input[type="number"]').first();
    this.outstandingByDealerHeading = page.getByRole('heading', { name: 'Outstanding by Dealer', exact: true });
  }

  filtersCard(): Locator {
    return this.page.locator('div').filter({ has: this.reportFiltersLabel });
  }

  /** Main grid: table that has Gross Outstanding column (avoids wrong tbody). */
  dealerTable(): Locator {
    return this.page.locator('table').filter({
      has: this.page.getByRole('columnheader', { name: 'Gross Outstanding', exact: true }),
    });
  }

  async goto(): Promise<void> {
    await this.navigateTo('/finance/reports/dealer-outstanding');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyPageShellVisible(): Promise<void> {
    await expect(this.pageHeading).toBeVisible({ timeout: 20000 });
  }

  async expectSubtitleVisible(): Promise<void> {
    await expect(
      this.page.getByText('15-day aging analysis based on due dates with regional hierarchy', { exact: true })
    ).toBeVisible();
  }

  async expectInitialEmptyDataMessage(): Promise<void> {
    await expect(
      this.page.getByText('No data available. Use the filters above and click "Load Report".', { exact: true })
    ).toBeVisible();
  }

  async clickLoadReport(): Promise<void> {
    await this.loadReportButton.click();
  }

  async expectLoadReportButtonEnabled(): Promise<void> {
    await expect(this.loadReportButton).toBeEnabled({ timeout: 5000 });
  }

  async waitForLoadFinished(): Promise<void> {
    await expect(this.loadReportButton.locator('.animate-spin')).toBeHidden({ timeout: 120000 }).catch(() => {});
    await expect(this.loadReportButton).toBeEnabled({ timeout: 5000 });
  }

  async expectLoadSuccessToast(): Promise<void> {
    await expect(
      this.page.locator('[data-sonner-toast]').filter({ hasText: /Report loaded:/i }).first()
    ).toBeVisible({ timeout: 120000 });
  }

  async expectReportFiltersVisible(): Promise<void> {
    await expect(this.reportFiltersLabel).toBeVisible();
    await expect(this.asOfDateInput).toBeVisible();
  }

  async setMinOutstanding(value: string): Promise<void> {
    await this.minOutstandingInput.fill(value);
  }

  async clearMinOutstanding(): Promise<void> {
    await this.minOutstandingInput.clear();
  }

  /** Region combobox is the first combobox inside Report Filters card. */
  async openRegionSelect(): Promise<void> {
    await this.filtersCard().getByRole('combobox').nth(0).click();
  }

  async selectRegionOptionByName(name: string): Promise<void> {
    await this.openRegionSelect();
    await this.page.getByRole('option', { name, exact: true }).click();
  }

  async expectSummaryCardWithLabel(label: string): Promise<void> {
    await expect(this.page.getByText(label, { exact: true }).first()).toBeVisible({ timeout: 60000 });
  }

  async expectDealerTableOrEmptyAfterLoad(): Promise<void> {
    await expect(
      this.dealerTable()
        .getByRole('columnheader', { name: 'Gross Outstanding', exact: true })
        .or(
          this.page.getByText('No data available. Use the filters above and click "Load Report".', { exact: true })
        )
    ).toBeVisible({ timeout: 60000 });
  }

  async dealerDataRowCount(): Promise<number> {
    return this.dealerTable().locator('tbody tr').count();
  }

  async isExportCsvEnabled(): Promise<boolean> {
    return this.exportCsvButton.isEnabled();
  }

  async isExportPdfEnabled(): Promise<boolean> {
    return this.exportPdfButton.isEnabled();
  }

  async clickExportCsv(): Promise<void> {
    await this.exportCsvButton.click();
  }

  async clickExportPdf(): Promise<void> {
    await this.exportPdfButton.click();
  }

  async expectCsvExportSuccessToast(): Promise<void> {
    await expect(
      this.page.locator('[data-sonner-toast]').filter({ hasText: /CSV exported successfully/i }).first()
    ).toBeVisible({ timeout: 60000 });
  }

  async expectPdfExportSuccessToast(): Promise<void> {
    await expect(
      this.page.locator('[data-sonner-toast]').filter({ hasText: /PDF exported successfully/i }).first()
    ).toBeVisible({ timeout: 120000 });
  }

  async clickFirstDealerDrilldown(): Promise<void> {
    const row = this.dealerTable().locator('tbody tr').first();
    await row.getByRole('button').first().click();
  }

  async expectDrilldownDialogVisible(): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Invoice Details', exact: true })).toBeVisible({
      timeout: 30000,
    });
  }

  async expectDrilldownInvoiceTableHeaders(): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await expect(dialog.getByRole('columnheader', { name: 'Invoice #', exact: true })).toBeVisible();
    await expect(dialog.getByRole('columnheader', { name: 'Balance', exact: true })).toBeVisible();
  }

  async closeDrilldownDialog(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await expect(this.page.getByRole('dialog')).toBeHidden({ timeout: 5000 });
  }

  async waitForDrilldownInvoiceRows(): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await expect(dialog.locator('tbody tr').first()).toBeVisible({ timeout: 60000 });
  }

  /** First data row in drill-down: invoice # (col 0), balance text (col 5). */
  async getFirstDrilldownInvoiceNumberAndBalance(): Promise<{ invoiceNumber: string; balanceText: string }> {
    const dialog = this.page.getByRole('dialog');
    const row = dialog.locator('tbody tr').first();
    const invoiceNumber = (await row.locator('td').nth(0).innerText()).trim();
    const balanceText = (await row.locator('td').nth(5).innerText()).trim();
    return { invoiceNumber, balanceText };
  }

  /**
   * Parse displayed gross / net currency (en-IN: ₹, grouping commas).
   */
  static parseCurrencyCell(text: string): number {
    let t = text.replace(/\s/g, '').trim();
    const neg = /^\(.*\)$/.test(t);
    if (neg) {
      t = t.slice(1, -1);
    }
    t = t.replace(/[₹\u2212\-]/g, '').replace(/,/g, '').trim();
    if (t === '' || t === '-') return 0;
    const n = parseFloat(t);
    if (!Number.isFinite(n)) return NaN;
    return neg ? -n : n;
  }

  /** First dealer row: dealer code, gross (9th cell), unalloc cash, ccn, unapplied, net. */
  async getFirstDealerRowNumericSummary(): Promise<{
    dealerCode: string;
    gross: number;
    unallocCash: number;
    unallocCcn: number;
    unapplied: number;
    net: number;
  } | null> {
    const row = this.dealerTable().locator('tbody tr').first();
    if ((await row.count()) === 0) return null;
    const cells = row.locator('td');
    const dealerCode = (await cells.nth(0).locator('p').first().innerText()).trim();
    const gross = DealerOutstandingReportPage.parseCurrencyCell(await cells.nth(9).innerText());
    const unallocCash = DealerOutstandingReportPage.parseCurrencyCell(await cells.nth(10).innerText());
    const unallocCcn = DealerOutstandingReportPage.parseCurrencyCell(await cells.nth(11).innerText());
    const unapplied = DealerOutstandingReportPage.parseCurrencyCell(await cells.nth(12).innerText());
    const net = DealerOutstandingReportPage.parseCurrencyCell(await cells.nth(13).innerText());
    return { dealerCode, gross, unallocCash, unallocCcn, unapplied, net };
  }
}
