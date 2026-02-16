# O2C Indent → Sales Order – Feature Analysis & Test Design

**Metadata**
- **ID**: FEATURE-001
- **Module**: O2C (Order-to-Cash)
- **Date**: 2026-02-14
- **Status**: Implemented
- **Scope**: Indent creation through approval to Sales Order / Back Order creation.

**Current numbering:** Indent test case IDs are **O2C-INDENT-TC-001** through **TC-020** (sequential). See [test-cases.md](../test-cases.md) for the authoritative list. **TC-012** is the full straight path (list → create → products → submit → warehouse → approve → Process Workflow → SO).

---

## Feature Overview

### Purpose
End-to-end flow from Indent creation through approval to Sales Order / Back Order creation: raise indent for dealer → edit indent → add products (search by name/code) → save → submit → warehouse & transporter selection → approve/reject with comments → Process Workflow (SO for in-stock, Back Order for out-of-stock).

### Business Flow
1. **Indent raised** for dealer
2. **Edit Indent** → Add Product → Search by product name/code → Product added → Quantity adjusted → Saved → Submitted
3. **Warehouse & Transporter** selected (required before approval for submitted indent)
4. **Approved / Rejected** with comments (reject requires comment)
5. **Approved Indent → Process Workflow**: In-stock → SO created; no stock → Back Order created
6. **Approval constraints**: Cannot approve if dealer has any invoice pending payment 90+ days; credit limit checked (UI: "Credit OK" / "Credit Warning")

### User Stories & Acceptance
- **As a** dealer manager / approver **I want to** create indents, add products, submit, select warehouse/transporter, approve or reject with comments **so that** approved indents can be processed into Sales Orders and Back Orders.
- **Acceptance**: Edit draft & add products; submit when items & total > 0; select warehouse before Approve; approve/reject with comments; approval blocked for 90+ days overdue or credit exceeded; Process Workflow creates SO/Back Order; UI shows status and toasts.

---

## Component Analysis

### Indent Detail Page (`web_app/src/app/o2c/indents/[id]/page.tsx`)
- **Back**, **Heading** (`{dealer} - Indent`), **Edit**, **Save**, **Cancel**, **Submit Indent**
- **Submitted**: Card "Warehouse Selection" with `WarehouseSelector`; **Approve** / **Approve with Back Orders**, **Reject**
- **Approved**: **Process Workflow**
- **Dialogs**: Approval ("Approve Indent" | "Reject Indent"; Comments; submit); Process Workflow ("Confirm & Process")

### EnhancedEditableItemsCard
- **Add Items** / **Add Your First Item** → EnhancedAddProductModal: "Add Products to Indent"; search products, variants, packages; select and add

### API / Server Actions
- `updateIndentItems`, `updateIndentStatus` (submit), `updateIndentWarehouse`, `updateIndentTransporter`
- `processApproval` (approve/reject; checks 90-day unpaid, credit server-side)
- `processIndentWorkflow` (create SO / Back Order)

---

## Locator Strategy (Semantic)

```typescript
// Detail page
page.getByRole('button', { name: /back/i })
page.getByRole('heading', { name: /indent/i })
page.getByRole('button', { name: /^edit$/i })
page.getByRole('button', { name: /save/i })
page.getByRole('button', { name: /submit indent/i })
page.getByRole('button', { name: /approve/i })
page.getByRole('button', { name: /reject/i })
page.getByRole('button', { name: /process workflow/i })
// Cards: getByText(/indent information/i), getByText(/warehouse selection/i)
// Approval dialog: getByRole('dialog').filter({ has: getByRole('heading', { name: /approve indent|reject indent/i }) })
// Add Products: getByRole('dialog').filter({ has: getByRole('heading', { name: /add products to indent/i }) })
```

---

## 1. Problem Statement

- **Too many indents created**: Dozens of scenarios each create a new indent (often for the same dealer), leading to data pollution and existing-draft reuse.
- **Existing-draft reuse**: When "Create Indent" for a dealer opens an existing draft that already has items, Add Products shows "Already Added" and tests timeout or behave inconsistently.
- **Unclear test data**: Different scenarios need different dealers (90-day block, credit limit, transporter, stock warning) but this is not grouped; same dealer is reused for unrelated validations.
- **Goal**: Design tests that cover functional validations end-to-end with **explicit test data profiles**, **fewer indents per run**, and **clear use-case grouping**.

---

## 2. Design Principles

