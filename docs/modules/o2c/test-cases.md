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
