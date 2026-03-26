# IMPL-035 - Credit Memos Cycle-6 (Reverse Dialog Guardrails + Post-Reversal UI)

**Metadata**
- **ID**: IMPL-035
- **Date**: 2026-03-21
- **Module**: Finance / Credit Memos
- **Type**: Enhancement (E2E coverage)
- **Status**: Complete
- **Related**: Builds on IMPL-034 (reversal + DB); UI: `web_app/src/app/finance/credit-memos/[id]/page.tsx`

---

## What Was Implemented

### Overview
- **FIN-CM-TC-020**: Reverse **AlertDialog** requires non-empty reason (`Confirm Reversal` disabled until `#reverse-reason` has text); **Cancel** closes dialog without reversing; DB still has **active** application for target invoice.
- **FIN-CM-TC-021**: After successful reversal, Application History row shows badge **Reversed** (exact) and **no** **Reverse** button for that row.

### Technical Changes (Automation)
- **POM**: `e2e/src/pages/finance/CreditMemoDetailPage.ts` — `reverseDialogRoot()` (`alertdialog` + title text), confirm enable/disable helpers, cancel dialog, row assertions for Reversed / no Reverse.
- **Steps**: `e2e/src/steps/finance/credit-memo-steps.ts` — Cycle 6 step block.
- **Feature**: `e2e/features/finance/credit-memos/credit-memos.feature` — scenarios TC-020, TC-021; header comment Cycles 1–6.

---

## New Tests Created

| Test ID | Scenario | Coverage | Status |
|---------|----------|----------|--------|
| FIN-CM-TC-020 | Reverse dialog reason required; cancel leaves DB active | Dialog UX + DB | ✅ Pass (2026-03-22) |
| FIN-CM-TC-021 | Post-reversal row shows Reversed, no Reverse action | Application History UI | ✅ Pass (2026-03-22) |

**Verify**
```bash
npm run bdd:generate && npm run test:dev -- --grep "@FIN-CM-TC-020|@FIN-CM-TC-021"
```

---

## Existing Tests Updated

| Artifact | Change |
|----------|--------|
| Module docs / registry / impact matrix | Traceability for TC-020, TC-021 |

**Total Updated Tests**: 0 (no change to TC-001–019 behavior)

---

## Corner Cases / Notes
- **AlertDialog role**: Radix `AlertDialog` exposes `role="alertdialog"` — `reverseDialogRoot()` matches title **Reverse Credit Memo Application**.
- If UI ever switches to plain `Dialog`, update `reverseDialogRoot()` to `getByRole('dialog', { name: ... })`.

---

## Documentation Updates
- [x] `docs/modules/finance/credit-memos/test-cases.md`
- [x] `docs/modules/finance/credit-memos/knowledge.md`
- [x] `docs/modules/finance/credit-memos/gap-analysis.md`
- [x] `docs/modules/finance/credit-memos/implementation-history.md`
- [x] `docs/test-cases/TEST_CASE_REGISTRY.md`
- [x] `docs/test-cases/test-impact-matrix.md`
