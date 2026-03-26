# EPD Test Coverage Review

**Source**: `EPD-TEST-CASES-AND-CONFIGURATION.md` (dev – DAE-261, Feb 2026)  
**Purpose**: Map dev EPD scenarios to automation and identify gaps.  
**Date**: 2026-02-18

---

## 1. Summary

| Category | Dev Doc Scenarios | Covered | Partial | Not Covered |
|----------|-------------------|---------|---------|------------|
| **EPD Calculation (TC-EPD-001–015)** | 15 | 0 | 4 | 11 |
| **Edge Cases (E1–E12)** | 12 | 0 | 0 | 12 |
| **EPD Config UI (Part 3)** | 1 flow | 0 | 1 | 0 |
| **VAN EPD (existing)** | 4 | 4 | 0 | 0 |
| **Total** | **32** | **4** | **5** | **23** |

- **Covered**: Scenario is implemented with equivalent steps/assertions.
- **Partial**: Some aspect covered (e.g. flow only, no exact formula/amount check).
- **Not Covered**: No automated scenario yet.

---

## 2. EPD Calculation Test Cases (Part 5) – Dev TC-EPD-001 to TC-EPD-015

| Dev ID | Scenario | Expected (from doc) | Our Automation | Status |
|--------|----------|---------------------|----------------|--------|
| **TC-EPD-001** | Basic EPD (SIMPLE formula) | Discount = Payment × Rate; e.g. ₹42,375 × 9% = ₹3,813.75 | No scenario with invoice/payment dates, SIMPLE formula, and exact amount assertion | ❌ Not Covered |
| **TC-EPD-002** | GROSS_UP formula | Discount = Payment × Rate / (1 − Rate); e.g. ₹4,189.84 | No scenario for GROSS_UP or exact amount | ❌ Not Covered |
| **TC-EPD-003** | TOTAL_AMOUNT calculation base | Eligible ratio 1.0; Discount = ₹50,000 × 9% = ₹4,500 | No scenario for calculation_base = TOTAL_AMOUNT | ❌ Not Covered |
| **TC-EPD-004** | Max discount capping (GAP-4) | Cap at 5%; Capped = ₹2,118.75 | No scenario for max_discount_percentage cap | ❌ Not Covered |
| **TC-EPD-005** | Over-settlement protection | Block if Payment + Discount > Outstanding; max payment = Outstanding / (1 + Rate) | No scenario for over-settlement block | ❌ Not Covered |
| **TC-EPD-006** | Full settlement at max payment | Pay ₹92,592.59 → discount ₹7,407.41 → balance ₹0 | No scenario for “full settlement at max” | ❌ Not Covered |
| **TC-EPD-007** | Slab boundary testing | Days 0,1,15,16,30,31,90,91,116 → correct slab/rate | No scenario for day boundaries | ❌ Not Covered |
| **TC-EPD-008** | SETTLEMENT_DISCOUNT (embedded) | No CCN; Dr Bank (net), Dr EPD Expense, Cr Debtors | FIN-EPD-TC-001 uses “reduce_outstanding”; no journal/approach assertion | ⚠️ Partial |
| **TC-EPD-009** | CCN_PER_PAYMENT | Full payment + CCN for discount | FIN-EPD-TC-001 can select approach; no CCN creation assertion | ⚠️ Partial |
| **TC-EPD-010** | Partial payment multiple times | 3 payments, different slabs, cumulative ≤ outstanding | FIN-CR-TC-005 applies to 2 invoices; no 3-instalment same-invoice + slab check | ❌ Not Covered |
| **TC-EPD-011** | Zero outstanding (already paid) | EPD = 0; “Invoice already fully paid” | No scenario | ❌ Not Covered |
| **TC-EPD-012** | Payment date before invoice date | No EPD; “Payment date cannot be before invoice date” | No scenario | ❌ Not Covered |
| **TC-EPD-013** | GSTIN silo validation | Different state GSTIN → EPD not applicable | No scenario | ❌ Not Covered |
| **TC-EPD-014** | Credit note invoice | EPD not applicable on credit notes | No scenario | ❌ Not Covered |
| **TC-EPD-015** | FULL_SETTLEMENT eligibility mode | Partial payment → EPD disabled | No scenario | ❌ Not Covered |

---

## 3. Edge Cases (Part 7 – E1–E12)

