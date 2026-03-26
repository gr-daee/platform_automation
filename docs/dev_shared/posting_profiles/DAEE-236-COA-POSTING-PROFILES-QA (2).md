# DAEE-236: COA & Posting Profiles — Comprehensive QA Document

**Ticket:** DAEE-236 (Posting Profiles SSoT Migration)
**Date:** March 5, 2026
**By:** Gireesh (SRE) & Poojitha (FullStack) & Pavan (DevSecOps/CTO) & Geetha (UX/UI)
**Environments:** Staging (`aapqtirfzwzfosvnzawo`) | Production (`fuedgyvbymaljpnflmdy`)
**Tenant:** IDHYAHAGRI (`d2353f40-81ea-4f43-99d5-58dcf0becdc5`)

---

## Related Documents & Files

| Document | Path | Description |
|----------|------|-------------|
| Test Cases (MD) | `docs/DAEE-236-POSTING-PROFILES-TEST-CASES.md` | 65 test cases with UI routes verified |
| Test Cases (XLSX) | `docs/DAEE-236-Posting-Profiles-Test-Cases.xlsx` | 5-sheet workbook: Tests, Summary, GL Mapping, Tracker, UI Audit |
| COA Account Mapping | `docs/DAEE-236-COA-Account-Mapping.xlsx` | Staging vs Production COA code mapping |
| COA Gap Analysis | `docs/DAEE-236-COA-GAP-ANALYSIS.md` | Gap analysis for Chart of Accounts |
| Posting Profiles Gap Analysis | `docs/DAEE-236-POSTING-PROFILES-GAP-ANALYSIS.md` | Gap analysis for posting profiles table |
| XLSX Generator Script | `docs/generate_daee236_test_xlsx.py` | Python script to regenerate test XLSX |
| Resolver Source | `src/lib/posting-profile-resolver.ts` | resolveGL / resolveMultipleGL utility |
| Types Source | `src/app/finance/posting-profiles/types.ts` | PostingModuleType / PostingAccountType enums |

---

## Flow Diagrams

### 1. End-to-End: COA → Posting Profile → Journal Entry

```
                        SETUP (Admin)                              RUNTIME (System)
  ┌─────────────────────────────────────────┐    ┌──────────────────────────────────────────┐
  │                                         │    │                                          │
  │  ┌───────────────────────────┐          │    │  Business Transaction                    │
  │  │ /finance/chart-of-accounts│          │    │  (Invoice, Payment, Credit Memo, etc.)   │
  │  │                           │          │    │           │                              │
  │  │  CRUD / XLSX Import       │          │    │           ▼                              │
  │  │  ┌──────────────┐         │          │    │  ┌──────────────────────┐                │
  │  │  │ COA Accounts │─────────┼──UUID──┐ │    │  │ Server Action        │                │
  │  │  │ (1702, 4070) │         │        │ │    │  │ (e.g. createCreditMemo)│               │
  │  │  └──────────────┘         │        │ │    │  └──────────┬───────────┘                │
  │  └───────────────────────────┘        │ │    │             │                            │
  │                                       │ │    │             ▼                            │
  │  ┌───────────────────────────┐        │ │    │  ┌──────────────────────┐                │
  │  │ /finance/posting-profiles │        │ │    │  │ resolveGL() /         │                │
  │  │ /matrix                   │        │ │    │  │ resolveMultipleGL()   │                │
  │  │                           │        │ │    │  │                      │                │
  │  │  ┌──────────────────────┐ │        │ │    │  │  Cache Hit?           │                │
  │  │  │ posting_profiles     │ │        ▼ │    │  │  ├─ YES → Return UUID │                │
  │  │  │ module_type          │ │  gl_account_id │  │  ├─ NO → Query DB    │                │
  │  │  │ account_type         │─┼────────┘ │    │  │  │   ┌──────────┐    │                │
  │  │  │ gl_account_id (FK)   │ │          │    │  │  │   │posting_  │    │                │
  │  │  │ rule_priority        │ │          │    │  │  │   │profiles  │    │                │
  │  │  │ is_active            │ │          │    │  │  │   │table     │    │                │
  │  │  └──────────────────────┘ │          │    │  │  │   └──────────┘    │                │
  │  └───────────────────────────┘          │    │  │  └─ Return UUID      │                │
  │                                         │    │  └──────────┬───────────┘                │
  │                                         │    │             │                            │
  │                                         │    │             ▼                            │
  │                                         │    │  ┌──────────────────────┐                │
  │                                         │    │  │ journal_entry_headers │                │
  │                                         │    │  │ journal_entry_lines   │                │
  │                                         │    │  │  chart_of_account_id  │ ← UUID used   │
  │                                         │    │  └──────────────────────┘                │
  └─────────────────────────────────────────┘    └──────────────────────────────────────────┘
```

