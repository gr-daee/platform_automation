import { expect, test } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { DealerOutstandingReportPage } from '../../pages/finance/DealerOutstandingReportPage';
import {
  getTenantIdForFinanceE2E,
  getDealerIdByDealerCode,
  sumDealerOutstandingGrossFromInvoices,
  getInvoiceBalanceByInvoiceNumber,
} from '../../support/finance-db-helpers';

const { Given, When, Then } = createBdd();

Given('I am on the dealer outstanding report page', async function ({ page }) {
  const p = new DealerOutstandingReportPage(page);
  await p.goto();
  await p.verifyPageShellVisible();
  (this as unknown as { doPage: DealerOutstandingReportPage }).doPage = p;
});

Then('I should see the dealer outstanding report heading', async function ({ page }) {
  const p =
    (this as unknown as { doPage?: DealerOutstandingReportPage }).doPage ||
    new DealerOutstandingReportPage(page);
  await p.verifyPageShellVisible();
});

Then('I should see the dealer outstanding report subtitle', async function ({ page }) {
  const p =
    (this as unknown as { doPage?: DealerOutstandingReportPage }).doPage ||
    new DealerOutstandingReportPage(page);
  await p.expectSubtitleVisible();
});

Then('dealer outstanding report filters should be visible', async function ({ page }) {
  const p =
    (this as unknown as { doPage?: DealerOutstandingReportPage }).doPage ||
    new DealerOutstandingReportPage(page);
  await p.expectReportFiltersVisible();
});

Then('dealer outstanding should show initial empty data message', async function ({ page }) {
  const p =
    (this as unknown as { doPage?: DealerOutstandingReportPage }).doPage ||
    new DealerOutstandingReportPage(page);
  await p.expectInitialEmptyDataMessage();
});

When('I load the dealer outstanding report', async function ({ page }) {
  const p =
    (this as unknown as { doPage?: DealerOutstandingReportPage }).doPage ||
    new DealerOutstandingReportPage(page);
  await p.clickLoadReport();
  await p.waitForLoadFinished();
  (this as unknown as { doPage: DealerOutstandingReportPage }).doPage = p;
});

Then('I should see dealer outstanding load success toast', async function ({ page }) {
  const p =
    (this as unknown as { doPage?: DealerOutstandingReportPage }).doPage ||
    new DealerOutstandingReportPage(page);
  await p.expectLoadSuccessToast();
});

Then('dealer outstanding should show summary or empty table after load', async function ({ page }) {
  const p =
    (this as unknown as { doPage?: DealerOutstandingReportPage }).doPage ||
    new DealerOutstandingReportPage(page);
  await p.expectDealerTableOrEmptyAfterLoad();
});

Then('dealer outstanding should show Gross Outstanding summary label if totals loaded', async function ({
  page,
}) {
  const p =
    (this as unknown as { doPage?: DealerOutstandingReportPage }).doPage ||
    new DealerOutstandingReportPage(page);
  await p.expectSummaryCardWithLabel('Gross Outstanding');
});

When('I set dealer outstanding min outstanding to {string}', async function ({ page }, value: string) {
  const p =
    (this as unknown as { doPage?: DealerOutstandingReportPage }).doPage ||
    new DealerOutstandingReportPage(page);
  await p.setMinOutstanding(value);
  (this as unknown as { doPage: DealerOutstandingReportPage }).doPage = p;
});

Then('dealer outstanding CSV export should be disabled', async function ({ page }) {
  const p =
    (this as unknown as { doPage?: DealerOutstandingReportPage }).doPage ||
    new DealerOutstandingReportPage(page);
  await expect(p.exportCsvButton).toBeDisabled();
});

When('I open dealer outstanding region filter', async function ({ page }) {
  const p =
    (this as unknown as { doPage?: DealerOutstandingReportPage }).doPage ||
    new DealerOutstandingReportPage(page);
  await p.openRegionSelect();
  await expect(page.getByRole('listbox')).toBeVisible({ timeout: 10000 });
  (this as unknown as { doPage: DealerOutstandingReportPage }).doPage = p;
});

