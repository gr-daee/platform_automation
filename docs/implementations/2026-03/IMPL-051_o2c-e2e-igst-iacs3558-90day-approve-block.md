# IMPL-051 — O2C E2E: IACS3558 IGST + GG01 90-day unpaid block

| Field | Value |
|-------|--------|
| **ID** | IMPL-051 |
| **Date** | 2026-03-21 |
| **Module** | O2C |
| **Status** | ✅ Complete |

## Summary

- **O2C-E2E-TC-005**: Switched IGST E2E dealer from GG01 to **SRI HANUMAN AGENCIES** / **`IACS3558`** (search `IACS3558`); standard approve success; full path to **`getInvoiceItemsTaxSplit`** assertion.
- **O2C-E2E-TC-006**: **`findFirstDealerWithUnpaidInvoicesOlderThan90Days`** resolves any tenant dealer with old unpaid invoices; indent + **`toast.error`** when **Approve** is blocked by **`processApproval`** (`web_app`). **Skips** if no qualifying dealer.

## Files

- `e2e/features/o2c/o2c-e2e-indent-so-invoice.feature`
- `e2e/src/steps/o2c/o2c-e2e-steps.ts` (steps + removed GG01-only approval skip)
- `e2e/src/support/o2c-db-helpers.ts` (`findFirstDealerWithUnpaidInvoicesOlderThan90Days`, optional per-dealer helper `getUnpaidInvoicesOlderThan90DaysForDealerCode`)
- Docs: `docs/modules/o2c/knowledge.md`, `test-cases.md`, `gap-analysis.md`, `implementation-history.md`, `docs/test-cases/TEST_CASE_REGISTRY.md`

## Notes

- Product behavior: 90-day block runs on **approve**, not on **Process Workflow** (`processIndentWorkflow.ts` comment).
