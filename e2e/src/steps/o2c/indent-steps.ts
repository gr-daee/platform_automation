import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { IndentsPage } from '../../pages/o2c/IndentsPage';
import { PollingHelper } from '../../support/helpers/PollingHelper';

const { Given, When, Then } = createBdd();

let indentsPage: IndentsPage;

// O2C-specific navigation
Given('I am on the O2C Indents page', async function({ page }) {
  if (!indentsPage) {
    indentsPage = new IndentsPage(page);
  }
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

When('I select the dealer {string}', async function({ page }, dealerName: string) {
  await indentsPage.selectDealer(dealerName);
  console.log(`✅ Selected dealer: "${dealerName}"`);
});

// O2C Indent-specific assertions
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

Then('the modal should close', async function({ page }) {
  const dialog = page.getByRole('dialog');
  await expect(dialog).not.toBeVisible();
  console.log('✅ Modal closed');
});

Then('I should be on the indent creation page with dealer pre-selected', async function({ page }) {
  await indentsPage.verifyIndentCreationPage();
  console.log('✅ On indent creation page with dealer pre-selected');
});
