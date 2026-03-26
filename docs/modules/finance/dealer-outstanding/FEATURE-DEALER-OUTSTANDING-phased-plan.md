# Dealer Outstanding Report — Phased E2E plan (`/finance/reports/dealer-outstanding`)

**Source:** `web_app/src/app/finance/reports/dealer-outstanding/page.tsx` (DAE-281, DAEE-120)  
**Server actions:** `dealerOutstandingActions.ts` (`getDealerOutstandingReport`, drill-down, CSV/PDF)  
**RBAC:** `ProtectedPageWrapper` **invoices** + `read`  
**Primary user:** `@iacs-md`  
**Unauthorized:** `@iacs-ed` (expect `/restrictedUser` when invoices read is denied)

## Phase 1 — Shell & navigation (FIN-DO-TC-001–004)

| ID | Intent |
|----|--------|
| FIN-DO-TC-001 | Page loads; heading **Dealer Outstanding Report**; filters visible |
| FIN-DO-TC-002 | Initial **No data available** prompt before first load |
| FIN-DO-TC-003 | **Load Report** → success toast **Report loaded:** |
| FIN-DO-TC-004 | After load, summary card **Gross Outstanding** visible |

## Phase 2 — Filters & exports (FIN-DO-TC-005–008)

| ID | Intent |
|----|--------|
| FIN-DO-TC-005 | **Min Outstanding** huge value → zero rows; **CSV** disabled |
| FIN-DO-TC-006 | Open **Region** filter → **All Regions** option visible |
| FIN-DO-TC-007 | **CSV** export → success toast (skip if no rows) |
| FIN-DO-TC-008 | **PDF** export → success toast (skip if no rows) |

## Phase 3 — Drill-down (FIN-DO-TC-010–011)

| ID | Intent |
|----|--------|
| FIN-DO-TC-010 | **Invoice Details** dialog; columns **Invoice #**, **Balance** |
| FIN-DO-TC-011 | **Escape** closes dialog |

## Phase 4 — DB reconciliation (FIN-DO-TC-020–021)

| ID | Intent |
|----|--------|
| FIN-DO-TC-020 | First row **Gross Outstanding** vs `SUM(balance_amount)` (report rules) |
| FIN-DO-TC-021 | First drill-down **Balance** vs `invoices.balance_amount` |

## Phase 5 — Net formula & columns (FIN-DO-TC-030–031)

| ID | Intent |
|----|--------|
| FIN-DO-TC-030 | **|Net|** ≈ **|gross − credits|** from parsed row (≤₹10; handles sign vs grid columns) |
| FIN-DO-TC-031 | **Unapplied Credits** column header when grid rendered (skip if no rows) |

## Phase 6 — RBAC (FIN-DO-TC-040)

| ID | Intent |
|----|--------|
| FIN-DO-TC-040 | `@iacs-ed` direct URL → **restricted** (skip if tenant grants invoices read) |

## Run

```bash
npm run bdd:generate && npm run test:dev -- --grep "@FIN-DO-TC-"
```

## Data / env

- **TC-020–021**: `SUPABASE_DB_*`, `IACS_TENANT_ID` / `E2E_TENANT_ID` (or tenants lookup). May **skip** if no outstanding dealers.
- **TC-007–008, 010–011, 020–021**: skip when tenant has no qualifying rows.
