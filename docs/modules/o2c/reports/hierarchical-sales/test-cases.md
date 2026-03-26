# O2C Hierarchical Sales Report - Test Cases

## Overview
Test cases for the Hierarchical Sales Report page (`/o2c/reports/hierarchical-sales`). Section 4.1 (TC-001, TC-002) are **documented only** with status ⏳ Pending; TC-003 through TC-028 are implemented or planned for implementation.

## 4.1 Access and Page Load (P0) - Documented Only, Not Implemented

### @O2C-HSR-TC-001 - User with sales_reports.read can open page
- **Feature File**: `e2e/features/o2c/reports/hierarchical-sales.feature`
- **Scenario**: User with sales_reports.read can open page and see "Hierarchical Sales Report" heading
- **Coverage**: Permission check; page access verification
- **Status**: ⏳ Pending (documented, not implemented in this phase)
- **Tags**: @O2C-HSR-TC-001 @smoke @p0 @iacs-md
- **Last Updated**: 2026-02-18

**Gherkin**:
```gherkin
Scenario: User with sales_reports.read can open Hierarchical Sales Report page
  Given I am logged in to the Application
  Given I am on the Hierarchical Sales Report page
  Then I should see the Hierarchical Sales Report page
```

**Notes**: Same pattern as GSTR1 TC-001. Will be automated in a future phase.

---

### @O2C-HSR-TC-002 - User without sales_reports.read is denied
- **Feature File**: `e2e/features/o2c/reports/hierarchical-sales.feature`
- **Scenario**: User without sales_reports.read is denied (redirect or restricted)
- **Coverage**: RBAC; redirect to /restrictedUser or error
- **Status**: ⏳ Pending (documented, not implemented in this phase)
- **Tags**: @O2C-HSR-TC-002 @critical @p0 @multi-user
- **Last Updated**: 2026-02-18

**Gherkin**:
```gherkin
Scenario Outline: User without sales_reports.read is denied access
  Given I am logged in as "<User>"
  When I navigate to "/o2c/reports/hierarchical-sales"
  Then I should see "<Expected Result>" for Hierarchical Sales Report access

  Examples:
    | User              | Expected Result        |
    | IACS MD User      | the Hierarchical Sales Report page |
    # TODO: Add user without sales_reports.read when profile available
```

**Notes**: Scenario Outline with allowed/denied user; verify redirect to `/restrictedUser` or equivalent. Will be automated when non–sales_reports user profile is available.

---

## 4.2 Filters and Validation (P0–P1)

### @O2C-HSR-TC-003 - Generate Report disabled when From or To date missing
- **Feature File**: `e2e/features/o2c/reports/hierarchical-sales.feature`
- **Scenario**: Generate Report button is disabled when From or To date is missing
- **Coverage**: Required date validation
- **Status**: ✅ Automated
- **Tags**: @O2C-HSR-TC-003 @regression @p1 @iacs-md

### @O2C-HSR-TC-004 - Quick period "This Month" sets From/To to current month
- **Status**: ✅ Automated
- **Tags**: @O2C-HSR-TC-004 @regression @iacs-md

### @O2C-HSR-TC-005 - Quick period "This Quarter" sets correct quarter range
- **Status**: ✅ Automated
- **Tags**: @O2C-HSR-TC-005 @regression @iacs-md

### @O2C-HSR-TC-006 - Quick period "This Year" sets Jan 1 to today
- **Status**: ✅ Automated
- **Tags**: @O2C-HSR-TC-006 @regression @iacs-md

### @O2C-HSR-TC-007 - State (GSTIN) dropdown shows "All states" and state options
- **Status**: ✅ Automated
- **Tags**: @O2C-HSR-TC-007 @regression @iacs-md

### @O2C-HSR-TC-008 - Region dropdown populated from master_regions
- **Status**: ✅ Automated
- **Tags**: @O2C-HSR-TC-008 @regression @p2 @iacs-md

### @O2C-HSR-TC-009 - Territory dropdown filters by selected Region
- **Status**: ✅ Automated
- **Tags**: @O2C-HSR-TC-009 @regression @iacs-md

### @O2C-HSR-TC-010 - Toast "Please select from and to dates" when Generate clicked without dates
- **Status**: ✅ Automated
- **Tags**: @O2C-HSR-TC-010 @regression @negative @iacs-md

---

## 4.3 Report Generation and Summary (P0–P1)

### @O2C-HSR-TC-011 - Generate Report with valid date range loads report and summary cards
- **Status**: ✅ Automated
- **Tags**: @O2C-HSR-TC-011 @smoke @p0 @iacs-md

