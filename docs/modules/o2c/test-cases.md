# O2C Module - Test Cases

## Automated Tests

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
- **Key Methods**:
  - `navigate()` - Navigate to /o2c/indents
  - `clickCreateIndent()` - Click Create Indent and wait for modal
  - `searchDealer(searchTerm)` - Search dealers in modal
  - `selectDealer(dealerName)` - Select dealer and close modal
  - `verifyDealerModalVisible()` - Verify modal opened
  - `getDealerCount()` - Get number of dealers displayed
- **Component Library**: Uses `DialogComponent` for modal interactions
- **Last Updated**: 2026-02-04

## Step Definitions

### indent-steps.ts
- **File**: `e2e/src/steps/o2c/indent-steps.ts`
- **Module**: O2C Indents
- **Steps Defined**:
  - `Given I am on the "O2C Indents" page`
  - `When I click the "Create Indent" button`
  - `Then I should see the "Select Dealer" modal`
  - `Then the modal should display a list of active dealers`
  - `Then the modal should have a search input`
  - `When I search for dealer by name {string}`
  - `Then the dealer list should be filtered`
  - `Then I should see {string} in the results`
  - `When I select the dealer {string}`
  - `Then the modal should close`
  - `Then I should be on the indent creation page with dealer pre-selected`
- **Last Updated**: 2026-02-04
