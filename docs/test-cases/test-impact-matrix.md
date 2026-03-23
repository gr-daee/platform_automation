# Test Impact Matrix

**Purpose**: Maps automated tests to source code files for change impact analysis

**Last Updated**: 2026-03-23 (Sales Returns SR-PH4–PH7)

---

## Overview

This matrix enables:
1. **Change Impact Analysis**: Identify which tests to run when code changes
2. **Test Maintenance**: Find affected tests when components are updated
3. **Coverage Tracking**: Understand which source files have test coverage

---

## How to Use

### For Change Impact Analysis
```bash
# 1. Identify changed files
git diff main..HEAD --name-only | grep "web_app/src/app"

# 2. Search this matrix for changed files
grep "OrderForm.tsx" test-impact-matrix.md

# 3. Run affected tests
npm run test:dev -- e2e/features/o2c/orders.feature
```

### For Test Maintenance
```bash
# Component was refactored, find tests to update
grep "IndentForm.tsx" test-impact-matrix.md
```

---

## Matrix Format

Each entry maps:
- **Source File**: Web app source file path
- **Affected Tests**: Test IDs that interact with this file
- **Interaction Type**: How test uses this file (POM, Direct, API)
- **Last Verified**: When mapping was last confirmed accurate

---

## Auth Module

### `../web_app/src/app/auth/login/page.tsx`
**Affected Tests**:
- `AUTH-LOGIN-TC-001`: Login with valid credentials
  - **Interaction**: POM (`e2e/src/pages/auth/LoginPage.ts`)
  - **Locators Used**: `getByLabel('Email')`, `getByLabel('Password')`, `getByRole('button', { name: 'Sign In' })`
  - **Last Verified**: 2026-02-04

- `AUTH-LOGIN-TC-002`: Login with invalid credentials
  - **Interaction**: POM (`e2e/src/pages/auth/LoginPage.ts`)
  - **Last Verified**: 2026-02-04

- `AUTH-MFA-TC-001`: TOTP authentication
  - **Interaction**: POM (`e2e/src/pages/auth/LoginPage.ts`)
  - **Last Verified**: 2026-02-04

**Change Risk**: 🔴 High - 3 tests affected

---

### `../web_app/src/app/auth/components/TOTPInput.tsx`
**Affected Tests**:
- `AUTH-MFA-TC-001`: TOTP authentication
  - **Interaction**: POM (`e2e/src/pages/auth/LoginPage.ts`)
  - **Locators Used**: `getByPlaceholder('Enter TOTP code')`
  - **Last Verified**: 2026-02-04

**Change Risk**: 🟡 Medium - 1 test affected

---

## O2C Module

### `../web_app/src/app/o2c/components/O2CIndentsManager.tsx`
**Affected Tests**:
- `O2C-INDENT-TC-012`: Dealer search and selection in modal
  - **Interaction**: POM (`e2e/src/pages/o2c/IndentsPage.ts`)
  - **Locators Used**: 
    - `getByRole('button', { name: /create indent/i })`
    - `getByRole('dialog')`
  - **Last Verified**: 2026-02-04

**Change Risk**: 🟡 Medium - 1 test affected

---

### `../web_app/src/app/o2c/components/DealerSelectionDialog.tsx`
**Affected Tests**:
- `O2C-INDENT-TC-012`: Dealer search and selection in modal
  - **Interaction**: POM (`e2e/src/pages/o2c/IndentsPage.ts`)
  - **Locators Used**: 
    - `getByRole('dialog')`
    - `getByPlaceholder(/search by dealer code, name, gst, or territory/i)`
    - `getByRole('heading', { name: /select dealer/i })`
    - `getByRole('row')`
    - `getByRole('button', { name: /select/i })`
    - `getByRole('table')`
  - **Last Verified**: 2026-02-04

**Change Risk**: 🔴 High - 1 test affected (core component)

---

### `../web_app/src/app/o2c/indents/page.tsx`
**Affected Tests**:
- `O2C-INDENT-TC-001`: Create indent with valid data
  - **Interaction**: POM (`e2e/src/pages/o2c/IndentsPage.ts`)
  - **Last Verified**: 2026-02-04

- `O2C-INDENT-TC-002`: Submit indent for approval
  - **Interaction**: POM (`e2e/src/pages/o2c/IndentsPage.ts`)
  - **Last Verified**: 2026-02-04

**Change Risk**: 🔴 High - 2 tests affected

---

