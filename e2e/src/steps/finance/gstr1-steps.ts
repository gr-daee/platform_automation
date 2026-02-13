import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
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
  
  // Handle special values: "first" means select first available GSTIN
  let actualGSTIN = gstin;
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
  
  // Handle special values: "previous" means select previous month (default)
  let actualMonthYear = monthYear;
  if (monthYear === 'previous') {
    // Previous month is the default, format: "YYYY-MM"
    const previousDate = new Date();
    previousDate.setMonth(previousDate.getMonth() - 1);
    const year = previousDate.getFullYear();
    const month = String(previousDate.getMonth() + 1).padStart(2, '0');
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
