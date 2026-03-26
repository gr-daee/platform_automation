# Finance - Credit Memos Test Cases

## Automated Tests
| Test ID | Scenario | Feature File | Status |
|---------|----------|--------------|--------|
| FIN-CM-TC-001 | Create credit memo with valid inputs | e2e/features/finance/credit-memos/credit-memos.feature | ✅ Automated |
| FIN-CM-TC-002 | Partially apply credit memo to oldest outstanding invoice | e2e/features/finance/credit-memos/credit-memos.feature | ✅ Automated |
| FIN-CM-TC-003 | Full settlement in one-shot apply using matching credit memo amount | e2e/features/finance/credit-memos/credit-memos.feature | ✅ Automated |
| FIN-CM-TC-004 | Partial apply then remaining apply fully settles invoice | e2e/features/finance/credit-memos/credit-memos.feature | ✅ Automated |
| FIN-CM-TC-005 | CM linked to one invoice applies to another invoice of same customer | e2e/features/finance/credit-memos/credit-memos.feature | ✅ Automated |
| FIN-CM-TC-006 | Credit memo header and application rows reconcile | e2e/features/finance/credit-memos/credit-memos.feature | ✅ Automated |
| FIN-CM-TC-007 | Invoice outstanding reduces by applied credit amount | e2e/features/finance/credit-memos/credit-memos.feature | ✅ Automated |
| FIN-CM-TC-008 | Full settlement keeps credit memo totals reconciled | e2e/features/finance/credit-memos/credit-memos.feature | ✅ Automated |
| FIN-CM-TC-011 | Transport allowance over-balance apply creates dealer advance | e2e/features/finance/credit-memos/credit-memos.feature | ✅ Automated |
| FIN-CM-TC-012 | Transport allowance over-balance path fully applies credit and creates dealer advance | e2e/features/finance/credit-memos/credit-memos.feature | ✅ Automated |
| FIN-CM-TC-013 | Apply credit rejects amount above available credit | e2e/features/finance/credit-memos/credit-memos.feature | ✅ Automated |
| FIN-CM-TC-014 | Apply credit blocks zero amount via disabled submit | e2e/features/finance/credit-memos/credit-memos.feature | ✅ Automated |
| FIN-CM-TC-015 | Apply dialog does not list invoices from other customers | e2e/features/finance/credit-memos/credit-memos.feature | ✅ Automated |
| FIN-CM-TC-016 | Duplicate apply to same invoice is rejected | e2e/features/finance/credit-memos/credit-memos.feature | ✅ Automated |
| FIN-CM-TC-017 | Non-transport credit memo apply rejects amount above invoice balance | e2e/features/finance/credit-memos/credit-memos.feature | ✅ Automated |
| FIN-CM-TC-018 | Post new credit memo to general ledger | e2e/features/finance/credit-memos/credit-memos.feature | ✅ Automated |
| FIN-CM-TC-019 | Reverse CM application restores CM balances and reverses application row | e2e/features/finance/credit-memos/credit-memos.feature | ✅ Automated |
| FIN-CM-TC-020 | Reverse dialog requires reason before confirm; cancel leaves application active in DB | e2e/features/finance/credit-memos/credit-memos.feature | ✅ Automated |
| FIN-CM-TC-021 | After reversal, application history shows Reversed and hides Reverse action | e2e/features/finance/credit-memos/credit-memos.feature | ✅ Automated |
| FIN-CM-TC-022 | User without credit memos access is redirected from credit memos URL | e2e/features/finance/credit-memos/credit-memos.feature | ✅ (`@iacs-ed`) — asserts `/restrictedUser` when RBAC denies; **skipped** if `iacs-ed` still has `finance_credit_memos` read |
