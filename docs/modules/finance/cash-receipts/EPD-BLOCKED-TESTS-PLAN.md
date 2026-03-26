# EPD Blocked Tests & Additional Corner Cases Plan

**Source**: `EPD-TEST-CASES-AND-CONFIGURATION.md` (DAE-261) + Code Analysis  
**Purpose**: Identify blocked tests (require dev work) and additional corner cases beyond dev doc  
**Date**: 2026-02-18  
**Status**: Planning for Dev Execution

---

## 1. Executive Summary

| Category | Count | Blocked | Can Automate Now | Needs Clarification |
|----------|-------|---------|------------------|-------------------|
| **Dev Doc Scenarios (TC-EPD-001–015, E1–E12)** | 27 | 8 | 19 | 0 |
| **Additional Corner Cases (Identified)** | 24 | 12 | 8 | 4 |
| **Integration Scenarios** | 6 | 4 | 2 | 0 |
| **Performance/Scale** | 4 | 2 | 0 | 2 |
| **Total** | **61** | **26** | **29** | **6** |

**Blocked Definition**: Test cannot run because:
- Feature/validation not implemented in code
- Error handling missing
- API/UI endpoint doesn't exist
- Database constraint/validation missing
- Configuration UI incomplete

---

## 2. Dev Doc Scenarios - Blocked Status

### 2.1 Blocked (Requires Dev Work)

| Test ID | Scenario | Block Reason | Dev Work Needed | Priority |
|---------|----------|--------------|-----------------|----------|
| **TC-EPD-005** | Over-settlement protection | Need validation to block Payment + Discount > Outstanding | Add validation in `applyCashReceiptToInvoices` action; return error with max allowed payment | P0 |
| **TC-EPD-011** | Zero outstanding (already paid) | Need check for balance = 0 and error message | Add validation: if `balance_amount <= 0`, return "Invoice already fully paid" | P0 |
| **TC-EPD-012** | Payment date before invoice date | Need date validation | Add check: if `payment_date < invoice_date`, return "Payment date cannot be before invoice date" | P1 |
| **TC-EPD-013** | GSTIN silo validation | Need GSTIN comparison logic | Add validation: compare payment GSTIN with invoice dealer GSTIN; if different state, EPD = 0 | P1 |
| **TC-EPD-014** | Credit note invoice | Need invoice type check | Add validation: if `invoice_type = 'credit_note'`, return "EPD not applicable on credit notes" | P1 |
| **E1** | Payment = 0 | Need amount validation | Add validation: if `amount <= 0`, return "Payment must be > 0" | P0 |
| **E2** | Payment < 0 | Need negative amount validation | Same as E1 (amount < 0 check) | P0 |
| **E3** | Invoice cancelled | Need status check | Add validation: if `invoice.status = 'cancelled'`, return "Cannot pay cancelled invoice" | P0 |

### 2.2 Can Automate Now (No Block)

| Test ID | Scenario | Notes |
|---------|----------|-------|
| TC-EPD-001 | Basic EPD (SIMPLE) | Formula exists; need test data + exact amount assertion |
| TC-EPD-002 | GROSS_UP formula | Formula exists; need test data + exact amount assertion |
| TC-EPD-003 | TOTAL_AMOUNT base | Setting exists; need test with `epd_calculation_base = TOTAL_AMOUNT` |
| TC-EPD-004 | Max discount cap | Setting exists; need test with `epd_max_discount_percentage` |
| TC-EPD-006 | Full settlement at max | Formula exists; need test with exact payment amount |
| TC-EPD-007 | Slab boundaries | Slabs exist; need Scenario Outline with day boundaries |
| TC-EPD-008 | SETTLEMENT_DISCOUNT | Approach exists; need journal entry verification |
| TC-EPD-009 | CCN_PER_PAYMENT | Approach exists; need CCN creation verification |
| TC-EPD-010 | Partial payment 3× | Flow exists; need 3 payments on same invoice |
| TC-EPD-015 | FULL_SETTLEMENT mode | Setting exists; need test with `epd_eligibility_mode = FULL_SETTLEMENT` |
| E4 | Invoice draft | Status check likely exists; verify error message |
| E5 | No slabs configured | Graceful degradation likely exists; verify 0% discount |
| E6 | Slab expired | `effective_to` field exists; verify next slab or 0% |
| E7 | Slab overlap | Multiple slabs exist; verify first matching (lowest days_from) |
| E8 | Discount > Outstanding | Cap logic likely exists; verify discount capped at outstanding |
| E9 | Rounding precision | Rounding exists; verify 2 decimal places |
| E10 | Very large payment | Need test with >10Cr; verify no overflow |
| E11 | Fractional percentage | Slab with 8.5% exists; verify calculation |
| E12 | Same day payment | Day 0 boundary; verify slab includes/excludes day 0 |

