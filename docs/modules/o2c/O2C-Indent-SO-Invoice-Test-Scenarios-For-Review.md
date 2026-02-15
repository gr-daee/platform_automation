# O2C Indent → Sales Order → Invoice — Test Scenarios & Plan (For Review)

**Scope:** Full Order-to-Cash flow from Indent creation through Sales Order to Invoice and eInvoice.  
**Routes:** `/o2c/indents`, `/o2c/indents/[id]`, `/o2c/sales-orders`, `/o2c/invoices`  
**Permissions:** `indents` (read, create, update, approve), `sales-orders`, `invoices`  
**Framework:** Playwright-BDD, BasePage, IndentsPage, IndentDetailPage; semantic locators. See [LOCATOR_STRATEGY.md](../../framework/LOCATOR_STRATEGY.md).

This document lists **all test scenarios** for automation, **segregated by flow block (chapter)**, with **test case ID**, **Status** column for tracking, and **feature file** references. Implementation can proceed **one block/chapter at a time**.

---

## Development Status (Living Document)

Track progress per scenario using the **Status** column in each table.

| Status | Meaning |
|--------|--------|
| **To Start** | Not yet implemented; planned for automation. |
| **In Progress** | Implementation or debugging in progress. |
| **Automated** | Implemented and included in the test suite (passing). |
| **To Be Ignored** | Decided to skip (manual only, out of scope, or deprecated). |
| **Blocked** | Cannot proceed (dependency, environment, or scope blocker). |

**Progress summary** — update counts when you change a scenario's Status.

| Status | Count |
|--------|--------|
| To Start | 34 |
| In Progress | 0 |
| Automated | 26 |
| To Be Ignored | 0 |
| Blocked | 0 |

---

## Test Plan Summary

### Smoke vs Regression

- **Smoke:** Critical path (list load, create indent, submit, one approval path, one SO/Invoice check). Tag: `@smoke @regression @p0`.
- **Regression:** All scenarios guard against regressions. Tag: `@regression` with `@p1` or `@p2`.

### Test Case ID Strategy

| SubModule | Convention | Example |
|-----------|------------|---------|
| **Indent** | `O2C-INDENT-TC-NNN` | O2C-INDENT-TC-001 |
| **Sales Order** | `O2C-SO-TC-NNN` | O2C-SO-TC-001 |
| **Invoice / eInvoice** | `O2C-INV-TC-NNN` | O2C-INV-TC-001 |

**Tags:** `@o2c-flow` (optional, run all O2C flow tests), `@iacs-tenant @iacs-md`, `@smoke` / `@regression`, `@p0` / `@p1` / `@p2`.

### Feature Files

| Flow | Feature File |
|------|--------------|
| Indent (list, create, edit, products, warehouse, approve, process) | `e2e/features/o2c/indents.feature` |
| Sales Order (SO list, SO detail, verify vs indent, credit hold, back order) | `e2e/features/o2c/sales-orders.feature` (To Start) |
| Invoice (generate eInvoice, model, Bill to/Ship to, PDF) | `e2e/features/o2c/invoices.feature` (To Start) |

### Run Commands

```bash
# All O2C Indent tests (current)
npm run test:regression -- e2e/features/o2c/indents.feature
npm run test:dev       -- e2e/features/o2c/indents.feature

# By tag (when @o2c-flow used)
npm run test:regression -- --grep "@o2c-flow"
```

---

## 1. Indent Creation — Dealer Selection (Name or Code)

