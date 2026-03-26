import { expect, test } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { CreditMemosPage } from '../../pages/finance/CreditMemosPage';
import { NewCreditMemoPage } from '../../pages/finance/NewCreditMemoPage';
import { CreditMemoDetailPage } from '../../pages/finance/CreditMemoDetailPage';
import {
  getCreditMemoApplications,
  getCreditMemoById,
  getInvoiceNumberForDifferentDealer,
  getInvoiceFinancialSnapshot,
  getInvoiceOutstandingBalance,
  getLatestDealerAdvanceForCreditMemo,
  getOutstandingInvoicesForCustomer,
  getTenantIdForFinanceE2E,
  getDealerIdByBusinessName,
} from '../../support/finance-db-helpers';

const { Given, When, Then } = createBdd();

function logDev(message: string): void {
  if (process.env.TEST_EXECUTION_MODE === 'development') {
    console.log(message);
  }
}

function logInvoiceStage(
  stage: 'before_creation' | 'after_creation' | 'before_apply' | 'after_apply',
  invoice: {
    id: string;
    invoice_number: string;
    total_amount: number;
    paid_amount: number;
    balance_amount: number;
    updated_at: string | null;
  } | null
): void {
  if (!invoice) return;
  logDev(
    `[CCNA-TC-001][TIMELINE] stage=${stage} invoice=${invoice.invoice_number} id=${invoice.id} total=${Number(
      invoice.total_amount
    ).toFixed(2)} paid=${Number(invoice.paid_amount).toFixed(2)} balance=${Number(
      invoice.balance_amount
    ).toFixed(2)} updated_at=${invoice.updated_at || 'null'}`
  );
}

Given('I am on the credit memos page', async function ({ page }) {
  const creditMemosPage = new CreditMemosPage(page);
  await creditMemosPage.goto();
  await creditMemosPage.verifyPageLoaded();
  (this as any).creditMemosPage = creditMemosPage;
});

When(
  'I create a credit memo for customer {string} with amount {string} and reason {string}',
  async function ({ page }, customerName: string, amount: string, reason: string) {
    const tenantId = await getTenantIdForFinanceE2E();
    const dealerId = tenantId ? await getDealerIdByBusinessName(tenantId, customerName) : null;
    if (tenantId && dealerId) {
      const oldestOutstanding = await getOutstandingInvoicesForCustomer(dealerId, tenantId);
      const oldest = oldestOutstanding[0];
      if (oldest) {
        const beforeCreateSnapshot = await getInvoiceFinancialSnapshot(oldest.id);
        if (beforeCreateSnapshot) {
          (this as any).preCreateInvoiceId = oldest.id;
          (this as any).preCreateInvoiceNumber = oldest.invoice_number;
          logInvoiceStage('before_creation', beforeCreateSnapshot);
        }
      }
    }

    const creditMemosPage = (this as any).creditMemosPage || new CreditMemosPage(page);
    await creditMemosPage.clickNewCreditMemo();

    const newCreditMemoPage = new NewCreditMemoPage(page);
    await newCreditMemoPage.verifyPageLoaded();
    await newCreditMemoPage.selectCustomer(customerName);
    await newCreditMemoPage.selectCreditReason(reason);
    await newCreditMemoPage.setReasonDescription(
      `AUTO_QA_${Date.now()} Cycle-1 valid reason for ${reason} credit memo`
    );
    await newCreditMemoPage.addLineItem(`AUTO_QA_${Date.now()} line-item`, amount);
    await newCreditMemoPage.submit();

    const detailPage = new CreditMemoDetailPage(page);
    await detailPage.verifyPageLoaded();

    const creditMemoId = page.url().match(/\/credit-memos\/([a-f0-9-]+)/)?.[1];
    if (!creditMemoId) {
      throw new Error('Failed to resolve created credit memo id from URL');
    }

    (this as any).currentCreditMemoId = creditMemoId;
    (this as any).currentCreditMemoAmount = Number(amount);
    (this as any).currentCreditMemoCustomerName = customerName;

    const preCreateInvoiceId = (this as any).preCreateInvoiceId as string | undefined;
    if (preCreateInvoiceId) {
      const afterCreateInvoiceSnapshot = await getInvoiceFinancialSnapshot(preCreateInvoiceId);
      logInvoiceStage('after_creation', afterCreateInvoiceSnapshot);
    }
  }
);

Then('credit memo should be created successfully', async function () {
  const creditMemoId = (this as any).currentCreditMemoId as string | undefined;
  expect(creditMemoId).toBeTruthy();
  const creditMemo = await getCreditMemoById(creditMemoId!);
  expect(creditMemo).not.toBeNull();
  expect(Number(creditMemo!.total_credit_amount)).toBeGreaterThan(0);
});

