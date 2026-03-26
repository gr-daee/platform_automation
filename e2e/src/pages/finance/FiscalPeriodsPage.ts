import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../support/base/BasePage';
import { SelectComponent } from '../../support/components/SelectComponent';

/**
 * Fiscal period management UI.
 *
 * Source: ../web_app/src/app/finance/fiscal-periods/page.tsx
 */
export class FiscalPeriodsPage extends BasePage {
  readonly pageHeading: Locator;
  readonly newFiscalYearButton: Locator;
  readonly sequentialRuleHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole('heading', { name: 'Fiscal Period Management' });
    this.newFiscalYearButton = page.getByRole('button', { name: 'New Fiscal Year' });
    this.sequentialRuleHeading = page.getByRole('heading', { name: /Sequential Closing Rule/i });
  }

  async goto(): Promise<void> {
    await this.navigateTo('/finance/fiscal-periods');
    await expect(this.pageHeading).toBeVisible({ timeout: 20000 });
  }

  getFiscalYearTab(year: number | string): Locator {
    return this.page.getByRole('tab', { name: new RegExp(`FY\\s*${year}`, 'i') });
  }

  async clickFiscalYearTab(year: number | string): Promise<void> {
    const tab = this.getFiscalYearTab(year);
    await expect(tab).toBeVisible({ timeout: 15000 });
    await tab.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /** Row cell for period name (exact match in Period column). */
  periodRow(periodName: string): Locator {
    const safe = periodName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.page.locator('tbody tr').filter({ hasText: new RegExp(safe) });
  }

  getOpenPeriodButtonInRow(periodName: string): Locator {
    return this.periodRow(periodName).getByRole('button', { name: 'Open Period' });
  }

  getClosePeriodButtonInRow(periodName: string): Locator {
    return this.periodRow(periodName).getByRole('button', { name: 'Close Period' });
  }

  getHardCloseButtonInRow(periodName: string): Locator {
    return this.periodRow(periodName).getByRole('button', { name: 'Hard Close' });
  }

  getReopenButtonInRow(periodName: string): Locator {
    return this.periodRow(periodName).getByRole('button', { name: 'Reopen' });
  }

  async expectPeriodStatusText(periodName: string, statusLabel: RegExp): Promise<void> {
    const row = this.periodRow(periodName);
    await expect(row).toBeVisible({ timeout: 15000 });
    await expect(row.getByText(statusLabel)).toBeVisible();
  }

  async expectPostingBadgeForPeriod(periodName: string, allowed: boolean): Promise<void> {
    const row = this.periodRow(periodName);
    await expect(row).toBeVisible({ timeout: 15000 });
    if (allowed) {
      await expect(row.getByText('Allowed', { exact: true })).toBeVisible();
    } else {
      // Posting badge "Locked" must not match Actions badge "Permanently Locked" (substring).
      await expect(row.getByText('Locked', { exact: true })).toBeVisible();
    }
  }

  async openNewFiscalYearDialog(): Promise<void> {
    await this.newFiscalYearButton.click();
    await expect(this.page.getByRole('dialog', { name: /Create New Fiscal Year/i })).toBeVisible({
      timeout: 10000,
    });
  }

  /**
   * Fill create dialog and submit. Server assigns periods; waits for success toast and dialog close.
   */
  async createFiscalYearThroughUi(opts: {
    name: string;
    fiscalYear: number;
    startDate: string;
    endDate: string;
  }): Promise<void> {
    await this.openNewFiscalYearDialog();
    const dlg = this.page.getByRole('dialog', { name: /Create New Fiscal Year/i });
    await dlg.getByLabel(/Fiscal Year Name/i).fill(opts.name);
    await dlg.locator('#fiscalYear').fill(String(opts.fiscalYear));
    await dlg.locator('#startDate').fill(opts.startDate);
    await dlg.locator('#endDate').fill(opts.endDate);
    const select = new SelectComponent(this.page);
    await select.selectByLabel(/Period Structure/i, '12 Monthly Periods');
    await dlg.getByRole('button', { name: 'Create Fiscal Year' }).click();
    const toast = this.page.locator('[data-sonner-toast]').first();
    await expect(toast).toBeVisible({ timeout: 90000 });
    const toastText = (await toast.textContent())?.trim() ?? '';
    if (!/Fiscal year created successfully/i.test(toastText)) {
      throw new Error(`Create fiscal year failed or unexpected toast: ${toastText}`);
    }
    await expect(dlg).toBeHidden({ timeout: 15000 });
    await expect(this.getFiscalYearTab(opts.fiscalYear)).toBeVisible({ timeout: 20000 });
  }

  /** Period name cells (first column) for the visible periods table, top to bottom. */
  async readPeriodNamesFromTable(): Promise<string[]> {
    const rows = this.page.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 20000 });
    const n = await rows.count();
    const names: string[] = [];
    for (let i = 0; i < n; i++) {
      const text = await rows.nth(i).locator('td').first().innerText();
      names.push(text.trim());
    }
    return names;
  }
}
