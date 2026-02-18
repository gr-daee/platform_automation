# O2C Hierarchical Sales Report - Gap Analysis

**Last Updated**: 2026-02-18  
**Sub-module**: O2C Reports / Hierarchical Sales  
**Route**: `/o2c/reports/hierarchical-sales`

---

## Summary

Tracks test coverage gaps for the Hierarchical Sales Report. TC-001 and TC-002 (access/page load) are documented but not implemented in this phase. TC-003 through TC-028 are implemented or planned.

---

## Coverage Metrics

| Category            | Total | Automated | Pending (Doc Only) | Coverage % |
|---------------------|-------|-----------|--------------------|------------|
| Access (4.1)        | 2     | 0         | 2                  | 0%         |
| Filters (4.2)       | 8     | 8         | 0                  | 100%       |
| Report Gen (4.3)    | 5     | 5         | 0                  | 100%       |
| Hierarchy (4.4)     | 6     | 6         | 0                  | 100%       |
| Export (4.5)        | 3     | 3         | 0                  | 100%       |
| Empty/No-Data (4.6) | 2     | 2         | 0                  | 100%       |
| Optional DB (4.7)   | 2     | 2         | 0                  | 100%       |
| **Total**           | **28**| **26**    | **2**              | **93%**    |

---

## Open Gaps

### GAP-O2C-HSR-P0-001: Access tests not implemented
- **Description**: TC-001 (user with sales_reports.read can open page) and TC-002 (user without permission denied) are documented only.
- **Impact**: Medium – access/RBAC not automated for this report.
- **Resolution**: Implement when ready; requires user profile without sales_reports.read for TC-002.
- **Status**: ⏳ Documented, To Do

### GAP-O2C-HSR-P2-001: Permission model discrepancy
- **Description**: UI uses `sales_reports.read`, backend action uses `invoices.read`. Documented in knowledge.md.
- **Impact**: Low – test design should verify both (page access vs API success).
- **Status**: 📋 Documented

---

## Resolved Gaps

*None yet. Link IMPL document here when implementation is recorded.*
