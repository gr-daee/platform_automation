# O2C Inventory – Database Tables Reference

Reference for E2E test development: table names, columns, and data types used for inventory, product packages, and warehouses. Aligns with actual DB schema and sample data (e.g. product 1013, warehouse Kurnook).

**Use:** Resolving product by `product_code` / `material_code` / `package_code`, warehouse by name/code, and reading inventory (available_units, allocated_units) in read-only SELECTs.

---

## 1. `inventory`

Stores stock per product/variant package per warehouse (and optional bin). E2E reads `available_units`, `allocated_units`, and uses `product_id`, `product_variant_package_id`, `warehouse_id`, `tenant_id` for filtering.

| Column | Data type | Notes |
|--------|-----------|--------|
| `id` | uuid | PK |
| `product_id` | uuid | FK to product (e.g. master_products / products) |
| `product_variant_package_id` | uuid | FK to product_variant_packages; often used for inventory list key |
| `warehouse_id` | uuid | FK to warehouses |
| `tenant_id` | uuid | Tenant scope |
| `status` | text | e.g. `'available'`; filter with `(status = 'available' OR status IS NULL)` |
| `available_units` | numeric | Units available |
| `allocated_units` | numeric | Units allocated |
| `reserved_units` | numeric | Units reserved (optional) |
| `warehouse_location` | text | e.g. `'bin'` |
| `bin_id` | uuid | Optional |
| `batch_number` | text | Optional |
| `manufacturing_date` | date | Optional |
| `expiry_date` | date | Optional |
| `unit_price` | numeric | Optional |
| `minimum_stock_level` | numeric | Optional |
| `maximum_stock_level` | numeric | Optional |
| `supplier_id` | uuid | Optional |
| `is_active` | boolean | Optional |
| `deleted_at` | timestamptz | Optional soft delete |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |
| `created_by` | uuid | Optional |
| `updated_by` | uuid | Optional |

**E2E usage:**  
`SELECT id, product_id, product_variant_package_id, warehouse_id, COALESCE(available_units,0), COALESCE(allocated_units,0) FROM inventory WHERE warehouse_id = $1 AND tenant_id = $2 AND product_variant_package_id IN (...) AND (status = 'available' OR status IS NULL)`.

---

## 2. `product_variant_packages`

Packaging variants for a product. **Product “1013” in tests** is typically identified by **`material_code` = '1013'** or **`package_code`** (e.g. `'PKG-1013'`). Use this table to resolve “product code” to package id(s) when inventory is keyed by `product_variant_package_id`.

| Column | Data type | Notes |
|--------|-----------|--------|
| `id` | uuid | PK |
| `product_variant_id` | uuid | FK to product_variants |
| `package_name` | text | e.g. `'BOLTAIR - 100 ml Package'` |
| `package_code` | text | e.g. `'PKG-1013'` |
| `material_code` | text | **Product identifier in app (e.g. '1013')** – use for search by “product code” |
| `units_per_package` | numeric | |
| `packages_per_carton` | numeric | Optional |
| `package_mrp` | numeric | Optional |
| `package_cost_price` | numeric | Optional |
| `package_sku` | text | Optional, e.g. `'SKU-PKG-1013'` |
| `case_quantity` | numeric | Optional |
| `uom` | text | Optional, e.g. `'ml'` |
| `shipping_uom` | text | Optional |
| `is_sellable` | boolean | Optional |
| `is_stockable` | boolean | Optional |
| `is_active` | boolean | Optional |
| `tenant_id` | uuid | Tenant scope |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |
| `created_by` | uuid | Optional |
| `updated_by` | uuid | Optional |
| (others) | | barcode, dimensions, shelf_life_days, etc. |

**E2E usage:**  
Resolve package IDs for “product 1013”:  
`SELECT id FROM product_variant_packages WHERE (material_code = $1 OR package_code ILIKE '%'||$1||'%') AND tenant_id = $2`  
Then query `inventory` by `product_variant_package_id IN (...)`.

---

## 3. `warehouses`

Warehouse master. E2E resolves warehouse by name or code (e.g. “Kurnook” → `warehouse_name` or `warehouse_code` like `'KU-001'`).

| Column | Data type | Notes |
|--------|-----------|--------|
| `id` | uuid | PK |
| `warehouse_code` | text | e.g. `'KU-001'` |
| `warehouse_name` | text | e.g. `'Kurnook'` – use for search by display name |
| `warehouse_type` | text | e.g. `'main'` |
| `address` | text | Optional |
| `city` | text | Optional |
| `state` | text | Optional |
| `postal_code` | text | Optional |
| `country` | text | Optional |
| `total_capacity` | numeric | Optional |
| `available_capacity` | numeric | Optional |
| `capacity_unit` | text | Optional |
| `is_active` | boolean | Optional |
| `tenant_id` | uuid | Tenant scope |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |
| `created_by` | uuid | Optional |
| `updated_by` | uuid | Optional |
| (others) | | gps_coordinates, phone, email, manager_name, etc. |

**E2E usage:**  
`SELECT id FROM warehouses WHERE (warehouse_name ILIKE $1 OR warehouse_code ILIKE $1) AND tenant_id = $2 LIMIT 1`.

---

## 4. Related tables (for context)

- **`products`** / **`master_products`**: product master; may have `product_code` or `pid`. Inventory can be joined via `product_id`; product “1013” may also be resolved via `product_variant_packages.material_code`.
- **`product_variants`**: links `product_variant_packages` to `products`.
- **`tenants`**: E2E uses tenant name `'IACS'` or env `E2E_TENANT_ID` to scope all lookups.

---

## 5. Test data reference (sample values)

| Concept | Example value | Table.column |
|--------|----------------|--------------|
| Product code (material) | `1013` | product_variant_packages.material_code |
| Package code | `PKG-1013` | product_variant_packages.package_code |
| Warehouse name | `Kurnook` | warehouses.warehouse_name |
| Warehouse code | `KU-001` | warehouses.warehouse_code |
| Tenant (IACS) | Resolve by name or E2E_TENANT_ID | tenants.id |

---

*Last updated from E2E inventory DB helper and sample JSON (inventory, product_variant_packages, warehouses).*
