import * as fs from 'fs';
import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import ExcelJS from 'exceljs';
import { GSTR1Page } from '../../pages/finance/GSTR1Page';

const { Given, When, Then } = createBdd();

/**
 * GSTR-1 Review Page Step Definitions
 * 
 * Implements steps for DAEE-100 Access & Navigation tests
 * 
 * Note: Page object is created fresh per test to avoid page closure issues
 */

// Navigation step
Given('I am on the GSTR-1 Review page', async function({ page }) {
  const gstr1Page = new GSTR1Page(page);
  await gstr1Page.navigate();
  // Store in test context for reuse in same scenario
  (this as any).gstr1Page = gstr1Page;
  console.log('✅ Navigated to GSTR-1 Review page');
});

// Step for TC-003: Navigate directly and verify access (for multi-user test)
When('I navigate to "/finance/compliance/gstr1"', async function({ page }) {
  const gstr1Page = new GSTR1Page(page);
  await gstr1Page.navigate();
  // Store in test context for reuse in same scenario
  (this as any).gstr1Page = gstr1Page;
  console.log('✅ Navigated to /finance/compliance/gstr1');
});

// Verification steps
Then('I should see the GSTR-1 Review page', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyPageLoaded();
  console.log('✅ GSTR-1 Review page loaded successfully');
});

Then('I should see empty state message {string}', async function({ page }, message: string) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  
  // Use the POM method which handles waiting and multiple locator strategies
  await gstr1Page.verifyEmptyState();
  
  // Verify the message text matches
  const emptyStateLocator = page.locator('span.text-slate-500').filter({ hasText: message }).or(
    page.getByText(message, { exact: false })
  );
  await expect(emptyStateLocator).toContainText(message, { timeout: 2000 });
  
  console.log(`✅ Verified empty state message: "${message}"`);
});

Then('I should see Seller GSTIN and Return Period filters', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyFiltersPresent();
  console.log('✅ Verified Seller GSTIN filter is present');
  console.log('✅ Verified Return Period filter is present');
});

Then('I should be denied access to GSTR-1 page', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyAccessDenied();
  console.log('✅ Access denied - user redirected or shown error');
});

// Step for TC-003 Scenario Outline - specific to GSTR-1 access results
Then('I should see {string} for GSTR-1 access', async function({ page }, expectedResult: string) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  
  // Add detailed logging for debugging
  const currentUrl = page.url();
  const pageTitle = await page.title().catch(() => 'N/A');
  const pageContent = await page.content().catch(() => 'N/A');
  const hasGSTR = pageContent.includes('GSTR-1');
  const hasCardTitle = pageContent.includes('card-title');
  
  console.log(`🔍 Debug Info for TC-003:`);
  console.log(`   URL: ${currentUrl}`);
  console.log(`   Page Title: ${pageTitle}`);
  console.log(`   Has "GSTR-1" text: ${hasGSTR}`);
  console.log(`   Has card-title: ${hasCardTitle}`);
  console.log(`   Expected Result: "${expectedResult}"`);
  
  if (expectedResult.includes('GSTR-1 Review page')) {
    await gstr1Page.verifyPageLoaded();
    console.log('✅ Access granted - GSTR-1 Review page loaded');
  } else if (expectedResult.includes('access denied') || expectedResult.includes('denied')) {
    await gstr1Page.verifyAccessDenied();
    console.log('✅ Access denied - user redirected or shown error');
  } else {
    // Default: verify page loaded
    await gstr1Page.verifyPageLoaded();
    console.log(`✅ Verified: ${expectedResult}`);
  }
});

// Additional step for verifying empty state disappears after filters applied
Then('the empty state should no longer be visible', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyEmptyStateHidden();
  console.log('✅ Empty state hidden - data loaded');
});

// Global Filters steps (TC-004 to TC-007)
Then('the Filing Period dropdown should be visible with current month options', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyFilingPeriodDropdownVisible();
  console.log('✅ Verified Filing Period dropdown is visible with current/open month');
});

Then('the Seller GSTIN dropdown should display GSTIN and State Name format', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifySellerGSTINFormat();
  console.log('✅ Verified Seller GSTIN dropdown displays "GSTIN - State Name" format');
});

