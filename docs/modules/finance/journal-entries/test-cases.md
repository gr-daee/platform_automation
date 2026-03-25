# Journal entries & GL posting — Test inventory

Implements **IMPL-055** (posting profiles + fiscal periods + JE chains).

## Feature files

| File | IDs (prefix) |
|------|----------------|
| `e2e/features/finance/journal-entries/manual-je.feature` | FIN-JE-TC-001–007 |
| `e2e/features/finance/journal-entries/invoice-je.feature` | FIN-INV-TC-*, FIN-INVC-TC-* |
| `e2e/features/finance/journal-entries/cash-receipt-je.feature` | FIN-CR-TC-030–035, FIN-VAN-TC-030–034 |
| `e2e/features/finance/journal-entries/cr-application-je.feature` | FIN-ACR-TC-001–007 |
| `e2e/features/finance/journal-entries/ccn-je.feature` | FIN-CCN-*, FIN-CCNA-*, FIN-CCNR-* |
| `e2e/features/finance/journal-entries/cr-reversal-je.feature` | FIN-CRR-*, FIN-UDCR-* |
| `e2e/features/finance/journal-entries/sales-return-je.feature` | FIN-SR-TC-* |

## Steps & POMs

- `e2e/src/steps/finance/journal-entry-steps.ts` — manual + invoice JE
- `e2e/src/steps/finance/finance-je-posting-chain-steps.ts` — cash receipt / apply / CCN / reversal / SR GL assertions
- `e2e/src/pages/finance/JournalEntriesPage.ts`

## DB helpers

`e2e/src/support/finance-db-helpers.ts` — `getResolvedGLAccount`, `getJournalEntryLines`, `getJournalEntryHeadersBySourceDocumentId`, `waitCashReceiptGlJournalId`, fiscal period lookups, etc.

## Run

```bash
npm run test:dev -- --grep "@FIN-"
```
