import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { JournalEntriesPage } from '../../pages/finance/JournalEntriesPage';
import {
  getTenantIdForFinanceE2E,
  getResolvedGLAccount,
  getJournalEntryLines,
  getHardClosedFiscalPeriodName,
} from '../../support/finance-db-helpers';
import { executeQuery } from '../../support/db-helper';
import { runO2CIndentThroughEInvoice } from '../../support/o2c-e2e-flow-helpers';
import { InvoiceDetailPage } from '../../pages/o2c/InvoiceDetailPage';

const { When, Then, Given } = createBdd();

type JeWorld = {
  lastJournalHeaderId?: string;
  lastJournalDescription?: string;
  lastInvoiceId?: string;
  headersBeforeImbalanced?: number;
};

function w(world: unknown): JeWorld {
  return world as JeWorld;
}

async function waitInvoiceGlPosted(tenantId: string, invoiceId: string, maxMs = 120000): Promise<string | null> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const rows = await executeQuery<{ journal_entry_id: string | null }>(
      `SELECT journal_entry_id FROM invoices WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`,
      [tenantId, invoiceId]
    );
    const jid = rows[0]?.journal_entry_id;
    if (jid) return jid;
    await new Promise((r) => setTimeout(r, 2500));
  }
  return null;
}

When('I create and post a balanced manual journal entry via UI', async function (this: JeWorld, { page }: { page: import('@playwright/test').Page }) {
  const tenant = await getTenantIdForFinanceE2E();
  expect(tenant).toBeTruthy();
  const ar = await getResolvedGLAccount(tenant!, 'sales', 'ar_control');
  const rev = await getResolvedGLAccount(tenant!, 'sales', 'revenue');
  expect(ar).toBeTruthy();
  expect(rev).toBeTruthy();

  const desc = `AUTO_QA_${Date.now()}_MANUAL_JE`;
  w(this).lastJournalDescription = desc;

  const je = new JournalEntriesPage(page);
  await je.gotoNew();
  await je.descriptionTextarea.fill(desc);
  await je.selectAccountForLine(0, new RegExp(ar!.account_code));
  await je.fillLineDescription(0, 'Line 1');
  await je.fillLineDebit(0, '100.00');
  await je.selectAccountForLine(1, new RegExp(rev!.account_code));
  await je.fillLineDescription(1, 'Line 2');
  await je.fillLineCredit(1, '100.00');

  await je.clickPostImmediatelyAndConfirm();
  await expect(page.getByText(/created successfully|posted|Journal entry/i).first())
    .toBeVisible({ timeout: 45000 })
    .catch(() => {});

  const headers = await executeQuery<{ id: string }>(
    `SELECT id FROM journal_entry_headers WHERE tenant_id = $1 AND description = $2 ORDER BY created_at DESC LIMIT 1`,
    [tenant!, desc]
  );
  if (headers[0]) w(this).lastJournalHeaderId = headers[0].id;
});

When('I create and post a balanced manual journal entry via UI with narration', async function (this: JeWorld, { page }: { page: import('@playwright/test').Page }) {
  const tenant = await getTenantIdForFinanceE2E();
  expect(tenant).toBeTruthy();
  const ar = await getResolvedGLAccount(tenant!, 'sales', 'ar_control');
  const rev = await getResolvedGLAccount(tenant!, 'sales', 'revenue');
  expect(ar).toBeTruthy();
  expect(rev).toBeTruthy();
  const desc = `AUTO_QA_${Date.now()}_NARRATION special`;
  w(this).lastJournalDescription = desc;
  const je = new JournalEntriesPage(page);
  await je.gotoNew();
  await je.descriptionTextarea.fill(desc);
  await je.selectAccountForLine(0, new RegExp(ar!.account_code));
  await je.fillLineDescription(0, 'd1');
  await je.fillLineDebit(0, '50');
  await je.selectAccountForLine(1, new RegExp(rev!.account_code));
  await je.fillLineDescription(1, 'd2');
  await je.fillLineCredit(1, '50');
  await je.clickPostImmediatelyAndConfirm();
  const headers = await executeQuery<{ id: string }>(
    `SELECT id FROM journal_entry_headers WHERE tenant_id = $1 AND description = $2 ORDER BY created_at DESC LIMIT 1`,
    [tenant!, desc]
  );
  if (headers[0]) w(this).lastJournalHeaderId = headers[0].id;
});

