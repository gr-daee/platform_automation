# IMPL-053 — Sales Returns Consolidation (Phases 1-7)

**Metadata**
- **ID**: IMPL-053
- **Date**: 2026-03-23
- **Module**: O2C — Sales Returns
- **Type**: Consolidation (features + implementation docs)
- **Status**: Complete

---

## Goal

Consolidate Sales Returns automation artifacts into:
- **One feature file**: `e2e/features/o2c/sales-returns/sales-returns.feature`
- **One implementation document**: this IMPL (`IMPL-053`)

---

## What changed

1. **Feature consolidation**
   - Merged scenarios from:
     - `sales-returns-list.feature`
     - `sales-returns-create.feature`
     - `sales-returns-detail.feature`
     - `sales-returns-validation.feature`
     - `sales-returns-report.feature`
   - Into:
     - `sales-returns.feature`
   - Preserved all scenario IDs/tags (`SR-PH1` through `SR-PH7`) and behavior.

2. **Implementation docs consolidation**
   - Consolidated Sales Returns phase-specific implementation references into this single IMPL:
     - `IMPL-046`, `IMPL-047`, `IMPL-048`, `IMPL-050`, `IMPL-051 (sales-returns)`, `IMPL-052 (sales-returns)`

3. **Documentation alignment**
   - Updated module and global docs to reference:
     - unified feature file path
     - unified implementation doc (`IMPL-053`)
   - Updated registry/matrix references to remove split feature paths.

---

## Scope retained (unchanged behavior)

- **Phase 1-2**: list shell, filters, search, pagination
- **Phase 3**: create wizard happy path
- **Phase 4**: detail + goods receipt (+ inventory sandwich)
- **Phase 5**: credit memo flow + retry e-credit shell
- **Phase 6**: validation + cancel guardrails
- **Phase 7**: report access and ED permission check

---

## Verification

```bash
npm run bdd:generate
npm run test:dev -- --project=iacs-md --grep "@sales-returns"
npm run test:dev -- --project=iacs-ed --grep "@SR-PH7-TC-002"
```

