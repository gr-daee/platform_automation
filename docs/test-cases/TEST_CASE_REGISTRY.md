# Test Case Registry

This registry tracks all automated test cases with their unique identifiers for traceability and management.

## Test Case ID Format

`@Module-SubModule-TC-001`

**Format Breakdown:**
- **Module**: Uppercase module abbreviation (e.g., AUTH, O2C)
- **SubModule**: Uppercase submodule name (e.g., LOGIN, INDENT)
- **TC**: Test Case prefix
- **001**: Sequential number (3 digits)

## Authentication Module (AUTH)

### Login SubModule (LOGIN)

| Test Case ID | Module | SubModule | Scenario Name | Feature File | Tags | Status |
|--------------|--------|-----------|---------------|--------------|------|--------|
| AUTH-LOGIN-TC-001 | AUTH | LOGIN | Successful login with valid TOTP for Admin user | e2e/features/auth/login.feature | @smoke @critical | ✅ |
| AUTH-LOGIN-TC-002 | AUTH | LOGIN | Login fails with invalid TOTP code | e2e/features/auth/login.feature | @smoke @critical | ✅ |
| AUTH-LOGIN-TC-003 | AUTH | LOGIN | Login fails with incorrect password | e2e/features/auth/login.feature | @regression | ✅ |
| AUTH-LOGIN-TC-004 | AUTH | LOGIN | Login form validation for empty fields | e2e/features/auth/login.feature | @regression | ✅ |

## Order-to-Cash Module (O2C)

### Indent SubModule (INDENT)

| Test Case ID | Module | SubModule | Scenario Name | Feature File | Tags | Status |
|--------------|--------|-----------|---------------|--------------|------|--------|
| O2C-INDENT-TC-001 | O2C | INDENT | O2C Indents list page loads with title, status cards, table or empty state | e2e/features/o2c/indents.feature | @smoke @critical | ✅ |
| O2C-INDENT-TC-002 | O2C | INDENT | Create Indent for dealer creates new indent and navigates to detail page | e2e/features/o2c/indents.feature | @smoke @critical | ✅ |
| O2C-INDENT-TC-003 | O2C | INDENT | Create Indent for dealer with existing draft navigates to that draft | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-004 | O2C | INDENT | Search indents by dealer name or indent number filters the list | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-005 | O2C | INDENT | Filter by Status shows only matching indents | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-006 | O2C | INDENT | Clear filters restores the full list | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-008 | O2C | INDENT | Clicking an indent row navigates to indent detail page | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-023 | O2C | INDENT | When no indents match the filter the empty state is shown | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-012 | O2C | INDENT | User searches and selects dealer from Create Indent modal | e2e/features/o2c/indents.feature | @regression @dealer-search | ✅ |
| O2C-INDENT-TC-024 | O2C | INDENT | Indent detail page loads with heading and Indent Information | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-025 | O2C | INDENT | Edit indent add product by search and save | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-026 | O2C | INDENT | Submit indent after adding product | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-038 | O2C | INDENT | Back from indent detail returns to list | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-039 | O2C | INDENT | User searches dealer by dealer code and selects | e2e/features/o2c/indents.feature | @regression @dealer-search | ✅ |
| O2C-INDENT-TC-040 | O2C | INDENT | Search non-existent dealer shows no matching dealers | e2e/features/o2c/indents.feature | @regression @dealer-search | ✅ |
| O2C-INDENT-TC-041 | O2C | INDENT | Search product by product code shows results in Add Products modal | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-042 | O2C | INDENT | Search non-existent product shows no matching products in Add Products modal | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-027 | O2C | INDENT | Submitted indent shows Warehouse Selection and selecting warehouse enables Approve | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-028 | O2C | INDENT | Approve indent with optional comments after selecting warehouse | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-029 | O2C | INDENT | Process Workflow creates Sales Order or Back Order from approved indent | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-030 | O2C | INDENT | Submit Indent button is disabled when indent has no items | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-031 | O2C | INDENT | Approve button is disabled when warehouse not selected on submitted indent | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-032 | O2C | INDENT | Reject button in approval dialog is disabled until comment is provided | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-035 | O2C | INDENT | Draft indent shows Edit and Submit Indent but not Approve or Process Workflow | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-036 | O2C | INDENT | Submitted indent shows Warehouse Selection and Approve and Reject buttons | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-037 | O2C | INDENT | Approved indent shows Process Workflow button | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-043 | O2C | INDENT | Add multiple products in one Add Products session (multi-select) | e2e/features/o2c/indents.feature | @regression | 📋 To Start |
| O2C-INDENT-TC-044 | O2C | INDENT | Adjust quantity for a line item and verify totals update | e2e/features/o2c/indents.feature | @regression | 📋 To Start |
| O2C-INDENT-TC-045 | O2C | INDENT | Verify indent totals match sum of line items | e2e/features/o2c/indents.feature | @regression | 📋 To Start |
| O2C-INDENT-TC-046 | O2C | INDENT | Select transporter when dealer has no default transporter | e2e/features/o2c/indents.feature | @regression | 📋 To Start |
| O2C-INDENT-TC-047 | O2C | INDENT | Dealer with default transporter shows pre-selected transporter | e2e/features/o2c/indents.feature | @regression | 📋 To Start |
| O2C-INDENT-TC-048 | O2C | INDENT | Reject indent with required comments and verify status Rejected | e2e/features/o2c/indents.feature | @regression | 📋 To Start |
| O2C-INDENT-TC-049 | O2C | INDENT | Approval blocked when dealer has due invoices beyond 90 days | e2e/features/o2c/indents.feature | @regression | 📋 To Start |
| O2C-INDENT-TC-050 | O2C | INDENT | Credit limit check: UI shows Credit Warning when insufficient | e2e/features/o2c/indents.feature | @regression | 📋 To Start |
| O2C-INDENT-TC-051 | O2C | INDENT | Stock warning when warehouse has insufficient stock | e2e/features/o2c/indents.feature | @regression | 📋 To Start |
| O2C-INDENT-TC-052 | O2C | INDENT | Process Workflow dialog shows SO vs Back Order split before Confirm | e2e/features/o2c/indents.feature | @regression | 📋 To Start |

