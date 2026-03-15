import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { EPDCalculatorPage } from '../../pages/tools/EPDCalculatorPage';
import { PaymentTermsPage } from '../../pages/finance/PaymentTermsPage';
import { EPDConfigurationPage } from '../../pages/finance/EPDConfigurationPage';
import { CashReceiptApplyPage } from '../../pages/finance/CashReceiptApplyPage';
import {
  getEPDSlabsByDaysRange,
  getTenantIdForFinanceE2E,
  deleteEPDSlabsByDaysRangeForTestCleanup,
  getOldestAllocatableInvoiceAndSlab,
  updateEPDSlabDiscountForTestCleanup,
} from '../../support/finance-db-helpers';

const { Given, When, Then } = createBdd();

Given('I am on the EPD calculator page', async function ({ page }) {
  const epdPage = new EPDCalculatorPage(page);
  await epdPage.goto();
  await epdPage.verifyPageLoaded();
  (this as any).epdCalculatorPage = epdPage;
});

Given('I am on the EPD configuration page', async function ({ page }) {
  const configPage = new EPDConfigurationPage(page);
  await configPage.goto();
  await configPage.verifyPageLoaded();
  (this as any).epdConfigurationPage = configPage;
});

Given('I am on the payment terms page', async function ({ page }) {
  const paymentTermsPage = new PaymentTermsPage(page);
  await paymentTermsPage.goto();
  await paymentTermsPage.verifyPageLoaded();
  (this as any).paymentTermsPage = paymentTermsPage;
});

Given('tenant is configured with EPD approach {string}', async function (
  { page },
  _approach: string
) {
  (this as any).epdApproach = _approach;
});

Given('tenant has EPD slabs configured', async function () {
  (this as any).epdSlabsConfigured = true;
});

When('I select EPD approach {string}', async function ({ page }, approach: string) {
  const epdPage = (this as any).epdCalculatorPage || new EPDCalculatorPage(page);
  if (!(this as any).epdCalculatorPage) await epdPage.goto();
  const value = approach === 'reduce_outstanding' ? 'reduce_outstanding' : 'create_ccn';
  await epdPage.selectEPDApproach(value as 'reduce_outstanding' | 'create_ccn');
});

When('I calculate EPD for invoice dated {string} paid on {string}', async function (
  { page },
  invoiceDate: string,
  paymentDate: string
) {
  const epdPage = (this as any).epdCalculatorPage || new EPDCalculatorPage(page);
  if (!(this as any).epdCalculatorPage) await epdPage.goto();
  (this as any).epdInvoiceDate = invoiceDate;
  (this as any).epdPaymentDate = paymentDate;
});

When('I add EPD slab with days {int} to {int} and discount {int}%', async function (
  { page },
  daysFrom: number,
  daysTo: number,
  discountPercent: number
) {
  const paymentTermsPage = (this as any).paymentTermsPage || new PaymentTermsPage(page);
  await paymentTermsPage.goto();
  await paymentTermsPage.addSlabButton.click();
  await page.getByLabel(/days from|from/i).fill(String(daysFrom));
  await page.getByLabel(/days to|to/i).fill(String(daysTo));
  await page.getByLabel(/discount|percent/i).fill(String(discountPercent));
  await page.getByRole('button', { name: /Save|Add/i }).click();
  (this as any).lastSlabDaysFrom = daysFrom;
  (this as any).lastSlabDaysTo = daysTo;
});

Then('EPD should be {string} based on slab', async function ({ page }, expectedAmount: string) {
  const epdPage = (this as any).epdCalculatorPage || new EPDCalculatorPage(page);
  await epdPage.verifyEPDResult(parseFloat(expectedAmount));
});

Then('the EPD calculator page should show EPD content', async function ({ page }) {
  const epdPage = (this as any).epdCalculatorPage || new EPDCalculatorPage(page);
  await expect(epdPage.pageTitle.or(epdPage.page.getByText(/EPD|Early Payment|Calculator/i).first())).toBeVisible({ timeout: 10000 });
});

