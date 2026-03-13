/**
 * Finance test data helpers - READ-ONLY queries for cash receipts and VAN tests.
 * Use for stable dealers with VAN, invoices with outstanding, EPD slabs.
 * No CREATE/UPDATE/DELETE - framework uses read-only DB.
 *
 * Reference: docs/modules/finance/cash-receipts/knowledge.md
 */

import { executeQuery } from '../db-helper';
import { getEPDSlabsForTenant, getTenantEPDConfiguration } from '../finance-db-helpers';

export interface DealerWithVAN {
  dealer_id: string;
  business_name: string;
  van_number: string;
  tenant_id: string;
}

export interface InvoiceWithOutstanding {
  id: string;
  invoice_number: string;
  dealer_id: string;
  balance_amount: number;
  total_amount: number;
  invoice_date: string;
}

/**
 * Get a stable dealer that has an active VAN mapping (for VAN API tests).
 */
export async function getStableDealerWithVAN(tenantName?: string): Promise<DealerWithVAN | null> {
  let query = `
    SELECT vdm.dealer_id, d.business_name, vdm.van_number, d.tenant_id
    FROM van_dealer_mappings vdm
    JOIN dealers d ON d.id = vdm.dealer_id
    WHERE vdm.is_active = true AND d.is_active = true
  `;
  const params: string[] = [];
  if (tenantName) {
    query += ` AND EXISTS (SELECT 1 FROM tenants t WHERE t.id = d.tenant_id AND t.name = $1)`;
    params.push(tenantName);
  }
  query += ` ORDER BY vdm.updated_at DESC LIMIT 1`;
  const rows = await executeQuery<DealerWithVAN>(query, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Get invoices with outstanding balance (for cash receipt application tests).
 */
export async function getStableInvoicesWithOutstanding(
  dealerId?: string,
  limit: number = 5
): Promise<InvoiceWithOutstanding[]> {
  let query = `
    SELECT id, invoice_number, dealer_id, balance_amount, total_amount, invoice_date
    FROM invoices
    WHERE balance_amount > 0 AND status NOT IN ('cancelled', 'reversed')
  `;
  const params: (string | number)[] = [];
  if (dealerId) {
    query += ` AND dealer_id = $1`;
    params.push(dealerId);
    query += ` ORDER BY invoice_date ASC LIMIT $2`;
    params.push(limit);
  } else {
    query += ` ORDER BY invoice_date ASC LIMIT $1`;
    params.push(limit);
  }
  return executeQuery<InvoiceWithOutstanding>(query, params);
}

/**
 * Get EPD slabs for a tenant (read-only; for verification).
 */
export async function getStableEPDSlabsForTenant(tenantId: string) {
  return getEPDSlabsForTenant(tenantId);
}

/**
 * Get tenant EPD configuration (read-only).
 */
export async function getStableTenantEPDConfig(tenantId: string) {
  return getTenantEPDConfiguration(tenantId);
}