| TC ID | Scenario | Smoke/Reg | Tags | Status | Auto | Feature File | Notes |
|-------|----------|-----------|------|--------|------|--------------|--------|
| O2C-INDENT-TC-001 | O2C Indents list page loads with title, status cards, table or empty state | Smoke | @smoke @critical @regression @p0 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-002 | Create Indent by selecting dealer (by name) creates new indent and navigates to detail | Smoke | @smoke @critical @regression @p0 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-003 | Create Indent for dealer with existing draft loads that draft (no duplicate) | Regression | @regression @p1 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-012 | User searches and selects dealer from Create Indent modal (by name) | Regression | @regression @dealer-search @p1 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-039 | User searches dealer by dealer code and selects | Regression | @regression @dealer-search @p1 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-040 | Search non-existent dealer shows no matching dealers | Regression | @regression @dealer-search @p2 | Automated | ✅ | indents.feature | |

---

## 2. Edit Indent — Add Product (Name/Code, Multi-Select, Quantity, Totals)

| TC ID | Scenario | Smoke/Reg | Tags | Status | Auto | Feature File | Notes |
|-------|----------|-----------|------|--------|------|--------------|--------|
| O2C-INDENT-TC-024 | Indent detail page loads with heading and Indent Information | Regression | @regression @p1 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-025 | Edit → Add Product (search by name/code) → add → Save persists | Smoke | @regression @p0 | Automated | ✅ | indents.feature | Single product; multi-select in UI. |
| O2C-INDENT-TC-026 | Submit indent after adding product | Regression | @regression @p1 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-041 | Search product by product code shows results in Add Products modal | Regression | @regression @p1 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-042 | Search non-existent product shows no matching products | Regression | @regression @p2 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-043 | Add multiple products in one Add Products session (multi-select) | Regression | @regression @p1 | To Start | ❌ | indents.feature | Select 2+ products, Add (N). |
| O2C-INDENT-TC-044 | Adjust quantity for a line item and verify totals update | Regression | @regression @p1 | To Start | ❌ | indents.feature | Edit qty, assert Indent total. |
| O2C-INDENT-TC-045 | Verify indent totals match sum of line items (unit price × qty) | Regression | @regression @p2 | To Start | ❌ | indents.feature | DB or UI total. |
| O2C-INDENT-TC-030 | Submit Indent button is disabled when indent has no items | Regression | @regression @p1 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-035 | Draft indent shows Edit and Submit Indent; Approve/Process Workflow not visible | Regression | @regression @p1 | Automated | ✅ | indents.feature | |

---

## 3. Warehouse & Transporter

| TC ID | Scenario | Smoke/Reg | Tags | Status | Auto | Feature File | Notes |
|-------|----------|-----------|------|--------|------|--------------|--------|
| O2C-INDENT-TC-027 | Submitted indent shows Warehouse Selection; selecting warehouse enables Approve | Regression | @regression @p1 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-031 | Approve button is disabled when warehouse not selected (submitted indent) | Regression | @regression @p1 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-046 | Select transporter when dealer has no default transporter | Regression | @regression @p1 | To Start | ❌ | indents.feature | Submitted state; Transporter selector. |
| O2C-INDENT-TC-047 | Dealer with default transporter shows pre-selected transporter | Regression | @regression @p2 | To Start | ❌ | indents.feature | |

---

## 4. Approve / Reject with Comments

| TC ID | Scenario | Smoke/Reg | Tags | Status | Auto | Feature File | Notes |
|-------|----------|-----------|------|--------|------|--------------|--------|
| O2C-INDENT-TC-028 | Approve indent with optional comments after selecting warehouse | Regression | @regression @p1 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-032 | Reject button in approval dialog is disabled until comment provided | Regression | @regression @p1 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-048 | Reject indent with required comments and verify status → Rejected | Regression | @regression @p1 | To Start | ❌ | indents.feature | Full reject flow; status badge. |
| O2C-INDENT-TC-036 | Submitted indent shows Warehouse Selection and Approve and Reject buttons | Regression | @regression @p1 | Automated | ✅ | indents.feature | |

---

## 5. Approval Checks (90-Day Due, Credit Limit, Stock Warning)