Then('I should see EPD slab for {int}-{int} days', async function (
  { page },
  daysFrom: number,
  daysTo: number
) {
  const paymentTermsPage = (this as any).paymentTermsPage || new PaymentTermsPage(page);
  await paymentTermsPage.verifyEPDSlabExists(daysFrom, daysTo);
});

// --- EPD Configuration page (/finance/epd-configuration) ---

/** Remove slab from DB if present (test cleanup so create can succeed). */
When('I remove the EPD slab for days {int} to {int} from the database if it exists', async function (
  { page: _page },
  daysFrom: number,
  daysTo: number
) {
  const tenantId = await getTenantIdForFinanceE2E();
  if (!tenantId) throw new Error('Tenant ID not found. Set IACS_TENANT_ID or E2E_TENANT_ID, or ensure tenants table has IACS.');
  const rows = await getEPDSlabsByDaysRange(tenantId, daysFrom, daysTo);
  if (rows.length > 0) {
    await deleteEPDSlabsByDaysRangeForTestCleanup(tenantId, daysFrom, daysTo);
  }
});

/** Remove slab from DB (test cleanup to restore initial state). */
When('I remove the EPD slab for days {int} to {int} from the database', async function (
  { page: _page },
  daysFrom: number,
  daysTo: number
) {
  const tenantId = await getTenantIdForFinanceE2E();
  if (!tenantId) throw new Error('Tenant ID not found. Set IACS_TENANT_ID or E2E_TENANT_ID.');
  await deleteEPDSlabsByDaysRangeForTestCleanup(tenantId, daysFrom, daysTo);
});

When('I remove the EPD slab for days {int} to {int} if it exists', async function (
  { page },
  daysFrom: number,
  daysTo: number
) {
  const configPage = (this as any).epdConfigurationPage || new EPDConfigurationPage(page);
  if (!(this as any).epdConfigurationPage) await configPage.goto();
  await configPage.verifyPageLoaded();
  await configPage.deactivateSlabIfExists(daysFrom, daysTo);
});

When('I remove the EPD slab for days {int} to {int}', async function (
  { page },
  daysFrom: number,
  daysTo: number
) {
  const configPage = (this as any).epdConfigurationPage || new EPDConfigurationPage(page);
  await configPage.deactivateSlab(daysFrom, daysTo);
});

When('I add EPD slab on configuration page with days {int} to {int} and discount {int}%', async function (
  { page },
  daysFrom: number,
  daysTo: number,
  discountPercent: number
) {
  const configPage = (this as any).epdConfigurationPage || new EPDConfigurationPage(page);
  if (!(this as any).epdConfigurationPage) await configPage.goto();
  await configPage.verifyPageLoaded();
  await configPage.openAddSlabDialog();
  await configPage.fillSlabForm(daysFrom, daysTo, discountPercent);
  await configPage.submitCreateSlab();
});

When('I try to add EPD slab with invalid days {int} to {int} and discount {int}%', async function (
  { page },
  daysFrom: number,
  daysTo: number,
  discountPercent: number
) {
  const configPage = (this as any).epdConfigurationPage || new EPDConfigurationPage(page);
  if (!(this as any).epdConfigurationPage) await configPage.goto();
  await configPage.verifyPageLoaded();
  await configPage.openAddSlabDialog();
  await configPage.fillSlabForm(daysFrom, daysTo, discountPercent);
  await configPage.submitCreateSlab();
});

When('I try to add EPD slab with days {int} to {int} and invalid discount {int}%', async function (
  { page },
  daysFrom: number,
  daysTo: number,
  discountPercent: number
) {
  const configPage = (this as any).epdConfigurationPage || new EPDConfigurationPage(page);
  if (!(this as any).epdConfigurationPage) await configPage.goto();
  await configPage.verifyPageLoaded();
  await configPage.openAddSlabDialog();
  await configPage.fillSlabForm(daysFrom, daysTo, discountPercent);
  await configPage.submitCreateSlab();
});

