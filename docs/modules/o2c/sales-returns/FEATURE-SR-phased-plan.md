# FEATURE — Sales Returns (SR) phased E2E

**Primary route:** `/o2c/sales-returns`  
**Create route:** `/o2c/sales-returns/new`  
**Detail route:** `/o2c/sales-returns/[id]`  
**Related report:** `/o2c/reports/sales-return` (module `sales_orders`, `read`)

**Web source:** `web_app/src/app/o2c/sales-returns/*`, `returnOrderActions.ts`, edge **`o2c-sales-return-management`**.

**Permissions (list/create):** `ProtectedPageWrapper` module **`sales_return_orders`** (`page.tsx`, `new/layout.tsx`). Confirm create/update keys in RBAC before Phase 3+.

---

## How we work each phase (Design → Develop → Test → Gate)

For **every** phase below, complete in order:

| Step | What to do |
|------|------------|
| **1. Design** | Finalize scenario IDs, Gherkin outlines, tags (`@iacs-md`, `@smoke` / `@regression`, priority), test data strategy (stable invoice vs `AUTO_QA_` chain), sandwich queries (read-only). Update **this doc** + `test-cases.md` draft rows. |
| **2. Develop** | `e2e/features/o2c/sales-returns/*.feature`, POM `SalesReturnsPage` / `SalesReturnDetailPage` / `CreateSalesReturnPage`, steps `sales-returns-steps.ts`, reuse `BasePage` + component patterns per persona. Run `npm run bdd:generate`. |
| **3. Test** | `npm run test:dev -- --project=iacs-md --grep "@SR-PHx"` (or per-tag). Fix flakiness; attach Monocart on failure. |
| **4. Gate** | ✅ All Phase N scenarios green in dev mode → merge doc updates (`test-cases.md`, `knowledge.md`, `TEST_CASE_REGISTRY.md`, `test-impact-matrix.md`) → **start Phase N+1**. |

**Do not** start the next phase until the current phase’s **Gate** is satisfied.

---

## Phase 1 — List shell & navigation (foundation)

**Goal:** Prove access, layout, and read-path stability without mutations.

| ID | Focus |
|----|--------|
| SR-PH1-TC-001 | Logged-in user opens **Sales Returns**; heading + subtitle visible |
| SR-PH1-TC-002 | **Create Return Order** navigates to `/o2c/sales-returns/new` |
| SR-PH1-TC-003 | Statistics cards render (Total / Pending / Completed / Total Value) or graceful empty |
| SR-PH1-TC-004 | Table or empty state loads without error (no unhandled API toast) |
| SR-PH1-TC-005 | Breadcrumb / back consistency (optional if wrapper exposes it) |

**Test data:** None required (read-only page).

**Exit criteria:** 5/5 passing on `iacs-md`.

**Status (2026-03-22):** ✅ **Gate met** — `e2e/features/o2c/sales-returns/sales-returns.feature`, `SalesReturnsListPage.ts`, `sales-returns-steps.ts`; `npm run test:dev -- --project=iacs-md --grep "@SR-PH1"` **5/5** (see [IMPL-046](../../../implementations/2026-03/IMPL-053_sales-returns-consolidated.md)). **Phase 2** may proceed.

---

## Phase 2 — List filters, search, pagination

**Goal:** Server-driven list behaviour matches `SalesReturnsListClient` + `getReturnOrders`.

| ID | Focus |
|----|--------|
| SR-PH2-TC-001 | **Status** facet: filter **Pending** (or another status with data) |
| SR-PH2-TC-002 | **Return reason** facet (single reason) |
| SR-PH2-TC-003 | **Search** by substring of an existing `return_order_number` (seed or known env) |
| SR-PH2-TC-004 | Clear filters → list resets |
| SR-PH2-TC-005 | **Pagination**: go to page 2 when `totalPages > 1` (skip if single page) |

