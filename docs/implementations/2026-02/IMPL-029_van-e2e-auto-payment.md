# IMPL-029 - VAN E2E Auto Payment Testing

**Metadata**
- **ID**: IMPL-029
- **Date**: 2026-02-22
- **Module**: Finance (Cash Receipts, VAN Payments)
- **Type**: New Feature
- **Status**: Complete
- **Related**: VAN-EPD-e2e.md, EPD-TEST-CASES-AND-CONFIGURATION.md, Signature Utility.html

---

## What Was Implemented

### Overview
End-to-end VAN-based auto payment testing: API (validation + posting) parity with Signature Utility, full UI verification (cash receipt detail, invoice status Paid/balance zero), and Phase 5 regression (un-apply / re-apply receipt).

### Technical Changes
- **Env**: Documented and uncommented VAN_API_BASE_URL, VAN_API_KEY, VAN_SHARED_SECRET in .env.local (placeholder values; set real for E2E runs).
- **van-api-client**: Optional `getPayloadOverridesForTestCase('TC_ABP_05' | 'TC_ABP_14' etc)` and `VAN_TEST_CASE_OVERRIDES` for Signature Utility test case parity.
- **FIN-VAN-TC-007**: Validation step now accepts UTR so duplicate test validates then posts with same UTR, then posts again with same UTR (second fails with "duplicate").
- **CashReceiptDetailPage**: Amount summary locators (Amount Applied, EPD Discount Given, Balance Unapplied), Un-apply button/dialog (reason, Un-apply Payment), verifyAmountSummaryVisible(), verifyEPDDiscountDisplayed(), unapplyReceipt().
- **InvoiceDetailPage**: verifyStatusPaid(), verifyPaidWithBalanceZero() for invoice detail assertions.
- **finance-db-helpers**: getInvoiceNumberById(invoiceId) for apply page invoice selection.
- **van-payment-steps**: E2E steps: "I open the cash receipt for the last VAN payment", "the receipt detail shows amount applied and status", "the receipt detail shows EPD discount displayed", "the invoice for the last VAN payment is Paid with balance zero", "I un-apply the receipt", "I re-apply the receipt to invoices". Context: vanLastCashReceiptId, vanLastInvoiceId, vanLastInvoiceNumber.
- **Feature**: van-auto-payment-e2e.feature with Background (logged in), three scenarios (happy path, EPD on UI, un-apply/re-apply).

---

## New Tests Created

| Test ID | Scenario | Feature File | Status |
|---------|----------|---------------|--------|
| FIN-VAN-E2E-001 | Happy path - VAN payment then verify receipt and invoice in UI | van-auto-payment-e2e.feature | Automated |
| FIN-VAN-E2E-002 | EPD verification - VAN payment then verify EPD on receipt detail | van-auto-payment-e2e.feature | Automated |
| FIN-VAN-E2E-003 | Un-apply then re-apply receipt (Phase 5 regression) | van-auto-payment-e2e.feature | Automated |

**Total New Tests**: 3

---

## Existing Tests Updated

| Test ID | Change |
|---------|--------|
| FIN-VAN-TC-007 | Validation step with UTR so first post succeeds with fixed UTR, second post fails duplicate. |

---

## Tests Deprecated

None.

---

## Corner Cases Discovered

- **Invoice verification**: Step "the invoice for the last VAN payment is Paid with balance zero" skips when no application (vanLastInvoiceId undefined). EPD first iteration asserts "discount present" on receipt detail, not exact EPD amount.
- **Re-apply**: Uses vanLastInvoiceNumber from first application to select same invoice on apply page; saveApplication() waits for success toast.

---

## Test Results

### Execution
- API-only: `npm run test:regression -- e2e/features/finance/cash-receipts/van-api-validation.feature` (and van-api-posting, van-epd-discount).
- E2E (API + UI): `npm run test:dev -- e2e/features/finance/cash-receipts/van-auto-payment-e2e.feature`.

### Environment
- VAN_API_BASE_URL, VAN_API_KEY, VAN_SHARED_SECRET must be set in .env.local for VAN API and E2E.
- Web app BASE_URL must point to same backend as API so receipt/invoice data is visible after posting.

### Test Data Strategy
- VAN/dealer: IACS1234, IACS (as in Signature Utility).
- EPD: First iteration = "discount present" on receipt detail; optional later = pre-seeded invoice with known date for exact EPD amount.

---

## Documentation Updates

- docs/modules/finance/cash-receipts/test-cases.md: Added VAN Auto Payment E2E section; updated coverage summary.
- docs/modules/finance/cash-receipts/knowledge.md: Added "VAN E2E" testing context (payload parity, UI paths, test data).

---

## Optional (Phase 3/4)

- **Phase 3 (Journal entries)**: Navigate to /finance/journal-entries, filter by UTR/receipt, assert JE types; implement when journal UI is stable.
- **Phase 4 (Dealer ledger, reports)**: Dealer ledger, Outstanding report, AR aging; add when needed and selectors stable.
