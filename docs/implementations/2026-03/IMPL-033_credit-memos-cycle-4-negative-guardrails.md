# IMPL-033 - Credit Memos Cycle-4 (Negative Guardrails)

## Metadata
- **ID**: IMPL-033
- **Date**: 2026-03-22
- **Module**: Finance - Credit Memos
- **Type**: Test expansion (negative / validation)
- **Status**: Complete

## What Was Implemented
- Automated **Cycle-4** guardrails for credit memo **apply** dialog and server-aligned behavior:
  - Amount above `credit_available` (toast / client validation)
  - Zero amount (submit disabled — UX guardrail; server also rejects non-positive amounts)
  - Cross-customer isolation (invoice dropdown must not list another dealer’s invoice)
  - Duplicate active application to the same invoice (server error surfaced as toast)
  - Non–transport-allowance CM cannot apply amount above invoice balance (client validation)

## New Tests Created
| Test ID | Scenario | Status |
|---------|----------|--------|
| FIN-CM-TC-013 | Apply credit rejects amount above available credit | ✅ |
| FIN-CM-TC-014 | Apply credit blocks zero amount via disabled submit | ✅ |
| FIN-CM-TC-015 | Apply dialog does not list invoices from other customers | ✅ |
| FIN-CM-TC-016 | Duplicate apply to same invoice is rejected | ✅ |
| FIN-CM-TC-017 | Non-transport credit memo apply rejects amount above invoice balance | ✅ |

## Technical Changes
- `e2e/features/finance/credit-memos/credit-memos.feature` — scenarios + `@negative` tags
- `e2e/src/steps/finance/credit-memo-steps.ts` — Cycle-4 steps; create flow now selects **Credit Reason** from `reason` parameter
- `e2e/src/pages/finance/NewCreditMemoPage.ts` — `selectCreditReason()`
- `e2e/src/pages/finance/CreditMemoDetailPage.ts` — negative-test apply helpers (`setApplyAmountForNegativeTest`, `clickApplyCreditWithoutClosingDialog`, etc.)
- `e2e/src/support/finance-db-helpers.ts` — `getInvoiceNumberForDifferentDealer()`

## Test Execution
```bash
npm run bdd:generate && npm run test:dev -- --grep "@FIN-CM-TC-013|@FIN-CM-TC-014|@FIN-CM-TC-015|@FIN-CM-TC-016|@FIN-CM-TC-017"
```
- **Result**: 5/5 passed (2026-03-22)

## Documentation Updates
- `docs/modules/finance/credit-memos/test-cases.md`
- `docs/modules/finance/credit-memos/gap-analysis.md`
- `docs/modules/finance/credit-memos/knowledge.md`
- `docs/modules/finance/credit-memos/implementation-history.md`
- `docs/test-cases/TEST_CASE_REGISTRY.md`
- `docs/test-cases/test-impact-matrix.md`