### `../web_app/src/app/o2c/indents/components/IndentForm.tsx`
**Affected Tests**:
- `O2C-INDENT-TC-001`: Create indent with valid data
  - **Interaction**: POM (`e2e/src/pages/o2c/IndentsPage.ts`)
  - **Locators Used**: 
    - `getByRole('combobox', { name: 'Dealer' })`
    - `getByLabel('Indent Name')`
    - `getByRole('button', { name: 'Add Product' })`
  - **Last Verified**: 2026-02-04

- `O2C-INDENT-TC-003`: Validation error on empty required field
  - **Interaction**: POM (`e2e/src/pages/o2c/IndentsPage.ts`)
  - **Last Verified**: 2026-02-04

**Change Risk**: 🔴 High - 2 tests affected

---

### `../web_app/src/app/o2c/indents/components/ProductTable.tsx`
**Affected Tests**:
- `O2C-INDENT-TC-001`: Create indent with valid data
  - **Interaction**: POM (`e2e/src/pages/o2c/IndentsPage.ts`)
  - **Locators Used**: `getByRole('button', { name: 'Add Product' })`
  - **Last Verified**: 2026-02-04

**Change Risk**: 🟡 Medium - 1 test affected

---

### `../web_app/src/app/o2c/inventory/page.tsx`
### `../web_app/src/app/o2c/components/O2CInventoryManagerPage.tsx`
### `../web_app/src/app/o2c/components/InventoryTable.tsx`
### `../web_app/src/app/o2c/components/InventoryPagination.tsx`
### `../web_app/src/app/o2c/components/InventoryAllocationTable.tsx`
### `../web_app/src/app/o2c/components/InventoryDashboard.tsx`

**Affected Tests**:
- `WH-INV-TC-001`–`WH-INV-TC-015`: Warehouse inventory Phases 1–2 (shell, tabs, filters, search, pagination, page size, combined filters)
  - **Interaction**: POM (`e2e/src/pages/o2c/WarehouseInventoryPage.ts`), steps (`e2e/src/steps/o2c/warehouse-inventory-steps.ts`)
  - **Last Verified**: 2026-03-22

**Change Risk**: 🟡 Medium — 15 tests; Phase 3+ targets Add Inventory / row actions / detail route (export/import E2E deferred).

### `../web_app/src/app/o2c/actions/inventoryOperations.ts`

**Affected Tests**:
- `WH-INV-TC-009`–`015` (search/filter/pagination behavior driven by server queries)
  - **Interaction**: Indirect via UI (`InventoryTable` / `useO2CInventory`)
  - **Last Verified**: 2026-03-22

**Change Risk**: 🟡 Medium

---

### `../web_app/src/app/o2c/sales-returns/page.tsx`
### `../web_app/src/app/o2c/sales-returns/components/SalesReturnsListClient.tsx`
### `../web_app/src/app/o2c/sales-returns/components/SalesReturnsTable.tsx`
### `../web_app/src/app/o2c/sales-returns/new/page.tsx`
### `../web_app/src/app/o2c/sales-returns/[id]/page.tsx`
### `../web_app/src/app/o2c/sales-returns/[id]/components/RecordGoodsReceiptButton.tsx`
### `../web_app/src/app/o2c/sales-returns/[id]/components/CancelReturnOrderButton.tsx`
### `../web_app/src/app/o2c/sales-returns/[id]/components/CreateCreditMemoButton.tsx`
### `../web_app/src/app/o2c/sales-returns/[id]/components/RetryECreditNoteButton.tsx`
### `../web_app/src/app/o2c/sales-returns/actions/returnOrderActions.ts`
### `../web_app/src/app/o2c/reports/sales-return/page.tsx`
### `../web_app/src/app/o2c/reports/sales-return/components/SalesReturnContent.tsx`

**Affected Tests**:
- `SR-PH1-TC-001`–`SR-PH1-TC-005`: Sales Returns Phase 1 (list shell, stats, table/empty, create nav, breadcrumb)
- `SR-PH2-TC-001`–`SR-PH2-TC-005`: Sales Returns Phase 2 (FacetedFilter status/reason, list search, clear filters, pagination)
- `SR-PH3-TC-001`–`SR-PH3-TC-004`: Phase 3 create wizard
- `SR-PH4-TC-001`–`SR-PH4-TC-004`: Phase 4 detail + record receipt + cancel hidden + GRN inventory DB sandwich (`inventory`, `sales_return_order_items`, invoice→SO warehouse)
- `SR-PH5-TC-001`–`SR-PH5-TC-003`: Phase 5 credit memo branching + Retry E-Credit shell
- `SR-PH6-TC-001`–`SR-PH6-TC-004`: Phase 6 cancel + wizard `alert()` validation
- `SR-PH7-TC-001`–`SR-PH7-TC-002`: Phase 7 report shell + ED access denied (or tenant-aware skip)
- `SR-PH8-TC-001`–`SR-PH8-TC-004`: Phase 8 inventory invariants (QC Failed GRN, pre-GRN cancel, post-credit-memo no-extra-delta, multi-line GRN reconciliation)
  - **Interaction**: POMs (`SalesReturnsListPage.ts`, `CreateSalesReturnOrderPage.ts`, `SalesReturnDetailPage.ts`, `SalesReturnReportPage.ts`), steps (`sales-returns-steps.ts`), DB helpers (`o2c-db-helpers.ts`); `playwright.config.ts` (`iacs-ed` `testMatch` includes `sales-returns.feature.spec.js`)
  - **Last Verified**: 2026-03-23

