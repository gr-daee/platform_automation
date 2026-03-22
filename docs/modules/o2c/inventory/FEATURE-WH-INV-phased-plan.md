# FEATURE — Warehouse Inventory (WH-INV) phased E2E

**Route (current):** `/o2c/inventory`  
**Route (planned):** `/warehouses/inventory` — update `WarehouseInventoryPage.LIST_PATH` when product ships.

## Phase 1 — Shell & navigation (✅)

| ID | Focus |
|----|--------|
| WH-INV-TC-001 | Heading + subtitle |
| WH-INV-TC-002 | Analytics cards (Total Items, Low Stock, Total Allocated) |
| WH-INV-TC-003 | Default tab: search + Product column |
| WH-INV-TC-004 | Allocations tab (`Search allocations...` panel) |
| WH-INV-TC-005 | Analytics tab (dashboard / loading / empty) |
| WH-INV-TC-006 | Settings — Coming Soon |
| WH-INV-TC-007 | Search under 3 characters helper |
| WH-INV-TC-008 | Refresh completes; grid ready |

**Artifacts:** `e2e/features/o2c/inventory/warehouse-inventory.feature`, `e2e/src/pages/o2c/WarehouseInventoryPage.ts`, `e2e/src/steps/o2c/warehouse-inventory-steps.ts`

**Locator note:** Allocations title sits in a shadcn `CardTitle` (`div`); assert via **tabpanel** + **`Search allocations...`** instead of fragile `getByText('Inventory Allocations', { exact: true })`.

## Phase 2 — Filters, search ≥3, pagination (✅)

| ID | Focus |
|----|--------|
| WH-INV-TC-009 | Status filter **Low Stock** |
| WH-INV-TC-010 | Warehouse filter **Kurnook** (regex) + reset **All Warehouses** |
| WH-INV-TC-011 | Search **≥3** chars → summary shows `Search: "…"` |
| WH-INV-TC-012 | Single-char search → “Waiting for 3+ characters…” in summary |
| WH-INV-TC-013 | Next page (skips if `Page 1 of 1`) |
| WH-INV-TC-014 | Page size **25 per page** + footer `Showing X to Y` end ≤ 25 |
| WH-INV-TC-015 | Combined **Kurnook** + **In Stock** |

**Not automated (data/UI):** Zone dropdown often **empty** when inventory rows lack `zone_name`; **“Search limited to 300 items”** banner only when `hasMoreResults` from server.

**POM:** Combobox order on **Inventory Items** tabpanel — `nth(0)` warehouse, `nth(1)` zone, `nth(2)` status, `nth(3)` page size.

## Phase 3 — Actions & modals (next)

- Add Inventory entry point (modal open)
- Row operations from `InventoryTable` (as stable IDs allow)

## Deferred — Export / Import (no E2E work for now)

- **Export** / **Import** on the inventory header are **out of scope** until explicitly picked up again (file download/upload flows, loading disabled states).

## Phase 4 — Detail `/o2c/inventory/[id]`

- Navigation from list, core fields, back navigation

## Phase 5 — RBAC / multi-user

- Users without `inventory.read` (or equivalent) denied; document `@multi-user` + projects

## Run

```bash
npm run bdd:generate && npm run test:dev -- --project=iacs-md --grep "@WH-INV-TC-"
```
