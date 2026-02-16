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
| To Start | 23 |
| In Progress | 0 |
| Automated | 37 |
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

**Numbering:** O2C-INDENT-TC-001 through TC-020 (sequential). See [test-cases.md](./test-cases.md) for full details.

| TC ID | Scenario | Smoke/Reg | Tags | Status | Auto | Feature File | Notes |
|-------|----------|-----------|------|--------|------|--------------|--------|
| O2C-INDENT-TC-001 | Create Indent by selecting dealer (by name) creates new indent and navigates to detail | Smoke | @smoke @critical @regression @p0 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-002 | Create Indent for dealer with existing draft loads that draft (no duplicate) | Regression | @regression @p1 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-003 | User searches and selects dealer from Create Indent modal (by name) | Regression | @regression @dealer-search @p1 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-007 | User searches dealer by dealer code and selects | Regression | @regression @dealer-search @p1 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-008 | Search non-existent dealer shows no matching dealers | Regression | @regression @dealer-search @p2 | Automated | ✅ | indents.feature | |

---

## 2. Edit Indent — Add Product (Name/Code, Multi-Select, Quantity, Totals)

| TC ID | Scenario | Smoke/Reg | Tags | Status | Auto | Feature File | Notes |
|-------|----------|-----------|------|--------|------|--------------|--------|
| O2C-INDENT-TC-004 | Edit → Add Product (search by name/code) → add → Save persists | Smoke | @regression @p0 | Automated | ✅ | indents.feature | Single product. |
| O2C-INDENT-TC-005 | Submit indent after adding product | Regression | @regression @p1 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-009 | Search non-existent product shows no matching products | Regression | @regression @p2 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-010 | Submit Indent button is disabled when indent has no items | Regression | @regression @p1 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-011 | Draft indent shows Edit and Submit Indent; Approve/Process Workflow not visible | Regression | @regression @p1 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-012 | Full straight path: list → create → detail → add 2 products → submit → warehouse → approve → Process Workflow → SO | Smoke | @smoke @critical @regression @p0 | Automated | ✅ | indents.feature | Consolidates former list/detail/product/approval scenarios. |

---

## 3. Warehouse & Transporter

| TC ID | Scenario | Smoke/Reg | Tags | Status | Auto | Feature File | Notes |
|-------|----------|-----------|------|--------|------|--------------|--------|
| O2C-INDENT-TC-016 | Select transporter when dealer has no default transporter | Regression | @regression @p1 | Automated | ✅ | indents.feature | Dealer IACS3039 (no transporter). |
| O2C-INDENT-TC-017 | Dealer with default transporter shows pre-selected transporter | Regression | @regression @p2 | Automated | ✅ | indents.feature | Ramesh ningappa diggai (Own Transport). |

---

## 4. Approve / Reject with Comments

| TC ID | Scenario | Smoke/Reg | Tags | Status | Auto | Feature File | Notes |
|-------|----------|-----------|------|--------|------|--------------|--------|
| O2C-INDENT-TC-013 | Reject button in approval dialog is disabled until comment provided | Regression | @regression @p1 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-014 | Reject indent with required comments and verify status → Rejected | Regression | @regression @p1 | Automated | ✅ | indents.feature | Full reject flow; status badge. |

---

## 5. Approval Checks (90-Day Due, Credit Limit, Stock Warning)

| TC ID | Scenario | Smoke/Reg | Tags | Status | Auto | Feature File | Notes |
|-------|----------|-----------|------|--------|------|--------------|--------|
| O2C-INDENT-TC-015 | Approval blocked when dealer has due invoices beyond 90 days (server message) | Regression | @regression @p1 | Automated | ✅ | indents.feature | Uses VAYUPUTRA AGENCIES (90+ day due). |
| O2C-INDENT-TC-018 | Credit limit check: UI shows Credit Warning when insufficient | Regression | @regression @p1 | Automated | ✅ | indents.feature | Dealer IACS1650 (insufficient credit). |
| O2C-INDENT-TC-019 | Stock warning shown when selected warehouse has insufficient stock (partial/full) | Regression | @regression @p1 | Automated | ✅ | indents.feature | Add 1013, 1041 (in stock at Kurnook) and NPK (not in stock); select Kurnook → stock warning for NPK. |

---

## 6. Process Workflow (Approved Indent → SO / Back Order)