---

## 3. Additional Corner Cases (Beyond Dev Doc)

### 3.1 Concurrency & Race Conditions

| Case ID | Scenario | Block Reason | Dev Work Needed | Priority |
|---------|----------|--------------|-----------------|----------|
| **CC-001** | Concurrent payments on same invoice | Need optimistic locking or transaction isolation | Add row-level lock or version check in `applyCashReceiptToInvoices`; prevent double-application | P0 |
| **CC-002** | Payment applied while invoice being edited | Need conflict detection | Add `updated_at` check; if invoice modified during payment, reject or warn | P1 |
| **CC-003** | Slab configuration changed mid-payment | Need slab versioning or effective date check | Use `effective_from`/`effective_to` at payment time; don't use future slabs | P1 |
| **CC-004** | Tenant settings changed mid-payment | Need settings versioning | Use settings snapshot at payment time; don't apply mid-transaction changes | P2 |

### 3.2 Data Integrity & Reversal

| Case ID | Scenario | Block Reason | Dev Work Needed | Priority |
|---------|----------|--------------|-----------------|----------|
| **CC-005** | Reverse cash receipt with EPD | Need reversal logic for EPD discount | Add reversal action that reverses discount and updates invoice balance | P0 |
| **CC-006** | Partial reversal of EPD application | Need partial reversal support | Add ability to reverse specific `cash_receipt_applications` row; recalculate invoice balance | P1 |
| **CC-007** | CCN reversal when EPD approach = CCN | Need CCN reversal logic | If approach = CCN_PER_PAYMENT, reverse CCN when cash receipt reversed | P1 |
| **CC-008** | Invoice deleted after EPD applied | Need foreign key constraint or cascade | Add FK constraint or cascade delete; prevent orphaned `cash_receipt_applications` | P0 |
| **CC-009** | Dealer deleted after payment | Need FK constraint or soft delete | Add FK constraint or soft delete; prevent orphaned payments | P0 |

### 3.3 Integration Scenarios

| Case ID | Scenario | Block Reason | Dev Work Needed | Priority |
|---------|----------|--------------|-----------------|----------|
| **CC-010** | VAN payment + manual payment on same invoice | Need FIFO allocation across both | Ensure VAN and manual payments both use FIFO; no duplicate allocation | P0 |
| **CC-011** | EPD on advance payment (negative balance) | Need advance payment EPD logic | Define if EPD applies to advance; if yes, calculate discount on advance amount | P1 |
| **CC-012** | Multiple EPD applications on same invoice (different dates) | Need cumulative discount tracking | Track all EPD discounts; ensure total discount ≤ max cap across all applications | P1 |
| **CC-013** | EPD with APD (Additional Payment Discount) | Need APD + EPD interaction logic | Define if APD and EPD stack or are mutually exclusive; implement logic | P2 |
| **CC-014** | EPD on partial payment with existing advance | Need advance + EPD calculation | Calculate EPD on (payment + advance) or payment only; clarify business rule | P2 |
| **CC-015** | EPD on payment with GST adjustment | Need GST impact on EPD calculation | Clarify if EPD calculated before/after GST adjustment | P2 |

### 3.4 Configuration & Validation Edge Cases

| Case ID | Scenario | Block Reason | Dev Work Needed | Priority |
|---------|----------|--------------|-----------------|----------|
| **CC-016** | Invalid slab configuration (days_from > days_to) | Need validation on slab creation | Add validation: `days_from <= days_to`; reject invalid slabs | P1 |
| **CC-017** | Overlapping slabs (1-15 and 10-20) | Need overlap detection or priority | Add validation or define priority (first matching vs reject overlap) | P1 |
| **CC-018** | Max discount % > 100 | Need validation on max_discount_percentage | Add validation: `max_discount_percentage <= 100`; reject invalid | P1 |
| **CC-019** | Negative discount percentage in slab | Need validation on discount_percentage | Add validation: `discount_percentage >= 0`; reject negative | P1 |
| **CC-020** | EPD expense GL account doesn't exist | Need GL account validation | Add validation: verify GL account exists and is active; reject if invalid | P1 |
| **CC-021** | Tenant without EPD module enabled | Need module check | Add check: if `system_modules.module_name = 'epd-configuration'` not active, disable EPD | P1 |

