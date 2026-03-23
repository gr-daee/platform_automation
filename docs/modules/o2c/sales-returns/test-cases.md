# Sales Returns — automated test cases

**Phased plan:** [FEATURE-SR-phased-plan.md](./FEATURE-SR-phased-plan.md)

## Phase 1 — List shell (`@SR-PH1`)

**Feature:** `e2e/features/o2c/sales-returns/sales-returns.feature`  
**POM:** `e2e/src/pages/o2c/SalesReturnsListPage.ts`  
**Steps:** `e2e/src/steps/o2c/sales-returns-steps.ts`

| ID | Scenario | Notes |
|----|-----------|--------|
| SR-PH1-TC-001 | Heading **Sales Returns** + subtitle | Uses `getByRole('heading')` + description text |
| SR-PH1-TC-002 | **Create Return Order** → `/o2c/sales-returns/new` + H1 **Create Sales Return Order** | Use **`getByRole('link', { name: /create return order/i }).first()`** — `Link` wraps `Button`; clicking the inner button does not navigate reliably |
| SR-PH1-TC-003 | Stats: **Total Returns** … **Total Value** | If `getReturnOrderStatistics` yields no `stats`, UI omits cards — step exits without failure (graceful empty) |
| SR-PH1-TC-004 | **Return Orders** card title or **No return orders found**; not **Error loading return orders** | Waits through initial list skeleton |
| SR-PH1-TC-005 | Breadcrumb: link **Order to Cash** + current **Sales Returns** (`[data-slot="breadcrumb-page"]`) | |

**Run:** `npm run test:dev -- --project=iacs-md --grep "@SR-PH1"`

**Permissions:** `ProtectedPageWrapper` module `sales_return_orders` — user must have list (and create for TC-002) access.

---

## Phase 2 — Filters, search, pagination (`@SR-PH2`)

**Feature:** `e2e/features/o2c/sales-returns/sales-returns.feature` (same file as Phase 1)  
**POM / steps:** `SalesReturnsListPage.ts`, `sales-returns-steps.ts`  
**DB (read-only):** `getLatestReturnOrderNumberForE2ETenant`, `returnOrderNumberSearchSubstring` in `e2e/src/support/o2c-db-helpers.ts`

| ID | Scenario | Notes |
|----|-----------|--------|
| SR-PH2-TC-001 | **Status** facet → **Pending**; rows show Pending or empty state | After load, `Escape` closes FacetedFilter popover; status = **second-to-last** `td` per row (before Actions) |
| SR-PH2-TC-002 | **Return reason** → **Defective** | Reason = `td` index 4 (0-based) when row has ≥5 cells |
| SR-PH2-TC-003 | Search by **substring** of latest `return_order_number` (DB) | **Skips** if no rows for tenant. Backend search = `return_order_number` ilike **only** — not invoice (see plan gap) |
| SR-PH2-TC-004 | **Clear filters** clears search + status | Toolbar **Clear filters** scoped to filter row |
| SR-PH2-TC-005 | **Page 2** when total \> 20 | **Skips** if single page; waits for footer “Showing …” after click |

**Run:** `npm run test:dev -- --project=iacs-md --grep "@SR-PH2"`

**Known gap:** List search placeholder mentions invoice number; server filters **`return_order_number` only** — see [FEATURE-SR-phased-plan.md](./FEATURE-SR-phased-plan.md).

---

## Phase 3 — Create wizard happy path (`@SR-PH3`)

**Feature:** `e2e/features/o2c/sales-returns/sales-returns.feature`  
**POM:** `e2e/src/pages/o2c/CreateSalesReturnOrderPage.ts`  
**Steps:** `e2e/src/steps/o2c/sales-returns-steps.ts`  
**DB (read-only):** `getInvoiceWithReturnableLinesForE2ETenant` in `e2e/src/support/o2c-db-helpers.ts`

| ID | Scenario | Notes |
|----|-----------|--------|
| SR-PH3-TC-001 | Step 1: DB-picked **eligible** invoice (server search) + dealer (auto or dialog fallback by `dealer_code`) | Skips if no eligible invoice |
| SR-PH3-TC-002 | Step 2: **Return Quantity** on first line | After **Load Invoice Items** |
| SR-PH3-TC-003 | Header **return reason** + `AUTO_QA_` notes on step 1; review + **Create Return Order** | Reason = Customer Request |
| SR-PH3-TC-004 | Redirect to detail + **Pending Receipt**; sandwich `sales_return_orders.status = pending` | Skips sandwich if DB error |

**Run:** `npm run test:dev -- --project=iacs-md --grep "@SR-PH3"`

**Implementation:** [IMPL-048](../../../implementations/2026-03/IMPL-053_sales-returns-consolidated.md)

---

## Phase 4 — Detail & goods receipt (`@SR-PH4`)

**Feature:** `e2e/features/o2c/sales-returns/sales-returns.feature` (1st scenario)  
**POM:** `SalesReturnDetailPage.ts`, `CreateSalesReturnOrderPage.ts`  
**Steps:** `sales-returns-steps.ts`