| Principle | Description |
|-----------|-------------|
| **Test Data Profile** | Each use case has a named profile (dealer + product + warehouse where needed). One profile = one set of test data. |
| **One indent per journey** | End-to-end "journey" scenarios create **one** indent and validate multiple steps (create → add product → submit → warehouse → approve → process). |
| **Focused scenarios by profile** | Scenarios that need specific data (90-day block, credit warning, stock warning) use their **dedicated profile** and create **one indent** for that validation only. |
| **List/navigation: no new indent** | List load, search, filter, clear filter, row click, back — use existing list data; do not create indents. |
| **Dealer selection: minimal creates** | Dealer modal search/select can create one indent (TC-001–003, TC-007, TC-008); share one dealer for "create" vs "existing draft" where possible. |

---

## 3. Test Data Profiles

Define **profiles** so each scenario explicitly uses the right data. Replace placeholders with your actual tenant data.

| Profile ID | Dealer | Product search | Warehouse | Use for |
|------------|--------|----------------|-----------|---------|
| **P-APPROVAL** | Ramesh ningappa diggai | 1013 | First / any with stock | Approval flow, Process Workflow, default transporter (TC-012, TC-017, TC-020) |
| **P-REJECT** | VAYUPUTRA AGENCIES | 1013 | First | Reject flow (TC-013, TC-014) |
| **P-90DAY** | VAYUPUTRA AGENCIES | 1013 | First | Approval blocked 90+ days (TC-015) |
| **P-NO-TRANSPORT** | IACS3039 | 1013 | First | Select transporter when no default (TC-016) |
| **P-DEFAULT-TRANSPORT** | Ramesh ningappa diggai | 1013 | First | Pre-selected transporter (TC-017) |
| **P-CREDIT-WARN** | IACS1650 | 1013 | First | Credit Warning (TC-018) |
| **P-STOCK-WARN** | Ramesh ningappa diggai | 1013, 1041, **NPK** | **Kurnook Warehouse** | Stock warning (TC-019). 1013/1041 in stock; NPK not in stock at Kurnook. |
| **P-EMPTY-DRAFT** | One dealer with **no** existing draft | — | — | Submit disabled when no items, Draft UI (TC-010, TC-011) |
| **P-LIST** | (no create) | — | — | List load, back (TC-006; list covered in TC-012) |
| **P-DEALER-MODAL** | VAYUPUTRA AGENCIES, VAYU code | — | — | Dealer search by name/code (TC-001–003, TC-007, TC-008) |

**Product**: Use product code **1013** (or your tenant’s equivalent) for Add Products search where a product is required. **1041** is also available where a second product is needed.

**Warehouse**: **Kurnook Warehouse** has products **1013** and **1041** available (stock on hand). **NPK** is NOT in stock at Kurnook. For TC-019 (stock warning), add 1013, 1041 and NPK to the indent and select Kurnook — the warning appears for NPK.

---

## 4. Scenario Grouping by Test Data Need

### Group A – No new indent (list / navigation)

| TC IDs | What | Test data |
|--------|------|-----------|
| TC-006 | Back from detail → list | Table has ≥1 row |
| TC-012 | Full straight path (includes list load) | — |

**Design**: Keep as-is. No indent creation.

---

### Group B – One indent per dealer profile (create once, validate)

**B1 – Dealer modal & create (profile P-DEALER-MODAL / P-APPROVAL)**

| TC IDs | What | Indents created | Profile |
|--------|------|------------------|---------|
| TC-001 | Create indent → detail | 1 | VAYUPUTRA (or P-APPROVAL) |
| TC-002 | Create again → same draft | 0 (reuse) | Same dealer |
| TC-003 | Modal search by name, select | 1 | VAYUPUTRA |
| TC-007 | Modal search by code, select | 1 | VAYU code → VAYUPUTRA |
| TC-008 | Non-existent dealer | 0 | Fake name |

**Design**: TC-001 and TC-002: create indent for dealer X → on detail; go back; create again → same draft. TC-003 / TC-007 / TC-008: dealer modal; TC-003/007 create one indent on select.

**B2 – E2E journey (one indent, profile P-APPROVAL)**

Single scenario or a short chain that does:

1. Create indent for **Ramesh ningappa diggai**
2. Edit → Add product 1013 → Save → Submit
3. Select first warehouse
4. Approve (optional comment)
5. Process Workflow → verify dialog shows SO/Back Order preview → close or confirm

**Validations in one flow**: TC-012 covers list → create → detail → add products → submit → warehouse → approve → Process Workflow → SO. **One indent** instead of many.

**B3 – Reject flow (one indent, profile P-REJECT)**

| TC IDs | What | Profile |
|--------|------|---------|
| TC-013 | Reject button disabled until comment; fill comment, submit | P-REJECT |
| TC-014 | Reject with comments → status Rejected | P-REJECT |

**Design**: One scenario: create indent for P-REJECT → add product → submit → select warehouse → Reject → assert button disabled → fill comment → submit → assert status Rejected. **One indent.**

**B4 – Approval blocked 90+ days (one indent, profile P-90DAY)**

