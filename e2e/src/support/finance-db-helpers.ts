/**
 * Finance module database helpers for Cash Receipts and VAN payment verification.
 * Read-only SELECT queries for Sandwich Method verification.
 *
 * Tables: cash_receipt_headers, cash_receipt_applications, van_payment_collections,
 *         epd_discount_slabs, tenant_settings (EPD config).
 */

import { executeQuery, executeDeleteEpdSlabForTestCleanup, executeUpdateEpdSlabDiscountForTestCleanup } from './db-helper';

export interface CashReceiptRow {
  id: string;
  receipt_number: string;
  receipt_date: string;
  customer_id: string;
  total_receipt_amount: number;
  amount_applied: number;
  amount_unapplied: number;
  status: string;
  gl_journal_id: string | null;
  created_at: string;
}

export interface CashReceiptApplicationRow {
  id: string;
  cash_receipt_id: string;
  invoice_id: string;
  amount_applied: number;
  discount_taken: number;
  application_date: string;
  is_reversed: boolean;
  discount_type: string | null;
  was_within_epd_period: boolean | null;
}

export interface CashReceiptApplicationTotals {
  active_applications_count: number;
  total_amount_applied: number;
  total_discount_taken: number;
}

export interface VANPaymentCollectionRow {
  id: string;
  utr: string;
  tran_id: string | null;
  bene_acc_no: string;
  status: string;
  amount: number;
  dealer_id: string | null;
  cash_receipt_id: string | null;
  created_at: string;
}

export interface CashReceiptApplicationWithInvoiceDate extends CashReceiptApplicationRow {
  invoice_number: string | null;
  invoice_date: string | null;
}

export interface EPDDiscountSlabRow {
  id: string;
  tenant_id: string;
  days_from: number;
  days_to: number;
  discount_percentage: number;
  is_active: boolean;
}

export interface OutstandingInvoiceRow {
  id: string;
  invoice_number: string;
  dealer_id: string;
  dealer_name: string;
  invoice_date: string;
  due_date: string | null;
  total_amount: number;
  allocated_amount: number;
  paid_amount: number;
  balance_amount: number;
  collection_status: string;
  early_payment_discount_percentage: number | null;
  early_payment_due_date: string | null;
}

export interface CreditMemoRow {
  id: string;
  credit_memo_number: string;
  customer_id: string;
  total_credit_amount: number;
  credit_applied: number;
  credit_available: number;
  status: string;
  gl_posted: boolean;
  gl_journal_id: string | null;
  created_at: string;
}

export interface CreditMemoApplicationRow {
  id: string;
  credit_memo_id: string;
  invoice_id: string;
  amount_applied: number;
  is_reversed: boolean;
  application_date: string;
}

export interface DealerAdvanceRow {
  id: string;
  dealer_id: string;
  advance_number: string;
  amount: number;
  available_balance: number;
  source_type: string;
  source_reference: string | null;
  created_at: string;
}

/**
 * Get cash receipt by ID.
 */