### Sales Order SubModule (SO)

*Feature file to add: `e2e/features/o2c/sales-orders.feature`. Master plan: [O2C-Indent-SO-Invoice-Test-Scenarios-For-Review.md](../../modules/o2c/O2C-Indent-SO-Invoice-Test-Scenarios-For-Review.md).*

| Test Case ID | Module | SubModule | Scenario Name | Feature File | Tags | Status |
|--------------|--------|-----------|---------------|--------------|------|--------|
| O2C-SO-TC-001 | O2C | SO | When item has no stock, Back Order is created | e2e/features/o2c/sales-orders.feature | @regression | 📋 To Start |
| O2C-SO-TC-002 | O2C | SO | Back Order list/detail shows correct items and quantities | e2e/features/o2c/sales-orders.feature | @regression | 📋 To Start |
| O2C-SO-TC-003 | O2C | SO | SO shows Credit Hold when dealer credit limit not available | e2e/features/o2c/sales-orders.feature | @regression | 📋 To Start |
| O2C-SO-TC-004 | O2C | SO | SO without credit hold can proceed to Invoice | e2e/features/o2c/sales-orders.feature | @regression | 📋 To Start |
| O2C-SO-TC-005 | O2C | SO | SO created for available products and within credit limit | e2e/features/o2c/sales-orders.feature | @regression | 📋 To Start |
| O2C-SO-TC-006 | O2C | SO | Verify SO line items match indent items | e2e/features/o2c/sales-orders.feature | @regression | 📋 To Start |
| O2C-SO-TC-007 | O2C | SO | SO detail page shows linked Indent reference | e2e/features/o2c/sales-orders.feature | @regression | 📋 To Start |
| O2C-SO-TC-008 | O2C | SO | SO list filters by status and shows correct status for new SO | e2e/features/o2c/sales-orders.feature | @regression | 📋 To Start |
| O2C-SO-TC-009 | O2C | SO | Inventory stock allocated as per SO | e2e/features/o2c/sales-orders.feature | @regression | 📋 To Start |
| O2C-SO-TC-010 | O2C | SO | Allocation deducted after Invoice; inventory reduced | e2e/features/o2c/sales-orders.feature | @regression | 📋 To Start |
| O2C-SO-TC-011 | O2C | SO | Inventory allocation follows FEFO | e2e/features/o2c/sales-orders.feature | @regression | 📋 To Start |

