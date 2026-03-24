import * as fs from 'fs';
import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import ExcelJS from 'exceljs';
import { HierarchicalProductSalesReportPage } from '../../pages/o2c/HierarchicalProductSalesReportPage';

const { Given, When, Then } = createBdd();

let productSalesPage: HierarchicalProductSalesReportPage;
let downloadedExcelPath: string | null = null;

Given('I am on the Hierarchical Product Sales Report page', async function ({ page }) {
  productSalesPage = new HierarchicalProductSalesReportPage(page);
  await productSalesPage.navigate();
  (this as any).productSalesPage = productSalesPage;
});

When('I generate the Hierarchical Product Sales report with this month', async function ({ page }) {
  const reportPage = (this as any).productSalesPage || new HierarchicalProductSalesReportPage(page);
  await reportPage.generateThisMonthReport();
});

Then('I should see at least one dealer row in the hierarchy', async function ({ page }) {
  const reportPage = (this as any).productSalesPage || new HierarchicalProductSalesReportPage(page);
  const dealerText = reportPage.page.getByText(/dealer/i).first();
  await expect(dealerText).toBeVisible({ timeout: 15000 });
});

Then('dealer rows should show city badge or fallback "-"', async function ({ page }) {
  const reportPage = (this as any).productSalesPage || new HierarchicalProductSalesReportPage(page);
  const cityBadge = reportPage.page.locator('span,div').filter({ hasText: /MapPin|-/i }).first();
  await expect(cityBadge).toBeVisible({ timeout: 10000 });
});

When('I export Hierarchical Product Sales to detailed Excel', async function ({ page }) {
  const reportPage = (this as any).productSalesPage || new HierarchicalProductSalesReportPage(page);
  const downloadPromise = page.waitForEvent('download');
  await reportPage.clickExportDetailedExcel();
  const download = await downloadPromise;
  downloadedExcelPath = await download.path();
});

Then('Hierarchy Report sheet should contain City column and DEALER rows', async function () {
  if (!downloadedExcelPath) {
    throw new Error('No downloaded detailed Excel found for Hierarchical Product Sales.');
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fs.readFileSync(downloadedExcelPath));
  const sheet = workbook.getWorksheet('Hierarchy Report');
  expect(sheet).toBeDefined();
  if (!sheet) {
    return;
  }

  const headerCandidates: string[] = [];
  for (let rowIndex = 1; rowIndex <= 10; rowIndex++) {
    const row = sheet.getRow(rowIndex);
    row.eachCell((cell) => headerCandidates.push(String(cell.value || '')));
  }
  expect(headerCandidates.some((h) => /city/i.test(h))).toBe(true);

  let dealerRowFound = false;
  sheet.eachRow((row) => {
    const rowValues = row.values as Array<string | number | null | undefined>;
    const normalized = rowValues.map((value) => String(value || '').toUpperCase()).join(' | ');
    if (normalized.includes('DEALER')) {
      dealerRowFound = true;
    }
  });
  expect(dealerRowFound).toBe(true);
});

Then('Invoice Details and Dealer Ranking sheets should include City column', async function () {
  if (!downloadedExcelPath) {
    throw new Error('No downloaded detailed Excel found for Hierarchical Product Sales.');
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fs.readFileSync(downloadedExcelPath));
  for (const sheetName of ['Invoice Details', 'Dealer Ranking']) {
    const sheet = workbook.getWorksheet(sheetName);
    expect(sheet).toBeDefined();
    if (!sheet) {
      continue;
    }
    const candidates: string[] = [];
    for (let rowIndex = 1; rowIndex <= 10; rowIndex++) {
      const row = sheet.getRow(rowIndex);
      row.eachCell((cell) => candidates.push(String(cell.value || '')));
    }
    expect(candidates.some((h) => /city/i.test(h))).toBe(true);
  }
});

Then('Hierarchy Report sheet should include Variant Code column with data', async function () {
  if (!downloadedExcelPath) {
    throw new Error('No downloaded detailed Excel found for Hierarchical Product Sales.');
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fs.readFileSync(downloadedExcelPath));
  const sheet = workbook.getWorksheet('Hierarchy Report');
  expect(sheet).toBeDefined();
  if (!sheet) {
    return;
  }

  let variantCodeColumnIndex = -1;
  for (let rowIndex = 1; rowIndex <= 12; rowIndex++) {
    const row = sheet.getRow(rowIndex);
    for (let colIndex = 1; colIndex <= row.cellCount; colIndex++) {
      const value = String(row.getCell(colIndex).value || '').trim();
      if (/variant\s*code/i.test(value)) {
        variantCodeColumnIndex = colIndex;
        break;
      }
    }
    if (variantCodeColumnIndex > 0) {
      break;
    }
  }
  expect(variantCodeColumnIndex).toBeGreaterThan(0);

  let hasVariantCodeData = false;
  const maxRowsToCheck = Math.min(sheet.rowCount, 500);
  for (let rowIndex = 2; rowIndex <= maxRowsToCheck; rowIndex++) {
    const value = String(sheet.getRow(rowIndex).getCell(variantCodeColumnIndex).value || '').trim();
    if (value && value !== '-' && !/variant\s*code/i.test(value)) {
      hasVariantCodeData = true;
      break;
    }
  }
  expect(hasVariantCodeData).toBe(true);
});
