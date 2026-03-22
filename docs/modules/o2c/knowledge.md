# O2C (Order-to-Cash) Module - Application Knowledge

## Overview
The O2C module handles the complete order-to-cash process including indent creation, order processing, invoicing, and payment collection.

## Key Components

### Indents
- **Purpose**: Purchase requisitions from dealers
- **Status Flow**: draft → submitted → approved → processed / converted / back_order_created
- **Key Fields**: dealer_id, products, quantities, status, preferred_warehouse_id, transporter

### Orders (Sales Orders)
- **Purpose**: Confirmed purchase orders
- **Created From**: Approved indents via "Process Workflow"
- **Key Fields**: indent_id, order_number, status

### Indent → Sales Order Flow (Full Lifecycle)
1. **Indent raised** for dealer (Create Indent → select dealer → land on detail or existing draft).
2. **Edit Indent** (draft only): Add Product → search by product name/code (Add Products modal) → product added → quantity adjusted → **Save**.
3. **Submit Indent**: Button "Submit Indent" (enabled when items present and total amount > 0); status → **submitted**.
4. **Warehouse & Transporter**: For **submitted** indent, "Warehouse Selection" card is shown; user must select warehouse before **Approve** is enabled. Transporter can be pre-filled from dealer's preferred transporter.
5. **Approve / Reject**: Buttons visible for submitted indent (with `indents:approve` permission). **Approve** (optional comments) or **Reject** (comments required). Dialog: "Approve Indent" / "Reject Indent" with Comments textarea. Approval is blocked if dealer has any invoice with pending payment 90+ days; **credit limit** is also checked (UI shows "Credit OK" / "Credit Warning").
6. **Process Workflow** (approved indent only): Button "Process Workflow" opens dialog; "Confirm & Process" creates **Sales Order** for in-stock items and **Back Order** for items with no stock. Stock is evaluated for the selected warehouse.

### System E2E Flows (O2C-E2E-TC-001 – TC-004)
**TC-001** runs the full pipeline with fixed data: **Dealer IACS5509** (Ramesh ningappa diggai), **Product 1013**, **Warehouse Kurnook**, **Transporter "Just In Time Shipper"**. Flow: (1) DB note inventory for product 1013 at Kurnook and dealer credit for IACS5509; (2) Create indent → add product 1013 → save → submit → select warehouse "Kurnook Warehouse" → select transporter "Just In Time Shipper" → approve → Process Workflow; (3) Navigate to SO (by indent_id from URL + DB lookup), verify dealer/warehouse/source indent, allocation and dealer credit unchanged; (4) **Warehouse picklist (DAEE-139)**: **Generate Picklist** → **View Picklist** → *Start Picking Process* (when picklist status is pending) → **Pick Items** tab → **Pick** per line → **Confirm Pick** (batch/quantity) → **Complete Picklist** + confirm → SO moves to **picked**; (5) **Generate E-Invoice** (modal, Transport tab + transporter), wait for invoice link; (6) **Mark as Packed** → **Ready to Ship** → **Dispatch Order** (transporter name; optional “vehicle details later” checkbox per DAEE-247); (7) Navigate to Invoice, Generate Custom eInvoice PDF, download; (8) DB: stock reduced, dealer credit updated; (9) Dealer Ledger: select dealer IACS5509, assert invoice transaction.

**TC-002**: **`resolveMixedIndentProductPairAtWarehouse("Kurnook")`** dynamically selects **one in-stock** and **one out-of-stock** material code (SQL + verification; fallbacks e.g. 1013/NPK; env **`E2E_O2C_MIXED_IN_STOCK_CODE`** / **`E2E_O2C_MIXED_OUT_OF_STOCK_CODE`** optional) → indent with **both** products → Process Workflow → **back order** (OOS) + **SO** (in-stock lines) → Inventory UI confirms OOS has no rows at Kurnook → **full pipeline** through invoice PDF and Dealer Ledger (same as TC-001 after SO).

**TC-003**: Same as TC-001 through picklist → E-Invoice modal: uncheck **E-Way Bill Required** (`#eWayBillRequired`) → **Generate E-Invoice Only** (no transporter path).

**TC-004**: Prefer invoice with **IRN** in last 24h, **no E-Way bill**, **posted to GL**, **full balance** (`getInvoiceIdWithRecentIrnWithoutEwayBill`). If none, **`runO2CIndentThroughEInvoice`** (e-invoice only, TC-003) → **Post to General Ledger** if needed → header **Cancel Invoice** (`CancelInvoiceDialog`, not E-Invoice card — card path fails with 400, **DAEE-362**) → DB `einvoice_status` **cancelled**.

UI source: `WarehousePicklistDialog.tsx`, `sales-orders/[id]/page.tsx`, `DispatchOrderDialog.tsx`, `EInvoiceGenerationModal.tsx`, `invoices/[id]/components/InvoiceDetailsContent.tsx` (+ `EInvoiceCancellation`). Automation: `WarehousePicklistDialogPage.ts`, `SalesOrderDetailPage.ts`, `O2CInventoryPage.ts`, `InvoiceDetailPage.ts`, `o2c-e2e-steps.ts`, `o2c-e2e-flow-helpers.ts`. All DB usage is read-only (SELECT). See `e2e/features/o2c/o2c-e2e-indent-so-invoice.feature`.

## Business Rules

### Indent Creation
- Must select a dealer
- Must add at least one product
- Quantities must be positive numbers
- Dealer must be active and approved

### Indent Submission
- All required fields must be filled (items, total amount > 0)
- Submit Indent button disabled when no items or zero amount
- Dealer is already selected (from create flow)

