# Finance - Cash Receipts Gap Analysis

## Gaps (Initial)

| Gap ID | Description | Priority | Resolution |
|--------|-------------|----------|------------|
| GAP-FIN-CR-P0-001 | VAN API tests not automated (40 CSV scenarios) | P0 | ✅ IMPL-028 (VAN API client + feature files) |
| GAP-FIN-CR-P0-002 | Manual cash receipt creation not tested | P0 | ✅ IMPL-028 (CashReceiptsPage, new flow) |
| GAP-FIN-CR-P0-003 | Cash receipt application flow not tested | P0 | ✅ IMPL-028 (Apply page, EPD steps) |
| GAP-FIN-CR-P1-001 | EPD configuration UI not tested | P1 | ✅ IMPL-028 (PaymentTermsPage, epd-configuration.feature) |
| GAP-FIN-CR-P1-002 | EPD calculation edge cases not covered | P1 | ✅ IMPL-028 (van-epd-discount, EPD formula tests) |

## Resolved Gaps
| Gap ID | Resolved In | Date |
|--------|-------------|------|
| GAP-FIN-CR-P0-001, P0-002, P0-003, P1-001, P1-002 | IMPL-028 | 2026-02 |

## Blocked Tests & Additional Corner Cases

**Reference**: `EPD-BLOCKED-TESTS-PLAN.md` – Comprehensive plan for 61 scenarios (27 from dev doc + 24 additional corner cases + 6 integration + 4 performance).

**Summary**:
- **26 blocked tests** require dev work (P0: 8, P1: 12, P2/P3: 6)
- **29 tests** can be automated now (no block)
- **6 tests** need clarification

**High Priority Blocked (P0)**:
- CC-001: Concurrent payments on same invoice (locking needed)
- CC-005: Cash receipt reversal with EPD (reversal logic needed)
- CC-008: Invoice deletion FK constraint (data integrity)
- TC-EPD-005: Over-settlement protection (validation needed)
- TC-EPD-011: Zero outstanding check (validation needed)
- E1/E2: Payment amount validation (validation needed)
- E3: Cancelled invoice check (validation needed)

**See**: `EPD-BLOCKED-TESTS-PLAN.md` for detailed requirements, dev work needed, test data, and execution plan.

## Notes
- EPD approach/formula and slabs are tenant-configurable; tests assume test tenant has known config or set up via test data.
- VAN tests require API credentials in .env.local (VAN_API_BASE_URL, VAN_API_KEY, VAN_SHARED_SECRET).