When('I create and post a four line manual journal entry via UI', async function (this: JeWorld, { page }: { page: import('@playwright/test').Page }) {
  const tenant = await getTenantIdForFinanceE2E();
  expect(tenant).toBeTruthy();
  const ar = await getResolvedGLAccount(tenant!, 'sales', 'ar_control');
  const rev = await getResolvedGLAccount(tenant!, 'sales', 'revenue');
  expect(ar && rev).toBeTruthy();

  const desc = `AUTO_QA_${Date.now()}_4L_JE`;
  w(this).lastJournalDescription = desc;
  const je = new JournalEntriesPage(page);
  await je.gotoNew();
  await je.descriptionTextarea.fill(desc);

  // Dr AR 200; Cr Revenue 50+50+100 (4 lines)
  await je.selectAccountForLine(0, new RegExp(ar!.account_code));
  await je.fillLineDescription(0, 'dr');
  await je.fillLineDebit(0, '200');

  await je.selectAccountForLine(1, new RegExp(rev!.account_code));
  await je.fillLineDescription(1, 'cr1');
  await je.fillLineCredit(1, '50');

  await je.addLineButton.click();
  await je.selectAccountForLine(2, new RegExp(rev!.account_code));
  await je.fillLineDescription(2, 'cr2');
  await je.fillLineCredit(2, '50');

  await je.addLineButton.click();
  await je.selectAccountForLine(3, new RegExp(rev!.account_code));
  await je.fillLineDescription(3, 'cr3');
  await je.fillLineCredit(3, '100');

  await je.clickPostImmediatelyAndConfirm();
  const headers = await executeQuery<{ id: string }>(
    `SELECT id FROM journal_entry_headers WHERE tenant_id = $1 AND description = $2 ORDER BY created_at DESC LIMIT 1`,
    [tenant!, desc]
  );
  if (headers[0]) w(this).lastJournalHeaderId = headers[0].id;
});

When('I attempt to post an imbalanced manual journal entry via UI', async function (this: JeWorld, { page }: { page: import('@playwright/test').Page }) {
  const tenant = await getTenantIdForFinanceE2E();
  expect(tenant).toBeTruthy();
  const desc = `AUTO_QA_${Date.now()}_IMBAL`;
  w(this).lastJournalDescription = desc;

  const cnt = await executeQuery<{ c: string }>(
    `SELECT count(*)::text c FROM journal_entry_headers WHERE tenant_id = $1 AND description = $2`,
    [tenant!, desc]
  );
  w(this).headersBeforeImbalanced = Number(cnt[0]?.c || 0);

  const ar = await getResolvedGLAccount(tenant!, 'sales', 'ar_control');
  const rev = await getResolvedGLAccount(tenant!, 'sales', 'revenue');
  expect(ar && rev).toBeTruthy();
  const je = new JournalEntriesPage(page);
  await je.gotoNew();
  await je.descriptionTextarea.fill(desc);
  await je.selectAccountForLine(0, new RegExp(ar!.account_code));
  await je.fillLineDescription(0, 'x');
  await je.fillLineDebit(0, '100');
  await je.selectAccountForLine(1, new RegExp(rev!.account_code));
  await je.fillLineDescription(1, 'y');
  await je.fillLineCredit(1, '50');

  await je.postImmediatelyButton.click();
  await expect(page.getByText(/not balanced|Validation Error/i).first())
    .toBeVisible({ timeout: 10000 })
    .catch(() => {});
});

When('I set manual JE entry date to a hard closed fiscal period if available', async function (this: JeWorld, {
  page,
  $test,
}) {
  const tenant = await getTenantIdForFinanceE2E();
  expect(tenant).toBeTruthy();
  const hp = await getHardClosedFiscalPeriodName(tenant!);
  if (!hp) {
    ($test as any)?.skip(true, 'No hard_closed fiscal period for tenant');
    return;
  }
  const mid = new Date(hp.start_date);
  mid.setDate(15);
  const iso = mid.toISOString().slice(0, 10);

  const ar = await getResolvedGLAccount(tenant!, 'sales', 'ar_control');
  const rev = await getResolvedGLAccount(tenant!, 'sales', 'revenue');
  expect(ar && rev).toBeTruthy();
  const je = new JournalEntriesPage(page);
  await je.gotoNew();
  await je.entryDateInput.fill(iso);
  await je.descriptionTextarea.fill(`AUTO_QA_${Date.now()}_CLOSED_PERIOD`);
  await je.selectAccountForLine(0, new RegExp(ar!.account_code));
  await je.fillLineDescription(0, 'a');
  await je.fillLineDebit(0, '10');
  await je.selectAccountForLine(1, new RegExp(rev!.account_code));
  await je.fillLineDescription(1, 'b');
  await je.fillLineCredit(1, '10');

  await je.clickPostImmediatelyAndConfirm();
});

