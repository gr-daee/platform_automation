# IMPL-044 — Warehouse Inventory (WH-INV) Phase 2 E2E

| Field | Value |
|-------|--------|
| Date | 2026-03-22 |
| Module | O2C — Warehouse Inventory |
| Status | Implemented |

## Summary

Phase 2 extends WH-INV automation with **status** and **warehouse** filters (Radix comboboxes scoped to the **Inventory Items** tabpanel), **server search** summary (`Search: "…"`), **short-search** summary line, **pagination** (next page; skips when `Page 1 of 1`), **page size** (25 per page + footer range check), and **combined** Kurnook + In Stock filters. Warehouse **Kurnook** uses `test.skip` when no matching option exists.

## Updated artifacts

- Feature: `e2e/features/o2c/inventory/warehouse-inventory.feature` (TC-009–015)
- POM: `e2e/src/pages/o2c/WarehouseInventoryPage.ts` — `inventoryTabPanel()`, filter helpers, pagination
- Steps: `e2e/src/steps/o2c/warehouse-inventory-steps.ts`

## Test IDs

`WH-INV-TC-009`–`WH-INV-TC-015`.

## Documentation

- `docs/modules/o2c/inventory/FEATURE-WH-INV-phased-plan.md`
- `docs/modules/o2c/test-cases.md`, `docs/test-cases/TEST_CASE_REGISTRY.md`, `docs/test-cases/test-impact-matrix.md`

## Run

```bash
npm run bdd:generate && npm run test:dev -- --project=iacs-md --grep "@WH-INV-TC-"
```

## Results (local 2026-03-22)

- **15 passed** (`WH-INV-TC-001`–`015`, `@iacs-md`).

## Deferred

- **Zone** filter: dropdown often empty when inventory rows lack zone metadata — not asserted in Phase 2.
- **300-result** search banner: only when `hasMoreResults` from `inventoryOperations` — environment-dependent.
- **Export / Import** E2E: explicitly **not** in scope for the next WH-INV tranche (see phased plan).