### 2. COA XLSX Import Flow

```
  User (Admin/Finance Manager)
       │
       ▼
  /finance/chart-of-accounts
  ┌─────────────────────────┐
  │ Click "Download Template"│
  └────────┬────────────────┘
           ▼
  Browser generates COA_Template_YYYY-MM-DD.xlsx
  ┌─────────────────────────────────┐
  │ Sheet 1: Instructions           │
  │ Sheet 2: Chart of Accounts      │
  │  - account_code (required)      │
  │  - account_name (required)      │
  │  - account_type (required)      │
  │  - parent_account_code          │
  │  - schedule3_note               │
  │  - schedule3_classification     │
  │  - depreciation_method          │
  │  - useful_life_years            │
  │  - is_active (Y/N)             │
  └────────┬────────────────────────┘
           ▼
  User fills template with accounts
           │
           ▼
  /finance/chart-of-accounts → Click "Import"
  ┌─────────────────────────┐
  │ Select filled .xlsx file │
  └────────┬────────────────┘
           ▼
  Client-side: XLSX.read() → JSON
           │
           ▼
  Server Action: importChartOfAccounts(rows)
  ┌──────────────────────────────────────┐
  │ For each row:                        │
  │  1. Validate required fields         │
  │  2. Check duplicate account_code     │
  │  3. Resolve parent_account_code      │
  │  4. Map account_type to enum         │
  │  5. INSERT to master_chart_of_accounts│
  │  6. Track success/failure per row    │
  └────────┬─────────────────────────────┘
           ▼
  Import Results Dialog
  ┌──────────────────────────┐
  │ Total: 45 | Success: 42  │
  │ Failed: 3                │
  │ Error details per row    │
  └──────────────────────────┘
```

### 3. Cross-Environment Resolution Flow

```
  SAME CODE, SAME posting_profile key:
  sales|ar_control

  ┌─────────────────────────┐     ┌──────────────────────────┐
  │       STAGING            │     │       PRODUCTION          │
  │                          │     │                           │
  │  posting_profiles:       │     │  posting_profiles:        │
  │  sales|ar_control        │     │  sales|ar_control         │
  │  gl_account_id: UUID-A   │     │  gl_account_id: UUID-B    │
  │          │                │     │          │                │
  │          ▼                │     │          ▼                │
  │  master_chart_of_accounts│     │  master_chart_of_accounts │
  │  UUID-A → code: 1702     │     │  UUID-B → code: 1601      │
  │  name: "Trade Debtors    │     │  name: "Trade Debtors"    │
  │         - A/R"            │     │                           │
  │                          │     │                           │
  │  SAME purpose: AR Control│     │  SAME purpose: AR Control │
  │  DIFFERENT code/UUID     │     │  DIFFERENT code/UUID      │
  └──────────────────────────┘     └───────────────────────────┘

  resolveGL('sales', 'ar_control') → Environment-specific UUID
  NO hardcoded codes → Works on BOTH environments
```

### 4. Posting Profile Resolution with Cache

