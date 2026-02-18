# FEATURE-HSR-001 - Hierarchical Sales Report Analysis

**Metadata**
- **ID**: FEATURE-HSR-001
- **Module**: O2C Reports
- **Story**: DAEE-98, DAEE-99, DAEE-111
- **Date**: 2026-02-18
- **Status**: Implementation Complete (TC-003–TC-028); TC-001/002 documented only

---

## Feature Overview

### Purpose
Hierarchical Sales Report provides sales data grouped by geography (State → Region → Territory → Dealer) with Gross Sales, Returns (from Return Orders), and Net Sales at each level. Users can filter by date range and optional State/Region/Territory, use quick period buttons, and export to Excel.

### User Stories
- **As a** Sales / Finance user with sales_reports.read
- **I want to** view sales by State → Region → Territory → Dealer and export to Excel
- **So that** I can analyze performance by geography and share reports

### Acceptance Criteria
1. [x] User can open page with sales_reports.read (TC-001 – documented)
2. [x] User without permission is denied (TC-002 – documented)
3. [x] Generate Report disabled until From/To date set (TC-003)
4. [x] Quick period buttons set date range (TC-004–TC-006)
5. [x] Filters (State, Region, Territory) work and Territory filters by Region (TC-007–TC-009)
6. [x] Generate Report loads data and shows summary cards (TC-011–TC-015)
7. [x] Expand All / Collapse All and hierarchy rows show expected data (TC-016–TC-021)
8. [x] Export Excel disabled when no data; with data triggers download and toast (TC-022–TC-024)
9. [x] Empty state and no-data state shown correctly (TC-025–TC-026)
10. [x] Optional: Grand Total consistency (TC-027–TC-028)

---

## Test Scenario Identification

### 1. Access and Page Load (P0) – Documented Only

| Scenario ID   | Description                                      | Priority | Test ID        | Status   |
|--------------|--------------------------------------------------|----------|----------------|----------|
| FS-HSR-001   | User with sales_reports.read can open page       | P0       | O2C-HSR-TC-001 | Pending  |
| FS-HSR-002   | User without permission is denied                | P0       | O2C-HSR-TC-002 | Pending  |

### 2. Filters and Validation (P0–P1)

| Scenario ID   | Description                                      | Priority | Test ID        | Status   |
|--------------|--------------------------------------------------|----------|----------------|----------|
| FS-HSR-003   | Generate Report disabled when date missing       | P1       | O2C-HSR-TC-003 | Automated |
| FS-HSR-004   | Quick period This Month sets current month       | P1       | O2C-HSR-TC-004 | Automated |
| FS-HSR-005   | Quick period This Quarter sets quarter range     | P1       | O2C-HSR-TC-005 | Automated |
| FS-HSR-006   | Quick period This Year sets Jan 1 to today       | P1       | O2C-HSR-TC-006 | Automated |
| FS-HSR-007   | State dropdown shows All states and options      | P1       | O2C-HSR-TC-007 | Automated |
| FS-HSR-008   | Region dropdown populated                        | P2       | O2C-HSR-TC-008 | Automated |
| FS-HSR-009   | Territory filters by selected Region             | P1       | O2C-HSR-TC-009 | Automated |
| FS-HSR-010   | Toast when Generate clicked without dates       | P1       | O2C-HSR-TC-010 | Automated |

### 3. Report Generation and Summary (P0–P1)

| Scenario ID   | Description                                      | Priority | Test ID        | Status   |
|--------------|--------------------------------------------------|----------|----------------|----------|
| FS-HSR-011   | Generate Report loads report and summary cards   | P0       | O2C-HSR-TC-011 | Automated |
| FS-HSR-012   | Loading state "Generating..." on button          | P1       | O2C-HSR-TC-012 | Automated |
| FS-HSR-013   | Success toast after report load                  | P1       | O2C-HSR-TC-013 | Automated |
| FS-HSR-014   | Summary cards numeric and Grand Total visible    | P1       | O2C-HSR-TC-014 | Automated |
| FS-HSR-015   | Report with filters returns scoped data         | P1       | O2C-HSR-TC-015 | Automated |

### 4. Hierarchy and Collapsible (P1)

| Scenario ID   | Description                                      | Priority | Test ID        | Status   |
|--------------|--------------------------------------------------|----------|----------------|----------|
| FS-HSR-016   | Expand All expands all sections                 | P1       | O2C-HSR-TC-016 | Automated |
| FS-HSR-017   | Collapse All collapses hierarchy                | P1       | O2C-HSR-TC-017 | Automated |
| FS-HSR-018   | State row shows name, code, counts, values     | P1       | O2C-HSR-TC-018 | Automated |
| FS-HSR-019   | Dealer row shows code, name, GSTIN, values     | P1       | O2C-HSR-TC-019 | Automated |
| FS-HSR-020   | Invoice table has expected columns              | P1       | O2C-HSR-TC-020 | Automated |
| FS-HSR-021   | Invoice with returns expands to RO table        | P1       | O2C-HSR-TC-021 | Automated |

### 5. Export (P1)

| Scenario ID   | Description                                      | Priority | Test ID        | Status   |
|--------------|--------------------------------------------------|----------|----------------|----------|
| FS-HSR-022   | Export Excel disabled when no report data       | P1       | O2C-HSR-TC-022 | Automated |
| FS-HSR-023   | Export Excel with data triggers download/toast  | P1       | O2C-HSR-TC-023 | Automated |
| FS-HSR-024   | Export button "Exporting..." and disabled       | P1       | O2C-HSR-TC-024 | Automated |

### 6. Empty and No-Data States (P1–P2)

| Scenario ID   | Description                                      | Priority | Test ID        | Status   |
|--------------|--------------------------------------------------|----------|----------------|----------|
| FS-HSR-025   | Initial load shows No Report Generated           | P1       | O2C-HSR-TC-025 | Automated |
| FS-HSR-026   | Generate with no invoices shows No Sales Data   | P1       | O2C-HSR-TC-026 | Automated |

### 7. Optional DB Consistency (P2)

| Scenario ID   | Description                                      | Priority | Test ID        | Status   |
|--------------|--------------------------------------------------|----------|----------------|----------|
| FS-HSR-027   | Grand Total invoice count matches sum           | P2       | O2C-HSR-TC-027 | Automated |
| FS-HSR-028   | Net = Gross − Returns at Grand Total            | P2       | O2C-HSR-TC-028 | Automated |

---

## Corner Cases

- Empty state timing: Same caution as GSTR1 TC-002; only assert when stable.
- Return order drill-down (TC-021): Data-dependent; pass when test data has no returns (no row to expand).

---

## Related Documents

- [knowledge.md](../knowledge.md)
- [test-cases.md](../test-cases.md)
- [gap-analysis.md](../gap-analysis.md)