### 3.5 Timezone & Date Edge Cases

| Case ID | Scenario | Block Reason | Dev Work Needed | Priority |
|---------|----------|--------------|-----------------|----------|
| **CC-022** | Payment date in different timezone | Need timezone handling | Use UTC or tenant timezone consistently; calculate days correctly | P2 |
| **CC-023** | Invoice date = payment date (same timestamp) | Need same-day logic | Define if day 0 counts as "1 day" or "0 days"; implement consistently | P2 |
| **CC-024** | Payment on fiscal year boundary | Need fiscal year awareness | Ensure EPD calculation uses correct fiscal year for slabs | P2 |
| **CC-025** | Leap year date calculation | Need leap year handling | Ensure Feb 29 handled correctly in days calculation | P3 |

### 3.6 Performance & Scale

| Case ID | Scenario | Block Reason | Dev Work Needed | Priority |
|---------|----------|--------------|-----------------|----------|
| **CC-026** | 1000+ invoices with EPD calculation | Need performance optimization | Add database indexes on `invoice_date`, `balance_amount`; optimize query | P2 |
| **CC-027** | Bulk payment application (100 invoices) | Need bulk operation support | Add bulk apply API or batch processing; prevent timeout | P2 |
| **CC-028** | Historical EPD audit query (1 year) | Need query optimization | Add indexes on `application_date`, `tenant_id`; paginate results | P2 |
| **CC-029** | Real-time EPD calculation on invoice list | Need caching or optimization | Cache EPD calculation or use background job; prevent UI lag | P2 |

---

## 4. Blocked Tests - Detailed Requirements

### 4.1 High Priority (P0) - Must Fix Before Production

#### CC-001: Concurrent Payments on Same Invoice
**Current State**: No locking mechanism; two users can apply payments simultaneously  
**Risk**: Double allocation, incorrect balance  
**Dev Work**:
```sql
-- Add version column or use SELECT FOR UPDATE
ALTER TABLE invoices ADD COLUMN version INTEGER DEFAULT 1;
-- In application code: SELECT ... FOR UPDATE NOWAIT
```
**Test**: Two users apply payment to same invoice simultaneously; verify only one succeeds or both fail gracefully.

#### CC-005: Reverse Cash Receipt with EPD
**Current State**: Reversal may not reverse EPD discount correctly  
**Risk**: Invoice balance incorrect after reversal  
**Dev Work**:
- Add reversal action that:
  1. Reverses `cash_receipt_applications` (set `is_reversed = true`)
  2. Recalculates invoice `balance_amount` (add back payment + discount)
  3. If CCN approach, reverse CCN
  4. Reverse journal entries
**Test**: Apply payment with EPD → Reverse → Verify invoice balance restored, CCN reversed (if applicable).

#### CC-008: Invoice Deleted After EPD Applied
**Current State**: No FK constraint; orphaned applications possible  
**Risk**: Data integrity violation  
**Dev Work**:
```sql
-- Add FK constraint with CASCADE or RESTRICT
ALTER TABLE cash_receipt_applications
ADD CONSTRAINT fk_invoice FOREIGN KEY (invoice_id)
REFERENCES invoices(id) ON DELETE RESTRICT;
```
**Test**: Apply EPD → Attempt to delete invoice → Verify deletion blocked or applications cascade deleted.

#### TC-EPD-005: Over-Settlement Protection
**Current State**: No validation; payment + discount can exceed outstanding  
**Risk**: Negative balance, incorrect accounting  
**Dev Work**:
```typescript
// In applyCashReceiptToInvoices action
const maxPayment = outstanding / (1 + discountRate);
if (paymentAmount > maxPayment) {
  throw new Error(`Over-settlement detected. Max payment allowed: ${maxPayment}`);
}
```
**Test**: Payment + calculated discount > outstanding → Verify error with max allowed payment.