```
  resolveGL(tenantId, moduleType, accountType)
           │
           ▼
  ┌──────────────────┐
  │ Build cache key:  │
  │ tenantId|module|  │
  │ account           │
  └────────┬─────────┘
           ▼
  ┌──────────────────┐    YES    ┌─────────────────┐
  │ Key in cache AND  ├─────────►│ Return cached    │
  │ age < 10 minutes? │          │ gl_account_id    │
  └────────┬─────────┘          └─────────────────┘
           │ NO
           ▼
  ┌──────────────────────────────────┐
  │ Query posting_profiles:           │
  │  WHERE tenant_id = ?              │
  │    AND module_type = ?            │
  │    AND account_type = ?           │
  │    AND is_active = true           │
  │  ORDER BY rule_priority DESC      │
  │  LIMIT 1                          │
  └────────┬─────────────────────────┘
           │
           ▼
  ┌──────────────────┐    NOT     ┌──────────────────────────┐
  │ Result found?     ├──FOUND───►│ THROW                     │
  │                   │           │ PostingProfileNotFoundError│
  └────────┬─────────┘           │ "module|account not found" │
           │ FOUND                └──────────────────────────┘
           ▼
  ┌──────────────────┐
  │ Store in cache    │
  │ (10-min TTL,      │
  │  500 entry LRU)   │
  └────────┬─────────┘
           ▼
  Return gl_account_id (UUID)
```

---

## User Stories & Acceptance Criteria

---

### US-1: Chart of Accounts Management

**User Story**

As a Finance Manager, I want to manage the Chart of Accounts (COA) with full CRUD, tree-view hierarchy, and Schedule III compliance, so that the GL structure matches Companies Act 2013 requirements and supports environment-specific account codes.

**Context**

The COA is the foundation of all financial posting. Each account has a code, name, type (asset/liability/equity/revenue/expense), and optional parent for hierarchical grouping. The same business concept (e.g., "Trade Debtors") may have different codes on staging vs production.

**UI Route:** `/finance/chart-of-accounts`

**Acceptance Criteria**

- AC1.1: Page loads with tree-view hierarchy showing all accounts grouped by type (Asset, Liability, Equity, Revenue, Expense)
- AC1.2: Each account shows: account_code, account_name, account_type, parent, is_active badge, balance
- AC1.3: Create new account: code (unique), name, type (dropdown), parent (optional dropdown), Schedule III note, classification
- AC1.4: Edit existing account: all fields editable except account_code (immutable after creation)
- AC1.5: Toggle active/inactive: soft-delete, does NOT delete — deactivated accounts shown greyed
- AC1.6: Search by code or name with instant filter
- AC1.7: Export current COA as XLSX (Export button)
- AC1.8: Download blank XLSX template (Download Template button)
- AC1.9: Import accounts from filled XLSX template (Import button) — see US-2
- AC1.10: Schedule III fields: `schedule3_note` and `schedule3_classification` populated per Companies Act 2013

**Edge Cases**

| # | Scenario | Expected |
|---|----------|----------|
| E1.1 | Duplicate account_code | Error: "Account code already exists" |
| E1.2 | Create child before parent | Error: "Parent account not found" |
| E1.3 | Deactivate account referenced by posting_profile | Warning displayed; deactivation allowed but posting resolution may fail |
| E1.4 | Delete account with journal_entry_lines | Blocked: "Account has journal entries, cannot delete" |
| E1.5 | Account code with special characters | Validation: alphanumeric + hyphen only |

---

### US-2: COA XLSX Import/Export

**User Story**

As a Finance Manager, I want to download a COA template, fill it with accounts offline, and import it back, so that I can bulk-load accounts during initial setup or migration without manual data entry.

**Context**

COA XLSX import exists and is functional. Template has 2 sheets: Instructions + Chart of Accounts. Import validates each row, checks parent ordering, and reports success/failure per row. This feature is at `/finance/chart-of-accounts` via the Import/Download Template buttons.

**UI Route:** `/finance/chart-of-accounts` (Import / Download Template / Export buttons)

**Acceptance Criteria**

- AC2.1: "Download Template" generates `COA_Template_YYYY-MM-DD.xlsx` with Instructions sheet + Chart of Accounts sheet
- AC2.2: Template columns: account_code, account_name, account_type, parent_account_code, normal_balance, schedule3_note, schedule3_classification, depreciation_method, useful_life_years, is_active
- AC2.3: Template includes sample rows demonstrating valid data
- AC2.4: "Import" button opens file picker accepting `.xlsx` / `.xls` only
- AC2.5: Import processes rows sequentially; parent accounts MUST appear before child accounts
- AC2.6: Import Results dialog shows: Total rows, Successful, Failed, Error details per failed row, Created accounts list
- AC2.7: "Export" downloads current COA as XLSX with all active accounts and their balances
- AC2.8: Import validates: required fields (code, name, type), valid account_type enum, duplicate codes, parent existence
- AC2.9: Partial import allowed — successful rows committed, failed rows reported with line numbers

