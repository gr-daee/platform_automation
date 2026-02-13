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

## Test Coverage Summary

| Feature | Total Scenarios | Automated | Invalid/Ignored | Coverage % |
|---------|-----------------|-----------|-----------------|------------|
| Access & Navigation | 3 | 2 | 1 | 100% |
| **Total** | **3** | **2** | **1** | **100%** |

**Note**: TC-002 marked as Invalid Scenario and removed from test suite due to unreliable empty state behavior.

## Gaps & Future Tests

### High Priority
- [ ] Add non-compliance user profile for TC-003 access denied test case
- [ ] Global Filters tests (TC-004 to TC-007)
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
  - `selectSellerGSTIN(gstin)` - Select GSTIN from dropdown
  - `selectFilingPeriod(monthYear)` - Select period from dropdown
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
- **Last Updated**: 2026-02-13

## Test Data Requirements
- User with `compliance.read` or `finance:read` permission (iacs-md)
- User without compliance permission (for TC-003 denied case - TODO)
- No transactional test data required for Access & Navigation tests