**Change Risk**: 🟡 Medium — finance credit memo + report paths included.

---

## O2C Reports - Hierarchical Sales

### `../web_app/src/app/o2c/reports/hierarchical-sales/page.tsx`
**Affected Tests**:
- `O2C-HSR-TC-001`, `O2C-HSR-TC-002` (documented only): Page access / access denied
- `O2C-HSR-TC-003`–`O2C-HSR-TC-028`: All Hierarchical Sales Report tests
  - **Interaction**: POM (`e2e/src/pages/o2c/HierarchicalSalesReportPage.ts`)
  - **Last Verified**: 2026-02-18

**Change Risk**: 🔴 High - 26+ tests affected

---

### `../web_app/src/app/o2c/reports/hierarchical-sales/components/HierarchicalSalesContent.tsx`
**Affected Tests**:
- `O2C-HSR-TC-003`–`O2C-HSR-TC-028`: Filters, quick period, Generate Report, summary cards, hierarchy, Expand/Collapse All, Export Excel, empty/no-data states
  - **Interaction**: POM (`e2e/src/pages/o2c/HierarchicalSalesReportPage.ts`)
  - **Locators Used**: heading "Hierarchical Sales Report", labels "From Date *", "To Date *", "State (GSTIN)", "Region", "Territory", buttons "This Month", "This Quarter", "This Year", "Generate Report", "Expand All", "Collapse All", "Export Excel", "No Report Generated", "No Sales Data Found", "GRAND TOTAL"
  - **Last Verified**: 2026-02-18

**Change Risk**: 🔴 High - 26 tests affected

---

### `../web_app/src/app/o2c/reports/actions/hierarchicalSalesReportActions.ts`
**Affected Tests**:
- `O2C-HSR-TC-011`–`O2C-HSR-TC-015`, `O2C-HSR-TC-025`–`O2C-HSR-TC-028`: Report generation, summary, empty/no-data, optional DB consistency
  - **Interaction**: Server action (via UI Generate Report)
  - **Last Verified**: 2026-02-18

**Change Risk**: 🟡 Medium - 10+ tests affected

---

### `../web_app/src/utils/exportUtils.ts` (exportHierarchicalSalesToExcel)
**Affected Tests**:
- `O2C-HSR-TC-022`–`O2C-HSR-TC-024`: Export Excel disabled when no data; export with data; Exporting... state
  - **Interaction**: Client-side export (via UI Export Excel button)
  - **Last Verified**: 2026-02-18

**Change Risk**: 🟡 Medium - 3 tests affected

---

## API Routes

### `../web_app/src/app/api/auth/login/route.ts`
**Affected Tests**:
- `AUTH-LOGIN-TC-001`: Login with valid credentials
  - **Interaction**: API (via UI action)
  - **Verification**: Database check (Sandwich Method)
  - **Last Verified**: 2026-02-04

- `AUTH-LOGIN-TC-002`: Login with invalid credentials
  - **Interaction**: API (via UI action)
  - **Last Verified**: 2026-02-04

**Change Risk**: 🔴 High - 2 tests affected

---

### `../web_app/src/app/api/o2c/indents/route.ts`
**Affected Tests**:
- `O2C-INDENT-TC-001`: Create indent with valid data
  - **Interaction**: API (via UI action)
  - **Verification**: Database check (Sandwich Method)
  - **Last Verified**: 2026-02-04

- `O2C-INDENT-TC-002`: Submit indent for approval
  - **Interaction**: API (via UI action)
  - **Verification**: Database check (Sandwich Method)
  - **Last Verified**: 2026-02-04

**Change Risk**: 🔴 High - 2 tests affected

---

## Component Library (Shared Components)