**Edge Cases**

| # | Scenario | Expected |
|---|----------|----------|
| E2.1 | Upload non-Excel file (.csv, .pdf) | Error: "Please upload an Excel file (.xlsx or .xls)" |
| E2.2 | Empty file (no data rows) | Error: "No data to import" |
| E2.3 | Missing required column (account_code) | Row fails: "Missing required field: account_code" |
| E2.4 | Parent code in row 10, child code in row 5 | Row 5 fails: "Parent account code not found. Import parent accounts first." |
| E2.5 | Duplicate account_code in same import | First occurrence succeeds; second fails: "Account code already exists" |
| E2.6 | 500+ rows import | All rows processed; performance < 30 seconds |
| E2.7 | account_type not in enum | Row fails: "Invalid account type" |
| E2.8 | Import with is_active = N | Account created but inactive |
| E2.9 | Re-import same file (idempotency) | All rows fail: "Account code already exists" (no duplicates created) |

**Test Steps**

1. Navigate to `/finance/chart-of-accounts`
2. Click "Download Template" → verify XLSX downloads with 2 sheets
3. Open template → verify Instructions sheet has guidance
4. Fill in 5-10 sample accounts with proper hierarchy (parents first)
5. Click "Import" → select filled file
6. Verify Import Results dialog appears with correct counts
7. Verify new accounts appear in the tree view
8. Verify parent-child hierarchy is correct
9. Click "Export" → verify exported XLSX contains all accounts including newly imported ones

---

### US-3: Posting Profiles Management

**User Story**

As a Finance Manager, I want to configure posting profiles that map `module_type|account_type` to GL accounts, so that all business transactions automatically post to the correct GL accounts without hardcoded references.

**Context**

Posting Profiles is the core GL determination engine. Each profile maps a business concept (e.g., `sales|ar_control`) to a specific COA account UUID. The Matrix Manager allows CRUD of these mappings with priority-based resolution. No XLSX import/export exists for posting profiles (COA has it, posting profiles does not).

**UI Routes:**

| Route | Page | Purpose |
|-------|------|---------|
| `/finance/posting-profiles` | Dashboard | Overview with navigation cards |
| `/finance/posting-profiles/matrix` | Matrix Manager | **Core**: Create/edit/delete posting profile rules |
| `/finance/posting-profiles/customer-groups` | Customer Groups | Classify customers (DEALER, RETAIL, EXPORT) |
| `/finance/posting-profiles/item-groups` | Item Groups | Classify items (FINISHED-GOODS, RAW-MATERIAL) |
| `/finance/posting-profiles/vendor-groups` | Vendor Groups | Classify vendors (DOMESTIC, IMPORT) |
| `/finance/posting-profiles/tax-matrix` | Tax Matrix | GST tax code → GL by state/location |
| `/finance/posting-profiles/simulation` | Simulation Tool | Test GL determination before going live |

**Acceptance Criteria**

- AC3.1: Dashboard at `/finance/posting-profiles` shows 6 navigation cards with descriptions and badges
- AC3.2: Matrix Manager (`/finance/posting-profiles/matrix`) lists all active posting profiles with: module_type, account_type, GL account (code + name), rule_priority, is_active
- AC3.3: Create new profile: select module_type (dropdown), account_type (dropdown), GL account (searchable dropdown from COA), rule_priority (integer), is_active (toggle)
- AC3.4: Edit existing profile: all fields editable
- AC3.5: Delete profile: confirmation dialog, soft-delete
- AC3.6: Customer/Item/Vendor Groups: CRUD with group_code, group_name, description, is_active
- AC3.7: Tax Matrix: map tax codes to GL accounts by warehouse/location for multi-state GST
- AC3.8: Simulation Tool: select transaction type, customer/item/vendor groups → shows which GL accounts would be resolved
- AC3.9: 9 module_types available: sales, purchase, inventory, finance, manufacturing, dealer_management, tax_compliance, hr, general
- AC3.10: 96+ account_types available matching DB enum

**Edge Cases**

