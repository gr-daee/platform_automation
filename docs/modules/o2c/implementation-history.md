# O2C Module - Implementation History

**Last Updated**: 2026-03-24 (IMPL-054 O2C reports parity/city automation)

---

## Overview

This document tracks all test automation implementations for the Order-to-Cash (O2C) module. **Indent flow** is fully automated (TC-001–TC-020). **System E2E** scenarios **O2C-E2E-TC-001–TC-006** live in `o2c-e2e-indent-so-invoice.feature` (see [IMPL-045](../../implementations/2026-03/IMPL-045_o2c-e2e-backorder-eway-cancel.md), [IMPL-051](../../implementations/2026-03/IMPL-051_o2c-e2e-igst-iacs3558-90day-approve-block.md)). **Sales Returns** phases **SR-PH1–SR-PH7** are consolidated in [IMPL-053](../../implementations/2026-03/IMPL-053_sales-returns-consolidated.md) with unified feature `e2e/features/o2c/sales-returns/sales-returns.feature`.

---

## Implementations

### [IMPL-054 - O2C Reports parity and city export automation](../../implementations/2026-03/IMPL-054_o2c-reports-collection-hps-city-parity.md) ✅

- `O2C-CR-TC-001`–`005`: Collection Report quick period, KPI visibility, parity checks, export section coverage.
- `O2C-HPS-TC-001`–`004`: Hierarchical Product Sales dealer hierarchy + city in UI and detailed Excel sheets.
- `O2C-HSR-TC-029`: Hierarchical Sales By Dealer export city column assertion.

### [IMPL-051 - O2C E2E IACS3558 IGST + GG01 90-day approve block](../../implementations/2026-03/IMPL-051_o2c-e2e-igst-iacs3558-90day-approve-block.md) ✅

- **O2C-E2E-TC-005** (IACS3558 / SRI HANUMAN AGENCIES IGST path); **O2C-E2E-TC-006** (DB-resolved dealer, 90-day overdue toast at approve; conditional skip).

### [IMPL-053 - Sales Returns consolidated (SR-PH1-SR-PH7)](../../implementations/2026-03/IMPL-053_sales-returns-consolidated.md) ✅

- Consolidated Sales Returns into one feature (`sales-returns.feature`) and one implementation document.
- Coverage retained: list, filters, create wizard, detail/receipt, GRN inventory sandwich, credit memo/retry e-credit, validation/cancel, report access.

### [IMPL-045 - O2C E2E back order, e-invoice without e-way, cancel e-invoice](../../implementations/2026-03/IMPL-045_o2c-e2e-backorder-eway-cancel.md) ✅

- **O2C-E2E-TC-002**–**TC-004**: **TC-002** dynamic mixed indent (DB-resolved OOS + in-stock) → back order + full invoice path; **Generate E-Invoice Only**; IRN cancellation + invoice page `EInvoiceCancellation`.

### [IMPL-044 - Warehouse Inventory WH-INV Phase 2 E2E](../../implementations/2026-03/IMPL-044_warehouse-inventory-wh-inv-phase-2.md) ✅

- **WH-INV-TC-009**–**015**: filters, search summary, pagination, page size, combined filters (`@iacs-md`).

### [IMPL-043 - Warehouse Inventory WH-INV Phase 1 E2E](../../implementations/2026-03/IMPL-043_warehouse-inventory-wh-inv-phase-1.md) ✅

- **WH-INV-TC-001**–**008**: inventory list shell, tabs, search helper, refresh (`@iacs-md`).

### TC renumbering and consolidation (2026-02-16) ✅
- **Date**: 2026-02-16
- **Type**: Consolidation & renumbering
- **Status**: Complete
- **Tests**: O2C-INDENT-TC-001 through TC-020 in `e2e/features/o2c/indents.feature`
- **Gaps Resolved**: GAP-O2C-P0-001 (approval workflow)
- **Key Achievement**: Single source of truth for indent TC IDs; docs aligned

### [IMPL-027 - Dealer Search and Selection in Create Indent Modal](../../implementations/2026-02/IMPL-027_dealer-search-selection-modal.md) ✅
- **Date**: 2026-02-04
- **Type**: New Feature
- **Status**: Complete
- **Tests**: Now TC-003 (search by name), TC-007 (by code), TC-008 (non-existent dealer)
- **Gaps Resolved**: GAP-O2C-P2-003 (dealer filtering)
- **Key Achievement**: Dealer selection modal with server-side search

### [IMPL-005 - O2C Indent Creation Tests](../../implementations/2026-01/IMPL-005_o2c-indent-creation.md) ✅
- **Date**: 2026-01-20
- **Type**: New Feature
- **Status**: Complete
- **Tests**: Foundation for TC-001, TC-002, TC-004, TC-005
- **Key Achievement**: Foundation tests for indent management

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Indent scenarios automated | 20 (TC-001–TC-020) |
| Indent coverage | 100% (current scope) |
| SO / Invoice | Planned (see master plan) |

---

## Coverage Evolution

| Date | Indent | Notes |
|------|--------|-------|
| 2026-02-16 | 20/20 | TC-001–TC-020; consolidation complete |
| 2026-02-04 | — | Dealer search (TC-003, 007, 008) |
| 2026-01-20 | — | Foundation (create, submit) |

---

## Upcoming Implementations

### Backlog
- **SO E2E**: `e2e/features/o2c/sales-orders.feature` (O2C-SO-TC-001–011)
- **Invoice E2E**: `e2e/features/o2c/invoices.feature` (O2C-INV-TC-001–013)
- **Indent edge cases**: Duplicate name, deletion, edit-after-submit, boundary (see gap-analysis.md)

---

## Related Documents

- [Module Knowledge](knowledge.md)
- [Test Cases](test-cases.md)
- [Gap Analysis](gap-analysis.md)
- [All Implementations](../../implementations/)

---

**Maintained By**: QA Team
