# O2C Module - Test Cases

**Master plan (Indent → SO → Invoice):** [O2C-Indent-SO-Invoice-Test-Scenarios-For-Review.md](./O2C-Indent-SO-Invoice-Test-Scenarios-For-Review.md) — full list of test case IDs, status, feature files, and implementation order by block.

## Automated Tests

### @O2C-INDENT-TC-001 - O2C Indents list page loads
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: O2C Indents list page loads with title, status cards, and table or empty state
- **Coverage**: List view load, layout (heading, Create Indent button, status cards, table or empty state)
- **Status**: ✅ Automated
- **Tags**: @smoke, @critical, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**:
```gherkin
Scenario: O2C Indents list page loads with title, status cards, and table or empty state
  Given I am on the O2C Indents page
  Then the O2C Indents list page should be loaded
```

**Test Steps**:
1. User authenticated (via Background)
2. Navigate to O2C Indents page
3. Verify page heading "O2C Indents", Create Indent button, status cards, and table or empty state

**Prerequisites**: User with O2C access (e.g. IACS MD User).

**Notes**: Uses `IndentsPage.verifyListPageLoaded()`; POM includes list locators (pageHeading, statusCardsRegion, indentsTable, emptyStateHeading).

---

### @O2C-INDENT-TC-002 - Create Indent for dealer creates new indent and navigates to detail
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

### @O2C-INDENT-TC-003 - Create Indent for dealer with existing draft navigates to that draft
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

**Prerequisites**: Same as TC-002; dealer may have existing draft from first step.

**Notes**: Asserts `checkDraftIndentByDealer` behavior: second "Create Indent" for same dealer opens existing draft instead of creating a new one.

---

### @O2C-INDENT-TC-004 - Search indents by dealer name or indent number filters the list
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Search indents by dealer name or indent number filters the list
- **Coverage**: List search (debounced); table or empty state update
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: Type in search box → list shows filtered results or empty state.

**Notes**: Uses `IndentsPage.fillSearch()`; polls for table/empty state update.

---

### @O2C-INDENT-TC-005 - Filter by Status shows only matching indents
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Filter by Status shows only matching indents
- **Coverage**: Faceted filter (Status); list update
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: Filter by Status "Draft" → list shows filtered results or empty state.

**Notes**: Uses `IndentsPage.selectStatusFilter()` (Popover + Command option).

---

### @O2C-INDENT-TC-006 - Clear filters restores the full list
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Clear filters restores the full list
- **Coverage**: Clear filters button; filters cleared
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: Filter by Status "Draft" → clear all filters → Clear filters button not visible.

**Notes**: Requires at least one filter applied first.

---

### @O2C-INDENT-TC-008 - Clicking an indent row navigates to indent detail page
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Clicking an indent row navigates to indent detail page
- **Coverage**: Table row click → detail page
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: Given table has at least one row, click first indent row → on indent detail page.

**Notes**: Uses `IndentsPage.clickFirstIndentRow()`; depends on list having data.

---

### @O2C-INDENT-TC-023 - When no indents match the filter the empty state is shown
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: When no indents match the filter the empty state is shown
- **Coverage**: Empty state UI (filter returns 0 results or table has rows)
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: Filter by Status "Rejected" → empty state for indents or at least one indent row.

**Notes**: Passes whether filter returns 0 results (empty state) or has data (rows). When the system has at least one rejected indent, the list shows those rows; when none, the empty state is shown.

---

### @O2C-INDENT-TC-012 - Dealer Search and Selection in Modal
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

### @O2C-INDENT-TC-024 - Indent detail page loads with heading and Indent Information
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Indent detail page loads with heading and Indent Information
- **Coverage**: Detail page load after create indent; heading, Back, Indent Information card
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: Create indent for dealer → on detail page → indent detail page should be loaded.

**Notes**: Uses `IndentDetailPage.verifyDetailPageLoaded()`.

---

### @O2C-INDENT-TC-025 - Edit indent add product by search and save
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Edit indent add product by search and save
- **Coverage**: Edit mode, Add Products modal, search by product name/code, add product, Save
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: On detail (draft) → Click Edit → Add product by searching "NPK" → Save → indent saved successfully.

**Prerequisites**: At least one product matching search "NPK" (name/code) in tenant.

**Notes**: Uses `IndentDetailPage` (clickEdit, clickAddItems, searchProduct, selectFirstProductAndAdd, clickSave). Toasts: "Added … to indent", "Items updated successfully!".

---

### @O2C-INDENT-TC-026 - Submit indent after adding product
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Submit indent after adding product
- **Coverage**: Full draft flow: add product, save, submit; status → submitted
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: On detail (draft) → Edit → add product "NPK" → Save → Submit Indent → submitted successfully.

**Notes**: Depends on TC-025 flow; toast "Indent submitted successfully!".

---

### @O2C-INDENT-TC-038 - Back from indent detail returns to list
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Back from indent detail returns to list
- **Coverage**: Back button on detail page; return to /o2c/indents list
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: List has rows → click first row → on detail → go back from detail → list page loaded.

