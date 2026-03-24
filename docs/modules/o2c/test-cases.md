# O2C Module - Test Cases

**Master plan (Indent → SO → Invoice):** [O2C-Indent-SO-Invoice-Test-Scenarios-For-Review.md](./O2C-Indent-SO-Invoice-Test-Scenarios-For-Review.md) — full list of test case IDs, status, feature files, and implementation order by block.

**Consolidation (straight path):** One scenario **@O2C-INDENT-TC-012** covers the full straight path (list → create → detail → products → submit → warehouse → approve → Process Workflow → SO). Former list/detail/product/approval scenarios were removed from the feature file; coverage is in TC-012. **Numbering:** Active tests are **O2C-INDENT-TC-001** through **O2C-INDENT-TC-020** (sequential).

## Automated Tests (TC-001 to TC-020)

### @O2C-INDENT-TC-001 - Create Indent for dealer creates new indent and navigates to detail
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Create Indent for dealer creates new indent and navigates to detail page
- **Coverage**: Create flow (new indent); navigation to indent detail
- **Status**: ✅ Automated
- **Tags**: @smoke, @critical, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**:
```gherkin
Scenario: Create Indent for dealer creates new indent and navigates to detail page
  Given I am on the O2C Indents page
  When I create an indent for dealer "VAYUPUTRA AGENCIES"
  Then I should be on the indent detail page
```

**Test Steps**: Create Indent → search/select dealer → wait for navigation to `/o2c/indents/:id`.

**Prerequisites**: Active dealer (e.g. VAYUPUTRA AGENCIES); user with O2C create permission.

**Notes**: Reuses compound step "When I create an indent for dealer {string}" (click Create Indent, search, select, wait for URL).

---

### @O2C-INDENT-TC-002 - Create Indent for dealer with existing draft navigates to that draft
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Create Indent for dealer with existing draft navigates to that draft
- **Coverage**: Create flow (existing draft); no duplicate indent; navigation to same draft
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**:
```gherkin
Scenario: Create Indent for dealer with existing draft navigates to that draft
  Given I am on the O2C Indents page
  When I create an indent for dealer "VAYUPUTRA AGENCIES"
  Then I should be on the indent detail page
  When I go back to the O2C Indents page
  When I create an indent for dealer "VAYUPUTRA AGENCIES"
  Then I should be on the same indent detail page as before
```

**Test Steps**: Create indent (first time) → land on detail; go back to list; Create Indent for same dealer again → land on same detail page (existing draft).

**Prerequisites**: Same as TC-001; dealer may have existing draft from first step.

**Notes**: Asserts `checkDraftIndentByDealer` behavior: second "Create Indent" for same dealer opens existing draft instead of creating a new one.

---

### @O2C-INDENT-TC-003 - Dealer Search and Selection in Modal
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: User searches and selects dealer from Create Indent modal
- **Coverage**: Dealer filtering UX, search functionality
- **Status**: ✅ Automated
- **Last Updated**: 2026-02-04

**Gherkin**:
```gherkin
Scenario: User searches and selects dealer from Create Indent modal
  Given I am on the "O2C Indents" page
  When I click the "Create Indent" button
  Then I should see the "Select Dealer" modal
  And the modal should display a list of active dealers
  And the modal should have a search input
  When I search for dealer by name "ABC Corporation"
  Then the dealer list should be filtered
  And I should see "ABC Corporation" in the results
  When I select the dealer "ABC Corporation"
  Then the modal should close
  And I should be on the indent creation page with dealer pre-selected
```

**Test Steps**:
- Given: User authenticated and on O2C Indents page
- When: Clicks Create Indent button
- Then: Dealer selection modal opens with search functionality
- When: Searches for dealer and selects
- Then: Modal closes and indent creation flow begins

**Notes**: 
- Tests server-side debounced search (300ms delay + 200ms buffer)
- Verifies modal displays active dealers only
- Covers dealer selection → indent creation flow
- Uses `IndentsPage` POM with semantic locators
- Waits handled by `DialogComponent` for proper modal animation

**Related Tests**: None (first indent test)

---

### @O2C-INDENT-TC-004 - Edit indent add product by search and save
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Edit indent add product by search and save
- **Coverage**: Edit mode, Add Products modal, search by product name/code, add product, Save
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: On detail (draft) → Click Edit → Add product by searching "1013" (product code) → Save → indent saved successfully.

**Prerequisites**: At least one product matching search "1013" (product code) in tenant.

**Notes**: Uses `IndentDetailPage` (clickEdit, clickAddItems, searchProduct, selectFirstProductAndAdd, clickSave). Toasts: "Added … to indent", "Items updated successfully!".

---