### Indent Approval
- Requires `indents:approve` permission
- **Warehouse must be selected** before Approve is enabled (submitted indent)
- Reject requires comments; Approve comments optional
- **Blocked if** dealer has pending invoice 90+ days (server-side)
- **Credit limit** checked; UI shows Credit OK vs Credit Warning
- Can approve with back orders (partial/zero stock) – "Approve with Back Orders" when inventory insufficient

## Database Schema

**Inventory-related tables (for E2E DB helpers):** See **`docs/database/o2c-inventory-tables.md`** for table names, columns, and data types for `inventory`, `product_variant_packages`, and `warehouses`. Product "1013" is resolved via `product_variant_packages.material_code` or `package_code`; warehouse "Kurnook" via `warehouses.warehouse_name` / `warehouse_code`.

### indents
- `id`: UUID (primary key)
- `dealer_id`: UUID (foreign key)
- `status`: Enum (draft, submitted, approved, rejected)
- `created_at`: Timestamp
- `submitted_at`: Timestamp
- `approved_at`: Timestamp

### indent_items
- `id`: UUID (primary key)
- `indent_id`: UUID (foreign key to indents)
- `product_id`: UUID (foreign key)
- `quantity`: Numeric
- `unit_price`: Numeric

## API Endpoints

### POST /api/o2c/indents
- **Purpose**: Create new indent
- **Request**: `{ dealer_id: string, items: Array<{product_id, quantity}> }`
- **Response**: `{ id: string, indent_number: string }`

### POST /api/o2c/indents/:id/submit
- **Purpose**: Submit indent for approval
- **Response**: `{ success: boolean }`

## Test Patterns

### Indent Creation Pattern
1. Navigate to indent creation page
2. Select dealer (Radix Select)
3. Add products with quantities
4. Submit form
5. Verify success toast
6. Verify indent created in database

### Sandwich Method for Indents
1. **DB BEFORE**: Count existing indents
2. **UI ACTION**: Create indent
3. **DB AFTER**: Verify new indent with correct data

## Reports → Hierarchical Sales

- **Route**: `/o2c/reports/hierarchical-sales`
- **Purpose**: Sales data by State → Region → Territory → Dealer with Gross/Returns/Net; quick period, filters, Excel export.
- **Permission**: `sales_reports.read` (UI); backend uses `invoices.read`.
- **Full knowledge**: [reports/hierarchical-sales/knowledge.md](reports/hierarchical-sales/knowledge.md)
- **Test cases**: [reports/hierarchical-sales/test-cases.md](reports/hierarchical-sales/test-cases.md)

## Related Modules
- **Dealers**: Indents require dealer selection
- **Products**: Indents include product line items
- **Inventory**: Affects inventory levels

## Warehouse Inventory (WH-INV)

- **Current routes (implemented):** `/o2c/inventory`, detail `/o2c/inventory/[id]`
- **App source:** `../web_app/src/app/o2c/inventory/page.tsx`, `O2CInventoryManagerPage.tsx`, `ProtectedPageWrapper` **`module="inventory"`**, **`read`**
- **Known issue / roadmap:** The UI is still mounted under **O2C** for historical reasons. **Planned:** relocate canonical URLs to **`/warehouses/inventory`** (and matching detail path) so navigation matches the warehouse domain (sidebar already lists Inventory next to warehouses). **Not done yet** — when the move ships, update deep links (e.g. from zone pages, notifications, warehouse screens), redirects, and all E2E `goto()` / registry paths in one pass.
- **Test tagging:** Use **`@WH-INV-TC-###`** for this feature; document **route** in `test-cases.md` / `TEST_CASE_REGISTRY.md` as **current:** `/o2c/inventory` until migration.
- **Automation hint:** Centralize the list URL in a POM constant (e.g. `INVENTORY_LIST_PATH`) so the future path change is a single edit.

## Test Data (Tenant-Specific)

- **Products**: **1013** and **1041** are available for Add Products search and in stock at Kurnook Warehouse.
- **NPK**: Product **NPK** is **not** in stock at Kurnook (used for TC-051 stock-warning scenario).
- **Kurnook Warehouse**: Has **1013** and **1041** in stock; **NPK** is not in stock.
- **TC-051 (Stock warning)**: Add products 1013, 1041 and NPK to the indent; select Kurnook Warehouse → stock warning / "Approve with Back Orders" appears for NPK.

## Known Issues / Gaps
- **Inventory URL:** List/detail live under **`/o2c/inventory`** today; **planned** **`/warehouses/inventory`** (see [Warehouse Inventory (WH-INV)](#warehouse-inventory-wh-inv)). Track product/router change before rewriting tests.

## Test Coverage
- ✅ Indent creation and navigation (TC-001, TC-002, TC-003, TC-006, TC-007, TC-008)
- ✅ Edit indent, add product, save, submit (TC-004, TC-005, TC-009, TC-010, TC-011)
- ✅ Full straight path: list → create → products → submit → warehouse → approve → Process Workflow → SO (TC-012)
- ✅ Reject flow and approval blocked 90+ days (TC-013, TC-014, TC-015)
- ✅ Transporter, credit warning, stock warning, Process Workflow dialog (TC-016–TC-020)
- **Source:** [test-cases.md](test-cases.md) (TC-001–TC-020)
- ✅ Hierarchical Sales Report: filters, generate, summary, hierarchy, export (O2C-HSR-TC-003–TC-028); access tests (TC-001, TC-002) documented only. **Source:** [reports/hierarchical-sales/test-cases.md](reports/hierarchical-sales/test-cases.md)
- ✅ Warehouse inventory (WH-INV-TC-001–015): shell, tabs, filters, search/pagination, page size. **Source:** [test-cases.md](test-cases.md) (WH-INV), [inventory/FEATURE-WH-INV-phased-plan.md](inventory/FEATURE-WH-INV-phased-plan.md)
