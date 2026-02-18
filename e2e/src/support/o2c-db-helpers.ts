/**
 * O2C (Order-to-Cash) DB Helpers for E2E Tests
 *
 * Read-only SELECT helpers for inventory, dealer credit, and sales order lookup.
 * Aligned with how /o2c/inventory loads data: inventory by product_id + warehouse_id (UUIDs),
 * with optional fallback via product_variant_package_id. Returns list + target inventory IDs.
 *
 * Tables: inventory (id, product_id, product_variant_package_id, warehouse_id, tenant_id, status, available_units, allocated_units),
 *         warehouses, products (product_code), product_variant_packages, product_variants, master_dealers, sales_orders.
 */

import { executeQuery } from './db-helper';

export interface InventoryRow {
  id: string;
  product_id: string;
  product_variant_package_id: string | null;
  warehouse_id: string;
  available_units: number;
  allocated_units: number;
}

export interface InventorySnapshot {
  available: number;
  allocated: number;
  netAvailable: number;
  productId: string;
  warehouseId: string;
  /** Inventory row UUIDs matching the list the app would show (product + warehouse + tenant). */
  inventoryIds: string[];
  /** Raw rows for debugging / identification. */
  rows: InventoryRow[];
}

/**
 * Resolve tenant_id for E2E. Checks tenant-specific env vars first (IACS_TENANT_ID, ADMIN_TENANT_ID, etc.),
 * then E2E_TENANT_ID as fallback, then queries by name 'IACS' as final fallback.
 * 
 * Env var priority:
 * 1. IACS_TENANT_ID (for IACS tenant tests)
 * 2. ADMIN_TENANT_ID (for ADMIN tenant tests)
 * 3. E2E_TENANT_ID (default/fallback)
 * 4. Query by name 'IACS' (final fallback)
 */
