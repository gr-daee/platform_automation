# Finance - Dealer Ledger

## Overview
The **Dealer Ledger** page (`/finance/dealer-ledger`) shows a dealer’s financial history with running balance, optional VAN unallocated summary and AR aging, exports (PDF/CSV), and a filterable/sortable transaction table.

**Prod reference:** [DAEE Dealer Ledger](https://www.daee.in/finance/dealer-ledger)

## RBAC
- `ProtectedPageWrapper` module `dealer_ledger`, action **`read`** (`page.tsx`).

## Stable E2E dealer (IACS)
| Field | Value |
|--------|--------|
| Business name | `Ramesh ningappa diggai` |
| Dealer code | `IACS5509` |

Used across **FIN-DL-TC-001**–**016**; requires **≥1 transaction** and **≥1 invoice** row for most scenarios. **FIN-DL-TC-013** / **014** need **≥1** payment / credit-memo row for IACS5509. **FIN-DL-TC-008** (`iacs-ed`): expects `/restrictedUser` when RBAC denies `dealer_ledger` read; if ED still has access in tenant, the step **skips** (same pattern as **FIN-AR-TC-009**).

## UI patterns (testing)
- **Dealer picker**: Popover + `Command` in the **first** summary card — `locator('[data-slot="card"]').first().getByRole('combobox')`; placeholder search **Search by name or code...**; `CommandItem` / `role="option"`. After select, trigger shows `CODE - Business` (do not rely only on `/select dealer/i`).
- **Date range**: `#from-date`, `#to-date` (`type="date"`), optional; passed to `getDealerLedger`.
- **Load**: **Load Ledger** disabled until a dealer is selected; success toast **Ledger loaded successfully**.
- **Exports** (after load): **Dealer Ledger** / **Invoice Ledger** (PDF), **Export CSV** — CSV toast: `Exported {n} transactions to CSV`; PDF Sonner: `Standard dealer ledger PDF exported successfully`, `Detailed invoice ledger PDF exported successfully`.
- **Transaction History**: type `Select` inside the Transaction History card (`Invoices`, `Payments`, `Credit Notes`, …); **Search by doc** placeholder; **Date** column header toggles sort.
- **Document links**: invoice → `/o2c/invoices/{id}`; payment → `/o2c/payments/{id}`; credit note → `/finance/credit-memos/{id}`.
- **AR aging / VAN**: cards render only when backend returns aging / unallocated data (optional assertions in **FIN-DL-TC-015**–**016**).
- **Dealer Information card**: assert name/code inside `[data-slot="card"]` that contains **Dealer Information** (avoids strict-mode clash with combobox trigger).
- **Transaction table**: Only when `ledgerData.transactions.length > 0`; else **No Transactions Found** (no `<table>`).

## Related automation
- **Dedicated**: `e2e/features/finance/dealer-ledger/dealer-ledger.feature` (**FIN-DL-TC-***).
- **O2C E2E tail**: `o2c-e2e-indent-so-invoice.feature` — `DealerLedgerPage` + steps in `o2c-e2e-steps.ts`.

## Implementation history
See `implementation-history.md` (**IMPL-037**–**039**).