Then('I should see error that days to must be greater than days from', async function ({ page }) {
  const configPage = (this as any).epdConfigurationPage || new EPDConfigurationPage(page);
  await configPage.expectToastError(/Days to must be greater|days from/i);
});

Then('I should see error that discount must be between 0 and 100', async function ({ page }) {
  const configPage = (this as any).epdConfigurationPage || new EPDConfigurationPage(page);
  await configPage.expectToastError(/Discount.*between 0 and 100|0 and 100/i);
});

Then('I should see EPD slab {int}-{int} days on configuration page', async function (
  { page },
  daysFrom: number,
  daysTo: number
) {
  const configPage = (this as any).epdConfigurationPage || new EPDConfigurationPage(page);
  await configPage.verifySlabExists(daysFrom, daysTo);
});

Then('I should see slab created success message', async function ({ page }) {
  const configPage = (this as any).epdConfigurationPage || new EPDConfigurationPage(page);
  await configPage.expectSlabCreatedToast();
});

When('I open the Preview Calculator tab and calculate EPD for due date {string} payment date {string} amount {int}', async function (
  { page },
  dueDate: string,
  paymentDate: string,
  amount: number
) {
  const configPage = (this as any).epdConfigurationPage || new EPDConfigurationPage(page);
  if (!(this as any).epdConfigurationPage) await configPage.goto();
  await configPage.clickTabPreviewCalculator();
  await configPage.fillPreviewCalculator(dueDate, paymentDate, amount);
  await configPage.clickCalculateEPD();
});

Then('the EPD preview result should be visible', async function ({ page }) {
  const configPage = (this as any).epdConfigurationPage || new EPDConfigurationPage(page);
  await configPage.verifyPreviewResultVisible();
});

When('I toggle Show Inactive slabs', async function ({ page }) {
  const configPage = (this as any).epdConfigurationPage || new EPDConfigurationPage(page);
  if (!(this as any).epdConfigurationPage) await configPage.goto();
  await configPage.setShowInactive(true);
});

Then('I should see the EPD Slabs tab and heading', async function ({ page }) {
  const configPage = (this as any).epdConfigurationPage || new EPDConfigurationPage(page);
  await expect(configPage.pageHeading).toBeVisible({ timeout: 10000 });
  await expect(configPage.tabSlabs.first()).toBeVisible({ timeout: 10000 });
});

Then('the EPD Slabs tab should still show table or empty state', async function ({ page }) {
  const configPage = (this as any).epdConfigurationPage || new EPDConfigurationPage(page);
  await expect(configPage.tabSlabs).toBeVisible();
  const table = configPage.page.getByRole('table');
  const emptyOrTitle = configPage.page.getByText(/No EPD slabs configured|Active EPD Slabs|Discount percentages applied/i);
  await expect(table.or(emptyOrTitle).first()).toBeVisible({ timeout: 8000 });
});

// --- Update slab and verify EPD reflects on CR apply (FIN-EPD-TC-007) ---

When('I update the EPD slab for days {int} to {int} to discount {float}%', async function (
  { page },
  daysFrom: number,
  daysTo: number,
  discountPercent: number
) {
  const configPage = (this as any).epdConfigurationPage || new EPDConfigurationPage(page);
  if (!(this as any).epdConfigurationPage) await configPage.goto();
  await configPage.verifyPageLoaded();
  await configPage.clickEditSlab(daysFrom, daysTo);
  await configPage.setDialogDiscountPercent(discountPercent);
  await configPage.submitUpdateSlab();
});

Then('I should see slab updated success message', async function ({ page }) {
  const configPage = (this as any).epdConfigurationPage || new EPDConfigurationPage(page);
  await configPage.expectSlabUpdatedToast();
});