export async function getCashReceiptById(id: string): Promise<CashReceiptRow | null> {
  const rows = await executeQuery<CashReceiptRow>(
    `SELECT id, receipt_number, receipt_date, customer_id, total_receipt_amount,
            amount_applied, amount_unapplied, status, gl_journal_id, created_at
     FROM cash_receipt_headers
     WHERE id = $1`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Get applications for a cash receipt (active first, then by date desc).
 * Note: Column name is cash_receipt_header_id (not cash_receipt_id).
 */
export async function getCashReceiptApplications(cashReceiptId: string): Promise<CashReceiptApplicationRow[]> {
  return executeQuery<CashReceiptApplicationRow>(
    `SELECT id, cash_receipt_header_id as cash_receipt_id, invoice_id, amount_applied, discount_taken,
            application_date, is_reversed, discount_type, was_within_epd_period
     FROM cash_receipt_applications
     WHERE cash_receipt_header_id = $1
     ORDER BY is_reversed ASC, application_date DESC`,
    [cashReceiptId]
  );
}

/**
 * Get aggregate totals of active (non-reversed) cash receipt applications.
 */
export async function getCashReceiptApplicationTotals(
  cashReceiptId: string
): Promise<CashReceiptApplicationTotals> {
  const rows = await executeQuery<{
    active_applications_count: string | number | null;
    total_amount_applied: string | number | null;
    total_discount_taken: string | number | null;
  }>(
    `SELECT
       COUNT(*) FILTER (WHERE is_reversed = false) AS active_applications_count,
       COALESCE(SUM(amount_applied) FILTER (WHERE is_reversed = false), 0) AS total_amount_applied,
       COALESCE(SUM(discount_taken) FILTER (WHERE is_reversed = false), 0) AS total_discount_taken
     FROM cash_receipt_applications
     WHERE cash_receipt_header_id = $1`,
    [cashReceiptId]
  );

  const row = rows[0] || {
    active_applications_count: 0,
    total_amount_applied: 0,
    total_discount_taken: 0,
  };

  return {
    active_applications_count: Number(row.active_applications_count || 0),
    total_amount_applied: Number(row.total_amount_applied || 0),
    total_discount_taken: Number(row.total_discount_taken || 0),
  };
}

/** Application row with invoice_number from join (for matching by number when invoice_id alignment is unclear). */
export interface CashReceiptApplicationWithInvoiceNumber extends CashReceiptApplicationRow {
  invoice_number: string;
}

/**
 * Get applications for a cash receipt with invoice_number (join invoices) for allocation checks by invoice number.
 */
export async function getCashReceiptApplicationsWithInvoiceNumbers(
  cashReceiptId: string
): Promise<CashReceiptApplicationWithInvoiceNumber[]> {
  return executeQuery<CashReceiptApplicationWithInvoiceNumber>(
    `SELECT cra.id, cra.cash_receipt_header_id as cash_receipt_id, cra.invoice_id, cra.amount_applied, cra.discount_taken,
            cra.application_date, cra.is_reversed, cra.discount_type, cra.was_within_epd_period,
            i.invoice_number
     FROM cash_receipt_applications cra
     LEFT JOIN invoices i ON i.id = cra.invoice_id
     WHERE cra.cash_receipt_header_id = $1
     ORDER BY cra.is_reversed ASC, cra.application_date DESC`,
    [cashReceiptId]
  );
}

/**
 * Get invoice outstanding balance from invoices.balance_amount.
 */
export async function getInvoiceOutstandingBalance(invoiceId: string): Promise<number | null> {
  const rows = await executeQuery<{ balance_amount: number }>(
    `SELECT balance_amount FROM invoices WHERE id = $1`,
    [invoiceId]
  );
  if (rows.length === 0) return null;
  return Number(rows[0].balance_amount);
}

/**
 * Get credit memo by ID.
 */
export async function getCreditMemoById(id: string): Promise<CreditMemoRow | null> {
  const rows = await executeQuery<CreditMemoRow>(
    `SELECT id, credit_memo_number, customer_id, total_credit_amount, credit_applied, credit_available, status,
            COALESCE(gl_posted, false) AS gl_posted, gl_journal_id, created_at
     FROM credit_memos
     WHERE id = $1`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Get credit memo applications (active first).
 */
export async function getCreditMemoApplications(creditMemoId: string): Promise<CreditMemoApplicationRow[]> {
  return executeQuery<CreditMemoApplicationRow>(
    `SELECT id, credit_memo_id, invoice_id, amount_applied, is_reversed, application_date
     FROM credit_memo_applications
     WHERE credit_memo_id = $1
     ORDER BY is_reversed ASC, application_date DESC`,
    [creditMemoId]
  );
}

/**
 * Get latest dealer advance for a specific credit memo number (source_reference).
 */
export async function getLatestDealerAdvanceForCreditMemo(
  dealerId: string,
  creditMemoNumber: string
): Promise<DealerAdvanceRow | null> {
  const rows = await executeQuery<DealerAdvanceRow>(
    `SELECT id, dealer_id, advance_number, amount, available_balance, source_type, source_reference, created_at
     FROM dealer_advances
     WHERE dealer_id = $1
       AND source_type = 'credit_memo'
       AND source_reference = $2
     ORDER BY created_at DESC
     LIMIT 1`,
    [dealerId, creditMemoNumber]
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Get invoice number by invoice ID (for E2E apply page selection).
 */
export async function getInvoiceNumberById(invoiceId: string): Promise<string | null> {
  const rows = await executeQuery<{ invoice_number: string }>(
    `SELECT invoice_number FROM invoices WHERE id = $1`,
    [invoiceId]
  );
  return rows.length > 0 ? rows[0].invoice_number : null;
}

/**
 * Get VAN payment collection by UTR.
 */
export async function getVANPaymentByUTR(utr: string): Promise<VANPaymentCollectionRow | null> {
  const rows = await executeQuery<VANPaymentCollectionRow>(
    `SELECT id, utr, tran_id,
            virtual_account_number as bene_acc_no,
            posting_status as status,
            txn_amount as amount,
            dealer_id,
            cash_receipt_header_id as cash_receipt_id,
            created_at
     FROM van_payment_collections
     WHERE (
        UPPER(REGEXP_REPLACE(COALESCE(utr, ''), '[^A-Z0-9]', '', 'g')) =
        UPPER(REGEXP_REPLACE(COALESCE($1, ''), '[^A-Z0-9]', '', 'g'))
     )
     OR (
        UPPER(REGEXP_REPLACE(COALESCE(tran_id, ''), '[^A-Z0-9]', '', 'g')) =
        UPPER(REGEXP_REPLACE(COALESCE($1, ''), '[^A-Z0-9]', '', 'g'))
     )
     ORDER BY created_at DESC
     LIMIT 1`,
    [utr]
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Get VAN payment collection by transaction ID.
 */
export async function getVANPaymentByTransactionId(tranId: string): Promise<VANPaymentCollectionRow | null> {
  const rows = await executeQuery<VANPaymentCollectionRow>(
    `SELECT id, utr, tran_id,
            virtual_account_number as bene_acc_no,
            posting_status as status,
            txn_amount as amount,
            dealer_id,
            cash_receipt_header_id as cash_receipt_id,
            created_at
     FROM van_payment_collections
     WHERE tran_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [tranId]
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Get the latest posted/success VAN payment that has a linked cash receipt.
 */
export async function getLatestPostedVANPayment(): Promise<VANPaymentCollectionRow | null> {
  const rows = await executeQuery<VANPaymentCollectionRow>(
    `SELECT id, utr, tran_id,
            virtual_account_number as bene_acc_no,
            posting_status as status,
            txn_amount as amount,
            dealer_id,
            cash_receipt_header_id as cash_receipt_id,
            created_at
     FROM van_payment_collections
     WHERE lower(coalesce(posting_status, '')) IN ('posted', 'success')
       AND cash_receipt_header_id IS NOT NULL
     ORDER BY created_at DESC
     LIMIT 1`
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function getCashReceiptApplicationsWithInvoiceDates(
  cashReceiptId: string
): Promise<CashReceiptApplicationWithInvoiceDate[]> {
  return executeQuery<CashReceiptApplicationWithInvoiceDate>(
    `SELECT cra.id,
            cra.cash_receipt_header_id as cash_receipt_id,
            cra.invoice_id,
            cra.amount_applied,
            cra.discount_taken,
            cra.application_date,
            cra.is_reversed,
            cra.discount_type,
            cra.was_within_epd_period,
            i.invoice_number,
            i.invoice_date
     FROM cash_receipt_applications cra
     LEFT JOIN invoices i ON i.id = cra.invoice_id
     WHERE cra.cash_receipt_header_id = $1
     ORDER BY cra.application_date ASC`,
    [cashReceiptId]
  );
}

/**
 * Get dealer mapped to a VAN (via van_dealer_mappings).
 */
export async function getDealerByVAN(van: string): Promise<{ dealer_id: string; business_name: string } | null> {
  const rows = await executeQuery<{ dealer_id: string; business_name: string }>(
    `SELECT vdm.dealer_id, d.business_name
     FROM van_dealer_mappings vdm
     JOIN dealers d ON d.id = vdm.dealer_id
     WHERE vdm.van_number = $1 AND vdm.is_active = true AND d.is_active = true
     LIMIT 1`,
    [van]
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Get EPD discount slabs for a tenant.
 */
export async function getEPDSlabsForTenant(tenantId: string): Promise<EPDDiscountSlabRow[]> {
  return executeQuery<EPDDiscountSlabRow>(
    `SELECT id, tenant_id, days_from, days_to, discount_percentage, is_active
     FROM epd_discount_slabs
     WHERE tenant_id = $1 AND is_active = true
     ORDER BY days_from ASC`,
    [tenantId]
  );
}

/**
 * Get EPD discount slab(s) for a tenant matching a specific days range (any is_active).
 * Use to check if a slab exists before create or before test cleanup delete.
 */
export async function getEPDSlabsByDaysRange(
  tenantId: string,
  daysFrom: number,
  daysTo: number
): Promise<EPDDiscountSlabRow[]> {
  return executeQuery<EPDDiscountSlabRow>(
    `SELECT id, tenant_id, days_from, days_to, discount_percentage, is_active
     FROM epd_discount_slabs
     WHERE tenant_id = $1 AND days_from = $2 AND days_to = $3
     ORDER BY is_active DESC`,
    [tenantId, daysFrom, daysTo]
  );
}

/**
 * Resolve tenant_id for Finance E2E (IACS_TENANT_ID, E2E_TENANT_ID, or query by name 'IACS').
 */
export async function getTenantIdForFinanceE2E(): Promise<string | null> {
  const fromIacs = process.env.IACS_TENANT_ID;
  if (fromIacs) return fromIacs;
  const fromE2e = process.env.E2E_TENANT_ID;
  if (fromE2e) return fromE2e;
  try {
    const rows = await executeQuery<{ id: string }>(
      "SELECT id FROM tenants WHERE name ILIKE $1 LIMIT 1",
      ['IACS']
    );
    return rows.length > 0 ? rows[0].id : null;
  } catch {
    return null;
  }
}

/**
 * Test cleanup only: delete epd_discount_slabs row(s) for the given tenant and days range.
 * Use so E2E can re-run add-slab scenarios (e.g. 91-99) without "overlaps with existing range".
 *
 * @param tenantId - Tenant UUID
 * @param daysFrom - days_from (e.g. 91)
 * @param daysTo - days_to (e.g. 99)
 * @returns Number of rows deleted
 */
export async function deleteEPDSlabsByDaysRangeForTestCleanup(
  tenantId: string,
  daysFrom: number,
  daysTo: number
): Promise<number> {
  return executeDeleteEpdSlabForTestCleanup(tenantId, daysFrom, daysTo);
}

/**
 * Get dealer (customer) id by business name for a tenant (ILIKE match).
 * Used to resolve customer for CR creation (e.g. "Ramesh ningappa diggai").
 */
export async function getDealerIdByBusinessName(
  tenantId: string,
  businessName: string
): Promise<string | null> {
  const rows = await executeQuery<{ id: string }>(
    `SELECT id FROM master_dealers WHERE tenant_id = $1 AND business_name ILIKE $2 LIMIT 1`,
    [tenantId, businessName]
  );
  return rows.length > 0 ? rows[0].id : null;
}

/**
 * Resolve dealer UUID by dealer_code (Dealer Outstanding report row key).
 */
export async function getDealerIdByDealerCode(
  tenantId: string,
  dealerCode: string
): Promise<string | null> {
  const code = dealerCode.trim();
  if (!code) return null;
  const rows = await executeQuery<{ id: string }>(
    `SELECT id FROM master_dealers WHERE tenant_id = $1 AND dealer_code = $2 LIMIT 1`,
    [tenantId, code]
  );
  return rows.length > 0 ? rows[0].id : null;
}

/**
 * Sum invoice balance_amount for Dealer Outstanding report (matches getDealerOutstandingReport invoice query).
 */
export async function sumDealerOutstandingGrossFromInvoices(
  tenantId: string,
  dealerId: string,
  asOfDateStr: string
): Promise<number> {
  const rows = await executeQuery<{ s: string }>(
    `SELECT COALESCE(SUM(balance_amount), 0)::text AS s
     FROM invoices
     WHERE tenant_id = $1
       AND dealer_id = $2
       AND balance_amount > 0
       AND deleted_at IS NULL
       AND status NOT IN ('draft', 'cancelled')
       AND invoice_date <= $3::date`,
    [tenantId, dealerId, asOfDateStr]
  );
  return Number(rows[0]?.s || 0);
}

/**
 * Invoice balance for reconciliation (drill-down row vs DB).
 */
export async function getInvoiceBalanceByInvoiceNumber(
  tenantId: string,
  invoiceNumber: string
): Promise<{ id: string; balance_amount: number } | null> {
  const num = invoiceNumber.trim();
  if (!num) return null;
  const rows = await executeQuery<{ id: string; balance_amount: string }>(
    `SELECT id, balance_amount::text
     FROM invoices
     WHERE tenant_id = $1 AND invoice_number = $2
       AND deleted_at IS NULL
     LIMIT 1`,
    [tenantId, num]
  );
  if (rows.length === 0) return null;
  return { id: rows[0].id, balance_amount: Number(rows[0].balance_amount || 0) };
}

/**
 * Find the active EPD slab that covers the given days (days from invoice).
 * Returns the slab row or null if none matches.
 */
export async function getEPDSlabForDays(
  tenantId: string,
  daysFromInvoice: number
): Promise<EPDDiscountSlabRow | null> {
  const slabs = await getEPDSlabsForTenant(tenantId);
  const slab = slabs.find((s) => daysFromInvoice >= s.days_from && daysFromInvoice <= s.days_to);
  return slab ?? null;
}

/**
 * Test only: update EPD slab discount percentage in DB (for TC-007 smart flow).
 * @returns Number of rows updated
 */
export async function updateEPDSlabDiscountForTestCleanup(
  tenantId: string,
  daysFrom: number,
  daysTo: number,
  discountPercent: number
): Promise<number> {
  return executeUpdateEpdSlabDiscountForTestCleanup(tenantId, daysFrom, daysTo, discountPercent);
}

/**
 * Result of "oldest allocatable invoice + slab that applies" for smart TC-007.
 */
export interface OldestInvoiceAndSlabResult {
  tenantId: string;
  dealerId: string;
  oldestInvoice: OutstandingInvoiceRow;
  daysFromInvoice: number;
  slab: EPDDiscountSlabRow;
}

/**
 * Find the oldest outstanding invoice for a dealer and the EPD slab that applies to it
 * (using "today" as payment date; days = days from invoice date).
 * Use for smart TC-007: update that slab to a test %, run test, restore.
 */
export async function getOldestAllocatableInvoiceAndSlab(
  dealerBusinessName: string
): Promise<OldestInvoiceAndSlabResult | null> {
  const tenantId = await getTenantIdForFinanceE2E();
  if (!tenantId) return null;
  const dealerId = await getDealerIdByBusinessName(tenantId, dealerBusinessName);
  if (!dealerId) return null;
  const invoices = await getOutstandingInvoicesForCustomer(dealerId, tenantId);
  if (invoices.length === 0) return null;
  const oldest = invoices[0];
  const invoiceDate = new Date(oldest.invoice_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  invoiceDate.setHours(0, 0, 0, 0);
  const daysFromInvoice = Math.max(0, Math.ceil((today.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24)));
  const slab = await getEPDSlabForDays(tenantId, daysFromInvoice);
  if (!slab) return null;
  return { tenantId, dealerId, oldestInvoice: oldest, daysFromInvoice, slab };
}

/**
 * Get tenant EPD-related config from tenant_settings (if stored as key-value).
 * Adjust column names to match actual schema (e.g. key/value or jsonb).
 */
export async function getTenantEPDConfiguration(tenantId: string): Promise<Record<string, unknown>> {
  const rows = await executeQuery<{ key: string; value: unknown }>(
    `SELECT key, value FROM tenant_settings WHERE tenant_id = $1 AND key LIKE 'epd%'`,
    [tenantId]
  );
  const config: Record<string, unknown> = {};
  for (const r of rows) {
    config[r.key] = r.value;
  }
  return config;
}

/**
 * Get outstanding invoices for a customer (dealer).
 * Matches web app logic from getOutstandingInvoices action.
 * 
 * Filters:
 * - tenant_id (from environment)
 * - dealer_id (customer_id)
 * - status NOT in ('cancelled', 'draft')
 * - collection_status NOT in ('collected', 'paid')
 * - balance_amount > 0
 * - Ordered by invoice_date ASC (FIFO)
 */
export async function getOutstandingInvoicesForCustomer(
  dealerId: string,
  tenantId?: string
): Promise<OutstandingInvoiceRow[]> {
  // Get tenant_id from environment if not provided
  const effectiveTenantId = tenantId || process.env.TENANT_ID || 'iacs';
  
  const rows = await executeQuery<{
    id: string;
    invoice_number: string;
    dealer_id: string;
    invoice_date: string;
    due_date: string | null;
    total_amount: number;
    paid_amount: number;
    balance_amount: number;
    status: string;
    collection_status: string;
    early_payment_discount_percentage: number | null;
    early_payment_due_date: string | null;
    business_name: string;
  }>(
    `SELECT 
      i.id,
      i.invoice_number,
      i.dealer_id,
      i.invoice_date,
      i.due_date,
      i.total_amount,
      i.paid_amount,
      i.balance_amount,
      i.status,
      i.collection_status,
      i.early_payment_discount_percentage,
      i.early_payment_due_date,
      d.business_name
    FROM invoices i
    LEFT JOIN master_dealers d ON d.id = i.dealer_id
    WHERE i.tenant_id = $1
      AND i.dealer_id = $2
      AND i.status NOT IN ('cancelled', 'draft')
      AND (i.collection_status IS NULL OR i.collection_status NOT IN ('collected', 'paid'))
      AND i.balance_amount > 0
    ORDER BY i.invoice_date ASC, i.invoice_number ASC`,
    [effectiveTenantId, dealerId]
  );
  
  return rows.map(row => ({
    id: row.id,
    invoice_number: row.invoice_number,
    dealer_id: row.dealer_id,
    dealer_name: row.business_name || 'Unknown',
    invoice_date: row.invoice_date,
    due_date: row.due_date,
    total_amount: Number(row.total_amount),
    allocated_amount: Number(row.paid_amount || 0),
    paid_amount: Number(row.paid_amount || 0),
    balance_amount: Number(row.balance_amount || row.total_amount),
    collection_status: row.collection_status,
    early_payment_discount_percentage: row.early_payment_discount_percentage,
    early_payment_due_date: row.early_payment_due_date,
  }));
}

/**
 * Any invoice number for a different dealer (same tenant) — used to assert cross-customer isolation in CM apply UI.
 */
export async function getInvoiceNumberForDifferentDealer(
  tenantId: string,
  excludeDealerId: string
): Promise<string | null> {
  const rows = await executeQuery<{ invoice_number: string }>(
    `SELECT i.invoice_number
     FROM invoices i
     WHERE i.tenant_id = $1
       AND i.dealer_id IS NOT NULL
       AND i.dealer_id <> $2
       AND i.status NOT IN ('cancelled', 'draft')
     ORDER BY i.invoice_date DESC
     LIMIT 1`,
    [tenantId, excludeDealerId]
  );
  return rows.length > 0 ? rows[0].invoice_number : null;
}
