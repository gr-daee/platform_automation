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

**Numbering:** O2C-INDENT-TC-001 through TC-020 (sequential). See [O2C test-cases.md](../../modules/o2c/test-cases.md) for full details.

| Test Case ID | Module | SubModule | Scenario Name | Feature File | Tags | Status |
|--------------|--------|-----------|---------------|--------------|------|--------|
| O2C-INDENT-TC-001 | O2C | INDENT | Create Indent for dealer creates new indent and navigates to detail page | e2e/features/o2c/indents.feature | @smoke @critical | ✅ |
| O2C-INDENT-TC-002 | O2C | INDENT | Create Indent for dealer with existing draft navigates to that draft | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-003 | O2C | INDENT | User searches and selects dealer from Create Indent modal | e2e/features/o2c/indents.feature | @regression @dealer-search | ✅ |
| O2C-INDENT-TC-004 | O2C | INDENT | Edit indent add product by search and save | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-005 | O2C | INDENT | Submit indent after adding product | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-006 | O2C | INDENT | Back from indent detail returns to list | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-007 | O2C | INDENT | User searches dealer by dealer code and selects | e2e/features/o2c/indents.feature | @regression @dealer-search | ✅ |
| O2C-INDENT-TC-008 | O2C | INDENT | Search non-existent dealer shows no matching dealers | e2e/features/o2c/indents.feature | @regression @dealer-search | ✅ |
| O2C-INDENT-TC-009 | O2C | INDENT | Search non-existent product shows no matching products in Add Products modal | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-010 | O2C | INDENT | Submit Indent button is disabled when indent has no items | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-011 | O2C | INDENT | Draft indent shows Edit and Submit Indent but not Approve or Process Workflow | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-012 | O2C | INDENT | Full straight path from list to Sales Order creation | e2e/features/o2c/indents.feature | @smoke @critical @regression | ✅ |
| O2C-INDENT-TC-013 | O2C | INDENT | Reject button in approval dialog is disabled until comment is provided | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-014 | O2C | INDENT | Reject indent with required comments and verify status Rejected | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-015 | O2C | INDENT | Approval blocked when dealer has due invoices beyond 90 days | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-016 | O2C | INDENT | Select transporter when dealer has no default transporter | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-017 | O2C | INDENT | Dealer with default transporter shows pre-selected transporter | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-018 | O2C | INDENT | Credit limit check shows Credit Warning when insufficient | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-019 | O2C | INDENT | Stock warning shown when selected warehouse has insufficient stock | e2e/features/o2c/indents.feature | @regression | ✅ |
| O2C-INDENT-TC-020 | O2C | INDENT | Process Workflow dialog shows SO and Back Order preview before Confirm | e2e/features/o2c/indents.feature | @regression | ✅ |

### E2E SubModule (E2E)

*System-level E2E: Indent → SO → eInvoice → Invoice PDF → Dealer Ledger. Feature file: `e2e/features/o2c/o2c-e2e-indent-so-invoice.feature`.*

| Test Case ID | Module | SubModule | Scenario Name | Feature File | Tags | Status |
|--------------|--------|-----------|---------------|--------------|------|--------|
| O2C-E2E-TC-001 | O2C | E2E | Full E2E flow with Dealer IACS5509, Product 1013, Warehouse Kurnook, Transporter Just In Time Shipper | e2e/features/o2c/o2c-e2e-indent-so-invoice.feature | @o2c-flow @smoke @critical @p0 @iacs-md | ✅ |
| O2C-E2E-TC-002 | O2C | E2E | Mixed indent: DB-resolved OOS + in-stock at Kurnook → back order + SO → full invoice pipeline | e2e/features/o2c/o2c-e2e-indent-so-invoice.feature | @o2c-flow @regression @p1 @iacs-md | ✅ |
| O2C-E2E-TC-003 | O2C | E2E | Generate E-Invoice without E-Way bill (picklist path) | e2e/features/o2c/o2c-e2e-indent-so-invoice.feature | @o2c-flow @regression @p1 @iacs-md | ✅ |
| O2C-E2E-TC-004 | O2C | E2E | Cancel e-invoice within 24h (reuse IRN from DB or full O2C flow) | e2e/features/o2c/o2c-e2e-indent-so-invoice.feature | @o2c-flow @regression @p1 @iacs-md | ✅ |

