# Finance - Cash Receipts Test Cases

## Overview
Test inventory for Manual Cash Receipts, VAN API (validation/posting), Cash Receipt Application with EPD, and Tenant EPD Configuration. CSV source: Test Cases - VAN.csv (40 VAN scenarios). Priority subset automated first.

## Automated Tests (Target)

### Manual Cash Receipts
| Test ID | Scenario | Feature File | Status |
|---------|----------|---------------|--------|
| FIN-CR-TC-001 | Create manual cash receipt | manual-cash-receipts.feature | ✅ Automated |
| FIN-CR-TC-002 | Apply payment to invoice | manual-cash-receipts.feature | ✅ Automated |
| FIN-CR-TC-003 | Adjust EPD discount amount | manual-cash-receipts.feature | ✅ Automated |
| FIN-CR-TC-004 | Toggle EPD enabled/disabled | manual-cash-receipts.feature | ✅ Automated |
| FIN-CR-TC-005 | Apply payment to multiple invoices | manual-cash-receipts.feature | ✅ Automated |
| FIN-CR-TC-006 | Full application of cash receipt to invoice | manual-cash-receipts.feature | ✅ Automated |
| FIN-CR-TC-007 | Partial application of cash receipt to invoice | manual-cash-receipts.feature | ✅ Automated |
| FIN-CR-TC-008 | Partial then full application (multi-step) | manual-cash-receipts.feature | ✅ Automated |

### VAN API - Validation
| Test ID | CSV ID | Scenario | Feature File | Status |
|---------|--------|----------|---------------|--------|
| FIN-VAN-TC-001 | TC_ABP_01 | Valid VAN validation | van-api-validation.feature | ✅ Automated |
| FIN-VAN-TC-002 | TC_ABP_02 | Invalid VAN rejected | van-api-validation.feature | ✅ Automated |
| FIN-VAN-TC-003 | TC_ABP_03 | Invalid signature rejected | van-api-validation.feature | ✅ Automated |
| FIN-VAN-TC-004 | TC_ABP_04 | Inactive dealer VAN rejected | van-api-validation.feature | ✅ Automated |

### VAN API - Posting
| Test ID | CSV ID | Scenario | Feature File | Status |
|---------|--------|----------|---------------|--------|
| FIN-VAN-TC-005 | TC_ABP_05 | Posting with FIFO allocation | van-api-posting.feature | ✅ Automated |
| FIN-VAN-TC-006 | TC_ABP_06 | Unvalidated posting rejected | van-api-posting.feature | ✅ Automated |
| FIN-VAN-TC-007 | TC_ABP_07 | Duplicate UTR rejected | van-api-posting.feature | ✅ Automated |
| FIN-VAN-TC-008 | TC_ABP_08 | Amount mismatch rejected | van-api-posting.feature | ✅ Automated |

### VAN Auto Payment E2E (API + UI)
| Test ID | Scenario | Feature File | Status |
|---------|----------|---------------|--------|
| FIN-VAN-E2E-001 | Happy path - VAN payment then verify receipt and invoice in UI | van-auto-payment-e2e.feature | ✅ Automated |
| FIN-VAN-E2E-002 | EPD verification - VAN payment then verify EPD on receipt detail | van-auto-payment-e2e.feature | ✅ Automated |
| FIN-VAN-E2E-003 | Un-apply then re-apply receipt (Phase 5 regression) | van-auto-payment-e2e.feature | ✅ Automated |

### VAN EPD & FIFO
| Test ID | CSV ID | Scenario | Feature File | Status |
|---------|--------|----------|---------------|--------|
| FIN-VAN-TC-014 | TC_ABP_14-17 | EPD discount calculated for VAN payment | van-epd-discount.feature | ✅ Automated |
| FIN-VAN-TC-015 | TC_ABP_16 | VAN payment allocated FIFO when no EPD | van-epd-discount.feature | ✅ Automated |
| FIN-VAN-TC-023 | TC_ABP_24 | Overpayment creates advance | van-fifo-allocation.feature | ✅ Automated |
| FIN-VAN-TC-024 | TC_ABP_25 | No invoices creates full advance | van-fifo-allocation.feature | ✅ Automated |

*Note: FIFO allocation order (TC_ABP_23) covered by van-api-posting FIN-VAN-TC-005. Redundant TC-023 removed; van-epd-discount consolidated from 4 to 2 scenarios (IMPL-030 cleanup).*

### EPD Configuration
| Test ID | Scenario | Feature File | Status |
|---------|----------|---------------|--------|
| FIN-EPD-TC-001 | Configure EPD approach | epd-configuration.feature | ✅ Automated |
| FIN-EPD-TC-002 | Configure EPD formula | epd-configuration.feature | ✅ Automated |
| FIN-EPD-TC-003 | Add EPD slab | epd-configuration.feature | ✅ Automated |
| FIN-EPD-TC-004 | Verify EPD calculation | epd-configuration.feature | ✅ Automated |

## CSV Test ID Mapping (All 40)
- TC_ABP_01–04: Validation (see above).
- TC_ABP_05–08: Posting (see above).
- TC_ABP_09–13: Sender/IFSC (FIX-001).
- TC_ABP_14–19: EPD (see above + partial, no slabs).
- TC_ABP_20–22: Journal/bank/Schedule III.
- TC_ABP_23–25: FIFO/advance (see above).
- TC_ABP_26–32: Security (debug, HMAC, XSS, SQLi).
- TC_ABP_33–40: Concurrency, expired VAN, reversal, fiscal, idempotency, etc.

## Coverage Summary
| Feature | Total | Automated | Pending |
|---------|--------|--------|---------|
| Manual Cash Receipts | 8 | 8 | 0 |
| VAN Validation | 4 | 4 | 0 |
| VAN Posting | 4 | 4 | 0 |
| VAN EPD | 2 | 2 | 0 |
| VAN FIFO/Advance | 2 | 2 | 0 |
| VAN Auto Payment E2E | 3 | 3 | 0 |
| EPD Configuration | 4 | 4 | 0 |
| **Total (priority)** | **23** | **23** | **0** |

*Implementation: IMPL-028 (Cash Receipts and VAN Payment Tests), IMPL-029 (VAN E2E Auto Payment), IMPL-030 (Redundant test cleanup).*

## EPD Dev Test Cases (Reference)

Dev document **EPD-TEST-CASES-AND-CONFIGURATION.md** defines 15 EPD calculation cases (TC-EPD-001–015) and 12 edge cases (E1–E12). Coverage mapping and gaps: see [EPD-COVERAGE-REVIEW.md](./EPD-COVERAGE-REVIEW.md).

## Blocked Tests & Corner Cases Plan

**Reference**: [EPD-BLOCKED-TESTS-PLAN.md](./EPD-BLOCKED-TESTS-PLAN.md) – Identifies 61 total scenarios:
- **27 from dev doc** (TC-EPD-001–015, E1–E12)
- **24 additional corner cases** (concurrency, reversal, integration, configuration, timezone, performance)
- **6 integration scenarios** (VAN + manual, advance + EPD, etc.)
- **4 performance/scale** scenarios

**Status**: 26 blocked (require dev work), 29 can automate now, 6 need clarification.

**High Priority Blocked**: Concurrent payments (CC-001), Reversal with EPD (CC-005), Over-settlement protection (TC-EPD-005), Zero outstanding (TC-EPD-011), Payment validation (E1/E2/E3).
