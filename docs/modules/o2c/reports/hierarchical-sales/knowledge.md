# O2C - Hierarchical Sales Report

## Overview
Hierarchical Sales Report allows users with `sales_reports.read` to view sales data organized by geography: State → Region → Territory → Dealer, with Gross Sales, Returns (from Return Orders), and Net Sales at each level. Supports quick period selection, optional filters, and Excel export.

**Route**: `/o2c/reports/hierarchical-sales`  
**Permissions**: `sales_reports.read` (frontend); backend action uses `invoices.read` (document this for access tests).  
**Tickets**: DAEE-98 (State → Region → Territory → Dealer), DAEE-99 (Return order drill-down), DAEE-111 (sales_reports.read)

## Key Components

### HierarchicalSalesContent
- **Location**: `../web_app/src/app/o2c/reports/hierarchical-sales/components/HierarchicalSalesContent.tsx`
- **Purpose**: Main client component for hierarchical sales report: filters, report generation, summary cards, collapsible hierarchy, export
- **Key Behavior**:
  - Report Parameters card: Quick period buttons (This Month, This Quarter, This Year), From Date, To Date (required), State (GSTIN), Region, Territory; Generate Report button (disabled when From/To date missing)
  - Empty state: "No Report Generated" when no report data and not loading; message: "Select date range and filters above, then click Generate Report..."
  - No-data state: "No Sales Data Found" when report returns zero dealers
  - Summary cards (when data loaded): States, Regions, Territories, Dealers, Invoices, Gross Sales, Returns, Net Sales (compact currency: Cr/L/K)
  - Sales by Geography: 4-level collapsible (State → Region → Territory → Dealer); Expand All / Collapse All; Export Excel; Grand Total row
  - Dealer level: Expand to show invoice table (Date, Time, Invoice No., Gross, Returns, Net, RO); invoices with return orders expand to show Return Orders table (RO Number, Return Date, Reason, Status, Qty, Amount, Credit Memo)
  - Loading: Button shows "Generating..." during fetch; Export button shows "Exporting..." during export
  - Toasts: "Report generated: N dealers across M states"; "Excel file exported successfully"; "Please select from and to dates"; "No report data to export"; "Failed to generate report"
- **State Management**: React hooks (useState, useEffect)
- **Access Control**: Page wrapped in `ProtectedPageWrapper` with `module="sales_reports"` and `requiredActions=["read"]`

### ProtectedPageWrapper
- **Location**: `../web_app/src/components/ProtectedPageWrapper.tsx`
- **Purpose**: Permission validation; redirects to `/restrictedUser` if user lacks `sales_reports.read`

## Business Rules

### Access Control
- **Permission Required**: `sales_reports.read` for page access (UI)
- **Backend**: `getHierarchicalSalesReport` checks `invoices.read` (document discrepancy for test design)
- **Redirect**: Users without permission redirected to `/restrictedUser`

### Filter Requirements
- **From Date / To Date**: Required; Generate Report disabled until both set
- **State (GSTIN)**: Optional; options from `getStateOptions()`; "All states" default
- **Region / Territory**: Optional; Region from `master_regions`; Territory filtered by selected Region

### Report Data
- **State grouping**: From Sales Organization (region.state) per HSR-DEF-001, not dealer GSTIN (prevents duplicate dealer display)
- **Excluded**: Draft and cancelled invoices; inter_warehouse_transfer
- **Returns**: From return orders (DAEE-99), not all credit memos

## Testing Context

### UI Interactions
- **Page Title**: Heading "Hierarchical Sales Report"
- **Page Description**: "Sales data organized by State → Region → Territory → Dealer"
- **Report Parameters**: Card title "Report Parameters"; description "Select date range and filters"
- **Quick Period**: Buttons "This Month", "This Quarter", "This Year"
- **From Date / To Date**: Inputs with label "From Date *", "To Date *" (type="date")
- **State (GSTIN)**: Combobox with label "State (GSTIN)"; placeholder "All states"
- **Region / Territory**: Comboboxs with labels "Region", "Territory"; placeholders "All regions", "All territories"
- **Generate Report**: Button "Generate Report" or "Generating..." when loading
- **Empty State**: "No Report Generated"; "Select date range and filters above, then click Generate Report..."
- **No Data State**: "No Sales Data Found"; "No invoices found for the selected date range and filters..."
- **Summary Cards**: Titles States, Regions, Territories, Dealers, Invoices, Gross Sales, Returns, Net Sales
- **Sales by Geography**: Card title "Sales by Geography"; buttons "Expand All", "Collapse All", "Export Excel" / "Exporting..."
- **Grand Total**: Row with "GRAND TOTAL" and badge with state/region/territory/dealer counts