| ID | Scenario | Notes |
|----|-----------|--------|
| SR-PH4-TC-001 | Pending detail shows **Record Goods Receipt** + **Cancel Return Order** | |
| SR-PH4-TC-002 | Record receipt dialog → **Goods Received** or **Credit Memo Created** | Warehouse auto-fill common |
| SR-PH4-TC-003 | **Cancel** hidden after receipt / CM | `toHaveCount(0)` |
| SR-PH4-TC-004 | **Inventory sandwich:** before/after `SUM(inventory.available_units)` for first line `product_variant_package_id` + SO **warehouse**; GRN with **QC Passed**; delta = `return_quantity` | Skips if no `invoices.sales_order_id` / warehouse chain |
| — | DB sandwich `received` **or** `credit_memo_created` | Env may auto-advance CM |

**Run:** `npm run test:dev -- --project=iacs-md --grep "@SR-PH4"`

---

## Phase 5 — Credit memo (`@SR-PH5`)

**Feature:** `sales-returns.feature` (2nd scenario)

| ID | Scenario | Notes |
|----|-----------|--------|
| SR-PH5-TC-001 | **Create Credit Memo** when shown → finance detail **or** already linked | Branching step |
| SR-PH5-TC-002 | Outcome visible on return (**Credit Memo Created** / link) or `/finance/credit-memos/` | |
| SR-PH5-TC-003 | **Retry E-Credit Note** button + dialog shell (DB-picked return + CM pending/no IRN); skips if none | No GST portal assertion |

**Run:** `npm run test:dev -- --project=iacs-md --grep "@SR-PH5"` (includes SR-PH5-TC-003; may skip without eligible CM row)

---

## Phase 6 — Validation & cancel (`@SR-PH6`)

**Feature:** `e2e/features/o2c/sales-returns/sales-returns.feature`

| ID | Scenario | Notes |
|----|-----------|--------|
| SR-PH6-TC-001 | Cancel dialog: confirm disabled if reason empty | |
| SR-PH6-TC-002 | Cancel with `AUTO_QA_` reason → **Cancelled** | |
| SR-PH6-TC-003 | Review (0 items) → `alert`; stay step 2 | `page.once('dialog')` + `evaluate(click)` |
| SR-PH6-TC-004 | Qty \> available → `alert`; stay step 2 | Remove `max`, keyboard type |

**Run:** `npm run test:dev -- --project=iacs-md --grep "@SR-PH6"`

---

## Phase 7 — Report (`@SR-PH7`)

**Feature:** `e2e/features/o2c/sales-returns/sales-returns.feature`  
**POM:** `SalesReturnReportPage.ts`

| ID | Scenario | Notes |
|----|-----------|--------|
| SR-PH7-TC-001 | `/o2c/reports/sales-return` — **Load Report** + **Filters** | Module `sales_orders` read |
| SR-PH7-TC-002 | **`@iacs-ed`**: direct `/o2c/reports/sales-return` → `/restrictedUser` **or** skip if tenant grants ED access | Same tenant-aware pattern as FIN-DL-TC-008 |

**Run:** `npm run test:dev -- --project=iacs-md --grep "@SR-PH7-TC-001"` (authorized); `npm run test:dev -- --project=iacs-ed --grep "@SR-PH7-TC-002"` (denied-or-skip)

---

## Phase 8 — Inventory invariants (`@SR-PH8`)

**Feature:** `e2e/features/o2c/sales-returns/sales-returns.feature`

| ID | Scenario | Notes |
|----|-----------|--------|
| SR-PH8-TC-001 | Record goods receipt with **QC Failed** should not increase inventory available | DB sandwich on first return line package + SO warehouse; expected delta = `0` |
| SR-PH8-TC-002 | Cancel pending return before GRN should not change inventory available | DB sandwich on first return line package + SO warehouse; expected delta = `0` |
| SR-PH8-TC-003 | Credit memo flow should not add extra inventory movement after GRN | Baseline immediately after GRN; expected delta after CM flow = `0` |
| SR-PH8-TC-004 | Multi-line GRN reconciles inventory increase across all return lines | Aggregate return quantities by package; per-package delta must match DB |

**Run:** `npm run test:dev -- --project=iacs-md --grep "@SR-PH8"`

---

**Full pack (MD):** `npm run bdd:generate && npm run test:dev -- --project=iacs-md --grep "@sales-returns"` — **20** scenarios on `iacs-md` (2026-03-23+). **ED-only:** `npm run test:dev -- --project=iacs-ed --grep "@SR-PH7-TC-002"`. **Implementation:** [IMPL-050](../../../implementations/2026-03/IMPL-053_sales-returns-consolidated.md), [IMPL-051](../../../implementations/2026-03/IMPL-053_sales-returns-consolidated.md), [IMPL-052](../../../implementations/2026-03/IMPL-053_sales-returns-consolidated.md)
