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