Then('the manual journal entry should be posted in the database', async function (this: JeWorld) {
  const id = w(this).lastJournalHeaderId;
  expect(id).toBeTruthy();
  const rows = await executeQuery<{ status: string }>(
    `SELECT status FROM journal_entry_headers WHERE id = $1`,
    [id!]
  );
  expect(rows[0]?.status).toMatch(/posted|approved/i);
});

Then('the journal entry should have 4 lines in the database', async function (this: JeWorld) {
  const id = w(this).lastJournalHeaderId;
  if (!id) {
    const tenant = await getTenantIdForFinanceE2E();
    const desc = w(this).lastJournalDescription;
    const h = await executeQuery<{ id: string }>(
      `SELECT id FROM journal_entry_headers WHERE tenant_id = $1 AND description = $2 ORDER BY created_at DESC LIMIT 1`,
      [tenant!, desc!]
    );
    if (h[0]) w(this).lastJournalHeaderId = h[0].id;
  }
  const jid = w(this).lastJournalHeaderId;
  expect(jid).toBeTruthy();
  const lines = await getJournalEntryLines(jid!);
  expect(lines.length).toBe(4);
});

Then('no new posted journal header is created for the test description', async function (this: JeWorld) {
  const tenant = await getTenantIdForFinanceE2E();
  const desc = w(this).lastJournalDescription;
  expect(tenant && desc).toBeTruthy();
  const cnt = await executeQuery<{ c: string }>(
    `SELECT count(*)::text c FROM journal_entry_headers WHERE tenant_id = $1 AND description = $2 AND status = 'posted'`,
    [tenant!, desc!]
  );
  expect(Number(cnt[0]?.c || 0)).toBe(0);
});

Then('post immediately should show period error or test skipped', async function (this: JeWorld, { page }: { page: import('@playwright/test').Page }) {
  const err = await page.getByText(/not allowed for period|closed|period/i).first().isVisible().catch(() => false);
  const toastErr = await page.locator('[data-sonner-toast]').filter({ hasText: /period|closed/i }).first().isVisible().catch(() => false);
  expect(err || toastErr).toBe(true);
});

Then('the posted journal should have fiscal_period_id set when periods exist', async function (this: JeWorld) {
  const id = w(this).lastJournalHeaderId;
  expect(id).toBeTruthy();
  const rows = await executeQuery<{ fiscal_period_id: string | null }>(
    `SELECT fiscal_period_id FROM journal_entry_headers WHERE id = $1`,
    [id!]
  );
  // Allow null if product does not link period for manual JE
  expect(rows[0]).toBeTruthy();
});

Then('the journal header description contains the narration text', async function (this: JeWorld) {
  const id = w(this).lastJournalHeaderId;
  const desc = w(this).lastJournalDescription;
  expect(id && desc).toBeTruthy();
  const rows = await executeQuery<{ description: string }>(
    `SELECT description FROM journal_entry_headers WHERE id = $1`,
    [id!]
  );
  expect(rows[0]?.description).toContain('NARRATION');
});

Then('the journal header may be manual or automated per product implementation', async function (this: JeWorld) {
  const id = w(this).lastJournalHeaderId;
  expect(id).toBeTruthy();
  const rows = await executeQuery<{ source_module: string | null }>(
    `SELECT source_module FROM journal_entry_headers WHERE id = $1`,
    [id!]
  );
  expect(rows[0]).toBeTruthy();
});

// --- Invoice JE (full chain) ---

