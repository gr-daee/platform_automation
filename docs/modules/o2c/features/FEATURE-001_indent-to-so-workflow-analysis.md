# FEATURE-001 - Indent to Sales Order (SO) Workflow Analysis

**Metadata**
- **ID**: FEATURE-001
- **Module**: O2C (Order-to-Cash)
- **Date**: 2026-02-14
- **Status**: Analysis

---

## Feature Overview

### Purpose
End-to-end flow from Indent creation through approval to Sales Order / Back Order creation. Covers: raise indent for dealer → edit indent → add products (search by name/code) → adjust quantity → save → submit → warehouse & transporter selection → approve/reject with comments → process workflow (SO for in-stock items, Back Order for out-of-stock).

### Business Flow (User-Provided)
1. **Indent raised** for dealer
2. **Edit Indent** → Add Product → Search by product name/code → Product added → Quantity adjusted → Saved → Submitted
3. **Warehouse & Transporter** selected (required before approval for submitted indent)
4. **Approved / Rejected** with comments
5. **Approved Indent → Process Workflow**: If stock available → SO created; items with no stock → Back Order created
6. **Approval constraints**: Cannot approve if any invoice with pending payment for given dealer in 90+ days; Credit limit is also checked

### User Stories
- **As a** dealer manager / approver
- **I want to** create indents, add products, submit, select warehouse/transporter, and approve or reject with comments
- **So that** approved indents can be processed into Sales Orders and Back Orders based on stock and credit

### Acceptance Criteria
1. [ ] User can edit draft indent, add products (search by name/code), adjust quantity, save
2. [ ] User can submit indent when items and total > 0
3. [ ] For submitted indent, user must select warehouse before Approve is enabled
4. [ ] User can approve or reject with comments (reject requires comment)
5. [ ] Approval blocked if dealer has pending invoice 90+ days or credit limit exceeded
6. [ ] After approval, user can click "Process Workflow"; SO created for in-stock, Back Order for out-of-stock
7. [ ] UI shows status transitions and toasts for success/error

---

## Test Scenario Identification

### 1. Happy Path – Detail Page & Edit (Draft)

| Scenario ID | Description | Priority | Test ID |
|-------------|-------------|----------|---------|
| FS-001-001 | On indent detail (draft), Edit button visible and clickable | P1 | O2C-INDENT-TC-024 |
| FS-001-002 | Edit mode: Add Items opens Add Products modal; search by product name/code; add product; quantity adjusted; Save persists | P0 | O2C-INDENT-TC-025 |
| FS-001-003 | Draft with items: Submit Indent button enabled; submit shows success toast and status → submitted | P0 | O2C-INDENT-TC-026 |
| FS-001-004 | Submitted indent: Warehouse Selection card visible; select warehouse enables Approve | P0 | O2C-INDENT-TC-027 |
| FS-001-005 | Approve with optional comments; Reject with required comments; dialog titles "Approve Indent" / "Reject Indent" | P0 | O2C-INDENT-TC-028 |
| FS-001-006 | Approved indent: Process Workflow button visible; dialog opens; Confirm & Process creates SO/Back Order | P1 | O2C-INDENT-TC-029 |

### 2. Negative / Constraints

| Scenario ID | Description | Priority | Test ID |
|-------------|-------------|----------|---------|
| FS-001-007 | Submit disabled when no items or zero amount | P1 | O2C-INDENT-TC-030 |
| FS-001-008 | Approve disabled when warehouse not selected (submitted) | P1 | O2C-INDENT-TC-031 |
| FS-001-009 | Reject button in dialog disabled until comment provided | P1 | O2C-INDENT-TC-032 |
| FS-001-010 | Approval blocked when dealer has 90+ days pending payment (server-side; optional E2E or API) | P1 | O2C-INDENT-TC-033 |
| FS-001-011 | Credit limit check blocks or warns (UI badge "Credit Warning" vs "Credit OK") | P2 | O2C-INDENT-TC-034 |

### 3. State & UI Consistency

| Scenario ID | Description | Priority | Test ID |
|-------------|-------------|----------|---------|
| FS-001-012 | Draft: Edit, Save, Cancel; Submit Indent visible; Approve/Reject/Process Workflow not visible | P1 | O2C-INDENT-TC-035 |
| FS-001-013 | Submitted: Warehouse Selection visible; Approve/Reject visible (with permission); Process Workflow not visible | P1 | O2C-INDENT-TC-036 |
| FS-001-014 | Approved: Process Workflow visible; Edit/Submit/Approve/Reject not visible for approval actions | P1 | O2C-INDENT-TC-037 |
| FS-001-015 | Back button from detail returns to list | P2 | O2C-INDENT-TC-038 |

### 4. Integration (Indent → SO / Back Order)

| Scenario ID | Description | Priority | Test ID |
|-------------|-------------|----------|---------|
| FS-001-016 | Process Workflow success: toast or UI indicates SO/Back Order created; optional DB/API check | P1 | O2C-INDENT-TC-029 (extend) |

---

## Component Analysis