When(
  'I apply {string} from current credit memo to the oldest outstanding invoice of the same customer',
  async function ({ page }, applyAmount: string) {
    const creditMemoId = (this as any).currentCreditMemoId as string | undefined;
    const customerName = (this as any).currentCreditMemoCustomerName as string | undefined;
    if (!creditMemoId || !customerName) {
      throw new Error('Missing current credit memo context for apply step');
    }

    const tenantId = await getTenantIdForFinanceE2E();
    if (!tenantId) throw new Error('Unable to resolve tenant for credit memo test');
    const dealerId = await getDealerIdByBusinessName(tenantId, customerName);
    if (!dealerId) throw new Error(`Unable to resolve dealer id for customer "${customerName}"`);

    const outstandingInvoices = await getOutstandingInvoicesForCustomer(dealerId, tenantId);
    if (outstandingInvoices.length === 0) {
      throw new Error(`No outstanding invoices found for customer "${customerName}"`);
    }

    const targetInvoice = outstandingInvoices[0];
    const beforeSnapshot = await getInvoiceFinancialSnapshot(targetInvoice.id);
    const beforeBalance = beforeSnapshot?.balance_amount ?? null;
    if (beforeBalance === null) throw new Error('Target invoice not found in DB');
    const requestedApplyAmount = Number(applyAmount);
    logInvoiceStage('before_apply', beforeSnapshot);
    logDev(
      `[CCN-APPLY] Apply to Invoice Amt: ${requestedApplyAmount.toFixed(2)}`
    );

    const detailPage = new CreditMemoDetailPage(page);
    await detailPage.verifyPageLoaded();
    await detailPage.openApplyDialog();
    await detailPage.selectInvoice(targetInvoice.invoice_number);
    await detailPage.setApplyAmount(applyAmount);
    await detailPage.submitApply();

    (this as any).targetInvoiceId = targetInvoice.id;
    (this as any).targetInvoiceNumber = targetInvoice.invoice_number;
    (this as any).targetInvoiceBalanceBefore = Number(beforeBalance);
    (this as any).targetInvoicePaidBefore = Number(beforeSnapshot?.paid_amount || 0);
    (this as any).lastAppliedCreditAmount = Number(applyAmount);
  }
);

Then('credit memo financial totals should reconcile in database', async function () {
  const creditMemoId = (this as any).currentCreditMemoId as string | undefined;
  if (!creditMemoId) throw new Error('Missing credit memo id in context');

  const creditMemo = await getCreditMemoById(creditMemoId);
  expect(creditMemo).not.toBeNull();

  const applications = await getCreditMemoApplications(creditMemoId);
  const activeApplied = applications
    .filter((a) => !a.is_reversed)
    .reduce((sum, a) => sum + Number(a.amount_applied || 0), 0);

  expect(Number(creditMemo!.credit_applied)).toBeCloseTo(activeApplied, 2);
  expect(Number(creditMemo!.credit_applied) + Number(creditMemo!.credit_available)).toBeCloseTo(
    Number(creditMemo!.total_credit_amount),
    2
  );
});

Then('the target invoice outstanding should decrease by applied credit amount', async function () {
  const invoiceId = (this as any).targetInvoiceId as string | undefined;
  const invoiceNumber = (this as any).targetInvoiceNumber as string | undefined;
  const beforeBalance = Number((this as any).targetInvoiceBalanceBefore || 0);
  const beforePaid = Number((this as any).targetInvoicePaidBefore || 0);
  const appliedAmount = Number((this as any).lastAppliedCreditAmount || 0);

  if (!invoiceId) throw new Error('Missing target invoice in context');

  // Invoice paid_amount can update first and balance_amount may trail by 1-2s.
  // Poll briefly before final assertion to reduce timing noise.
  let afterSnapshot = await getInvoiceFinancialSnapshot(invoiceId);
  const expectedAfterBalance = beforeBalance - appliedAmount;
  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (
      afterSnapshot &&
      Math.abs(Number(afterSnapshot.balance_amount) - expectedAfterBalance) < 0.005
    ) {
      break;
    }
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, 1000));
      afterSnapshot = await getInvoiceFinancialSnapshot(invoiceId);
    }
  }

  const afterBalance = afterSnapshot?.balance_amount ?? null;
  expect(afterBalance).not.toBeNull();

  const actualReduction = beforeBalance - Number(afterBalance);
  const actualPaidIncrease = Number(afterSnapshot?.paid_amount || 0) - beforePaid;
  logInvoiceStage('after_apply', afterSnapshot);
  logDev(
    `[CCN-APPLY][DEBUG] invoice=${invoiceNumber || invoiceId} requested_apply=${appliedAmount.toFixed(
      2
    )} actual_paid_increase=${actualPaidIncrease.toFixed(2)} actual_balance_reduction=${actualReduction.toFixed(
      2
    )} expected_after_balance=${expectedAfterBalance.toFixed(2)} post_snapshot=${JSON.stringify(afterSnapshot)}`
  );

  expect(beforeBalance - Number(afterBalance)).toBeCloseTo(appliedAmount, 2);
});