| TC ID | Scenario | Smoke/Reg | Tags | Status | Auto | Feature File | Notes |
|-------|----------|-----------|------|--------|------|--------------|--------|
| O2C-INDENT-TC-049 | Approval blocked when dealer has due invoices beyond 90 days (server message) | Regression | @regression @p1 | To Start | ❌ | indents.feature | Need test data: dealer with 90+ day due. |
| O2C-INDENT-TC-050 | Credit limit check: UI shows Credit Warning when insufficient; Approve may block | Regression | @regression @p1 | To Start | ❌ | indents.feature | Badge "Credit Warning" vs "Credit OK". |
| O2C-INDENT-TC-051 | Stock warning shown when selected warehouse has insufficient stock (partial/full) | Regression | @regression @p1 | To Start | ❌ | indents.feature | "Approve with Back Orders" / warning banner. |

---

## 6. Process Workflow (Approved Indent → SO / Back Order)

| TC ID | Scenario | Smoke/Reg | Tags | Status | Auto | Feature File | Notes |
|-------|----------|-----------|------|--------|------|--------------|--------|
| O2C-INDENT-TC-029 | Process Workflow creates Sales Order or Back Order from approved indent | Smoke | @regression @p0 | Automated | ✅ | indents.feature | Toast/workflow success. |
| O2C-INDENT-TC-037 | Approved indent shows Process Workflow button | Regression | @regression @p1 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-052 | Process Workflow dialog shows SO vs Back Order split (preview) before Confirm | Regression | @regression @p2 | To Start | ❌ | indents.feature | |

---

## 7. Back Order (No Stock)

| TC ID | Scenario | Smoke/Reg | Tags | Status | Auto | Feature File | Notes |
|-------|----------|-----------|------|--------|------|--------------|--------|
| O2C-SO-TC-001 | When any item has no stock, Back Order is created (one per item or as per product) | Regression | @regression @p1 | To Start | ❌ | sales-orders.feature | After Process Workflow; verify back_orders. |
| O2C-SO-TC-002 | Back Order list/detail shows correct items and quantities | Regression | @regression @p2 | To Start | ❌ | sales-orders.feature | |

---

## 8. Credit Hold in SO

| TC ID | Scenario | Smoke/Reg | Tags | Status | Auto | Feature File | Notes |
|-------|----------|-----------|------|--------|------|--------------|--------|
| O2C-SO-TC-003 | SO shows Credit Hold when dealer credit limit not available | Regression | @regression @p1 | To Start | ❌ | sales-orders.feature | Need data: dealer at limit. |
| O2C-SO-TC-004 | SO without credit hold can proceed to Invoice | Regression | @regression @p1 | To Start | ❌ | sales-orders.feature | |

---

## 9. SO Creation & Verification (SO as per Indent)

| TC ID | Scenario | Smoke/Reg | Tags | Status | Auto | Feature File | Notes |
|-------|----------|-----------|------|--------|------|--------------|--------|
| O2C-SO-TC-005 | SO is created for available products and within credit limit | Regression | @regression @p1 | To Start | ❌ | sales-orders.feature | After Process Workflow. |
| O2C-SO-TC-006 | Verify SO line items match indent items (product, quantity, amounts) | Regression | @regression @p1 | To Start | ❌ | sales-orders.feature | SO detail vs indent snapshot or DB. |
| O2C-SO-TC-007 | SO detail page shows linked Indent reference | Regression | @regression @p2 | To Start | ❌ | sales-orders.feature | |
| O2C-SO-TC-008 | SO list filters by status and shows correct status for new SO | Regression | @regression @p2 | To Start | ❌ | sales-orders.feature | |

---

## 10. Generate eInvoice (Model, Bill to/Ship to, Totals, Shipper)

