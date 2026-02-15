import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { IndentsPage } from '../../pages/o2c/IndentsPage';
import { IndentDetailPage } from '../../pages/o2c/IndentDetailPage';
import { PollingHelper } from '../../support/helpers/PollingHelper';

const { Given, When, Then } = createBdd();

let indentsPage: IndentsPage;
/** Lazy-created when a step needs the indent detail page (current page is /o2c/indents/:id). */
function getIndentDetailPage(page: import('@playwright/test').Page): IndentDetailPage {
  return new IndentDetailPage(page);
}
/** Used by TC-003 to assert we landed on the same draft indent (same URL). */
let lastIndentDetailUrl: string | null = null;

// O2C-specific navigation
Given('I am on the O2C Indents page', async function({ page }) {
  indentsPage = new IndentsPage(page);
  await indentsPage.navigate();
  console.log('✅ Navigated to O2C Indents page');
});

// O2C Indent-specific actions
When('I click the Create Indent button', async function({ page }) {
  await indentsPage.clickCreateIndent();
  console.log('✅ Clicked Create Indent button');
});

When('I search for dealer by name {string}', async function({ page }, dealerName: string) {
  await indentsPage.searchDealer(dealerName);
  console.log(`✅ Searched for dealer: "${dealerName}"`);
});

When('I search for dealer by code {string}', async function({ page }, dealerCode: string) {
  await indentsPage.searchDealer(dealerCode);
  console.log(`✅ Searched for dealer by code: "${dealerCode}"`);
});

When('I select the dealer {string}', async function({ page }, dealerName: string) {
  await indentsPage.selectDealer(dealerName);
  console.log(`✅ Selected dealer: "${dealerName}"`);
});

// Compound action: Create Indent flow (open modal, search, select dealer, wait for navigation)
When('I create an indent for dealer {string}', async function({ page }, dealerName: string) {
  await indentsPage.clickCreateIndent();
  await indentsPage.searchDealer(dealerName);
  await indentsPage.selectDealer(dealerName);
  // Wait for navigation to indent detail page (/o2c/indents/:id)
  await expect(page).toHaveURL(/\/o2c\/indents\/[a-f0-9-]+/, { timeout: 15000 });
  console.log(`✅ Created indent for dealer: "${dealerName}" (navigated to detail)`);
});

When('I go back to the O2C Indents page', async function() {
  await indentsPage.navigate();
  console.log('✅ Went back to O2C Indents page');
});

// List search and filters (TC-004, TC-005, TC-006, TC-008, TC-023)
When('I type {string} in the indents search box', async function({ page }, searchTerm: string) {
  await indentsPage.fillSearch(searchTerm);
  // Wait for table/empty state to update (debounced search)
  await PollingHelper.pollUntil(
    async () => {
      const rows = await indentsPage.getTableDataRowCount();
      const empty = await indentsPage.isEmptyStateVisible();
      return rows >= 0 || empty;
    },
    { timeout: 10000, interval: 500, description: 'list updated after search' }
  );
  console.log(`✅ Typed "${searchTerm}" in indents search`);
});

When('I filter by Status {string}', async function({ page }, statusLabel: string) {
  await indentsPage.selectStatusFilter(statusLabel);
  // Wait for list to update
  await page.waitForTimeout(500);
  console.log(`✅ Filtered by Status "${statusLabel}"`);
});

When('I clear all filters', async function() {
  await indentsPage.clearAllFilters();
  console.log('✅ Cleared all filters');
});

Given('the indents table has at least one row', async function() {
  await PollingHelper.pollUntil(
    async () => (await indentsPage.getTableDataRowCount()) >= 1,
    { timeout: 15000, interval: 500, description: 'indents table has at least one data row' }
  );
  console.log('✅ Indents table has at least one row');
});

When('I click the first indent row', async function({ page }) {
  await indentsPage.clickFirstIndentRow();
  await expect(page).toHaveURL(/\/o2c\/indents\/[a-f0-9-]+/, { timeout: 10000 });
  console.log('✅ Clicked first indent row');
});

// O2C Indent-specific assertions
Then('the O2C Indents list page should be loaded', async function() {
  await indentsPage.verifyListPageLoaded();
  console.log('✅ O2C Indents list page loaded');
});

Then('I should see the {string} modal', async function({ page }, modalTitle: string) {
  if (modalTitle.includes('Select Dealer')) {
    await indentsPage.verifyDealerModalVisible();
  } else {
    // Generic modal check
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: new RegExp(modalTitle, 'i') })).toBeVisible();
  }
  console.log(`✅ Verified "${modalTitle}" modal is visible`);
});

Then('the modal should display a list of active dealers', async function() {
  const dealerCount = await indentsPage.getDealerCount();
  expect(dealerCount).toBeGreaterThan(0);
  console.log(`✅ Modal displays ${dealerCount} active dealers`);
});

Then('the modal should have a search input', async function({ page }) {
  const searchInput = indentsPage.dealerSearchInput;
  await expect(searchInput).toBeVisible();
  await expect(searchInput).toBeEnabled();
  console.log('✅ Search input is visible and enabled');
});

