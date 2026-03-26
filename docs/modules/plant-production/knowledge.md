# Plant Production - Application Knowledge

## Overview

The Plant Production module manages the full manufacturing lifecycle in the DAEE ERP platform:
master data setup (plants, licenses, assets) → BOM definition → work order creation and approval
→ production execution (material issuance, finished goods, QC) → completion.

## Module URL

`/plant-production/plants` — Plants, Licenses, Assets (single tabbed page)

## Key Components

### PlantsManagerPage (`plants/components/PlantsManagerPage.tsx`)
- **Purpose**: Three-tab interface: Manufacturing Plants | Plant Licenses | Plant Assets
- **State**: Each tab has independent search, filter, and CRUD controls
- **Key Behavior**:
  - Plants tab: search by name/code/address, filter by plant_status, toggle Show Inactive
  - Licenses tab: search by number/type/authority, filter by license_type (dynamic from data)
  - Assets tab: search by name/code/category, filter by asset_status + asset_category
- **Buttons**: "Add Plant", "Add License", "Add Asset" (permission-gated via `permissionFlags.canCreate`)

### PlantFormDialog (`plants/components/PlantFormDialog.tsx`)
- **Dialog title**: "Create New Plant" (create) / "Edit Plant" (edit)
- **Required fields**: Plant Name (`#plant_name`), Plant Code (`#plant_code`)
- **Plant Code**: Uppercase-transformed; disabled in edit mode; pattern `[A-Z0-9-_]+`
- **Status dropdown**: active | inactive | under_maintenance
- **Capacity Unit dropdown**: kg | liters | units | pieces | boxes
- **Optional**: Description, Address, Commission Date, Capacity, Operating Hours/Days, Maintenance dates
- **Submit button**: "Create Plant" / "Update Plant"
- **Toast on success**: "Plant created successfully" / "Plant updated successfully"
- **Validation errors**: Inline `<p class="text-sm text-destructive">` under field

### PlantLicenseFormDialog (`plants/components/PlantLicenseFormDialog.tsx`)
- **Dialog title**: "Add Plant License" / "Edit Plant License"
- **Required fields**: Plant (SearchableSelectDialog), License Type (select), License Number, Issue Date
- **License Type options**: manufacturing | environmental | fire_safety | trade | iso | drug | fssai | pollution | other
- **Date validation**: Expiry date must be after issue date (client-side)
- **Optional**: Authority, Description, Renewal Period (months), Reminder Days (default 30)
- **Plant selector**: `SearchableSelectDialog` component (not a standard Radix Select)
- **Submit button**: "Add License" / "Update License"
- **Toast on success**: "License created successfully" / "License updated successfully"

### PlantAssetFormDialog (`plants/components/PlantAssetFormDialog.tsx`)
- **Dialog title**: "Add Plant Asset" / "Edit Plant Asset"
- **Required fields**: Plant (SearchableSelectDialog), Asset Name (`#asset_name`), Category (select)
- **Asset Code**: Auto-generated or manually entered (`#asset_code`); pattern enforced
- **Category options**: production_equipment | testing_equipment | packaging_equipment | quality_control | utilities | safety_equipment
- **Status options**: available | in_use | maintenance | retired
- **Optional**: Commissioning Date, Make/Model, Warranty, Maintenance Interval, Next Maintenance Date, Capacity
- **Submit button**: "Add Asset" / "Update Asset"
- **Toast on success**: "Asset created successfully" / "Asset updated successfully"

### DeleteConfirmDialog (`plants/components/DeleteConfirmDialog.tsx`)
- **Trigger**: Delete buttons in each table row (permission-gated `canDelete`)
- **Dialog**: "Are you sure you want to delete '[name]'? This action cannot be undone."
- **Buttons**: Cancel | Delete (destructive)
- **Toast on success**: "Plant deleted successfully" / "License deleted successfully" / "Asset deleted successfully"

## Business Rules

### Plant Status Rules
- `active`: Can be used for work orders
- `inactive`: Cannot be selected for work orders
- `under_maintenance`: Cannot be selected for work orders
- Plant Code is immutable after creation (disabled in edit form)