| TC ID | Scenario | Smoke/Reg | Tags | Status | Auto | Feature File | Notes |
|-------|----------|-----------|------|--------|------|--------------|--------|
| O2C-INV-TC-001 | From SO or approved indent: open Generate eInvoice (model/modal) | Regression | @regression @p1 | To Start | ❌ | invoices.feature | |
| O2C-INV-TC-002 | Verify Bill to and Ship to details in eInvoice model | Regression | @regression @p1 | To Start | ❌ | invoices.feature | |
| O2C-INV-TC-003 | Verify Dispatch and Seller details in eInvoice model | Regression | @regression @p1 | To Start | ❌ | invoices.feature | |
| O2C-INV-TC-004 | Verify Invoice totals (taxable value, tax, total) in model | Regression | @regression @p1 | To Start | ❌ | invoices.feature | |
| O2C-INV-TC-005 | Select Shipper if not already selected | Regression | @regression @p1 | To Start | ❌ | invoices.feature | |
| O2C-INV-TC-006 | Generate eInvoice succeeds and IRN/ack received | Regression | @regression @p0 | To Start | ❌ | invoices.feature | |

---

## 11. Invoice Generated — eInvoice PDF Download & Verify

| TC ID | Scenario | Smoke/Reg | Tags | Status | Auto | Feature File | Notes |
|-------|----------|-----------|------|--------|------|--------------|--------|
| O2C-INV-TC-007 | After eInvoice generated: Generate eInvoice PDF is available | Regression | @regression @p1 | To Start | ❌ | invoices.feature | |
| O2C-INV-TC-008 | Download eInvoice PDF and verify key details (dealer, amounts, IRN, etc.) | Regression | @regression @p2 | To Start | ❌ | invoices.feature | Parse PDF or visual; DoD. |

---

## 12. Impact on SO (Inventory)

| TC ID | Scenario | Smoke/Reg | Tags | Status | Auto | Feature File | Notes |
|-------|----------|-----------|------|--------|------|--------------|--------|
| O2C-SO-TC-009 | Inventory stock is allocated as per SO (allocation record created) | Regression | @regression @p1 | To Start | ❌ | sales-orders.feature | DB: allocation or inventory reserve. |
| O2C-SO-TC-010 | Allocation deducted after Invoice; total inventory reduced for batch/warehouse | Regression | @regression @p1 | To Start | ❌ | sales-orders.feature | Sandwich: stock before/after invoice. |
| O2C-SO-TC-011 | Inventory allocation follows FEFO (First Expiry First Out) | Regression | @regression @p2 | To Start | ❌ | sales-orders.feature | Verify batch/expiry in allocation. |

---

## 13. Impact on Invoice (GL, Stock, Dealer Ledger)

| TC ID | Scenario | Smoke/Reg | Tags | Status | Auto | Feature File | Notes |
|-------|----------|-----------|------|--------|------|--------------|--------|
| O2C-INV-TC-009 | Invoice creation posts GL entry (or GL ready for posting) | Regression | @regression @p1 | To Start | ❌ | invoices.feature | DB or integration. |
| O2C-INV-TC-010 | Stock reduction applied for invoiced quantities | Regression | @regression @p1 | To Start | ❌ | invoices.feature | |
| O2C-INV-TC-011 | Dealer outstanding is increased by invoice amount | Regression | @regression @p1 | To Start | ❌ | invoices.feature | |
| O2C-INV-TC-012 | Invoice due date is as per dealer payment terms | Regression | @regression @p2 | To Start | ❌ | invoices.feature | |
| O2C-INV-TC-013 | Dealer Ledger shows invoice entry | Regression | @regression @p2 | To Start | ❌ | invoices.feature | |

---

## 14. List & Navigation (Indents, SO, Invoices)

| TC ID | Scenario | Smoke/Reg | Tags | Status | Auto | Feature File | Notes |
|-------|----------|-----------|------|--------|------|--------------|--------|
| O2C-INDENT-TC-004 | Search indents by dealer name or indent number filters the list | Regression | @regression @p1 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-005 | Filter by Status shows only matching indents | Regression | @regression @p1 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-006 | Clear filters restores the full list | Regression | @regression @p1 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-008 | Clicking an indent row navigates to indent detail page | Regression | @regression @p1 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-023 | When no indents match the filter the empty state is shown | Regression | @regression @p2 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-038 | Back from indent detail returns to list | Regression | @regression @p2 | Automated | ✅ | indents.feature | |

