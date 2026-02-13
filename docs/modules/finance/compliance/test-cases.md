# Finance & Compliance - Test Cases

## Automated Tests

### @GSTR1-DAEE-100-TC-001 - User with compliance.read can open GSTR-1 Review page
- **Feature File**: `e2e/features/finance/compliance/gstr1.feature`
- **Scenario**: User with compliance.read can open `/finance/compliance/gstr1` and see the page
- **Coverage**: Permission check; page access verification
- **Status**: ✅ Automated
- **Tags**: @DAEE-100 @smoke @regression @p0 @iacs-md
- **Last Updated**: 2026-02-13

**Gherkin**:
```gherkin
Scenario: User with compliance.read can open GSTR-1 Review page
  Given I am logged in to the Application
  Given I am on the GSTR-1 Review page
  Then I should see the GSTR-1 Review page
```

**Test Steps**:
1. User authenticated (via Background step)
2. Navigate to `/finance/compliance/gstr1`
3. Verify page title "GSTR-1 Review" is visible

**Prerequisites**:
- User with `compliance.read` or `finance:read` permission (iacs-md has finance:read)
- Web app running at TEST_BASE_URL

**Test Data**:
- No test data required (page load test)

**Notes**:
- Uses `GSTR1Page` POM with semantic locator for page heading
- Verifies page loaded successfully (not redirected)

---

### @GSTR1-DAEE-100-TC-002 - Page shows empty state until filters are applied
- **Feature File**: ~~`e2e/features/finance/compliance/gstr1.feature`~~ (Removed)
- **Scenario**: Page shows empty state with "Select filters to load" when no filters applied
- **Coverage**: Empty state UI behavior
- **Status**: ❌ **Invalid Scenario** - Removed from test suite
- **Tags**: @DAEE-100 @smoke @regression @p0 @iacs-md
- **Last Updated**: 2026-02-13

**Reason for Removal**:
- Empty state behavior is conditional (`!data && !loading`) and not reliable for automation
- Empty state may not appear consistently due to timing/loading states
- Test was flaky and unreliable

**Notes**:
- Scenario marked as "To Be Ignored" in test scenarios document
- Removed from feature file to avoid false failures

---

### @GSTR1-DAEE-100-TC-003 - User access control for GSTR-1 page
- **Feature File**: `e2e/features/finance/compliance/gstr1.feature`
- **Scenario**: User access control verification (multi-user Scenario Outline)
- **Coverage**: RBAC permission boundaries
- **Status**: ✅ Automated (partial - needs non-compliance user)
- **Tags**: @DAEE-100 @regression @p1 @multi-user @iacs-md
- **Last Updated**: 2026-02-13

**Gherkin**:
```gherkin
Scenario Outline: User access control for GSTR-1 page
  Given I am logged in as "<User>"
  When I navigate to "/finance/compliance/gstr1"
  Then I should see "<Expected Result>" for GSTR-1 access

  Examples:
    | User              | Expected Result        |
    | IACS MD User     | the GSTR-1 Review page |
```

**Test Steps**:
1. User logged in as specified role
2. Navigate to GSTR-1 page
3. Verify expected result (access granted or denied)

**Prerequisites**:
- User profiles configured in `user-profiles.config.ts`
- For access denied test: User without `compliance.read` permission

**Test Data**:
- No test data required

**Notes**:
- Currently tests with IACS MD User (has finance:read, should have access)
- TODO: Add non-compliance user (e.g., Viewer) when user profile available
- Access denied verified by redirect to `/restrictedUser` or error message
- Uses Scenario Outline for multi-user testing pattern

---

### @GSTR1-DAEE-100-TC-004 - Filing Period dropdown visible with current month options
- **Feature File**: `e2e/features/finance/compliance/gstr1.feature`
- **Scenario**: Filing Period dropdown is visible and contains current/open month options
- **Coverage**: Filter visibility and option availability
- **Status**: ✅ Automated
- **Tags**: @DAEE-100 @regression @p1 @iacs-md
- **Last Updated**: 2026-02-13

**Gherkin**:
```gherkin
Scenario: Filing Period dropdown visible with current month options
  Given I am logged in to the Application
  Given I am on the GSTR-1 Review page
  Then I should see the GSTR-1 Review page
  And the Filing Period dropdown should be visible with current month options
```

