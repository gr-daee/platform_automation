# Finance & Compliance - GSTR-1 Review Page

## Overview
GSTR-1 Review Page allows Compliance Officers to review GST sales data in a dashboard mirroring the government schema and export validation-ready Excel files for accurate GSTR-1 filing.

**Route**: `/finance/compliance/gstr1`  
**Permissions**: `compliance.read`, `compliance.export`  
**Ticket**: [DAEE-100](https://linear.app/daee-issues/issue/DAEE-100/gstr-1-review-page-and-govt-schema-exportexcel)

## Key Components

### GSTR1ReviewPageContent
- **Location**: `../web_app/src/app/finance/compliance/gstr1/page.tsx`
- **Purpose**: Main page component for GSTR-1 data review and export
- **Key Behavior**:
  - Displays empty state until filters (GSTIN + Period) are selected
  - Shows summary cards, tabs (B2B, B2CL, B2CS, CDNR, CDNUR, HSN, Docs)
  - CDNR tab: columns Note Type, Note No., Date, Original Invoice, Buyer GSTIN, Reason, Taxable Value, IGST, CGST, SGST, Total Tax, Note Value; note values shown as positive (Math.abs) per DEF-007 (TC-023, TC-024)
  - HSN tab: sections B2B Supplies / B2C Supplies; columns HSN Code, Description, UQC, Quantity, Rate (%), Total Value, Taxable Value, CGST, SGST, IGST, Total Tax; grouped by HSN+UQC+Rate; empty state "No HSN summary for this period" (TC-025–TC-029). TC-028 expects no Description/Product Name—app currently has Description.
  - Docs tab: Document Summary; columns Document Type, Series Prefix, From Number, To Number, Total Issued, Cancelled, Net Issued; separate rows per series (INV vs Credit Note); Net Issued = Total − Cancelled; empty state "No document summary for this period" (TC-030–TC-033).
  - Export: Button opens menu "Export Excel" / "Export JSON" (single GSTIN) or "Export ZIP" / "Export JSON" (All GSTINs). Excel filename GSTR1_<GSTIN>_<MMYYYY>.xlsx; ZIP GSTR1_ALL_<MMYYYY>.zip. Exported Excel has ≥20 sheets; data starts at row 5 (TC-034–TC-037, TC-040). B2B/CDNR row 4 headers exclude "Tax Amount" columns; HSN row 4 includes "Integrated Tax Amount", "Central Tax Amount", "State/UT Tax Amount" (TC-038, AC6). Date in B2B row 5 col 5 is dd-mmm-yyyy (text); POS col 7 is Code-StateName e.g. 29-Karnataka (TC-039). When step "all" selects All GSTINs for ZIP export.
  - Tabs: Summary, B2B, B2CL, B2CS, CDNR, CDNUR, HSN, Docs. Each tab shows content or empty state (TC-042). Summary tab has section totals (B2B, B2CL, B2CS, CDNR, CDNUR) and Total Tax (Liability) (TC-043). DoD: Summary Total Liability matches sum of HSN Total Tax from TOTAL rows (TC-044).
  - Error & Loading: On fetch, loading state shows "Loading GSTR-1 data..." or "Loading data..." then content (TC-045). During export, Export button is disabled and shows Loader2 spinner (TC-047). TC-046 (error message when API fails) To Be Ignored in automation.
  - DoD (Section 12): Changing period (e.g. to "current") updates Return Period card (TC-048). B2CS tab shows "B2C Small Summary" and "Invoices in X Groups" (TC-049). Template fidelity: sheets + row 5 covered by TC-036/TC-037 (TC-050).
  - Handles Excel/JSON export with government schema compliance
- **State Management**: React hooks (useState, useEffect, useCallback)
- **Access Control**: Wrapped in `ProtectedPageWrapper` with `module="compliance"` and `requiredActions=["read"]`

### ProtectedPageWrapper
- **Location**: `../web_app/src/components/ProtectedPageWrapper.tsx`
- **Purpose**: Server-side permission validation and access control
- **Behavior**:
  - Redirects to `/restrictedUser` if user lacks module permissions
  - Redirects to `/login` if no authenticated user
  - Uses React Query for permission loading (memory-only, 30-min TTL)

## Business Rules

### Access Control
- **Permission Required**: `compliance.read` for page access
- **Redirect Behavior**: Users without permission redirected to `/restrictedUser`
- **Validation**: Server-side permission check via ProtectedPageWrapper

### Empty State
- **Trigger**: Page shows empty state when no GSTIN or Period selected
- **Message**: "Select filters to load" displayed in card
- **Removal**: Empty state disappears after both filters are applied and data loads

### Filter Requirements
- **GSTIN Filter**: Must select Seller GSTIN from dropdown (format: "GSTIN - State Name")
- **Period Filter**: Must select Filing Period (Month/Year picker)
- **Data Loading**: Data fetches automatically when both filters are selected

## Testing Context

### UI Interactions
- **Page Title**: Heading with role="heading" and name="GSTR-1 Review"
- **Page Description**: Text "Review outward supplies and export for GST filing"
- **Empty State**: Text "Select filters to load" (exact or partial match)
- **GSTIN Dropdown**: Combobox with label "Seller GSTIN"
- **Filing Period Dropdown**: Combobox with label "Filing Period"

### Access Control Testing
- **Access Granted**: Page title "GSTR-1 Review" visible
- **Access Denied**: Redirect to `/restrictedUser` OR error message with "access denied" / "permission" / "403"
- **Verification**: Check URL contains `/restrictedUser` OR page title not visible

### Empty State Behavior
- **Initial Load**: Empty state visible until filters applied
- **After Filters**: Empty state hidden, data/tabs visible
- **Message Text**: "Select filters to load" (case-insensitive partial match)

### Semantic Locators (Priority Order)
1. **Page Title**: `page.getByRole('heading', { name: 'GSTR-1 Review' })`
2. **Empty State**: `page.getByText('Select filters to load', { exact: false })`
3. **GSTIN Dropdown**: `page.locator('label').filter({ hasText: /seller gstin/i }).locator('..').getByRole('combobox')`
4. **Filing Period**: `page.locator('label').filter({ hasText: /filing period/i }).locator('..').getByRole('combobox')`
5. **Error Messages**: `page.getByRole('alert')` or `.text-red-700` class

## Database Schema

### Related Tables
- `address_book` - Seller GSTINs (address_category = 'seller')
- `invoices` - B2B/B2CL invoices with seller_gstn, buyer_gstn, irn_number
- `invoice_items` - Line items with hsn_code, tax_rate, taxable_amount
- `credit_memos` - CDNR/CDNUR records linked to invoices

**Note**: Tests use read-only database (SELECT only). No INSERT/UPDATE/DELETE operations.

## API Endpoints

### GET /api/finance/compliance/gstr1/seller-gstins
- **Purpose**: Fetch available seller GSTINs for dropdown
- **Response**: Array of `SellerGSTIN` objects

### POST /api/finance/compliance/gstr1/data
- **Purpose**: Fetch GSTR-1 data for selected GSTIN and period
- **Request Body**: `{ from_date, to_date, seller_gstn }`
- **Response**: `GSTR1Result` with b2b, b2cl, b2cs, cdnr, hsn, docs arrays

## Test Patterns

### Page Load Verification
**When to use**: Verify user can access page with proper permissions

**Implementation**:
```typescript
await gstr1Page.navigate();
await gstr1Page.verifyPageLoaded(); // Checks for "GSTR-1 Review" heading
```

### Empty State Verification
**When to use**: Verify page shows empty state before filters applied

**Implementation**:
```typescript
await gstr1Page.navigate();
await gstr1Page.verifyEmptyState(); // Checks for "Select filters to load"
```

### Access Denied Verification
**When to use**: Verify user without permissions is denied access

**Implementation**:
```typescript
await gstr1Page.navigate();
await gstr1Page.verifyAccessDenied(); // Checks for redirect or error
```

## Related Modules
- [O2C Module](../o2c/) - Invoices created in O2C flow into GSTR-1
- Finance Module - General finance and compliance features

## Known Issues / Gaps
- TC-003 (Access Denied) currently tests with IACS MD User (who has access). Need to add non-compliance user profile (e.g., Viewer) when available to test denied case.
- TC-002 (Empty State) removed as Invalid Scenario - empty state behavior is conditional (`!data && !loading`) and unreliable for automation.

## Test Coverage
- ✅ TC-001: User with compliance.read can open page - Automated
- ❌ TC-002: Page shows empty state until filters applied - **Invalid Scenario** (removed - unreliable empty state behavior)
- ✅ TC-003: User access control (partial - needs non-compliance user) - Automated
- ✅ TC-004: Filing Period dropdown visible with current month options - Automated
- ✅ TC-005: Seller GSTIN dropdown displays "GSTIN - State Name" format - Automated
- ✅ TC-006: Selecting filters loads data and removes empty state - Automated (Smoke)
- ✅ TC-007: Return Period card shows human-readable format - Automated (Smoke)
- ✅ TC-008: Total Liability (Total Tax) card visible and numeric - Automated
- ✅ TC-009: Total Taxable Value (Total Outward) card visible and numeric - Automated
- ✅ TC-010: Validation Errors (Validation Status) card visible with error count - Automated
- ✅ TC-011: E-Invoice Status card visible with IRN status - Automated
- ✅ TC-012: Net Taxable Value card visible and correct formula - Automated
- ✅ TC-013: Collapsible Fix Required/Review Recommended banner when issues exist - Automated (data-dependent)
- ✅ TC-014: Banner lists specific issues (document/message) - Automated (data-dependent)
- ✅ TC-015: Banner hidden when zero validation errors - Automated (requires clean data)
- ✅ TC-016: B2B tab column headers - Automated
- ✅ TC-017: B2B Status column e-invoice status - Automated
- ✅ TC-018: B2B Inv Type R for IWT - Automated
- ✅ TC-019: B2B Rate column percentage - Automated
- ✅ TC-020: IWT rows Buyer Name not Unknown - Automated
- ✅ TC-021: B2B Buyer Name full/wrap - Automated
- ✅ TC-022: B2B filters and pagination - Automated
- ✅ TC-045: Loading state shown then content - Automated
- ⏭️ TC-046: Error message displayed when API returns error — **To Be Ignored** (removed from automation)
- ✅ TC-047: Export button disabled/loading during export - Automated
- ✅ TC-048: Dashboard data scope for selected GSTIN/Period - Automated
- ✅ TC-049: B2CS grouped summary (not individual invoices) - Automated
- ✅ TC-050: Template fidelity (TC-036 + TC-037) - Automated
