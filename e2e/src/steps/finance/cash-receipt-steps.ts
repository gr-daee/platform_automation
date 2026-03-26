import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { CashReceiptsPage } from '../../pages/finance/CashReceiptsPage';
import { CashReceiptDetailPage } from '../../pages/finance/CashReceiptDetailPage';
import { CashReceiptApplyPage } from '../../pages/finance/CashReceiptApplyPage';
import { NewCashReceiptPage } from '../../pages/finance/NewCashReceiptPage';
import {
  getCashReceiptById,
  getCashReceiptApplications,
  getCashReceiptApplicationTotals,
  getCashReceiptApplicationsWithInvoiceNumbers,
  getInvoiceOutstandingBalance,
  getOutstandingInvoicesForCustomer,
  type OutstandingInvoiceRow,
} from '../../support/finance-db-helpers';
import { executeQuery } from '../../support/db-helper';
import { getStableDealerWithVAN } from '../../support/data/finance-test-data';

const { Given, When, Then } = createBdd();

/**
 * Helper: Resolve invoice number from selector (supports "first", "second", "third" or actual invoice number)
 */
async function resolveInvoiceNumber(
  selector: string,
  context: any
): Promise<string> {
  const outstandingInvoices = context.outstandingInvoices as OutstandingInvoiceRow[] | undefined;
  
  if (!outstandingInvoices || outstandingInvoices.length === 0) {
    throw new Error('No outstanding invoices available. Ensure "I am on the apply page" step runs first.');
  }
  
  // Check if selector is an index word (first, second, third, etc.)
  const indexMap: Record<string, number> = {
    first: 0,
    second: 1,
    third: 2,
    fourth: 3,
    fifth: 4,
    '1st': 0,
    '2nd': 1,
    '3rd': 2,
    '4th': 3,
    '5th': 4,
  };
  
  const normalizedSelector = selector.toLowerCase().trim();
  const index = indexMap[normalizedSelector];
  
  if (index !== undefined) {
    if (index >= outstandingInvoices.length) {
      throw new Error(
        `Invoice index "${selector}" (${index + 1}) exceeds available invoices (${outstandingInvoices.length})`
      );
    }
    const invoice = outstandingInvoices[index];
    console.log(`📋 Selected invoice by index "${selector}": ${invoice.invoice_number} (Balance: ₹${invoice.balance_amount.toLocaleString()})`);
    return invoice.invoice_number;
  }
  
  // Otherwise, treat as invoice number and verify it exists
  const invoice = outstandingInvoices.find(inv =>
    inv.invoice_number.toLowerCase() === normalizedSelector
  );
  
  if (!invoice) {
    throw new Error(
      `Invoice "${selector}" not found in outstanding invoices. Available: ${outstandingInvoices.map(inv => inv.invoice_number).join(', ')}`
    );
  }
  
  console.log(`📋 Using invoice number directly: ${invoice.invoice_number} (Balance: ₹${invoice.balance_amount.toLocaleString()})`);
  return invoice.invoice_number;
}

/**
 * Helper: Get balance from UI (fallback when DB cache not available)
 */
async function getBalanceFromUI(page: any, invoiceNumber: string): Promise<number> {
  const invoiceRow = page
    .locator('div')
    .filter({ hasText: new RegExp(invoiceNumber, 'i') })
    .filter({ has: page.locator('[role="checkbox"]') })
    .first();
  
  await expect(invoiceRow).toBeVisible({ timeout: 10000 });
  
  const balanceValue = invoiceRow
    .locator('p.font-semibold')
    .filter({ hasText: /₹/ })
    .first();
  
  const balanceText = await balanceValue.textContent({ timeout: 5000 });
  return parseFloat(balanceText?.replace(/[₹,\s]/g, '') || '0');
}

/**
 * Creates a cash receipt for the test customer and stores receipt context.
 */
async function createCashReceiptForTesting(context: any, page: any, amount: number): Promise<void> {
  const cashReceiptsPage = new CashReceiptsPage(page);
  await cashReceiptsPage.goto();
  await cashReceiptsPage.verifyPageLoaded();
  await cashReceiptsPage.clickNewCashReceipt();

  const newReceiptPage = new NewCashReceiptPage(page);
  await newReceiptPage.verifyPageLoaded();
  await newReceiptPage.fillMinimalForm(amount, 'Ramesh ningappa diggai');
  await newReceiptPage.save();

  await expect(page).toHaveURL(/\/finance\/cash-receipts\/[a-f0-9-]+/, { timeout: 15000 });
  const receiptId = page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  if (!receiptId) {
    throw new Error('Failed to create cash receipt - receipt ID not found in URL');
  }
  context.currentCashReceiptId = receiptId;
  context.currentCashReceiptAmount = amount;
}

Given('I am on the cash receipts page', async function ({ page }) {
  const cashReceiptsPage = new CashReceiptsPage(page);
  await cashReceiptsPage.goto();
  await cashReceiptsPage.verifyPageLoaded();
  (this as any).cashReceiptsPage = cashReceiptsPage;
});

When('I click New Cash Receipt', async function ({ page }) {
  const cashReceiptsPage = (this as any).cashReceiptsPage || new CashReceiptsPage(page);
  await cashReceiptsPage.clickNewCashReceipt();
  // Store NewCashReceiptPage for form filling
  const newReceiptPage = new NewCashReceiptPage(page);
  await newReceiptPage.verifyPageLoaded();
  (this as any).newCashReceiptPage = newReceiptPage;
});

When('I open cash receipt {string}', async function ({ page }, receiptId: string) {
  const cashReceiptsPage = (this as any).cashReceiptsPage || new CashReceiptsPage(page);
  await cashReceiptsPage.openCashReceipt(receiptId);
  (this as any).cashReceiptDetailPage = new CashReceiptDetailPage(page);
});

When('I navigate to cash receipt {string} detail', async function ({ page }, receiptId: string) {
  const detailPage = new CashReceiptDetailPage(page);
  await detailPage.goto(receiptId);
  await detailPage.verifyPageLoaded();
  (this as any).cashReceiptDetailPage = detailPage;
});

When('I click Apply to Invoices on cash receipt', async function ({ page }) {
  const detailPage = (this as any).cashReceiptDetailPage || new CashReceiptDetailPage(page);
  await detailPage.clickApplyToInvoices();
  (this as any).cashReceiptApplyPage = new CashReceiptApplyPage(page);
});

