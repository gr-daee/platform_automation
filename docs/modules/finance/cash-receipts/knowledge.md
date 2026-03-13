# Finance - Cash Receipts (Manual & VAN)

## Overview
Cash Receipts cover (1) manual creation and application to open invoices with EPD handling, and (2) automated VAN (Axis Bank) payments: validation → posting → FIFO allocation with EPD per tenant configuration.

**Routes**:
- List: `/finance/cash-receipts`
- New: `/finance/cash-receipts/new`
- Detail: `/finance/cash-receipts/[id]`
- Apply: `/finance/cash-receipts/[id]/apply`
- VAN: `/finance/van-payments`
- EPD Calculator: `/tools/epd-calculator`
- Payment Terms (EPD slabs): `/finance/payment-terms`

**Permissions**: `finance_cash_receipts` (read, create, update), `van_payment_collections` (read).

## Key Components

### Cash Receipts List
- **Source**: `../web_app/src/app/finance/cash-receipts/page.tsx`
- **Actions**: New Cash Receipt (link to `/finance/cash-receipts/new`), table via `CashReceiptsTable`.

### New Cash Receipt
- **Source**: `../web_app/src/app/finance/cash-receipts/new/page.tsx`
- **Fields**: Customer (searchable), receipt date, payment method, total amount, bank account, payment reference, deposit date, notes, payment proof upload.
- **Success**: Redirect to receipt detail; journal Dr. Bank, Cr. Unapplied Cash.

### Cash Receipt Detail
- **Source**: `../web_app/src/app/finance/cash-receipts/[id]/page.tsx`
- **Actions**: Apply to Invoices (navigate to apply page), Edit (when unapplied), Reverse (with reason).
- **Content**: Payment details, amount summary, applications table (invoice, amount, discount, status), EPD breakdown (expandable).

### Apply Cash Receipt
- **Source**: `../web_app/src/app/finance/cash-receipts/[id]/apply/page.tsx`
- **Flow**: Select invoices (checkbox), amount to apply, EPD options (apply discount, override, manual amount). Submit → `applyCashReceiptToInvoices`.
- **Validation**: Net cash required ≤ unapplied amount; override reason min 20 chars when override enabled.

### VAN Payments
- **Source**: `../web_app/src/app/finance/van-payments/page.tsx` → `VANPaymentDashboard`.
- **Content**: List of VAN payments (e.g. VAN-AXIS-YYYYMMDD-*), status, UTR, amounts.

## Business Rules

- **Manual application**: User can unselect EPD or adjust EPD amount up to max calculated EPD for that application.
- **Tenant EPD**: Two approaches (reduce invoice outstanding vs create CCN), two formulas; EPD slabs tenant-configurable.
- **VAN**: Bank sends validation then posting; posting creates cash receipt and allocates FIFO; EPD applied per tenant config and slabs.
- **FIFO**: Oldest invoice (by date) paid first for VAN auto-allocation.
- **EPD base**: EPD calculated on taxable (non-GST) amount only.

## Database (Read-Only for Tests)

- **cash_receipt_headers**: id, receipt_number, customer_id, receipt_date, payment_method, total_receipt_amount, amount_applied, amount_unapplied, status, gl_journal_id, etc.
- **cash_receipt_applications**: id, cash_receipt_id, invoice_id, amount_applied, discount_taken, application_date, is_reversed, discount_type, was_within_epd_period, etc.
- **van_payment_collections**: id, utr, bene_acc_no, status (validated | posted), amount, dealer_id, cash_receipt_id, etc.
- **epd_discount_slabs**: tenant_id, days_from, days_to, discount_percentage, is_active.

## API (VAN)

