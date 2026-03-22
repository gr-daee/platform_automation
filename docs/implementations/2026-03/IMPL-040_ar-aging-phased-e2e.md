# IMPL-040 — AR Aging phased E2E (`/finance/ar-aging`)

**Metadata**
- **ID**: IMPL-040
- **Date**: 2026-03-22
- **Module**: Finance / AR Aging Report
- **Type**: New E2E (phased design → develop → verify)
- **Status**: Complete

---

## Phases

| Phase | Tests | Scope |
|-------|-------|--------|
| 1 | FIN-AR-TC-001–004 | Load, dealer summary/empty, tabs, filters toggle |
| 2 | FIN-AR-TC-005–008 | Due-date basis + **Not Due** column, search no-match, Excel/PDF export (skip if no data) |
| 3 | FIN-AR-TC-009–012 | RBAC `@iacs-ed`, legacy redirect, snapshots tab, generate dialog cancel |

---

## Artifacts

- `docs/modules/finance/ar-aging/FEATURE-AR-AGING-phased-plan.md`
- `docs/modules/finance/ar-aging/knowledge.md`, `test-cases.md`, `gap-analysis.md`, `implementation-history.md`
- `e2e/features/finance/ar-aging/ar-aging.feature`
- `e2e/src/pages/finance/ARAgingPage.ts`
- `e2e/src/steps/finance/ar-aging-steps.ts`
- `playwright.config.ts` — `iacs-ed` `testMatch` includes `finance/ar-aging`
- `e2e/src/support/global.setup.ts` — `FIN-AR-TC-009` triggers `iacs-ed` auth when grepped

---

## Verification

```bash
npm run bdd:generate && npm run test:dev -- --grep "@FIN-AR-TC-"
```

---

## Documentation checklist

- [x] `TEST_CASE_REGISTRY.md`, `test-impact-matrix.md`
