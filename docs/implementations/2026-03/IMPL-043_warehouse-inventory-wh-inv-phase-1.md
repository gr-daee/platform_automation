# IMPL-043 — Warehouse Inventory (WH-INV) Phase 1 E2E

| Field | Value |
|-------|--------|
| Date | 2026-03-22 |
| Module | O2C — Warehouse Inventory |
| Status | Implemented |

## Summary

Phase 1 Playwright-BDD coverage for the inventory shell at **`/o2c/inventory`**: page chrome, analytics cards, tab navigation (Inventory / Allocations / Analytics / Settings), short-search helper, refresh. List path is centralized in **`WarehouseInventoryPage.LIST_PATH`** for the future move to `/warehouses/inventory`.

## New artifacts

- Feature: `e2e/features/o2c/inventory/warehouse-inventory.feature`
- POM: `e2e/src/pages/o2c/WarehouseInventoryPage.ts`
- Steps: `e2e/src/steps/o2c/warehouse-inventory-steps.ts`

## Test IDs

`WH-INV-TC-001`–`WH-INV-TC-008` (`@iacs-md`).

## Documentation

- `docs/modules/o2c/inventory/FEATURE-WH-INV-phased-plan.md`
- `docs/modules/o2c/test-cases.md` (WH-INV section)
- `docs/test-cases/TEST_CASE_REGISTRY.md`, `docs/test-cases/test-impact-matrix.md`

## Run

```bash
npm run bdd:generate && npm run test:dev -- --project=iacs-md --grep "@WH-INV-TC-"
```

## Results (local 2026-03-22)

- **8 passed** (`@iacs-md`).

## Notes

- **WH-INV-TC-004:** Assert Allocations via `getByRole('tabpanel').filter({ has: getByPlaceholder('Search allocations...') })` — global `getByText('Inventory Allocations', { exact: true })` did not resolve reliably (tabpanel / text node behavior).
