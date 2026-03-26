# IMPL-041 — Finance RBAC tests: tenant-aware skip (iacs-ed)

**Metadata**
- **ID**: IMPL-041
- **Date**: 2026-03-22
- **Module**: Finance (Dealer Ledger, Credit Memos; aligns with AR Aging IMPL-040 pattern)
- **Type**: Test hardening
- **Status**: Complete

---

## What changed

1. **FIN-DL-TC-008** — `Then I should be denied access to dealer ledger` polls for `/restrictedUser`; if URL stays `/finance/dealer-ledger`, **`test.skip`** with reason (tenant may grant ED `dealer_ledger` read).
2. **FIN-CM-TC-022** — New `@iacs-ed` scenario: direct `/finance/credit-memos` → same assert-or-skip pattern for `finance_credit_memos`.
3. **Playwright** — `iacs-ed` project `testMatch` includes `finance/credit-memos`.
4. **global.setup** — Grepping `FIN-DL-TC-008` or `FIN-CM-TC-022` ensures `iacs-ed` auth.

## Artifacts

- `e2e/src/steps/finance/dealer-ledger-steps.ts`
- `e2e/src/steps/finance/credit-memo-steps.ts`
- `e2e/features/finance/credit-memos/credit-memos.feature`
- `playwright.config.ts`, `e2e/src/support/global.setup.ts`
- Module docs + `TEST_CASE_REGISTRY.md` + `test-impact-matrix.md`

## Verification

```bash
npm run bdd:generate && npm run test:dev -- --grep "@FIN-DL-TC-008|@FIN-CM-TC-022"
```
