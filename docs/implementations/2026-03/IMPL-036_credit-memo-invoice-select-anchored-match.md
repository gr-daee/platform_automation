# IMPL-036 - Credit Memo invoice Select anchored matching + FIFO sort stability

**Metadata**
- **ID**: IMPL-036
- **Date**: 2026-03-22
- **Module**: Finance / Credit Memos (E2E)
- **Type**: Bug fix (flaky / wrong-invoice selection)
- **Status**: Complete

---

## Problem
- **FIN-CM-TC-005** failed full-suite run: `beforeBalance - afterBalance` expected `50` but received a large negative delta (~`-105771`), indicating credit was applied to a **different** invoice than the DB context expected.
- Root cause: `getByRole('option', { name: new RegExp(invoiceNumber, 'i') })` matches the **first** option whose accessible name **contains** the string — ambiguous when one invoice number is a substring/prefix of another (e.g. `SI-1` vs `SI-10`).

## Fix
1. **`e2e/src/support/finance-select-helpers.ts`** — `selectOptionNameRegexForInvoiceNumber()` anchors to `^{invoice}\s+-\s+` (matches CM apply + new-CM original invoice SelectItem labels).
2. **`CreditMemoDetailPage.selectInvoice`** and **`NewCreditMemoPage.selectOriginalInvoice`** use the helper.
3. **`getOutstandingInvoicesForCustomer`** — `ORDER BY invoice_date ASC, invoice_number ASC` for deterministic FIFO when dates tie.

## Verification
```bash
npm run test:dev -- --grep "@FIN-CM-TC-005"
```
✅ Pass. Re-run full `@FIN-CM-TC-` suite recommended before release.

---

## Documentation
- [x] `docs/modules/finance/credit-memos/knowledge.md`
- [x] `docs/modules/finance/credit-memos/implementation-history.md`
- [x] `docs/test-cases/test-impact-matrix.md`