#### TC-EPD-011: Zero Outstanding (Already Paid)
**Current State**: No check; EPD calculated on paid invoice  
**Risk**: Incorrect discount on already paid invoice  
**Dev Work**:
```typescript
if (invoice.balance_amount <= 0) {
  return { discount: 0, error: "Invoice already fully paid" };
}
```
**Test**: Apply payment to invoice with balance = 0 → Verify EPD = 0, error message shown.

#### E1/E2: Payment = 0 or < 0
**Current State**: May allow zero/negative amounts  
**Risk**: Invalid transactions  
**Dev Work**:
```typescript
if (paymentAmount <= 0) {
  throw new Error("Payment must be > 0");
}
```
**Test**: Payment = 0 or < 0 → Verify error "Payment must be > 0".

#### E3: Invoice Cancelled
**Current State**: May allow payment on cancelled invoice  
**Risk**: Payment on invalid invoice  
**Dev Work**:
```typescript
if (invoice.status === 'cancelled') {
  throw new Error("Cannot pay cancelled invoice");
}
```
**Test**: Attempt payment on cancelled invoice → Verify error "Cannot pay cancelled invoice".

### 4.2 Medium Priority (P1) - Should Fix Soon

#### CC-002: Payment Applied While Invoice Edited
**Dev Work**: Add `updated_at` check; if invoice modified during payment, reject or warn.  
**Test**: User A edits invoice → User B applies payment simultaneously → Verify conflict detected.

#### CC-006: Partial Reversal of EPD Application
**Dev Work**: Add ability to reverse specific `cash_receipt_applications` row; recalculate invoice balance.  
**Test**: Apply payment to 3 invoices → Reverse one application → Verify only that invoice balance restored.

#### CC-010: VAN + Manual Payment on Same Invoice
**Dev Work**: Ensure VAN and manual payments both use FIFO; no duplicate allocation.  
**Test**: VAN payment allocates to invoice → Manual payment on same invoice → Verify FIFO order maintained.

#### TC-EPD-012: Payment Date Before Invoice Date
**Dev Work**: Add date validation; if `payment_date < invoice_date`, return error.  
**Test**: Payment date = 2026-01-01, Invoice date = 2026-01-05 → Verify error "Payment date cannot be before invoice date".

#### TC-EPD-013: GSTIN Silo Validation
**Dev Work**: Compare payment GSTIN with invoice dealer GSTIN; if different state, EPD = 0.  
**Test**: Payment GSTIN (27AAACR5055K1Z7) vs Invoice GSTIN (29AAACR5055K1Z5) → Verify EPD = 0, reason shown.

#### TC-EPD-014: Credit Note Invoice
**Dev Work**: If `invoice_type = 'credit_note'`, return "EPD not applicable on credit notes".  
**Test**: Attempt EPD on credit note invoice → Verify EPD = 0, error message shown.

#### CC-016 to CC-021: Configuration Validation
**Dev Work**: Add validations for invalid slabs, overlapping slabs, invalid max discount %, negative discount %, invalid GL account, module check.  
**Test**: Attempt to create invalid slab/config → Verify validation error.

### 4.3 Lower Priority (P2/P3) - Nice to Have

- CC-003, CC-004: Slab/settings versioning (P1)
- CC-007: CCN reversal (P1)
- CC-011 to CC-015: Integration scenarios (P1–P2)
- CC-022 to CC-025: Timezone/date edge cases (P2–P3)
- CC-026 to CC-029: Performance/scale (P2)

---

## 5. Test Execution Plan

### Phase 1: Unblock High Priority (P0) - Week 1
1. **Dev fixes**:
   - CC-001: Concurrent payment locking
   - CC-005: Cash receipt reversal with EPD
   - CC-008: Invoice deletion FK constraint
   - TC-EPD-005: Over-settlement validation
   - TC-EPD-011: Zero outstanding check
   - E1/E2: Payment amount validation
   - E3: Cancelled invoice check

2. **Automation**:
   - Create `epd-calculation-blocked.feature` for P0 blocked tests
   - Add step definitions for validation error assertions
   - Add DB helpers for concurrent payment simulation

### Phase 2: Unblock Medium Priority (P1) - Week 2
1. **Dev fixes**:
   - CC-002: Invoice edit conflict detection
   - CC-006: Partial reversal
   - CC-010: VAN + manual payment FIFO
   - TC-EPD-012, 013, 014: Date/GSTIN/Credit note validation
   - CC-016 to CC-021: Configuration validation