When('I apply cash receipt {string} to invoice {string} with amount {string}', async function (
  { page },
  receiptIdParam: string,
  invoiceSelector: string,
  amount: string
) {
  const receiptId =
    receiptIdParam && receiptIdParam !== '<receiptId>'
      ? receiptIdParam
      : page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  const applyPage = (this as any).cashReceiptApplyPage || new CashReceiptApplyPage(page);
  if (!(this as any).cashReceiptApplyPage && receiptId) await applyPage.goto(receiptId);
  
  // Resolve invoice number from selector (supports "first", "second", "third" or actual invoice number)
  const invoiceNumber = await resolveInvoiceNumber(invoiceSelector, this);

  await applyPage.selectInvoice(invoiceNumber);
  await applyPage.setAmountToApply(invoiceNumber, parseFloat(amount));
  await applyPage.saveApplication();

  // Store applied amount in context for subsequent EPD/summary assertions
  (this as any)[`invoice_${invoiceNumber}_applied_amount`] = parseFloat(amount);
});

Then('the cash receipt should be created successfully', async function ({ page }) {
  await expect(page).toHaveURL(/\/finance\/cash-receipts\/[a-f0-9-]+/, { timeout: 10000 });
  const cashReceiptsPage = (this as any).cashReceiptsPage;
  if (cashReceiptsPage) await cashReceiptsPage.waitForSuccessToast(8000).catch(() => {});
});

Then('the payment should be allocated to invoice {string}', async function ({ page }, invoiceSelector: string) {
  const detailPage = (this as any).cashReceiptDetailPage || new CashReceiptDetailPage(page);
  const receiptId = (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  const invoiceNumber = await resolveInvoiceNumber(invoiceSelector, this);

  // Wait for redirect to receipt detail page (app does router.push after apply)
  if (receiptId && page.url().includes('/apply')) {
    await page.waitForURL((u) => !u.href.includes('/apply'), { timeout: 15000, waitUntil: 'domcontentloaded' });
  }

  if (receiptId) {
    // Prefer matching by invoice_number (join); retry DB for eventual consistency (multi-application can be slow)
    const maxAttempts = 5;
    const delayMs = 3000;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const applicationsWithNumbers = await getCashReceiptApplicationsWithInvoiceNumbers(receiptId);
      expect(applicationsWithNumbers.length).toBeGreaterThan(0);
      const hasThisInvoice = applicationsWithNumbers.some(
        (a) => !a.is_reversed && a.invoice_number?.toLowerCase() === invoiceNumber.toLowerCase()
      );
      if (hasThisInvoice) return;
      if (attempt < maxAttempts) await new Promise((r) => setTimeout(r, delayMs));
    }

    // Fallback: verify via UI (e.g. schema uses different column or join returns null invoice_number)
    await detailPage.goto(receiptId);
    await page.reload({ waitUntil: 'networkidle' });
    await detailPage.verifyPageLoaded();
    await detailPage.verifyApplicationCreated(invoiceNumber, 20000);
  } else {
    await detailPage.verifyApplicationCreated(invoiceNumber, 15000);
  }
});