### UI – Indent Detail Page (`web_app/src/app/o2c/indents/[id]/page.tsx`)
- **Back**: `Button` "Back"
- **Heading**: `{dealer.business_name} - Indent`
- **Draft**: `Button` "Edit", `Button` "Submit Indent"; optional badges "Credit OK" / "Credit Warning"
- **Edit mode**: `Button` "Save", `Button` "Cancel"
- **Submitted**: Card "Warehouse Selection" with `WarehouseSelector`; `Button` "Approve" / "Approve with Back Orders", `Button` "Reject"
- **Approved**: `Button` "Process Workflow"; optional Fast Invoice button
- **Dialogs**: Approval (`DialogTitle`: "Approve Indent" | "Reject Indent"; Textarea Comments; "Approve" | "Reject" submit); Stock Warning; Process Workflow (`DialogTitle` includes "Process"; "Confirm & Process" button)

### UI – EnhancedEditableItemsCard
- **Add Items**: `Button` with text "Add Items" or "Add Your First Item" (opens EnhancedAddProductModal)
- **EnhancedAddProductModal**: `DialogTitle` "Add Products to Indent"; placeholder "Search products, variants, packages...."; select product(s) and add

### API / Server Actions
- `updateIndentItems` – save line items
- `updateIndentStatus` – submit (status → submitted)
- `updateIndentWarehouse`, `updateIndentTransporter`
- `processApproval` – approve/reject (checks 90-day unpaid, credit limit server-side)
- `processIndentWorkflow` – create SO / Back Order from approved indent

---

## Test Data Requirements

- **Dealer**: Active dealer (e.g. VAYUPUTRA AGENCIES) – same as existing indents tests
- **Products**: At least one product/variant available for indent (price list, territory)
- **Draft indent**: Can create via "Create Indent" for dealer then use that detail page
- **Submitted indent**: Either create draft → add product → submit in test, or rely on existing submitted indent in env
- **Warehouse**: Active warehouse for tenant
- **Transactional data**: Use `AUTO_QA_` prefix for any created data

---

## Locator Strategy (Semantic)

```typescript
// Detail page – header
page.getByRole('button', { name: /back/i })
page.getByRole('heading', { name: /indent/i }) // dealer name - Indent
page.getByRole('button', { name: /^edit$/i })
page.getByRole('button', { name: /save/i })
page.getByRole('button', { name: /cancel/i })
page.getByRole('button', { name: /submit indent/i })
page.getByRole('button', { name: /approve/i })
page.getByRole('button', { name: /reject/i })
page.getByRole('button', { name: /process workflow/i })

// Cards
page.getByRole('heading', { name: /indent information/i })
page.getByRole('heading', { name: /warehouse selection/i })

// Approval dialog
page.getByRole('dialog').filter({ has: page.getByRole('heading', { name: /approve indent|reject indent/i }) })
page.getByLabel(/comments/i)
page.getByRole('button', { name: /^approve$|^reject$/i })

// Add Products modal
page.getByRole('dialog').filter({ has: page.getByRole('heading', { name: /add products to indent/i }) })
page.getByPlaceholder(/search products, variants, packages/i )
```

---

## Test Implementation Order

### Phase 1 – Detail page load & draft actions (this round)
1. O2C-INDENT-TC-024: Verify indent detail page loads (heading, Back, status); draft shows Edit + Submit Indent
2. O2C-INDENT-TC-025: Edit → Add Items → search product → add → Save (optional quantity change)
3. O2C-INDENT-TC-026: Submit Indent → success toast, status submitted
4. O2C-INDENT-TC-038: Back from detail returns to list

### Phase 2 – Approval flow
5. O2C-INDENT-TC-027: Submitted indent – Warehouse Selection visible; select warehouse
6. O2C-INDENT-TC-028: Approve with comments (optional); Reject with comments (required)
7. O2C-INDENT-TC-031: Approve disabled when warehouse not selected
8. O2C-INDENT-TC-032: Reject disabled until comment filled

### Phase 3 – Process Workflow & negative
9. O2C-INDENT-TC-029: Process Workflow dialog → Confirm & Process
10. O2C-INDENT-TC-030: Submit disabled when no items / zero amount
11. O2C-INDENT-TC-033/034: Approval blocked (90-day / credit) – optional if UI shows clear error

---

## Potential Duplicate Tests

- **TC-002, TC-003**: Create indent and land on detail – reuse; new scenarios start from detail (edit, add product, submit).
- **TC-008**: Row click to detail – reuse for "given I am on indent detail page" when starting from list.

---

## Documentation Plan

- [x] Create feature analysis (this document)
- [ ] Update `knowledge.md` with full Indent→SO flow and approval rules
- [ ] Add IndentDetailPage POM
- [ ] Add step definitions and scenarios to indents.feature
- [ ] Update test-cases.md, TEST_CASE_REGISTRY.md, gap-analysis.md

---

**Next Steps**
1. Update O2C knowledge.md with Indent→SO flow and approval constraints
2. Implement IndentDetailPage POM
3. Implement Phase 1 scenarios and steps