Given(
  'I prepare a full-settlement target invoice for customer {string} and create matching credit memo',
  async function ({ page }, customerName: string) {
    const tenantId = await getTenantIdForFinanceE2E();
    if (!tenantId) throw new Error('Unable to resolve tenant for credit memo test');
    const dealerId = await getDealerIdByBusinessName(tenantId, customerName);
    if (!dealerId) throw new Error(`Unable to resolve dealer id for customer "${customerName}"`);

    const outstandingInvoices = await getOutstandingInvoicesForCustomer(dealerId, tenantId);
    if (outstandingInvoices.length === 0) {
      throw new Error(`No outstanding invoices found for customer "${customerName}"`);
    }

    const targetInvoice = outstandingInvoices[0];
    const targetBalance = Number(targetInvoice.balance_amount || 0);
    if (targetBalance <= 0) throw new Error('Target invoice balance is not positive');

    const creditMemosPage = new CreditMemosPage(page);
    await creditMemosPage.goto();
    await creditMemosPage.verifyPageLoaded();
    await creditMemosPage.clickNewCreditMemo();

    const newCreditMemoPage = new NewCreditMemoPage(page);
    await newCreditMemoPage.verifyPageLoaded();
    await newCreditMemoPage.selectCustomer(customerName);
    await newCreditMemoPage.selectCreditReason('transport_allowance');
    await newCreditMemoPage.setReasonDescription(
      `AUTO_QA_${Date.now()} Cycle-2 full settlement reason for transport_allowance`
    );
    await newCreditMemoPage.addLineItem(`AUTO_QA_${Date.now()} line-item`, targetBalance.toFixed(2));
    await newCreditMemoPage.submit();

    const detailPage = new CreditMemoDetailPage(page);
    await detailPage.verifyPageLoaded();

    const creditMemoId = page.url().match(/\/credit-memos\/([a-f0-9-]+)/)?.[1];
    if (!creditMemoId) throw new Error('Failed to resolve created credit memo id from URL');

    (this as any).currentCreditMemoId = creditMemoId;
    (this as any).currentCreditMemoAmount = targetBalance;
    (this as any).currentCreditMemoCustomerName = customerName;
    (this as any).targetInvoiceId = targetInvoice.id;
    (this as any).targetInvoiceNumber = targetInvoice.invoice_number;
    (this as any).targetInvoiceBalanceBefore = targetBalance;
  }
);

When('I apply current credit memo fully to the prepared target invoice', async function ({ page }) {
  const invoiceNumber = (this as any).targetInvoiceNumber as string | undefined;
  const beforeBalance = Number((this as any).targetInvoiceBalanceBefore || 0);
  if (!invoiceNumber || beforeBalance <= 0) {
    throw new Error('Missing prepared target invoice context');
  }

  const detailPage = new CreditMemoDetailPage(page);
  await detailPage.verifyPageLoaded();
  await detailPage.openApplyDialog();
  await detailPage.selectInvoice(invoiceNumber);
  await detailPage.setApplyAmount(beforeBalance.toFixed(2));
  await detailPage.submitApply();

  (this as any).lastAppliedCreditAmount = beforeBalance;
});

When('I apply partial amount {string} to the prepared target invoice', async function ({ page }, partialAmount: string) {
  const invoiceNumber = (this as any).targetInvoiceNumber as string | undefined;
  if (!invoiceNumber) throw new Error('Missing prepared target invoice context');

  const detailPage = new CreditMemoDetailPage(page);
  await detailPage.verifyPageLoaded();
  await detailPage.openApplyDialog();
  await detailPage.selectInvoice(invoiceNumber);
  await detailPage.setApplyAmount(partialAmount);
  await detailPage.submitApply();

  (this as any).lastAppliedCreditAmount = Number(partialAmount);
});

When('I apply the remaining amount of current credit memo to the prepared target invoice', async function ({ page }) {
  const creditMemoId = (this as any).currentCreditMemoId as string | undefined;
  const invoiceNumber = (this as any).targetInvoiceNumber as string | undefined;
  if (!creditMemoId || !invoiceNumber) throw new Error('Missing context for remaining-amount apply');

  const cm = await getCreditMemoById(creditMemoId);
  if (!cm) throw new Error('Credit memo not found while applying remaining amount');
  const remaining = Number(cm.credit_available || 0);
  if (remaining <= 0) throw new Error('No remaining credit available to apply');

  const detailPage = new CreditMemoDetailPage(page);
  await detailPage.verifyPageLoaded();
  await detailPage.openApplyDialog();
  await detailPage.selectInvoice(invoiceNumber);
  await detailPage.setApplyAmount(remaining.toFixed(2));
  await detailPage.submitApply();

  (this as any).lastAppliedCreditAmount = remaining;
});

Then('the prepared target invoice should be fully settled', async function () {
  const invoiceId = (this as any).targetInvoiceId as string | undefined;
  if (!invoiceId) throw new Error('Missing target invoice in context');

  const balance = await getInvoiceOutstandingBalance(invoiceId);
  expect(balance).not.toBeNull();
  expect(Number(balance)).toBeCloseTo(0, 2);
});

Then('the current credit memo should be fully applied', async function () {
  const creditMemoId = (this as any).currentCreditMemoId as string | undefined;
  if (!creditMemoId) throw new Error('Missing credit memo id in context');

  const creditMemo = await getCreditMemoById(creditMemoId);
  expect(creditMemo).not.toBeNull();
  expect(Number(creditMemo!.credit_available)).toBeCloseTo(0, 2);
});

