# AR Aging Report — Phased E2E plan (`/finance/ar-aging`)

**Source:** `web_app/src/app/finance/ar-aging/page.tsx` (DAE-259)  
**RBAC:** `finance_aging_reports` + `read`  
**Primary user:** `@iacs-md` (staging/local must grant AR aging read)  
**Unauthorized:** `@iacs-ed` (P2P-only profile — expect `/restrictedUser`)

## Phase 1 — Shell & navigation (FIN-AR-TC-001–004)

| ID | Intent |
|----|--------|
| FIN-AR-TC-001 | Page loads; heading **AR Aging Report**; report area settles |
| FIN-AR-TC-002 | Dealer Summary tab shows **Dealer Code** table **or** **No outstanding receivables** |
| FIN-AR-TC-003 | Tabs: **Invoice Detail** → **Snapshots** → **Dealer Summary** content visible |
| FIN-AR-TC-004 | **Filters** toggle opens **Filter Options** / closes panel |

## Phase 2 — Filters, search, exports (FIN-AR-TC-005–008)

| ID | Intent |
|----|--------|
| FIN-AR-TC-005 | **Aging basis** → Due Date (ECL), **Apply** → dealer table **Not Due** column (skip if no AR rows) |
| FIN-AR-TC-006 | Search nonsense string → **No dealers found matching your search** |
| FIN-AR-TC-007 | **Export Excel** → success toast (skip if button disabled — no AR data) |
| FIN-AR-TC-008 | **Export PDF** → success toast (skip if disabled) |

## Phase 3 — RBAC, redirect, snapshots UX (FIN-AR-TC-009–012)

| ID | Intent |
|----|--------|
| FIN-AR-TC-009 | `@iacs-ed` direct `/finance/ar-aging` → restricted |
| FIN-AR-TC-010 | `/finance/reports/ar-aging` → canonical `/finance/ar-aging` |
| FIN-AR-TC-011 | **Snapshots** tab shows **AR Aging Snapshots** / empty state |
| FIN-AR-TC-012 | **Generate Snapshot** opens dialog; **Cancel** closes |

## Out of scope (later)

- Snapshot generate/delete (writes DB + `confirm()`)
- Region/territory matrix
- Payment breakdown / credit memo cards (data-dependent soft asserts)

## Cycle

1. Design (this doc + `knowledge.md`)  
2. Develop (POM + feature + steps)  
3. `npm run bdd:generate` + `npm run test:dev -- --grep "@FIN-AR-TC-"`  
4. Repeat per phase until all IDs above are implemented  
