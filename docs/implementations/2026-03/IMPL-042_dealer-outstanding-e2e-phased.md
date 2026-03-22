# IMPL-042 — Dealer Outstanding report E2E (phased)

| Field | Value |
|-------|--------|
| Date | 2026-03-22 |
| Module | Finance — Reports |
| Status | Implemented |

## Summary

Phased Playwright-BDD coverage for **Dealer Outstanding** at `/finance/reports/dealer-outstanding`: shell, filters, CSV/PDF exports, drill-down, read-only DB reconciliation (gross + invoice balance), UI net formula, RBAC (`@iacs-ed`).

## New artifacts

- Feature: `e2e/features/finance/dealer-outstanding/dealer-outstanding.feature`
- POM: `e2e/src/pages/finance/DealerOutstandingReportPage.ts`
- Steps: `e2e/src/steps/finance/dealer-outstanding-steps.ts`
- DB helpers: `getDealerIdByDealerCode`, `sumDealerOutstandingGrossFromInvoices`, `getInvoiceBalanceByInvoiceNumber` in `e2e/src/support/finance-db-helpers.ts`

## Config

- `playwright.config.ts`: `iacs-ed` **testMatch** includes `finance/dealer-outstanding` for FIN-DO-TC-040.

## Documentation

- `docs/modules/finance/dealer-outstanding/FEATURE-DEALER-OUTSTANDING-phased-plan.md`
- `docs/modules/finance/dealer-outstanding/test-cases.md`
- `docs/test-cases/TEST_CASE_REGISTRY.md`, `docs/test-cases/test-impact-matrix.md`

## Test IDs

`FIN-DO-TC-001`–`004`, `005`–`008`, `010`–`011`, `020`–`021`, `030`–`031`, `040`.

## Run

```bash
npm run bdd:generate && npm run test:dev -- --grep "@FIN-DO-TC-"
```

## Results (local 2026-03-22)

- **14 passed** (`@iacs-md`), **1 skipped** (`FIN-DO-TC-040` `@iacs-ed` — tenant grants `invoices` read to ED user).
- **FIN-DO-TC-030** compares **magnitudes** `|net|` vs `|gross − unalloc − ccn − unapplied|` (≤₹10) because grid net sign can disagree with signed recomputation from formatted cells.