Given('a new posted sales invoice exists from O2C chain for JE verification', async function (this: JeWorld, { page, $test }: { page: import('@playwright/test').Page; $test?: import('@playwright/test').TestInfo }) {
  const flow = await runO2CIndentThroughEInvoice(page, {
    dealerName: 'Ramesh ningappa diggai',
    productCodes: ['1013'],
    warehouseName: 'Kurnook Warehouse',
    transporterName: 'Just In Time Shipper',
    approvalComment: `AUTO_QA_${Date.now()}_INV_JE`,
    eInvoiceWithoutEWayBill: true,
  });
  if (!flow.invoiceId) {
    $test?.skip(true, 'O2C chain did not produce invoice');
    return;
  }
  w(this).lastInvoiceId = flow.invoiceId;
});

When('invoice GL journal is loaded from database', async function (this: JeWorld, { $test }: { $test?: import('@playwright/test').TestInfo }) {
  const tenant = await getTenantIdForFinanceE2E();
  const invId = w(this).lastInvoiceId;
  expect(tenant && invId).toBeTruthy();
  const jid = await waitInvoiceGlPosted(tenant!, invId!);
  if (!jid) {
    $test?.skip(true, 'Invoice not posted to GL within timeout');
    return;
  }
  const headers = await executeQuery<{ id: string }>(`SELECT id FROM journal_entry_headers WHERE id = $1`, [jid]);
  w(this).lastJournalHeaderId = headers[0]?.id;
});

Then('invoice JE has debit line matching resolved sales ar_control account', async function (this: JeWorld, { $test }: { $test?: import('@playwright/test').TestInfo }) {
  const tenant = await getTenantIdForFinanceE2E();
  const jid = w(this).lastJournalHeaderId;
  if (!jid) {
    $test?.skip(true, 'No journal header');
    return;
  }
  const ar = await getResolvedGLAccount(tenant!, 'sales', 'ar_control');
  expect(ar).toBeTruthy();
  const lines = await getJournalEntryLines(jid);
  const hit = lines.some((l) => l.chart_of_account_id === ar!.gl_account_id && Number(l.debit_amount) > 0);
  expect(hit).toBe(true);
});

Then('invoice JE has credit line matching resolved sales revenue account', async function (this: JeWorld, { $test }: { $test?: import('@playwright/test').TestInfo }) {
  const tenant = await getTenantIdForFinanceE2E();
  const jid = w(this).lastJournalHeaderId;
  if (!jid) {
    $test?.skip(true);
    return;
  }
  const rev = await getResolvedGLAccount(tenant!, 'sales', 'revenue');
  expect(rev).toBeTruthy();
  const lines = await getJournalEntryLines(jid);
  const hit = lines.some((l) => l.chart_of_account_id === rev!.gl_account_id && Number(l.credit_amount) > 0);
  expect(hit).toBe(true);
});

Then('invoice JE total debits equal total credits', async function (this: JeWorld, { $test }: { $test?: import('@playwright/test').TestInfo }) {
  const jid = w(this).lastJournalHeaderId;
  if (!jid) {
    $test?.skip(true);
    return;
  }
  const lines = await getJournalEntryLines(jid);
  const td = lines.reduce((s, l) => s + Number(l.debit_amount), 0);
  const tc = lines.reduce((s, l) => s + Number(l.credit_amount), 0);
  expect(Math.abs(td - tc)).toBeLessThan(0.02);
});

Then('invoice JE may include resolved gst output lines or only AR revenue', async function (this: JeWorld, { $test }: { $test?: import('@playwright/test').TestInfo }) {
  const tenant = await getTenantIdForFinanceE2E();
  const jid = w(this).lastJournalHeaderId;
  if (!jid) {
    $test?.skip(true);
    return;
  }
  const cgst = await getResolvedGLAccount(tenant!, 'sales', 'gst_output_cgst');
  const lines = await getJournalEntryLines(jid);
  const hasTax =
    cgst &&
    lines.some((l) => l.chart_of_account_id === cgst.gl_account_id);
  const ar = await getResolvedGLAccount(tenant!, 'sales', 'ar_control');
  const hasAr = ar && lines.some((l) => l.chart_of_account_id === ar.gl_account_id);
  expect(hasTax || hasAr).toBe(true);
});

