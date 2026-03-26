# IMPL-045 — O2C E2E: Back order, E-Invoice without E-Way, Cancel E-Invoice

| Field | Value |
|--------|--------|
| **ID** | IMPL-045 |
| **Date** | 2026-03-21 |
| **Module** | O2C |
| **Type** | Test automation + UI wiring |
| **Status** | Done |

## Summary

Added **@O2C-E2E-TC-002** (dynamic **in-stock + OOS** pair at Kurnook via `resolveMixedIndentProductPairAtWarehouse`, mixed indent → back order + SO → full invoice/ledger), **TC-003** (e-invoice only, no e-way), **TC-004** (cancel IRN within 24h). Exposed **Cancel E-Invoice** on invoice detail (`InvoiceDetailsContent` + existing `EInvoiceCancellation`).

## New / updated artifacts

- `e2e/features/o2c/o2c-e2e-indent-so-invoice.feature` — three scenarios
- `e2e/src/steps/o2c/o2c-e2e-steps.ts` — steps + DB polling for cancellation
- `e2e/src/support/o2c-db-helpers.ts` — `resolveMixedIndentProductPairAtWarehouse`, `getBackOrdersByOriginalIndentId`, `getInvoiceIdWithRecentIrn`, `getInvoiceEinvoiceStatus`, `productHasNoSellableInventoryAtWarehouse`, exported `getE2ETenantId`
- `e2e/src/support/o2c-e2e-flow-helpers.ts` — `runO2CIndentThroughEInvoice` for TC-004 fallback
- `e2e/src/pages/o2c/O2CInventoryPage.ts`, `InvoiceDetailPage.ts` extensions
- `web_app/.../InvoiceDetailsContent.tsx` — render `EInvoiceCancellation` when IRN present and not cancelled

## Documentation

- `docs/modules/o2c/test-cases.md`, `knowledge.md`, `gap-analysis.md`
- `docs/test-cases/TEST_CASE_REGISTRY.md`, `test-impact-matrix.md`

## Risks

- **TC-002**: Needs DB data such that discovery (or fallbacks **1013/NPK**) yields one **positive net** and one **no sellable** material code at **Kurnook**; optional **`E2E_O2C_MIXED_IN_STOCK_CODE`** / **`E2E_O2C_MIXED_OUT_OF_STOCK_CODE`** to pin codes in CI.
- **TC-004**: Depends on **GST / edge function** accepting cancellation; may fail in sandbox misconfiguration.

## Verification

```bash
npm run bdd:generate
npm run test:dev -- --grep "@O2C-E2E-TC-002"
npm run test:dev -- --grep "@O2C-E2E-TC-003"
npm run test:dev -- --grep "@O2C-E2E-TC-004"
```
