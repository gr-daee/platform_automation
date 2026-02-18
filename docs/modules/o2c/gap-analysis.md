# O2C Module - Gap Analysis

**Last Updated**: 2026-02-16
**Module**: Order-to-Cash (O2C)
**Overall Coverage**: Indent flow 20/20 automated (TC-001–TC-020); system E2E (Indent→SO→Invoice→Ledger) covered by O2C-E2E-TC-001; individual SO/Invoice scenarios not yet automated.

---

## Summary

Tracks test coverage gaps for the Order-to-Cash module, including indents, orders, dealers, and products. **Indent scenarios** are fully automated (TC-001–TC-020). Gaps below focus on SO, Invoice, and future indent edge cases.

---

## Coverage Metrics

| Category | Total Scenarios | Covered | Gaps | Coverage % |
|----------|----------------|---------|------|------------|
| Indent (TC-001–TC-020) | 20 | 20 | 0 | 100% |
| Happy Path (indent) | 6 | 6 | 0 | 100% |
| Negative / Dealer Search | 4 | 4 | 0 | 100% |
| State Transitions / Approval | 6 | 6 | 0 | 100% |
| Transporter / Credit / Stock | 4 | 4 | 0 | 100% |
| Sales Order (O2C-SO-TC-*) | 11 | 0 | 11 | 0% |
| Invoice (O2C-INV-TC-*) | 13 | 0 | 13 | 0% |
| System E2E (O2C-E2E-TC-001) | 1 | 1 | 0 | 100% |
| **Indent total** | **20** | **20** | **0** | **100%** |

---

## Priority 0 Gaps (Critical - Block Release)

*None open for indent flow.* Approval workflow is covered by TC-012 (full straight path) and TC-015 (approval blocked 90+ days).

### ✅ GAP-O2C-P0-001: No test for indent approval workflow — Resolved
- **Resolved**: 2026-02-16
- **Resolution**: TC-012 (full straight path) includes approve with comments → Process Workflow → SO; TC-015 covers approval blocked when dealer has 90+ days overdue.
- **Status**: ✅ Resolved

### ✅ GAP-O2C-P0-002: No system E2E (Indent→SO→Invoice→Ledger) — Resolved
- **Resolved**: 2026-02-16
- **Resolution**: O2C-E2E-TC-001 in `e2e/features/o2c/o2c-e2e-indent-so-invoice.feature` covers full flow: DB note (inventory + dealer credit) → Indent (create, add product 1013, Kurnook, transporter Just In Time Shipper, approve, Process Workflow) → SO verification → eInvoice → Invoice PDF download → stock/dealer credit DB checks → Dealer Ledger invoice entry.
- **Status**: ✅ Resolved

---

## Priority 1 Gaps (High - Must Fix)

### GAP-O2C-P1-001: No test for duplicate indent name
- **Description**: System should prevent duplicate indent names
- **Impact**: High - Data integrity issue
- **Scenario**: User creates indent with name that already exists
- **Risk**: Database constraint violation, poor UX
- **Test ID Needed**: O2C-INDENT-TC-021 (next available)
- **Status**: 🔴 Open

### GAP-O2C-P1-002: No test for indent deletion
- **Description**: Delete functionality not covered
- **Impact**: High - Feature exists but not tested
- **Scenario**: User deletes draft indent, record should be soft-deleted
- **Risk**: Deletion could fail or hard-delete (data loss)
- **Test ID Needed**: O2C-INDENT-TC-021 (next available)
- **Status**: 🔴 Open

### GAP-O2C-P1-003: No test for order creation from approved indent
- **Description**: Order generation from indent not covered
- **Impact**: High - Key integration point
- **Scenario**: Approved indent should generate order automatically
- **Risk**: Integration broken, manual order creation required
- **Test ID Needed**: O2C-ORDER-TC-001
- **Status**: 🔴 Open
- **Notes**: Depends on order module implementation

### GAP-O2C-P1-004: No test for product stock validation
- **Description**: System should validate stock availability
- **Impact**: High - Business rule not enforced
- **Scenario**: User adds product with quantity > available stock
- **Risk**: Orders placed for unavailable products
- **Test ID Needed**: O2C-INDENT-TC-022 (next available)
- **Status**: 🔴 Open
- **Notes**: Check if feature implemented

---

## Priority 2 Gaps (Medium - Should Fix)

### GAP-O2C-P2-001: Boundary test - minimum quantity (1 unit)
- **Description**: No test for single unit quantity
- **Impact**: Medium - Edge case not validated
- **Scenario**: User orders 1 unit of product
- **Risk**: Minimum quantity validation may fail
- **Test ID Needed**: O2C-INDENT-TC-023 (next available)
- **Status**: 🔴 Open

### GAP-O2C-P2-002: Boundary test - maximum quantity (999 units)
- **Description**: No test for maximum allowed quantity
- **Impact**: Medium - Edge case not validated
- **Scenario**: User orders 999 units (max allowed)
- **Risk**: Maximum quantity validation may fail
- **Test ID Needed**: O2C-INDENT-TC-024 (next available)
- **Status**: 🔴 Open

### ✅ GAP-O2C-P2-003: No test for dealer filtering
- **Description**: Dealer dropdown filtering not tested
- **Impact**: Medium - UX feature not verified
- **Scenario**: User searches for dealer by name in dropdown
- **Risk**: Search functionality may break
- **Test ID Needed**: O2C-INDENT-TC-003, TC-007, TC-008
- **Status**: ✅ Resolved
- **Resolved**: 2026-02-16
- **Resolution**: TC-003 (search by name), TC-007 (by code), TC-008 (non-existent)
- **Implementation**: IMPL-027
- **Notes**: Covers dealer search in modal with server-side debounced search

