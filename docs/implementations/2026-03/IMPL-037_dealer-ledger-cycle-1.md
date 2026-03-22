# IMPL-037 - Dealer Ledger Cycle-1 (dedicated finance E2E)

**Metadata**
- **ID**: IMPL-037
- **Date**: 2026-03-22
- **Module**: Finance / Dealer Ledger
- **Type**: New E2E coverage
- **Status**: Complete
- **Stable test dealer**: Business name `Ramesh ningappa diggai`, code `IACS5509`

---

## What Was Implemented

### Overview
- First **dedicated** Dealer Ledger feature: `e2e/features/finance/dealer-ledger/dealer-ledger.feature`.
- **FIN-DL-TC-001**: Search/select by **business name** → load → assert Dealer Information card (scoped via `[data-slot="card"]`), summary metrics, transaction table, ≥1 row.
- **FIN-DL-TC-002**: Search/select by **dealer code** → load → assert dealer info + ≥1 **Invoice** row (`hasInvoiceTransaction()`).
- **FIN-DL-TC-003**: **Load Ledger** disabled when no dealer selected.

### Technical
- **POM** (`e2e/src/pages/finance/DealerLedgerPage.ts`): `loadDealerLedgerAndWaitForData`, `expectDealerInformation`, `expectSummaryCardsVisible`, `expectTransactionHistoryTableVisible`, `expectAtLeastOneTransactionDataRow`, `expectLoadLedgerButtonDisabled`.
- **Steps** (`e2e/src/steps/finance/dealer-ledger-steps.ts`).
- **Fix**: Dealer name assertion scoped to Information **card** only (avoids strict-mode conflict with combobox trigger text).

---

## New Tests

| Test ID | Status |
|---------|--------|
| FIN-DL-TC-001 | ✅ Pass |
| FIN-DL-TC-002 | ✅ Pass |
| FIN-DL-TC-003 | ✅ Pass |

```bash
npm run bdd:generate && npm run test:dev -- --grep "@FIN-DL-TC-"
```

---

## Documentation
- [x] `docs/modules/finance/dealer-ledger/knowledge.md`
- [x] `docs/modules/finance/dealer-ledger/test-cases.md`
- [x] `docs/modules/finance/dealer-ledger/gap-analysis.md`
- [x] `docs/modules/finance/dealer-ledger/implementation-history.md`
- [x] `docs/test-cases/TEST_CASE_REGISTRY.md`
- [x] `docs/test-cases/test-impact-matrix.md`

---

## Existing / Shared
- **O2C E2E** continues to use `DealerLedgerPage` + `o2c-e2e-steps.ts` (unchanged behaviour).