- **Validation**: POST `/functions/v1/axis-bank-validation`, body includes Req_type=validation, Bene_acc_no (VAN), Corp_code, Txn_amnt, Sndr_acnt, Sndr_ifsc, Sndr_nm, UTR, Tran_id, Req_date, Pmode.
- **Posting**: POST `/functions/v1/axis-bank-posting`, body same but Req_type=notification.
- **Signature**: HMAC-SHA256 on payload string `POST{path}{minified JSON body}{timestamp}`; path = `/axis-bank-validation` or `/axis-bank-posting`. Headers: X-API-KEY, X-Timestamp, X-Signature.

## Testing Context

- **Semantic locators**: Prefer getByRole('button', { name: /New Cash Receipt|Apply to Invoices|Apply Payments|Un-apply/i }), getByLabel('Amount to Apply'), getByRole('combobox') for customer/bank.
- **Toasts**: Success "Payments applied successfully!", "Cash receipt reversed successfully".
- **Apply page**: Checkbox per invoice, amount input, EPD collapsible section, "Apply Payments (N)" button.

### VAN E2E (van-auto-payment-e2e.feature)

- **Payload parity**: Automation uses same HMAC and endpoints as Signature Utility (axis-bank-validation, axis-bank-posting). Optional: `getPayloadOverridesForTestCase('TC_ABP_14')` for EPD-specific amounts.
- **UI verification paths**: After API posting, open receipt by `cash_receipt_id` from DB (getVANPaymentByUTR → cash_receipt_id). Receipt detail: Amount Applied, EPD Discount Given, Balance (Unapplied); Un-apply button opens dialog with Un-apply Reason and "Un-apply Payment" button. Invoice detail: `/o2c/invoices/[id]` shows status "Paid" and balance when fully paid.
- **Test data**: Use mapped VAN (e.g. IACS1234) and tenant; first iteration asserts "discount present" on receipt detail, not exact EPD amount. Env: VAN_API_BASE_URL, VAN_API_KEY, VAN_SHARED_SECRET in .env.local.

## EPD Test Cases (Dev Reference)

- **Dev document**: `EPD-TEST-CASES-AND-CONFIGURATION.md` (DAE-261) – 15 EPD calculation cases (TC-EPD-001 to TC-EPD-015), 12 edge cases (E1–E12), EPD Settings UI at `/finance/epd-settings`, formulas (SIMPLE, GROSS_UP), tenant settings (calculation_base, partial_payment_formula, discount_approach, etc.).
- **Coverage review**: `docs/modules/finance/cash-receipts/EPD-COVERAGE-REVIEW.md` – maps each dev scenario to current automation (Covered / Partial / Not Covered) and recommends new scenarios to align with dev.

## Recent Changes (IMPL-028, IMPL-029, IMPL-030)

- **Step definitions**: `e2e/src/steps/finance/cash-receipt-steps.ts`, `van-payment-steps.ts`, `epd-configuration-steps.ts` for manual CR, VAN API, EPD config. IMPL-029: E2E steps in van-payment-steps.ts (open receipt for last VAN payment, verify receipt amounts/EPD, verify invoice Paid/balance zero, un-apply, re-apply). IMPL-030: Redundant test cleanup — van-fifo (removed TC-023, renumbered 024→023, 025→024), van-epd (consolidated 4→2 scenarios).
- **Page Objects**: CashReceiptsPage, CashReceiptDetailPage (IMPL-029: amount summary, Un-apply), CashReceiptApplyPage, VANPaymentsPage, PaymentTermsPage, EPDCalculatorPage. InvoiceDetailPage: verifyStatusPaid(), verifyPaidWithBalanceZero().
- **API client**: `e2e/src/support/api/van-api-client.ts` (validatePayment, postPayment, buildValidationPayload, getPayloadOverridesForTestCase, HMAC-SHA256).
- **DB helpers**: `e2e/src/support/finance-db-helpers.ts` (cash receipt, VAN, EPD slabs, tenant config, getInvoiceNumberById).
- **Test data**: `e2e/src/support/data/finance-test-data.ts` (getStableDealerWithVAN, getStableInvoicesWithOutstanding).