### @O2C-INDENT-TC-005 - Submit indent after adding product
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Submit indent after adding product
- **Coverage**: Full draft flow: add product, save, submit; status → submitted
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: On detail (draft) → Edit → add product "1013" (product code) → Save → Submit Indent → submitted successfully.

**Notes**: Depends on TC-004 flow; toast "Indent submitted successfully!".

---

### @O2C-INDENT-TC-006 - Back from indent detail returns to list
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Back from indent detail returns to list
- **Coverage**: Back button on detail page; return to /o2c/indents list
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: List has rows → click first row → on detail → go back from detail → list page loaded.

**Notes**: Uses `IndentDetailPage.clickBack()`; asserts URL and list page loaded.

---

### @O2C-INDENT-TC-007 - User searches dealer by dealer code and selects
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: User searches dealer by dealer code and selects
- **Coverage**: Dealer modal search by dealer code (same input as name; server-side search)
- **Status**: ✅ Automated
- **Tags**: @regression, @dealer-search, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: Create Indent → Select Dealer modal → search by code "VAYU" → list filtered → see "VAYUPUTRA" in results → select "VAYUPUTRA AGENCIES" → modal closes, on creation page.

**Prerequisites**: Dealer with code containing "VAYU" (e.g. VAYUPUTRA AGENCIES). Adjust code in feature if tenant uses different dealer codes.

**Notes**: Uses `When I search for dealer by code {string}`; same search input supports code, name, GST, territory.

---

### @O2C-INDENT-TC-008 - Search non-existent dealer shows no matching dealers
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Search non-existent dealer shows no matching dealers
- **Coverage**: Dealer modal empty search result; "No dealers found matching your search."
- **Status**: ✅ Automated
- **Tags**: @regression, @dealer-search, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: Create Indent → Select Dealer modal → search "AUTO_QA_NONEXISTENT_DEALER_999" → dealer list shows no matching dealers.

**Notes**: Uses `IndentsPage.verifyDealerModalShowingNoResults()`.

---

### @O2C-INDENT-TC-009 - Search non-existent product shows no matching products in Add Products modal
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Search non-existent product shows no matching products in Add Products modal
- **Coverage**: Add Products modal empty search result; "No products match" / "No Products Found"
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: On indent detail (draft) → Edit → Open Add Products and search "AUTO_QA_NONEXISTENT_PRODUCT_999" → modal shows no matching products.

**Notes**: Uses `IndentDetailPage.verifyAddProductsModalShowingNoResults()`.

---

### @O2C-INDENT-TC-010 - Submit Indent button is disabled when indent has no items
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Submit Indent button is disabled when indent has no items
- **Coverage**: Draft with no line items; Submit Indent disabled
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: Create indent (draft, no products added) → Submit Indent button should be disabled.

---

### @O2C-INDENT-TC-011 - Draft indent shows Edit and Submit but not Approve or Process Workflow
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Draft indent shows Edit and Submit Indent but not Approve or Process Workflow
- **Coverage**: Draft state UI; button visibility
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: On draft detail → Edit and Submit Indent visible; Approve and Process Workflow not visible.

---

### @O2C-INDENT-TC-012 - Full straight path from list to Sales Order creation
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Full straight path from list to Sales Order creation
- **Coverage**: One scenario covering: list load, create → detail, add 2 products, adjust quantity & totals, save & submit, warehouse selection & Approve, approve with comments, Process Workflow → SO created
- **Status**: ✅ Automated
- **Tags**: @smoke, @critical, @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: List load → Create indent (Ramesh ningappa diggai) → Detail loaded → Edit → Add 2 products (1013) → Set first line quantity 2 → Totals > 0 and match line items → Save → Submit → Warehouse card visible, Approve disabled → Select warehouse → Approve enabled & visible → Approve with comments → Approved → Process Workflow visible → Process Workflow → Dialog shows SO/Back Order preview → Confirm and process → Workflow completes successfully (SO created).

**Prerequisites**: Dealer "Ramesh ningappa diggai" (no 90+ days overdue); product 1013; warehouse with stock.

**Notes**: Single indent per run for the full Indent → SO path. Former list/detail/product/approval scenarios (old TC-001, 004–006, 008, 023, 024, 027, 029, 031, 036, 037, 041, 043–045) are covered by this scenario.

---

### @O2C-INDENT-TC-013 - Reject button disabled until comment provided
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Reject button in approval dialog is disabled until comment is provided
- **Coverage**: Reject flow; dialog submit disabled until comments; fill comment and submit
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: Submitted → select warehouse → Click Reject → Reject button in dialog disabled → fill comments and submit → detail page loaded.

---