Then(
  'the outstanding balance for invoice {string} should decrease by {string}',
  async function ({ page }, invoiceSelector: string, amount: string) {
    const applyPage = (this as any).cashReceiptApplyPage || new CashReceiptApplyPage(page);
    const decrease = parseFloat(amount);

    // Resolve invoice number from selector using original outstandingInvoices snapshot
    const invoiceNumber = await resolveInvoiceNumber(invoiceSelector, this);
    const outstandingInvoices = (this as any).outstandingInvoices as OutstandingInvoiceRow[] | undefined;
    if (!outstandingInvoices || outstandingInvoices.length === 0) {
      throw new Error('No outstanding invoices context available to verify outstanding balance.');
    }

    const invoice = outstandingInvoices.find(
      (inv) => inv.invoice_number.toLowerCase() === invoiceNumber.toLowerCase()
    );
    if (!invoice) {
      throw new Error(`Invoice "${invoiceNumber}" not found in outstandingInvoices context.`);
    }

    const originalBalance = invoice.balance_amount;
    const expectedBalance = Number((originalBalance - decrease).toFixed(2));

    // Re-open the apply page to read the updated outstanding balance from UI
    const receiptId =
      (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
    if (!receiptId) {
      throw new Error('No current cash receipt ID available to verify outstanding balance.');
    }

    // Prefer DB verification (stable and invoice-id scoped) to avoid UI row ambiguity.
    const dbBalance = await getInvoiceOutstandingBalance(invoice.id);
    if (dbBalance !== null && dbBalance !== undefined) {
      const actual = Number(dbBalance.toFixed(2));
      expect(actual).toBeCloseTo(expectedBalance, 2);
      return;
    }

    // Fallback to UI only if DB balance could not be fetched.
    await applyPage.goto(receiptId);
    await applyPage.verifyPageLoaded();

    const uiBalance = await getBalanceFromUI(page, invoiceNumber);
    expect(uiBalance).toBeCloseTo(expectedBalance, 2);
  }
);

Then(
  'the outstanding balance for invoice {string} should decrease by the total amount credited for that invoice',
  async function ({ page }, invoiceSelector: string) {
    const applyPage = (this as any).cashReceiptApplyPage || new CashReceiptApplyPage(page);
    const invoiceNumber = await resolveInvoiceNumber(invoiceSelector, this);
    const outstandingInvoices = (this as any).outstandingInvoices as OutstandingInvoiceRow[] | undefined;
    if (!outstandingInvoices || outstandingInvoices.length === 0) {
      throw new Error('No outstanding invoices context available to verify outstanding balance.');
    }
    const invoice = outstandingInvoices.find(
      (inv) => inv.invoice_number.toLowerCase() === invoiceNumber.toLowerCase()
    );
    if (!invoice) {
      throw new Error(`Invoice "${invoiceNumber}" not found in outstandingInvoices context.`);
    }
    const receiptId =
      (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
    if (!receiptId) {
      throw new Error('No current cash receipt ID available to verify outstanding balance.');
    }
    const applications = await getCashReceiptApplications(receiptId);
    const invoiceApplications = applications.filter((a) => !a.is_reversed && a.invoice_id === invoice.id);
    const totalAmountApplied = invoiceApplications.reduce((sum, a) => sum + Number(a.amount_applied || 0), 0);
    const totalCreditedWithDiscount = invoiceApplications.reduce(
      (sum, a) => sum + Number(a.amount_applied || 0) + Number(a.discount_taken || 0),
      0
    );
    const originalBalance = invoice.balance_amount;
    const expectedBalanceFull = Number((originalBalance - totalCreditedWithDiscount).toFixed(2));
    const expectedBalanceCashOnly = Number((originalBalance - totalAmountApplied).toFixed(2));

    // Prefer DB verification (reliable); fall back to UI when invoice id not available
    const dbBalance = await getInvoiceOutstandingBalance(invoice.id);
    if (dbBalance !== null && dbBalance !== undefined) {
      const actual = Number(dbBalance.toFixed(2));
      const matchesFull = Math.abs(actual - expectedBalanceFull) < 0.01;
      const matchesCashOnly = Math.abs(actual - expectedBalanceCashOnly) < 0.01;
      expect(matchesFull || matchesCashOnly, `Invoice balance ${actual} should be ~${expectedBalanceFull} (cash+EPD) or ~${expectedBalanceCashOnly} (cash only)`).toBe(true);
      return;
    }
    await applyPage.goto(receiptId);
    await applyPage.verifyPageLoaded();
    const uiBalance = await getBalanceFromUI(page, invoiceNumber);
    expect(uiBalance).toBeCloseTo(expectedBalance, 2);
  }
);

Then(
  'the cash receipt application details for invoice {string} should be correct',
  async function ({ page }, invoiceSelector: string) {
    const detailPage = (this as any).cashReceiptDetailPage || new CashReceiptDetailPage(page);

    // Resolve invoice number from selector
    const invoiceNumber = await resolveInvoiceNumber(invoiceSelector, this);

    const receiptId =
      (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
    if (!receiptId) {
      throw new Error('No current cash receipt ID available to verify application details.');
    }

    // Fetch applications from DB for the current receipt & invoice
    const applications = await getCashReceiptApplications(receiptId);

    const outstandingInvoices = (this as any).outstandingInvoices as OutstandingInvoiceRow[] | undefined;
    if (!outstandingInvoices || outstandingInvoices.length === 0) {
      throw new Error('No outstanding invoices context available to verify application details.');
    }

    const invoice = outstandingInvoices.find(
      (inv) => inv.invoice_number.toLowerCase() === invoiceNumber.toLowerCase()
    );
    if (!invoice) {
      throw new Error(`Invoice "${invoiceNumber}" not found in outstandingInvoices context.`);
    }

    const invoiceApplications = applications.filter(
      (a) => !a.is_reversed && a.invoice_id === invoice.id
    );
    if (invoiceApplications.length === 0) {
      throw new Error(
        `No cash_receipt_applications rows found for receipt "${receiptId}" and invoice "${invoiceNumber}".`
      );
    }

    const appliedAmount = invoiceApplications.reduce(
      (total, app) => total + Number(app.amount_applied || 0),
      0
    );
    const discountAmount = invoiceApplications.reduce(
      (total, app) => total + Number(app.discount_taken || 0),
      0
    );

    // Applications to Invoices table is on the receipt detail page, not the apply page.
    // Navigate to detail so the table and row are in the DOM.
    await detailPage.goto(receiptId);
    await detailPage.verifyPageLoaded();
    await detailPage.verifyApplicationDetails(invoiceNumber, appliedAmount, discountAmount);
  }
);

Then(
  'on clicking the CCN link for invoice {string} the CCN details should be correct',
  async function ({ page }, invoiceSelector: string) {
    const detailPage = (this as any).cashReceiptDetailPage || new CashReceiptDetailPage(page);

    const invoiceNumber = await resolveInvoiceNumber(invoiceSelector, this);
    const receiptId =
      (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
    if (!receiptId) {
      throw new Error('No current cash receipt ID available to verify CCN details.');
    }

    // Use DB to derive expected CCN amount (discount_taken)
    const outstandingInvoices = (this as any).outstandingInvoices as OutstandingInvoiceRow[] | undefined;
    if (!outstandingInvoices || outstandingInvoices.length === 0) {
      throw new Error('No outstanding invoices context available to verify CCN details.');
    }
    const invoice = outstandingInvoices.find(
      (inv) => inv.invoice_number.toLowerCase() === invoiceNumber.toLowerCase()
    );
    if (!invoice) throw new Error(`Invoice "${invoiceNumber}" not found in outstandingInvoices context.`);

    const applications = await getCashReceiptApplications(receiptId);
    const invoiceApplications = applications.filter(
      (a) => !a.is_reversed && a.invoice_id === invoice.id
    );
    const discountAmount = invoiceApplications.reduce(
      (total, app) => total + Number(app.discount_taken || 0),
      0
    );
    if (discountAmount <= 0) {
      throw new Error(`Expected CCN/discount amount > 0 for invoice "${invoiceNumber}", but got ${discountAmount}.`);
    }

    await detailPage.goto(receiptId);
    await detailPage.verifyPageLoaded();
    await detailPage.verifyCCNDetailsFromExpandedRow(invoiceNumber, discountAmount);
  }
);

Then(
  'on clicking the journal entry the JE details should be correct',
  async function ({ page }) {
    const detailPage = (this as any).cashReceiptDetailPage || new CashReceiptDetailPage(page);
    const receiptId =
      (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
    if (!receiptId) {
      throw new Error('No current cash receipt ID available to verify journal entry details.');
    }

    await detailPage.goto(receiptId);
    await detailPage.verifyPageLoaded();
    await detailPage.verifyJournalEntryDetailsFromReceipt();
  }
);

Then('journal entry should be present for the current cash receipt', async function ({ page }) {
  const detailPage = (this as any).cashReceiptDetailPage || new CashReceiptDetailPage(page);
  const receiptId =
    (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  if (!receiptId) {
    throw new Error('No current cash receipt ID available.');
  }
  await detailPage.goto(receiptId);
  await detailPage.verifyPageLoaded();
  const visible = await detailPage.isJournalEntrySectionVisible();
  expect(visible).toBe(true);
});

When('I select invoice {string}', async function ({ page }, invoiceSelector: string) {
  const applyPage = (this as any).cashReceiptApplyPage || new CashReceiptApplyPage(page);
  const invoiceNumber = await resolveInvoiceNumber(invoiceSelector, this);
  const receiptId = (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  if (!(this as any).cashReceiptApplyPage && receiptId) await applyPage.goto(receiptId);
  await applyPage.verifyPageLoaded();
  await applyPage.selectInvoice(invoiceNumber);
});

When(
  'I set amount to apply {string} for invoice {string} without saving',
  async function ({ page }, amount: string, invoiceSelector: string) {
    const applyPage = (this as any).cashReceiptApplyPage || new CashReceiptApplyPage(page);
    const invoiceNumber = await resolveInvoiceNumber(invoiceSelector, this);
    const receiptId = (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
    if (!(this as any).cashReceiptApplyPage && receiptId) await applyPage.goto(receiptId);
    await applyPage.verifyPageLoaded();
    await applyPage.selectInvoice(invoiceNumber);
    await applyPage.setAmountToApply(invoiceNumber, parseFloat(amount));
  }
);

When('I apply the payments', async function ({ page }) {
  const applyPage = (this as any).cashReceiptApplyPage || new CashReceiptApplyPage(page);
  await applyPage.verifyPageLoaded();
  await applyPage.saveApplication();
});

When(
  'I expect {int} invoice\\(s) to be selected on the apply page',
  async function ({ page }, expectedCount: number) {
    const applyPage = (this as any).cashReceiptApplyPage || new CashReceiptApplyPage(page);
    await applyPage.verifyPageLoaded();
    await applyPage.waitForSelectedInvoiceCount(expectedCount);
  }
);

When('I wait for apply form to be ready', async function ({ page }) {
  const applyPage = (this as any).cashReceiptApplyPage || new CashReceiptApplyPage(page);
  await applyPage.waitForApplyFormReady();
});

When('I wait for the Apply Payments button to be enabled', async function ({ page }) {
  const applyPage = (this as any).cashReceiptApplyPage || new CashReceiptApplyPage(page);
  await applyPage.waitForApplyButtonEnabled();
});

Then('the Apply Payments button should be disabled on apply page', async function ({ page }) {
  const applyPage = (this as any).cashReceiptApplyPage || new CashReceiptApplyPage(page);
  await applyPage.verifyPageLoaded();
  await applyPage.expectApplyButtonDisabled();
});

When('I toggle EPD off for invoice {string}', async function ({ page }, invoiceSelector: string) {
  const applyPage = (this as any).cashReceiptApplyPage || new CashReceiptApplyPage(page);
  const invoiceNumber = await resolveInvoiceNumber(invoiceSelector, this);
  const receiptId = (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  if (!(this as any).cashReceiptApplyPage && receiptId) await applyPage.goto(receiptId);
  await applyPage.verifyPageLoaded();
  await applyPage.toggleEPDEnabled(invoiceNumber, false);
});

When('I toggle EPD on for invoice {string}', async function ({ page }, invoiceSelector: string) {
  const applyPage = (this as any).cashReceiptApplyPage || new CashReceiptApplyPage(page);
  const invoiceNumber = await resolveInvoiceNumber(invoiceSelector, this);
  const receiptId = (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  if (!(this as any).cashReceiptApplyPage && receiptId) await applyPage.goto(receiptId);
  await applyPage.verifyPageLoaded();
  await applyPage.toggleEPDEnabled(invoiceNumber, true);
});

Then(
  'the apply page should show EPD discount for invoice {string}',
  async function ({ page }, invoiceSelector: string) {
    const applyPage = (this as any).cashReceiptApplyPage || new CashReceiptApplyPage(page);
    const invoiceNumber = await resolveInvoiceNumber(invoiceSelector, this);
    await applyPage.verifyPageLoaded();
    await applyPage.expectEPDDiscountVisible(invoiceNumber);
  }
);

Then(
  'the apply page should show no EPD discount for invoice {string}',
  async function ({ page }, invoiceSelector: string) {
    const applyPage = (this as any).cashReceiptApplyPage || new CashReceiptApplyPage(page);
    const invoiceNumber = await resolveInvoiceNumber(invoiceSelector, this);
    await applyPage.verifyPageLoaded();
    await applyPage.expectNoEPDDiscountVisible(invoiceNumber);
  }
);

Then('no CCN should be created for the current receipt', async function () {
  const receiptId = (this as any).currentCashReceiptId;
  if (!receiptId) {
    throw new Error('No current cash receipt ID available.');
  }
  const applications = await getCashReceiptApplications(receiptId);
  const totalDiscount = applications
    .filter((a) => !a.is_reversed)
    .reduce((sum, a) => sum + Number(a.discount_taken || 0), 0);
  expect(totalDiscount).toBe(0);
});

Then('the cash receipt financial totals should reconcile in database', async function ({ page }) {
  const receiptId =
    (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  if (!receiptId) {
    throw new Error('No current cash receipt ID available.');
  }

  const receipt = await getCashReceiptById(receiptId);
  expect(receipt).not.toBeNull();

  const totals = await getCashReceiptApplicationTotals(receiptId);
  const amountAppliedHeader = Number(receipt!.amount_applied || 0);
  const amountUnappliedHeader = Number(receipt!.amount_unapplied || 0);
  const totalReceiptAmount = Number(receipt!.total_receipt_amount || 0);

  // Integrity 1: Header applied amount must match application rows sum(amount_applied)
  expect(amountAppliedHeader).toBeCloseTo(Number(totals.total_amount_applied || 0), 2);

  // Integrity 2: Header split should stay balanced
  expect(amountAppliedHeader + amountUnappliedHeader).toBeCloseTo(totalReceiptAmount, 2);
});

Then('I should see cash receipt {string} in the list', async function ({ page }, receiptNumber: string) {
  const cashReceiptsPage = (this as any).cashReceiptsPage || new CashReceiptsPage(page);
  await cashReceiptsPage.goto();
  await cashReceiptsPage.waitForTableLoaded();
  await cashReceiptsPage.verifyCashReceiptExists(receiptNumber);
});

Then(
  'the EPD discount should be correctly calculated for invoice {string}',
  async function ({ page }, invoiceSelector: string) {
    const detailPage = (this as any).cashReceiptDetailPage || new CashReceiptDetailPage(page);

    // Resolve invoice number from selector ("first", "second", or actual number)
    const invoiceNumber = await resolveInvoiceNumber(invoiceSelector, this);

    // Get outstanding invoices context (DB-backed) to map invoice number → invoice ID
    const outstandingInvoices = (this as any).outstandingInvoices as OutstandingInvoiceRow[] | undefined;
    if (!outstandingInvoices || outstandingInvoices.length === 0) {
      throw new Error('No outstanding invoices context available to compute expected EPD discount.');
    }

    const invoice = outstandingInvoices.find(
      (inv) => inv.invoice_number.toLowerCase() === invoiceNumber.toLowerCase()
    );
    if (!invoice || invoice.early_payment_discount_percentage == null) {
      throw new Error(
        `Invoice "${invoiceNumber}" not found in outstandingInvoices context. ` +
          'Ensure apply-page background step populated outstanding invoices correctly.'
      );
    }

    // Fetch applications for this cash receipt from DB and derive expected discount
    const receiptId =
      (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
    if (!receiptId) {
      throw new Error('No current cash receipt ID available in context or URL.');
    }

    const applications = await getCashReceiptApplications(receiptId);
    const invoiceApplications = applications.filter(
      (a) => !a.is_reversed && a.invoice_id === invoice.id
    );

    if (invoiceApplications.length === 0) {
      throw new Error(
        `No cash_receipt_applications rows found for receipt "${receiptId}" and invoice "${invoiceNumber}".`
      );
    }

    const expectedDiscount = invoiceApplications.reduce(
      (total, app) => total + Number(app.discount_taken || 0),
      0
    );

    // Ensure we are on the receipt detail page, then read actual discount from the Applications table for this invoice.
    await detailPage.verifyPageLoaded();

    const actualDiscount = await detailPage.getEPDDiscountAmountForInvoice(invoiceNumber);
    expect(actualDiscount).toBeCloseTo(expectedDiscount, 2);
  }
);

Given('I have created a cash receipt with amount {string} for testing', async function ({ page }, amount: string) {
  await createCashReceiptForTesting(this as any, page, parseFloat(amount));
});

Given('I am on the apply page for the current cash receipt', async function ({ page }) {
  const receiptId = (this as any).currentCashReceiptId;
  if (!receiptId) {
    throw new Error('No cash receipt created. Ensure Background step "I have created a cash receipt" runs first.');
  }
  const applyPage = new CashReceiptApplyPage(page);
  await applyPage.goto(receiptId);
  await applyPage.verifyPageLoaded();
  
  // Get cash receipt from DB to fetch customer_id and tenant_id
  const cashReceipt = await getCashReceiptById(receiptId);
  if (!cashReceipt) {
    throw new Error(`Cash receipt ${receiptId} not found in database`);
  }
  
  // Get tenant_id from cash receipt (cash receipts have tenant_id field)
  // Query tenant_id from cash_receipt_headers table
  const cashReceiptWithTenant = await executeQuery<{ tenant_id: string }>(
    `SELECT tenant_id FROM cash_receipt_headers WHERE id = $1`,
    [receiptId]
  );
  const tenantId = cashReceiptWithTenant.length > 0 ? cashReceiptWithTenant[0].tenant_id : undefined;
  
  // Get outstanding invoices from DB for this customer (matching web app logic)
  const outstandingInvoices = await getOutstandingInvoicesForCustomer(cashReceipt.customer_id, tenantId);
  
  // Store for use in subsequent steps
  (this as any).outstandingInvoices = outstandingInvoices;
  (this as any).cashReceiptApplyPage = applyPage;
  (this as any).cashReceiptDetailPage = new CashReceiptDetailPage(page);
  
  // Verify UI shows the same invoices
  console.log(`📋 Found ${outstandingInvoices.length} outstanding invoice(s) in DB for customer ${cashReceipt.customer_id}`);
  
  if (outstandingInvoices.length === 0) {
    console.warn('⚠️  No outstanding invoices found in DB. UI should show "No outstanding invoices" message.');
    // Verify UI shows the "no invoices" message
    await expect(page.getByText(/No outstanding invoices found/i)).toBeVisible({ timeout: 5000 }).catch(() => {
      throw new Error('Expected "No outstanding invoices" message but UI shows invoices');
    });
  } else {
    // Verify each invoice from DB is visible in UI
    for (const invoice of outstandingInvoices) {
      console.log(`  ✓ Invoice: ${invoice.invoice_number} (Balance: ₹${invoice.balance_amount.toLocaleString()})`);
      await expect(page.getByText(new RegExp(invoice.invoice_number, 'i'))).toBeVisible({ timeout: 10000 });
    }
  }
});

Given('invoice {string} has outstanding balance {string}', async function ({}, invoiceSelector: string, balance: string) {
  // Resolve invoice number from selector
  const invoiceNumber = await resolveInvoiceNumber(invoiceSelector, this);
  
  // Store expected balance for verification
  (this as any)[`invoice_${invoiceNumber}_expected_balance`] = parseFloat(balance);
  
  // Verify against DB if outstanding invoices are available
  const outstandingInvoices = (this as any).outstandingInvoices as OutstandingInvoiceRow[] | undefined;
  if (outstandingInvoices) {
    const invoice = outstandingInvoices.find(inv =>
      inv.invoice_number.toLowerCase() === invoiceNumber.toLowerCase()
    );
    if (invoice) {
      const expectedBalance = parseFloat(balance);
      const actualBalance = invoice.balance_amount;
      if (Math.abs(actualBalance - expectedBalance) > 0.01) {
        console.warn(
          `⚠️  Balance mismatch for ${invoiceNumber}: Expected ₹${expectedBalance.toLocaleString()}, DB shows ₹${actualBalance.toLocaleString()}`
        );
      }
    }
  }
});

When('I apply full outstanding amount to invoice {string}', async function ({ page }, invoiceSelector: string) {
  const applyPage = (this as any).cashReceiptApplyPage || new CashReceiptApplyPage(page);
  const receiptId = (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  if (!(this as any).cashReceiptApplyPage && receiptId) await applyPage.goto(receiptId);
  
  // Resolve invoice number from selector
  const invoiceNumber = await resolveInvoiceNumber(invoiceSelector, this);
  
  // Get outstanding balance from DB (more reliable than UI)
  const outstandingInvoices = (this as any).outstandingInvoices as OutstandingInvoiceRow[] | undefined;
  let outstandingBalance: number;
  
  if (outstandingInvoices && outstandingInvoices.length > 0) {
    const invoice = outstandingInvoices.find(inv => 
      inv.invoice_number.toLowerCase() === invoiceNumber.toLowerCase()
    );
    if (invoice) {
      outstandingBalance = invoice.balance_amount;
      console.log(`💰 Using balance from DB: Invoice ${invoiceNumber} = ₹${outstandingBalance.toLocaleString()}`);
    } else {
      // Fallback to UI if not found in DB cache
      outstandingBalance = await getBalanceFromUI(page, invoiceNumber);
    }
  } else {
    // Fallback to UI if DB cache not available
    outstandingBalance = await getBalanceFromUI(page, invoiceNumber);
  }
  
  expect(outstandingBalance).toBeGreaterThan(0);

  // Cap at receipt's unapplied balance so Apply button is enabled (cannot apply more than receipt has)
  let amountToApply = outstandingBalance;
  if (receiptId) {
    const receipt = await getCashReceiptById(receiptId);
    if (receipt && Number(receipt.amount_unapplied) >= 0) {
      const unapplied = Number(receipt.amount_unapplied);
      if (outstandingBalance > unapplied) {
        amountToApply = unapplied;
        console.log(`💰 Capping apply amount to receipt unapplied: ₹${amountToApply.toLocaleString()} (invoice balance ₹${outstandingBalance.toLocaleString()})`);
      }
    }
  }
  
  await applyPage.selectInvoice(invoiceNumber);
  await applyPage.setAmountToApply(invoiceNumber, amountToApply);
  await applyPage.saveApplication();
  
  (this as any)[`invoice_${invoiceNumber}_applied_amount`] = amountToApply;
});

When('I apply partial amount {string} to invoice {string}', async function ({ page }, amount: string, invoiceSelector: string) {
  const applyPage = (this as any).cashReceiptApplyPage || new CashReceiptApplyPage(page);
  const receiptId = (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  if (!(this as any).cashReceiptApplyPage && receiptId) await applyPage.goto(receiptId);
  
  // Resolve invoice number from selector
  const invoiceNumber = await resolveInvoiceNumber(invoiceSelector, this);
  
  await applyPage.selectInvoice(invoiceNumber);
  await applyPage.setAmountToApply(invoiceNumber, parseFloat(amount));
  await applyPage.saveApplication();
  
  (this as any)[`invoice_${invoiceNumber}_applied_amount`] = parseFloat(amount);
});

Given('I remember invoice {string} as the target invoice', async function ({}, invoiceSelector: string) {
  const invoiceNumber = await resolveInvoiceNumber(invoiceSelector, this);
  (this as any).targetInvoiceNumber = invoiceNumber;
  const outstandingInvoices = (this as any).outstandingInvoices as OutstandingInvoiceRow[] | undefined;
  const invoice = outstandingInvoices?.find(
    (inv) => inv.invoice_number.toLowerCase() === invoiceNumber.toLowerCase()
  );
  if (invoice) (this as any).targetInvoiceId = invoice.id;
});

Given('I remember the oldest pending invoice as the target invoice', async function ({}) {
  const outstandingInvoices = (this as any).outstandingInvoices as OutstandingInvoiceRow[] | undefined;
  if (!outstandingInvoices || outstandingInvoices.length === 0) {
    throw new Error('No outstanding invoices available to remember oldest pending invoice.');
  }
  // getOutstandingInvoicesForCustomer already returns FIFO (invoice_date ASC)
  const oldest = outstandingInvoices[0];
  (this as any).targetInvoiceNumber = oldest.invoice_number;
  (this as any).targetInvoiceId = oldest.id;
});

Given('I create a cash receipt using ratio {string} of remembered invoice outstanding', async function ({ page }, ratioText: string) {
  const targetInvoiceId = (this as any).targetInvoiceId as string | undefined;
  if (!targetInvoiceId) {
    throw new Error('No remembered target invoice found. Run target invoice selection step first.');
  }
  const ratio = Number(ratioText);
  if (!Number.isFinite(ratio) || ratio <= 0) {
    throw new Error(`Invalid ratio: "${ratioText}"`);
  }

  const outstanding = Number((await getInvoiceOutstandingBalance(targetInvoiceId)) || 0);
  if (!(outstanding > 0)) {
    throw new Error(`Remembered invoice has no positive outstanding amount. Current outstanding: ${outstanding}`);
  }

  // Keep amount practical and valid while remaining data-driven.
  const amount = Number(Math.max(1, Math.round(outstanding * ratio * 100) / 100));
  await createCashReceiptForTesting(this as any, page, amount);
});

Given('I remember an invoice fully payable by current cash receipt', async function ({}) {
  const outstandingInvoices = (this as any).outstandingInvoices as OutstandingInvoiceRow[] | undefined;
  const receiptAmount = Number((this as any).currentCashReceiptAmount || 0);
  if (!outstandingInvoices || outstandingInvoices.length === 0) {
    throw new Error('No outstanding invoices available to choose a payable target invoice.');
  }
  if (!(receiptAmount > 0)) {
    throw new Error('Current cash receipt amount missing in context.');
  }

  const candidates = outstandingInvoices
    .filter((inv) => Number(inv.balance_amount) > 0 && Number(inv.balance_amount) <= receiptAmount)
    .sort((a, b) => Number(b.balance_amount) - Number(a.balance_amount));
  if (candidates.length === 0) {
    throw new Error(
      `No outstanding invoice found with balance <= receipt amount (${receiptAmount}).`
    );
  }

  const target = candidates[0];
  (this as any).targetInvoiceNumber = target.invoice_number;
  (this as any).targetInvoiceId = target.id;
});

Given(
  'I remember an invoice with outstanding between {string} and {string} as the target invoice',
  async function ({}, minBalance: string, maxBalance: string) {
    const outstandingInvoices = (this as any).outstandingInvoices as OutstandingInvoiceRow[] | undefined;
    if (!outstandingInvoices || outstandingInvoices.length === 0) {
      throw new Error('No outstanding invoices available to choose a ranged target invoice.');
    }
    const min = Number(minBalance);
    const max = Number(maxBalance);
    if (Number.isNaN(min) || Number.isNaN(max)) {
      throw new Error(`Invalid min/max balance range: "${minBalance}" to "${maxBalance}"`);
    }

    const candidates = outstandingInvoices
      .filter((inv) => Number(inv.balance_amount) >= min && Number(inv.balance_amount) <= max)
      .sort((a, b) => Number(b.balance_amount) - Number(a.balance_amount));
    if (candidates.length === 0) {
      throw new Error(
        `No outstanding invoice found in range [${min}, ${max}] for current customer.`
      );
    }

    const target = candidates[0];
    (this as any).targetInvoiceNumber = target.invoice_number;
    (this as any).targetInvoiceId = target.id;
  }
);

When('I apply partial amount {string} to remembered invoice', async function ({ page }, amount: string) {
  const targetInvoiceNumber = (this as any).targetInvoiceNumber as string | undefined;
  if (!targetInvoiceNumber) {
    throw new Error('No remembered target invoice found. Run "I remember invoice ..." first.');
  }
  const applyPage = (this as any).cashReceiptApplyPage || new CashReceiptApplyPage(page);
  const receiptId = (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  if (!(this as any).cashReceiptApplyPage && receiptId) await applyPage.goto(receiptId);

  await applyPage.selectInvoice(targetInvoiceNumber);
  await applyPage.setAmountToApply(targetInvoiceNumber, parseFloat(amount));
  await applyPage.saveApplication();

  (this as any)[`invoice_${targetInvoiceNumber}_applied_amount`] = parseFloat(amount);
});

When('I apply full cash receipt amount to remembered invoice', async function ({ page }) {
  const targetInvoiceNumber = (this as any).targetInvoiceNumber as string | undefined;
  const receiptAmount = Number((this as any).currentCashReceiptAmount || 0);
  if (!targetInvoiceNumber) {
    throw new Error('No remembered target invoice found. Run target invoice selection step first.');
  }
  if (!(receiptAmount > 0)) {
    throw new Error('Current cash receipt amount missing in context.');
  }

  const applyPage = (this as any).cashReceiptApplyPage || new CashReceiptApplyPage(page);
  const receiptId = (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  if (!(this as any).cashReceiptApplyPage && receiptId) await applyPage.goto(receiptId);

  await applyPage.selectInvoice(targetInvoiceNumber);
  await applyPage.setAmountToApply(targetInvoiceNumber, receiptAmount);
  await applyPage.saveApplication();
});

When('I apply remaining amount to invoice {string}', async function ({ page }, invoiceSelector: string) {
  const applyPage = (this as any).cashReceiptApplyPage || new CashReceiptApplyPage(page);
  const receiptId = (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  if (!(this as any).cashReceiptApplyPage && receiptId) await applyPage.goto(receiptId);
  
  // Resolve invoice number from selector
  const invoiceNumber = await resolveInvoiceNumber(invoiceSelector, this);
  
  // Get remaining balance from UI (after partial payment, balance should be updated)
  const remainingBalance = await getBalanceFromUI(page, invoiceNumber);
  
  expect(remainingBalance).toBeGreaterThan(0);
  
  await applyPage.selectInvoice(invoiceNumber);
  await applyPage.setAmountToApply(invoiceNumber, remainingBalance);
  await applyPage.saveApplication();
});

When('I apply remaining amount to remembered invoice', async function ({ page }) {
  const targetInvoiceNumber = (this as any).targetInvoiceNumber as string | undefined;
  const targetInvoiceId = (this as any).targetInvoiceId as string | undefined;
  if (!targetInvoiceNumber) {
    throw new Error('No remembered target invoice found. Run "I remember invoice ..." first.');
  }
  const applyPage = (this as any).cashReceiptApplyPage || new CashReceiptApplyPage(page);
  const receiptId = (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  if (!(this as any).cashReceiptApplyPage && receiptId) await applyPage.goto(receiptId);

  // Read current remaining balance for the remembered invoice from DB (stable across UI order changes).
  let remainingBalance = 0;
  if (targetInvoiceId) {
    remainingBalance = Number((await getInvoiceOutstandingBalance(targetInvoiceId)) || 0);
  }
  if (!(remainingBalance > 0)) {
    remainingBalance = await getBalanceFromUI(page, targetInvoiceNumber);
  }
  expect(remainingBalance).toBeGreaterThan(0);
  const currentReceiptAmount = Number((this as any).currentCashReceiptAmount || 0);
  const amountToApply =
    currentReceiptAmount > 0 ? Math.min(remainingBalance, currentReceiptAmount) : remainingBalance;

  await applyPage.selectInvoice(targetInvoiceNumber);
  await applyPage.setAmountToApply(targetInvoiceNumber, amountToApply);
  await applyPage.saveApplication();
});

When('I apply full outstanding amount to remembered invoice', async function ({ page }) {
  const targetInvoiceNumber = (this as any).targetInvoiceNumber as string | undefined;
  const targetInvoiceId = (this as any).targetInvoiceId as string | undefined;
  if (!targetInvoiceNumber) {
    throw new Error('No remembered target invoice found. Run target invoice selection step first.');
  }

  const applyPage = (this as any).cashReceiptApplyPage || new CashReceiptApplyPage(page);
  const receiptId = (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  if (!(this as any).cashReceiptApplyPage && receiptId) await applyPage.goto(receiptId);

  let outstandingBalance = 0;
  if (targetInvoiceId) {
    outstandingBalance = Number((await getInvoiceOutstandingBalance(targetInvoiceId)) || 0);
  }
  if (!(outstandingBalance > 0)) {
    outstandingBalance = await getBalanceFromUI(page, targetInvoiceNumber);
  }
  expect(outstandingBalance).toBeGreaterThan(0);

  await applyPage.selectInvoice(targetInvoiceNumber);
  await applyPage.setAmountToApply(targetInvoiceNumber, outstandingBalance);
  await applyPage.saveApplication();
});

When('I navigate to the apply page for the current cash receipt again', async function ({ page }) {
  const receiptId = (this as any).currentCashReceiptId;
  if (!receiptId) {
    throw new Error('No cash receipt ID stored. Ensure Background step runs first.');
  }
  const applyPage = new CashReceiptApplyPage(page);
  await applyPage.goto(receiptId);
  await applyPage.verifyPageLoaded();
  await page.waitForTimeout(800);
  // Wait for invoice list: ensure second invoice row (card) is visible so we can select it by number (TC-005)
  const outstandingInvoices = (this as any).outstandingInvoices as OutstandingInvoiceRow[] | undefined;
  if (outstandingInvoices && outstandingInvoices.length >= 2) {
    const secondInvoiceNumber = outstandingInvoices[1].invoice_number;
    const escaped = secondInvoiceNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const row = page.locator('div.relative.border-2.rounded-lg').filter({ has: page.getByText(new RegExp(escaped, 'i')) }).filter({ has: page.locator('[role="checkbox"]') }).first();
    await expect(row).toBeVisible({ timeout: 12000 });
  }
  (this as any).cashReceiptApplyPage = applyPage;
});

Then('invoice {string} should be fully paid', async function ({ page }, invoiceSelector: string) {
  const invoiceNumber = await resolveInvoiceNumber(invoiceSelector, this);
  const outstandingInvoices = (this as any).outstandingInvoices as OutstandingInvoiceRow[] | undefined;
  const invoice = outstandingInvoices?.find((inv) => inv.invoice_number?.toLowerCase() === invoiceNumber.toLowerCase());
  const invoiceId = invoice?.id;

  // Prefer DB: invoice balance should be 0 after full application
  if (invoiceId) {
    const balance = await getInvoiceOutstandingBalance(invoiceId);
    expect(Number(balance)).toBe(0);
    return;
  }

  // Fallback: UI on CR detail page — applications table row for this invoice shows zero or "Fully Paid"
  const receiptId = (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  if (receiptId) {
    const detailPage = (this as any).cashReceiptDetailPage || new CashReceiptDetailPage(page);
    await detailPage.goto(receiptId);
    await detailPage.verifyPageLoaded();
    const applicationsTable = page.locator('table').filter({ has: page.locator('th').filter({ hasText: 'Invoice' }) }).first();
    await expect(applicationsTable).toBeVisible({ timeout: 10000 });
    const rowContainingInvoice = applicationsTable.locator('tr').filter({ hasText: new RegExp(invoiceNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') });
    await expect(rowContainingInvoice).toBeVisible({ timeout: 5000 });
    await expect(rowContainingInvoice.getByText(/0|Fully Paid|Paid|₹\s*0/i)).toBeVisible({ timeout: 5000 });
  }
});

Then('the remembered invoice should be fully paid', async function ({ page }) {
  const targetInvoiceNumber = (this as any).targetInvoiceNumber as string | undefined;
  if (!targetInvoiceNumber) {
    throw new Error('No remembered target invoice found. Run "I remember invoice ..." first.');
  }

  const outstandingInvoices = (this as any).outstandingInvoices as OutstandingInvoiceRow[] | undefined;
  const invoice = outstandingInvoices?.find(
    (inv) => inv.invoice_number?.toLowerCase() === targetInvoiceNumber.toLowerCase()
  );
  const invoiceId = invoice?.id;

  if (invoiceId) {
    const balance = await getInvoiceOutstandingBalance(invoiceId);
    expect(Number(balance)).toBe(0);
    return;
  }

  const receiptId = (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  if (receiptId) {
    const detailPage = (this as any).cashReceiptDetailPage || new CashReceiptDetailPage(page);
    await detailPage.goto(receiptId);
    await detailPage.verifyPageLoaded();
    const applicationsTable = page.locator('table').filter({ has: page.locator('th').filter({ hasText: 'Invoice' }) }).first();
    await expect(applicationsTable).toBeVisible({ timeout: 10000 });
    const rowContainingInvoice = applicationsTable
      .locator('tr')
      .filter({ hasText: new RegExp(targetInvoiceNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') });
    await expect(rowContainingInvoice).toBeVisible({ timeout: 5000 });
    await expect(rowContainingInvoice.getByText(/0|Fully Paid|Paid|₹\s*0/i)).toBeVisible({ timeout: 5000 });
  }
});

Then('the payment should be allocated to remembered invoice', async function ({ page }) {
  const targetInvoiceNumber = (this as any).targetInvoiceNumber as string | undefined;
  if (!targetInvoiceNumber) {
    throw new Error('No remembered target invoice found. Run target invoice selection step first.');
  }

  const detailPage = (this as any).cashReceiptDetailPage || new CashReceiptDetailPage(page);
  const receiptId = (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];

  if (receiptId && page.url().includes('/apply')) {
    await page.waitForURL((u) => !u.href.includes('/apply'), { timeout: 15000, waitUntil: 'domcontentloaded' });
  }

  if (receiptId) {
    const applicationsWithNumbers = await getCashReceiptApplicationsWithInvoiceNumbers(receiptId);
    const hasThisInvoice = applicationsWithNumbers.some(
      (a) => !a.is_reversed && a.invoice_number?.toLowerCase() === targetInvoiceNumber.toLowerCase()
    );
    if (hasThisInvoice) return;

    await detailPage.goto(receiptId);
    await page.reload({ waitUntil: 'networkidle' });
    await detailPage.verifyPageLoaded();
    await detailPage.verifyApplicationCreated(targetInvoiceNumber, 20000);
    return;
  }

  await detailPage.verifyApplicationCreated(targetInvoiceNumber, 15000);
});

Then('invoice {string} should have remaining balance {string}', async function ({ page }, invoiceSelector: string, expectedBalance: string) {
  // Resolve invoice number from selector
  const invoiceNumber = await resolveInvoiceNumber(invoiceSelector, this);
  
  const receiptId = (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  const expected = parseFloat(expectedBalance);
  
  // Verify via UI on detail page
  const detailPage = (this as any).cashReceiptDetailPage || new CashReceiptDetailPage(page);
  if (receiptId) await detailPage.goto(receiptId);
  
  // Check applications table shows invoice with expected balance
  const invoiceRow = page.locator('table').getByText(invoiceNumber, { exact: false });
  await expect(invoiceRow).toBeVisible({ timeout: 5000 });
  // Verify balance text contains expected amount (allowing for formatting)
  const balanceText = await invoiceRow.getByText(new RegExp(String(expected), 'i')).textContent().catch(() => '');
  expect(balanceText).toBeTruthy();
});

Then('the unapplied balance should decrease by {string}', async function ({ page }, amount: string) {
  const receiptId = (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  if (!receiptId) return;
  
  // Get cash receipt before and after (Sandwich Method)
  const receiptBefore = await getCashReceiptById(receiptId);
  if (!receiptBefore) return;
  
  const expectedDecrease = parseFloat(amount);
  const expectedUnapplied = receiptBefore.amount_unapplied - expectedDecrease;
  
  // Verify via DB
  const receiptAfter = await getCashReceiptById(receiptId);
  expect(receiptAfter).not.toBeNull();
  expect(receiptAfter!.amount_unapplied).toBeCloseTo(expectedUnapplied, 2);
  
  // Also verify via UI if on detail page
  const detailPage = (this as any).cashReceiptDetailPage;
  if (detailPage) {
    await expect(page.getByText(new RegExp(String(expectedUnapplied), 'i'))).toBeVisible({ timeout: 5000 }).catch(() => {});
  }
});

When('I fill cash receipt form with customer {string} and amount {string}', async function ({ page }, customerName: string, amount: string) {
  const newReceiptPage = (this as any).newCashReceiptPage || new NewCashReceiptPage(page);
  if (!(this as any).newCashReceiptPage) await newReceiptPage.verifyPageLoaded();
  
  // Fill form using the same customer as O2C E2E tests
  console.log(`📝 Selecting customer: "${customerName}"`);
  await newReceiptPage.selectCustomer(customerName);
  
  // Fill other required fields
  const today = new Date().toISOString().split('T')[0];
  console.log(`📅 Setting receipt date: ${today}`);
  await newReceiptPage.setReceiptDate(today);
  
  console.log(`💳 Selecting payment method: cheque`);
  await newReceiptPage.selectPaymentMethod('cheque');
  
  console.log(`💰 Setting receipt amount: ${amount}`);
  await newReceiptPage.setTotalAmount(parseFloat(amount));
  
  // Bank Account: SearchableSelectDialog - click "Select bank account..." → dialog → click first Select
  console.log(`🏦 Selecting bank account...`);
  await newReceiptPage.selectBankAccount();
  console.log(`✅ Bank account selected`);
  
  console.log(`📅 Setting deposit date: ${today}`);
  await newReceiptPage.setDepositDate(today);
  
  const referenceNo = `AUTO_QA_${Date.now()}`;
  console.log(`🔖 Setting payment reference: ${referenceNo}`);
  await newReceiptPage.setPaymentReference(referenceNo);
  
  (this as any).newCashReceiptPage = newReceiptPage;
  console.log(`✅ Form filled successfully`);
});

When('I save the cash receipt', async function ({ page }) {
  const newReceiptPage = (this as any).newCashReceiptPage || new NewCashReceiptPage(page);
  await newReceiptPage.save();
  
  // Store receipt ID from URL after successful creation
  await expect(page).toHaveURL(/\/finance\/cash-receipts\/[a-f0-9-]+/, { timeout: 15000 });
  const receiptId = page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  if (receiptId) {
    (this as any).currentCashReceiptId = receiptId;
  }
});

When('I attempt to save the cash receipt', async function ({ page }) {
  const newReceiptPage = (this as any).newCashReceiptPage || new NewCashReceiptPage(page);
  if (!(this as any).newCashReceiptPage) await newReceiptPage.verifyPageLoaded();
  await newReceiptPage.clickSave();
});

When(
  'I fill cash receipt required fields with customer {string}, payment method {string} and amount {string} without bank account',
  async function ({ page }, customerName: string, paymentMethod: string, amount: string) {
    const newReceiptPage = (this as any).newCashReceiptPage || new NewCashReceiptPage(page);
    if (!(this as any).newCashReceiptPage) await newReceiptPage.verifyPageLoaded();

    const today = new Date().toISOString().split('T')[0];
    await newReceiptPage.selectCustomer(customerName);
    await newReceiptPage.setReceiptDate(today);
    await newReceiptPage.selectPaymentMethod(paymentMethod);
    await newReceiptPage.setTotalAmount(parseFloat(amount));
    await newReceiptPage.setDepositDate(today);
    await newReceiptPage.setPaymentReference(`AUTO_QA_${Date.now()}`);

    // Intentionally skip bank account selection for validation scenario.
    (this as any).newCashReceiptPage = newReceiptPage;
  }
);

Then('I should see cash receipt form error containing {string}', async function ({ page }, messagePart: string) {
  const matcher = new RegExp(messagePart, 'i');
  const alertError = page.getByRole('alert').filter({ hasText: matcher }).first();
  const toastError = page.locator('[data-sonner-toast]').filter({ hasText: matcher }).first();
  const inlineError = page.getByText(matcher).first();

  if (await alertError.isVisible()) return;
  if (await toastError.isVisible()) return;
  await expect(inlineError).toBeVisible({ timeout: 8000 });
});
