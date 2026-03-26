# Finance - Credit Memos

## Overview
Credit Memos allow finance users to create customer credit documents and apply them to invoices. Application should reduce invoice outstanding and maintain credit memo application/audit trail integrity.

## E2E locator note (invoice Select)
- Apply dialog and **New Credit Memo → Original Invoice** use Radix `SelectItem` text: `{invoice_number} - {date} - …`.
- Do **not** use `new RegExp(invoiceNumber)` alone on options — substring matches can pick the wrong row. Use anchored patterns (see `e2e/src/support/finance-select-helpers.ts` and **IMPL-036**).

## Key Routes
- List: `/finance/credit-memos`
- New: `/finance/credit-memos/new`
- Detail: `/finance/credit-memos/[id]`

## RBAC
- Pages use `ProtectedPageWrapper` module **`finance_credit_memos`**, action **`read`**.
- **FIN-CM-TC-022** (`iacs-ed`): expects `/restrictedUser` when RBAC denies list access; if ED still has credit memos in tenant, the step **skips** (aligns with **FIN-AR-TC-009** / **FIN-DL-TC-008**).

## Core Business Flow
1. Create credit memo with valid reason and line items.
2. Apply part/full amount to customer invoice.
3. Invoice outstanding decreases by applied amount.
4. Credit memo header (`credit_applied`, `credit_available`) reconciles with application rows for standard applies.
5. Optional `Original Invoice` link is informational; transport allowance credits can still be applied to other outstanding invoices for the same customer (UI explicitly allows this).
6. Transport allowance over-balance applies can route the excess to `dealer_advances` (assert via `dealer_advances.source_type = 'credit_memo'` and `source_reference = credit_memo_number`). In this path, `credit_memo_applications.amount_applied` may not equal `credit_memos.credit_applied` because part of the apply is not recorded as an invoice application row.

## GL posting
- **Post to GL** (detail header): creates/posts journal entry when `gl_posted` is false and no `gl_journal_id` / EPD JE; success toast `Credit memo posted to GL successfully!` with journal entry number; updates `credit_memos.gl_posted`, `gl_journal_id`.

## Application reversal
- **Reverse** (Application History): AlertDialog requires **Reason for Reversal**; calls `reverseCreditMemoApplication`; success toast `Application reversed successfully`; sets `credit_memo_applications.is_reversed = true` and restores `credit_memos.credit_applied` / `credit_available`; recalculates target invoice AR in server action.
- **Dialog UX**: `Confirm Reversal` (`AlertDialogAction`) is **disabled** while `reverseReason` is empty/whitespace (`!reverseReason.trim()`). **Cancel** closes without reversing.
- **Post-reversal UI**: Row shows badge **Reversed** (destructive); **Reverse** button is not rendered when `app.is_reversed` is true.
- **E2E note**: Prefer asserting **`credit_memo_applications` + CM header** after reversal for stability; invoice `balance_amount` can be added via polled sandwich if needed.
- **E2E**: Reverse dialog is Radix **AlertDialog** → `role="alertdialog"`; scope locators with title **Reverse Credit Memo Application** (see `CreditMemoDetailPage.reverseDialogRoot()`). Tests: **FIN-CM-TC-020**, **FIN-CM-TC-021** (IMPL-035).

## Apply Dialog — Validation (UI + server action)
- **Amount greater than `credit_available`**: client toast (e.g. “cannot exceed available credit”); server also returns `Amount exceeds available credit` if bypassed.
- **Non-positive amount**: **Apply Credit** stays **disabled** when `applyAmount` is empty or ≤ 0; server rejects non-positive amounts if invoked.
- **Cross-customer**: apply invoice list is tenant + customer scoped; another dealer’s invoice number must **not** appear in options (see `applyCreditMemoToInvoice` customer match in `creditMemoActions.ts`).
- **Duplicate active application**: server rejects with “Credit memo already applied to this invoice”.
- **Non–transport-allowance over invoice balance**: client blocks with “cannot exceed invoice balance”; server enforces the same for non–`transport_allowance` `reason_code`.

## Tables Used for Verification
- `credit_memos`
- `credit_memo_applications`
- `invoices`
- `dealer_advances`
