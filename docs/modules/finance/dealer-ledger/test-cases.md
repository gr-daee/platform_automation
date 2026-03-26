# Finance - Dealer Ledger - Test Cases

## Automated tests

| Test ID | Scenario | Feature file | Status |
|---------|----------|--------------|--------|
| FIN-DL-TC-001 | Load dealer ledger by business name shows summary and transactions | `e2e/features/finance/dealer-ledger/dealer-ledger.feature` | ✅ Automated |
| FIN-DL-TC-002 | Load dealer ledger by dealer code shows invoice transaction | `e2e/features/finance/dealer-ledger/dealer-ledger.feature` | ✅ Automated |
| FIN-DL-TC-003 | Load Ledger is disabled until a dealer is selected | `e2e/features/finance/dealer-ledger/dealer-ledger.feature` | ✅ Automated |
| FIN-DL-TC-004 | Load dealer ledger with explicit date range still returns transactions | `e2e/features/finance/dealer-ledger/dealer-ledger.feature` | ✅ Automated |
| FIN-DL-TC-005 | Export dealer ledger CSV shows success toast with row count | `e2e/features/finance/dealer-ledger/dealer-ledger.feature` | ✅ Automated |
| FIN-DL-TC-006 | Transaction type filter shows invoices only | `e2e/features/finance/dealer-ledger/dealer-ledger.feature` | ✅ Automated |
| FIN-DL-TC-007 | Invoice document link navigates to O2C invoice detail | `e2e/features/finance/dealer-ledger/dealer-ledger.feature` | ✅ Automated |
| FIN-DL-TC-008 | User without dealer ledger access is redirected from dealer ledger URL | `e2e/features/finance/dealer-ledger/dealer-ledger.feature` | ✅ (`@iacs-ed`) — asserts `/restrictedUser` when RBAC denies; **skipped** if `iacs-ed` still has `dealer_ledger` read |
| FIN-DL-TC-009 | Export standard dealer ledger PDF shows success toast | `e2e/features/finance/dealer-ledger/dealer-ledger.feature` | ✅ Automated |
| FIN-DL-TC-010 | Export detailed invoice ledger PDF shows success toast | `e2e/features/finance/dealer-ledger/dealer-ledger.feature` | ✅ Automated |
| FIN-DL-TC-011 | Search by document number narrows transaction rows | `e2e/features/finance/dealer-ledger/dealer-ledger.feature` | ✅ Automated |
| FIN-DL-TC-012 | Date column header toggles sort without breaking table | `e2e/features/finance/dealer-ledger/dealer-ledger.feature` | ✅ Automated |
| FIN-DL-TC-013 | Payment document link navigates to O2C payment detail | `e2e/features/finance/dealer-ledger/dealer-ledger.feature` | ✅ Automated (needs ≥1 payment row) |
| FIN-DL-TC-014 | Credit note document link navigates to credit memo detail | `e2e/features/finance/dealer-ledger/dealer-ledger.feature` | ✅ Automated (needs ≥1 credit note row) |
| FIN-DL-TC-015 | AR aging analysis appears when outstanding aging data exists | `e2e/features/finance/dealer-ledger/dealer-ledger.feature` | ✅ Automated (optional visibility) |
| FIN-DL-TC-016 | VAN section appears when unallocated payment data exists | `e2e/features/finance/dealer-ledger/dealer-ledger.feature` | ✅ Automated (optional visibility) |

### Related (not DL-ID)
- O2C E2E uses Dealer Ledger for a smoke check on invoice rows (`o2c-e2e-indent-so-invoice.feature`).

## Run
```bash
npm run bdd:generate && npm run test:dev -- --grep "@FIN-DL-TC-"
```
