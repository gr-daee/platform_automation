# IMPL-031 - Cash Receipts Integrity + Negative Pack

## Metadata
- **Implementation ID**: IMPL-031
- **Date**: 2026-03-21
- **Module**: Finance - Cash Receipts
- **Type**: Test Enhancement (Edge/Negative/Data Integrity)
- **Status**: Completed

## What Was Implemented
- Added two manual cash receipt form negative/field validation scenarios.
- Added one VAN lifecycle integrity scenario that validates DB reconciliation after un-apply and re-apply.
- Added reusable step support for non-navigating save attempts and VAN DB reconciliation.

## New Tests Created
- `FIN-CR-TC-011`: New cash receipt validation - amount must be greater than zero.
- `FIN-CR-TC-012`: New cash receipt validation - bank account required for NEFT.
- `FIN-VAN-TC-012`: VAN lifecycle integrity - un-apply then re-apply keeps totals consistent.

## Existing Tests Updated
- None.

## Tests Deprecated
- None.

## Corner Cases Covered in This Pack
- Zero amount submission block in manual receipt create flow.
- Conditional mandatory bank-account validation path for NEFT.
- Multi-step VAN data integrity after reverse/forward lifecycle transitions.

## Technical Changes
- `e2e/src/pages/finance/NewCashReceiptPage.ts`
  - Added `clickSave()` for validation scenarios that must stay on form.
- `e2e/src/steps/finance/cash-receipt-steps.ts`
  - Added steps for attempt-save, partial-required-field fill (without bank), and form error assertion.
- `e2e/src/steps/finance/van-payment-steps.ts`
  - Added DB reconciliation step for last VAN-linked receipt header/application totals.
- `e2e/features/finance/cash-receipts/manual-cash-receipts.feature`
  - Added `FIN-CR-TC-011`, `FIN-CR-TC-012`.
- `e2e/features/finance/cash-receipts/van-cash-receipts.feature`
  - Added `FIN-VAN-TC-012`.

## Documentation Updates
- Updated `docs/modules/finance/cash-receipts/test-cases.md` (count 28 -> 31).
- Updated `docs/modules/finance/cash-receipts/gap-analysis.md` with two new covered gaps.
- Updated `docs/test-cases/TEST_CASE_REGISTRY.md` with new FIN entries.
- Updated `docs/test-cases/test-impact-matrix.md` with finance mappings.

## Test Results
- Execution performed for newly added scenarios (manual validation + VAN lifecycle integrity).
- Results captured in development mode run.

## Follow-up Recommendations
- Add boundary outline for slab day transitions (`0/1/15/16/30/31/90/91/116`).
- Add approach-specific assertions for `CCN_PER_PAYMENT` vs `SETTLEMENT_DISCOUNT` in one dedicated scenario outline.