### @O2C-INDENT-TC-014 - Reject indent with required comments and verify status Rejected
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Reject indent with required comments and verify status Rejected
- **Coverage**: Full reject flow; fill comments → submit → status badge shows Rejected
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: Submitted indent → select warehouse → Click Reject → fill comments and submit → indent status should be Rejected.

---

### @O2C-INDENT-TC-015 - Approval blocked when dealer has 90+ days overdue
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Approval blocked when dealer has due invoices beyond 90 days
- **Coverage**: Business rule; dealer VAYUPUTRA AGENCIES has 90+ day due → Approve submit → approval blocked (error/no success toast)
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: Create indent for VAYUPUTRA AGENCIES → add product → submit → select warehouse → Approve → submit dialog → approval should be blocked due to overdue invoices.

---

### @O2C-INDENT-TC-016 - Select transporter when dealer has no default
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Select transporter when dealer has no default transporter
- **Coverage**: Transporter Selection card visible; user selects first transporter
- **Status**: ✅ Automated
- **Test data**: Dealer **IACS3039** (no preferred_transporter)

---

### @O2C-INDENT-TC-017 - Dealer with default transporter
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Dealer with default transporter shows pre-selected transporter
- **Coverage**: Transporter Selection card; transporter pre-selected from dealer preferred_transporter
- **Status**: ✅ Automated
- **Test data**: **Ramesh ningappa diggai** (Own Transport 37AAECI9906Q1ZR)

---

### @O2C-INDENT-TC-018 - Credit Warning
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Credit limit check shows Credit Warning when insufficient
- **Coverage**: Indent detail shows "Credit Warning" when dealer at/over credit limit (Credit Status (Workflow) can take a while to load).
- **Status**: ✅ Automated
- **Test data**: Dealer **IACS1650** (insufficient credit limit)
- **Extended flow (future)**: Approve indent → Process Workflow button visible → wait for Credit Status (Workflow) with Credit Limit / Outstanding / Available / ⚠️ Credit Limit Exceeded → Process Workflow dialog shows Order Split Preview, Credit Check: Failed, Dealer Credit Information → user confirms → SO created on credit hold → SO page (`/o2c/sales-orders/[id]`) shows "⚠️ Order on Credit Hold" and "Cancel Order" / "Cancel Here"; Cancel cancels the SO. Requires SO page POM and steps.

---

### @O2C-INDENT-TC-019 - Stock warning
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Stock warning shown when selected warehouse has insufficient stock
- **Coverage**: Add products 1013, 1041 (in stock at Kurnook) and NPK (not in stock); select Kurnook Warehouse → "Approve with Back Orders" or stock warning visible for NPK.
- **Status**: ✅ Automated
- **Test data**: **1013** and **1041** are in stock at Kurnook Warehouse; **NPK** is NOT in stock. Indent includes all three; selecting Kurnook triggers stock warning for NPK.

---

### @O2C-INDENT-TC-020 - Process Workflow dialog shows SO and Back Order preview
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Process Workflow dialog shows SO and Back Order preview before Confirm
- **Coverage**: Approved indent → Process Workflow → dialog shows Sales Order and Back Order preview; then close dialog
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: Approved indent → Click Process Workflow → dialog should show SO and Back Order preview → close Process Workflow dialog.

---

## System E2E Tests (O2C-E2E-TC-001 – TC-008)

### @O2C-E2E-TC-001 - Full E2E flow with Dealer IACS5509, Product 1013, Warehouse Kurnook, Transporter Just In Time Shipper
- **Feature File**: `e2e/features/o2c/o2c-e2e-indent-so-invoice.feature`
- **Scenario**: Full E2E flow with Dealer IACS5509, Product 1013, Warehouse Kurnook, Transporter Just In Time Shipper
- **Coverage**: DB note → Indent → SO verify → **Generate Picklist → View Picklist → start picking (if pending) → Pick Items → Confirm Pick (batch) → Complete Picklist** → **Generate E-Invoice** → **Mark as Packed → Ready to Ship → Dispatch Order** (transporter + defer vehicle) → Invoice PDF download → DB stock/credit → Dealer Ledger invoice row
- **Status**: ✅ Automated
- **Tags**: @o2c-flow @smoke @critical @p0 @iacs-tenant @iacs-md
- **Last Updated**: 2026-03-22

**Test Data (Fixed)**:
- Dealer: Code **IACS5509**, Name **Ramesh ningappa diggai**
- Product: **1013** (add by search)
- Warehouse: **Kurnook** (use "Kurnook Warehouse" in UI)
- Transporter: **Just In Time Shipper**

