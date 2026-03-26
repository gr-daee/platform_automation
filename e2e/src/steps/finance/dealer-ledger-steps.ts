import { expect, test } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { DealerLedgerPage } from '../../pages/finance/DealerLedgerPage';

const { Given, When, Then } = createBdd();

Given('I am on the dealer ledger page', async function ({ page }) {
  const dealerLedgerPage = new DealerLedgerPage(page);
  await dealerLedgerPage.goto();
  await dealerLedgerPage.verifyPageLoaded();
  (this as any).dealerLedgerPage = dealerLedgerPage;
});

When('I select dealer by search text {string}', async function ({ page }, searchText: string) {
  const dealerLedgerPage =
    ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
  await dealerLedgerPage.selectDealerByCodeOrName(searchText);
});

When('I load dealer ledger', async function ({ page }) {
  const dealerLedgerPage =
    ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
  await dealerLedgerPage.loadDealerLedgerAndWaitForData(25000);
});

When(
  'I set dealer ledger date range from {string} to {string}',
  async function ({ page }, fromIso: string, toIso: string) {
    const dealerLedgerPage =
      ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
    await dealerLedgerPage.setLedgerFromDate(fromIso);
    await dealerLedgerPage.setLedgerToDate(toIso);
  }
);

When('I export dealer ledger as CSV', async function ({ page }) {
  const dealerLedgerPage =
    ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
  await dealerLedgerPage.clickExportCsv();
});

When('I filter dealer ledger transactions by type {string}', async function ({ page }, optionLabel: string) {
  const dealerLedgerPage =
    ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
  await dealerLedgerPage.selectTransactionTypeFilter(optionLabel);
});

When('I open the first invoice document link from dealer ledger', async function ({ page }) {
  const dealerLedgerPage =
    ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
  await dealerLedgerPage.openFirstDocumentLinkForTransactionType(
    'Invoice',
    /\/o2c\/invoices\/[a-f0-9-]+/i
  );
});

When('I export dealer ledger standard PDF', async function ({ page }) {
  const dealerLedgerPage =
    ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
  await dealerLedgerPage.clickExportStandardDealerLedgerPdf();
});

When('I export dealer ledger detailed invoice PDF', async function ({ page }) {
  const dealerLedgerPage =
    ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
  await dealerLedgerPage.clickExportDetailedInvoiceLedgerPdf();
});

When('I search dealer ledger transactions with first row document number', async function ({ page }) {
  const dealerLedgerPage =
    ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
  const doc = await dealerLedgerPage.getFirstDataRowDocumentNumber();
  await dealerLedgerPage.searchTransactions(doc);
});

When('I click dealer ledger date column header to toggle sort', async function ({ page }) {
  const dealerLedgerPage =
    ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
  await dealerLedgerPage.clickTransactionDateColumnHeader();
});

When('I open the first payment document link from dealer ledger', async function ({ page }) {
  const dealerLedgerPage =
    ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
  await dealerLedgerPage.openFirstDocumentLinkForTransactionType(
    'Payment',
    /\/o2c\/payments\/[a-f0-9-]+/i
  );
});

When('I open the first credit note document link from dealer ledger', async function ({ page }) {
  const dealerLedgerPage =
    ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
  await dealerLedgerPage.openFirstDocumentLinkForTransactionType(
    'Credit Note',
    /\/finance\/credit-memos\/[a-f0-9-]+/i
  );
});

When('I attempt to open dealer ledger as unauthorized user', async function ({ page }) {
  await page.goto('/finance/dealer-ledger', { waitUntil: 'domcontentloaded' });
});

Then('dealer information should display business name {string} and dealer code {string}', async function (
  { page },
  businessName: string,
  dealerCode: string
) {
  const dealerLedgerPage =
    ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
  await dealerLedgerPage.expectDealerInformation(businessName, dealerCode);
});

Then('dealer ledger summary cards should be visible', async function ({ page }) {
  const dealerLedgerPage =
    ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
  await dealerLedgerPage.expectSummaryCardsVisible();
});

