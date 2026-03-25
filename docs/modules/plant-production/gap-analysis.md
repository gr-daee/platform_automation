# Plant Production - Gap Analysis

## Overview
This document tracks known gaps, defects found during manual testing, and features not yet automatable. Updated as Phase 1–4 implementation progresses.

---

## Known Defects (Automate with @known-defect tag)

These tests are automated but expected to fail until the defect is fixed. They serve as regression guards.

| Defect ID | Test ID | Description | Found In | Status |
|-----------|---------|-------------|----------|--------|
| BUG-PLANT-001 | PLANT-LIC-TC-005 | Work order can be created for a plant without a valid license — production readiness rule not enforced in WO creation UI | Phase 1 manual testing | ❌ Open |
| BUG-PLANT-002 | PLANT-LIC-TC-009 | License deletion UI not available — delete button depends on `canDelete` permission that appears not granted to test user | Phase 1 manual testing | ❌ Open |
| BUG-PLANT-003 | PLANT-BOM-TC-013 | System allows only one BOM component/line — multiple raw materials not supported | Phase 2 manual testing | ❌ Open |
| BUG-PLANT-004 | PLANT-APPR-TC-002 | Material requirement rejection workflow not implemented — WO stays pending but rejection path is non-functional | Phase 3 manual testing | ❌ Open |
| BUG-PLANT-005 | PLANT-APPR-TC-007 | Approval audit trail records only timestamp, not approver identity | Phase 3 manual testing | ❌ Open |
| BUG-PLANT-006 | PLANT-QC-TC-007 | QC audit trail shows only latest update, not full status history | Phase 4 manual testing | ❌ Open |
| BUG-PLANT-007 | PLANT-PAUS-TC-002 | Pause reason not prompted — system pauses without requiring a reason | Phase 4 manual testing | ❌ Open |
| BUG-PLANT-008 | PLANT-SCRAP-TC-001 | Database column error when creating scrap entry (DB schema issue) | Phase 4 manual testing | ❌ Open |

---

## UI/Feature Gaps (Not automatable — feature missing from application)

These represent scenarios identified in acceptance criteria but not yet implemented in the UI. Document here and skip automation until feature is built.

| Gap ID | Story | Description | Impact | Priority |
|--------|-------|-------------|--------|----------|
| GAP-PLANT-001 | DAEE-113 | Production Anomalies — no manual creation option in UI; anomalies appear system-generated only | Cannot test anomaly lifecycle end-to-end | P2 |
| GAP-PLANT-002 | DAEE-113 | QC Specification Master screen not available in UI — parameter-based auto-evaluation not present | QC testing is manual status-only, no spec-driven evaluation | P2 |
| GAP-PLANT-003 | DAEE-113 | Approval Matrix configuration module not available in UI — cannot configure approvers/thresholds | Approval routing not fully testable | P2 |
| GAP-PLANT-004 | DAEE-165 | BOM Substitute Materials — substitute configuration not available in BOM component editor | Cannot test substitute material issuance flow | P3 |
| GAP-PLANT-005 | DAEE-113 | Packaging module — test cases cannot be executed as packaging job execution not in UI | Package batch creation not testable | P3 |
| GAP-PLANT-006 | DAEE-113 | Scrap entry form has database column error — entire scrap workflow blocked | Cannot test scrap recording, approval, or accounting entry | P1 (critical bug) |

---

## Missing Test Cases from Manual Testing (Added to automation)

These were not in the original Excel but are required by the acceptance criteria:

| Phase | Test ID | Description | Gap Source |
|-------|---------|-------------|------------|
| P1 | PLANT-PLT-TC-009 | Edit existing plant persists changes | AC: update plant |
| P1 | PLANT-PLT-TC-010 | Plant list search by name and code | AC: search/filter |
| P1 | PLANT-LIC-TC-011 | Edit license — expiry update saves | AC: update license |
| P1 | PLANT-AST-TC-011 | Edit asset name and status | AC: update asset |
| P1 | PLANT-AST-TC-012 | Delete asset removes from list | AC: delete asset |
| P2 | PLANT-BOM-TC-008 | BOM number immutable after creation | AC: auto-generated, immutable |
| P2 | PLANT-BOM-TC-016 | Wastage % applied to MRN quantity formula | Key AC formula |
| P2 | PLANT-BOM-TC-019 | BOM without lines cannot be used on WO | AC: must have ≥1 line |
| P3 | PLANT-WO-TC-006 | Planned end date ≥ start date enforced | AC: date validation |
| P3 | PLANT-WO-TC-007 | WO number auto-generated in WO-000001 format | AC: format |
| P3 | PLANT-WO-TC-009 | Plant requires ≥1 license AND ≥1 asset for selection | AC: production readiness |
| P3 | PLANT-MRN-TC-008 | Duplicate material policy enforced | AC: duplicate policy |
| P3 | PLANT-APPR-TC-008 | Approval matrix — BOM needs Prod Manager + QC Head | AC: approval matrix |
| P4 | PLANT-ISS-TC-009 | FEFO — earliest expiry batch selected first | AC: FEFO ordering |
| P4 | PLANT-FG-TC-008 | Batch number auto-generated WO{WO#}-{SEQ} | AC: format |
| P4 | PLANT-FG-TC-009 | Out-of-yield-range requires reason | AC: yield validation |
| P4 | PLANT-QC-TC-008 | Rework path creates new linked WO | AC: rework path |
| P4 | PLANT-QC-TC-009 | Hold released by QC Manager only | AC: hold lifecycle |

---

## Coverage Metrics

| Phase | Total TCs | Automatable | Known Defect | Gap/Skip | Coverage % |
|-------|-----------|-------------|--------------|----------|------------|
| P1 Master Data | 34 | 31 | 2 | 1 | 91% |
| P2 BOM | 19 | 17 | 1 | 1 | 89% |
| P3 Work Order | 31 | 27 | 2 | 2 | 87% |
| P4 Production | 57 | 48 | 2 | 7 | 84% |
| **Total** | **141** | **123** | **7** | **11** | **87%** |

---

## Resolution Tracking

When a defect is fixed or a gap feature is built:
1. Remove `@known-defect` tag from the test
2. Update this document: change status to ✅ Resolved, add resolution date and IMPL reference
3. Re-run the test to confirm it passes
4. Update `implementation-history.md` with the change