### @O2C-HSR-TC-012 - Loading state shows "Generating..." on button during fetch
- **Status**: ✅ Automated
- **Tags**: @O2C-HSR-TC-012 @regression @iacs-md

### @O2C-HSR-TC-013 - Success toast after report load
- **Status**: ✅ Automated
- **Tags**: @O2C-HSR-TC-013 @regression @iacs-md

### @O2C-HSR-TC-014 - Summary card values numeric and Grand Total row visible
- **Status**: ✅ Automated
- **Tags**: @O2C-HSR-TC-014 @regression @iacs-md

### @O2C-HSR-TC-015 - Report with filters returns scoped data
- **Status**: ✅ Automated
- **Tags**: @O2C-HSR-TC-015 @regression @p1 @iacs-md

---

## 4.4 Hierarchy and Collapsible (P1)

### @O2C-HSR-TC-016 - Expand All expands all sections
- **Status**: ✅ Automated
- **Tags**: @O2C-HSR-TC-016 @regression @iacs-md

### @O2C-HSR-TC-017 - Collapse All collapses hierarchy
- **Status**: ✅ Automated
- **Tags**: @O2C-HSR-TC-017 @regression @iacs-md

### @O2C-HSR-TC-018 - State row shows state name, code, dealer count, Inv/Gross/Returns/Net/Avg
- **Status**: ✅ Automated
- **Tags**: @O2C-HSR-TC-018 @regression @iacs-md

### @O2C-HSR-TC-019 - Dealer row shows dealer code, name, GSTIN, Inv/Gross/Ret/Net/Avg
- **Status**: ✅ Automated
- **Tags**: @O2C-HSR-TC-019 @regression @iacs-md

### @O2C-HSR-TC-020 - Invoice table under dealer has expected columns
- **Status**: ✅ Automated
- **Tags**: @O2C-HSR-TC-020 @regression @iacs-md

### @O2C-HSR-TC-021 - Invoice with return orders expands to show Return Orders table
- **Status**: ✅ Automated (data-dependent)
- **Tags**: @O2C-HSR-TC-021 @regression @p1 @iacs-md

---

## 4.5 Export (P1)

### @O2C-HSR-TC-022 - Export Excel disabled when no report data
- **Status**: ✅ Automated
- **Tags**: @O2C-HSR-TC-022 @regression @iacs-md

### @O2C-HSR-TC-023 - Export Excel with data triggers download and success toast
- **Status**: ✅ Automated
- **Tags**: @O2C-HSR-TC-023 @smoke @iacs-md

### @O2C-HSR-TC-024 - Export button shows "Exporting..." and disabled during export
- **Status**: ✅ Automated
- **Tags**: @O2C-HSR-TC-024 @regression @iacs-md

### @O2C-HSR-TC-029 - Exported By Dealer sheet includes City column
- **Feature File**: `e2e/features/o2c/reports/hierarchical-sales.feature`
- **Scenario**: Exported By Dealer sheet includes City column and values
- **Coverage**: DAEE-344 city export regression in By Dealer sheet
- **Status**: ✅ Automated
- **Tags**: @O2C-HSR-TC-029 @regression @p1 @iacs-md
- **Last Updated**: 2026-03-24

---

## 4.6 Empty and No-Data States (P1–P2)

### @O2C-HSR-TC-025 - Initial load shows "No Report Generated" empty state
- **Status**: ✅ Automated
- **Tags**: @O2C-HSR-TC-025 @regression @iacs-md

### @O2C-HSR-TC-026 - After Generate with no invoices, "No Sales Data Found" shown
- **Status**: ✅ Automated
- **Tags**: @O2C-HSR-TC-026 @regression @iacs-md

---

## 4.7 Optional: Database Consistency (P2)

### @O2C-HSR-TC-027 - Grand Total invoice count matches sum of dealer-level counts
- **Status**: ✅ Automated (optional)
- **Tags**: @O2C-HSR-TC-027 @regression @p2 @iacs-md

### @O2C-HSR-TC-028 - Net = Gross − Returns at Grand Total level
- **Status**: ✅ Automated (optional)
- **Tags**: @O2C-HSR-TC-028 @regression @p2 @iacs-md

---

## Test Coverage Summary

| Section   | Total | Automated | Pending |
|----------|-------|-----------|---------|
| 4.1 Access | 2    | 0         | 2       |
| 4.2 Filters | 8   | 8         | 0       |
| 4.3 Report  | 5   | 5         | 0       |
| 4.4 Hierarchy | 6  | 6         | 0       |
| 4.5 Export   | 3  | 3         | 0       |
| 4.6 Empty    | 2  | 2         | 0       |
| 4.7 Optional | 2 | 2         | 0       |
| **Total**    | **29** | **27** | **2**   |