### GAP-O2C-P2-004: No test for indent edit after submission
- **Description**: System should prevent editing submitted indents
- **Impact**: Medium - Business rule not enforced
- **Scenario**: User tries to edit indent in 'submitted' status
- **Risk**: Data integrity issue if edits allowed
- **Test ID Needed**: O2C-INDENT-TC-025 (next available)
- **Status**: 🔴 Open

---

## Priority 3 Gaps (Low - Nice to Have)

### GAP-O2C-P3-001: Unicode product names
- **Description**: No test for special characters in product names
- **Impact**: Low - Edge case
- **Scenario**: Product name contains emoji or special Unicode
- **Risk**: Display or database encoding issues
- **Test ID Needed**: O2C-INDENT-TC-026 (next available)
- **Status**: 🔴 Open

### GAP-O2C-P3-002: Large indent (100+ products)
- **Description**: Performance with large number of line items
- **Impact**: Low - Rare scenario
- **Scenario**: Indent has 100+ product lines
- **Risk**: UI slowness, timeout issues
- **Test ID Needed**: O2C-INDENT-TC-027 (next available)
- **Status**: 🔴 Open
- **Notes**: May be better suited for performance tests

### GAP-O2C-P3-003: Concurrent indent submission
- **Description**: Multiple users submitting same indent simultaneously
- **Impact**: Low - Rare race condition
- **Scenario**: Two users click submit button at exact same time
- **Risk**: Duplicate submissions or DB lock
- **Test ID Needed**: O2C-INDENT-TC-028 (next available)
- **Status**: 🔴 Open
- **Notes**: Requires complex test setup

---

## Known Issues (Not Test Gaps)

### ISSUE-O2C-001: Slow page load with 1000+ indents
- **Description**: Page takes 5+ seconds to load with large dataset
- **Impact**: Medium - Affects users with many indents
- **Type**: Performance issue (not E2E test scope)
- **Recommendation**: Add pagination or virtual scrolling
- **Status**: 🟡 Tracked in [JIRA-O2C-205]

### ISSUE-O2C-002: Product dropdown doesn't show SKU
- **Description**: Product selection only shows name, not SKU
- **Impact**: Low - UX enhancement
- **Type**: Feature request
- **Recommendation**: Add to product backlog
- **Status**: 🔴 Open

---

## Resolved Gaps (Historical Record)

### ✅ GAP-O2C-P0-001: No test for indent approval workflow
- **Resolved**: 2026-02-16
- **Resolution**: TC-012 (full straight path) and TC-015 (approval blocked 90+ days) cover approval flow
- **Notes**: Indent numbering consolidated to TC-001–TC-020

### ✅ GAP-O2C-P0-003: No test for indent creation
- **Resolved**: 2026-01-20
- **Resolution**: Created test O2C-INDENT-TC-001 (create + detail)
- **Implementation**: IMPL-005
- **Notes**: Covers basic indent creation with dealer and products

### ✅ GAP-O2C-P1-005: No validation for required fields
- **Resolved**: 2026-01-20
- **Resolution**: Covered by TC-010 (Submit disabled when no items), TC-011 (draft UI)
- **Implementation**: IMPL-005
- **Notes**: Covers empty draft, button visibility

### ✅ GAP-O2C-P2-003: No test for dealer filtering
- **Resolved**: 2026-02-04
- **Resolution**: TC-003 (search by name), TC-007 (search by code), TC-008 (non-existent dealer)
- **Implementation**: IMPL-027
- **Notes**: Covers dealer search in modal with server-side debounced search

---

## Out of Scope (Won't Fix)

### OOS-O2C-001: Credit limit validation
- **Reason**: Feature not yet implemented
- **Alternative**: Add when credit management module is built
- **Documented**: 2026-02-04

### OOS-O2C-002: Multi-currency support
- **Reason**: Single currency (INR) only in MVP
- **Alternative**: Add when multi-currency feature is developed
- **Documented**: 2026-02-04

---

## Gap Discovery Timeline

| Date | Gaps Opened | Gaps Closed | Net Change | Total Open Gaps |
|------|-------------|-------------|------------|----------------|
| 2026-01-20 | 25 | 0 | +25 | 25 |
| 2026-01-27 | 3 | 5 | -2 | 23 |
| 2026-02-04 | 1 | 2 | -1 | 22 |

**Trend**: 🟢 Improving (gaps closing slowly)

---

## Recommendations

### Immediate Actions
1. **Indent flow**: Complete (TC-001–TC-020). No open P0 gaps.
2. Address P1 gaps when scope allows: duplicate name (TC-021), deletion (TC-021), order creation (O2C-SO-TC-*), stock validation (TC-022).

### Short-Term
1. Add Sales Order E2E (e2e/features/o2c/sales-orders.feature) per master plan
2. Add boundary/edge tests (min/max quantity) if needed
3. Consider Sandwich Method (read-only DB) for indent create/status/SO per architect guidelines

### Long-Term
1. Invoice/eInvoice E2E (e2e/features/o2c/invoices.feature)
2. Multi-user scenarios (~30%) for RBAC/tenant isolation per persona

---

**Document Owner**: QA Lead
**Last Review**: 2026-02-16
**Next Review**: When SO/Invoice automation starts