### `../web_app/src/components/ui/select.tsx` (ShadCN Select)
**Affected Tests**:
- `O2C-INDENT-TC-001`: Create indent with valid data
  - **Interaction**: Component Library (`SelectComponent.ts`)
  - **Last Verified**: 2026-02-04

- Any test using dropdowns/comboboxes
  - **Interaction**: Component Library (`SelectComponent.ts`)
  - **Last Verified**: 2026-02-04

**Change Risk**: 🔴 Critical - Affects ALL tests using dropdowns

---

### `../web_app/src/components/ui/dialog.tsx` (ShadCN Dialog)
**Affected Tests**:
- Any test using modals/dialogs
  - **Interaction**: Component Library (`DialogComponent.ts`)
  - **Last Verified**: 2026-02-04

**Change Risk**: 🔴 Critical - Affects ALL tests using dialogs

---

### `../web_app/src/components/ui/toast.tsx` (Sonner Toast)
**Affected Tests**:
- Any test verifying toast notifications
  - **Interaction**: Component Library (`ToastComponent.ts`)
  - **Last Verified**: 2026-02-04

**Change Risk**: 🔴 Critical - Affects ALL tests using toast verification

---

## Finance Module

### `../web_app/src/app/finance/cash-receipts/new/page.tsx`
**Affected Tests**:
- `FIN-CR-TC-011`: New cash receipt validation (amount > 0)
  - **Interaction**: POM (`e2e/src/pages/finance/NewCashReceiptPage.ts`)
  - **Locators Used**: `getByRole('button', { name: /Save Cash Receipt/i })`, error alert text
  - **Last Verified**: 2026-03-21
- `FIN-CR-TC-012`: New cash receipt validation (bank required for NEFT)
  - **Interaction**: POM (`e2e/src/pages/finance/NewCashReceiptPage.ts`)
  - **Locators Used**: payment method select, save button, error alert text
  - **Last Verified**: 2026-03-21

**Change Risk**: 🔴 High - 2 tests affected

---

### `../web_app/src/app/finance/cash-receipts/[id]/page.tsx`
**Affected Tests**:
- `FIN-VAN-TC-012`: VAN lifecycle integrity (un-apply and re-apply)
  - **Interaction**: POM (`e2e/src/pages/finance/CashReceiptDetailPage.ts`)
  - **Locators Used**: Un-apply button/dialog, receipt summary values
  - **Last Verified**: 2026-03-21

**Change Risk**: 🟡 Medium - 1 test affected

---

### `../web_app/src/app/finance/cash-receipts/[id]/apply/page.tsx`
**Affected Tests**:
- `FIN-VAN-TC-012`: VAN lifecycle integrity (re-apply and reconcile)
  - **Interaction**: POM (`e2e/src/pages/finance/CashReceiptApplyPage.ts`)
  - **Locators Used**: invoice selection checkbox, Apply Payments button
  - **Last Verified**: 2026-03-21

**Change Risk**: 🟡 Medium - 1 test affected

---

### `../web_app/src/app/finance/credit-memos/page.tsx`
**Affected Tests**:
- `FIN-CM-TC-001`–`FIN-CM-TC-008`, `FIN-CM-TC-011`–`FIN-CM-TC-022`: Create credit memo flow entry; **TC-022** RBAC deny (`/restrictedUser`) via `credit-memo-steps.ts`
  - **Interaction**: POM (`e2e/src/pages/finance/CreditMemosPage.ts`), steps (`e2e/src/steps/finance/credit-memo-steps.ts`)
  - **Locators Used**: `getByRole('button', { name: /New Credit Memo/i })`, route `/finance/credit-memos`, `ProtectedPageWrapper` `finance_credit_memos`
  - **Last Verified**: 2026-03-22

**Change Risk**: 🔴 High - 20 tests affected

---

### `../web_app/src/app/finance/credit-memos/new/page.tsx`
**Affected Tests**:
- `FIN-CM-TC-001`: Create credit memo with valid inputs
- `FIN-CM-TC-002`: Partial apply prerequisite creation
- `FIN-CM-TC-003`, `FIN-CM-TC-004`, `FIN-CM-TC-008`: Full settlement prerequisite creation
- `FIN-CM-TC-005`: Cross-invoice prerequisite creation (original invoice link)
- `FIN-CM-TC-006`: Integrity scenario prerequisite creation
- `FIN-CM-TC-007`: Outstanding reduction scenario prerequisite creation
- `FIN-CM-TC-011`, `FIN-CM-TC-012`: Transport allowance over-balance prerequisite creation
- `FIN-CM-TC-013`–`FIN-CM-TC-016`: Negative apply prerequisites (transport_allowance CM creation)
- `FIN-CM-TC-017`: Non-transport (`pricing_error`) CM creation
- `FIN-CM-TC-018`–`FIN-CM-TC-021`: GL post + reversal + reverse-dialog / post-reversal UI prerequisites (transport_allowance CM creation)
  - **Interaction**: POM (`e2e/src/pages/finance/NewCreditMemoPage.ts`)
  - **Locators Used**: customer dialog select, **Credit Reason** combobox (`selectCreditReason`), original invoice combobox (`#original_invoice_id` + **anchored** option match), reason description, line item inputs, create button + navigation wait to detail URL
  - **Last Verified**: 2026-03-22

