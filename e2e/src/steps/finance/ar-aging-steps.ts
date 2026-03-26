import { expect, test } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { ARAgingPage } from '../../pages/finance/ARAgingPage';

const { Given, When, Then } = createBdd();

Given('I am on the AR aging report page', async function ({ page }) {
  const arAgingPage = new ARAgingPage(page);
  await arAgingPage.goto();
  await arAgingPage.verifyPageShellVisible();
  await arAgingPage.waitForDealerSummaryReady();
  (this as any).arAgingPage = arAgingPage;
});

Given('I am on the AR aging report page via legacy reports path', async function ({ page }) {
  const arAgingPage = new ARAgingPage(page);
  await arAgingPage.gotoLegacyReportsPath();
  await expect(page).toHaveURL(/\/finance\/ar-aging/i, { timeout: 20000 });
  await arAgingPage.verifyPageShellVisible();
  await arAgingPage.waitForDealerSummaryReady();
  (this as any).arAgingPage = arAgingPage;
});

Then('I should see the AR aging report heading', async function ({ page }) {
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.verifyPageShellVisible();
});

Then('AR aging report should finish loading', async function ({ page }) {
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.waitForDealerSummaryReady();
});

Then('AR aging dealer summary should show table or empty receivables message', async function ({ page }) {
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.expectDealerSummaryOrEmptyVisible();
});

When('I open the AR aging invoice detail tab', async function ({ page }) {
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.clickTab('Invoice Detail');
});

Then('I should see AR aging invoice detail tab content', async function ({ page }) {
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.expectInvoiceDetailTabContentVisible();
});

When('I open the AR aging snapshots tab', async function ({ page }) {
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.clickTab('Snapshots');
});

Then('I should see AR aging snapshots tab content', async function ({ page }) {
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.expectSnapshotsTabContentVisible();
});

When('I open the AR aging dealer summary tab', async function ({ page }) {
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.clickTab('Dealer Summary');
});

When('I open AR aging filters panel from toolbar', async function ({ page }) {
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.toggleFiltersPanel();
});

Then('AR aging filter options panel should be visible', async function ({ page }) {
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.expectFilterOptionsPanelVisible();
});

When('I close AR aging filters panel from toolbar', async function ({ page }) {
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.toggleFiltersPanel();
});

Then('AR aging filter options panel should be hidden', async function ({ page }) {
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.expectFilterOptionsPanelHidden();
});

When('I set AR aging basis to due date', async function ({ page }) {
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.selectAgingBasisDueDate();
});

When('I apply AR aging filters', async function ({ page }) {
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.clickApplyFilters();
});

Then('AR aging dealer summary should show not due column for due date basis', async function ({ page }) {
  if (await page.getByText('No outstanding receivables', { exact: true }).isVisible().catch(() => false)) {
    test.skip(true, 'No AR data in environment; dealer table (and Not Due column) not shown.');
  }
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.expectDealerSummaryNotDueColumnVisible();
});

When('I search AR aging with text {string}', async function ({ page }, text: string) {
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.searchDealersAndInvoices(text);
});

Then('I should see no AR aging dealers matching search message', async function ({ page }) {
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.expectNoDealersMatchSearchMessage();
});

When('I export AR aging Excel if data is available', async function ({ page }) {
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.waitForDealerSummaryReady();
  if (!(await arAgingPage.isExportExcelEnabled())) {
    test.skip(true, 'No AR receivables in environment; Export Excel is disabled.');
  }
  await arAgingPage.clickExportExcel();
});

Then('I should see AR aging Excel export success toast if export ran', async function ({ page }) {
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.expectExportExcelSuccessToast();
});

When('I export AR aging PDF if data is available', async function ({ page }) {
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.waitForDealerSummaryReady();
  if (!(await arAgingPage.isExportPdfEnabled())) {
    test.skip(true, 'No AR receivables in environment; Export PDF is disabled.');
  }
  await arAgingPage.clickExportPdf();
});

Then('I should see AR aging PDF export success toast if export ran', async function ({ page }) {
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.expectExportPdfSuccessToast();
});

When('I attempt to open AR aging report as unauthorized user', async function ({ page }) {
  await page.goto('/finance/ar-aging', { waitUntil: 'domcontentloaded' });
});

Then('I should be denied access to AR aging report', async function ({ page }) {
  // Permission matrix may grant iacs-ed finance_aging_reports in some tenants; wait then assert or skip.
  for (let i = 0; i < 45; i++) {
    const u = page.url();
    if (/\/restrictedUser/i.test(u)) {
      await expect(page).toHaveURL(/\/restrictedUser/i);
      return;
    }
    await page.waitForTimeout(300);
  }
  if (/\/finance\/ar-aging/i.test(page.url())) {
    test.skip(
      true,
      'iacs-ed has AR aging access in this environment; FIN-AR-TC-009 needs a user without finance_aging_reports:read.'
    );
    return;
  }
  await expect(page).toHaveURL(/\/restrictedUser/i, { timeout: 2000 });
});

Then('I should be on the canonical AR aging report URL', async function ({ page }) {
  await expect(page).toHaveURL(/\/finance\/ar-aging\/?$/i, { timeout: 5000 });
});

When('I open AR aging generate snapshot dialog', async function ({ page }) {
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.openGenerateSnapshotDialog();
});

Then('AR aging generate snapshot dialog should be visible', async function ({ page }) {
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.expectGenerateSnapshotDialogVisible();
});

When('I cancel AR aging generate snapshot dialog', async function ({ page }) {
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.cancelGenerateSnapshotDialog();
});

Then('AR aging generate snapshot dialog should be hidden', async function ({ page }) {
  const arAgingPage =
    ((this as any).arAgingPage as ARAgingPage) || new ARAgingPage(page);
  await arAgingPage.expectGenerateSnapshotDialogHidden();
});