### Semantic Locators (Priority Order)
1. **Page Title**: `page.getByRole('heading', { name: 'Hierarchical Sales Report' })` or `page.getByText('Hierarchical Sales Report', { exact: true })`
2. **Generate Report**: `page.getByRole('button', { name: /Generate Report|Generating/ })`
3. **From Date**: `page.getByLabel('From Date *')` or `page.locator('input#from-date')`
4. **To Date**: `page.getByLabel('To Date *')` or `page.locator('input#to-date')`
5. **State**: `page.getByRole('combobox').filter({ has: page.getByText('State') })` or by label "State (GSTIN)"
6. **Quick Period**: `page.getByRole('button', { name: 'This Month' })`, `This Quarter`, `This Year`
7. **Expand All / Collapse All**: `page.getByRole('button', { name: 'Expand All' })`, `Collapse All`
8. **Export Excel**: `page.getByRole('button', { name: /Export Excel|Exporting/ })`
9. **Empty State**: `page.getByText('No Report Generated')`
10. **No Data State**: `page.getByText('No Sales Data Found')`
11. **Toast**: `page.locator('[data-sonner-toast]')`

## Database Schema

### Related Tables (Read-Only)
- `invoices` - Invoice header (invoice_date, total_amount, dealer_id, status; exclude draft/cancelled/IWT)
- `master_dealers` - dealer_code, business_name, gstn, territory_id, region_id
- `master_territories` - territory_name, region_id
- `master_regions` - region_name, state
- `sales_return_orders` - Return orders linked to invoices (DAEE-99)
- `credit_memos` - For return order credit memo number/amount

**Note**: Tests use read-only database (SELECT only). No INSERT/UPDATE/DELETE.

## API / Server Actions

### getHierarchicalSalesReport (server action)
- **Purpose**: Fetch hierarchical sales data for date range and optional filters
- **Input**: `{ from_date, to_date, state_code?, region_id?, territory_id?, dealer_id? }`
- **Permission**: `invoices.read` (backend)
- **Response**: `HierarchicalSalesResult` with dealers, territory_totals, region_totals, state_totals, grand_total, period

### exportHierarchicalSalesToExcel (client-side)
- **Purpose**: Export report data to Excel file (via exportUtils)
- **Input**: reportData, fromDate, toDate
- **Output**: Download filename pattern `hierarchical_sales_YYYY-MM-DD_to_YYYY-MM-DD.xlsx`

## Test Patterns

### Page Load Verification
**When to use**: Verify user can open page (TC-001; documented, not implemented in this phase).

**Implementation**:
```typescript
await hierarchicalSalesPage.navigate();
await expect(page.getByRole('heading', { name: 'Hierarchical Sales Report' })).toBeVisible();
```

### Empty State Verification
**When to use**: Verify "No Report Generated" before first generate (TC-025).

**Implementation**:
```typescript
await hierarchicalSalesPage.navigate();
await expect(page.getByText('No Report Generated')).toBeVisible();
```

### Generate Report and Summary Cards
**When to use**: TC-011, TC-014.

**Implementation**:
```typescript
await hierarchicalSalesPage.setDateRange(fromDate, toDate);
await hierarchicalSalesPage.clickGenerateReport();
await hierarchicalSalesPage.waitForReportLoaded(); // wait for success toast and summary cards
await expect(page.getByText('States').or(page.locator('text=States').first())).toBeVisible();
```

## Related Modules
- [O2C Module](../../knowledge.md) - Invoices, Indents, Sales Orders
- [Finance Compliance](../../../finance/compliance/knowledge.md) - GSTR-1 (similar report/filter pattern)

## Known Issues / Gaps
- Permission model: UI uses `sales_reports.read`, backend uses `invoices.read`; document for access tests (TC-001, TC-002).
- Empty state timing may be conditional; same caution as GSTR1 TC-002 for TC-025.

## Test Coverage
- ⏳ O2C-HSR-TC-001: User with sales_reports.read can open page - **Documented, Pending**
- ⏳ O2C-HSR-TC-002: User without sales_reports.read is denied - **Documented, Pending**
- ✅ O2C-HSR-TC-003 through TC-028: See test-cases.md (implemented as per plan).