| Dev ID | Scenario | Expected | Our Automation | Status |
|--------|----------|----------|----------------|--------|
| E1 | Payment = 0 | Reject – “Payment must be > 0” | None | ❌ Not Covered |
| E2 | Payment < 0 | Reject – Invalid amount | None | ❌ Not Covered |
| E3 | Invoice already cancelled | Reject – “Cannot pay cancelled invoice” | None | ❌ Not Covered |
| E4 | Invoice is draft | Reject – “Cannot pay draft invoice” | None | ❌ Not Covered |
| E5 | No slabs configured | 0% discount (graceful) | None | ❌ Not Covered |
| E6 | Slab effective_to expired | Use next valid slab or 0% | None | ❌ Not Covered |
| E7 | Multiple valid slabs (overlap) | Use first matching (lowest days_from) | None | ❌ Not Covered |
| E8 | Discount > Outstanding | Cap discount at outstanding | None | ❌ Not Covered |
| E9 | Rounding precision | Round to 2 decimal places | None | ❌ Not Covered |
| E10 | Very large payment (>10Cr) | No overflow | None | ❌ Not Covered |
| E11 | Fractional percentage (e.g. 8.5%) | Correct calculation | None | ❌ Not Covered |
| E12 | Same day payment (day 0) | Slab includes day 0 or not | None | ❌ Not Covered |

---

## 4. EPD Configuration UI (Part 3)

| Dev Doc | Description | Our Automation | Status |
|---------|-------------|----------------|--------|
| 3.1 | Navigate to **Finance → EPD Settings** (`/finance/epd-settings`) | We use `/tools/epd-calculator` and `/finance/payment-terms`. Web app has `/finance/epd-configuration`. | ⚠️ Partial (different route/scope) |
| 3.2 | Configure: Calculation Base, Formula, Approach, Max %, Eligibility, Expense GL | FIN-EPD-TC-001/002: approach and formula on calculator only; no EPD Settings page POM | ⚠️ Partial |
| 3.3 | Slabs: add / edit / deactivate | FIN-EPD-TC-003: add slab on payment-terms; no edit/deactivate | ⚠️ Partial |

**Note**: Dev doc says “EPD Settings” at `/finance/epd-settings`; app has `epd-configuration` at `/finance/epd-configuration`. Align naming/route in automation if dev standard is `epd-settings`.

---

## 5. What We Do Cover

| Our Test ID | Feature File | What We Cover |
|-------------|--------------|----------------|
| FIN-EPD-TC-001 | epd-configuration.feature | Select EPD approach (reduce_outstanding) on calculator; assert EPD result (e.g. 0). |
| FIN-EPD-TC-002 | epd-configuration.feature | EPD formula path (calculate for two dates); assert EPD amount. |
| FIN-EPD-TC-003 | epd-configuration.feature | Add one EPD slab (0–7 days, 2%) on payment terms; assert slab visible. |
| FIN-EPD-TC-004 | epd-configuration.feature | Tenant has approach + slabs; run calculation; assert EPD. |
| FIN-VAN-TC-014–017 | van-epd-discount.feature | VAN posting → EPD applied; “EPD discount calculated correctly” (DB); “FIFO” / “taxable only” at flow level. |
| FIN-CR-TC-003, 004 | manual-cash-receipts.feature | Apply cash receipt with EPD amount; toggle EPD; assert allocation/EPD on UI. |

So we cover: **high-level EPD config (approach, formula, slab add)**, **VAN EPD flow**, and **manual apply with EPD**, but **not** the 15 detailed calculation cases (exact amounts, SIMPLE vs GROSS_UP, base, cap, over-settlement, boundaries) or the 12 edge cases.

---

## 6. Gaps vs Dev Scenarios

1. **No formula/amount-level EPD tests**  
   Dev TC-EPD-001 to TC-EPD-007 and TC-EPD-010 need: fixed tenant settings, fixed invoice (or test data), payment amount and dates, then assert **exact discount and settlement** (and optionally DB via verification query in doc).

2. **No tenant-setting-driven scenarios**  
   No tests that set/assert: `epd_calculation_base`, `epd_partial_payment_formula`, `epd_discount_approach`, `epd_max_discount_percentage`, `epd_eligibility_mode` and then verify behaviour (TC-EPD-002, 003, 004, 008, 009, 015).

3. **No negative/validation EPD tests**  
   TC-EPD-011, 012, 013, 014 and E1–E12 (zero/negative payment, cancelled/draft invoice, no slabs, GSTIN, credit note, FULL_SETTLEMENT, etc.) are not automated.

