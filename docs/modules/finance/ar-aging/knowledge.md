# Finance — AR Aging Report

## Route
- **Canonical:** `/finance/ar-aging`
- **Legacy:** `/finance/reports/ar-aging` → redirects to canonical

## RBAC
- `ProtectedPageWrapper` module **`finance_aging_reports`**, action **`read`**.
- **FIN-AR-TC-009** (`iacs-ed`): expects `/restrictedUser` when the user lacks that module; if your tenant grants ED access to AR aging, the scenario **skips** with an explicit reason (not a failure).

## UI (testing)
- **Heading:** `h2` **AR Aging Report**; subtitle includes aging basis (**Invoice Date Basis (Schedule III)** vs **Due Date Basis (ECL)**).
- **Toolbar:** **Filters** (toggle panel), **Export PDF**, **Export Excel** — disabled while loading or when `dealerSummaries.length === 0`.
- **Filters panel:** **Filter Options**; **Aging Window** combobox; **Aging Basis** `#aging_basis`; **Apply Filters**; second **Filters** click closes panel.
- **Tabs:** **Dealer Summary** | **Invoice Detail** | **Snapshots** (Radix `role="tab"`).
- **Search:** placeholder `Search by dealer name, code, or invoice number...`
- **Toasts:** `AR Aging Report exported to Excel successfully`, `AR Aging Report PDF exported successfully`.

## Stable automation patterns
- Wait for summary tab: **Dealer Code** (table) **or** **No outstanding receivables**.
- Search with a unique non-matching string → **No dealers found matching your search** (works even with zero dealers).
- Export scenarios: `test.skip` when export buttons stay disabled (no receivables in env).

## Related code
- `../web_app/src/app/finance/ar-aging/page.tsx`
- `../web_app/src/app/finance/actions/getARAgingReport.ts`
- `../web_app/src/app/finance/actions/downloadARAgingPdf.ts`

## Implementation
- See `FEATURE-AR-AGING-phased-plan.md`, `implementation-history.md`, `test-cases.md`.