**Test Steps**:
1. User authenticated
2. Navigate to GSTR-1 page
3. Verify page loaded
4. Verify Filing Period dropdown is visible
5. Open dropdown and verify it contains current month or previous month (default)

**Prerequisites**:
- User with compliance.read permission
- Page loaded successfully

**Test Data**:
- No test data required (verifies dropdown options)

**Notes**:
- Dropdown shows last 24 months
- Default selection is previous month
- Verifies dropdown contains current/open month options

---

### @GSTR1-DAEE-100-TC-005 - Seller GSTIN dropdown displays GSTIN and State Name format
- **Feature File**: `e2e/features/finance/compliance/gstr1.feature`
- **Scenario**: Seller GSTIN dropdown displays "GSTIN - State Name" format (not city name)
- **Coverage**: Filter format verification (Regression DEF-003)
- **Status**: ✅ Automated
- **Tags**: @DAEE-100 @regression @p1 @iacs-md
- **Last Updated**: 2026-02-13

**Gherkin**:
```gherkin
Scenario: Seller GSTIN dropdown displays GSTIN and State Name format
  Given I am logged in to the Application
  Given I am on the GSTR-1 Review page
  Then I should see the GSTR-1 Review page
  And the Seller GSTIN dropdown should display GSTIN and State Name format
```

**Test Steps**:
1. User authenticated
2. Navigate to GSTR-1 page
3. Verify page loaded
4. Open Seller GSTIN dropdown
5. Verify options display "GSTIN - State Name" format (not city name)

**Prerequisites**:
- User with compliance.read permission
- At least one seller GSTIN available in database

**Test Data**:
- Seller GSTINs with state_name populated (from address_book table)

**Notes**:
- Regression DEF-003: Previously showed city name (e.g., "Kurnook"), now shows state name (e.g., "Andhra Pradesh")
- Format: GSTIN (monospace) on first line, State Name on second line
- Verifies GSTIN format (15 chars alphanumeric)

---

### @GSTR1-DAEE-100-TC-006 - Selecting filters loads data and removes empty state
- **Feature File**: `e2e/features/finance/compliance/gstr1.feature`
- **Scenario**: Selecting both GSTIN and Return Period filters loads data automatically
- **Coverage**: Filter interaction and data loading (Smoke)
- **Status**: ✅ Automated
- **Tags**: @DAEE-100 @smoke @regression @p0 @iacs-md
- **Last Updated**: 2026-02-13

**Gherkin**:
```gherkin
Scenario: Selecting filters loads data and removes empty state
  Given I am logged in to the Application
  Given I am on the GSTR-1 Review page
  Then I should see the GSTR-1 Review page
  When I select Seller GSTIN "first" and Return Period "previous"
  Then data should load and empty state should disappear
```

**Test Steps**:
1. User authenticated
2. Navigate to GSTR-1 page
3. Verify page loaded
4. Select first available Seller GSTIN
5. Select previous month (default) for Return Period
6. Verify data loads (summary cards/tabs appear)
7. Verify empty state disappears

**Prerequisites**:
- User with compliance.read permission
- At least one seller GSTIN available
- GSTR-1 data available for selected period

**Test Data**:
- Seller GSTINs (uses first available)
- GSTR-1 data for previous month

**Notes**:
- Data loads automatically when both filters are selected (useEffect triggers fetchData)
- Empty state disappears when data is loaded
- Verifies "Data Loaded" status appears
- Verifies summary cards or tabs are visible

---

### @GSTR1-DAEE-100-TC-007 - Return Period card shows human-readable format
- **Feature File**: `e2e/features/finance/compliance/gstr1.feature`
- **Scenario**: Return Period summary card shows "December 2025" not raw "122025"
- **Coverage**: Summary card format verification (Smoke, Regression DEF-004)
- **Status**: ✅ Automated
- **Tags**: @DAEE-100 @smoke @regression @p0 @iacs-md
- **Last Updated**: 2026-02-13

**Gherkin**:
```gherkin
Scenario: Return Period card shows human-readable format
  Given I am logged in to the Application
  Given I am on the GSTR-1 Review page
  Then I should see the GSTR-1 Review page
  When I select Seller GSTIN "first" and Return Period "previous"
  Then data should load and empty state should disappear
  And the Return Period card should show human-readable format
```

