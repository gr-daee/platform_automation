# IMPL-054 - O2C Reports parity and city export automation

- **Date**: 2026-03-24
- **Module**: O2C Reports
- **Type**: New test automation + regression hardening
- **Status**: Complete

## What was implemented

Implemented new automated coverage for report regressions tracked in DAEE-342, DAEE-343, DAEE-344, and DAEE-346:

1. **Collection Report** (`/o2c/reports/collection-report`)
   - Added scenarios for quick-period correctness, KPI visibility, aggregation parity, and Excel section presence.
2. **Hierarchical Product Sales** (`/o2c/reports/hierarchical-product-sales`)
   - Added scenarios for dealer hierarchy visibility and city propagation in detailed Excel sheets.
3. **Hierarchical Sales** (`/o2c/reports/hierarchical-sales`)
   - Added regression scenario verifying City column presence in exported **By Dealer** sheet.

## New tests created

- `O2C-CR-TC-001` to `O2C-CR-TC-005`
- `O2C-HPS-TC-001` to `O2C-HPS-TC-004`
- `O2C-HSR-TC-029`

## Files added

- `e2e/features/o2c/reports/collection-report.feature`
- `e2e/src/pages/o2c/CollectionReportPage.ts`
- `e2e/src/steps/o2c/collection-report-steps.ts`
- `e2e/features/o2c/reports/hierarchical-product-sales.feature`
- `e2e/src/pages/o2c/HierarchicalProductSalesReportPage.ts`
- `e2e/src/steps/o2c/hierarchical-product-sales-report-steps.ts`

## Files updated

- `e2e/features/o2c/reports/hierarchical-sales.feature`
- `e2e/src/steps/o2c/hierarchical-sales-report-steps.ts`
- `docs/modules/o2c/knowledge.md`
- `docs/modules/o2c/test-cases.md`
- `docs/modules/o2c/reports/hierarchical-sales/test-cases.md`
- `docs/test-cases/TEST_CASE_REGISTRY.md`
- `docs/test-cases/test-impact-matrix.md`

## Verification

- `npm run bdd:generate` passed
- Focused scenario runs passed:
  - `@O2C-CR-TC-001`
  - `@O2C-HPS-TC-001`
  - `@O2C-HPS-TC-003`
  - `@O2C-HSR-TC-029`

## Notes

- Excel assertions use `ExcelJS` and robust header scanning across initial rows to handle merged-title/header layouts.
- Parity assertions use small numeric tolerance to handle formatting/rounding in UI breakdown sections.