### Warehouse Inventory (WH-INV)

*Feature file: `e2e/features/o2c/inventory/warehouse-inventory.feature`. Route: `/o2c/inventory` (see [knowledge.md](../../modules/o2c/knowledge.md#warehouse-inventory-wh-inv)).*

| Test Case ID | Module | SubModule | Scenario Name | Feature File | Tags | Status |
|--------------|--------|-----------|---------------|--------------|------|--------|
| WH-INV-TC-001 | O2C | WH-INV | Warehouse inventory page shows heading and subtitle | e2e/features/o2c/inventory/warehouse-inventory.feature | @smoke @regression @p1 @iacs-md | ✅ |
| WH-INV-TC-002 | O2C | WH-INV | Analytics summary cards show totals | e2e/features/o2c/inventory/warehouse-inventory.feature | @regression @p1 @iacs-md | ✅ |
| WH-INV-TC-003 | O2C | WH-INV | Inventory Items tab shows search and grid | e2e/features/o2c/inventory/warehouse-inventory.feature | @regression @p1 @iacs-md | ✅ |
| WH-INV-TC-004 | O2C | WH-INV | Allocations tab shows allocation section | e2e/features/o2c/inventory/warehouse-inventory.feature | @regression @p2 @iacs-md | ✅ |
| WH-INV-TC-005 | O2C | WH-INV | Analytics tab shows dashboard or loading or empty state | e2e/features/o2c/inventory/warehouse-inventory.feature | @regression @p2 @iacs-md | ✅ |
| WH-INV-TC-006 | O2C | WH-INV | Settings tab shows Coming Soon | e2e/features/o2c/inventory/warehouse-inventory.feature | @regression @p3 @iacs-md | ✅ |
| WH-INV-TC-007 | O2C | WH-INV | Search with fewer than three characters shows helper text | e2e/features/o2c/inventory/warehouse-inventory.feature | @regression @p2 @iacs-md | ✅ |
| WH-INV-TC-008 | O2C | WH-INV | Refresh completes and grid is ready | e2e/features/o2c/inventory/warehouse-inventory.feature | @regression @p2 @iacs-md | ✅ |
| WH-INV-TC-009 | O2C | WH-INV | Status filter Low Stock applies | e2e/features/o2c/inventory/warehouse-inventory.feature | @regression @p2 @iacs-md | ✅ |
| WH-INV-TC-010 | O2C | WH-INV | Warehouse filter Kurnook then reset to all warehouses | e2e/features/o2c/inventory/warehouse-inventory.feature | @regression @p2 @iacs-md | ✅ |
| WH-INV-TC-011 | O2C | WH-INV | Search with three characters shows query in results summary | e2e/features/o2c/inventory/warehouse-inventory.feature | @regression @p2 @iacs-md | ✅ |
| WH-INV-TC-012 | O2C | WH-INV | Single character search shows waiting line in results summary | e2e/features/o2c/inventory/warehouse-inventory.feature | @regression @p2 @iacs-md | ✅ |
| WH-INV-TC-013 | O2C | WH-INV | Next page updates pagination indicator | e2e/features/o2c/inventory/warehouse-inventory.feature | @regression @p2 @iacs-md | ✅ |
| WH-INV-TC-014 | O2C | WH-INV | Page size twenty-five per page updates control and footer range | e2e/features/o2c/inventory/warehouse-inventory.feature | @regression @p2 @iacs-md | ✅ |
| WH-INV-TC-015 | O2C | WH-INV | Combined warehouse Kurnook and In Stock status filters apply | e2e/features/o2c/inventory/warehouse-inventory.feature | @regression @p3 @iacs-md | ✅ |

### Reports / Hierarchical Sales SubModule (HSR)

*Feature file: `e2e/features/o2c/reports/hierarchical-sales.feature`. TC-001/002 documented only (Pending).*

| Test Case ID | Module | SubModule | Scenario Name | Feature File | Tags | Status |
|--------------|--------|-----------|---------------|--------------|------|--------|
| O2C-HSR-TC-001 | O2C | HSR | User with sales_reports.read can open page | e2e/features/o2c/reports/hierarchical-sales.feature | @smoke @p0 | ⏳ Pending |
| O2C-HSR-TC-002 | O2C | HSR | User without sales_reports.read is denied | e2e/features/o2c/reports/hierarchical-sales.feature | @critical @p0 @multi-user | ⏳ Pending |
| O2C-HSR-TC-003 | O2C | HSR | Generate Report disabled when From or To date missing | e2e/features/o2c/reports/hierarchical-sales.feature | @regression | ✅ |
| O2C-HSR-TC-004–TC-028 | O2C | HSR | Filters, quick period, report gen, hierarchy, export, empty/no-data, optional DB | e2e/features/o2c/reports/hierarchical-sales.feature | @regression @smoke | ✅ |

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

### Running Tests by Test Case ID (Tag)

You can run any specific test by its tag **without changing package.json**. Use `--` so npm passes your arguments to Playwright.

```bash
# Run a specific test by tag (any test case ID)
npm run test:tc -- "@O2C-E2E-TC-001"
npm run test:tc -- "@AUTH-LOGIN-TC-001"
npm run test:tc -- "@O2C-INDENT-TC-012"

# Run in dev mode (headed, single worker) by tag
npm run test:dev -- --grep "@O2C-E2E-TC-001"

# Run in production/regression mode by tag
npm run test:regression -- --grep "@O2C-E2E-TC-001"

# Run all tests matching a pattern (e.g. all O2C Indent tests)
npm run test:tc -- "@O2C-INDENT-"

# Run all critical tests
npm run test:tc -- "@critical"
```

**Important:** The `--` is required. Without it, npm does not forward arguments to the script and you get "No tests found."

| Goal | Command |
|------|--------|
| Run one test by tag | `npm run test:tc -- "@TAG_ID"` |
| Run one test by tag (dev, headed) | `npm run test:dev -- --grep "@TAG_ID"` |
| Run one test by tag (production) | `npm run test:regression -- --grep "@TAG_ID"` |
| Run by project + tag | `npm run test:dev -- --project=iacs-md --grep "@TAG_ID"` |
| Run by path (e.g. all O2C) | `npm run test:regression -- e2e/features/o2c/` |
| Run all tests with a tag pattern | `npm run test:tc -- "@O2C-INDENT-"` |

Package.json keeps only core execution modes (test:dev, test:regression, test:tc, etc.); all tag/project/path filtering is done via the run command.

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

## Finance Module (FIN)

### Cash Receipts SubModule (CR)

| Test Case ID | Module | SubModule | Scenario Name | Feature File | Tags | Status |
|--------------|--------|-----------|---------------|--------------|------|--------|
| FIN-CR-TC-011 | FIN | CR | New cash receipt validation: amount must be greater than zero | e2e/features/finance/cash-receipts/manual-cash-receipts.feature | @negative @p1 @iacs-md | ✅ |
| FIN-CR-TC-012 | FIN | CR | New cash receipt validation: bank account mandatory for NEFT | e2e/features/finance/cash-receipts/manual-cash-receipts.feature | @negative @p1 @iacs-md | ✅ |
| FIN-VAN-TC-012 | FIN | CR | VAN lifecycle integrity: un-apply and re-apply totals reconcile | e2e/features/finance/cash-receipts/van-cash-receipts.feature | @critical @p1 @iacs-md | ✅ |

### Credit Memos SubModule (CM)

| Test Case ID | Module | SubModule | Scenario Name | Feature File | Tags | Status |
|--------------|--------|-----------|---------------|--------------|------|--------|
| FIN-CM-TC-001 | FIN | CM | Create credit memo with valid inputs | e2e/features/finance/credit-memos/credit-memos.feature | @critical @p0 @iacs-md | ✅ |
| FIN-CM-TC-002 | FIN | CM | Partially apply credit memo to oldest outstanding invoice | e2e/features/finance/credit-memos/credit-memos.feature | @critical @p0 @iacs-md | ✅ |
| FIN-CM-TC-003 | FIN | CM | Full settlement in one-shot apply using matching credit memo amount | e2e/features/finance/credit-memos/credit-memos.feature | @critical @p0 @iacs-md | ✅ |
| FIN-CM-TC-004 | FIN | CM | Partial apply then remaining apply fully settles invoice | e2e/features/finance/credit-memos/credit-memos.feature | @critical @p0 @iacs-md | ✅ |
| FIN-CM-TC-005 | FIN | CM | CM linked to one invoice applies to another invoice of same customer | e2e/features/finance/credit-memos/credit-memos.feature | @critical @p1 @iacs-md | ✅ |
| FIN-CM-TC-006 | FIN | CM | Credit memo header and application rows reconcile | e2e/features/finance/credit-memos/credit-memos.feature | @critical @p1 @iacs-md | ✅ |
| FIN-CM-TC-007 | FIN | CM | Invoice outstanding reduces by applied credit amount | e2e/features/finance/credit-memos/credit-memos.feature | @critical @p1 @iacs-md | ✅ |
| FIN-CM-TC-008 | FIN | CM | Full settlement keeps credit memo totals reconciled | e2e/features/finance/credit-memos/credit-memos.feature | @critical @p1 @iacs-md | ✅ |
| FIN-CM-TC-011 | FIN | CM | Transport allowance over-balance apply creates dealer advance | e2e/features/finance/credit-memos/credit-memos.feature | @critical @p1 @iacs-md | ✅ |
| FIN-CM-TC-012 | FIN | CM | Transport allowance over-balance path fully applies credit and creates dealer advance | e2e/features/finance/credit-memos/credit-memos.feature | @critical @p1 @iacs-md | ✅ |
| FIN-CM-TC-013 | FIN | CM | Apply credit rejects amount above available credit | e2e/features/finance/credit-memos/credit-memos.feature | @negative @p1 @iacs-md | ✅ |
| FIN-CM-TC-014 | FIN | CM | Apply credit blocks zero amount via disabled submit | e2e/features/finance/credit-memos/credit-memos.feature | @negative @p1 @iacs-md | ✅ |
| FIN-CM-TC-015 | FIN | CM | Apply dialog does not list invoices from other customers | e2e/features/finance/credit-memos/credit-memos.feature | @negative @p1 @iacs-md | ✅ |
| FIN-CM-TC-016 | FIN | CM | Duplicate apply to same invoice is rejected | e2e/features/finance/credit-memos/credit-memos.feature | @negative @p1 @iacs-md | ✅ |
| FIN-CM-TC-017 | FIN | CM | Non-transport credit memo apply rejects amount above invoice balance | e2e/features/finance/credit-memos/credit-memos.feature | @negative @p1 @iacs-md | ✅ |
| FIN-CM-TC-018 | FIN | CM | Post new credit memo to general ledger | e2e/features/finance/credit-memos/credit-memos.feature | @critical @p1 @iacs-md | ✅ |
| FIN-CM-TC-019 | FIN | CM | Reverse CM application restores CM balances and reverses application row | e2e/features/finance/credit-memos/credit-memos.feature | @critical @p1 @iacs-md | ✅ |
| FIN-CM-TC-020 | FIN | CM | Reverse dialog requires reason before confirm; cancel leaves application active in DB | e2e/features/finance/credit-memos/credit-memos.feature | @negative @p2 @iacs-md | ✅ |
| FIN-CM-TC-021 | FIN | CM | After reversal, application history shows Reversed and hides Reverse action | e2e/features/finance/credit-memos/credit-memos.feature | @regression @p2 @iacs-md | ✅ |
| FIN-CM-TC-022 | FIN | CM | User without credit memos access is redirected from credit memos URL | e2e/features/finance/credit-memos/credit-memos.feature | @negative @p2 @iacs-ed | ✅ |

### Dealer Ledger SubModule (DL)

| Test Case ID | Module | SubModule | Scenario Name | Feature File | Tags | Status |
|--------------|--------|-----------|---------------|--------------|------|--------|
| FIN-DL-TC-001 | FIN | DL | Load dealer ledger by business name shows summary and transactions | e2e/features/finance/dealer-ledger/dealer-ledger.feature | @smoke @regression @p1 @iacs-md | ✅ |
| FIN-DL-TC-002 | FIN | DL | Load dealer ledger by dealer code shows invoice transaction | e2e/features/finance/dealer-ledger/dealer-ledger.feature | @regression @p1 @iacs-md | ✅ |
| FIN-DL-TC-003 | FIN | DL | Load Ledger is disabled until a dealer is selected | e2e/features/finance/dealer-ledger/dealer-ledger.feature | @negative @p2 @iacs-md | ✅ |
| FIN-DL-TC-004 | FIN | DL | Load dealer ledger with explicit date range still returns transactions | e2e/features/finance/dealer-ledger/dealer-ledger.feature | @regression @p2 @iacs-md | ✅ |
| FIN-DL-TC-005 | FIN | DL | Export dealer ledger CSV shows success toast with row count | e2e/features/finance/dealer-ledger/dealer-ledger.feature | @regression @p2 @iacs-md | ✅ |
| FIN-DL-TC-006 | FIN | DL | Transaction type filter shows invoices only | e2e/features/finance/dealer-ledger/dealer-ledger.feature | @regression @p2 @iacs-md | ✅ |
| FIN-DL-TC-007 | FIN | DL | Invoice document link navigates to O2C invoice detail | e2e/features/finance/dealer-ledger/dealer-ledger.feature | @regression @p2 @iacs-md | ✅ |
| FIN-DL-TC-008 | FIN | DL | User without dealer ledger access is redirected from dealer ledger URL | e2e/features/finance/dealer-ledger/dealer-ledger.feature | @negative @p2 @iacs-ed | ✅ (skip if ED has access) |
| FIN-DL-TC-009 | FIN | DL | Export standard dealer ledger PDF shows success toast | e2e/features/finance/dealer-ledger/dealer-ledger.feature | @regression @p2 @iacs-md | ✅ |
| FIN-DL-TC-010 | FIN | DL | Export detailed invoice ledger PDF shows success toast | e2e/features/finance/dealer-ledger/dealer-ledger.feature | @regression @p2 @iacs-md | ✅ |
| FIN-DL-TC-011 | FIN | DL | Search by document number narrows transaction rows | e2e/features/finance/dealer-ledger/dealer-ledger.feature | @regression @p2 @iacs-md | ✅ |
| FIN-DL-TC-012 | FIN | DL | Date column header toggles sort without breaking table | e2e/features/finance/dealer-ledger/dealer-ledger.feature | @regression @p3 @iacs-md | ✅ |
| FIN-DL-TC-013 | FIN | DL | Payment document link navigates to O2C payment detail | e2e/features/finance/dealer-ledger/dealer-ledger.feature | @regression @p2 @iacs-md | ✅ |
| FIN-DL-TC-014 | FIN | DL | Credit note document link navigates to credit memo detail | e2e/features/finance/dealer-ledger/dealer-ledger.feature | @regression @p2 @iacs-md | ✅ |
| FIN-DL-TC-015 | FIN | DL | AR aging analysis appears when outstanding aging data exists | e2e/features/finance/dealer-ledger/dealer-ledger.feature | @regression @p2 @iacs-md | ✅ |
| FIN-DL-TC-016 | FIN | DL | VAN section appears when unallocated payment data exists | e2e/features/finance/dealer-ledger/dealer-ledger.feature | @regression @p3 @iacs-md | ✅ |

### AR Aging SubModule (AR)

| Test Case ID | Module | SubModule | Scenario Name | Feature File | Tags | Status |
|--------------|--------|-----------|---------------|--------------|------|--------|
| FIN-AR-TC-001 | FIN | AR | AR Aging report page loads for authorized user | e2e/features/finance/ar-aging/ar-aging.feature | @smoke @regression @p1 @iacs-md | ✅ |
| FIN-AR-TC-002 | FIN | AR | Dealer summary shows table or empty receivables message | e2e/features/finance/ar-aging/ar-aging.feature | @regression @p2 @iacs-md | ✅ |
| FIN-AR-TC-003 | FIN | AR | User can switch Dealer Summary Invoice Detail and Snapshots tabs | e2e/features/finance/ar-aging/ar-aging.feature | @regression @p2 @iacs-md | ✅ |
| FIN-AR-TC-004 | FIN | AR | Filters panel opens and closes from toolbar | e2e/features/finance/ar-aging/ar-aging.feature | @regression @p2 @iacs-md | ✅ |
| FIN-AR-TC-005 | FIN | AR | Due date aging basis shows not due column after apply filters | e2e/features/finance/ar-aging/ar-aging.feature | @regression @p2 @iacs-md | ✅ |
| FIN-AR-TC-006 | FIN | AR | Dealer search with no match shows empty search message | e2e/features/finance/ar-aging/ar-aging.feature | @regression @p2 @iacs-md | ✅ |
| FIN-AR-TC-007 | FIN | AR | Export Excel shows success when receivables data exists | e2e/features/finance/ar-aging/ar-aging.feature | @regression @p2 @iacs-md | ✅ |
| FIN-AR-TC-008 | FIN | AR | Export PDF shows success when receivables data exists | e2e/features/finance/ar-aging/ar-aging.feature | @regression @p2 @iacs-md | ✅ |
| FIN-AR-TC-009 | FIN | AR | User without AR aging module access is redirected from report URL | e2e/features/finance/ar-aging/ar-aging.feature | @negative @p2 @iacs-ed | ✅ |
| FIN-AR-TC-010 | FIN | AR | Legacy finance reports AR aging URL redirects to canonical page | e2e/features/finance/ar-aging/ar-aging.feature | @regression @p2 @iacs-md | ✅ |
| FIN-AR-TC-011 | FIN | AR | Snapshots tab shows heading or empty snapshots state | e2e/features/finance/ar-aging/ar-aging.feature | @regression @p2 @iacs-md | ✅ |
| FIN-AR-TC-012 | FIN | AR | Generate Snapshot dialog opens and cancels without error | e2e/features/finance/ar-aging/ar-aging.feature | @regression @p2 @iacs-md | ✅ |
| FIN-DO-TC-001 | FIN | DO | Dealer Outstanding report page loads for authorized user | e2e/features/finance/dealer-outstanding/dealer-outstanding.feature | @smoke @regression @p1 @iacs-md | ✅ |
| FIN-DO-TC-002 | FIN | DO | Initial state prompts to load report when no data loaded | e2e/features/finance/dealer-outstanding/dealer-outstanding.feature | @regression @p2 @iacs-md | ✅ |
| FIN-DO-TC-003 | FIN | DO | Load report completes with success feedback | e2e/features/finance/dealer-outstanding/dealer-outstanding.feature | @regression @p2 @iacs-md | ✅ |
| FIN-DO-TC-004 | FIN | DO | After load summary shows gross and net labels when totals exist | e2e/features/finance/dealer-outstanding/dealer-outstanding.feature | @regression @p2 @iacs-md | ✅ |
| FIN-DO-TC-005 | FIN | DO | Very high min outstanding filter yields zero dealers | e2e/features/finance/dealer-outstanding/dealer-outstanding.feature | @regression @p2 @iacs-md | ✅ |
| FIN-DO-TC-006 | FIN | DO | Region filter dropdown lists All Regions option | e2e/features/finance/dealer-outstanding/dealer-outstanding.feature | @regression @p2 @iacs-md | ✅ |
| FIN-DO-TC-007 | FIN | DO | Export CSV shows success when report has dealer rows | e2e/features/finance/dealer-outstanding/dealer-outstanding.feature | @regression @p2 @iacs-md | ✅ |
| FIN-DO-TC-008 | FIN | DO | Export PDF shows success when report has dealer rows | e2e/features/finance/dealer-outstanding/dealer-outstanding.feature | @regression @p2 @iacs-md | ✅ |
| FIN-DO-TC-010 | FIN | DO | Drill-down opens invoice details dialog with columns | e2e/features/finance/dealer-outstanding/dealer-outstanding.feature | @regression @p2 @iacs-md | ✅ |
| FIN-DO-TC-011 | FIN | DO | Drill-down dialog can be closed | e2e/features/finance/dealer-outstanding/dealer-outstanding.feature | @regression @p2 @iacs-md | ✅ |
| FIN-DO-TC-020 | FIN | DO | First dealer gross outstanding matches sum of invoice balances | e2e/features/finance/dealer-outstanding/dealer-outstanding.feature | @regression @p2 @iacs-md | ✅ |
| FIN-DO-TC-021 | FIN | DO | First drill-down invoice balance matches database | e2e/features/finance/dealer-outstanding/dealer-outstanding.feature | @regression @p2 @iacs-md | ✅ |
| FIN-DO-TC-030 | FIN | DO | First dealer net outstanding matches UI formula on screen | e2e/features/finance/dealer-outstanding/dealer-outstanding.feature | @regression @p3 @iacs-md | ✅ |
| FIN-DO-TC-031 | FIN | DO | Unapplied Credits column header visible when dealer grid is shown | e2e/features/finance/dealer-outstanding/dealer-outstanding.feature | @regression @p3 @iacs-md | ✅ |
| FIN-DO-TC-040 | FIN | DO | User without invoice report access is denied dealer outstanding URL | e2e/features/finance/dealer-outstanding/dealer-outstanding.feature | @negative @p2 @iacs-ed | ✅ |