**Change Risk**: 🔴 High - 19 tests affected

---

### `../web_app/src/app/finance/credit-memos/[id]/page.tsx`
**Affected Tests**:
- `FIN-CM-TC-002`–`FIN-CM-TC-008`, `FIN-CM-TC-011`–`FIN-CM-TC-021`: Apply to invoice, post-apply validations, apply-dialog negative paths, **Post to GL**, **Reverse** application (AlertDialog + `#reverse-reason`), reverse-dialog enable/disable + cancel, post-reversal row (**Reversed** badge, no **Reverse**)
  - **Interaction**: POM (`e2e/src/pages/finance/CreditMemoDetailPage.ts`)
  - **Locators Used**: Apply to Invoice, invoice select (`#invoice` + **anchored** option name via `finance-select-helpers`), amount input (`#amount`), Apply Credit; Post to GL; Application History **Reverse** / **Confirm Reversal** / **Cancel**; `getByRole('alertdialog')` scoped to reverse title; Sonner toasts
  - **Last Verified**: 2026-03-22

**Change Risk**: 🔴 High - 18 tests affected

---

### `../web_app/src/app/finance/dealer-ledger/page.tsx`
**Affected Tests**:
- `FIN-DL-TC-001`–`FIN-DL-TC-016`: Dealer Ledger entry, RBAC wrapper (`dealer_ledger` read); **TC-008** deny path (`/restrictedUser`)
  - **Interaction**: POM (`e2e/src/pages/finance/DealerLedgerPage.ts`)
  - **Locators Used**: route `/finance/dealer-ledger`, breadcrumbs via app shell
  - **Last Verified**: 2026-03-22

**Change Risk**: 🟡 Medium - 16 tests affected

---

### `../web_app/src/app/finance/dealer-ledger/components/DealerLedgerContent.tsx`
**Affected Tests**:
- `FIN-DL-TC-001`–`FIN-DL-TC-016`: Dealer combobox (first card), date inputs, **Load Ledger**, exports (CSV + **Dealer Ledger** / **Invoice Ledger** PDF), summary cards, type **Select**, search, date sort header, **Transaction History** table + invoice/payment/credit links, AR/VAN cards (optional), Sonner toasts; O2C E2E tail uses same POM
  - **Interaction**: POM (`e2e/src/pages/finance/DealerLedgerPage.ts`), steps (`e2e/src/steps/finance/dealer-ledger-steps.ts`, `e2e/src/steps/o2c/o2c-e2e-steps.ts`)
  - **Locators Used**: first card `combobox`, `#from-date` / `#to-date`, **Export CSV**, PDF buttons by name, Transaction History card `combobox` + `option`, search placeholder, `th` **Date**, table `tbody tr` / `cell` index 1 (type) / 2 (doc), `link` → `/o2c/invoices/`, `/o2c/payments/`, `/finance/credit-memos/`
  - **Last Verified**: 2026-03-22

**Change Risk**: 🟡 Medium - 16 tests + O2C E2E dealer ledger phase

---

### `../web_app/src/app/o2c/invoices/[id]/components/InvoiceDetailsContent.tsx`
**Affected Tests**:
- `O2C-E2E-TC-001` (Custom E-Invoice PDF / invoice detail load); `O2C-E2E-TC-004` (**Cancel E-Invoice** trigger + `EInvoiceCancellation` AlertDialog, Sonner success toast)
 - `O2C-E2E-TC-007` (full-line inventory restoration validation after header cancel), `O2C-E2E-TC-009` (second cancel idempotency attempt must not mutate inventory)
  - **Interaction**: POM `e2e/src/pages/o2c/InvoiceDetailPage.ts`, steps `e2e/src/steps/o2c/o2c-e2e-steps.ts`
  - **Locators Used**: **E-Invoice Information** card; header `getByRole('button', { name: /^cancel invoice$/i })`; `role="dialog"` scoped to **Cancel Invoice**; confirm action button; `[data-sonner-toast]`; read-only DB `invoices.einvoice_status` + package-level inventory baselines via `o2c-db-helpers`
  - **Last Verified**: 2026-03-23