### Invoice / eInvoice SubModule (INV)

*Feature file to add: `e2e/features/o2c/invoices.feature`. Master plan: [O2C-Indent-SO-Invoice-Test-Scenarios-For-Review.md](../../modules/o2c/O2C-Indent-SO-Invoice-Test-Scenarios-For-Review.md).*

| Test Case ID | Module | SubModule | Scenario Name | Feature File | Tags | Status |
|--------------|--------|-----------|---------------|--------------|------|--------|
| O2C-INV-TC-001 | O2C | INV | From SO: open Generate eInvoice model | e2e/features/o2c/invoices.feature | @regression | 📋 To Start |
| O2C-INV-TC-002 | O2C | INV | Verify Bill to and Ship to details in eInvoice model | e2e/features/o2c/invoices.feature | @regression | 📋 To Start |
| O2C-INV-TC-003 | O2C | INV | Verify Dispatch and Seller details in eInvoice model | e2e/features/o2c/invoices.feature | @regression | 📋 To Start |
| O2C-INV-TC-004 | O2C | INV | Verify Invoice totals in model | e2e/features/o2c/invoices.feature | @regression | 📋 To Start |
| O2C-INV-TC-005 | O2C | INV | Select Shipper if not already selected | e2e/features/o2c/invoices.feature | @regression | 📋 To Start |
| O2C-INV-TC-006 | O2C | INV | Generate eInvoice succeeds and IRN/ack received | e2e/features/o2c/invoices.feature | @regression | 📋 To Start |
| O2C-INV-TC-007 | O2C | INV | After eInvoice: Generate eInvoice PDF is available | e2e/features/o2c/invoices.feature | @regression | 📋 To Start |
| O2C-INV-TC-008 | O2C | INV | Download eInvoice PDF and verify key details | e2e/features/o2c/invoices.feature | @regression | 📋 To Start |
| O2C-INV-TC-009 | O2C | INV | Invoice creation posts GL entry | e2e/features/o2c/invoices.feature | @regression | 📋 To Start |
| O2C-INV-TC-010 | O2C | INV | Stock reduction applied for invoiced quantities | e2e/features/o2c/invoices.feature | @regression | 📋 To Start |
| O2C-INV-TC-011 | O2C | INV | Dealer outstanding increased by invoice amount | e2e/features/o2c/invoices.feature | @regression | 📋 To Start |
| O2C-INV-TC-012 | O2C | INV | Invoice due date as per dealer payment terms | e2e/features/o2c/invoices.feature | @regression | 📋 To Start |
| O2C-INV-TC-013 | O2C | INV | Dealer Ledger shows invoice entry | e2e/features/o2c/invoices.feature | @regression | 📋 To Start |

## Usage

### Running Tests by Test Case ID

```bash
# Run specific test case
npm run test:tc -- "@AUTH-LOGIN-TC-001"

# Run all tests in a module
npm run test:tc -- "@AUTH-"

# Run all critical tests
npm run test:tc -- "@critical"
```

### Linking to Linear Issues

Test case IDs can be linked to Linear issues by adding the Linear issue tag:

```gherkin
@AUTH-LOGIN-TC-001 @linear-123 @smoke @critical
Scenario: Successful login with valid TOTP for Admin user
```

## Maintenance

- **Status**: ✅ Automated | ⏳ Pending | ❌ Failed | 🔄 In Progress
- **Last Updated**: Update when test case is modified
- **Tags**: Standard tags include @smoke, @critical, @regression

## Adding New Test Cases

1. Assign next sequential test case ID (e.g., AUTH-LOGIN-TC-005)
2. Add test case ID tag to scenario in feature file
3. Add entry to this registry
4. Update module-specific test case documentation

## Search and Filter

This registry is version-controlled with git, making it:
- Searchable via IDE/git tools
- Trackable for changes over time
- Accessible without additional tools
- Free and lightweight for small teams