| # | Scenario | Expected |
|---|----------|----------|
| E3.1 | Create duplicate module_type + account_type | Allowed (rule_priority differentiates) |
| E3.2 | Two profiles same key, different priorities | Higher priority wins in resolveGL |
| E3.3 | Deactivate a profile used by live workflows | Profile becomes invisible to resolveGL; workflows will fail with PostingProfileNotFoundError |
| E3.4 | GL account dropdown empty | COA has no active accounts; show "No accounts available" |
| E3.5 | rule_priority = 0 | Valid; lowest priority |
| E3.6 | Simulation with no matching profile | Simulation shows "No profile found for this combination" |

---

### US-4: Posting Profile Runtime Resolution (resolveGL)

**User Story**

As a System, when a business transaction occurs (invoice, payment, credit memo, etc.), I want to automatically resolve the correct GL account UUID from posting_profiles using `resolveGL()`, so that journal entries are posted to environment-correct accounts without hardcoded codes.

**Context**

`resolveGL()` and `resolveMultipleGL()` in `src/lib/posting-profile-resolver.ts` are the runtime resolution functions. They query `posting_profiles` with 10-minute in-memory cache (500 entries LRU). If a profile is missing, they throw `PostingProfileNotFoundError` with a clear message identifying the missing `module|account`.

**Acceptance Criteria**

- AC4.1: `resolveGL(tenantId, module, account)` returns UUID matching `posting_profiles WHERE module_type AND account_type AND is_active=true ORDER BY rule_priority DESC`
- AC4.2: `resolveMultipleGL(tenantId, specs[])` resolves N profiles in a single DB query (batch optimization)
- AC4.3: Missing profile throws `PostingProfileNotFoundError` with message: `"Posting profile not found: {module}|{account} for tenant {tenantId}"`
- AC4.4: Cache TTL = 10 minutes; entries evicted after expiry
- AC4.5: Cache max = 500 entries; LRU eviction when full
- AC4.6: `clearGLCache()` available for immediate cache flush after profile updates
- AC4.7: `resolveMultipleGL` fails atomically — if ANY spec is missing, entire batch throws error (no partial results)
- AC4.8: All 17 critical posting profiles resolve correctly on both staging and production

**17 Critical Posting Profiles**

| # | Module | Account | Purpose | Staging Code | Prod Code |
|---|--------|---------|---------|-------------|-----------|
| 1 | sales | ar_control | Trade Debtors (AR) | 1702 | 1601 |
| 2 | sales | bad_debt_expense | Bad Debts Written Off | 6495 | 6495 |
| 3 | sales | credit_writeoff | Provision for Doubtful | 1709 | 1709 |
| 4 | sales | early_payment_discount | EPD Expense | 6502 | 6502 |
| 5 | sales | revenue | Sales Revenue | 4100 | 4001 |
| 6 | sales | gst_output_cgst | Output CGST | 2310 | 2630 |
| 7 | sales | gst_output_sgst | Output SGST | 2311 | 2631 |
| 8 | sales | gst_output_igst | Output IGST | 2312 | 2632 |
| 9 | finance | bank_control | Primary Bank | 1112 | 1810 |
| 10 | finance | bank_van | Axis Bank VAN | 1812 | 1812 |
| 11 | finance | unapplied_cash | Unapplied Cash | 2050 | 2050 |
| 12 | finance | retained_earnings | Retained Earnings | 3200 | 3130 |
| 13 | finance | petty_cash | Petty Cash | 1802 | 1802 |
| 14 | purchase | ap_control | Accounts Payable | 2200 | 2200 |
| 15 | purchase | gst_input_cgst | Input CGST | 1410 | 1410 |
| 16 | inventory | inventory_asset | Inventory Asset | 1300 | 1300 |
| 17 | dealer_management | credit_note | Credit Memo | 4070 | 4070 |

---

### US-5: Cross-Environment Verification

**User Story**

As a DevSecOps Admin, I want to verify that the same codebase works correctly on both staging and production with different COA data, so that deployments are environment-agnostic and no hardcoded account codes remain.

**Context**

The entire DAEE-236 migration eliminates ~30 hardcoded GL account codes across 12+ server action files. The same `posting_profiles` key (e.g., `sales|ar_control`) resolves to different UUIDs on staging vs production, pointing to different COA codes but same business purpose.

**Acceptance Criteria**