**Change Risk**: 🟡 Medium - O2C E2E invoice tail + cancellation

---

### `../web_app/src/app/o2c/actions/processApproval.ts`
**Affected Tests**:
- `O2C-E2E-TC-006` (90+ day unpaid invoice block on **approve**; error string → `toast.error` on indent detail; dealer resolved via `findFirstDealerWithUnpaidInvoicesOlderThan90Days`)
  - **Interaction**: Steps `e2c-e2e-steps.ts`, `indent-steps.ts`; POM `IndentDetailPage.ts`
  - **Locators Used**: `[data-sonner-toast]` (destructive/error), Approve Indent dialog
  - **Last Verified**: 2026-03-21

**Change Risk**: 🟡 Medium — conditional E2E (skips when no tenant dealer has qualifying old unpaid invoices)

---

### `../web_app/src/app/finance/dealer-ledger/actions/dealerLedgerActions.ts`
**Affected Tests**:
- `FIN-DL-TC-001`–`FIN-DL-TC-016`: `getDealersForLedger`, `getDealerLedger`, `exportDealerLedgerCSV`, PDF download actions, VAN/AR parallel fetch (UI outcomes)
  - **Interaction**: Indirect (server actions); DB sandwich optional for future tests
  - **Last Verified**: 2026-03-22

**Change Risk**: 🟡 Medium - 16 tests (data-dependent)

---

### `../web_app/src/app/finance/ar-aging/page.tsx`
**Affected Tests**:
- `FIN-AR-TC-001`–`FIN-AR-TC-012`: AR Aging UI (filters, tabs, search, exports, snapshots dialog), RBAC `finance_aging_reports` read; **TC-009** → `/restrictedUser`
  - **Interaction**: POM (`e2e/src/pages/finance/ARAgingPage.ts`), steps (`e2e/src/steps/finance/ar-aging-steps.ts`)
  - **Locators Used**: heading **AR Aging Report**, toolbar **Filters** / **Export PDF** / **Export Excel**, `#aging_basis` Select, **Apply Filters**, tabs **Dealer Summary** / **Invoice Detail** / **Snapshots**, search placeholder, `role="dialog"` Generate Snapshot, Sonner toasts
  - **Last Verified**: 2026-03-22

**Change Risk**: 🟡 Medium - 12 tests

---

### `../web_app/src/app/finance/reports/ar-aging/page.tsx`
**Affected Tests**:
- `FIN-AR-TC-010`: redirect to `/finance/ar-aging`
  - **Last Verified**: 2026-03-22

**Change Risk**: 🟢 Low - 1 test

---

### `../web_app/src/app/finance/reports/dealer-outstanding/page.tsx`
**Affected Tests**:
- `FIN-DO-TC-001`–`FIN-DO-TC-031`: filters, Load Report, summary cards, dealer grid, drill-down dialog, CSV/PDF
- `FIN-DO-TC-040`: RBAC via **invoices** read (`@iacs-ed` → `/restrictedUser` when denied)
  - **Interaction**: POM (`e2e/src/pages/finance/DealerOutstandingReportPage.ts`), steps (`e2e/src/steps/finance/dealer-outstanding-steps.ts`)
  - **Locators Used**: heading **Dealer Outstanding Report**, **Report Filters**, **Load Report**, **CSV** / **PDF**, `input[type="date"]`, `input[type="number"]`, Radix **combobox** (Region), table **Gross Outstanding** / **Unapplied Credits**, `role="dialog"` **Invoice Details**, Sonner toasts
  - **Last Verified**: 2026-03-22

**Change Risk**: 🟡 Medium - 15 tests (data-dependent)

---

### `../web_app/src/app/finance/reports/dealer-outstanding/actions/dealerOutstandingActions.ts`
**Affected Tests**:
- `FIN-DO-TC-003`–`008`, `010`–`011`, `020`–`021`, `030` (indirect via totals, drill-down, DB alignment)
  - **Last Verified**: 2026-03-22

**Change Risk**: 🟡 Medium - calculation / query changes affect reconciliation scenarios

---

### `../web_app/src/app/finance/actions/getARAgingReport.ts` / `downloadARAgingPdf.ts` / snapshot actions
**Affected Tests**:
- `FIN-AR-TC-001`–`008`, `011`–`012` (indirect via load/export/snapshots)
  - **Last Verified**: 2026-03-22

