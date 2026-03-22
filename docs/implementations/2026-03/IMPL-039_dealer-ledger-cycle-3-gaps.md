# IMPL-039 - Dealer Ledger Cycle-3 (PDF, search/sort, deep links, AR/VAN optional, RBAC)

**Metadata**
- **ID**: IMPL-039
- **Date**: 2026-03-22
- **Module**: Finance / Dealer Ledger
- **Type**: Enhancement (E2E)
- **Status**: Complete
- **Builds on**: IMPL-038

---

## What Was Implemented

### New scenarios
| ID | Coverage |
|----|----------|
| FIN-DL-TC-008 | **RBAC**: `iacs-ed` user hits `/finance/dealer-ledger` → `/restrictedUser` |
| FIN-DL-TC-009 | Standard PDF (**Dealer Ledger** button) → Sonner success toast |
| FIN-DL-TC-010 | Detailed PDF (**Invoice Ledger** button) → Sonner success toast |
| FIN-DL-TC-011 | Filter **Invoices**, search by first row doc # → exactly **1** table row |
| FIN-DL-TC-012 | Click **Date** column header → table still has ≥1 row |
| FIN-DL-TC-013 | Filter **Payments** → first doc link → `/o2c/payments/{uuid}` |
| FIN-DL-TC-014 | Filter **Credit Notes** → first doc link → `/finance/credit-memos/{uuid}` |
| FIN-DL-TC-015 | **AR Aging Analysis** optional (visible only when aging data returned) |
| FIN-DL-TC-016 | **Unallocated Payments (VAN)** optional (visible only when data exists) |

### Framework
- Playwright project **`iacs-ed`**: `testMatch` `finance/dealer-ledger/*.spec.js`, `grep: /@iacs-ed/`
- `global.setup.ts`: authenticate **`iacs-ed`** on full runs or when project selected

### Artifacts
- `e2e/features/finance/dealer-ledger/dealer-ledger.feature`
- `e2e/src/steps/finance/dealer-ledger-steps.ts`
- `e2e/src/pages/finance/DealerLedgerPage.ts`
- `playwright.config.ts`, `e2e/src/support/global.setup.ts`

---

## Data / flakiness notes
- **TC-013 / TC-014** require at least one payment / credit-memo row for **IACS5509** in the target environment.
- **TC-011** uses **Invoices** filter before search so the query does not match unrelated rows via debit/credit `includes` filtering.

---

## Verification
```bash
npm run bdd:generate && npm run test:dev -- --grep "@FIN-DL-TC-"
```
Run locally against an environment with `TEST_BASE_URL`, auth for **iacs-md** + **iacs-ed**, and stable IACS5509 ledger data.

---

## Documentation
- [x] Module `knowledge.md`, `test-cases.md`, `gap-analysis.md`, `implementation-history.md`
- [x] `TEST_CASE_REGISTRY.md`, `test-impact-matrix.md`
