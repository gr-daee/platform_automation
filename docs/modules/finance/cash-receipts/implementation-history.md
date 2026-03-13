# Finance - Cash Receipts Implementation History

## Overview
Links to implementation documents for Cash Receipts (Manual and VAN) test automation.

## Implementations
| IMPL | Date | Scope | Link |
|------|------|--------|------|
| IMPL-028 | 2026-02 | Cash Receipts + VAN tests (24 scenarios) | [IMPL-028_cash-receipts-van-tests.md](../../implementations/2026-02/IMPL-028_cash-receipts-van-tests.md) |

## Statistics
- Manual cash receipt scenarios: 5 (FIN-CR-TC-001–005)
- VAN API scenarios (validation + posting + EPD + FIFO): 16 (FIN-VAN-TC-001–008, 014–017, 023–025)
- EPD configuration scenarios: 4 (FIN-EPD-TC-001–004)
- Page Objects: CashReceiptsPage, CashReceiptDetailPage, CashReceiptApplyPage, VANPaymentsPage, PaymentTermsPage, EPDCalculatorPage
- Support: van-api-client, finance-db-helpers, finance-test-data