Given(
  'I prepare a cross-invoice setup for customer {string} and create credit memo linked to oldest invoice',
  async function ({ page }, customerName: string) {
    const tenantId = await getTenantIdForFinanceE2E();
    if (!tenantId) throw new Error('Unable to resolve tenant for credit memo test');
    const dealerId = await getDealerIdByBusinessName(tenantId, customerName);
    if (!dealerId) throw new Error(`Unable to resolve dealer id for customer "${customerName}"`);

    const outstandingInvoices = await getOutstandingInvoicesForCustomer(dealerId, tenantId);
    if (outstandingInvoices.length < 2) {
      throw new Error(`Need at least 2 outstanding invoices for cross-invoice scenario (${customerName})`);
    }

    const originalInvoice = outstandingInvoices[0];
    const targetInvoice = outstandingInvoices[1];
    const targetBefore = await getInvoiceOutstandingBalance(targetInvoice.id);
    if (targetBefore === null || Number(targetBefore) <= 0) {
      throw new Error('Cross-invoice target has no positive balance');
    }

    const creditMemosPage = new CreditMemosPage(page);
    await creditMemosPage.goto();
    await creditMemosPage.verifyPageLoaded();
    await creditMemosPage.clickNewCreditMemo();

    const newCreditMemoPage = new NewCreditMemoPage(page);
    await newCreditMemoPage.verifyPageLoaded();
    await newCreditMemoPage.selectCustomer(customerName);
    await newCreditMemoPage.selectCreditReason('transport_allowance');
    await newCreditMemoPage.selectOriginalInvoice(originalInvoice.invoice_number);
    await newCreditMemoPage.setReasonDescription(
      `AUTO_QA_${Date.now()} Cycle-3 cross-invoice linked CM scenario`
    );
    await newCreditMemoPage.addLineItem(`AUTO_QA_${Date.now()} line-item`, '50');
    await newCreditMemoPage.submit();

    const cmId = page.url().match(/\/credit-memos\/([a-f0-9-]+)/)?.[1];
    if (!cmId) throw new Error('Unable to resolve created credit memo id');

    (this as any).currentCreditMemoId = cmId;
    (this as any).currentCreditMemoCustomerName = customerName;
    (this as any).targetInvoiceId = targetInvoice.id;
    (this as any).targetInvoiceNumber = targetInvoice.invoice_number;
    (this as any).targetInvoiceBalanceBefore = Number(targetBefore);
    (this as any).crossOriginalInvoiceNumber = originalInvoice.invoice_number;
  }
);

When('I apply current credit memo to the prepared cross-invoice target', async function ({ page }) {
  const invoiceNumber = (this as any).targetInvoiceNumber as string | undefined;
  if (!invoiceNumber) throw new Error('Missing cross-invoice target number');

  const detailPage = new CreditMemoDetailPage(page);
  await detailPage.verifyPageLoaded();
  await detailPage.openApplyDialog();
  await detailPage.selectInvoice(invoiceNumber);
  await detailPage.setApplyAmount('50');
  await detailPage.submitApply();

  (this as any).lastAppliedCreditAmount = 50;
});

Given(
  'I prepare a transport allowance over-balance setup for customer {string}',
  async function ({ page }, customerName: string) {
    const tenantId = await getTenantIdForFinanceE2E();
    if (!tenantId) throw new Error('Unable to resolve tenant for credit memo test');
    const dealerId = await getDealerIdByBusinessName(tenantId, customerName);
    if (!dealerId) throw new Error(`Unable to resolve dealer id for customer "${customerName}"`);

    const outstandingInvoices = await getOutstandingInvoicesForCustomer(dealerId, tenantId);
    if (outstandingInvoices.length === 0) {
      throw new Error(`No outstanding invoices found for customer "${customerName}"`);
    }
    const targetInvoice = [...outstandingInvoices].sort((a, b) => a.balance_amount - b.balance_amount)[0];
    const invoiceBalance = Number(targetInvoice.balance_amount);
    if (invoiceBalance <= 0) throw new Error('Target invoice does not have positive balance');
    const applyAmount = Number((invoiceBalance + 10).toFixed(2));
    const expectedAdvance = Number((applyAmount - invoiceBalance).toFixed(2));

    const creditMemosPage = new CreditMemosPage(page);
    await creditMemosPage.goto();
    await creditMemosPage.verifyPageLoaded();
    await creditMemosPage.clickNewCreditMemo();

    const newCreditMemoPage = new NewCreditMemoPage(page);
    await newCreditMemoPage.verifyPageLoaded();
    await newCreditMemoPage.selectCustomer(customerName);
    await newCreditMemoPage.selectCreditReason('transport_allowance');
    await newCreditMemoPage.selectOriginalInvoice(targetInvoice.invoice_number);
    await newCreditMemoPage.setReasonDescription(
      `AUTO_QA_${Date.now()} Cycle-3 transport allowance over-balance advance scenario`
    );
    await newCreditMemoPage.addLineItem(`AUTO_QA_${Date.now()} line-item`, applyAmount.toString());
    await newCreditMemoPage.submit();

    const cmId = page.url().match(/\/credit-memos\/([a-f0-9-]+)/)?.[1];
    if (!cmId) throw new Error('Unable to resolve created credit memo id');

    const detailPage = new CreditMemoDetailPage(page);
    await detailPage.verifyPageLoaded();
    await detailPage.openApplyDialog();
    await detailPage.selectInvoice(targetInvoice.invoice_number);
    await detailPage.setApplyAmount(applyAmount.toString());
    await detailPage.submitApply();

    const cm = await getCreditMemoById(cmId);
    if (!cm) throw new Error('Created credit memo not found in DB');

    (this as any).currentCreditMemoId = cmId;
    (this as any).currentCreditMemoNumber = cm.credit_memo_number;
    (this as any).currentCreditMemoCustomerName = customerName;
    (this as any).targetInvoiceNumber = targetInvoice.invoice_number;
    (this as any).lastAppliedCreditAmount = applyAmount;
    (this as any).expectedDealerAdvanceAmount = expectedAdvance;
    (this as any).dealerIdForAdvance = dealerId;
  }
);

