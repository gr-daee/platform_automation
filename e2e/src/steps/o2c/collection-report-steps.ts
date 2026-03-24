import * as fs from 'fs';
import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import ExcelJS from 'exceljs';
import { CollectionReportPage } from '../../pages/o2c/CollectionReportPage';

const { Given, When, Then } = createBdd();

let collectionReportPage: CollectionReportPage;
let lastDownloadedPath: string | null = null;

Given('I am on the Collection Report page', async function ({ page }) {
  collectionReportPage = new CollectionReportPage(page);
  await collectionReportPage.navigate();
  (this as any).collectionReportPage = collectionReportPage;
});

When('I select collection quick period {string}', async function ({ page }, period: string) {
  const reportPage = (this as any).collectionReportPage || new CollectionReportPage(page);
  await reportPage.selectQuickPeriod(period);
});

Then('the collection report From and To date should reflect current month range', async function ({ page }) {
  const reportPage = (this as any).collectionReportPage || new CollectionReportPage(page);
  const from = await reportPage.fromDateInput.inputValue();
  const to = await reportPage.toDateInput.inputValue();
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  expect(from).toBe(`${year}-${month}-01`);
  expect(to).toBe(`${year}-${month}-${day}`);
});

When('I click Load Report in Collection Report', async function ({ page }) {
  const reportPage = (this as any).collectionReportPage || new CollectionReportPage(page);
  await reportPage.clickLoadReport();
  await reportPage.waitForSummaryVisible();
});

Then('I should see {string} in collection summary cards', async function ({ page }, text: string) {
  const reportPage = (this as any).collectionReportPage || new CollectionReportPage(page);
  await expect(reportPage.page.getByText(text)).toBeVisible({ timeout: 15000 });
});

Then('sum of By Period amounts should approximately match summary total amount', async function ({ page }) {
  const reportPage = (this as any).collectionReportPage || new CollectionReportPage(page);
  await reportPage.openByPeriodTab();
  const summaryTotal = await reportPage.getSummaryTotalAmount();
  const periodTotal = await reportPage.getByPeriodTotalAmount();
  // Allow tiny UI rounding difference across period rows.
  expect(Math.abs(summaryTotal - periodTotal)).toBeLessThanOrEqual(2);
});

Then('sum of By Payment Method, By Region and By Dealer amounts should approximately match summary total amount', async function ({ page }) {
  const reportPage = (this as any).collectionReportPage || new CollectionReportPage(page);
  const summaryTotal = await reportPage.getSummaryTotalAmount();
  const paymentTotal = await reportPage.getByPaymentMethodTotalAmount();
  const regionTotal = await reportPage.getByRegionTotalAmount();
  const dealerTotal = await reportPage.getByDealerTotalAmount();

  // Tolerance handles formatting/rounding in rendered values.
  const tolerance = 5;
  expect(Math.abs(summaryTotal - paymentTotal)).toBeLessThanOrEqual(tolerance);
  expect(Math.abs(summaryTotal - regionTotal)).toBeLessThanOrEqual(tolerance);
  expect(Math.abs(summaryTotal - dealerTotal)).toBeLessThanOrEqual(tolerance);
});

When('I export Collection Report to Excel', async function ({ page }) {
  const reportPage = (this as any).collectionReportPage || new CollectionReportPage(page);
  const downloadPromise = page.waitForEvent('download');
  await reportPage.exportExcelButton.click();
  const download = await downloadPromise;
  lastDownloadedPath = await download.path();
});

Then('the exported Collection Report workbook should include efficiency and comparison sections', async function () {
  if (!lastDownloadedPath) {
    throw new Error('No downloaded Collection Report workbook found.');
  }
  const workbook = new ExcelJS.Workbook();
  const buffer = fs.readFileSync(lastDownloadedPath);
  await workbook.xlsx.load(buffer);
  const names = workbook.worksheets.map((sheet) => sheet.name);
  const required = ['Summary', 'By Period', 'By Dealer', 'By Region', 'Efficiency Analysis', 'Period Comparison'];
  for (const sheetName of required) expect(names).toContain(sheetName);
  expect(names.some((n) => /Aging/i.test(n))).toBe(true);
});