### Production Readiness Rule
- A plant is "production-ready" only when it has at least one valid (non-expired, active) license AND at least one active asset
- **Known Bug (PLANT-LIC-TC-005)**: UI currently allows work order creation for plants without valid licenses

### License Rules
- Expiry date must be strictly after issue date
- License number must be unique per plant
- **Known Gap (PLANT-LIC-TC-009)**: License deletion UI not available — delete button exists in code but behavior depends on `canDelete` permission; manual testing found no delete option

### Asset Rules
- Category restricted to 6 predefined enum values
- Only `available` assets can be assigned to work orders
- `in_use` and `maintenance` status assets are blocked from WO assignment
- Asset code must be unique per tenant

## Testing Context

### UI Interactions

**Plants Tab**:
- Search: `page.getByPlaceholder('Search plants...')`
- Status filter: Radix Select trigger (no accessible name — scoped to plants card)
- Show Inactive toggle: `page.getByRole('switch')` near "Show Inactive" label
- Add Plant: `page.getByRole('button', { name: 'Add Plant' })`
- Table rows: `page.locator('table tbody tr')`
- Row actions: View / Edit / Delete buttons within each `<tr>`

**Licenses Tab**:
- Tab trigger: `page.getByRole('tab', { name: /Plant Licenses/i })`
- Search: `page.getByPlaceholder('Search licenses...')`
- Add License: `page.getByRole('button', { name: 'Add License' })`

**Assets Tab**:
- Tab trigger: `page.getByRole('tab', { name: /Plant Assets/i })`
- Search: `page.getByPlaceholder('Search assets...')`
- Add Asset: `page.getByRole('button', { name: 'Add Asset' })`

**Dialogs**:
- Wait for `page.getByRole('dialog')` to be visible (200ms animation)
- Plant Name: `page.locator('#plant_name')`
- Plant Code: `page.locator('#plant_code')`
- Status select: `page.getByRole('dialog').getByRole('combobox')` (first/nth by position)
- Submit: `page.getByRole('button', { name: /Create Plant|Update Plant/i })`
- Cancel: `page.getByRole('button', { name: 'Cancel' })`

**Toast Messages**:
- Success: `[data-sonner-toast]` containing "created successfully" / "updated successfully" / "deleted successfully"
- Error: `[data-sonner-toast]` containing "Failed to"
- Field validation: `page.locator('.text-destructive')` (inline under field, NOT a toast)

### Form Behavior
- **Required field validation**: Client-side Zod-like validation; errors appear as `<p class="text-sm text-destructive">` under the field — NOT as `role="alert"`
- **Submit state**: Button shows "Saving..." and is disabled during submission
- **Dialog animation**: 200ms fade-in; always `await expect(dialog).toBeVisible()` before interacting

### Data Dependencies
- **Prerequisite**: Active user with `plant_production` create/update/delete permissions
- **Test data prefix**: `AUTO_QA_${Date.now()}_` for all created plants, licenses, assets
- **Plant code format**: Must match `[A-Z0-9-_]+` — use `AQA${timestamp}` pattern (short, valid)

## Database Schema

### manufacturing_plants
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `plant_name`: Text (required)
- `plant_code`: Text (required, unique per tenant)
- `plant_status`: Enum ('active', 'inactive', 'under_maintenance')
- `is_active`: Boolean (default true)
- `production_capacity`: Numeric (optional)
- `capacity_unit`: Enum ('kg', 'liters', 'units', 'pieces', 'boxes')
- `created_at`, `updated_at`: Timestamps

### manufacturing_plant_licenses
- `id`: UUID (PK)
- `manufacturing_plant_id`: UUID (FK → manufacturing_plants)
- `license_type`: Text (required)
- `license_number`: Text (required, unique per plant)
- `license_issue_date`: Date (required)
- `license_expiry_date`: Date (optional, must be > issue_date if set)
- `is_active`: Boolean