Then('I should see EPD slab {int}-{int} days with discount {float}% on configuration page', async function (
  { page },
  daysFrom: number,
  daysTo: number,
  discountPercent: number
) {
  const configPage = (this as any).epdConfigurationPage || new EPDConfigurationPage(page);
  await configPage.verifySlabDiscount(daysFrom, daysTo, discountPercent);
});

/** Smart TC-007: find oldest allocatable invoice, set its slab to a 2-decimal test %, store original for rollback. */
Given('the EPD slab for the oldest allocatable invoice is set to a temporary test percentage', async function ({
  page: _page,
}) {
  const result = await getOldestAllocatableInvoiceAndSlab('Ramesh ningappa diggai');
  if (!result) {
    throw new Error(
      'No oldest outstanding invoice or matching EPD slab found for dealer "Ramesh ningappa diggai". Ensure tenant has invoices and EPD slabs.'
    );
  }
  const originalPercent = Number(result.slab.discount_percentage);
  const testPercent =
    originalPercent % 1 === 0 ? originalPercent + 0.25 : Math.floor(originalPercent) + 0.87;
  await updateEPDSlabDiscountForTestCleanup(
    result.tenantId,
    result.slab.days_from,
    result.slab.days_to,
    testPercent
  );
  (this as any).epdSlabTenantId = result.tenantId;
  (this as any).epdSlabDaysFrom = result.slab.days_from;
  (this as any).epdSlabDaysTo = result.slab.days_to;
  (this as any).epdSlabOriginalPercent = originalPercent;
  (this as any).epdSlabTestPercent = testPercent;
});

When('I select the invoice that shows the temporary EPD percentage', async function ({ page }) {
  const testPercent = (this as any).epdSlabTestPercent as number;
  if (testPercent == null) throw new Error('Run "the EPD slab for the oldest allocatable invoice is set to a temporary test percentage" first.');
  const receiptId = (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  if (!receiptId) throw new Error('No current cash receipt ID. Run "I have created a cash receipt" first.');
  const applyPage = new CashReceiptApplyPage(page);
  if (!page.url().includes('/apply')) await applyPage.goto(receiptId);
  await applyPage.verifyPageLoaded();
  await applyPage.selectInvoiceWithEPDPercent(testPercent);
});

Then('the EPD shown for that invoice should match the temporary percentage', async function ({ page }) {
  const testPercent = (this as any).epdSlabTestPercent as number;
  if (testPercent == null) throw new Error('Missing epdSlabTestPercent from Given step.');
  const applyPage = new CashReceiptApplyPage(page);
  await applyPage.expectEPDPercentShown(testPercent);
});

Then('the EPD slab is restored to its original percentage in the database', async function ({ page: _page }) {
  const tenantId = (this as any).epdSlabTenantId as string;
  const daysFrom = (this as any).epdSlabDaysFrom as number;
  const daysTo = (this as any).epdSlabDaysTo as number;
  const originalPercent = (this as any).epdSlabOriginalPercent as number;
  if (tenantId == null || daysFrom == null || daysTo == null || originalPercent == null) {
    throw new Error('Cannot restore EPD slab: missing tenantId, daysFrom, daysTo, or originalPercent from context.');
  }
  await updateEPDSlabDiscountForTestCleanup(tenantId, daysFrom, daysTo, originalPercent);
});

When('I select an invoice that falls in the 31-45 days slab', async function ({ page }) {
  const receiptId = (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  if (!receiptId) throw new Error('No current cash receipt ID. Run "I have created a cash receipt" first.');
  const applyPage = new CashReceiptApplyPage(page);
  if (!page.url().includes('/apply')) await applyPage.goto(receiptId);
  await applyPage.verifyPageLoaded();
  await applyPage.selectInvoiceWithEPDPercent(7.5);
});

Then('the EPD shown for that invoice should be 7.5%', async function ({ page }) {
  const applyPage = new CashReceiptApplyPage(page);
  await applyPage.expectEPDPercentShown(7.5);
});