**Change Risk**: 🟡 Medium - data/API dependent

---

## Change Impact Risk Levels

| Risk Level | Impact | Recommendation |
|------------|--------|----------------|
| 🔴 Critical | Affects 10+ tests or core component | Run full regression suite |
| 🔴 High | Affects 3-9 tests | Run all affected module tests |
| 🟡 Medium | Affects 1-2 tests | Run affected tests only |
| 🟢 Low | No direct test impact | No test execution required (but verify) |

---

## Automated Impact Analysis

### Script: `analyze-change-impact.sh`

```bash
#!/bin/bash
# Usage: ./scripts/analyze-change-impact.sh main..feature-branch

BRANCH_RANGE="${1:-main..HEAD}"

echo "Analyzing changed files..."
CHANGED_FILES=$(git diff "$BRANCH_RANGE" --name-only | grep "web_app/src/app")

echo "Affected Tests:"
for FILE in $CHANGED_FILES; do
  FILENAME=$(basename "$FILE")
  echo "\n📄 Changed: $FILE"
  grep -A 5 "$FILENAME" docs/test-cases/test-impact-matrix.md | grep "TC-" || echo "  No tests found"
done
```

**Setup**:
```bash
chmod +x scripts/analyze-change-impact.sh
./scripts/analyze-change-impact.sh
```

---

## Maintenance Schedule

### Weekly (Every Friday)
- [ ] Review matrix for new tests created this week
- [ ] Add mappings for new tests
- [ ] Verify "Last Verified" dates for changed components

### Monthly
- [ ] Audit matrix completeness (all tests mapped?)
- [ ] Update risk levels based on test reliability
- [ ] Remove mappings for deprecated tests

### Quarterly
- [ ] Full audit: Run tests and verify locators still accurate
- [ ] Update component library mappings
- [ ] Archive outdated mappings (tests removed)

---

## Matrix Statistics

**Last Full Audit**: YYYY-MM-DD

| Metric | Count |
|--------|-------|
| Total Source Files Tracked | XX |
| Total Tests Mapped | XX |
| Average Tests per File | X.X |
| Files with 🔴 Critical Risk | X |
| Files with 🔴 High Risk | X |
| Files with 🟡 Medium Risk | X |
| Files with 🟢 Low Risk | X |

---

## Contributing Guidelines

### Adding New Mappings

When creating new tests, you MUST update this matrix:

1. **Identify Source Files**: List all web_app files your test interacts with
2. **Document Interaction Type**: POM, Direct, API, etc.
3. **List Locators Used**: Key locators from the source file
4. **Set Risk Level**: Based on number of affected tests
5. **Add Last Verified Date**: Today's date

**Template**:
```markdown
### `../web_app/src/app/[module]/[file].tsx`
**Affected Tests**:
- `MODULE-FEATURE-TC-###`: [Test name]
  - **Interaction**: POM (`e2e/src/pages/[module]/[Page].ts`)
  - **Locators Used**: `locator1`, `locator2`
  - **Last Verified**: YYYY-MM-DD

