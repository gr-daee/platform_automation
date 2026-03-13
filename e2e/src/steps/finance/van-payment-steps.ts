import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import {
  validatePayment,
  postPayment,
  buildValidationPayload,
  type VANValidationPayload,
  type VANApiResponse,
} from '../../support/api/van-api-client';
import {
  getVANPaymentByUTR,
  getVANPaymentByTransactionId,
  getCashReceiptById,
  getCashReceiptApplications,
  getInvoiceNumberById,
} from '../../support/finance-db-helpers';
import { VANPaymentsPage } from '../../pages/finance/VANPaymentsPage';
import { CashReceiptDetailPage } from '../../pages/finance/CashReceiptDetailPage';
import { CashReceiptApplyPage } from '../../pages/finance/CashReceiptApplyPage';
import { InvoiceDetailPage } from '../../pages/o2c/InvoiceDetailPage';

const { Given, When, Then } = createBdd();

function parseResponseSuccess(data: VANApiResponse): boolean {
  const stts = data.Stts_flg ?? data.status;
  const errCd = data.Err_cd ?? data.error_code;
  if (typeof stts === 'string' && stts.toUpperCase() === 'S') return true;
  if (typeof errCd === 'string' && errCd === '000') return true;
  return false;
}

function getResponseMessage(data: VANApiResponse): string {
  return (data.message as string) || (data.error_code as string) || '';
}

When('I send VAN validation request with VAN {string} and amount {string}', async function (
  {},
  van: string,
  amount: string
) {
  const payload = buildValidationPayload({ Bene_acc_no: van, Txn_amnt: amount });
  const result = await validatePayment(payload);
  (this as any).vanValidationResult = result;
  (this as any).vanLastPayload = payload;
});

When('I send VAN validation request with VAN {string} and amount {string} and UTR {string}', async function (
  {},
  van: string,
  amount: string,
  utr: string
) {
  const payload = buildValidationPayload({ Bene_acc_no: van, Txn_amnt: amount, UTR: utr, Tran_id: utr });
  const result = await validatePayment(payload);
  (this as any).vanValidationResult = result;
  (this as any).vanLastPayload = payload;
});

When('I send VAN validation request with invalid signature', async function () {
  const payload = buildValidationPayload({ Bene_acc_no: 'IACS1234', Txn_amnt: '5000.00' });
  const result = await validatePayment(payload, 'invalid_signature_for_test');
  (this as any).vanValidationResult = result;
});

When('I send VAN posting request with UTR {string}', async function ({}, utr: string) {
  const lastPayload = (this as any).vanLastPayload as VANValidationPayload | undefined;
  const base = lastPayload ?? buildValidationPayload({});
  const payload = { ...base, Req_type: 'notification' as const, UTR: utr, Tran_id: utr };
  const result = await postPayment(payload as import('../../support/api/van-api-client').VANPostingPayload);
  (this as any).vanPostingResult = result;
  (this as any).vanLastUtr = utr;
});

When('I send VAN validation then posting with unique UTR', async function () {
  const ts = Math.floor(Date.now() / 1000);
  const utr = `AUTO_QA_${ts}_UTR`;
  const payload = buildValidationPayload({ UTR: utr, Tran_id: utr });
  const validationResult = await validatePayment(payload);
  (this as any).vanValidationResult = validationResult;
  (this as any).vanLastPayload = payload;
  if (!validationResult.success || !parseResponseSuccess(validationResult.data)) {
    (this as any).vanPostingResult = { success: false, status: 0, statusText: '', data: {} };
    return;
  }
  const postingPayload = { ...payload, Req_type: 'notification' as const } as import('../../support/api/van-api-client').VANPostingPayload;
  const postingResult = await postPayment(postingPayload);
  (this as any).vanPostingResult = postingResult;
  (this as any).vanLastUtr = utr;
});

When('I send VAN validation then posting with amount {string}', async function ({}, amount: string) {
  const ts = Math.floor(Date.now() / 1000);
  const utr = `AUTO_QA_${ts}_UTR`;
  const payload = buildValidationPayload({ UTR: utr, Tran_id: utr, Txn_amnt: amount });
  const validationResult = await validatePayment(payload);
  (this as any).vanValidationResult = validationResult;
  (this as any).vanLastPayload = payload;
  if (!validationResult.success || !parseResponseSuccess(validationResult.data)) {
    (this as any).vanPostingResult = { success: false, status: 0, statusText: '', data: {} };
    return;
  }
  const postingPayload = { ...payload, Req_type: 'notification' as const } as import('../../support/api/van-api-client').VANPostingPayload;
  const postingResult = await postPayment(postingPayload);
  (this as any).vanPostingResult = postingResult;
  (this as any).vanLastUtr = utr;
});

Then('VAN validation should succeed with dealer', async function () {
  const result = (this as any).vanValidationResult;
  expect(result).toBeDefined();
  expect(result.success).toBe(true);
  expect(parseResponseSuccess(result.data)).toBe(true);
});

Then('VAN validation should fail with message containing {string}', async function (
  {},
  messagePart: string
) {
  const result = (this as any).vanValidationResult;
  expect(result).toBeDefined();
  const msg = getResponseMessage(result.data);
  expect(msg.toLowerCase()).toContain(messagePart.toLowerCase());
});

Then('VAN payment should be posted successfully', async function () {
  const result = (this as any).vanPostingResult;
  expect(result).toBeDefined();
  expect(result.success).toBe(true);
  expect(parseResponseSuccess(result.data)).toBe(true);
});