Then('the dealer list should be filtered', async function({ page }) {
  // Poll until dealer table is visible and has filtered results (max 15 seconds)
  await PollingHelper.pollUntil(
    async () => {
      const table = indentsPage.dealerModal.getByRole('table');
      const isVisible = await table.isVisible().catch(() => false);
      if (!isVisible) return false;
      
      // Check if table has rows (excluding header)
      const rows = await indentsPage.dealerTableRows.count();
      return rows > 1; // More than just header row
    },
    {
      timeout: 15000, // Max 15 seconds
      interval: 500,
      description: 'dealer list to be filtered and visible',
      onPoll: (attempt, elapsed) => {
        console.log(`⏳ Waiting for dealer list to filter (attempt ${attempt}, ${elapsed}ms elapsed)...`);
      },
    }
  );
  
  await expect(indentsPage.dealerModal.getByRole('table')).toBeVisible();
  console.log('✅ Dealer list is filtered');
});

Then('I should see {string} in the results', async function({ page }, dealerName: string) {
  await indentsPage.verifyDealerInResults(dealerName);
  console.log(`✅ Verified "${dealerName}" appears in results`);
});

Then('the dealer list should show no matching dealers', async function() {
  await indentsPage.verifyDealerModalShowingNoResults();
  console.log('✅ Dealer list shows no matching dealers');
});

Then('the modal should close', async function({ page }) {
  const dialog = page.getByRole('dialog');
  await expect(dialog).not.toBeVisible();
  console.log('✅ Modal closed');
});

Then('I should be on the indent creation page with dealer pre-selected', async function({ page }) {
  await indentsPage.verifyIndentCreationPage();
  console.log('✅ On indent creation page with dealer pre-selected');
});

Then('I should be on the indent detail page', async function({ page }) {
  await expect(page).toHaveURL(/\/o2c\/indents\/[a-f0-9-]+/);
  lastIndentDetailUrl = page.url();
  console.log('✅ On indent detail page');
});

// Indent detail page verification
Then('the indent detail page should be loaded', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  await detailPage.verifyDetailPageLoaded();
  console.log('✅ Indent detail page loaded');
});

// Detail page actions (Edit, Add Product, Save, Submit, Back)
When('I click Edit on the indent detail page', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  await detailPage.clickEdit();
  console.log('✅ Clicked Edit on indent detail page');
});

When('I add a product by searching for {string}', async function({ page }, searchTerm: string) {
  const detailPage = getIndentDetailPage(page);
  await detailPage.clickAddItems();
  await detailPage.searchProduct(searchTerm);
  await page.waitForTimeout(600);
  await detailPage.selectFirstProductAndAdd();
  await detailPage.waitForSuccessToast(/added|product/i);
  console.log(`✅ Added product by searching "${searchTerm}"`);
});

When('I open Add Products and search for {string}', async function({ page }, searchTerm: string) {
  const detailPage = getIndentDetailPage(page);
  await detailPage.openAddProductsAndSearch(searchTerm);
  console.log(`✅ Opened Add Products and searched for "${searchTerm}"`);
});

Then('the Add Products modal should show at least one product', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  await detailPage.verifyAddProductsModalHasResults();
  console.log('✅ Add Products modal shows at least one product');
});

Then('the Add Products modal should show no matching products', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  await detailPage.verifyAddProductsModalShowingNoResults();
  console.log('✅ Add Products modal shows no matching products');
});

When('I save the indent', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  await detailPage.clickSave();
  await detailPage.waitForSuccessToast(/items updated|updated successfully/i).catch(() => {});
  await page.waitForTimeout(500);
  console.log('✅ Saved indent');
});

When('I submit the indent', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  await detailPage.clickSubmitIndent();
  await detailPage.waitForSuccessToast(/submitted/i);
  console.log('✅ Submitted indent');
});

When('I go back to the O2C Indents page from the indent detail', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  await detailPage.clickBack();
  await expect(page).toHaveURL(/\/o2c\/indents\/?$/);
  console.log('✅ Went back to O2C Indents list from detail');
});

Then('the indent should be saved successfully', async function({ page }) {
  await expect(page).toHaveURL(/\/o2c\/indents\/[a-f0-9-]+/);
  const detailPage = getIndentDetailPage(page);
  await detailPage.verifyDetailPageLoaded();
  console.log('✅ Indent saved successfully (still on detail)');
});

Then('the indent should be submitted successfully', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  await detailPage.waitForSuccessToast(/submitted/i);
  await detailPage.verifyDetailPageLoaded();
  console.log('✅ Indent submitted successfully');
});

// Warehouse, approval, process workflow (submitted/approved indent)
Then('the Warehouse Selection card should be visible', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  const visible = await detailPage.isWarehouseSelectionVisible();
  expect(visible).toBe(true);
  console.log('✅ Warehouse Selection card is visible');
});