**Notes**: Single-user; reuses indent steps from `indent-steps.ts`; E2E-specific steps in `o2c-e2e-steps.ts`; DB helpers in `o2c-db-helpers.ts` (read-only). POMs: `SalesOrderDetailPage`, `WarehousePicklistDialogPage`, `InvoiceDetailPage`, `DealerLedgerPage`.

---

## O2C Reports - Collection Report (CR)

**Feature file:** `e2e/features/o2c/reports/collection-report.feature`

| ID | Scenario (summary) | Tags | Status |
|----|---------------------|------|--------|
| O2C-CR-TC-001 | This Month quick period sets month start to today | @smoke @p0 @iacs-md | ✅ |
| O2C-CR-TC-002 | Collections vs Outstanding % KPI visible after load | @smoke @p0 @iacs-md | ✅ |
| O2C-CR-TC-003 | By Period totals approximately match summary total amount | @regression @p1 @iacs-md | ✅ |
| O2C-CR-TC-004 | Excel export contains efficiency and comparison sections | @regression @p1 @iacs-md | ✅ |
| O2C-CR-TC-005 | By Payment/Region/Dealer totals approximately match summary | @regression @p1 @iacs-md | ✅ |

---

## O2C Reports - Hierarchical Product Sales (HPS)

**Feature file:** `e2e/features/o2c/reports/hierarchical-product-sales.feature`

| ID | Scenario (summary) | Tags | Status |
|----|---------------------|------|--------|
| O2C-HPS-TC-001 | Dealer level exists between Territory and Product in UI hierarchy | @smoke @p0 @iacs-md | ✅ |
| O2C-HPS-TC-002 | Dealer rows show city badge or fallback in UI | @regression @p1 @iacs-md | ✅ |
| O2C-HPS-TC-003 | Detailed Excel Hierarchy Report contains DEALER rows and City | @smoke @p0 @iacs-md | ✅ |
| O2C-HPS-TC-004 | Detailed Excel Invoice Details and Dealer Ranking include City | @regression @p1 @iacs-md | ✅ |

---

### @O2C-E2E-TC-002 - Mixed indent: dynamic OOS + in-stock at Kurnook → back order + SO → full invoice pipeline
- **Feature File**: `e2e/features/o2c/o2c-e2e-indent-so-invoice.feature`
- **Scenario**: **`resolveMixedIndentProductPairAtWarehouse("Kurnook")`** picks **in-stock** and **out-of-stock** material codes (tenant SQL on `inventory` + `product_variant_packages`, verified via existing snapshot helpers; fallbacks **1013/NPK**; optional **`E2E_O2C_MIXED_IN_STOCK_CODE`** / **`E2E_O2C_MIXED_OUT_OF_STOCK_CODE`**) → indent with **both** lines → Kurnook + transporter → approve → Process Workflow → DB **back_order_management** + Inventory UI empty for OOS code → **SO** (allocates in-stock only) → picklist → e-invoice → pack → dispatch → invoice PDF → DB stock/credit → Dealer Ledger (same tail as TC-001)
- **Status**: ✅ Automated
- **Tags**: @o2c-flow @regression @p1 @iacs-tenant @iacs-md
- **Last Updated**: 2026-03-21

**Notes**: Requires DB connectivity for discovery; if no pair found, test fails (or set env overrides). Helpers: `resolveMixedIndentProductPairAtWarehouse`, `getBackOrdersByOriginalIndentId`, `getInventoryForProductAndWarehouse`. Steps: `IndentDetailPage` add-product pattern in `o2c-e2e-steps.ts`. POMs: `O2CInventoryPage`, `SalesOrderDetailPage`, etc.

---

### @O2C-E2E-TC-003 - Generate E-Invoice without E-Way bill
- **Feature File**: `e2e/features/o2c/o2c-e2e-indent-so-invoice.feature`
- **Scenario**: Same setup as TC-001 through picklist completion → E-Invoice modal **Transport** tab → uncheck `#eWayBillRequired` → **Generate E-Invoice Only** → invoice link on SO
- **Status**: ✅ Automated
- **Tags**: @o2c-flow @regression @p1 @iacs-tenant @iacs-md
- **Last Updated**: 2026-03-21

**Notes**: UI mirrors `EInvoiceGenerationModal` (`generateEWaybill: false`).

---

