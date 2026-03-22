# Finance - Cash Receipts Implementation History

## Overview
Links to implementation documents for Cash Receipts (Manual and VAN) test automation.

## Implementations
| IMPL | Date | Scope | Link |
|------|------|--------|------|
| IMPL-028 | 2026-02 | Cash Receipts + VAN tests (24 scenarios) | [IMPL-028_cash-receipts-van-tests.md](../../implementations/2026-02/IMPL-028_cash-receipts-van-tests.md) |
| IMPL-031 | 2026-03 | Integrity + negative pack (manual validation + VAN lifecycle) | [IMPL-031_cash-receipts-integrity-negative-pack.md](../../implementations/2026-03/IMPL-031_cash-receipts-integrity-negative-pack.md) |

## Statistics
- Manual cash receipt scenarios: 12 (FIN-CR-TC-001–012)
- VAN scenarios (validation/posting/E2E/integrity): 12 (FIN-VAN-TC-001–008, 010–012, 014–015, 023–024)
- EPD configuration scenarios: 4 (FIN-EPD-TC-001–004)
- Page Objects: CashReceiptsPage, CashReceiptDetailPage, CashReceiptApplyPage, VANPaymentsPage, PaymentTermsPage, EPDCalculatorPage
- Support: van-api-client, finance-db-helpers, finance-test-data