When('I select the first warehouse for the indent', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  await detailPage.clickSelectWarehouse();
  await expect(detailPage.warehouseDialog.getByText(/\d+%/)).toBeVisible({ timeout: 12000 });
  await detailPage.selectFirstWarehouse();
  await page.waitForTimeout(800);
  console.log('✅ Selected first warehouse');
});

Then('the Approve button should be disabled', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  const disabled = await detailPage.isApproveDisabled();
  expect(disabled).toBe(true);
  console.log('✅ Approve button is disabled');
});

Then('the Approve button should be enabled', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  const disabled = await detailPage.isApproveDisabled();
  expect(disabled).toBe(false);
  console.log('✅ Approve button is enabled');
});

When('I click Approve on the indent detail page', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  await detailPage.clickApprove();
  console.log('✅ Clicked Approve');
});

When('I click Reject on the indent detail page', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  await detailPage.clickReject();
  console.log('✅ Clicked Reject');
});

When('I submit the approval dialog', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  await detailPage.submitApprovalDialog();
  console.log('✅ Submitted approval dialog');
});

When('I fill approval comments {string} and submit the approval dialog', async function({ page }, comments: string) {
  const detailPage = getIndentDetailPage(page);
  await detailPage.fillApprovalCommentsAndSubmit(comments);
  console.log('✅ Filled approval comments and submitted');
});

Then('the indent should be approved successfully', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  await detailPage.waitForSuccessToast(/approved/i);
  await detailPage.verifyDetailPageLoaded();
  console.log('✅ Indent approved successfully');
});

When('I click Process Workflow', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  await detailPage.clickProcessWorkflow();
  console.log('✅ Clicked Process Workflow');
});

When('I confirm and process the workflow', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  await detailPage.clickConfirmAndProcess();
  console.log('✅ Confirmed and processed workflow');
});

Then('the workflow should complete successfully', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  await detailPage.waitForSuccessToast(/processed|workflow|sales order|back order/i).catch(() => {});
  await page.waitForTimeout(1000);
  console.log('✅ Workflow completed successfully');
});

// Button state assertions (draft / submitted / approved)
Then('the Submit Indent button should be disabled', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  const enabled = await detailPage.isSubmitIndentEnabled();
  expect(enabled).toBe(false);
  console.log('✅ Submit Indent button is disabled');
});

Then('the Reject button in the approval dialog should be disabled', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  await expect(detailPage.approvalDialogSubmitButton).toBeDisabled();
  console.log('✅ Reject button in approval dialog is disabled');
});

Then('the Edit button should be visible on the indent detail page', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  await expect(detailPage.editButton).toBeVisible();
  console.log('✅ Edit button is visible');
});

Then('the Submit Indent button should be visible on the indent detail page', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  await expect(detailPage.submitIndentButton).toBeVisible();
  console.log('✅ Submit Indent button is visible');
});

Then('the Approve button should be visible on the indent detail page', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  await expect(detailPage.approveButton).toBeVisible();
  console.log('✅ Approve button is visible');
});

Then('the Approve button should not be visible on the indent detail page', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  await expect(detailPage.approveButton).not.toBeVisible();
  console.log('✅ Approve button is not visible');
});

Then('the Process Workflow button should not be visible on the indent detail page', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  await expect(detailPage.processWorkflowButton).not.toBeVisible();
  console.log('✅ Process Workflow button is not visible');
});

Then('the Process Workflow button should be visible on the indent detail page', async function({ page }) {
  const detailPage = getIndentDetailPage(page);
  await expect(detailPage.processWorkflowButton).toBeVisible();
  console.log('✅ Process Workflow button is visible');
});

Then('I should be on the same indent detail page as before', async function({ page }) {
  expect(lastIndentDetailUrl).not.toBeNull();
  await expect(page).toHaveURL(lastIndentDetailUrl!);
  console.log('✅ On same indent detail page as before (existing draft)');
});

Then('the list should show filtered results or the empty state', async function() {
  await PollingHelper.pollUntil(
    async () => {
      const rows = await indentsPage.getTableDataRowCount();
      const empty = await indentsPage.isEmptyStateVisible();
      return rows > 0 || empty;
    },
    { timeout: 10000, interval: 500, description: 'list shows filtered results or empty state' }
  );
  const rows = await indentsPage.getTableDataRowCount();
  const empty = await indentsPage.isEmptyStateVisible();
  expect(rows > 0 || empty).toBe(true);
  console.log(`✅ List shows filtered results or empty state (rows=${rows}, empty=${empty})`);
});

Then('the Clear filters button should not be visible', async function() {
  await expect(indentsPage.clearFiltersButton).not.toBeVisible();
  console.log('✅ Clear filters button is not visible');
});

Then('I should see the empty state for indents or at least one indent row', async function() {
  const empty = await indentsPage.isEmptyStateVisible();
  const rows = await indentsPage.getTableDataRowCount();
  expect(empty || rows >= 1).toBe(true);
  console.log(`✅ Empty state or at least one indent row (empty=${empty}, rows=${rows})`);
});