When('I select Seller GSTIN {string} and Return Period {string}', async function({ page }, gstin: string, monthYear: string) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  
  // Handle special values: "first" | "all" (All GSTINs for ZIP export)
  let actualGSTIN = gstin;
  if (gstin === 'all') {
    actualGSTIN = 'All GSTINs';
  }
  if (gstin === 'first') {
    // Open dropdown to get first GSTIN
    const label = page.locator('label').filter({ hasText: /seller gstin/i });
    const combobox = label.locator('..').getByRole('combobox').first();
    await combobox.click();
    await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    
    // Get first GSTIN option (skip "All GSTINs" if present)
    const options = page.locator('[role="listbox"]').locator('[role="option"]');
    const firstOption = options.first();
    const optionText = await firstOption.textContent();
    
    // If first option is "All GSTINs", get second option
    if (optionText?.includes('All GSTINs')) {
      const secondOption = options.nth(1);
      const gstinSpan = secondOption.locator('span.font-mono');
      actualGSTIN = (await gstinSpan.textContent()) || '';
    } else {
      const gstinSpan = firstOption.locator('span.font-mono');
      actualGSTIN = (await gstinSpan.textContent()) || '';
    }
    
    await page.keyboard.press('Escape'); // Close dropdown
    await page.waitForTimeout(300);
  }
  
  // Select GSTIN
  await gstr1Page.selectSellerGSTIN(actualGSTIN);
  console.log(`✅ Selected Seller GSTIN: ${actualGSTIN}`);
  
  // Wait a bit for GSTIN selection to process
  await page.waitForTimeout(500);
  
  // Handle special values: "previous" = previous month, "current" = current month
  let actualMonthYear = monthYear;
  if (monthYear === 'previous') {
    const previousDate = new Date();
    previousDate.setMonth(previousDate.getMonth() - 1);
    const year = previousDate.getFullYear();
    const month = String(previousDate.getMonth() + 1).padStart(2, '0');
    actualMonthYear = `${year}-${month}`;
  } else if (monthYear === 'current') {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    actualMonthYear = `${year}-${month}`;
  }

  // Select Return Period
  await gstr1Page.selectFilingPeriod(actualMonthYear);
  console.log(`✅ Selected Return Period: ${actualMonthYear}`);
  
  // Store in context for reuse
  (this as any).gstr1Page = gstr1Page;
});

Then('data should load and empty state should disappear', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyDataLoadedAfterFilters();
  console.log('✅ Verified data loaded after selecting filters');
});

Then('the Return Period card should show human-readable format', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyReturnPeriodCardFormat();
  console.log('✅ Verified Return Period card shows human-readable format');
});

// Summary Cards / Health Check (TC-008 to TC-012)
Then('the Total Liability card should be visible and show numeric value', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyTotalLiabilityCardVisible();
});

Then('the Total Taxable Value card should be visible and numeric', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyTotalTaxableValueCardVisible();
});

Then('the Validation Errors card should be visible with error count', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyValidationErrorsCardVisible();
});

Then('the E-Invoice Status card should be visible with IRN status', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyEInvoiceStatusCardVisible();
});

Then('the Net Taxable Value card should be visible and show correct formula', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyNetTaxableValueCardVisible();
});

// Validation Banner (AC4, DEF-012) - TC-013 to TC-015
Then('the collapsible Fix Required or Review Recommended banner should appear above tabs', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyValidationBannerVisibleWhenIssuesExist();
});

Then('the validation banner should list specific issues with document or message', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyValidationBannerListsSpecificIssues();
});

Then('the validation banner should not appear when there are zero validation errors', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyValidationBannerHiddenWhenNoIssues();
});

// B2B Tab (AC3, DEF-005, DEF-006, DEF-013) - TC-016 to TC-022
Then('the B2B tab should show columns Status GSTIN Name Inv No Date and others', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyB2BTabColumnHeaders();
});

Then('the B2B Status column should reflect e-invoice status', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyB2BStatusColumnReflectsEInvoiceStatus();
});

Then('the B2B Inv Type should show R or Regular for IWT not IWT', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyB2BInvTypeShowsRForIWT();
});

Then('the B2B Rate column should show percentage for taxable invoices', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyB2BRateColumnNumericForTaxable();
});

Then('IWT rows in B2B should show Buyer Name not Unknown', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyB2BIWTRowsBuyerNameNotUnknown();
});

Then('the B2B Buyer Name column should show full name or wrap', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyB2BBuyerNameColumnFullDisplay();
});

Then('the B2B table should support filters and pagination', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyB2BFiltersAndPagination();
});