- AC5.1: Zero hardcoded account codes in runtime paths (verified via grep)
- AC5.2: Core workflows pass on staging: Cash Receipt, VAN Reconciliation, Credit Memo, Apply Cash Receipt
- AC5.3: Same 4 workflows pass on production with different UUIDs
- AC5.4: `findAccountByCode` has zero callers (fully deprecated)
- AC5.5: `getCOAAccountByCode` has zero callers (only @deprecated definition remains)
- AC5.6: `finance_defaults` query removed from all GL resolution paths (only Admin UI write paths remain)
- AC5.7: TypeScript compilation passes (`npx tsc --noEmit` = 0 errors)

**Verification Commands**

```bash
# All must return ZERO results:
grep -rn "'1702'" src/app/finance/ src/lib/journal-automation.ts
grep -rn "'1200'" src/app/finance/actions/ src/app/finance/dealer-ledger/ src/app/finance/payment-discounts/ src/lib/journal-automation.ts
grep -rn "'1709'" src/app/finance/
grep -rn "'6495'" src/app/finance/
grep -rn "'2050'" src/app/finance/
grep -rn "'3200'" src/app/finance/
grep -rn "'1112'" src/app/finance/ src/lib/journal-automation.ts
grep -rn "findAccountByCode" src/
grep -rn "finance_defaults" src/app/finance/actions/ src/app/finance/cash-receipts/ src/app/finance/van-payments/ src/lib/journal-automation.ts
```

---

### US-6: COA XLSX Template & Import Testing

**User Story**

As a QA Tester, I want to verify that the COA XLSX template download, fill, and import cycle works end-to-end, so that new tenants can bulk-load their Chart of Accounts during onboarding.

**Context**

This is an EXISTING feature at `/finance/chart-of-accounts`. The template is generated client-side using the `xlsx` library. Import processes rows via `importChartOfAccounts()` server action with per-row validation.

**UI Route:** `/finance/chart-of-accounts`

**Acceptance Criteria**

- AC6.1: "Download Template" button generates XLSX with Instructions + Chart of Accounts sheets
- AC6.2: Template is usable offline — no network dependency after download
- AC6.3: Filled template imports successfully with correct parent-child relationships
- AC6.4: Import validates: required fields, account_type enum, parent existence, duplicate codes
- AC6.5: Partial success: valid rows imported, invalid rows reported with errors
- AC6.6: Import Results dialog is readable and actionable (row numbers, error messages)
- AC6.7: Imported accounts visible in tree view after import
- AC6.8: Export includes all accounts (active + inactive) with current balances
- AC6.9: Template follows Schedule III (Companies Act 2013) structure

**Test Steps — Full Cycle**

1. **Download Template**
   - Navigate to `/finance/chart-of-accounts`
   - Click "Download Template"
   - Open `COA_Template_YYYY-MM-DD.xlsx`
   - Verify Instructions sheet with guidelines
   - Verify Chart of Accounts sheet with headers and sample data

2. **Fill Template (Offline)**
   - Add accounts following Schedule III structure:
     ```
     1000, Fixed Assets, asset, , , Note 11, Non-Current Asset
     1010, Plant & Machinery, asset, 1000, debit, Note 11, Non-Current Asset, SLM, 15
     1020, Office Equipment, asset, 1000, debit, Note 11, Non-Current Asset, WDV, 5
     2000, Current Liabilities, liability, , credit
     2010, Trade Payables, liability, 2000, credit, Note 9, Current Liability
     4000, Revenue from Operations, revenue, , credit, Note 23, Revenue
     5000, Cost of Materials, expense, , debit, Note 26, Expense
     ```
   - Ensure parents appear BEFORE children

3. **Import**
   - Click "Import" button
   - Select filled template
   - Wait for processing
   - Verify Import Results dialog
   - Verify all rows successful (or expected failures with clear messages)

4. **Verify**
   - Refresh page
   - Find imported accounts in tree view
   - Verify parent-child hierarchy is correct
   - Verify Schedule III fields populated

5. **Export**
   - Click "Export"
   - Open exported XLSX
   - Verify imported accounts present
   - Verify column headers match template

---

## Feature Gap Disclosure (Honest Assessment)

### COA XLSX Import/Export — EXISTS