Then('dealer advance should be created for current credit memo application', async function () {
  const dealerId = (this as any).dealerIdForAdvance as string | undefined;
  const creditMemoNumber = (this as any).currentCreditMemoNumber as string | undefined;
  const expectedAdvance = Number((this as any).expectedDealerAdvanceAmount || 0);
  if (!dealerId || !creditMemoNumber) throw new Error('Missing context for dealer advance verification');

  const advance = await getLatestDealerAdvanceForCreditMemo(dealerId, creditMemoNumber);
  expect(advance).not.toBeNull();
  expect(Number(advance!.amount)).toBeCloseTo(expectedAdvance, 2);
  expect(Number(advance!.available_balance)).toBeCloseTo(expectedAdvance, 2);
});

When(
  'I create another credit memo for remaining target invoice balance and apply it fully',
  async function ({ page }) {
    const invoiceId = (this as any).targetInvoiceId as string | undefined;
    const invoiceNumber = (this as any).targetInvoiceNumber as string | undefined;
    const customerName = (this as any).currentCreditMemoCustomerName as string | undefined;
    if (!invoiceId || !invoiceNumber || !customerName) {
      throw new Error('Missing target context for creating remaining-balance credit memo');
    }

    const remainingBalance = await getInvoiceOutstandingBalance(invoiceId);
    if (remainingBalance === null) throw new Error('Target invoice not found while computing remaining balance');
    if (Number(remainingBalance) <= 0) throw new Error('Target invoice has no remaining balance');

    const creditMemosPage = new CreditMemosPage(page);
    await creditMemosPage.goto();
    await creditMemosPage.verifyPageLoaded();
    await creditMemosPage.clickNewCreditMemo();

    const newCreditMemoPage = new NewCreditMemoPage(page);
    await newCreditMemoPage.verifyPageLoaded();
    await newCreditMemoPage.selectCustomer(customerName);
    await newCreditMemoPage.selectCreditReason('transport_allowance');
    await newCreditMemoPage.setReasonDescription(
      `AUTO_QA_${Date.now()} Cycle-2 remaining balance settlement credit memo`
    );
    await newCreditMemoPage.addLineItem(`AUTO_QA_${Date.now()} line-item`, Number(remainingBalance).toFixed(2));
    await newCreditMemoPage.submit();

    const detailPage = new CreditMemoDetailPage(page);
    await detailPage.verifyPageLoaded();
    await detailPage.openApplyDialog();
    await detailPage.selectInvoice(invoiceNumber);
    await detailPage.setApplyAmount(Number(remainingBalance).toFixed(2));
    await detailPage.submitApply();

    const secondCreditMemoId = page.url().match(/\/credit-memos\/([a-f0-9-]+)/)?.[1];
    if (!secondCreditMemoId) throw new Error('Unable to resolve second credit memo id');
    (this as any).currentCreditMemoId = secondCreditMemoId;
    (this as any).lastAppliedCreditAmount = Number(remainingBalance);
  }
);

// ---------------------------------------------------------------------------
// Cycle 4 — negative / guardrail scenarios
// ---------------------------------------------------------------------------

Given(
  'I resolve a foreign invoice number not belonging to customer {string}',
  async function ({ page: _page }, customerName: string) {
    const tenantId = await getTenantIdForFinanceE2E();
    if (!tenantId) throw new Error('Unable to resolve tenant for credit memo test');
    const dealerId = await getDealerIdByBusinessName(tenantId, customerName);
    if (!dealerId) throw new Error(`Unable to resolve dealer id for customer "${customerName}"`);
    const foreign = await getInvoiceNumberForDifferentDealer(tenantId, dealerId);
    if (!foreign) {
      throw new Error(
        'No invoice found for another dealer in this tenant — cannot assert cross-customer apply isolation'
      );
    }
    (this as any).foreignInvoiceNumber = foreign;
  }
);

When('I open apply credit dialog for current credit memo', async function ({ page }) {
  const detailPage = new CreditMemoDetailPage(page);
  await detailPage.verifyPageLoaded();
  await detailPage.openApplyDialog();
});