| TC ID | What | Profile |
|-------|------|---------|
| TC-015 | Approve → blocked (message / no success toast) | P-90DAY (VAYUPUTRA) |

**Design**: One indent for VAYUPUTRA; add product → submit → warehouse → Approve → submit → assert approval blocked. **One indent.**

**B5 – Transporter (two indents, two profiles)**

| TC ID | What | Profile |
|-------|------|---------|
| TC-016 | No default transporter → select first | P-NO-TRANSPORT (IACS3039) |
| TC-017 | Default transporter pre-selected | P-DEFAULT-TRANSPORT (Ramesh ningappa diggai) |

**Design**: One indent per profile; validate Transporter Selection card and either "select first" or "pre-selected". **Two indents total.**

**B6 – Credit warning (one indent, profile P-CREDIT-WARN)**

| TC ID | What | Profile |
|-------|------|---------|
| TC-018 | After warehouse select → Credit Warning visible | P-CREDIT-WARN (IACS1650) |

**Design**: One indent for IACS1650; add product → submit → select warehouse → assert Credit Warning. **One indent.**

**B7 – Stock warning (one indent, profile P-STOCK-WARN)**

| TC ID | What | Profile |
|-------|------|---------|
| TC-019 | Select Kurnook Warehouse → stock warning / Approve with Back Orders | P-STOCK-WARN |

**Design**: One indent for Ramesh ningappa diggai; add 1013, 1041, NPK → submit → select Kurnook → assert stock warning for NPK (TC-019).

**B8 – Empty draft (one indent, profile P-EMPTY-DRAFT)**

| TC IDs | What | Profile |
|--------|------|---------|
| TC-010 | Submit disabled when no items | P-EMPTY-DRAFT |
| TC-011 | Draft: Edit, Submit visible; Approve, Process Workflow not visible | P-EMPTY-DRAFT |

**Design**: Use a dealer with **no existing draft** (or run in isolation). One scenario: create indent → assert Submit disabled and draft UI (Edit, Submit visible; Approve, Process not visible). Optionally same scenario: add product → assert Submit enabled. **One indent.** If no "empty draft" dealer exists, document and skip or run first in suite.

---

### Group C – Product search (no extra indent)

| TC ID | What | How |
|-------|------|-----|
| TC-009 | Search non-existent → no results | Open Add Products in any indent, search fake code, assert no results. |

**Design**: TC-009: create indent → Edit → Open Add Products → search "AUTO_QA_NONEXISTENT_999" → assert no matching products. Add product (1013) is covered in TC-004, TC-005, TC-012.

---

### Group D – Multi-product, quantity, totals (one indent)

| TC IDs | What | Profile |
|--------|------|---------|
| TC-012 | Add 2 products, adjust qty, totals, submit, approve, Process Workflow | P-APPROVAL |

**Design**: One scenario: create indent for P-APPROVAL → Edit → Add Products, select 2 products (or 1 if only one addable), add → assert ≥1 line item; set first line qty 2 → assert total > 0; assert total matches line items. **One indent.** If search 1013 returns only one addable product (other "Already Added"), assertion "at least 2 line items" can be relaxed to "at least 1" or use a different product code that returns 2+ addable rows.

---

## 5. Proposed Feature File Structure

### Option A – Keep current scenarios, add tags and profile table

- Keep existing `indents.feature` scenarios.
- Add a **Test Data Profile** column to the scenarios doc; tag scenarios with `@profile-P-APPROVAL`, `@profile-P-REJECT`, etc.
- In the feature file, add a comment block at the top listing **Profile → Dealer (and warehouse where needed)** so implementors use the right data.
- Run order: list/navigation first (no create), then one E2E journey (P-APPROVAL), then focused scenarios by profile. This reduces cross-impact but does not reduce number of indents by itself.

### Option B – Consolidate into journey + focused scenarios (recommended)

1. **`indents-list-and-navigation.feature`** (or keep in `indents.feature`)
   - Scenarios: TC-006 (back to list). List/detail load covered in TC-012.

2. **`indents-e2e-journey.feature`**
   - One or two scenarios:
     - **E2E Happy path (TC-012)**: Create (P-APPROVAL) → add 2 products → save → submit → warehouse → approve → Process Workflow → Confirm & Process → SO created.
     - **E2E Process Workflow preview (TC-020)**: Same up to approve → Process Workflow → assert dialog → close.
   - **One or two indents** for approval flow instead of many.