2. **Automation**:
   - Extend `epd-calculation-blocked.feature` with P1 scenarios
   - Add integration test for VAN + manual payment
   - Add configuration validation tests

### Phase 3: Additional Corner Cases (P2/P3) - Week 3+
1. **Dev fixes** (as time permits):
   - CC-003, CC-004: Versioning
   - CC-011 to CC-015: Integration scenarios
   - CC-022 to CC-025: Timezone/date
   - CC-026 to CC-029: Performance

2. **Automation**:
   - Add corner case scenarios as dev fixes complete
   - Performance tests (if needed)

---

## 6. Test Data Requirements for Blocked Tests

### 6.1 Test Invoices Needed
- Invoice with balance = 0 (TC-EPD-011)
- Cancelled invoice (E3)
- Draft invoice (E4)
- Credit note invoice (TC-EPD-014)
- Invoice with payment date before invoice date (TC-EPD-012)
- Invoice with different GSTIN state (TC-EPD-013)
- Invoice for concurrent payment test (CC-001)
- Invoice for reversal test (CC-005, CC-006)

### 6.2 Test Configurations Needed
- Tenant with `epd_max_discount_percentage = 5` (TC-EPD-004)
- Tenant with `epd_calculation_base = TOTAL_AMOUNT` (TC-EPD-003)
- Tenant with `epd_partial_payment_formula = GROSS_UP` (TC-EPD-002)
- Tenant with `epd_eligibility_mode = FULL_SETTLEMENT` (TC-EPD-015)
- Tenant with no slabs configured (E5)
- Tenant with overlapping slabs (E7, CC-017)
- Tenant with expired slab (E6)
- Tenant with fractional percentage slab (E11)

### 6.3 Test Payments Needed
- Payment = 0 (E1)
- Payment < 0 (E2)
- Payment > 10Cr (E10)
- Payment that causes over-settlement (TC-EPD-005)
- Payment for full settlement at max (TC-EPD-006)
- 3 partial payments on same invoice (TC-EPD-010)

---

## 7. Verification Queries for Blocked Tests

### 7.1 Concurrent Payment Check
```sql
-- Verify no duplicate allocations
SELECT invoice_id, COUNT(*) as allocation_count
FROM cash_receipt_applications
WHERE invoice_id = 'TEST_INVOICE_ID'
  AND is_reversed = false
GROUP BY invoice_id
HAVING COUNT(*) > 1;
-- Should return 0 rows
```

### 7.2 Reversal Verification
```sql
-- Verify reversal restored balance
SELECT 
  i.invoice_number,
  i.balance_amount,
  SUM(CASE WHEN cra.is_reversed THEN cra.amount_applied ELSE 0 END) as reversed_amount
FROM invoices i
LEFT JOIN cash_receipt_applications cra ON cra.invoice_id = i.id
WHERE i.invoice_number = 'TEST-INV-001'
GROUP BY i.id, i.invoice_number, i.balance_amount;
-- Verify balance_amount = original_outstanding - (applied - reversed)
```

### 7.3 Over-Settlement Check
```sql
-- Verify no over-settlement
SELECT 
  i.invoice_number,
  i.balance_amount,
  SUM(cra.amount_applied + cra.discount_taken) as total_settlement
FROM invoices i
JOIN cash_receipt_applications cra ON cra.invoice_id = i.id
WHERE i.invoice_number = 'TEST-INV-001'
  AND cra.is_reversed = false
GROUP BY i.id, i.invoice_number, i.balance_amount
HAVING SUM(cra.amount_applied + cra.discount_taken) > i.balance_amount;
-- Should return 0 rows
```

---

## 8. Next Steps

1. **Share with Dev Team**: Review blocked tests (Section 4) and prioritize P0 fixes
2. **Create Feature File**: `epd-calculation-blocked.feature` with P0 scenarios (after dev fixes)
3. **Add Step Definitions**: Validation error assertions, concurrent payment simulation
4. **Set Up Test Data**: Create test invoices/configurations per Section 6
5. **Execute Phase 1**: After P0 fixes, run blocked tests and verify
6. **Iterate**: Move to Phase 2 (P1) and Phase 3 (P2/P3) as dev fixes complete

---

**Document Owner**: Test Automation Team  
**Last Updated**: 2026-02-18  
**Next Review**: After Phase 1 completion