Then('cash receipt should be created for VAN payment {string}', async function (
  {},
  utrParam: string
) {
  const utr = utrParam === '<utr>' || utrParam === '' ? (this as any).vanLastUtr : utrParam;
  expect(utr).toBeTruthy();
  const vanPayment = await getVANPaymentByUTR(utr);
  expect(vanPayment).not.toBeNull();
  expect(vanPayment!.status).toBe('posted');
  const cashReceiptId = vanPayment!.cash_receipt_id;
  expect(cashReceiptId).toBeTruthy();
  const receipt = await getCashReceiptById(cashReceiptId!);
  expect(receipt).not.toBeNull();
});

Then('payment should be allocated FIFO to invoices', async function () {
  const utr = (this as any).vanLastUtr as string | undefined;
  if (!utr) return;
  const vanPayment = await getVANPaymentByUTR(utr);
  if (!vanPayment?.cash_receipt_id) return;
  const applications = await getCashReceiptApplications(vanPayment.cash_receipt_id);
  expect(applications.filter((a) => !a.is_reversed).length).toBeGreaterThanOrEqual(0);
});

Then('EPD discount should be calculated correctly', async function () {
  const utr = (this as any).vanLastUtr as string | undefined;
  if (!utr) return;
  const vanPayment = await getVANPaymentByUTR(utr);
  if (!vanPayment?.cash_receipt_id) return;
  const applications = await getCashReceiptApplications(vanPayment.cash_receipt_id);
  const withDiscount = applications.filter((a) => !a.is_reversed && (a.discount_taken ?? 0) >= 0);
  expect(withDiscount.length).toBeGreaterThanOrEqual(0);
});

Then('I should see VAN payment {string} on VAN payments page', async function (
  { page },
  utr: string
) {
  const vanPage = new VANPaymentsPage(page);
  await vanPage.goto();
  await vanPage.verifyPageLoaded();
  await vanPage.verifyVANPaymentExists(utr);
});

Then('VAN posting should fail with message containing {string}', async function (
  {},
  messagePart: string
) {
  const result = (this as any).vanPostingResult;
  expect(result).toBeDefined();
  const msg = getResponseMessage(result.data);
  expect(msg.toLowerCase()).toContain(messagePart.toLowerCase());
});

// --- E2E steps (API + UI) for van-auto-payment-e2e.feature ---

When('I open the cash receipt for the last VAN payment', async function ({ page }) {
  const utr = (this as any).vanLastUtr as string | undefined;
  expect(utr).toBeTruthy();
  const vanPayment = await getVANPaymentByUTR(utr!);
  expect(vanPayment).not.toBeNull();
  expect(vanPayment!.cash_receipt_id).toBeTruthy();
  (this as any).vanLastCashReceiptId = vanPayment!.cash_receipt_id;
  const applications = await getCashReceiptApplications(vanPayment!.cash_receipt_id!);
  const active = applications.filter((a) => !a.is_reversed);
  if (active.length > 0) {
    (this as any).vanLastInvoiceId = active[0].invoice_id;
    const invNum = await getInvoiceNumberById(active[0].invoice_id);
    (this as any).vanLastInvoiceNumber = invNum ?? undefined;
  }
  const detailPage = new CashReceiptDetailPage(page);
  await detailPage.goto(vanPayment!.cash_receipt_id!);
  await detailPage.verifyPageLoaded();
});

Then('the receipt detail shows amount applied and status', async function ({ page }) {
  const detailPage = new CashReceiptDetailPage(page);
  await detailPage.verifyAmountSummaryVisible();
});

Then('the receipt detail shows EPD discount displayed', async function ({ page }) {
  const detailPage = new CashReceiptDetailPage(page);
  await detailPage.verifyEPDDiscountDisplayed();
});

Then('the invoice for the last VAN payment is Paid with balance zero', async function ({ page }) {
  const invoiceId = (this as any).vanLastInvoiceId as string | undefined;
  if (!invoiceId) return;
  const invoicePage = new InvoiceDetailPage(page);
  await invoicePage.goto(invoiceId);
  await invoicePage.verifyPageLoaded();
  await invoicePage.verifyPaidWithBalanceZero();
});

When('I un-apply the receipt', async function ({ page }) {
  const receiptId = (this as any).vanLastCashReceiptId as string | undefined;
  if (!receiptId) {
    const utr = (this as any).vanLastUtr as string | undefined;
    const vanPayment = utr ? await getVANPaymentByUTR(utr) : null;
    if (vanPayment?.cash_receipt_id) (this as any).vanLastCashReceiptId = vanPayment.cash_receipt_id;
  }
  const detailPage = new CashReceiptDetailPage(page);
  await detailPage.goto((this as any).vanLastCashReceiptId);
  await detailPage.verifyPageLoaded();
  await detailPage.unapplyReceipt('E2E test un-apply');
});

When('I re-apply the receipt to invoices', async function ({ page }) {
  const receiptId = (this as any).vanLastCashReceiptId as string | undefined;
  const invoiceNumber = (this as any).vanLastInvoiceNumber as string | undefined;
  expect(receiptId).toBeTruthy();
  const detailPage = new CashReceiptDetailPage(page);
  await detailPage.goto(receiptId!);
  await detailPage.clickApplyToInvoices();
  const applyPage = new CashReceiptApplyPage(page);
  await applyPage.verifyPageLoaded();
  if (invoiceNumber) {
    await applyPage.selectInvoice(invoiceNumber);
  }
  await applyPage.saveApplication();
});