**Design note:** Placeholder mentions invoice number; **confirm** whether backend supports invoice search in `filters.search`. If not, document as known gap and test only return number.

**Gap (documented):** `getReturnOrders` applies `ilike` on **`return_order_number` only** (`returnOrderActions.ts`). The list UI placeholder still says *“invoice number”* — invoice substring search is **not** covered by E2E until product aligns API or copy.

**Exit criteria:** All Phase 2 scenarios green; gap documented if search ≠ placeholder.

**Status (2026-03-22):** ✅ **Gate met** — scenarios **SR-PH2-TC-001–005** in `sales-returns.feature`; `npm run test:dev -- --project=iacs-md --grep "@SR-PH2"` **5/5** (see [IMPL-047](../../../implementations/2026-03/IMPL-053_sales-returns-consolidated.md)). **Phase 3** may proceed.

---

## Phase 3 — Create return order (happy path)

**Goal:** 3-step wizard creates a return and lands on detail page.

| ID | Focus |
|----|--------|
| SR-PH3-TC-001 | Step 1: pick **eligible** invoice + dealer → load items with `available_to_return > 0` |
| SR-PH3-TC-002 | Step 2: set return qty on ≥1 line (≤ available) |
| SR-PH3-TC-003 | Step 3: choose header **return reason** + optional notes → submit |
| SR-PH3-TC-004 | Assert redirect to `/o2c/sales-returns/{id}` and status **pending** (or equivalent UI) |

**Test data:** Requires invoice with returnable quantity (reuse from finance/O2C E2E stable data or read-only DB helper to pick `invoice_id` — follow **test independence** / `AUTO_QA_` prefix rules).

**Exit criteria:** One full create path green; sandwich optional (SELECT `sales_return_orders` by number if allowed read-only).

**Automation notes (2026-03-22):**
- **Return reason** is chosen on **step 1** in the UI (`#returnReason` before **Load Invoice Items**), not only on the review step — tests follow the app.
- **Invoice / dealer triggers:** After selection, the `SearchableSelectDialog` trigger no longer exposes “Select Invoice…” in the accessible name; POM scopes to the **Step 1** card (`h2` → parent) and uses button order (invoice → dealer → Load).
- **Dealer auto-fill** from invoice can miss if dealers load late or `dealers.find` fails; step asserts dealer with **fallback** to open dealer dialog and search by `dealer_code` from DB.
- **Read-only SQL:** `sales_return_order_items` FK to `sales_return_orders` is `return_order_id` (not `sales_return_order_id`). Eligible invoice query joins `master_dealers` with **`is_active = true`** to align with `getDealers()`.

**Status (2026-03-22):** ✅ **Gate met** — `e2e/features/o2c/sales-returns/sales-returns.feature` (`@SR-PH3-TC-001`–`004`); `CreateSalesReturnOrderPage.ts`; `getInvoiceWithReturnableLinesForE2ETenant` in `o2c-db-helpers.ts`; `npm run test:dev -- --project=iacs-md --grep "@SR-PH3"` **1/1** (see [IMPL-048](../../../implementations/2026-03/IMPL-053_sales-returns-consolidated.md)). **Phase 4** may proceed.

---

## Phase 4 — Detail + record goods receipt

**Goal:** Pending → received workflow.

| ID | Focus |
|----|--------|
| SR-PH4-TC-001 | Detail page shows **Record Goods Receipt** + **Cancel Return Order** when `pending` |
| SR-PH4-TC-002 | Record receipt: select warehouse, item quantities, submit → status **received** |
| SR-PH4-TC-003 | **Cancel Return Order** not shown after received (state check) |
| SR-PH4-TC-004 | GRN with **QC Passed** → `inventory.available_units` (sum by package + SO warehouse) increases by **return_quantity** (read-only before/after) |

**Test data:** Depends on Phase 3 output **or** dedicated setup step creating a pending return in the same scenario.

**Exit criteria:** Receipt path green in staging; edge errors documented if env unstable.