### manufacturing_plant_assets
- `id`: UUID (PK)
- `manufacturing_plant_id`: UUID (FK → manufacturing_plants)
- `asset_code`: Text (required, unique per tenant)
- `asset_name`: Text (required)
- `asset_category`: Enum ('production_equipment', 'testing_equipment', 'packaging_equipment', 'quality_control', 'utilities', 'safety_equipment')
- `asset_status`: Enum ('available', 'in_use', 'maintenance', 'retired')
- `is_active`: Boolean

## Known Issues / Gaps

- **PLANT-LIC-TC-005**: Work order can be created for a plant without a valid license (production readiness rule not enforced in WO creation form)
- **PLANT-LIC-TC-009**: License deletion functionality not consistently available in UI (depends on `canDelete` permission which may not be granted to test user)
- License form uses `SearchableSelectDialog` for plant selection — not a standard Radix `combobox`; requires different interaction pattern

## Test Coverage (Phase 1)

| Test ID | Scenario | Status |
|---------|----------|--------|
| PLANT-PLT-TC-001 | Create plant with required fields | ✅ Automated |
| PLANT-PLT-TC-002 | Plant code uniqueness validation | ✅ Automated |
| PLANT-PLT-TC-003 | Required field validation (inline errors) | ✅ Automated |
| PLANT-PLT-TC-004 | Inactive/maintenance plant status usability rule | ✅ Automated |
| PLANT-PLT-TC-005 | Capacity and operational fields saved | ✅ Automated |
| PLANT-PLT-TC-006 | Maintenance date validation | ✅ Automated |
| PLANT-PLT-TC-007 | Plant record persists after refresh | ✅ Automated |
| PLANT-PLT-TC-008 | Cancel closes form without saving | ✅ Automated |
| PLANT-PLT-TC-009 | Edit existing plant persists changes | ✅ Automated |
| PLANT-PLT-TC-010 | Plant list search by name and code | ✅ Automated |
| PLANT-PLT-TC-011 | Audit record created on plant creation | ⏳ Pending (UI audit trail TBD) |
| PLANT-LIC-TC-001 | Create license with required fields | ✅ Automated |
| PLANT-LIC-TC-002 | License mandatory field validation | ✅ Automated |
| PLANT-LIC-TC-003 | License date validation (expiry < issue) | ✅ Automated |
| PLANT-LIC-TC-004 | License number uniqueness per plant | ✅ Automated |
| PLANT-LIC-TC-005 | WO blocked when no valid license | ✅ Automated @known-defect |
| PLANT-LIC-TC-006 | Expired license visually identified | ✅ Automated |
| PLANT-LIC-TC-007 | License renewal — expiry date update | ✅ Automated |
| PLANT-LIC-TC-008 | Plant becomes WO-ready after valid license | ✅ Automated |
| PLANT-LIC-TC-009 | License deletion not available in UI | ✅ Automated @known-defect |
| PLANT-LIC-TC-010 | License audit trail | ⏳ Pending |
| PLANT-LIC-TC-011 | Edit license — update saves correctly | ✅ Automated |
| PLANT-AST-TC-001 | Create asset with required fields | ✅ Automated |
| PLANT-AST-TC-002 | Asset category restricted to predefined values | ✅ Automated |
| PLANT-AST-TC-003 | Inactive/maintenance asset blocked from WO | ✅ Automated |
| PLANT-AST-TC-004 | Plant without active asset blocked from WO | ✅ Automated |
| PLANT-AST-TC-005 | Active asset assigned to work order | ✅ Automated |
| PLANT-AST-TC-006 | Asset audit record | ⏳ Pending |
| PLANT-AST-TC-007 | Asset code uniqueness validation | ✅ Automated |
| PLANT-AST-TC-008 | Asset edit persists after refresh | ✅ Automated |
| PLANT-AST-TC-009 | Asset under_maintenance blocked from WO | ✅ Automated |
| PLANT-AST-TC-010 | Concurrent creation with same code | ⏳ Pending (race condition) |
| PLANT-AST-TC-011 | Edit asset name and status | ✅ Automated |
| PLANT-AST-TC-012 | Delete asset removes from list | ✅ Automated |
