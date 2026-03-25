# Plant Production - Test Cases

## Overview

Test inventory for the Plant Production module, organized by phase.
- **Phase 1**: Master Data (Plants, Licenses, Assets) — DAEE-161, 162, 163
- **Phase 2**: BOM (Header + Lines) — DAEE-164, 165
- **Phase 3**: Work Order Lifecycle — DAEE-166, 167, 168, 169
- **Phase 4**: Production Execution — DAEE-170, 171, 172 + extras

Run commands:
```bash
npm run test:dev -- --grep "@PLANT-P1"   # Phase 1 only
npm run test:dev -- --grep "@PLANT-P2"   # Phase 2 only
npm run test:dev -- --grep "@PLANT-P3"   # Phase 3 only
npm run test:dev -- --grep "@PLANT-P4"   # Phase 4 only
npm run test:dev -- e2e/features/plant-production/  # All plant tests
```

---

## Phase 1 — Master Data

### Plants (DAEE-161)

Feature file: `e2e/features/plant-production/01-create-plant.feature`

| Test ID | Scenario | Tags | Status |
|---------|----------|------|--------|
| PLANT-PLT-TC-001 | Create plant with required fields | @smoke @p1 | ✅ Automated |
| PLANT-PLT-TC-002 | Plant code uniqueness validation | @regression @p1 | ✅ Automated |
| PLANT-PLT-TC-003 | Required field validation (inline errors) | @regression @p1 | ✅ Automated |
| PLANT-PLT-TC-004 | Inactive plant status reflected in list | @regression @p1 | ✅ Automated |
| PLANT-PLT-TC-005 | Capacity and operational fields saved | @regression @p2 | ✅ Automated |
| PLANT-PLT-TC-006 | Maintenance date validation | @regression @p1 | ✅ Automated |
| PLANT-PLT-TC-007 | Plant record persists after refresh | @regression @p2 | ✅ Automated |
| PLANT-PLT-TC-008 | Cancel closes form without saving | @regression @p2 | ✅ Automated |
| PLANT-PLT-TC-009 | Edit existing plant persists changes | @regression @p1 | ✅ Automated (Gap) |
| PLANT-PLT-TC-010 | Plant list search by name and code | @regression @p2 | ✅ Automated (Gap) |
| PLANT-PLT-TC-011 | Audit record created on plant creation | @regression @p2 | ⏳ Pending (UI audit trail TBD) |

### Licenses (DAEE-162)

Feature file: `e2e/features/plant-production/02-plant-licenses.feature`

| Test ID | Scenario | Tags | Status |
|---------|----------|------|--------|
| PLANT-LIC-TC-001 | Create license with required fields | @smoke @p1 | ✅ Automated |
| PLANT-LIC-TC-002 | License mandatory field validation | @regression @p1 | ✅ Automated |
| PLANT-LIC-TC-003 | Date validation (expiry before issue rejected) | @regression @p1 | ✅ Automated |
| PLANT-LIC-TC-004 | License number uniqueness per plant | @regression @p1 | ✅ Automated |
| PLANT-LIC-TC-005 | WO blocked when no valid license | @regression @p1 @known-defect | ✅ Automated (known-defect) |
| PLANT-LIC-TC-006 | Expired license visually identified | @regression @p2 | ✅ Automated |
| PLANT-LIC-TC-007 | License renewal — expiry date update | @regression @p2 | ✅ Automated |
| PLANT-LIC-TC-008 | Plant with valid license can be used in WO | @regression @p1 | ✅ Automated |
| PLANT-LIC-TC-009 | License deletion available in UI | @regression @p2 @known-defect | ✅ Automated (known-defect) |
| PLANT-LIC-TC-010 | License audit trail | @regression @p2 | ⏳ Pending |
| PLANT-LIC-TC-011 | Edit license — expiry date update | @regression @p2 | ✅ Automated (Gap) |

### Assets (DAEE-163)

Feature file: `e2e/features/plant-production/03-plant-assets.feature`

| Test ID | Scenario | Tags | Status |
|---------|----------|------|--------|
| PLANT-AST-TC-001 | Create asset with required fields | @smoke @p1 | ✅ Automated |
| PLANT-AST-TC-002 | Asset category restricted to predefined values | @regression @p1 | ✅ Automated |
| PLANT-AST-TC-003 | Maintenance asset blocked from WO | @regression @p1 | ✅ Automated |
| PLANT-AST-TC-004 | Plant without active assets blocked from WO | @regression @p1 | ✅ Automated |
| PLANT-AST-TC-005 | Active asset assigned to work order | @regression @p1 | ✅ Automated |
| PLANT-AST-TC-006 | Asset audit record | @regression @p2 | ⏳ Pending |
| PLANT-AST-TC-007 | Asset code uniqueness validation | @regression @p1 | ✅ Automated |
| PLANT-AST-TC-008 | Asset edit persists after refresh | @regression @p2 | ✅ Automated |
| PLANT-AST-TC-009 | Asset under_maintenance blocked from WO | @regression @p1 | ✅ Automated |
| PLANT-AST-TC-010 | Concurrent creation with same code | @regression @p3 | ⏳ Pending (race condition) |
| PLANT-AST-TC-011 | Edit asset name and status | @regression @p2 | ✅ Automated (Gap) |
| PLANT-AST-TC-012 | Delete asset removes from list | @regression @p2 | ✅ Automated (Gap) |

---

## Phase 2 — BOM (Planned)

Feature files: `04-bom-header.feature`, `05-bom-lines.feature`
Status: ⏳ Pending Phase 2 implementation

---

## Phase 3 — Work Order Lifecycle (Planned)

Feature files: `06-work-order-bom.feature`, `07-manual-material-requirements.feature`,
`08-approve-material-requirements.feature`, `09-start-production.feature`
Status: ⏳ Pending Phase 3 implementation

---

## Phase 4 — Production Execution (Planned)

Feature files: `10-issue-materials.feature` through `16-e2e-lifecycle.feature`
Status: ⏳ Pending Phase 4 implementation

---

## Coverage Summary

| Phase | Total | Automated | Known-Defect | Pending |
|-------|-------|-----------|--------------|---------|
| P1 Master Data | 34 | 29 | 2 | 3 |
| P2 BOM | 19 | 0 | 0 | 19 |
| P3 Work Order | 31 | 0 | 0 | 31 |
| P4 Production | 57 | 0 | 0 | 57 |
| **Total** | **141** | **29** | **2** | **110** |
