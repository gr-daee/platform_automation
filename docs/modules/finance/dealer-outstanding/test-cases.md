# Finance — Dealer Outstanding — Test cases

## Automated (`e2e/features/finance/dealer-outstanding/dealer-outstanding.feature`)

| Test ID | Scenario | Status |
|---------|----------|--------|
| FIN-DO-TC-001 | Dealer Outstanding report page loads for authorized user | ✅ |
| FIN-DO-TC-002 | Initial state prompts to load report when no data loaded | ✅ |
| FIN-DO-TC-003 | Load report completes with success feedback | ✅ |
| FIN-DO-TC-004 | After load summary shows gross and net labels when totals exist | ✅ |
| FIN-DO-TC-005 | Very high min outstanding filter yields zero dealers | ✅ |
| FIN-DO-TC-006 | Region filter dropdown lists All Regions option | ✅ |
| FIN-DO-TC-007 | Export CSV shows success when report has dealer rows | ✅ (skips if no rows) |
| FIN-DO-TC-008 | Export PDF shows success when report has dealer rows | ✅ (skips if no rows) |
| FIN-DO-TC-010 | Drill-down opens invoice details dialog with columns | ✅ (skips if no rows) |
| FIN-DO-TC-011 | Drill-down dialog can be closed | ✅ |
| FIN-DO-TC-020 | First dealer gross outstanding matches sum of invoice balances | ✅ (skips if no rows / no DB) |
| FIN-DO-TC-021 | First drill-down invoice balance matches database | ✅ (skips if no drill-down / no DB) |
| FIN-DO-TC-030 | First dealer net magnitude matches gross minus credit columns (≤₹10) | ✅ (skips if no rows) |
| FIN-DO-TC-031 | Unapplied Credits column header visible when dealer grid is shown | ✅ (skips if no grid) |
| FIN-DO-TC-040 | User without invoice access denied dealer outstanding URL (`@iacs-ed`) | ✅ (skips if RBAC allows) |

## Run

```bash
npm run bdd:generate && npm run test:dev -- --grep "@FIN-DO-TC-"
```

## Related

- Phased plan: [FEATURE-DEALER-OUTSTANDING-phased-plan.md](./FEATURE-DEALER-OUTSTANDING-phased-plan.md)
- Implementation: `docs/implementations/2026-03/IMPL-042_dealer-outstanding-e2e-phased.md`
