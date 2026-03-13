/**
 * Finance module database helpers for Cash Receipts and VAN payment verification.
 * Read-only SELECT queries for Sandwich Method verification.
 *
 * Tables: cash_receipt_headers, cash_receipt_applications, van_payment_collections,
 *         epd_discount_slabs, tenant_settings (EPD config).
 */

import { executeQuery } from './db-helper';

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
    `SELECT id, utr, tran_id, bene_acc_no, status, amount, dealer_id, cash_receipt_id, created_at
     FROM van_payment_collections
     WHERE utr = $1
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
    `SELECT id, utr, tran_id, bene_acc_no, status, amount, dealer_id, cash_receipt_id, created_at
     FROM van_payment_collections
     WHERE tran_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [tranId]
  );
  return rows.length > 0 ? rows[0] : null;
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
    ORDER BY i.invoice_date ASC`,
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