4. **EPD Settings page**  
   Dev specifies “EPD Settings” at `/finance/epd-settings`; we use calculator + payment-terms and do not have a dedicated POM for `/finance/epd-configuration` (or epd-settings) with all settings in 3.2.

5. **Slab boundaries and edge cases**  
   TC-EPD-007 (day boundaries) and E5–E12 (no slabs, expiry, overlap, cap, rounding, large amount, fractional %, day 0) are not covered.

---

## 7. Recommendations

### 7.1 High priority (align with dev cases)

- **Add a dedicated EPD calculation feature** (e.g. `epd-calculation.feature`) that implements:
  - **TC-EPD-001**: SIMPLE formula, TAXABLE_AMOUNT base, fixed invoice/payment (e.g. doc example), assert discount = ₹3,813.75 (and settlement) via UI or DB.
  - **TC-EPD-002**: GROSS_UP formula, same data, assert discount = ₹4,189.84.
  - **TC-EPD-004**: Max discount cap 5%, assert capped discount (e.g. ₹2,118.75).
  - **TC-EPD-006**: Full settlement at max payment, assert balance 0.
- **Use dev verification queries** in `EPD-TEST-CASES-AND-CONFIGURATION.md` (e.g. Part 6.3) in step definitions for Sandwich-style checks (e.g. `cash_receipt_applications.discount_taken`, `application_date`, `days_from_invoice`).

### 7.2 Medium priority

- **TC-EPD-005** (over-settlement protection): Assert that application is blocked when payment + discount would exceed outstanding; optional assertion on max allowed payment.
- **TC-EPD-007** (slab boundaries): Scenario Outline with examples for days 0, 1, 15, 16, 30, 31, 90, 91, 116 and expected slab/rate (or discount).
- **TC-EPD-010** (partial payment 3×): One invoice, three payments with different dates/slabs; assert each discount and cumulative settlement ≤ outstanding.
- **EPD Settings POM**: Add page object for `/finance/epd-configuration` (or `/finance/epd-settings` once route is confirmed), with methods to set Calculation Base, Formula, Approach, Max %, Eligibility, Expense GL; then add scenarios that configure and verify (e.g. TC-EPD-008/009 at UI level).

### 7.3 Lower priority (edge cases)

- **TC-EPD-011, 012, 013, 014, 015**: One scenario each for “already paid”, “payment date before invoice”, “GSTIN mismatch”, “credit note”, “FULL_SETTLEMENT mode” with expected message or EPD = 0.
- **E1–E12**: Add scenarios for payment 0/negative (E1–E2), cancelled/draft invoice (E3–E4), no slabs (E5), rounding (E9), and optionally E6–E8, E10–E12 as time allows.

### 7.4 Alignment with dev doc

- Confirm with dev whether the EPD UI route is **`/finance/epd-settings`** or **`/finance/epd-configuration`** and use that in automation.
- Reuse **setting keys** from doc (`epd_calculation_base`, `epd_partial_payment_formula`, `epd_discount_approach`, etc.) in DB helpers and test data so config-driven scenarios match Part 2.
- Add **EPD-TEST-CASES-AND-CONFIGURATION.md** (or a short reference) to `docs/modules/finance/cash-receipts/` and link from `knowledge.md` and `test-cases.md` so all EPD scenarios (dev + automation) are traceable.

---

## 8. Reference: Dev Doc Structure

- **Part 1**: Prerequisites (tables, invoice fields, system module).
- **Part 2**: EPD configuration via SQL (tenant_settings, epd_discount_slabs).
- **Part 3**: EPD configuration via Admin UI (Finance → EPD Settings).
- **Part 4**: Setting combinations and formula reference (SIMPLE, GROSS_UP).
- **Part 5**: Test cases TC-EPD-001 to TC-EPD-015.
- **Part 6**: Verification queries (settings, slabs, applications, audit).
- **Part 7**: Edge cases E1–E12.
- **Part 8**: Test execution checklist.
- **Appendix A**: Sample test invoice SQL.

---

**Conclusion**: The dev EPD document defines **15 calculation test cases** and **12 edge cases** with clear preconditions, formulas, and expected amounts. Current automation covers **high-level EPD config**, **VAN EPD flow**, and **manual apply with EPD**, but **does not** cover the detailed TC-EPD-001–015 (exact amounts, SIMPLE/GROSS_UP, base, cap, over-settlement, boundaries) or E1–E12. Adding an **EPD calculation feature** with dev-aligned data and verification queries, plus **EPD Settings** POM and negative/edge scenarios, will bring coverage in line with the shared test cases.
