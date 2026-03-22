# IMPL-038 - Dealer Ledger Cycle-2 (date range, CSV, type filter, invoice deep link)

**Metadata**
- **ID**: IMPL-038
- **Date**: 2026-03-22
- **Module**: Finance / Dealer Ledger
- **Type**: Enhancement (E2E)
- **Status**: Complete
- **Builds on**: IMPL-037

---

## What Was Implemented

### New scenarios
| ID | Coverage |
|----|----------|
| FIN-DL-TC-004 | From/To date inputs (`#from-date`, `#to-date`) + load → ≥1 row |
| FIN-DL-TC-005 | **Export CSV** → Sonner toast `Exported N transactions to CSV` |
| FIN-DL-TC-006 | Transaction type **Invoices** filter → every `tbody` row type cell = **Invoice** |
| FIN-DL-TC-007 | First invoice **document link** → `/o2c/invoices/{uuid}` |

### POM / framework fixes
- **Dealer combobox** locator: first `[data-slot="card"]`’s `combobox` (not `hasText: /select dealer/i`) so selection still works after trigger shows `IACS5509 - …` (avoids breaking re-entry in future steps).

### Artifacts
- `e2e/features/finance/dealer-ledger/dealer-ledger.feature`
- `e2e/src/steps/finance/dealer-ledger-steps.ts`
- `e2e/src/pages/finance/DealerLedgerPage.ts`

---

## Verification
```bash
npm run bdd:generate && npm run test:dev -- --grep "@FIN-DL-TC-"
```
✅ 7 passed (TC-001–007), 2026-03-22.

---

## Documentation
- [x] Module `knowledge.md`, `test-cases.md`, `gap-analysis.md`, `implementation-history.md`
- [x] `TEST_CASE_REGISTRY.md`, `test-impact-matrix.md`