| Feature | Status | Location |
|---------|--------|----------|
| Download Template | Implemented | `/finance/chart-of-accounts` → "Download Template" button |
| Import from XLSX | Implemented | `/finance/chart-of-accounts` → "Import" button |
| Export to XLSX | Implemented | `/finance/chart-of-accounts` → "Export" button |
| Import Results Dialog | Implemented | Shows after import with success/failure per row |

### Posting Profiles XLSX Import/Export — IMPLEMENTED

| Feature | Status | Location |
|---------|--------|----------|
| Download Template | Implemented | `/finance/posting-profiles/matrix` → "Download Template" button |
| Import from XLSX | Implemented | `/finance/posting-profiles/matrix` → "Import" button |
| Export to XLSX | Implemented | `/finance/posting-profiles/matrix` → "Export" button |
| Import Results Dialog | Implemented | Shows after import with success/failure per row |

**Template includes 3 sheets:** Posting Profiles (data entry), Valid Modules (9 module types), Valid Account Types (96+ types grouped by module). Row-by-row validation ensures bad rows don't block good rows. Import auto-clears the GL resolver cache.

### Posting Groups Integration — PHASE 2 (Documented)

| Section | UI CRUD | DB Table | Posting Profile FK | Entity FK Column | Runtime Usage | Status |
|---------|---------|----------|-------------------|------------------|---------------|--------|
| Customer Posting Groups | Working | 5 rows | `posting_profiles.customer_posting_group_id` EXISTS | `master_dealers.customer_posting_group_id` **MISSING** | `invoiceGLMapping.ts` returns null (correct) | Setup Only |
| Item Posting Groups | Working | 6 rows | `posting_profiles.item_posting_group_id` EXISTS | `master_products.item_posting_group_id` **MISSING** | `invoiceGLMapping.ts` returns null (correct) | Setup Only |
| Vendor Posting Groups | Working | 3 rows | `posting_profiles.vendor_posting_group_id` EXISTS | `suppliers.vendor_posting_group_id` **MISSING** | Not yet wired to any server action | Setup Only |

**Code Fixes Applied (March 2026):**
- `invoiceGLMapping.ts`: Fixed `getCustomerPostingGroupId()` from querying non-existent `dealers` table → now queries `master_dealers`
- `invoiceGLMapping.ts`: Fixed `getItemPostingGroupId()` from querying non-existent `products` table → now queries `master_products`
- Both functions return null gracefully (no console errors) until Phase 2 FK columns are added
- Dashboard navigation cards show "Setup Only" badge for group pages
- Each group page has info alert explaining Phase 2 status

**See:** `docs/POSTING-PROFILES-USE-CASE-GUIDE.md` Section 7 for full gap disclosure and Phase 2 plan.

---

## Indian Compliance Coverage

### Companies Act 2013 — Schedule III

| Requirement | Coverage | How |
|-------------|----------|-----|
| Balance Sheet format | COA `schedule3_classification` field | Each account mapped to Schedule III line item |
| Profit & Loss format | COA `schedule3_note` field | Revenue/Expense accounts tagged with note numbers |
| Fixed Assets disclosure | COA `depreciation_method`, `useful_life_years` | SLM/WDV method with useful life per Companies Act |
| Current vs Non-Current classification | COA hierarchy + type | Asset/Liability split into current/non-current |
| Notes to Financial Statements | COA `schedule3_note` (Notes 1-32) | Each account linked to correct note number |

### Ind AS Compliance

| Standard | Coverage | How |
|----------|----------|-----|
| Ind AS 1 (Presentation) | Consistent GL structure across environments | posting_profiles → environment-agnostic |
| Ind AS 109 (Financial Instruments) | ECL provisioning GL from posting_profiles | `sales|bad_debt_expense`, `sales|credit_writeoff` |
| Ind AS 18/115 (Revenue) | Revenue recognition GL | `sales|revenue` posting profile |

### GST Compliance (CGST Act)

| Requirement | Coverage | How |
|-------------|----------|-----|
| S.35 — Books of account per GSTIN | Tenant-isolated posting_profiles | Each tenant has own GL mapping |
| Output tax tracking | Separate CGST/SGST/IGST GL accounts | `sales|gst_output_cgst/sgst/igst` profiles |
| Input tax tracking | Separate input GST GL | `purchase|gst_input_cgst` profile |
| Inter-state vs Intra-state | Tax Matrix | `/finance/posting-profiles/tax-matrix` |
| Tax rate from product master | DAEE-247 fix | `?? 0` nullish coalescing preserves 0% |