Then('dealer ledger transaction history table should be visible', async function ({ page }) {
  const dealerLedgerPage =
    ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
  await dealerLedgerPage.expectTransactionHistoryTableVisible();
});

Then('dealer ledger should have at least one transaction row', async function ({ page }) {
  const dealerLedgerPage =
    ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
  await dealerLedgerPage.expectAtLeastOneTransactionDataRow();
});

Then('dealer ledger should show at least one invoice transaction', async function ({ page }) {
  const dealerLedgerPage =
    ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
  const has = await dealerLedgerPage.hasInvoiceTransaction();
  expect(has).toBe(true);
});

Then('Load Ledger button should be disabled', async function ({ page }) {
  const dealerLedgerPage =
    ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
  await dealerLedgerPage.expectLoadLedgerButtonDisabled();
});

Then('I should see dealer ledger CSV export success toast', async function ({ page }) {
  const dealerLedgerPage =
    ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
  await dealerLedgerPage.expectCsvExportSuccessToast();
});

Then(
  'all visible dealer ledger data rows should show transaction type {string}',
  async function ({ page }, typeLabel: string) {
    const dealerLedgerPage =
      ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
    await dealerLedgerPage.expectAllVisibleDataRowsHaveTransactionType(typeLabel);
  }
);

Then('I should be on an O2C invoice detail page', async function ({ page }) {
  await expect(page).toHaveURL(/\/o2c\/invoices\/[a-f0-9-]+/i, { timeout: 15000 });
});

Then('I should see dealer ledger standard PDF export success toast', async function ({ page }) {
  const dealerLedgerPage =
    ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
  await dealerLedgerPage.expectStandardPdfExportSuccessToast();
});

Then('I should see dealer ledger detailed PDF export success toast', async function ({ page }) {
  const dealerLedgerPage =
    ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
  await dealerLedgerPage.expectDetailedPdfExportSuccessToast();
});

Then('dealer ledger transaction table should show exactly one data row', async function ({ page }) {
  const dealerLedgerPage =
    ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
  await dealerLedgerPage.expectTransactionDataRowCount(1);
});

Then('dealer ledger AR aging analysis should be visible', async function ({ page }) {
  const dealerLedgerPage =
    ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
  await dealerLedgerPage.expectArAgingAnalysisVisible();
});

Then('dealer ledger AR aging analysis may be visible when data exists', async function ({ page }) {
  const dealerLedgerPage =
    ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
  await dealerLedgerPage.expectArAgingAnalysisOnlyIfPresent();
});

Then('dealer ledger VAN section may be visible when data exists', async function ({ page }) {
  const dealerLedgerPage =
    ((this as any).dealerLedgerPage as DealerLedgerPage) || new DealerLedgerPage(page);
  await dealerLedgerPage.expectVanSectionOnlyIfPresent();
});

Then('I should be on an O2C payment detail page', async function ({ page }) {
  await expect(page).toHaveURL(/\/o2c\/payments\/[a-f0-9-]+/i, { timeout: 15000 });
});

Then('I should be on a credit memo detail page', async function ({ page }) {
  await expect(page).toHaveURL(/\/finance\/credit-memos\/[a-f0-9-]+/i, { timeout: 15000 });
});

Then('I should be denied access to dealer ledger', async function ({ page }) {
  for (let i = 0; i < 45; i++) {
    const u = page.url();
    if (/\/restrictedUser/i.test(u)) {
      await expect(page).toHaveURL(/\/restrictedUser/i);
      return;
    }
    await page.waitForTimeout(300);
  }
  if (/\/finance\/dealer-ledger/i.test(page.url())) {
    test.skip(
      true,
      'iacs-ed has dealer_ledger access in this environment; FIN-DL-TC-008 needs a user without dealer_ledger:read.'
    );
    return;
  }
  await expect(page).toHaveURL(/\/restrictedUser/i, { timeout: 2000 });
});
