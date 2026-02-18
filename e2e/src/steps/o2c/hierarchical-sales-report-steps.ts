import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { HierarchicalSalesReportPage } from '../../pages/o2c/HierarchicalSalesReportPage';

const { Given, When, Then } = createBdd();

/**
 * Hierarchical Sales Report Step Definitions
 *
 * Implements steps for O2C-HSR-TC-003 through TC-028 (TC-001/002 documented only).
 */

let hierarchicalSalesPage: HierarchicalSalesReportPage;

Given('I am on the Hierarchical Sales Report page', async function ({ page }) {
  hierarchicalSalesPage = new HierarchicalSalesReportPage(page);
  await hierarchicalSalesPage.navigate();
  (this as any).hierarchicalSalesPage = hierarchicalSalesPage;
});

Then('I should see the Hierarchical Sales Report page', async function ({ page }) {
  const hsrPage = (this as any).hierarchicalSalesPage || new HierarchicalSalesReportPage(page);
  await hsrPage.verifyPageLoaded();
});

When('I clear the From Date and To Date', async function ({ page }) {
  const hsrPage = (this as any).hierarchicalSalesPage || new HierarchicalSalesReportPage(page);
  await hsrPage.fromDateInput.clear();
  await hsrPage.toDateInput.clear();
});

Then('the Generate Report button should be disabled', async function ({ page }) {
  const hsrPage = (this as any).hierarchicalSalesPage || new HierarchicalSalesReportPage(page);
  const disabled = await hsrPage.isGenerateReportDisabled();
  expect(disabled).toBe(true);
});

When('I click quick period {string}', async function ({ page }, period: string) {
  const hsrPage = (this as any).hierarchicalSalesPage || new HierarchicalSalesReportPage(page);
  const key = period === 'This Month' ? 'month' : period === 'This Quarter' ? 'quarter' : 'year';
  await hsrPage.clickQuickPeriod(key);
});

Then('the From Date and To Date should reflect current month range', async function ({ page }) {
  const hsrPage = (this as any).hierarchicalSalesPage || new HierarchicalSalesReportPage(page);
  const from = await hsrPage.getFromDateValue();
  const to = await hsrPage.getToDateValue();
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const expectedStart = `${year}-${month}-01`;
  const expectedEnd = `${year}-${month}-${day}`;
  expect(from).toBe(expectedStart);
  expect(to).toBe(expectedEnd);
});

Then('the From Date and To Date should reflect current quarter range', async function ({ page }) {
  const hsrPage = (this as any).hierarchicalSalesPage || new HierarchicalSalesReportPage(page);
  const from = await hsrPage.getFromDateValue();
  const to = await hsrPage.getToDateValue();
  const now = new Date();
  const year = now.getFullYear();
  const q = Math.floor(now.getMonth() / 3) + 1;
  const startMonth = (q - 1) * 3 + 1;
  const expectedStart = `${year}-${String(startMonth).padStart(2, '0')}-01`;
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const expectedEnd = `${year}-${month}-${day}`;
  expect(from).toBe(expectedStart);
  expect(to).toBe(expectedEnd);
});

Then('the From Date and To Date should reflect year to date', async function ({ page }) {
  const hsrPage = (this as any).hierarchicalSalesPage || new HierarchicalSalesReportPage(page);
  const from = await hsrPage.getFromDateValue();
  const to = await hsrPage.getToDateValue();
  const now = new Date();
  const year = now.getFullYear();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  expect(from).toBe(`${year}-01-01`);
  expect(to).toBe(`${year}-${month}-${day}`);
});

Then('the State GSTIN dropdown should be visible', async function ({ page }) {
  const hsrPage = (this as any).hierarchicalSalesPage || new HierarchicalSalesReportPage(page);
  await expect(hsrPage.stateDropdown).toBeVisible({ timeout: 5000 });
});

Then('the State dropdown should contain {string} option', async function ({ page }, option: string) {
  const hsrPage = (this as any).hierarchicalSalesPage || new HierarchicalSalesReportPage(page);
  await hsrPage.stateDropdown.click();
  await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
  await expect(page.getByRole('option', { name: option })).toBeVisible();
  await page.keyboard.press('Escape');
});

When('I click Generate Report', async function ({ page }) {
  const hsrPage = (this as any).hierarchicalSalesPage || new HierarchicalSalesReportPage(page);
  await hsrPage.clickGenerateReport();
});

Then('I should see toast {string}', async function ({ page }, message: string) {
  const hsrPage = (this as any).hierarchicalSalesPage || new HierarchicalSalesReportPage(page);
  await hsrPage.verifyToastError(message);
});

When('I set date range to a valid past period', async function ({ page }) {
  const hsrPage = (this as any).hierarchicalSalesPage || new HierarchicalSalesReportPage(page);
  const now = new Date();
  const year = now.getFullYear();
  const lastMonth = new Date(year, now.getMonth() - 1, 1);
  const from = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}-01`;
  const to = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}-15`;
  await hsrPage.setDateRange(from, to);
});

Then('the report should load successfully', async function ({ page }) {
  const hsrPage = (this as any).hierarchicalSalesPage || new HierarchicalSalesReportPage(page);
  await hsrPage.waitForReportLoaded();
});

Then('summary cards and Grand Total should be visible', async function ({ page }) {
  const hsrPage = (this as any).hierarchicalSalesPage || new HierarchicalSalesReportPage(page);
  await hsrPage.verifySummaryCardsVisible();
});

Then('the Generate Report button should show {string} during load', async function ({ page }, text: string) {
  const hsrPage = (this as any).hierarchicalSalesPage || new HierarchicalSalesReportPage(page);
  await expect(hsrPage.generateReportButton).toContainText(text, { timeout: 3000 });
});

Then('the Export Excel button should be disabled or not visible when no report', async function ({ page }) {
  const hsrPage = (this as any).hierarchicalSalesPage || new HierarchicalSalesReportPage(page);
  const exportBtn = hsrPage.exportExcelButton;
  const count = await exportBtn.count();
  if (count === 0) {
    return;
  }
  const disabled = await hsrPage.isExportExcelDisabled();
  const visible = await exportBtn.isVisible().catch(() => false);
  expect(disabled === true || visible === false).toBe(true);
});

Then('I should see the empty state {string}', async function ({ page }, message: string) {
  const hsrPage = (this as any).hierarchicalSalesPage || new HierarchicalSalesReportPage(page);
  await expect(hsrPage.page.getByText(message)).toBeVisible({ timeout: 10000 });
});

When('I set date range to a future period with no data', async function ({ page }) {
  const hsrPage = (this as any).hierarchicalSalesPage || new HierarchicalSalesReportPage(page);
  const futureYear = new Date().getFullYear() + 2;
  await hsrPage.setDateRange(`${futureYear}-01-01`, `${futureYear}-01-15`);
});

Then('I should see {string} or report loads with zero dealers', async function ({ page }, message: string) {
  const hsrPage = (this as any).hierarchicalSalesPage || new HierarchicalSalesReportPage(page);
  // Wait for report loading to complete: button shows "Generating..." until done
  const generateBtn = hsrPage.page.getByRole('button', { name: /Generate Report|Generating/ });
  await expect(generateBtn).toContainText('Generate Report', { timeout: 60000 });
  const noData = hsrPage.page.getByText(message);
  const grandTotal = hsrPage.page.getByText('GRAND TOTAL');
  const hasNoData = await noData.isVisible().catch(() => false);
  const hasGrandTotal = await grandTotal.isVisible().catch(() => false);
  expect(hasNoData || hasGrandTotal).toBe(true);
});