### @O2C-E2E-TC-004 - Cancel e-invoice within 24 hours
- **Feature File**: `e2e/features/o2c/o2c-e2e-indent-so-invoice.feature`
- **Scenario**: **`getInvoiceIdWithRecentIrnWithoutEwayBill(24)`** (IRN + no E-Way + **posted to GL** + full balance). If none, **`runO2CIndentThroughEInvoice`** with **`eInvoiceWithoutEWayBill: true`** → invoice detail → **Post to General Ledger** if shown → header **Cancel Invoice** (`CancelInvoiceDialog` + remarks) → poll DB `einvoice_status = cancelled`. **Not** E-Invoice card **Cancel E-Invoice** (400 in staging — [DAEE-362](https://linear.app/daee-issues/issue/DAEE-362)).
- **Status**: ✅ Automated (requires working GST / edge cancel in environment)
- **Tags**: @o2c-flow @regression @p1 @iacs-tenant @iacs-md
- **Last Updated**: 2026-03-22

**Notes**: **web_app**: `InvoiceDetailsContent` renders `EInvoiceCancellation` when IRN exists and not cancelled. Invoices with an E-Way bill often get **400** from the invoice-management edge on IRN-only cancel — avoid by selecting DB candidates without `eway_bill_number`. Cancellation can still fail if provider rejects — treat as environment/integration risk.

---

### @O2C-E2E-TC-005 - SRI HANUMAN AGENCIES (IACS3558) IGST invoice (full picklist → e-invoice path)
- **Feature File**: `e2e/features/o2c/o2c-e2e-indent-so-invoice.feature`
- **Scenario**: Dealer credit **IACS3558** → create indent (search **IACS3558**) → product **1013** → Kurnook + transporter → approve → Process Workflow → picklist → e-invoice → invoice → DB **`getInvoiceItemsTaxSplit`**: IGST present, CGST/SGST zero
- **Status**: ✅ Automated
- **Tags**: @o2c-flow @regression @p1 @iacs-tenant @iacs-md
- **Last Updated**: 2026-03-21

**Test Data (Fixed)**:
- Dealer: Code **IACS3558**, search/select **IACS3558** (business name **SRI HANUMAN AGENCIES**)
- Product / warehouse / transporter: same as TC-001

---

### @O2C-E2E-TC-006 - 90+ day unpaid invoice blocks approval (toast; cannot reach Process Workflow / SO)
- **Feature File**: `e2e/features/o2c/o2c-e2e-indent-so-invoice.feature`
- **Scenario**: **`findFirstDealerWithUnpaidInvoicesOlderThan90Days`** (single query, `ORDER BY invoice_date` + `LIMIT 1`) resolves dealer + **`getDealerCreditByCode`**; create indent by **dealer_code** search → submit → warehouse/transporter → **Approve** → **`toast.error`** from **`processApproval`** (90+ days, invoice numbers, **Total outstanding**, ₹). No Process Workflow step. **Skips** if no qualifying dealer in tenant.
- **Status**: ✅ Automated (conditional: skips when no dealer has old unpaid invoices)
- **Tags**: @o2c-flow @regression @p1 @iacs-tenant @iacs-md
- **Last Updated**: 2026-03-21

**Notes**: Aligns with **`web_app`** `processApproval.ts` (90-day unpaid block on **approve**). **`processIndentWorkflow`** does not re-check; blocking happens before SO.

---

### @O2C-E2E-TC-007 - Cancel e-invoice restores inventory across all invoice lines (full-line DB reconciliation)
- **Feature File**: `e2e/features/o2c/o2c-e2e-indent-so-invoice.feature`
- **Scenario**: Resolve cancellable invoice (or build via e-invoice-only O2C flow) → note inventory baseline for **all** invoice item package buckets (`getInvoiceCancelInventoryLineContexts`) at SO assigned warehouse → cancel via header **Cancel Invoice** → DB `einvoice_status=cancelled` → assert per-bucket delta and total delta exactly match cancelled quantities.
- **Status**: ✅ Automated (conditional: same integration constraints as TC-004)
- **Tags**: @o2c-flow @regression @p1 @iacs-tenant @iacs-md
- **Last Updated**: 2026-03-23

**Notes**: Extends TC-004 depth from single-line bucket to full-line reconciliation across invoice items; catches partial restoration defects.

---


### @O2C-E2E-TC-008 - SO creation reconciles package-level allocated deltas exactly
- **Feature File**: `e2e/features/o2c/o2c-e2e-indent-so-invoice.feature`
- **Scenario**: Standard indent → approve → Process Workflow → navigate SO → read `sales_order_items` grouped by package and assert each package `allocated_quantity` equals DB `inventory.allocated_units` delta from pre-workflow baseline for selected warehouse/product snapshot.
- **Status**: ✅ Automated
- **Tags**: @o2c-flow @regression @p1 @iacs-tenant @iacs-md
- **Last Updated**: 2026-03-23

**Notes**: Hardens SO creation validation from coarse trend checks to exact package-level reconciliation.

---

### @O2C-E2E-TC-009 - Invoice cancellation is idempotent (no double inventory increment)
- **Feature File**: `e2e/features/o2c/o2c-e2e-indent-so-invoice.feature`
- **Scenario**: Resolve cancellable invoice (or build via e-invoice-only O2C flow) → note all-line inventory baselines → cancel once and assert exact full-line restoration → snapshot post-cancel inventory → attempt second cancel if action is visible → assert no package-level inventory delta after second attempt.
- **Status**: ✅ Automated (conditional: same integration constraints as TC-004/TC-007)
- **Tags**: @o2c-flow @regression @p1 @iacs-tenant @iacs-md
- **Last Updated**: 2026-03-23

**Notes**: Guards against duplicate-cancel side effects and stale-action retries by enforcing DB idempotency invariants as source of truth.

---

## Warehouse Inventory (WH-INV) — Phases 1–2

**Feature file:** `e2e/features/o2c/inventory/warehouse-inventory.feature`  
**POM:** `e2e/src/pages/o2c/WarehouseInventoryPage.ts` (`LIST_PATH` = `/o2c/inventory` until route migration)  
**Steps:** `e2e/src/steps/o2c/warehouse-inventory-steps.ts`  
**Phased plan:** [inventory/FEATURE-WH-INV-phased-plan.md](inventory/FEATURE-WH-INV-phased-plan.md)  
**Implementation:** [IMPL-043](../../implementations/2026-03/IMPL-043_warehouse-inventory-wh-inv-phase-1.md) (Phase 1), [IMPL-044](../../implementations/2026-03/IMPL-044_warehouse-inventory-wh-inv-phase-2.md) (Phase 2)

| ID | Scenario (summary) | Tags | Status |
|----|-------------------|------|--------|
| WH-INV-TC-001 | Heading + subtitle | @smoke @regression @p1 @iacs-md | ✅ |
| WH-INV-TC-002 | Analytics cards | @regression @p1 @iacs-md | ✅ |
| WH-INV-TC-003 | Inventory tab search + Product column | @regression @p1 @iacs-md | ✅ |
| WH-INV-TC-004 | Allocations tab | @regression @p2 @iacs-md | ✅ |
| WH-INV-TC-005 | Analytics tab | @regression @p2 @iacs-md | ✅ |
| WH-INV-TC-006 | Settings Coming Soon | @regression @p3 @iacs-md | ✅ |
| WH-INV-TC-007 | Short search helper | @regression @p2 @iacs-md | ✅ |
| WH-INV-TC-008 | Refresh + grid ready | @regression @p2 @iacs-md | ✅ |
| WH-INV-TC-009 | Status Low Stock filter | @regression @p2 @iacs-md | ✅ |
| WH-INV-TC-010 | Warehouse Kurnook + All Warehouses reset | @regression @p2 @iacs-md | ✅ |
| WH-INV-TC-011 | Search 3+ chars in summary | @regression @p2 @iacs-md | ✅ |
| WH-INV-TC-012 | Single-char search waiting line | @regression @p2 @iacs-md | ✅ |
| WH-INV-TC-013 | Next page; `test.skip` if only one page | @regression @p2 @iacs-md | ✅ |
| WH-INV-TC-014 | Page size 25 per page | @regression @p2 @iacs-md | ✅ |
| WH-INV-TC-015 | Kurnook + In Stock combined | @regression @p3 @iacs-md | ✅ |

---

## Sales Returns (SR-PH1) — Phase 1 (list shell)

**Feature file:** `e2e/features/o2c/sales-returns/sales-returns.feature`  
**POM:** `e2e/src/pages/o2c/SalesReturnsListPage.ts`  
**Steps:** `e2e/src/steps/o2c/sales-returns-steps.ts`  
**Phased plan:** [sales-returns/FEATURE-SR-phased-plan.md](sales-returns/FEATURE-SR-phased-plan.md)  
**Detail:** [sales-returns/test-cases.md](sales-returns/test-cases.md)  
**Implementation:** [IMPL-046](../../implementations/2026-03/IMPL-053_sales-returns-consolidated.md)

| ID | Scenario (summary) | Tags | Status |
|----|-------------------|------|--------|
| SR-PH1-TC-001 | Heading + subtitle | @smoke @regression @p1 @iacs-md @sales-returns @SR-PH1 | ✅ |
| SR-PH1-TC-002 | Create Return Order → `/new` | @regression @p1 @iacs-md @sales-returns @SR-PH1 | ✅ |
| SR-PH1-TC-003 | Statistics cards (or graceful empty) | @regression @p1 @iacs-md @sales-returns @SR-PH1 | ✅ |
| SR-PH1-TC-004 | Table or empty state, no error card | @regression @p1 @iacs-md @sales-returns @SR-PH1 | ✅ |
| SR-PH1-TC-005 | Breadcrumb O2C + Sales Returns | @regression @p2 @iacs-md @sales-returns @SR-PH1 | ✅ |

---

## Sales Returns (SR-PH2) — Phase 2 (filters, search, pagination)

**Feature file:** `e2e/features/o2c/sales-returns/sales-returns.feature`  
**POM:** `e2e/src/pages/o2c/SalesReturnsListPage.ts`  
**Steps:** `e2e/src/steps/o2c/sales-returns-steps.ts`  
**Phased plan:** [sales-returns/FEATURE-SR-phased-plan.md](sales-returns/FEATURE-SR-phased-plan.md)  
**Detail:** [sales-returns/test-cases.md](sales-returns/test-cases.md)  
**Implementation:** [IMPL-047](../../implementations/2026-03/IMPL-053_sales-returns-consolidated.md)

| ID | Scenario (summary) | Tags | Status |
|----|---------------------|------|--------|
| SR-PH2-TC-001 | Status facet Pending | @regression @p2 @iacs-md @sales-returns @SR-PH2 | ✅ |
| SR-PH2-TC-002 | Return reason Defective | @regression @p2 @iacs-md @sales-returns @SR-PH2 | ✅ |
| SR-PH2-TC-003 | Search by return order substring (DB) | @regression @p2 @iacs-md @sales-returns @SR-PH2 | ✅ |
| SR-PH2-TC-004 | Clear filters | @regression @p2 @iacs-md @sales-returns @SR-PH2 | ✅ |
| SR-PH2-TC-005 | Pagination page 2 (`test.skip` if one page) | @regression @p3 @iacs-md @sales-returns @SR-PH2 | ✅ |

---

## Sales Returns (SR-PH3) — Phase 3 (create wizard)

**Feature file:** `e2e/features/o2c/sales-returns/sales-returns.feature`  
**POM:** `e2e/src/pages/o2c/CreateSalesReturnOrderPage.ts`  
**Steps:** `e2e/src/steps/o2c/sales-returns-steps.ts`  
**Phased plan:** [sales-returns/FEATURE-SR-phased-plan.md](sales-returns/FEATURE-SR-phased-plan.md)  
**Detail:** [sales-returns/test-cases.md](sales-returns/test-cases.md)  
**Implementation:** [IMPL-048](../../implementations/2026-03/IMPL-053_sales-returns-consolidated.md)

| ID | Scenario (summary) | Tags | Status |
|----|-------------------|------|--------|
| SR-PH3-TC-001 | Eligible invoice + dealer (DB + dialog fallback) | @regression @p1 @iacs-md @sales-returns @SR-PH3 | ✅ |
| SR-PH3-TC-002 | Return qty on first line | @regression @p1 @iacs-md @sales-returns @SR-PH3 | ✅ |
| SR-PH3-TC-003 | Reason, notes, submit wizard | @regression @p1 @iacs-md @sales-returns @SR-PH3 | ✅ |
| SR-PH3-TC-004 | Detail pending + DB sandwich | @regression @p1 @iacs-md @sales-returns @SR-PH3 | ✅ |

---

## Sales Returns (SR-PH4–PH8) — Detail, credit memo, validation, report, inventory invariants

**Phased plan / detail:** [sales-returns/FEATURE-SR-phased-plan.md](sales-returns/FEATURE-SR-phased-plan.md), [sales-returns/test-cases.md](sales-returns/test-cases.md)  
**Implementation:** [IMPL-050](../../implementations/2026-03/IMPL-053_sales-returns-consolidated.md)

| Phase | Feature file(s) | Summary |
|-------|-----------------|--------|
| SR-PH4 | `sales-returns.feature` | Receipt + cancel hidden; DB `received` or `credit_memo_created` |
| SR-PH5 | `sales-returns.feature` | Credit memo create or already-linked CM |
| SR-PH6 | `sales-returns.feature` | Cancel guardrails + `alert()` validation on wizard |
| SR-PH7 | `sales-returns.feature` | Report page **Load Report** + **Filters** |
| SR-PH8 | `sales-returns.feature` | QC Failed GRN inventory invariant (delta must remain zero) |

**Full Sales Returns pack:** `npm run test:dev -- --project=iacs-md --grep "@sales-returns"` — **20** scenarios (2026-03-23).

---

## Manual Test References
- Manual test cases documented in: `docs/test-cases/manual/o2c/`

## Test Data Requirements
- Active dealers in database (at least 1)
- User with O2C indent 'create' permission
- Test data prefix: `AUTO_QA_` + timestamp for transactional data
- Stable data: Use `TestDataLocator.getStableDealer()` for prerequisite dealers

## Page Objects

### IndentsPage
- **File**: `e2e/src/pages/o2c/IndentsPage.ts`
- **Source**: `../web_app/src/app/o2c/components/O2CIndentsManager.tsx`, `DealerSelectionDialog.tsx`
- **Purpose**: Manages indent list view and dealer selection modal
- **Key Methods**: (see test-cases.md list); includes navigate, create indent, list filters, row actions, dealer modal, `verifyDealerModalShowingNoResults()`.
- **Component Library**: Uses `DialogComponent` for modal interactions
- **Last Updated**: 2026-02-14

### IndentDetailPage
- **File**: `e2e/src/pages/o2c/IndentDetailPage.ts`
- **Source**: `../web_app/src/app/o2c/indents/[id]/page.tsx`, `EnhancedEditableItemsCard.tsx`, `WarehouseSelector.tsx`
- **Purpose**: Indent detail – edit, add product, save, submit, warehouse, approve/reject, process workflow
- **Key Methods**:
  - `navigate(indentId)` - Navigate to /o2c/indents/:id
  - `verifyDetailPageLoaded()` - Heading, Back, Indent Information card
  - `clickBack()` - Return to list
  - `clickEdit()`, `clickSave()`, `clickCancel()` - Edit mode
  - `clickAddItems()` - Open Add Products modal
  - `searchProduct(term)`, `openAddProductsAndSearch(term)`, `selectFirstProductAndAdd()` - Add product flow
  - `verifyAddProductsModalHasResults()`, `verifyAddProductsModalShowingNoResults()` - Product search assertions
  - `clickSubmitIndent()` - Submit indent (draft)
  - `clickSelectWarehouse()`, `selectFirstWarehouse()`, `selectWarehouseByName(name)` - Warehouse selection
  - `clickApprove()`, `clickReject()`, `fillApprovalCommentsAndSubmit(comments)` - Approval dialog
  - `clickProcessWorkflow()`, `clickConfirmAndProcess()` - Process Workflow (approved)
  - `waitForSuccessToast(message?)` - Wait for sonner toast
- **Last Updated**: 2026-02-14

## Step Definitions

### indent-steps.ts
- **File**: `e2e/src/steps/o2c/indent-steps.ts`
- **Module**: O2C Indents
- **Steps Defined**:
  - `Given I am on the O2C Indents page`
  - `When I click the Create Indent button`
  - `When I search for dealer by name {string}`
  - `When I select the dealer {string}`
  - `When I create an indent for dealer {string}` (compound: open modal, search, select, wait for navigation)
  - `When I go back to the O2C Indents page`
  - `When I type {string} in the indents search box`
  - `When I filter by Status {string}`
  - `When I clear all filters`
  - `Given the indents table has at least one row`
  - `When I click the first indent row`
  - `Then the O2C Indents list page should be loaded`
  - `Then the list should show filtered results or the empty state`
  - `Then the Clear filters button should not be visible`
  - `Then I should see the empty state for indents or at least one indent row`
  - `Then I should see the {string} modal`
  - `Then the modal should display a list of active dealers`
  - `Then the modal should have a search input`
  - `Then the dealer list should be filtered`
  - `Then I should see {string} in the results`
  - `Then the modal should close`
  - `Then I should be on the indent creation page with dealer pre-selected`
  - `Then I should be on the indent detail page`
  - `Then I should be on the same indent detail page as before`
  - `Then the indent detail page should be loaded`
  - `When I click Edit on the indent detail page`
  - `When I add a product by searching for {string}`
  - `When I save the indent`
  - `When I submit the indent`
  - `When I go back to the O2C Indents page from the indent detail`
  - `Then the indent should be saved successfully`
  - `Then the indent should be submitted successfully`
  - `When I search for dealer by code {string}`
  - `Then the dealer list should show no matching dealers`
  - `When I open Add Products and search for {string}`
  - `Then the Add Products modal should show at least one product`
  - `Then the Add Products modal should show no matching products`
  - `Then the Warehouse Selection card should be visible`
  - `When I select the first warehouse for the indent`
  - `Then the Approve button should be disabled` / `enabled`
  - `When I click Approve on the indent detail page`
  - `When I click Reject on the indent detail page`
  - `When I submit the approval dialog`
  - `When I fill approval comments {string} and submit the approval dialog`
  - `Then the indent should be approved successfully`
  - `When I click Process Workflow` / `When I confirm and process the workflow`
  - `Then the workflow should complete successfully`
  - `Then the Submit Indent button should be disabled`
  - `Then the Reject button in the approval dialog should be disabled`
  - `Then the Edit/Submit Indent/Approve/Process Workflow button should be visible/not visible on the indent detail page`
- **Last Updated**: 2026-02-14