**Automation notes (2026-03-23):**
- UI may show **Goods Received** or advance to **Credit Memo Created** after receipt; DB sandwich accepts `received` **or** `credit_memo_created`.
- **Gate met** — `sales-returns.feature` (receipt + inventory sandwich); `SalesReturnDetailPage.ts`; `npm run test:dev -- --project=iacs-md --grep "@SR-PH4"` (pack: `@sales-returns` **19/19** on `iacs-md` as of IMPL-052). See [IMPL-050](../../../implementations/2026-03/IMPL-053_sales-returns-consolidated.md), [IMPL-051](../../../implementations/2026-03/IMPL-053_sales-returns-consolidated.md), [IMPL-052](../../../implementations/2026-03/IMPL-053_sales-returns-consolidated.md).

---

## Phase 5 — Credit memo from return (+ optional E-credit retry)

**Goal:** Received → credit memo; cover retry UI when e-credit pending.

| ID | Focus |
|----|--------|
| SR-PH5-TC-001 | **Create Credit Memo** from received return (no CM yet) → lands on `/finance/credit-memos/{id}` or success on return detail |
| SR-PH5-TC-002 | Return detail reflects **credit_memo_created** / linked CM |
| SR-PH5-TC-003 | **Retry E-Credit Note** shell: DB-picked return + CM pending/no IRN; **skip** if no row (no GST portal assertion) |

**Cross-module:** Finance credit memo page — reuse existing POMs if present.

**Exit criteria:** At least SR-PH5-TC-001 green; retry tagged or skipped with reason.

**Status (2026-03-23):** ✅ **TC-001–003 met** — second scenario in `sales-returns.feature`: after receipt, either **Create Credit Memo** dialog → `/finance/credit-memos/{id}` (**Credit Memo Details**) or already-linked CM on return detail (`.first()` on duplicate badge text). **SR-PH5-TC-003** — third scenario: read-only DB lookup for return + CM with pending/missing e-credit (no IRN); asserts **Retry E-Credit Note** + dialog shell; **skips** if no matching row (see [IMPL-051](../../../implementations/2026-03/IMPL-053_sales-returns-consolidated.md)).

---

## Phase 6 — Cancel return + negative / validation

**Goal:** Safe cancellation and guardrails.

| ID | Focus |
|----|--------|
| SR-PH6-TC-001 | **Cancel Return Order** requires reason; empty → validation |
| SR-PH6-TC-002 | With reason → cancelled; cancellation reason visible on detail |
| SR-PH6-TC-003 | Create flow: **no items selected** → cannot proceed to review |
| SR-PH6-TC-004 | Create flow: return qty **>** available → blocked (alert or inline) |

**Exit criteria:** Validation scenarios stable; no duplicate coverage with Phase 3–4.

**Status (2026-03-23):** ✅ **Gate met** — `sales-returns.feature`; native `alert()` handled via `page.once('dialog', …)` + `HTMLButtonElement.click()` / keyboard entry after removing `max` on quantity input. See [IMPL-050](../../../implementations/2026-03/IMPL-053_sales-returns-consolidated.md).

---

## Phase 7 — Report + RBAC (optional / lower priority)

**Goal:** `/o2c/reports/sales-return` and permission denial.

| ID | Focus |
|----|--------|
| SR-PH7-TC-001 | User with `sales_orders` **read** opens report; core content loads |
| SR-PH7-TC-002 | **`@iacs-ed`** (+ `@multi-user`): report URL → **`/restrictedUser`** or tenant-aware **skip** |

**Exit criteria:** TC-001 authorized path green; TC-002 denied-or-skip documented (tenant-aware).

**Status (2026-03-23):** ✅ **SR-PH7-TC-001–002** — `sales-returns.feature`, `SalesReturnReportPage.ts`. **SR-PH7-TC-002** runs under **`iacs-ed`** (`playwright.config.ts` `testMatch` includes this feature spec); asserts redirect to **`/restrictedUser`** or **skips** if ED has report access in tenant (see IMPL-041-style note in [IMPL-051](../../../implementations/2026-03/IMPL-053_sales-returns-consolidated.md)).