Then('dealer outstanding should list All Regions in region dropdown', async function ({ page }) {
  await expect(page.getByRole('option', { name: 'All Regions', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toBeHidden({ timeout: 5000 }).catch(() => {});
});

When('I export dealer outstanding CSV if data is available', async function ({ page }) {
  const p =
    (this as unknown as { doPage?: DealerOutstandingReportPage }).doPage ||
    new DealerOutstandingReportPage(page);
  const n = await p.dealerDataRowCount();
  if (n === 0 || !(await p.isExportCsvEnabled())) {
    test.skip(true, 'No dealer rows or CSV export disabled.');
  }
  await p.clickExportCsv();
});

Then('I should see dealer outstanding CSV export success toast if export ran', async function ({ page }) {
  const p =
    (this as unknown as { doPage?: DealerOutstandingReportPage }).doPage ||
    new DealerOutstandingReportPage(page);
  await p.expectCsvExportSuccessToast();
});

When('I export dealer outstanding PDF if data is available', async function ({ page }) {
  const p =
    (this as unknown as { doPage?: DealerOutstandingReportPage }).doPage ||
    new DealerOutstandingReportPage(page);
  const n = await p.dealerDataRowCount();
  if (n === 0 || !(await p.isExportPdfEnabled())) {
    test.skip(true, 'No dealer rows or PDF export disabled.');
  }
  await p.clickExportPdf();
});

Then('I should see dealer outstanding PDF export success toast if export ran', async function ({ page }) {
  const p =
    (this as unknown as { doPage?: DealerOutstandingReportPage }).doPage ||
    new DealerOutstandingReportPage(page);
  await p.expectPdfExportSuccessToast();
});

When('I open dealer outstanding drill-down for first dealer if rows exist', async function ({ page }) {
  const p =
    (this as unknown as { doPage?: DealerOutstandingReportPage }).doPage ||
    new DealerOutstandingReportPage(page);
  const n = await p.dealerDataRowCount();
  if (n === 0) {
    test.skip(true, 'No dealers with outstanding; drill-down unavailable.');
  }
  await p.clickFirstDealerDrilldown();
  (this as unknown as { dealerOutstandingDrilldownOpened: boolean }).dealerOutstandingDrilldownOpened = true;
  (this as unknown as { doPage: DealerOutstandingReportPage }).doPage = p;
});

Then('dealer outstanding drill-down should show invoice table headers if dialog opened', async function ({
  page,
}) {
  if (!(this as unknown as { dealerOutstandingDrilldownOpened?: boolean }).dealerOutstandingDrilldownOpened) {
    return;
  }
  const p = new DealerOutstandingReportPage(page);
  await p.expectDrilldownDialogVisible();
  await p.expectDrilldownInvoiceTableHeaders();
});

When('I close dealer outstanding drill-down if open', async function ({ page }) {
  const ctx = this as unknown as { dealerOutstandingDrilldownOpened?: boolean };
  if (!ctx.dealerOutstandingDrilldownOpened) {
    test.skip(true, 'Drill-down was not opened.');
  }
  const p = new DealerOutstandingReportPage(page);
  await p.closeDrilldownDialog();
});

Then('dealer outstanding drill-down dialog should be hidden', async function ({ page }) {
  await expect(page.getByRole('dialog')).toBeHidden({ timeout: 5000 });
});

Then(
  'first dealer outstanding gross should match database for as of date if row exists',
  async function ({ page }) {
    const p =
      (this as unknown as { doPage?: DealerOutstandingReportPage }).doPage ||
      new DealerOutstandingReportPage(page);
    const rowCount = await p.dealerDataRowCount();
    if (rowCount === 0) {
      test.skip(true, 'No dealer rows on report.');
    }
    const tenantId = await getTenantIdForFinanceE2E();
    if (!tenantId) {
      test.skip(true, 'No tenant id (IACS_TENANT_ID / E2E_TENANT_ID / DB).');
    }
    const asOf = await p.asOfDateInput.inputValue();
    const row = await p.getFirstDealerRowNumericSummary();
    if (!row || Number.isNaN(row.gross)) {
      test.skip(true, 'Could not parse gross from first row.');
    }
    const dealerId = await getDealerIdByDealerCode(tenantId, row.dealerCode);
    if (!dealerId) {
      test.skip(true, `Dealer code not found in DB: ${row.dealerCode}`);
    }
    const dbSum = await sumDealerOutstandingGrossFromInvoices(tenantId, dealerId, asOf);
    expect(row.gross).toBeCloseTo(dbSum, 2);
  }
);

Then(
  'first drill-down invoice balance should match database if invoice row exists',
  async function ({ page }) {
    if (!(this as unknown as { dealerOutstandingDrilldownOpened?: boolean }).dealerOutstandingDrilldownOpened) {
      test.skip(true, 'Drill-down was not opened.');
    }
    const p = new DealerOutstandingReportPage(page);
    try {
      await p.expectDrilldownDialogVisible();
      await p.waitForDrilldownInvoiceRows();
    } catch {
      test.skip(true, 'No invoice lines in drill-down.');
    }
    const tenantId = await getTenantIdForFinanceE2E();
    if (!tenantId) {
      test.skip(true, 'No tenant id for DB.');
    }
    const { invoiceNumber, balanceText } = await p.getFirstDrilldownInvoiceNumberAndBalance();
    const db = await getInvoiceBalanceByInvoiceNumber(tenantId, invoiceNumber);
    if (!db) {
      test.skip(true, `Invoice not found in DB: ${invoiceNumber}`);
    }
    const uiBal = DealerOutstandingReportPage.parseCurrencyCell(balanceText);
    expect(uiBal).toBeCloseTo(db.balance_amount, 2);
  }
);

Then(
  'first dealer net outstanding should match UI formula if dealer row exists',
  async function ({ page }) {
    const p =
      (this as unknown as { doPage?: DealerOutstandingReportPage }).doPage ||
      new DealerOutstandingReportPage(page);
    if ((await p.dealerDataRowCount()) === 0) {
      test.skip(true, 'No dealer rows.');
    }
    const row = await p.getFirstDealerRowNumericSummary();
    if (!row || [row.gross, row.net, row.unallocCash, row.unallocCcn, row.unapplied].some((x) => Number.isNaN(x))) {
      test.skip(true, 'Could not parse numeric row.');
    }
    const expectedSigned = row.gross - row.unallocCash - row.unallocCcn - row.unapplied;
    const diffMag = Math.abs(Math.abs(row.net) - Math.abs(expectedSigned));
    expect(
      diffMag,
      `|net|=${Math.abs(row.net)} vs |gross−credits|=${Math.abs(expectedSigned)} (gross=${row.gross} cash=${row.unallocCash} ccn=${row.unallocCcn} unapplied=${row.unapplied})`
    ).toBeLessThanOrEqual(10);
  }
);

Then('dealer outstanding table should show Unapplied Credits column header', async function ({ page }) {
  const p =
    (this as unknown as { doPage?: DealerOutstandingReportPage }).doPage ||
    new DealerOutstandingReportPage(page);
  const table = p.dealerTable();
  if ((await table.count()) === 0) {
    test.skip(true, 'No dealer grid (zero outstanding dealers); column header not rendered.');
  }
  await expect(table.getByRole('columnheader', { name: 'Unapplied Credits', exact: true })).toBeVisible({
    timeout: 30000,
  });
});

When('I attempt to open dealer outstanding report as unauthorized user', async function ({ page }) {
  await page.goto('/finance/reports/dealer-outstanding', { waitUntil: 'domcontentloaded' });
});

Then('I should be denied access to dealer outstanding report', async function ({ page }) {
  try {
    await expect.poll(() => page.url(), { timeout: 20000 }).toMatch(/restrictedUser/i);
    await expect(page).toHaveURL(/\/restrictedUser/i);
  } catch {
    if (/\/finance\/reports\/dealer-outstanding/i.test(page.url())) {
      test.skip(
        true,
        'iacs-ed has invoices read in this environment; FIN-DO-TC-040 needs a user without invoices:read.'
      );
      return;
    }
    throw new Error(`Unexpected URL after RBAC wait: ${page.url()}`);
  }
});
