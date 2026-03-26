# Finance - Dealer Ledger - Gap Analysis

| Gap ID | Description | Priority | Resolution |
|--------|-------------|----------|------------|
| GAP-FIN-DL-P0-001 | No dedicated Dealer Ledger E2E (only O2C tail) | P0 | ✅ FIN-DL-TC-001–003 (IMPL-037) |
| GAP-FIN-DL-P1-001 | Date range filter behaviour not asserted | P1 | ✅ FIN-DL-TC-004 (IMPL-038) |
| GAP-FIN-DL-P1-002 | Export CSV success path not asserted | P1 | ✅ FIN-DL-TC-005 (IMPL-038); PDF ✅ FIN-DL-TC-009–010 (IMPL-039) |
| GAP-FIN-DL-P1-003 | Transaction type filter not asserted | P1 | ✅ FIN-DL-TC-006 (IMPL-038); search/sort ✅ FIN-DL-TC-011–012 (IMPL-039) |
| GAP-FIN-DL-P1-004 | Deep links from document number not asserted | P1 | ✅ FIN-DL-TC-007 invoice (IMPL-038); payment/credit ✅ FIN-DL-TC-013–014 (IMPL-039) |
| GAP-FIN-DL-P2-001 | VAN + AR aging cards not asserted | P2 | ✅ Optional smoke FIN-DL-TC-015–016 (IMPL-039); data-dependent |
| GAP-FIN-DL-P2-002 | RBAC deny path (`dealer_ledger` read) not automated | P2 | ✅ FIN-DL-TC-008 `@iacs-ed` + project `iacs-ed` (IMPL-039) |