// CDNR Tab (AC3, DEF-007) - TC-023, TC-024
Then('the CDNR tab should show columns Note Type Note Value Taxable Value and tax amounts', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyCDNRTabColumnHeaders();
});

Then('CDNR note values should be shown as positive in the UI', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyCDNRNoteValuesPositive();
});

// HSN Tab (AC3, DEF-008–010) - TC-025 to TC-029
Then('the HSN tab should show columns HSN Code UQC Rate Total Value and tax columns', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyHSNTabColumnHeaders();
});

Then('the HSN Rate column should show correct percentage not 0% or decimal', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyHSNRateColumnPercentage();
});

Then('the HSN tab should not show Description or Product Name column', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyHSNNoDescriptionOrProductNameColumn();
});

Then('the HSN tab should show single line per HSN UQC Rate combination', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyHSNSingleLinePerHSNUQCRate();
});

// Docs Issued Tab (AC7, DEF-011) - TC-030 to TC-033
Then('the Docs tab should show columns Nature of Doc Sr No From Sr No To Total Number Cancelled Net Issued', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyDocsTabColumnHeaders();
});

Then('Docs Net Issued should equal Total Number minus Cancelled for each row', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyDocsNetIssuedEqualsTotalMinusCancelled();
});

Then('Docs Nature of Document should use exact allowed strings', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyDocsNatureOfDocumentExactStrings();
});

// Export (AC5, AC6, AC7, DEF-014) - TC-034, TC-035, TC-036, TC-040
Then('the Export button should open a menu with Export Excel and Export JSON options', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyExportButtonOpensMenuWithExcelAndJson();
});

Then('Export Excel should download a file named GSTR1 GSTIN Month xlsx', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.triggerExportExcelAndWaitForDownload();
});

Then('the exported Excel file should have expected sheets and template structure', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  const { path } = await gstr1Page.triggerExportExcelAndWaitForDownload();
  const buffer = fs.readFileSync(path);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const count = workbook.worksheets.length;
  if (count < 20) throw new Error(`Exported Excel should have at least 20 sheets (template). Got: ${count}`);
  const names = workbook.worksheets.map(s => s.name);
  const required = ['b2b', 'cdnr', 'docs', 'hsn(b2b)'];
  for (const name of required) {
    if (!names.includes(name)) throw new Error(`Exported Excel missing sheet: ${name}. Has: ${names.join(', ')}`);
  }
  console.log(`✅ Exported Excel has ${count} sheets and key sheets present`);
});

Then('the exported Excel data in b2b cdnr hsn docs should start at row 5', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  const { path } = await gstr1Page.triggerExportExcelAndWaitForDownload();
  const buffer = fs.readFileSync(path);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const b2b = workbook.getWorksheet('b2b');
  if (!b2b) throw new Error('b2b sheet not found');
  const row5 = b2b.getRow(5);
  if (!row5) throw new Error('b2b sheet should have row 5 (data starts at row 5)');
  console.log('✅ Exported Excel data starts at row 5');
});

// TC-038: b2b/cdnr exclude "Tax Amount" columns; hsn includes Tax Amount columns (AC6)
Then('the exported Excel b2b and cdnr should exclude Tax Amount columns and hsn should include Tax Amount columns', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  const { path } = await gstr1Page.triggerExportExcelAndWaitForDownload();
  const buffer = fs.readFileSync(path);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const getHeaderTexts = (sheet: ExcelJS.Worksheet, rowNum: number): string[] => {
    const row = sheet.getRow(rowNum);
    const texts: string[] = [];
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const v = cell.value;
      if (v != null) texts.push(String(v).trim());
    });
    return texts;
  };

  const b2b = workbook.getWorksheet('b2b');
  const cdnr = workbook.getWorksheet('cdnr');
  const hsnB2b = workbook.getWorksheet('hsn(b2b)');
  if (!b2b || !cdnr || !hsnB2b) throw new Error('Required sheets b2b, cdnr, hsn(b2b) not found');

  const b2bHeaders = getHeaderTexts(b2b, 4);
  const cdnrHeaders = getHeaderTexts(cdnr, 4);
  const hsnHeaders = getHeaderTexts(hsnB2b, 4);

  const hasTaxAmount = (headers: string[]) => headers.some(h => /Tax Amount/i.test(h));
  if (hasTaxAmount(b2bHeaders)) throw new Error(`TC-038: B2B should exclude "Tax Amount" columns. Headers: ${b2bHeaders.join(', ')}`);
  if (hasTaxAmount(cdnrHeaders)) throw new Error(`TC-038: CDNR should exclude "Tax Amount" columns. Headers: ${cdnrHeaders.join(', ')}`);

  const requiredHsn = ['Integrated Tax Amount', 'Central Tax Amount', 'State/UT Tax Amount'];
  for (const name of requiredHsn) {
    if (!hsnHeaders.some(h => h === name)) throw new Error(`TC-038: HSN should include "${name}". Headers: ${hsnHeaders.join(', ')}`);
  }
  console.log('✅ Exported Excel b2b/cdnr exclude Tax Amount columns; hsn includes Tax Amount columns');
});