3. **`indents-by-profile.feature`** (or same file with clear sections)
   - **P-REJECT**: TC-013, TC-014 — one scenario each.
   - **P-90DAY**: TC-015 — one scenario.
   - **P-NO-TRANSPORT**: TC-016 — one scenario.
   - **P-DEFAULT-TRANSPORT**: TC-017 — one scenario.
   - **P-CREDIT-WARN**: TC-018 — one scenario.
   - **P-STOCK-WARN**: TC-019 — one scenario.
   - **P-EMPTY-DRAFT**: TC-010, TC-011 — one scenario (dealer with no draft).
   - **P-DEALER-MODAL**: TC-001–003, TC-007, TC-008 — minimal creates.
   - **Product search**: TC-009 — no extra indent (reuse Add Products from another scenario).
   - **Straight path**: TC-012 — one indent (P-APPROVAL). TC-020 — Process Workflow dialog preview.

**Total indents per full run (Option B)**: Roughly **1 (list) + 2 (E2E) + 1 (reject) + 1 (90-day) + 1 (no transport) + 1 (default transport) + 1 (credit) + 1 (stock) + 1 (empty draft) + 2 (dealer modal/create) + 1 (multi-product) ≈ 12–14** instead of 30+.

---

## 6. New Scenarios (Use Cases with Different Test Data)

Add or rename scenarios so each has a single, clear use case and profile:

| New / consolidated scenario | Validations | Profile | Indents |
|-----------------------------|-------------|---------|---------|
| **E2E Indent: Create → Approve → Process Workflow preview** | Detail load, add product, save, submit, warehouse, approve, Process Workflow dialog (SO/Back Order preview), close | P-APPROVAL | 1 |
| **E2E Indent: Create → Approve → Confirm Process Workflow** | Same up to approve; Process Workflow → Confirm & Process → success toast | P-APPROVAL | 1 |
| **Reject indent with required comments** | Create → add product → submit → warehouse → Reject → comment required → submit → status Rejected | P-REJECT | 1 |
| **Approval blocked when dealer has 90+ days overdue** | Create → add product → submit → warehouse → Approve → blocked | P-90DAY | 1 |
| **Select transporter when dealer has no default** | Create → add product → submit → Transporter Selection visible → select first transporter | P-NO-TRANSPORT | 1 |
| **Dealer with default transporter shows pre-selected** | Create → add product → submit → Transporter Selection visible → transporter pre-selected | P-DEFAULT-TRANSPORT | 1 |
| **Credit Warning when dealer over limit** | Create → add product → submit → warehouse → Credit Warning visible | P-CREDIT-WARN | 1 |
| **Stock warning when warehouse has insufficient stock** | Create → add product → submit → select warehouse with no stock for 1013 → stock warning / Approve with Back Orders | P-STOCK-WARN | 1 |
| **Draft indent: Submit disabled when no items; Draft UI** | Create (empty draft dealer) → Submit disabled; Edit, Submit visible; Approve, Process not visible | P-EMPTY-DRAFT | 1 |
| **Create indent and existing draft** | Create for dealer → detail; back → create same dealer → same detail | P-DEALER-MODAL | 1 |
| **Add multiple products and verify totals** | Create → Edit → Add Products, select 2 (or 1), add → ≥1 line item; set qty 2 → total > 0; total matches line items | P-APPROVAL | 1 |
| **Add Products: no matching product** | Create → Edit → Open Add Products → search non-existent → no results | P-APPROVAL | 1 (reuse create) |

---

## 7. Implementation Order

1. **Document** test data profile table in `O2C-Indent-SO-Invoice-Test-Scenarios-For-Review.md` (reference this design).
2. **Tag** existing scenarios with `@profile-*` and ensure dealer/warehouse in steps match the profile table.
3. **Add** one E2E journey scenario (create → approve → Process Workflow preview) and optionally a second (Confirm & Process) in `indents.feature`; tag `@e2e-journey @profile-P-APPROVAL`.
4. **Consolidate** reject (TC-013, TC-014), 90-day (TC-015), transporter (TC-016, TC-017), credit (TC-018), stock (TC-019), empty draft (TC-010, TC-011) into single scenarios per profile where it makes sense.
5. **Run** list/navigation scenarios first (no create), then E2E journey, then profile-specific scenarios so order is predictable and data impact is minimal.

---

## 8. Summary

- **Test Data Profiles**: P-APPROVAL, P-REJECT, P-90DAY, P-NO-TRANSPORT, P-DEFAULT-TRANSPORT, P-CREDIT-WARN, P-STOCK-WARN, P-EMPTY-DRAFT, P-LIST, P-DEALER-MODAL — each maps to dealer (and warehouse/product) and use cases.
- **Fewer indents**: Journey-based E2E (1–2 indents) + one indent per profile for focused validations → ~12–14 indents per full run instead of 30+.
- **Clear use cases**: Each scenario has one primary validation and one profile; different scenarios use different test data where needed.
- **Reference**: [O2C-Indent-SO-Invoice-Test-Scenarios-For-Review.md](../O2C-Indent-SO-Invoice-Test-Scenarios-For-Review.md) for TC IDs and status; this document for design and data strategy.