---

## UI Navigation Quick Reference

### For Tenant Users (Finance Team)

| What To Do | Navigate To | Notes |
|------------|-------------|-------|
| View/Edit Chart of Accounts | `/finance/chart-of-accounts` | Tree view with CRUD |
| Download COA template | `/finance/chart-of-accounts` → "Download Template" | XLSX with Instructions |
| Import COA from Excel | `/finance/chart-of-accounts` → "Import" | Must be .xlsx/.xls |
| Export COA to Excel | `/finance/chart-of-accounts` → "Export" | All accounts with balances |
| View Posting Profiles Dashboard | `/finance/posting-profiles` | Overview of all 6 sub-pages |
| Create/Edit Posting Profile Rules | `/finance/posting-profiles/matrix` | Core GL determination engine |
| Manage Customer Groups | `/finance/posting-profiles/customer-groups` | DEALER, RETAIL, EXPORT |
| Manage Item Groups | `/finance/posting-profiles/item-groups` | FINISHED-GOODS, RAW-MATERIAL |
| Manage Vendor Groups | `/finance/posting-profiles/vendor-groups` | DOMESTIC, IMPORT |
| Configure Tax Matrix (GST) | `/finance/posting-profiles/tax-matrix` | Tax code → GL by location |
| Test GL Determination | `/finance/posting-profiles/simulation` | Dry-run before going live |

### For QA Team (Testing Workflows)

| Workflow To Test | Start At | Key Action |
|------------------|----------|------------|
| Cash Receipt Create | `/finance/cash-receipts/new` | Creates JE with unapplied_cash from posting_profiles |
| Cash Receipt Apply | `/finance/cash-receipts/[id]/apply` | Moves from unapplied_cash to ar_control |
| Cash Receipt Unapply | `/finance/cash-receipts/[id]` | Reverses application JE |
| Cash Receipt Reverse | `/finance/cash-receipts/[id]` | Reversal with bank_control fallback |
| VAN Reconciliation | `/finance/van-payments/[id]/reconcile` | Uses bank_van with bank_control fallback |
| Credit Memo (Finance) | `/finance/credit-memos/new` | Uses dealer_management|credit_note (4070) |
| Credit Memo (Sales Return) | `/o2c/sales-returns/[id]` → "Create Credit Memo" | Same as above |
| Invoice JE (O2C) | `/o2c/sales-orders/[id]` → Generate Invoice | Uses ar_control, revenue, gst_output_* |
| Dealer Ledger | `/finance/dealer-ledger` | Uses ar_control for balance |
| Fiscal Period Close | `/finance/fiscal-periods` | Uses retained_earnings |
| ECL Report | `/finance/reports/ecl-provisioning` | Uses bad_debt_expense, credit_writeoff |
| AR Health Dashboard | `/finance/reports/ar-health` | Uses ar_control UUID |
| GL-AR Reconciliation | `/finance/reports/gl-ar-reconciliation` | Uses ar_control UUID |
| EPD Settings | `/finance/epd-settings` | Configuration page |
| Indent with GST | `/o2c/indents/create` | Tax from product master, ?? 0 |

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| User Stories | 6 |
| Acceptance Criteria | 52 |
| Edge Cases | 21 |
| Flow Diagrams | 4 |
| UI Pages (COA) | 1 |
| UI Pages (Posting Profiles) | 7 |
| UI Pages (Workflows using posting_profiles) | 15+ |
| Critical Posting Profiles | 17 |
| XLSX Import/Export for COA | Implemented |
| XLSX Import/Export for Posting Profiles | NOT Implemented (future enhancement) |
| Indian Compliance Standards | Schedule III, Ind AS 1/109/115, CGST Act S.35 |
| Dead Code Files | 4 (writeOff, postInventoryMovement, postSupplierInvoice, postVendorPayment) |
| Related XLSX Files | `DAEE-236-COA-Account-Mapping.xlsx`, `DAEE-236-Posting-Profiles-Test-Cases.xlsx` |