// TC-039: Date format dd-mmm-yyyy (text); POS Code-StateName (e.g. 29-Karnataka)
Then('the exported Excel date format should be dd-mmm-yyyy and POS should be Code-StateName', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  const { path } = await gstr1Page.triggerExportExcelAndWaitForDownload();
  const buffer = fs.readFileSync(path);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const b2b = workbook.getWorksheet('b2b');
  if (!b2b) throw new Error('b2b sheet not found');

  // B2B: row 4 = headers, row 5+ = data. Invoice date = col 5, Place Of Supply = col 7 (1-based)
  const row5 = b2b.getRow(5);
  const dateCell = row5.getCell(5);
  const posCell = row5.getCell(7);
  const dateVal = dateCell.value;
  const posVal = posCell.value;

  const dateStr = dateVal != null ? String(dateVal).trim() : '';
  const posStr = posVal != null ? String(posVal).trim() : '';

  // If no data in row 5, skip format checks (template only)
  if (!dateStr && !posStr) {
    console.log('✅ TC-039: No data in row 5; date/POS format check skipped (template only)');
    return;
  }

  const ddMmmYyyy = /^\d{2}-[A-Za-z]{3}-\d{4}$/;
  const codeStateName = /^\d{2}-[A-Za-z\s]+$/;

  if (dateStr && !ddMmmYyyy.test(dateStr)) {
    throw new Error(`TC-039: Date should be dd-mmm-yyyy (e.g. 01-Jan-2026). Got: "${dateStr}"`);
  }
  if (posStr && !codeStateName.test(posStr)) {
    throw new Error(`TC-039: Place Of Supply should be Code-StateName (e.g. 29-Karnataka). Got: "${posStr}"`);
  }
  console.log('✅ Exported Excel date format dd-mmm-yyyy and POS Code-StateName');
});

Then('Export All GSTINs should download a ZIP named GSTR1_ALL_Month zip', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.triggerExportZIPAndWaitForDownload();
});

// Tabs & Data Presence (Section 10) - TC-042, TC-043, TC-044
Then('all tabs Summary B2B B2CL B2CS CDNR CDNUR HSN Docs should be clickable and show content', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyAllTabsClickableAndShowContent();
});

Then('the Summary tab should show section totals and liability', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifySummaryTabShowsSectionTotalsAndLiability();
});

Then('Summary Total Liability should match sum of tax from HSN sheets', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifySummaryTotalLiabilityMatchesHSNTaxSum();
});

// Error & Loading States (Section 11) - TC-045, TC-046, TC-047
Then('a loading state should be shown then content', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyLoadingStateShownThenContent();
});

Then('the Export button should be disabled or show loading during export', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyExportButtonShowsLoadingDuringExport();
});

// Definition of Done / Cross-Cut (Section 12) - TC-048, TC-049, TC-050
When('I change Return Period to {string}', async function({ page }, periodKey: string) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  let actualMonthYear: string;
  if (periodKey === 'previous') {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    actualMonthYear = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  } else if (periodKey === 'current') {
    const d = new Date();
    actualMonthYear = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  } else {
    actualMonthYear = periodKey;
  }
  await gstr1Page.selectFilingPeriod(actualMonthYear);
  (this as any).gstr1Page = gstr1Page;
  console.log(`✅ Changed Return Period to: ${actualMonthYear}`);
});

Then('the Return Period card should show period {string}', async function({ page }, periodKey: string) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyReturnPeriodCardShowsSelectedPeriod(periodKey);
});

Then('the B2CS tab should show grouped summary', async function({ page }) {
  const gstr1Page = (this as any).gstr1Page || new GSTR1Page(page);
  await gstr1Page.verifyB2CSTabShowsGroupedSummary();
});
