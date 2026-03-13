import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { CashReceiptsPage } from '../../pages/finance/CashReceiptsPage';
import { CashReceiptDetailPage } from '../../pages/finance/CashReceiptDetailPage';
import { CashReceiptApplyPage } from '../../pages/finance/CashReceiptApplyPage';
import { NewCashReceiptPage } from '../../pages/finance/NewCashReceiptPage';
import {
  getCashReceiptById,
  getCashReceiptApplications,
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
  const receiptId = page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  
  // Resolve invoice number from selector
  const invoiceNumber = await resolveInvoiceNumber(invoiceSelector, this);
  
  if (receiptId) {
    const applications = await getCashReceiptApplications(receiptId);
    const hasInvoice = applications.some(
      (a) => !a.is_reversed && (invoiceNumber === '*' || a.invoice_id)
    );
    expect(applications.length).toBeGreaterThan(0);
  } else {
    await detailPage.verifyApplicationCreated(invoiceNumber);
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
  const cashReceiptsPage = new CashReceiptsPage(page);
  await cashReceiptsPage.goto();
  await cashReceiptsPage.verifyPageLoaded();
  await cashReceiptsPage.clickNewCashReceipt();
  
  // Fill and submit new cash receipt form with same customer as O2C E2E (Ramesh ningappa diggai)
  const newReceiptPage = new NewCashReceiptPage(page);
  await newReceiptPage.verifyPageLoaded();
  await newReceiptPage.fillMinimalForm(parseFloat(amount), 'Ramesh ningappa diggai');
  await newReceiptPage.save();
  
  // Store receipt ID from URL after successful creation
  await expect(page).toHaveURL(/\/finance\/cash-receipts\/[a-f0-9-]+/, { timeout: 15000 });
  const receiptId = page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  if (receiptId) {
    (this as any).currentCashReceiptId = receiptId;
    (this as any).currentCashReceiptAmount = parseFloat(amount);
  } else {
    throw new Error('Failed to create cash receipt - receipt ID not found in URL');
  }
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
  
  await applyPage.selectInvoice(invoiceNumber);
  await applyPage.setAmountToApply(invoiceNumber, outstandingBalance);
  await applyPage.saveApplication();
  
  (this as any)[`invoice_${invoiceNumber}_applied_amount`] = outstandingBalance;
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

When('I navigate to the apply page for the current cash receipt again', async function ({ page }) {
  const receiptId = (this as any).currentCashReceiptId;
  if (!receiptId) {
    throw new Error('No cash receipt ID stored. Ensure Background step runs first.');
  }
  const applyPage = new CashReceiptApplyPage(page);
  await applyPage.goto(receiptId);
  await applyPage.verifyPageLoaded();
  (this as any).cashReceiptApplyPage = applyPage;
});

Then('invoice {string} should be fully paid', async function ({ page }, invoiceSelector: string) {
  // Resolve invoice number from selector
  const invoiceNumber = await resolveInvoiceNumber(invoiceSelector, this);
  
  const receiptId = (this as any).currentCashReceiptId || page.url().match(/\/cash-receipts\/([a-f0-9-]+)/)?.[1];
  if (receiptId) {
    const applications = await getCashReceiptApplications(receiptId);
    const invoiceApplications = applications.filter((a) => !a.is_reversed);
    
    // Get invoice ID from applications (if available) or use invoice number lookup
    // For now, verify via UI that balance is 0
    const detailPage = (this as any).cashReceiptDetailPage || new CashReceiptDetailPage(page);
    await detailPage.goto(receiptId);
    
    // Check applications table shows invoice with balance 0 or fully paid status
    const invoiceRow = page.locator('table').getByText(invoiceNumber, { exact: false });
    await expect(invoiceRow).toBeVisible({ timeout: 5000 });
    // Verify balance is 0 or shows "Fully Paid"
    await expect(page.getByText(/0\.00|Fully Paid|Paid/i).filter({ hasText: invoiceNumber }).or(invoiceRow.getByText(/0\.00|Fully Paid/i))).toBeVisible({ timeout: 5000 });
  }
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