async function getTenantIdForE2E(): Promise<string | null> {
  // Check tenant-specific env vars (IACS_TENANT_ID, ADMIN_TENANT_ID, etc.)
  const tenantSpecificVars = ['IACS_TENANT_ID', 'ADMIN_TENANT_ID', 'DEMO_TENANT_ID'];
  for (const varName of tenantSpecificVars) {
    const value = process.env[varName];
    if (value) return value;
  }
  
  // Fallback to generic E2E_TENANT_ID
  const fromEnv = process.env.E2E_TENANT_ID;
  if (fromEnv) return fromEnv;
  
  // Final fallback: query by name 'IACS' (most common tenant for E2E)
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
 * Resolve product id (UUID) by product_code. Tries products.product_code then master_products.pid.
 */
async function getProductIdByCode(productCode: string, tenantId: string | null): Promise<string | null> {
  if (tenantId) {
    try {
      const fromProducts = await executeQuery<{ id: string }>(
        'SELECT id FROM products WHERE product_code = $1 AND tenant_id = $2 LIMIT 1',
        [productCode, tenantId]
      );
      if (fromProducts.length > 0) return fromProducts[0].id;
    } catch {
      // products table or product_code column may not exist
    }
    try {
      const fromMaster = await executeQuery<{ id: string }>(
        'SELECT id FROM master_products WHERE pid = $1 AND tenant_id = $2 AND (is_active IS NULL OR is_active = true) LIMIT 1',
        [productCode, tenantId]
      );
      if (fromMaster.length > 0) return fromMaster[0].id;
    } catch {
      // master_products may not exist
    }
    return null;
  }
  try {
    const fromProducts = await executeQuery<{ id: string }>(
      'SELECT id FROM products WHERE product_code = $1 LIMIT 1',
      [productCode]
    );
    if (fromProducts.length > 0) return fromProducts[0].id;
  } catch {
    // ignore
  }
  try {
    const fromMaster = await executeQuery<{ id: string }>(
      'SELECT id FROM master_products WHERE pid = $1 LIMIT 1',
      [productCode]
    );
    if (fromMaster.length > 0) return fromMaster[0].id;
  } catch {
    // ignore
  }
  return null;
}

/**
 * Resolve warehouse id (UUID) by name/code. Same as app filter (warehouses.warehouse_name / warehouse_code + tenant_id).
 */
async function getWarehouseIdBySearch(warehouseSearch: string, tenantId: string | null): Promise<string | null> {
  const pattern = `%${warehouseSearch}%`;
  if (tenantId) {
    const rows = await executeQuery<{ id: string }>(
      `SELECT id FROM warehouses
       WHERE (warehouse_name ILIKE $1 OR warehouse_code ILIKE $1) AND tenant_id = $2
       LIMIT 1`,
      [pattern, tenantId]
    );
    return rows.length > 0 ? rows[0].id : null;
  }
  const rows = await executeQuery<{ id: string }>(
    `SELECT id FROM warehouses WHERE warehouse_name ILIKE $1 OR warehouse_code ILIKE $1 LIMIT 1`,
    [pattern]
  );
  return rows.length > 0 ? rows[0].id : null;
}

const INV_STATUS_COND = "(i.status = 'available' OR i.status IS NULL)";

/**
 * Resolve inventory by product_variant_packages.material_code or package_code (e.g. "1013" -> PKG-1013).
 * Use when app/search keys by material/package code. See docs/database/o2c-inventory-tables.md.
 */
async function getInventoryListByMaterialOrPackageCode(
  productCode: string,
  warehouseId: string,
  tenantId: string | null
): Promise<InventoryRow[]> {
  if (!tenantId) return [];
  try {
    const pkgRows = await executeQuery<{ id: string }>(
      `SELECT id FROM product_variant_packages
       WHERE (material_code = $1 OR package_code ILIKE '%' || $1 || '%')
         AND tenant_id = $2
         AND (is_active IS NULL OR is_active = true)
       LIMIT 50`,
      [productCode, tenantId]
    );
    if (pkgRows.length === 0) return [];
    const packageIds = pkgRows.map((r) => r.id);
    // Params: [$1=warehouseId, $2=tenantId, $3=packageIds[0], $4=packageIds[1], ...]
    const placeholders = packageIds.map((_, i) => `$${i + 3}`).join(',');
    const params = [warehouseId, tenantId, ...packageIds];
    const rows = await executeQuery<{
      id: string;
      product_id: string;
      product_variant_package_id: string | null;
      warehouse_id: string;
      available_units: number;
      allocated_units: number;
    }>(
      `SELECT i.id, i.product_id, i.product_variant_package_id, i.warehouse_id,
              COALESCE(i.available_units, 0)::numeric AS available_units,
              COALESCE(i.allocated_units, 0)::numeric AS allocated_units
       FROM inventory i
       WHERE i.warehouse_id = $1 AND i.tenant_id = $2
         AND i.product_variant_package_id IN (${placeholders})
         AND ${INV_STATUS_COND}`,
      params
    );
    return rows.map((r) => ({
      id: r.id,
      product_id: r.product_id,
      product_variant_package_id: r.product_variant_package_id,
      warehouse_id: r.warehouse_id,
      available_units: Number(r.available_units),
      allocated_units: Number(r.allocated_units),
    }));
  } catch {
    return [];
  }
}

/**
 * Get inventory list for product + warehouse, mirroring /o2c/inventory getInventory():
 * - Tries first by material_code/package_code (product_variant_packages), then by product_id.
 * - tenant_id, status = 'available', warehouse_id (UUIDs).
 */
async function getInventoryList(
  productId: string,
  warehouseId: string,
  tenantId: string | null,
  productCode: string
): Promise<InventoryRow[]> {
  const statusCond = INV_STATUS_COND;
  const tenantCond = tenantId ? ' AND i.tenant_id = $3' : '';
  const params: string[] = [productId, warehouseId];
  if (tenantId) params.push(tenantId);

  // 1) Prefer resolution by material_code/package_code (e.g. "1013" -> product_variant_packages)
  let rows = await getInventoryListByMaterialOrPackageCode(productCode, warehouseId, tenantId);

  // 2) By product_id + warehouse_id
  if (rows.length === 0) {
    rows = await executeQuery<{
      id: string;
      product_id: string;
      product_variant_package_id: string | null;
      warehouse_id: string;
      available_units: number;
      allocated_units: number;
    }>(
      `SELECT i.id, i.product_id, i.product_variant_package_id, i.warehouse_id,
              COALESCE(i.available_units, 0)::numeric AS available_units,
              COALESCE(i.allocated_units, 0)::numeric AS allocated_units
       FROM inventory i
       WHERE i.product_id = $1 AND i.warehouse_id = $2 AND ${statusCond}${tenantCond}`,
      params
    ).then((r) =>
      r.map((x) => ({
        id: x.id,
        product_id: x.product_id,
        product_variant_package_id: x.product_variant_package_id,
        warehouse_id: x.warehouse_id,
        available_units: Number(x.available_units),
        allocated_units: Number(x.allocated_units),
      }))
    );
  }

  // 3) Fallback: resolve package IDs from product_id (product -> variant -> packages), then inventory by package
  if (rows.length === 0 && tenantId) {
    try {
      const pkgRows = await executeQuery<{ id: string }>(
        `SELECT pvp.id FROM product_variant_packages pvp
         INNER JOIN product_variants pv ON pv.id = pvp.product_variant_id
         INNER JOIN products p ON p.id = pv.product_id
         WHERE p.id = $1 AND p.tenant_id = $2
         LIMIT 50`,
        [productId, tenantId]
      );
      if (pkgRows.length > 0) {
        const packageIds = pkgRows.map((r) => r.id);
        // Params: [$1=warehouseId, $2=tenantId, $3=packageIds[0], $4=packageIds[1], ...]
        const placeholders = packageIds.map((_, i) => `$${i + 3}`).join(',');
        const fallbackParams = [warehouseId, tenantId, ...packageIds];
        const fallbackRows = await executeQuery<{
          id: string;
          product_id: string;
          product_variant_package_id: string | null;
          warehouse_id: string;
          available_units: number;
          allocated_units: number;
        }>(
          `SELECT i.id, i.product_id, i.product_variant_package_id, i.warehouse_id,
                  COALESCE(i.available_units, 0)::numeric AS available_units,
                  COALESCE(i.allocated_units, 0)::numeric AS allocated_units
           FROM inventory i
           WHERE i.warehouse_id = $1 AND i.tenant_id = $2 AND i.product_variant_package_id IN (${placeholders}) AND ${statusCond}`,
          fallbackParams
        );
        rows = fallbackRows.map((r) => ({
          id: r.id,
          product_id: r.product_id,
          product_variant_package_id: r.product_variant_package_id,
          warehouse_id: r.warehouse_id,
          available_units: Number(r.available_units),
          allocated_units: Number(r.allocated_units),
        }));
      }
    } catch {
      // product_variant_packages / product_variants may not exist
    }
  }

  // 4) By product_code join on products
  if (rows.length === 0 && tenantId) {
    try {
      const byProductCodeRows = await executeQuery<{
        id: string;
        product_id: string;
        product_variant_package_id: string | null;
        warehouse_id: string;
        available_units: number;
        allocated_units: number;
      }>(
        `SELECT i.id, i.product_id, i.product_variant_package_id, i.warehouse_id,
                COALESCE(i.available_units, 0)::numeric AS available_units,
                COALESCE(i.allocated_units, 0)::numeric AS allocated_units
         FROM inventory i
         INNER JOIN products p ON p.id = i.product_id AND p.tenant_id = i.tenant_id
         WHERE i.warehouse_id = $1 AND i.tenant_id = $2 AND p.product_code = $3 AND ${statusCond}`,
        [warehouseId, tenantId, productCode]
      );
      rows = byProductCodeRows.map((r) => ({
        id: r.id,
        product_id: r.product_id,
        product_variant_package_id: r.product_variant_package_id,
        warehouse_id: r.warehouse_id,
        available_units: Number(r.available_units),
        allocated_units: Number(r.allocated_units),
      }));
    } catch {
      // ignore
    }
  }

  return rows;
}

/**
 * Get aggregated inventory and list for a product at a warehouse (same data as /o2c/inventory would show).
 * Resolves warehouse by name/code (e.g. 'Kurnook'). Resolves product by:
 * 1) material_code/package_code on product_variant_packages (e.g. '1013'), then
 * 2) product_id from products.product_code / master_products.pid.
 * Returns snapshot (available, allocated, netAvailable), inventoryIds, and rows.
 * See docs/database/o2c-inventory-tables.md.
 */
export async function getInventoryForProductAndWarehouse(
  productCode: string,
  warehouseSearch: string
): Promise<InventorySnapshot | null> {
  const tenantId = await getTenantIdForE2E();
  const warehouseId = await getWarehouseIdBySearch(warehouseSearch, tenantId);
  if (!warehouseId) return null;

  // 1) Prefer resolution by material_code/package_code (e.g. "1013" -> product_variant_packages)
  let rows = await getInventoryListByMaterialOrPackageCode(productCode, warehouseId, tenantId);
  let productId = rows.length > 0 ? rows[0].product_id : '';

  // 2) Fallback: product_id from products / master_products
  if (rows.length === 0) {
    const resolvedProductId = await getProductIdByCode(productCode, tenantId);
    if (!resolvedProductId) return null;
    productId = resolvedProductId;
    rows = await getInventoryList(productId, warehouseId, tenantId, productCode);
  }

  if (rows.length === 0) return null;

  const available = rows.reduce((sum, r) => sum + r.available_units, 0);
  const allocated = rows.reduce((sum, r) => sum + r.allocated_units, 0);

  return {
    productId,
    warehouseId,
    available,
    allocated,
    netAvailable: available - allocated,
    inventoryIds: rows.map((r) => r.id),
    rows,
  };
}

export interface DealerCreditSnapshot {
  dealerId: string;
  dealerCode: string;
  businessName: string;
  creditLimit: number;
  outstandingAmount: number;
  netAvailable: number;
}

/**
 * Get dealer credit limit, outstanding amount, and net available (credit limit - outstanding) by dealer code.
 * Tenant-scoped when tenant_id available (E2E runs as IACS).
 */
export async function getDealerCreditByCode(dealerCode: string): Promise<DealerCreditSnapshot | null> {
  const tenantId = await getTenantIdForE2E();
  const params: (string | boolean)[] = [dealerCode];
  const tenantFilter = tenantId ? ' AND tenant_id = $2' : '';
  if (tenantId) params.push(tenantId);

  const rows = await executeQuery<{
    id: string;
    dealer_code: string;
    business_name: string;
    credit_limit: number | string;
    outstanding_amount: number | string;
  }>(
    `SELECT id, dealer_code, business_name,
            COALESCE(credit_limit, 0)::numeric AS credit_limit,
            COALESCE(outstanding_amount, 0)::numeric AS outstanding_amount
     FROM master_dealers
     WHERE dealer_code = $1 AND (is_active IS NULL OR is_active = true)${tenantFilter}
     LIMIT 1`,
    params
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  const creditLimit = Number(r.credit_limit);
  const outstandingAmount = Number(r.outstanding_amount);
  return {
    dealerId: r.id,
    dealerCode: r.dealer_code,
    businessName: r.business_name,
    creditLimit,
    outstandingAmount,
    netAvailable: creditLimit - outstandingAmount,
  };
}

/**
 * Get the most recently created sales order id for an indent (after Process Workflow).
 */
export async function getSalesOrderIdByIndentId(indentId: string): Promise<string | null> {
  const rows = await executeQuery<{ id: string }>(
    'SELECT id FROM sales_orders WHERE indent_id = $1 ORDER BY created_at DESC LIMIT 1',
    [indentId]
  );
  return rows.length > 0 ? rows[0].id : null;
}

/**
 * Get invoice id(s) for a sales order (after eInvoice generation).
 */
export async function getInvoiceIdsBySalesOrderId(salesOrderId: string): Promise<string[]> {
  const rows = await executeQuery<{ id: string }>(
    'SELECT id FROM invoices WHERE sales_order_id = $1 ORDER BY created_at DESC',
    [salesOrderId]
  );
  return rows.map((r) => r.id);
}