---

## Summary by Chapter

| Chapter | To Start | Automated | Total |
|---------|----------|-----------|--------|
| 1. Indent Creation (Dealer) | 0 | 6 | 6 |
| 2. Edit / Add Product / Totals | 3 | 7 | 10 |
| 3. Warehouse & Transporter | 2 | 2 | 4 |
| 4. Approve / Reject | 1 | 3 | 4 |
| 5. Approval Checks | 3 | 0 | 3 |
| 6. Process Workflow | 1 | 2 | 3 |
| 7. Back Order | 2 | 0 | 2 |
| 8. Credit Hold SO | 2 | 0 | 2 |
| 9. SO Creation & Verify | 4 | 0 | 4 |
| 10. Generate eInvoice | 6 | 0 | 6 |
| 11. Invoice PDF | 2 | 0 | 2 |
| 12. Impact on SO | 3 | 0 | 3 |
| 13. Impact on Invoice | 5 | 0 | 5 |
| 14. List & Navigation | 0 | 6 | 6 |
| **Total** | **34** | **26** | **60** |

*(Counts: 26 Automated = existing indent tests; 34 To Start. Update Progress summary at top when scenario Status changes.)*

---

## Implementation Order (One Block at a Time)

1. **Block 1 (Done):** Indent list, create by dealer name/code, edit, add product, save, submit, warehouse, approve/reject, process workflow — `indents.feature`.
2. **Block 2:** Multi-select products, adjust quantity, verify totals (O2C-INDENT-TC-043 to 045).
3. **Block 3:** Transporter selection (O2C-INDENT-TC-046, 047); Reject flow (O2C-INDENT-TC-048).
4. **Block 4:** Approval checks — 90-day, credit limit, stock warning (O2C-INDENT-TC-049 to 051); Process Workflow preview (O2C-INDENT-TC-052).
5. **Block 5:** Sales Order feature file and POM; Back Order (O2C-SO-TC-001, 002); Credit Hold (O2C-SO-TC-003, 004); SO verify (O2C-SO-TC-005 to 008); Inventory impact (O2C-SO-TC-009 to 011).
6. **Block 6:** Invoice feature file and POM; eInvoice model and generate (O2C-INV-TC-001 to 006); PDF (O2C-INV-TC-007, 008); Invoice impacts (O2C-INV-TC-009 to 013).

---

## Framework Assumptions

- **Users:** IACS MD User (or equivalent) with `indents` create/update/approve; same for SO/Invoice when implemented.
- **Test data:** Active dealer (e.g. VAYUPUTRA AGENCIES), products (e.g. search "NPK"), warehouse(s), transporter; use `AUTO_QA_` prefix for transactional data.
- **Read-only DB for assertions:** SELECT only; Sandwich Method where applicable for counts/state.
- **Feature files:** `e2e/features/o2c/indents.feature` (current); `sales-orders.feature` and `invoices.feature` to be added.

---

## Reference: Existing O2C Indent Test IDs (Aligned)

All existing IDs are listed in the chapter tables above with Status = Automated. For full Gherkin and step details see `docs/modules/o2c/test-cases.md`. For registry see `docs/test-cases/TEST_CASE_REGISTRY.md`.

**Tag examples (existing):**
```gherkin
@O2C-INDENT-TC-001 @smoke @critical @regression @iacs-tenant @iacs-md
@O2C-INDENT-TC-027 @regression @iacs-tenant @iacs-md
```

**New scenarios (when implemented):**
```gherkin
@O2C-SO-TC-001 @regression @iacs-tenant @iacs-md
@O2C-INV-TC-001 @regression @iacs-tenant @iacs-md
```
