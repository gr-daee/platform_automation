import { createBdd } from 'playwright-bdd';
import { EPDCalculatorPage } from '../../pages/tools/EPDCalculatorPage';
import { PaymentTermsPage } from '../../pages/finance/PaymentTermsPage';

const { Given, When, Then } = createBdd();

Given('I am on the EPD calculator page', async function ({ page }) {
  const epdPage = new EPDCalculatorPage(page);
  await epdPage.goto();
  await epdPage.verifyPageLoaded();
  (this as any).epdCalculatorPage = epdPage;
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

Then('I should see EPD slab for {int}-{int} days', async function (
  { page },
  daysFrom: number,
  daysTo: number
) {
  const paymentTermsPage = (this as any).paymentTermsPage || new PaymentTermsPage(page);
  await paymentTermsPage.verifyEPDSlabExists(daysFrom, daysTo);
});