---

## Phase 8 — Inventory invariants (QC Failed path)

**Goal:** Ensure GRN with **QC Failed** does not increase warehouse inventory.

| ID | Focus |
|----|--------|
| SR-PH8-TC-001 | Create return order → note inventory baseline for first line package + SO warehouse → record goods receipt with **QC Failed** → assert inventory delta = 0 |
| SR-PH8-TC-002 | Create return order → note inventory baseline for first line package + SO warehouse → cancel while **Pending Receipt** (before GRN) → assert inventory delta = 0 |
| SR-PH8-TC-003 | Create return order → GRN (**QC Passed**) increases inventory once → capture post-GRN baseline → run credit memo flow → assert no additional inventory delta |
| SR-PH8-TC-004 | Create return with at least two eligible lines → baseline package buckets → GRN (**QC Passed**) → assert per-package delta equals aggregated return quantities |

**Exit criteria:** DB sandwich consistently confirms no `inventory.available_units` increase for QC failed receipts.

**Status (2026-03-23):** ✅ **SR-PH8-TC-001–004** implemented in `sales-returns.feature`; step logic in `sales-returns-steps.ts`; includes QC Failed, pre-GRN cancel, post-credit-memo, and multi-line GRN reconciliation invariants.

---

## Artifact map (incremental)

| Phase | Feature file(s) | POM(s) | Steps |
|-------|-----------------|--------|--------|
| 1–2 | `sales-returns.feature` | `SalesReturnsListPage.ts` | `sales-returns-steps.ts` |
| 3 | `sales-returns.feature` | `CreateSalesReturnOrderPage.ts` | `sales-returns-steps.ts` |
| 4–5 | `sales-returns.feature` | `SalesReturnDetailPage.ts`, `CreateSalesReturnOrderPage.ts` | `sales-returns-steps.ts` |
| 6 | `sales-returns.feature` | `CreateSalesReturnOrderPage.ts`, `SalesReturnDetailPage.ts` | `sales-returns-steps.ts` |
| 7 | `sales-returns.feature` | `SalesReturnReportPage.ts` | `sales-returns-steps.ts` |
| 8 | `sales-returns.feature` | `SalesReturnDetailPage.ts`, `CreateSalesReturnOrderPage.ts` | `sales-returns-steps.ts` |

---

## Run commands

```bash
# After each phase (replace tag)
npm run bdd:generate && npm run test:dev -- --project=iacs-md --grep "@SR-PH1"

# Full sales returns pack (when all phases merged)
npm run bdd:generate && npm run test:dev -- --project=iacs-md --grep "@sales-returns"
```

Suggested **tag convention:** `@sales-returns @SR-PH1 @smoke` etc.

---

## Documentation checklist (per persona, end of each phase)

- [ ] `docs/modules/o2c/sales-returns/test-cases.md` (create on Phase 1 start)
- [ ] `docs/modules/o2c/knowledge.md` — Sales Returns testing blurb
- [ ] `docs/test-cases/TEST_CASE_REGISTRY.md` — scenario hashes
- [ ] `docs/test-cases/test-impact-matrix.md` — map to `web_app` paths
- [ ] `docs/implementations/YYYY-MM/IMPL-###_sales-returns-phase-N.md` — optional but recommended

---

## Risk register

| Risk | Mitigation |
|------|------------|
| Edge function / GST flakiness | Isolate UI assertions; skip or mock-heavy scenarios with `@skip-staging` |
| No returnable invoice in env | Read-only SQL helper + env `E2E_SR_INVOICE_ID` override |
| Search vs placeholder mismatch | Phase 2 design gate: confirm API, then test or file product defect |

---

**Version:** 1.1  
**Last updated:** 2026-03-23