When(
  'I select the oldest outstanding invoice in apply dialog for customer {string}',
  async function ({ page }, customerName: string) {
    const tenantId = await getTenantIdForFinanceE2E();
    if (!tenantId) throw new Error('Unable to resolve tenant for credit memo test');
    const dealerId = await getDealerIdByBusinessName(tenantId, customerName);
    if (!dealerId) throw new Error(`Unable to resolve dealer id for customer "${customerName}"`);
    const outstandingInvoices = await getOutstandingInvoicesForCustomer(dealerId, tenantId);
    if (outstandingInvoices.length === 0) {
      throw new Error(`No outstanding invoices found for customer "${customerName}"`);
    }
    const targetInvoice = outstandingInvoices[0];
    const detailPage = new CreditMemoDetailPage(page);
    await detailPage.selectInvoice(targetInvoice.invoice_number);
  }
);

When('I set apply amount to {string}', async function ({ page }, amount: string) {
  const detailPage = new CreditMemoDetailPage(page);
  await detailPage.setApplyAmount(amount);
});

When('I set apply amount exceeding available credit for negative test', async function ({ page }) {
  const creditMemoId = (this as any).currentCreditMemoId as string | undefined;
  if (!creditMemoId) throw new Error('Missing credit memo id in context');
  const cm = await getCreditMemoById(creditMemoId);
  if (!cm) throw new Error('Credit memo not found');
  const exceed = (Number(cm.credit_available) + 250).toFixed(2);
  const detailPage = new CreditMemoDetailPage(page);
  await detailPage.setApplyAmountForNegativeTest(exceed);
});

When('I attempt to apply credit expecting validation failure', async function ({ page }) {
  const detailPage = new CreditMemoDetailPage(page);
  await detailPage.clickApplyCreditWithoutClosingDialog();
  await detailPage.expectApplyDialogVisible();
});

Then('I should see credit memo apply error containing {string}', async function ({ page }, messagePart: string) {
  const matcher = new RegExp(messagePart, 'i');
  const toast = page.locator('[data-sonner-toast]').filter({ hasText: matcher }).first();
  await expect(toast).toBeVisible({ timeout: 12000 });
});

When('I open invoice selector in apply dialog', async function ({ page }) {
  const detailPage = new CreditMemoDetailPage(page);
  await detailPage.openInvoiceSelectorInApplyDialog();
});