**Notes**: Uses `IndentDetailPage.clickBack()`; asserts URL and list page loaded.

---

### @O2C-INDENT-TC-039 - User searches dealer by dealer code and selects
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

### @O2C-INDENT-TC-040 - Search non-existent dealer shows no matching dealers
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Search non-existent dealer shows no matching dealers
- **Coverage**: Dealer modal empty search result; "No dealers found matching your search."
- **Status**: ✅ Automated
- **Tags**: @regression, @dealer-search, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: Create Indent → Select Dealer modal → search "AUTO_QA_NONEXISTENT_DEALER_999" → dealer list shows no matching dealers.

**Notes**: Uses `IndentsPage.verifyDealerModalShowingNoResults()`.

---

### @O2C-INDENT-TC-041 - Search product by product code shows results in Add Products modal
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Search product by product code shows results in Add Products modal
- **Coverage**: Add Products modal search by product code (or name); at least one result
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: On indent detail (draft) → Edit → Open Add Products and search "NPK" → modal shows at least one product.

**Prerequisites**: At least one product matching "NPK" (name/code/variant/package). Adjust search term if tenant uses different product codes.

**Notes**: Uses `IndentDetailPage.openAddProductsAndSearch()`, `verifyAddProductsModalHasResults()`.

---

### @O2C-INDENT-TC-042 - Search non-existent product shows no matching products in Add Products modal
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Search non-existent product shows no matching products in Add Products modal
- **Coverage**: Add Products modal empty search result; "No products match" / "No Products Found"
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: On indent detail (draft) → Edit → Open Add Products and search "AUTO_QA_NONEXISTENT_PRODUCT_999" → modal shows no matching products.

**Notes**: Uses `IndentDetailPage.verifyAddProductsModalShowingNoResults()`.

---

### @O2C-INDENT-TC-030 - Submit Indent button is disabled when indent has no items
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Submit Indent button is disabled when indent has no items
- **Coverage**: Draft with no line items; Submit Indent disabled
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: Create indent (draft, no products added) → Submit Indent button should be disabled.

---

### @O2C-INDENT-TC-035 - Draft indent shows Edit and Submit but not Approve or Process Workflow
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Draft indent shows Edit and Submit Indent but not Approve or Process Workflow
- **Coverage**: Draft state UI; button visibility
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: On draft detail → Edit and Submit Indent visible; Approve and Process Workflow not visible.

---

### @O2C-INDENT-TC-027 - Submitted indent shows Warehouse Selection and selecting warehouse enables Approve
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Submitted indent shows Warehouse Selection and selecting warehouse enables Approve
- **Coverage**: Submitted state; Warehouse Selection card; Approve disabled until warehouse selected; select warehouse → Approve enabled
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: Create → add product → save → submit → Warehouse Selection visible, Approve disabled → select first warehouse → Approve enabled.

---

### @O2C-INDENT-TC-031 - Approve button disabled when warehouse not selected
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Approve button is disabled when warehouse not selected on submitted indent
- **Coverage**: Business rule; Approve disabled until warehouse selected
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: After submit → Warehouse Selection visible, Approve button disabled.

---

### @O2C-INDENT-TC-036 - Submitted indent shows Warehouse and Approve/Reject
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Submitted indent shows Warehouse Selection and Approve and Reject buttons
- **Coverage**: Submitted state; Approve/Reject visible; Process Workflow not visible
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: After submit → Warehouse Selection visible, Approve visible, Process Workflow not visible.

---

### @O2C-INDENT-TC-028 - Approve indent with optional comments
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Approve indent with optional comments after selecting warehouse
- **Coverage**: Approval flow; select warehouse → Approve → submit dialog (no comment) → approved
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: Submitted indent → select warehouse → Click Approve → submit approval dialog → indent approved successfully.

---

### @O2C-INDENT-TC-032 - Reject button disabled until comment provided
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Reject button in approval dialog is disabled until comment is provided
- **Coverage**: Reject flow; dialog submit disabled until comments; fill comment and submit
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: Submitted → select warehouse → Click Reject → Reject button in dialog disabled → fill comments and submit → detail page loaded.

---

### @O2C-INDENT-TC-037 - Approved indent shows Process Workflow button
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Approved indent shows Process Workflow button
- **Coverage**: Approved state; Process Workflow button visible
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: After approve → Process Workflow button visible.

---

### @O2C-INDENT-TC-029 - Process Workflow creates SO or Back Order
- **Feature File**: `e2e/features/o2c/indents.feature`
- **Scenario**: Process Workflow creates Sales Order or Back Order from approved indent
- **Coverage**: Full flow: create → add product → submit → warehouse → approve → Process Workflow → Confirm & Process → success
- **Status**: ✅ Automated
- **Tags**: @regression, @iacs-md
- **Last Updated**: 2026-02-14

**Gherkin**: Approved indent → Click Process Workflow → Confirm and process → workflow completes successfully (toast).

**Notes**: Depends on warehouse and stock; may create SO and/or Back Order. Toast message may vary.

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
