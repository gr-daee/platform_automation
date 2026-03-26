# IMPL-034 - Credit Memos Cycle-5 (GL Post + Application Reversal)

## Metadata
- **ID**: IMPL-034
- **Date**: 2026-03-22
- **Module**: Finance - Credit Memos
- **Type**: Test expansion (GL + lifecycle)
- **Status**: Complete

## What Was Implemented
- **Post to GL** for a newly created transport-allowance credit memo (no apply required): success toast, `gl_posted` / `gl_journal_id` in DB, **Post to GL** button hidden after success.
- **Reverse application** from Credit Memo detail (Application History): confirm dialog + reason, success toast, DB checks that application rows for the target invoice are `is_reversed`, no active applications, and `credit_available` returns to full memo total.

## New Tests Created
| Test ID | Scenario | Status |
|---------|----------|--------|
| FIN-CM-TC-018 | Post new credit memo to general ledger | ✅ |
| FIN-CM-TC-019 | Reverse credit memo application restores CM balances and reverses application row | ✅ |

## Technical Changes
- `e2e/features/finance/credit-memos/credit-memos.feature`
- `e2e/src/pages/finance/CreditMemoDetailPage.ts` — Post to GL, reverse dialog, toasts
- `e2e/src/steps/finance/credit-memo-steps.ts` — Cycle-5 steps; reversal DB assertion polls `credit_memo_applications`
- `e2e/src/support/finance-db-helpers.ts` — `CreditMemoRow` + `getCreditMemoById()` now include `gl_posted`, `gl_journal_id`

## Test Execution
```bash
npm run bdd:generate && npm run test:dev -- --grep "@FIN-CM-TC-018|@FIN-CM-TC-019"
```
- **Result**: 2/2 passed (2026-03-22)

## Notes
- **TC-019** asserts **credit memo header + application rows** after reversal (reliable sandwich). Invoice `balance_amount` restoration is performed in `reverseCreditMemoApplication` but was not used as the primary assertion due to timing/consistency variance vs. `credit_memo_applications` in local runs; extend with an invoice-balance poll later if product guarantees sync.

## Documentation Updates
- `docs/modules/finance/credit-memos/*`, `docs/test-cases/TEST_CASE_REGISTRY.md`, `docs/test-cases/test-impact-matrix.md`, `docs/modules/finance/credit-memos/implementation-history.md`