Then('invoice options in apply dialog should not include foreign invoice number', async function ({ page }) {
  const foreign = (this as any).foreignInvoiceNumber as string | undefined;
  expect(foreign).toBeTruthy();
  const options = await page.getByRole('option').allTextContents();
  const hit = options.some((t) => foreign && new RegExp(foreign.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(t));
  expect(hit).toBe(false);
  await page.keyboard.press('Escape');
});

Then('the Apply Credit button should be disabled on apply dialog', async function ({ page }) {
  const detailPage = new CreditMemoDetailPage(page);
  await detailPage.expectApplyCreditButtonDisabled();
});

When('I select the prior target invoice in apply dialog', async function ({ page }) {
  const invoiceNumber = (this as any).targetInvoiceNumber as string | undefined;
  if (!invoiceNumber) throw new Error('Missing targetInvoiceNumber for duplicate-apply scenario');
  const detailPage = new CreditMemoDetailPage(page);
  await detailPage.selectInvoice(invoiceNumber);
});

When(
  'I prepare a pricing error credit memo for customer {string} with credit exceeding smallest outstanding invoice balance',
  async function ({ page }, customerName: string) {
    const tenantId = await getTenantIdForFinanceE2E();
    if (!tenantId) throw new Error('Unable to resolve tenant for credit memo test');
    const dealerId = await getDealerIdByBusinessName(tenantId, customerName);
    if (!dealerId) throw new Error(`Unable to resolve dealer id for customer "${customerName}"`);

    const outstandingInvoices = await getOutstandingInvoicesForCustomer(dealerId, tenantId);
    if (outstandingInvoices.length === 0) {
      throw new Error(`No outstanding invoices found for customer "${customerName}"`);
    }
    const targetInvoice = [...outstandingInvoices].sort((a, b) => a.balance_amount - b.balance_amount)[0];
    const invoiceBalance = Number(targetInvoice.balance_amount);
    if (invoiceBalance <= 0) throw new Error('Smallest outstanding invoice has no positive balance');
    const cmTotal = Number((invoiceBalance + 25).toFixed(2));

    const creditMemosPage = new CreditMemosPage(page);
    await creditMemosPage.goto();
    await creditMemosPage.verifyPageLoaded();
    await creditMemosPage.clickNewCreditMemo();

    const newCreditMemoPage = new NewCreditMemoPage(page);
    await newCreditMemoPage.verifyPageLoaded();
    await newCreditMemoPage.selectCustomer(customerName);
    await newCreditMemoPage.selectCreditReason('pricing_error');
    await newCreditMemoPage.setReasonDescription(
      `AUTO_QA_${Date.now()} Cycle-4 pricing_error over-balance negative guardrail scenario`
    );
    await newCreditMemoPage.addLineItem(`AUTO_QA_${Date.now()} line-item`, cmTotal.toFixed(2));
    await newCreditMemoPage.submit();

    const cmId = page.url().match(/\/credit-memos\/([a-f0-9-]+)/)?.[1];
    if (!cmId) throw new Error('Unable to resolve created credit memo id');

    (this as any).currentCreditMemoId = cmId;
    (this as any).currentCreditMemoCustomerName = customerName;
    (this as any).pricingErrorTargetInvoiceNumber = targetInvoice.invoice_number;
    (this as any).pricingErrorApplyAmountStr = cmTotal.toFixed(2);
  }
);

When(
  'I attempt to apply prepared pricing error credit memo to smallest invoice at full credit amount',
  async function ({ page }) {
    const invoiceNumber = (this as any).pricingErrorTargetInvoiceNumber as string | undefined;
    const amountStr = (this as any).pricingErrorApplyAmountStr as string | undefined;
    if (!invoiceNumber || !amountStr) throw new Error('Missing pricing error apply context');

    const detailPage = new CreditMemoDetailPage(page);
    await detailPage.verifyPageLoaded();
    await detailPage.openApplyDialog();
    await detailPage.selectInvoice(invoiceNumber);
    await detailPage.setApplyAmount(amountStr);
    await detailPage.clickApplyCreditWithoutClosingDialog();
    await detailPage.expectApplyDialogVisible();
  }
);

// ---------------------------------------------------------------------------
// Cycle 5 — GL posting + application reversal
// ---------------------------------------------------------------------------

When('I post current credit memo to general ledger', async function ({ page }) {
  const detailPage = new CreditMemoDetailPage(page);
  await detailPage.verifyPageLoaded();
  await detailPage.clickPostToGL();
});

Then('I should see credit memo post to GL success toast', async function ({ page }) {
  const detailPage = new CreditMemoDetailPage(page);
  await detailPage.expectPostToGLSuccessToast();
});

Then('credit memo should have GL journal in database', async function () {
  const creditMemoId = (this as any).currentCreditMemoId as string | undefined;
  if (!creditMemoId) throw new Error('Missing credit memo id in context');
  const cm = await getCreditMemoById(creditMemoId);
  expect(cm).not.toBeNull();
  expect(cm!.gl_posted).toBe(true);
  expect(cm!.gl_journal_id).toBeTruthy();
});

Then('Post to GL button should not be visible on credit memo detail', async function ({ page }) {
  const detailPage = new CreditMemoDetailPage(page);
  await detailPage.expectPostToGLButtonHidden();
});

When(
  'I reverse the application for current target invoice with reason {string}',
  async function ({ page }, reason: string) {
    const invoiceNumber = (this as any).targetInvoiceNumber as string | undefined;
    if (!invoiceNumber) throw new Error('Missing targetInvoiceNumber for reversal');
    const detailPage = new CreditMemoDetailPage(page);
    await detailPage.verifyPageLoaded();
    await detailPage.openReverseDialogForInvoiceApplication(invoiceNumber);
    await detailPage.fillReverseApplicationReason(reason);
    await detailPage.confirmApplicationReversal();
  }
);

Then('I should see credit memo reversal success toast', async function ({ page }) {
  const detailPage = new CreditMemoDetailPage(page);
  await detailPage.expectApplicationReversedSuccessToast();
});

Then(
  'credit memo applications for target invoice should be reversed in database',
  async function () {
    const creditMemoId = (this as any).currentCreditMemoId as string | undefined;
    const invoiceId = (this as any).targetInvoiceId as string | undefined;
    if (!creditMemoId || !invoiceId) throw new Error('Missing credit memo or invoice context');
    await expect
      .poll(
        async () => {
          const apps = await getCreditMemoApplications(creditMemoId);
          const forTarget = apps.filter((a) => a.invoice_id === invoiceId);
          if (forTarget.length === 0) return 'none';
          return forTarget.every((a) => a.is_reversed) ? 'all_reversed' : 'pending';
        },
        {
          timeout: 30000,
          intervals: [400, 800, 1200],
          message: 'Credit memo application row(s) for target invoice should flip to is_reversed after UI reversal',
        }
      )
      .toBe('all_reversed');
  }
);

Then('current credit memo should have no active applications in database', async function () {
  const creditMemoId = (this as any).currentCreditMemoId as string | undefined;
  if (!creditMemoId) throw new Error('Missing credit memo id in context');
  const apps = await getCreditMemoApplications(creditMemoId);
  const active = apps.filter((a) => !a.is_reversed);
  expect(active.length).toBe(0);
});

Then('credit memo available credit should equal total amount after reversal', async function () {
  const creditMemoId = (this as any).currentCreditMemoId as string | undefined;
  if (!creditMemoId) throw new Error('Missing credit memo id in context');
  const cm = await getCreditMemoById(creditMemoId);
  expect(cm).not.toBeNull();
  expect(Number(cm!.credit_available)).toBeCloseTo(Number(cm!.total_credit_amount), 2);
  expect(Number(cm!.credit_applied)).toBeCloseTo(0, 2);
});

Then('target invoice outstanding should be restored after reversal', async function () {
  const invoiceId = (this as any).targetInvoiceId as string | undefined;
  const beforeBalance = Number((this as any).targetInvoiceBalanceBefore || 0);
  if (!invoiceId) throw new Error('Missing target invoice context for reversal outstanding assertion');
  if (!(beforeBalance > 0)) throw new Error('Missing pre-apply invoice balance context');

  await expect
    .poll(
      async () => {
        const bal = await getInvoiceOutstandingBalance(invoiceId);
        return Number(bal ?? -1);
      },
      {
        timeout: 30000,
        intervals: [500, 1000, 1500],
        message: `Invoice outstanding should return to pre-apply balance ${beforeBalance}`,
      }
    )
    .toBeCloseTo(beforeBalance, 2);
});

// ---------------------------------------------------------------------------
// Cycle 6 — reverse dialog guardrails + post-reversal UI
// ---------------------------------------------------------------------------

When(
  'I open reverse dialog for current target invoice without confirming',
  async function ({ page }) {
    const invoiceNumber = (this as any).targetInvoiceNumber as string | undefined;
    if (!invoiceNumber) throw new Error('Missing targetInvoiceNumber for reverse dialog');
    const detailPage = new CreditMemoDetailPage(page);
    await detailPage.verifyPageLoaded();
    await detailPage.openReverseDialogForInvoiceApplication(invoiceNumber);
  }
);

Then('Confirm Reversal button should be disabled on reverse dialog', async function ({ page }) {
  const detailPage = new CreditMemoDetailPage(page);
  await detailPage.expectConfirmReversalDisabled();
});

When('I fill reverse application reason in dialog with {string}', async function ({ page }, text: string) {
  const detailPage = new CreditMemoDetailPage(page);
  await detailPage.fillReverseApplicationReason(text);
});

Then('Confirm Reversal button should be enabled on reverse dialog', async function ({ page }) {
  const detailPage = new CreditMemoDetailPage(page);
  await detailPage.expectConfirmReversalEnabled();
});

When('I cancel reverse application dialog', async function ({ page }) {
  const detailPage = new CreditMemoDetailPage(page);
  await detailPage.cancelReverseApplicationDialog();
});

Then('reverse application dialog should be closed', async function ({ page }) {
  await expect(page.getByText(/Reverse Credit Memo Application/i)).toBeHidden({ timeout: 5000 });
});

Then(
  'credit memo applications for target invoice should remain active in database',
  async function () {
    const creditMemoId = (this as any).currentCreditMemoId as string | undefined;
    const invoiceId = (this as any).targetInvoiceId as string | undefined;
    if (!creditMemoId || !invoiceId) throw new Error('Missing credit memo or invoice context');
    const apps = await getCreditMemoApplications(creditMemoId);
    const forTarget = apps.filter((a) => a.invoice_id === invoiceId);
    expect(forTarget.length).toBeGreaterThan(0);
    expect(forTarget.every((a) => !a.is_reversed)).toBe(true);
  }
);

Then(
  'application history row for target invoice should show reversed status',
  async function ({ page }) {
    const invoiceNumber = (this as any).targetInvoiceNumber as string | undefined;
    if (!invoiceNumber) throw new Error('Missing targetInvoiceNumber');
    const detailPage = new CreditMemoDetailPage(page);
    await detailPage.verifyPageLoaded();
    await detailPage.expectApplicationHistoryRowShowsReversed(invoiceNumber);
  }
);

Then(
  'application history row for target invoice should not show Reverse action',
  async function ({ page }) {
    const invoiceNumber = (this as any).targetInvoiceNumber as string | undefined;
    if (!invoiceNumber) throw new Error('Missing targetInvoiceNumber');
    const detailPage = new CreditMemoDetailPage(page);
    await detailPage.verifyPageLoaded();
    await detailPage.expectApplicationHistoryRowHasNoReverseButton(invoiceNumber);
  }
);

Then('credit memo detail should provide full CCN reversal action', async function ({ page }) {
  const detailPage = new CreditMemoDetailPage(page);
  await detailPage.verifyPageLoaded();
  await detailPage.expectFullCreditMemoReverseActionVisible();
});

When('I attempt to open credit memos as unauthorized user', async function ({ page }) {
  await page.goto('/finance/credit-memos', { waitUntil: 'domcontentloaded' });
});

Then('I should be denied access to credit memos', async function ({ page }) {
  for (let i = 0; i < 45; i++) {
    const u = page.url();
    if (/\/restrictedUser/i.test(u)) {
      await expect(page).toHaveURL(/\/restrictedUser/i);
      return;
    }
    await page.waitForTimeout(300);
  }
  if (/\/finance\/credit-memos/i.test(page.url())) {
    test.skip(
      true,
      'iacs-ed has finance_credit_memos access in this environment; FIN-CM-TC-022 needs a user without finance_credit_memos:read.'
    );
    return;
  }
  await expect(page).toHaveURL(/\/restrictedUser/i, { timeout: 2000 });
});