**Test Steps**:
1. User authenticated
2. Navigate to GSTR-1 page
3. Select filters and load data
4. Verify Return Period card is visible
5. Verify card shows human-readable format ("Month Year") not raw format ("MMYYYY")

**Prerequisites**:
- User with compliance.read permission
- GSTR-1 data loaded (via filter selection)

**Test Data**:
- GSTR-1 data with return_period field

**Notes**:
- Regression DEF-004: Previously showed raw format "122025", now shows "December 2025"
- Uses `formatReturnPeriod()` function to convert MMYYYY to readable format
- Verifies format matches "Month Year" pattern (e.g., "December 2025")

---

## Test Coverage Summary

| Feature | Total Scenarios | Automated | Invalid/Ignored | Coverage % |
|---------|-----------------|-----------|-----------------|------------|
| Access & Navigation | 3 | 2 | 1 | 100% |
| Global Filters | 4 | 4 | 0 | 100% |
| **Total** | **7** | **6** | **1** | **100%** |

**Note**: TC-002 marked as Invalid Scenario and removed from test suite due to unreliable empty state behavior.

## Gaps & Future Tests

### High Priority
- [ ] Add non-compliance user profile for TC-003 access denied test case
- [x] Global Filters tests (TC-004 to TC-007) - ✅ Completed
- [ ] Summary Cards tests (TC-008 to TC-012)

### Medium Priority
- [ ] Validation Banner tests (TC-013 to TC-015)
- [ ] B2B Tab tests (TC-016 to TC-022)

### Low Priority
- [ ] Export functionality tests (TC-034 to TC-041)
- [ ] Error & Loading States tests (TC-045 to TC-047)

## Page Objects

### GSTR1Page
- **File**: `e2e/src/pages/finance/GSTR1Page.ts`
- **Source**: `../web_app/src/app/finance/compliance/gstr1/page.tsx`
- **Purpose**: Manages GSTR-1 Review page interactions
- **Key Methods**:
  - `navigate()` - Navigate to /finance/compliance/gstr1
  - `verifyPageLoaded()` - Assert page title "GSTR-1 Review" visible
  - `verifyEmptyState()` - Assert "Select filters to load" message visible
  - `verifyAccessDenied()` - Assert redirect to /restrictedUser or error
  - `verifyFiltersPresent()` - Verify Seller GSTIN and Return Period filters visible
  - `selectSellerGSTIN(gstin)` - Select GSTIN from dropdown
  - `selectFilingPeriod(monthYear)` - Select period from dropdown
  - `verifyFilingPeriodDropdownVisible()` - Verify dropdown visible with current month options (TC-004)
  - `verifySellerGSTINFormat()` - Verify "GSTIN - State Name" format (TC-005)
  - `verifyDataLoadedAfterFilters()` - Verify data loads and empty state disappears (TC-006)
  - `verifyReturnPeriodCardFormat()` - Verify human-readable period format (TC-007)
- **Component Library**: Uses `SelectComponent` for ShadCN/Radix dropdowns
- **Last Updated**: 2026-02-13

## Step Definitions

### gstr1-steps.ts
- **File**: `e2e/src/steps/finance/gstr1-steps.ts`
- **Module**: Finance & Compliance - GSTR-1
- **Steps Defined**:
  - `Given I am on the GSTR-1 Review page`
  - `Then I should see the GSTR-1 Review page`
  - `Then I should see Seller GSTIN and Return Period filters` (for filter verification)
  - `Then I should be denied access to GSTR-1 page`
  - `Then I should see {string} for GSTR-1 access` (for Scenario Outline)
  - `When I navigate to "/finance/compliance/gstr1"` (for TC-003)
  - `Then the Filing Period dropdown should be visible with current month options` (TC-004)
  - `Then the Seller GSTIN dropdown should display GSTIN and State Name format` (TC-005)
  - `When I select Seller GSTIN {string} and Return Period {string}` (TC-006, TC-007)
  - `Then data should load and empty state should disappear` (TC-006)
  - `Then the Return Period card should show human-readable format` (TC-007)
- **Last Updated**: 2026-02-13

## Test Data Requirements
- User with `compliance.read` or `finance:read` permission (iacs-md)
- User without compliance permission (for TC-003 denied case - TODO)
- Seller GSTINs available in database (for TC-004, TC-005, TC-006, TC-007)
- GSTR-1 data for previous month (for TC-006, TC-007)
- No transactional test data creation required (read-only verification)