**Change Risk**: 🟡 Medium - 1 test affected
```

### Updating Existing Mappings

When source files change:
1. **Find Mapping**: Search for filename in this document
2. **Update "Last Verified"**: Set to today's date
3. **Update Locators**: If locators changed in component
4. **Update Risk Level**: If number of affected tests changed
5. **Add Note**: If mapping changed significantly

---

## Known Limitations

1. **Manual Maintenance**: Matrix requires manual updates (no automated syncing)
2. **Component Library**: Shared components affect many tests, hard to track individually
3. **API Routes**: Indirect relationships hard to capture (API called by multiple pages)
4. **Dynamic Components**: Components loaded conditionally may not be tracked

**Future Improvements**:
- Automated matrix generation from test code analysis
- Integration with code coverage tools
- Real-time impact analysis during CI/CD

---

## Plant Production Module (PLANT) — Phases 1-4

### Phase 1: Plant Setup

| Source File | Tests Affected | Risk Level |
|-------------|---------------|------------|
| `web_app/src/app/plant-production/plants/components/PlantsManagerPage.tsx` | PLANT-PLT-TC-001 through TC-010 | High |
| `web_app/src/app/plant-production/plants/components/PlantFormDialog.tsx` | PLANT-PLT-TC-001, TC-007, TC-009 | High |
| `web_app/src/app/plant-production/plants/components/PlantLicenseFormDialog.tsx` | PLANT-LIC-TC-001 through TC-011 | High |
| `web_app/src/app/plant-production/plants/components/PlantAssetFormDialog.tsx` | PLANT-AST-TC-001 through TC-012 | High |
| `web_app/src/app/plant-production/actions/createPlant.ts` | PLANT-PLT-TC-001, TC-006, TC-007 | Medium |
| `web_app/src/app/plant-production/actions/createPlantLicense.ts` | PLANT-LIC-TC-001, TC-004 | Medium |
| `web_app/src/app/plant-production/actions/createPlantAsset.ts` | PLANT-AST-TC-001, TC-007 | Medium |
| `web_app/src/app/plant-production/actions/managePlantAssets.ts` | PLANT-AST-TC-012 | Medium |

**Test Files**:
- `e2e/features/plant-production/01-create-plant.feature`
- `e2e/features/plant-production/02-plant-licenses.feature`
- `e2e/features/plant-production/03-plant-assets.feature`
- `e2e/src/pages/plant-production/PlantsPage.ts`
- `e2e/src/steps/plant-production/plant-steps.ts`

### Phase 2: BOM Management

| Source File | Tests Affected | Risk Level |
|-------------|---------------|------------|
| `web_app/src/app/plant-production/bom/components/BOMManagerPage.tsx` | PLANT-BOM-TC-001 through TC-019 | High |
| `web_app/src/app/plant-production/bom/components/BOMFormDialog.tsx` | PLANT-BOM-TC-001, TC-002, TC-003, TC-019 | High |
| `web_app/src/app/plant-production/bom/[id]/page.tsx` | PLANT-BOM-TC-006, TC-012, TC-014, TC-016 | High |
| `web_app/src/app/plant-production/actions/bomManagement.ts` | PLANT-BOM-TC-001 through TC-019 | High |
| `web_app/src/app/plant-production/bom/[id]/components/BOMLineItemsTab.tsx` | PLANT-BOM-TC-011 through TC-017 | High |

**Test Files**:
- `e2e/features/plant-production/04-bom-header.feature`
- `e2e/features/plant-production/05-bom-lines.feature`
- `e2e/src/pages/plant-production/BOMPage.ts`
- `e2e/src/pages/plant-production/BOMDetailPage.ts`
- `e2e/src/steps/plant-production/bom-steps.ts`

### Phase 3: Work Orders

| Source File | Tests Affected | Risk Level |
|-------------|---------------|------------|
| `web_app/src/app/plant-production/work-orders/components/WorkOrdersManagerPage.tsx` | PLANT-WO-TC-001 through TC-008 | High |
| `web_app/src/app/plant-production/work-orders/components/WorkOrderFormDialog.tsx` | PLANT-WO-TC-002, TC-003 | High |
| `web_app/src/app/plant-production/actions/createWorkOrder.ts` | PLANT-WO-TC-002 | Medium |
| `web_app/src/app/plant-production/actions/deleteWorkOrder.ts` | PLANT-WO-TC-006 | Medium |
| `web_app/src/app/plant-production/actions/approveWorkOrder.ts` | PLANT-WO-TC-007 | Medium |

**Test Files**:
- `e2e/features/plant-production/06-work-orders.feature`
- `e2e/src/pages/plant-production/WorkOrdersPage.ts`
- `e2e/src/steps/plant-production/work-order-steps.ts`

### Phase 4: Material Requests & Quality Control

| Source File | Tests Affected | Risk Level |
|-------------|---------------|------------|
| `web_app/src/app/plant-production/material-requests/components/MaterialRequestsManager.tsx` | PLANT-MRN-TC-001 through TC-003 | Medium |
| `web_app/src/app/plant-production/quality-control/components/QualityControlManagerPage.tsx` | PLANT-QC-TC-001 through TC-007 | High |
| `web_app/src/app/plant-production/quality-control/components/AnomalyFormDialog.tsx` | PLANT-QC-TC-002, TC-003, TC-007 | High |
| `web_app/src/app/plant-production/actions/productionAnomalies.ts` | PLANT-QC-TC-002, TC-004, TC-005 | Medium |

**Test Files**:
- `e2e/features/plant-production/07-material-requests.feature`
- `e2e/features/plant-production/08-quality-control.feature`
- `e2e/src/pages/plant-production/MaterialRequestsPage.ts`
- `e2e/src/pages/plant-production/QualityControlPage.ts`
- `e2e/src/steps/plant-production/material-request-steps.ts`
- `e2e/src/steps/plant-production/quality-control-steps.ts`

---

**Document Owner**: QA Lead
**Contributors**: All automation engineers MUST update this when creating tests
