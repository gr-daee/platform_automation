# Finance — AR Aging — Test cases

## Automated (`e2e/features/finance/ar-aging/ar-aging.feature`)

| Test ID | Scenario | Status |
|---------|----------|--------|
| FIN-AR-TC-001 | AR Aging report page loads for authorized user | ✅ |
| FIN-AR-TC-002 | Dealer summary shows table or empty receivables message | ✅ |
| FIN-AR-TC-003 | User can switch Dealer Summary, Invoice Detail, and Snapshots tabs | ✅ |
| FIN-AR-TC-004 | Filters panel opens and closes from toolbar | ✅ |
| FIN-AR-TC-005 | Due date aging basis shows Not Due column after apply filters | ✅ (skips if no AR data) |
| FIN-AR-TC-006 | Dealer search with no match shows empty search message | ✅ |
| FIN-AR-TC-007 | Export Excel success when receivables exist | ✅ (skips if exports disabled) |
| FIN-AR-TC-008 | Export PDF success when receivables exist | ✅ (skips if exports disabled) |
| FIN-AR-TC-009 | User without AR aging access redirected (`@iacs-ed`) | ✅ (asserts `/restrictedUser` when RBAC denies; **skipped** if `iacs-ed` still has `finance_aging_reports` in tenant) |
| FIN-AR-TC-010 | Legacy `/finance/reports/ar-aging` redirects to canonical URL | ✅ |
| FIN-AR-TC-011 | Snapshots tab shows heading or empty state | ✅ |
| FIN-AR-TC-012 | Generate Snapshot dialog opens and cancels | ✅ |

## Run

```bash
npm run bdd:generate && npm run test:dev -- --grep "@FIN-AR-TC-"
```

## Data notes

- **TC-005, TC-007, TC-008** may **skip** when tenant has no outstanding receivables.
- **TC-009** requires `iacs-ed` credentials and `e2e/.auth/iacs-ed.json`.