| TC ID | Scenario | Smoke/Reg | Tags | Status | Auto | Feature File | Notes |
|-------|----------|-----------|------|--------|------|--------------|--------|
| O2C-INDENT-TC-012 | Full straight path includes Process Workflow → SO created | Smoke | @smoke @critical @p0 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-006 | Back from indent detail returns to list | Regression | @regression @p1 | Automated | ✅ | indents.feature | |
| O2C-INDENT-TC-020 | Process Workflow dialog shows SO vs Back Order split (preview) before Confirm | Regression | @regression @p2 | Automated | ✅ | indents.feature | Assert dialog then cancel. |

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
| 2. Edit / Add Product / Totals | 0 | 10 | 10 |
| 3. Warehouse & Transporter | 0 | 4 | 4 |
| 4. Approve / Reject | 0 | 4 | 4 |
| 5. Approval Checks | 0 | 3 | 3 |
| 6. Process Workflow | 0 | 3 | 3 |
| 7. Back Order | 2 | 0 | 2 |
| 8. Credit Hold SO | 2 | 0 | 2 |
| 9. SO Creation & Verify | 4 | 0 | 4 |
| 10. Generate eInvoice | 6 | 0 | 6 |
| 11. Invoice PDF | 2 | 0 | 2 |
| 12. Impact on SO | 3 | 0 | 3 |
| 13. Impact on Invoice | 5 | 0 | 5 |
| 14. List & Navigation | 0 | 6 | 6 |
| **Total** | **31** | **29** | **60** |

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
- **Test data:** Active dealer (e.g. VAYUPUTRA AGENCIES), products (e.g. search product code "1013"), warehouse(s), transporter; use `AUTO_QA_` prefix for transactional data.
- **Read-only DB for assertions:** SELECT only; Sandwich Method where applicable for counts/state.
- **Feature files:** `e2e/features/o2c/indents.feature` (current); `sales-orders.feature` and `invoices.feature` to be added.

---

## Test Design & Data Strategy (Reduce Indent Creation)

**Problem:** Current tests create many indents per run; reuse of existing drafts causes "Already Added" and flakiness.

**Design doc:** [FEATURE-001_indent-test-design-and-data-profiles.md](features/FEATURE-001_indent-test-design-and-data-profiles.md) — Test Data Profiles, journey-based E2E, and scenario grouping.

**Principles:**
- **Test Data Profile:** Each use case has a named profile (dealer + product + warehouse where needed). One profile = one set of test data.
- **One indent per journey:** E2E journey scenarios create **one** indent and validate multiple steps (create → add product → submit → warehouse → approve → process).
- **Focused scenarios by profile:** Scenarios that need specific data (90-day block, credit warning, stock warning) use their **dedicated profile** and create **one indent** for that validation only.
- **List/navigation: no new indent:** List load, search, filter, row click, back — use existing list data.

**Profiles (summary):**

| Profile | Dealer | Use for |
|---------|--------|---------|
| P-APPROVAL | Ramesh ningappa diggai | Approval flow, Process Workflow, default transporter |
| P-REJECT / P-90DAY | VAYUPUTRA AGENCIES | Reject flow; 90+ days approval block |
| P-NO-TRANSPORT | IACS3039 | Select transporter when no default |
| P-DEFAULT-TRANSPORT | Ramesh ningappa diggai | Pre-selected transporter |
| P-CREDIT-WARN | IACS1650 | Credit Warning |
| P-STOCK-WARN | Ramesh + 1013, 1041, NPK + Kurnook Warehouse | Stock warning (1013/1041 in stock; NPK not in stock at Kurnook) |
| P-EMPTY-DRAFT | Dealer with no existing draft | Submit disabled when no items |

**Implementation:** Tag scenarios with `@profile-P-APPROVAL`, `@profile-P-REJECT`, etc.; add one E2E journey scenario (one indent for create → approve → Process Workflow preview); consolidate focused scenarios by profile. See FEATURE-001 for full design and proposed feature structure.

---

## Test Data (indent scenarios — resolved)

| Scenario | Test data used |
|----------|----------------|
| **TC-046** (Select transporter when no default) | Dealer **IACS3039** (no preferred transporter) |
| **TC-047** (Dealer with default transporter) | Dealer **Ramesh ningappa diggai** (Own Transport 37AAECI9906Q1ZR) |
| **TC-050** (Credit Warning) | Dealer **IACS1650** (insufficient credit limit) |
| **TC-051** (Stock warning) | Add products **1013**, **1041** (in stock at Kurnook) and **NPK** (not in stock); select **Kurnook Warehouse** → stock warning / Approve with Back Orders for NPK. |

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