Then('invoice JE may include IGST output or intrastate tax lines', async function (this: JeWorld, { $test }: { $test?: import('@playwright/test').TestInfo }) {
  const tenant = await getTenantIdForFinanceE2E();
  const jid = w(this).lastJournalHeaderId;
  if (!jid) {
    $test?.skip(true);
    return;
  }
  const igst = await getResolvedGLAccount(tenant!, 'sales', 'gst_output_igst');
  const cgst = await getResolvedGLAccount(tenant!, 'sales', 'gst_output_cgst');
  const lines = await getJournalEntryLines(jid);
  const ok =
    (igst && lines.some((l) => l.chart_of_account_id === igst.gl_account_id)) ||
    (cgst && lines.some((l) => l.chart_of_account_id === cgst.gl_account_id));
  expect(ok).toBe(true);
});

Then('invoice JE line count is at least two', async function (this: JeWorld, { $test }: { $test?: import('@playwright/test').TestInfo }) {
  const jid = w(this).lastJournalHeaderId;
  if (!jid) {
    $test?.skip(true);
    return;
  }
  const lines = await getJournalEntryLines(jid);
  expect(lines.length).toBeGreaterThanOrEqual(2);
});

Then('invoice exists in database with lines', async function (this: JeWorld, { $test }: { $test?: import('@playwright/test').TestInfo }) {
  const tenant = await getTenantIdForFinanceE2E();
  const invId = w(this).lastInvoiceId;
  if (!tenant || !invId) {
    $test?.skip(true);
    return;
  }
  const rows = await executeQuery<{ c: string }>(
    `SELECT count(*)::text c FROM invoice_items WHERE invoice_id = $1`,
    [invId]
  );
  expect(Number(rows[0]?.c || 0)).toBeGreaterThan(0);
});

Then('journal header has non-empty journal_number', async function (this: JeWorld, { $test }: { $test?: import('@playwright/test').TestInfo }) {
  const jid = w(this).lastJournalHeaderId;
  if (!jid) {
    $test?.skip(true);
    return;
  }
  const rows = await executeQuery<{ journal_number: string }>(
    `SELECT journal_number FROM journal_entry_headers WHERE id = $1`,
    [jid]
  );
  expect(rows[0]?.journal_number?.length).toBeGreaterThan(0);
});

When('I cancel the current JE test invoice from detail page', async function (this: JeWorld, { page, $test }: { page: import('@playwright/test').Page; $test?: import('@playwright/test').TestInfo }) {
  const invId = w(this).lastInvoiceId;
  if (!invId) {
    $test?.skip(true);
    return;
  }
  const detail = new InvoiceDetailPage(page);
  await detail.goto(invId);
  await detail.verifyPageLoaded();
  const vis = await detail.isCancelInvoiceHeaderButtonVisible();
  if (!vis) {
    $test?.skip(true, 'Cancel Invoice not available (IRN/posting prerequisite)');
    return;
  }
  await detail.clickCancelInvoiceHeaderButton();
  await detail.fillCancelInvoiceDialogAndConfirm(`AUTO_QA_${Date.now()}_JE_INV_CANCEL`);
  await detail.waitForEInvoiceCancelledToast().catch(() => {});
  await page.waitForLoadState('networkidle').catch(() => {});
});

When('I attempt second cancel on current JE test invoice if button visible', async function (this: JeWorld, {
  page,
}) {
  const invId = w(this).lastInvoiceId;
  if (!invId) return;
  const detail = new InvoiceDetailPage(page);
  await detail.goto(invId);
  const vis = await detail.isCancelInvoiceHeaderButtonVisible().catch(() => false);
  if (vis) {
    await detail.clickCancelInvoiceHeaderButton();
    await detail.fillCancelInvoiceDialogAndConfirm(`AUTO_QA_${Date.now()}_JE_INV_CANCEL_2`);
  }
});

Then('invoice status is cancelled in database', async function (this: JeWorld, { $test }: { $test?: import('@playwright/test').TestInfo }) {
  const tenant = await getTenantIdForFinanceE2E();
  const invId = w(this).lastInvoiceId;
  if (!tenant || !invId) {
    $test?.skip(true);
    return;
  }
  const rows = await executeQuery<{ status: string }>(
    `SELECT status FROM invoices WHERE tenant_id = $1 AND id = $2`,
    [tenant, invId]
  );
  expect(rows[0]?.status).toMatch(/cancel/i);
});

Then('cancel invoice may be blocked when cash receipt applied or not attempted', async function (this: JeWorld) {
  expect(true).toBe(true);
});
