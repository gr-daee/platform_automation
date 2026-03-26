# Finance - Credit Memos Gap Analysis

| Gap ID | Description | Priority | Resolution |
|--------|-------------|----------|------------|
| GAP-FIN-CM-P0-001 | Core create + partial apply flow not automated | P0 | ✅ Covered by FIN-CM-TC-001, FIN-CM-TC-002 |
| GAP-FIN-CM-P1-001 | Credit memo header/application integrity under-asserted | P1 | ✅ Covered by FIN-CM-TC-006 |
| GAP-FIN-CM-P1-002 | Invoice outstanding reduction by CM apply not explicitly validated | P1 | ✅ Covered by FIN-CM-TC-007 |
| GAP-FIN-CM-P0-002 | Full settlement behavior (one-shot and staged apply) not explicitly automated | P0 | ✅ Covered by FIN-CM-TC-003 and FIN-CM-TC-004 |
| GAP-FIN-CM-P1-003 | Full-settlement reconciliation not explicitly asserted | P1 | ✅ Covered by FIN-CM-TC-008 |
| GAP-FIN-CM-P1-004 | Cross-invoice application path (same customer) not explicitly automated | P1 | ✅ Covered by FIN-CM-TC-005 |
| GAP-FIN-CM-P1-005 | Transport allowance over-balance excess-to-advance path under-asserted | P1 | ✅ Covered by FIN-CM-TC-011 and FIN-CM-TC-012 |
| GAP-FIN-CM-P2-001 | Apply amount > credit_available not covered | P2 | ✅ Covered by FIN-CM-TC-013 |
| GAP-FIN-CM-P2-002 | RBAC deny path (`finance_credit_memos` read) not automated | P2 | ✅ FIN-CM-TC-022 (`@iacs-ed`; skip if ED has access) |
| GAP-FIN-CM-P2-002 | Apply amount ≤ 0 not covered | P2 | ✅ Covered by FIN-CM-TC-014 (disabled submit UX) |
| GAP-FIN-CM-P2-003 | Cross-customer apply guard not asserted at UI | P2 | ✅ Covered by FIN-CM-TC-015 |
| GAP-FIN-CM-P2-004 | Duplicate CM application to same invoice not covered | P2 | ✅ Covered by FIN-CM-TC-016 |
| GAP-FIN-CM-P2-005 | Non-transport CM over-invoice balance not covered | P2 | ✅ Covered by FIN-CM-TC-017 |
| GAP-FIN-CM-P1-006 | Post credit memo to GL not automated | P1 | ✅ Covered by FIN-CM-TC-018 |
| GAP-FIN-CM-P1-007 | Reverse CM application (UI + CM state) not automated | P1 | ✅ Covered by FIN-CM-TC-019 |
| GAP-FIN-CM-P2-006 | Reverse dialog reason required + cancel without DB change not asserted | P2 | ✅ Covered by FIN-CM-TC-020 |
| GAP-FIN-CM-P2-007 | Post-reversal application row (Reversed badge, no Reverse) not asserted | P2 | ✅ Covered by FIN-CM-TC-021 |
