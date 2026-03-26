# Posting Profiles — Use-Case Guide for Every DRI

**Ticket:** DAEE-236 / DAEE-250 / DAEE-251
**Date:** March 5, 2026
**By:** Gireesh (SRE), Poojitha (FullStack), Pavan (CTO), Geetha (UX/Audit)
**Tenant:** IDHYAHAGRI | **Staging DB:** `aapqtirfzwzfosvnzawo`

---

## Table of Contents

1. [What is Posting Profiles?](#1-what-is-posting-profiles)
2. [Section-by-Section Explanation](#2-section-by-section-explanation)
3. [Hierarchical Matching — Real-World ERP Scenarios](#3-hierarchical-matching--real-world-erp-scenarios)
4. [Tax Determination Matrix — Working Example](#4-tax-determination-matrix--working-example)
5. [Posting Simulation — How to Test](#5-posting-simulation--how-to-test)
6. [How It Flows at Runtime (Code Trace)](#6-how-it-flows-at-runtime-code-trace)
7. [Honest Gap Disclosure](#7-honest-gap-disclosure)
8. [Phase 2 Implementation Plan](#8-phase-2-implementation-plan)
9. [Test Cases & Edge Cases](#9-test-cases--edge-cases)
10. [UX Improvements](#10-ux-improvements)

---

## 1. What is Posting Profiles?

**Simple answer:** When DAEE creates a journal entry (invoice, payment, credit memo), it needs to know WHICH GL account to debit and credit. Posting Profiles is the rules table that answers: _"For this type of transaction, which GL account should I use?"_

**Without Posting Profiles:**
```
Create Invoice → Hardcoded: Dr 1702, Cr 4001
                 Problem: Code 1702 exists on staging but NOT on production!
```

**With Posting Profiles:**
```
Create Invoice → resolveGL('sales', 'ar_control') → UUID of correct GL account
                 Works on ANY environment automatically
```

### Current State (Staging)
- **145 active profiles** (131 at priority 10, 14 at priority 0/100)
- **All 20+ server actions** use `resolveGL()` or `resolveMultipleGL()` for GL determination
- **Zero profiles** use customer/item/vendor group criteria (all are system defaults)

---

## 2. Section-by-Section Explanation

### 2.1 Posting Profiles Matrix (`/finance/posting-profiles/matrix`)

**What it does:** The core rules table. Each row says:

> _"When module = X and account_type = Y (and optionally group = Z and warehouse = W), use THIS GL account"_

**Current data (sample from staging):**

| Module | Account Type | GL Code | GL Name | Priority |
|--------|-------------|---------|---------|----------|
| sales | revenue | 4001 | Sales Revenue - Pharmaceutical Products | 10 |
| sales | ar_control | 1702 | Accounts Receivable - Trade Debtors | 10 |
| sales | bad_debt_expense | 6495 | Bad Debts Written Off | 10 |
| finance | bank_control | 1810 | Bank - HDFC Current Account | 0 |
| purchase | ap_control | 2503 | Accounts Payable - Trade Creditors | 10 |

**Who uses it:** Every server action that creates journal entries:
- `createCreditMemo.ts` → resolves `sales|ar_control` and `dealer_management|credit_note`
- `createCashReceipt.ts` → resolves `finance|bank_control` and `finance|unapplied_cash`
- `applyCashReceiptToInvoices.ts` → resolves `sales|ar_control` and `finance|unapplied_cash`
- `invoiceGLMapping.ts` → resolves `sales|revenue`, `sales|ar_control`, and tax accounts
- `eclProvisionActions.ts` → resolves `sales|bad_debt_expense` and `sales|credit_writeoff`
- ... and 15+ more

**When admin adds/changes a row:** The change takes effect within 10 minutes (cache TTL) or immediately if cache is cleared. No code deployment needed.

---

### 2.2 Customer Posting Groups (`/finance/posting-profiles/customer-groups`)

**What it does:** Classifies customers/dealers into categories for GL determination.

**Current data:**

| Code | Name |
|------|------|
| AP-DL | AP Customer |
| KA-DL | Karnataka Customer |
| TG-DL | TG Customer |
| TG-SL | TG-Dealer Sales |
| DEFAULT CUSTOMER PG | All customer's posting group |

**Real-World ERP Example (Tally / SAP Business One / Microsoft Dynamics):**

In traditional ERP systems, customer posting groups allow different GL accounts for different customer types:

```
Scenario: IDHYAHAGRI sells to 3 types of customers:
  1. Dealers (B2B) → AR goes to "1702 Trade Debtors"
  2. Retail (B2C) → AR goes to "1703 Retail Receivables"
  3. Export → AR goes to "1704 Export Receivables"

Without groups:  All sales → same AR account (1702)
With groups:     Dealer sale → 1702, Retail sale → 1703, Export → 1704
```

**How it SHOULD work (ERP best practice):**
1. Admin creates customer posting groups: DEALER, RETAIL, EXPORT
2. Admin assigns each group to dealers in the dealer master form
3. Admin creates posting profile rules:
   - `sales | ar_control | customer_group=DEALER` → GL 1702 (Priority 60)
   - `sales | ar_control | customer_group=RETAIL` → GL 1703 (Priority 60)
   - `sales | ar_control | customer_group=EXPORT` → GL 1704 (Priority 60)
   - `sales | ar_control` (no group = default) → GL 1702 (Priority 10)
4. At runtime: Invoice for dealer X → system looks up X's posting group → matches rule → correct GL

**Current gap:** See [Section 7 — Honest Gap Disclosure](#7-honest-gap-disclosure)

---

### 2.3 Item Posting Groups (`/finance/posting-profiles/item-groups`)

**What it does:** Classifies products into categories for GL determination.

**Current data:**

| Code | Name | Inventory Item? |
|------|------|----------------|
| FG-PESTICIDES | Finished Goods Pesticides | Yes |
| FG-PGR | PGR finished goods | Yes |
| RM-PACKAGING | Raw Material for Packaging Goods | Yes |
| RW-BULK SALTS | Raw Material for Bulk Salts | Yes |
| SERVICES | services | No |
| CNM-PRODUCTION | Consumables to be used in Production | No |

**Real-World ERP Example:**

```
Scenario: IDHYAHAGRI sells pesticides AND services (consulting):
  1. Pesticide sale → Revenue goes to "4001 Sales Revenue - Pharmaceutical"
  2. Service sale → Revenue goes to "4100 Service Revenue"
  3. Raw material sale (scrap) → Revenue goes to "4201 Scrap Revenue"

Posting profile rules:
  - sales | revenue | item_group=FG-PESTICIDES → GL 4001 (Priority 70)
  - sales | revenue | item_group=SERVICES → GL 4100 (Priority 70)
  - sales | revenue (default) → GL 4001 (Priority 10)

Also for COGS (Cost of Goods Sold):
  - purchase | cogs | item_group=FG-PESTICIDES → GL 5001 "Cost of Pesticides" (Priority 70)
  - purchase | cogs | item_group=RM-PACKAGING → GL 5050 "Cost of Packaging" (Priority 70)
```

**Why "is_inventory_item" matters:**
- `Yes` = items that affect inventory GL (track stock, FEFO, warehouse)
- `No` = services/consumables that go directly to expense (no inventory impact)

---

### 2.4 Vendor Posting Groups (`/finance/posting-profiles/vendor-groups`)

**What it does:** Classifies suppliers/vendors for GL determination.

**Current data:**

| Code | Name |
|------|------|
| RM-SUPPLIER | Raw Material Supplier |
| GH-SVS-VENDOR | General Services Vendor |
| FH-SVS-VENDOR | Factory Machinery Maintenance Vendor |

**Real-World ERP Example:**

```
Scenario: IDHYAHAGRI has 3 types of vendors:
  1. Raw Material Supplier → AP goes to "2503 Trade Creditors"
  2. Service Vendor → AP goes to "2510 Service Creditors"
  3. MSME Vendor → AP goes to "2515 MSME Trade Creditors" (MSMED Act 2006 compliance)

Posting profile rules:
  - purchase | ap_control | vendor_group=RM-SUPPLIER → GL 2503 (Priority 60)
  - purchase | ap_control | vendor_group=GH-SVS-VENDOR → GL 2510 (Priority 60)
  - purchase | ap_control (default) → GL 2503 (Priority 10)
```

**Indian Compliance (MSMED Act 2006):**
Separate AP tracking for MSME vendors is legally required under S.43 of MSMED Act. The Auditor needs to disclose MSME outstanding in Schedule III notes.

---

### 2.5 Tax Determination Matrix (`/finance/posting-profiles/tax-matrix`)

**What it does:** Maps GST tax codes to GL accounts, per warehouse and GSTIN.

**This section WORKS end-to-end.** It has real data and is used by `invoiceGLMapping.ts`.

**Current data (staging):**

| Tax Code | Warehouse | GSTIN | GL Code | GL Name |
|----------|-----------|-------|---------|---------|
| CGST-9-PAYABLE-KA | KU-001 (Kurnook) | 29AADCG4992P1ZP | 2630 | Output CGST Payable |
| SGST-9-PAYABLE-KA | KU-001 (Kurnook) | 29AADCG4992P1ZP | 2631 | Output SGST Payable |
| IGST-18-PAYABLE-KA | KU-001 (Kurnook) | 29AADCG4992P1ZP | 2632 | Output IGST Payable |
| IGST-18-PAYABLE-AP | AP-01 (AP Main) | 37AAECI9906Q1ZR | 2632 | Output IGST Payable |

**Real-World Scenario:**

```
Invoice from Kurnool warehouse (Karnataka, GSTIN 29AADCG...) to:

Case A: Customer in Karnataka (same state = INTRA-STATE)
  → System queries tax_determination_matrix for CGST + SGST
  → CGST-9-PAYABLE-KA → GL 2630 (Output CGST Payable)
  → SGST-9-PAYABLE-KA → GL 2631 (Output SGST Payable)
  → Journal: Dr 1702 (AR), Cr 4001 (Revenue), Cr 2630 (CGST), Cr 2631 (SGST)

Case B: Customer in AP (different state = INTER-STATE)
  → System queries for IGST
  → IGST-18-PAYABLE-KA → GL 2632 (Output IGST Payable)
  → Journal: Dr 1702 (AR), Cr 4001 (Revenue), Cr 2632 (IGST)
```

**Why per-warehouse:** Each warehouse has its own GSTIN registration. Under CGST Act S.25, every registered place of business must maintain separate books. The tax matrix ensures the correct GST output account is used per location.

---

### 2.6 Posting Simulation (`/finance/posting-profiles/simulation`)

**What it does:** A testing tool. You select module + account type + optional groups/warehouse, click "Simulate", and it shows which GL account the engine would pick. No data is written.

**How to use:**
1. Navigate to `/finance/posting-profiles/simulation`
2. Select Module = `sales`, Account Type = `revenue`
3. Leave groups/warehouse blank
4. Click "Run Simulation"
5. Result shows: GL 4001 "Sales Revenue", Priority 10, matched by System Default

**Use cases:**
- Auditor verifying GL mapping before year-end close
- Admin testing after adding new posting profile rules
- Debugging: "Why did invoice X post to wrong GL?"

---

## 3. Hierarchical Matching — Real-World ERP Scenarios

### How Priority Works

The posting engine picks the **most specific matching rule** (highest priority). Priority is auto-calculated:

```
Base = 10 (System Default — matches everything)
+ 50 if Warehouse specified
+ 30 if Item Posting Group specified
+ 20 if Customer/Vendor Posting Group specified

Examples:
  Priority 10  = Module + Account (default for all)
  Priority 60  = Module + Account + Customer Group
  Priority 70  = Module + Account + Item Group
  Priority 80  = Module + Account + Customer Group + Warehouse
  Priority 100 = Module + Account + Item Group + Customer Group + Warehouse
  Priority 110 = All four criteria
```

### Scenario 1: Fertilizer Distributor with Multiple Warehouses

```
IDHYAHAGRI has:
  - Kurnool Warehouse (KA) — registered under GSTIN 29AADCG...
  - Hyderabad Depot (TS) — registered under GSTIN 36AADCG...

Business need: Revenue from Kurnool → GL 4001 (pharma revenue)
               Revenue from Hyderabad → GL 4010 (fertilizer revenue)

Rules configured in Matrix:
  ┌─────────┬──────────┬───────────┬─────────┬──────────┐
  │ Module  │ Account  │ Warehouse │ GL Code │ Priority │
  ├─────────┼──────────┼───────────┼─────────┼──────────┤
  │ sales   │ revenue  │ (default) │ 4001    │ 10       │  ← fallback
  │ sales   │ revenue  │ KU-001    │ 4001    │ 60       │  ← Kurnool-specific
  │ sales   │ revenue  │ HYD01     │ 4010    │ 60       │  ← Hyderabad-specific
  └─────────┴──────────┴───────────┴─────────┴──────────┘

Runtime:
  Invoice from KU-001 → matches priority 60 (KU-001) → GL 4001
  Invoice from HYD01  → matches priority 60 (HYD01)  → GL 4010
  Invoice from FAC01  → no warehouse match → falls back to priority 10 → GL 4001
```

### Scenario 2: Different AR Accounts for Dealer Types

```
Business need:
  - Regular dealers (DEALER group) → AR to "1702 Trade Debtors"
  - Government contracts (GOVT group) → AR to "1705 Govt Receivables"
  - Export customers (EXPORT group) → AR to "1710 Export Debtors" (in USD)

Rules:
  ┌─────────┬────────────┬────────────────┬──────┬──────────┐
  │ Module  │ Account    │ Customer Group │ GL   │ Priority │
  ├─────────┼────────────┼────────────────┼──────┼──────────┤
  │ sales   │ ar_control │ (default)      │ 1702 │ 10       │
  │ sales   │ ar_control │ DEALER         │ 1702 │ 60       │
  │ sales   │ ar_control │ GOVT           │ 1705 │ 60       │
  │ sales   │ ar_control │ EXPORT         │ 1710 │ 60       │
  └─────────┴────────────┴────────────────┴──────┴──────────┘

Runtime (invoice for a GOVT customer):
  System checks dealer master → posting_group = GOVT
  Matches priority 60 (customer_group=GOVT) → GL 1705

Runtime (invoice for unknown customer type):
  posting_group = NULL → no group match → falls back to priority 10 → GL 1702
```

### Scenario 3: Combined — Product + Customer + Warehouse

```
Most specific scenario: Pesticide sold to DEALER from Kurnool warehouse

Rules:
  ┌─────────┬─────────┬───────────────┬────────────────┬───────────┬──────┬──────────┐
  │ Module  │ Account │ Item Group    │ Customer Group │ Warehouse │ GL   │ Priority │
  ├─────────┼─────────┼───────────────┼────────────────┼───────────┼──────┼──────────┤
  │ sales   │ revenue │ (default)     │ (default)      │ (default) │ 4001 │ 10       │
  │ sales   │ revenue │ FG-PESTICIDES │ (default)      │ (default) │ 4001 │ 70       │
  │ sales   │ revenue │ SERVICES      │ (default)      │ (default) │ 4100 │ 70       │
  │ sales   │ revenue │ FG-PESTICIDES │ DEALER         │ (default) │ 4001 │ 90       │
  │ sales   │ revenue │ FG-PESTICIDES │ DEALER         │ KU-001    │ 4005 │ 110      │
  └─────────┴─────────┴───────────────┴────────────────┴───────────┴──────┴──────────┘

Runtime: Pesticide sale to DEALER from Kurnool
  → All criteria match Priority 110 rule → GL 4005

Runtime: Pesticide sale to DEALER from Hyderabad
  → No warehouse match → falls back to Priority 90 → GL 4001

Runtime: Service sale to DEALER
  → Item group = SERVICES, no DEALER+SERVICES combo → Priority 70 → GL 4100

Runtime: Unknown product to unknown customer
  → Priority 10 (default) → GL 4001
```

### Scenario 4: MSME Vendor Compliance (Indian Law)

```
Under MSMED Act 2006, companies must separately disclose MSME payables
in Schedule III notes (Companies Act 2013).

Rules for AP:
  ┌──────────┬────────────┬──────────────┬──────┬──────────┐
  │ Module   │ Account    │ Vendor Group │ GL   │ Priority │
  ├──────────┼────────────┼──────────────┼──────┼──────────┤
  │ purchase │ ap_control │ (default)    │ 2503 │ 10       │  ← Regular creditors
  │ purchase │ ap_control │ RM-SUPPLIER  │ 2503 │ 60       │  ← Raw material vendor
  │ purchase │ ap_control │ MSME-MICRO   │ 2515 │ 60       │  ← MSME Micro (S.43)
  │ purchase │ ap_control │ MSME-SMALL   │ 2516 │ 60       │  ← MSME Small (S.43)
  └──────────┴────────────┴──────────────┴──────┴──────────┘

Auditor benefit: Trial Balance shows 2515/2516 separately →
  automatic Schedule III MSME disclosure without manual tagging
```

### Scenario 5: Warehouse-Specific Bank Accounts

```
Each warehouse collects payments into different bank accounts:

Rules:
  ┌─────────┬──────────────┬───────────┬──────┬──────────┐
  │ Module  │ Account      │ Warehouse │ GL   │ Priority │
  ├─────────┼──────────────┼───────────┼──────┼──────────┤
  │ finance │ bank_control │ (default) │ 1810 │ 10       │  ← HDFC Main
  │ finance │ bank_control │ KU-001    │ 1811 │ 60       │  ← HDFC Kurnool Branch
  │ finance │ bank_control │ HYD01     │ 1812 │ 60       │  ← Axis Hyderabad VAN
  └─────────┴──────────────┴───────────┴──────┴──────────┘

Cash receipt from Kurnool → bank_control resolves to 1811
Cash receipt from Hyderabad → bank_control resolves to 1812
Cash receipt (unknown warehouse) → fallback 1810
```

---

## 4. Tax Determination Matrix — Working Example

This is the ONLY section that fully works end-to-end today.

### How It Flows

```
Invoice Created
    │
    ▼
invoiceGLMapping.ts → Is it inter-state or intra-state?
    │
    ├─ Intra-state (same GSTIN state code)
    │   ├─ determineTaxAccount({ tax_code: 'CGST', warehouse_id: 'KU-001' })
    │   │   → tax_determination_matrix: CGST-9-PAYABLE-KA → GL 2630
    │   └─ determineTaxAccount({ tax_code: 'SGST', warehouse_id: 'KU-001' })
    │       → tax_determination_matrix: SGST-9-PAYABLE-KA → GL 2631
    │
    └─ Inter-state (different state code)
        └─ determineTaxAccount({ tax_code: 'IGST', warehouse_id: 'KU-001' })
            → tax_determination_matrix: IGST-18-PAYABLE-KA → GL 2632
```

### When to Add Rows

Add a new row when:
- A new warehouse is registered with a new GSTIN
- A new tax rate is introduced (e.g., GST rate change from 18% to 12%)
- A new state registration is obtained

**Example:** IDHYAHAGRI opens a new warehouse in Maharashtra (GSTIN 27AADCG...). Admin adds:
- `CGST-9-PAYABLE-MH` → warehouse MH-01, GSTIN 27AADCG..., GL 2630
- `SGST-9-PAYABLE-MH` → warehouse MH-01, GSTIN 27AADCG..., GL 2631
- `IGST-18-PAYABLE-MH` → warehouse MH-01, GSTIN 27AADCG..., GL 2632

---

## 5. Posting Simulation — How to Test

### Step-by-Step

1. Go to `/finance/posting-profiles/simulation`
2. Select **Module** = `sales`
3. Select **Account Type** = `ar_control`
4. Leave all groups/warehouse blank
5. Click **"Run Simulation"**
6. Expected result: GL 1702 "Accounts Receivable - Trade Debtors", Priority 10

### Testing Hierarchical Rules

After creating a warehouse-specific rule (e.g., `sales|ar_control|warehouse=KU-001` → GL 1705):
1. Run simulation WITHOUT warehouse → Priority 10, GL 1702
2. Run simulation WITH warehouse KU-001 → Priority 60, GL 1705
3. This confirms the hierarchical matching works correctly

### What "dry_run" Means

The simulation uses `dry_run: true` in the `determineGLAccount()` call. This:
- Bypasses the cache (always queries DB)
- Never writes to cache
- Shows the exact rule that would match at runtime

---

## 6. How It Flows at Runtime (Code Trace)

### Path A: Most Server Actions (Flat Resolution)

Used by: `createCreditMemo`, `createCashReceipt`, `applyCashReceiptToInvoices`, `eclProvisionActions`, `writeOffActions`, `arMonitoringDashboard`, `reconcileGLAR`, `dealerLedgerActions`, `fiscalPeriodActions`, `vanPaymentActions`, etc.

```
Server Action (e.g., createCreditMemo.ts)
    │
    ▼
resolveMultipleGL(tenantId, [
  { module: 'sales', account: 'ar_control' },
  { module: 'dealer_management', account: 'credit_note' },
])
    │
    ▼
posting-profile-resolver.ts
    ├─ Check in-memory cache (key = "tenantId|sales|ar_control")
    ├─ Cache HIT → return UUID immediately (<1ms)
    └─ Cache MISS → query DB:
        SELECT gl_account_id FROM posting_profiles
        WHERE tenant_id = $1 AND module_type = $2 AND account_type = $3
          AND is_active = true
        ORDER BY rule_priority DESC LIMIT 1
        → Cache result (10-min TTL) → return UUID
```

**Important:** This path does NOT use customer/item/vendor groups. It's flat lookup by module + account.

### Path B: Invoice GL Mapping (Hierarchical Resolution)

Used by: `invoiceGLMapping.ts` (called during invoice posting)

```
Invoice Posting
    │
    ▼
determineInvoiceGLAccounts(request, tenantId)
    │
    ├─ getCustomerPostingGroupId(dealerId, tenantId)
    │   → queries master_dealers.customer_posting_group_id
    │   → currently returns NULL (column doesn't exist — see Gap #1)
    │
    ├─ determineGLAccount({
    │     tenant_id, module_type: 'sales', account_type: 'revenue',
    │     customer_posting_group_id: null,  ← always null today
    │     item_posting_group_id: null,
    │     warehouse_id: warehouseId
    │   })
    │   → Fetches ALL matching profiles, sorts by rule_priority DESC
    │   → Finds best match considering group+warehouse criteria
    │   → Returns GL account UUID
    │
    └─ determineTaxAccount({ tax_code: 'CGST', warehouse_id })
        → Queries tax_determination_matrix → Returns GL account
```

### Does Creating a Group Auto-Assign It?

**No.** Creating a customer/item/vendor posting group is ONLY master data setup. It does NOT auto-assign to any entity. The assignment flow is:

```
Step 1 (Admin): Create posting group "DEALER" in Customer Posting Groups UI
Step 2 (Admin): Assign "DEALER" to dealer X in the dealer master form  ← THIS STEP IS MISSING
Step 3 (Admin): Create posting profile rule with customer_group=DEALER
Step 4 (Runtime): Invoice for dealer X → system reads X's group → matches rule
```

Currently Step 2 is not possible because the FK column doesn't exist on `master_dealers`.

---

## 7. Honest Gap Disclosure

### Gap #1: `master_dealers` Missing `customer_posting_group_id` Column

| Aspect | Status |
|--------|--------|
| `customer_posting_groups` table | EXISTS — 5 rows |
| `posting_profiles.customer_posting_group_id` FK | EXISTS |
| `master_dealers.customer_posting_group_id` FK | **DOES NOT EXIST** — Phase 2 |
| Dealer form UI field to assign group | **DOES NOT EXIST** — Phase 2 |
| `invoiceGLMapping.ts` → `getCustomerPostingGroupId()` | **FIXED** — queries `master_dealers` (correct table), returns null gracefully until Phase 2 column is added |
| Dashboard UX | **FIXED** — Badge shows "Setup Only", info alert explains Phase 2 status |

**Impact:** Customer posting groups are master data that can be created and assigned to posting profile rules in the matrix, but cannot yet be assigned to individual dealers. Hierarchical matching by customer group won't trigger until Phase 2 adds the FK column.

### Gap #2: `master_products` Missing `item_posting_group_id` Column

| Aspect | Status |
|--------|--------|
| `item_posting_groups` table | EXISTS — 6 rows |
| `posting_profiles.item_posting_group_id` FK | EXISTS |
| `master_products.item_posting_group_id` FK | **DOES NOT EXIST** — Phase 2 |
| Product form UI field to assign group | **DOES NOT EXIST** — Phase 2 |
| `invoiceGLMapping.ts` → `getItemPostingGroupId()` | **FIXED** — queries `master_products` (correct table), returns null gracefully until Phase 2 column is added |
| Dashboard UX | **FIXED** — Badge shows "Setup Only", info alert explains Phase 2 status |

### Gap #3: `suppliers` Missing `vendor_posting_group_id` Column

| Aspect | Status |
|--------|--------|
| `vendor_posting_groups` table | EXISTS — 3 rows |
| `posting_profiles.vendor_posting_group_id` FK | EXISTS |
| `suppliers.vendor_posting_group_id` FK | **DOES NOT EXIST** — Phase 2 |
| Supplier form UI field to assign group | **DOES NOT EXIST** — Phase 2 |
| No server action reads vendor posting group from suppliers | Confirmed — Phase 2 |
| Dashboard UX | **FIXED** — Badge shows "Setup Only", info alert explains Phase 2 status |

### Gap #4: `invoiceGLMapping.ts` Referenced Wrong Tables — **FIXED**

| Issue | Before | After |
|-------|--------|-------|
| `getCustomerPostingGroupId()` table | `.from('dealers')` (non-existent table) | `.from('master_dealers')` (correct table) |
| `getCustomerPostingGroupId()` column | `customer_posting_group_id` (non-existent column) | Returns null with Phase 2 comment |
| `getItemPostingGroupId()` table | `.from('products')` (non-existent table) | `.from('master_products')` (correct table) |
| `getItemPostingGroupId()` column | `item_posting_group_id` (non-existent column) | Returns null with Phase 2 comment |
| Console errors at runtime | Yes — table/column not found errors logged | No — clean null return, no spurious errors |

### What Works Today Despite Gaps

The system works correctly for flat GL resolution because:
- All 145 posting profiles use system defaults (no groups required)
- `resolveGL()` (used by 20+ server actions) doesn't need groups
- `invoiceGLMapping.ts` now correctly returns null for group IDs (no runtime errors)
- Tax determination matrix works independently of posting groups
- Posting Simulation works end-to-end for testing

### Business Impact of Gaps

**Low for current operations.** IDHYAHAGRI is a single-entity operation where all dealers use the same AR account and all products use the same revenue account. The gaps only matter when:
- Multiple dealer types need different AR accounts
- Multiple product types need different revenue accounts
- MSME vendor segregation is needed for compliance

### What Has Been Fixed (This Sprint)

| Fix | File | Description |
|-----|------|-------------|
| Wrong table references | `invoiceGLMapping.ts` | `dealers` → `master_dealers`, `products` → `master_products` |
| Dashboard UX status | `PostingProfilesDashboard.tsx` | Badge: "Active" (green) vs "Setup Only" (yellow) per section |
| Getting Started guide | `PostingProfilesDashboard.tsx` | Reordered: Matrix → Tax Matrix → Simulation → Groups (Future) |
| Group page info alerts | `CustomerPostingGroupsManager.tsx`, `ItemPostingGroupsManager.tsx`, `VendorPostingGroupsManager.tsx` | Added "Master Data — Setup Only" alert with Phase 2 explanation |
| Info alert honesty | `PostingProfilesDashboard.tsx` | Updated main info alert to distinguish Active vs Setup Only sections |

---

## 8. Phase 2 Implementation Plan

### When to Implement

When IDHYAHAGRI needs:
- Different GL accounts for different customer types (DEALER vs RETAIL vs GOVT)
- Per-product-type revenue recognition
- MSME vendor AP segregation for Schedule III compliance

### Migration 1: Add FK Columns to Entity Tables

```sql
-- master_dealers
ALTER TABLE master_dealers
  ADD COLUMN customer_posting_group_id UUID REFERENCES customer_posting_groups(id);
CREATE INDEX idx_master_dealers_cpg ON master_dealers(customer_posting_group_id);

-- master_products
ALTER TABLE master_products
  ADD COLUMN item_posting_group_id UUID REFERENCES item_posting_groups(id);
CREATE INDEX idx_master_products_ipg ON master_products(item_posting_group_id);

-- suppliers
ALTER TABLE suppliers
  ADD COLUMN vendor_posting_group_id UUID REFERENCES vendor_posting_groups(id);
CREATE INDEX idx_suppliers_vpg ON suppliers(vendor_posting_group_id);
```

### UI Changes (3 files)

1. **Dealer form** — add "Customer Posting Group" dropdown (SearchableSelectDropdown)
2. **Product form** — add "Item Posting Group" dropdown
3. **Supplier form** — add "Vendor Posting Group" dropdown

### Server Action Fix (1 file)

`invoiceGLMapping.ts` line 309: Change `dealers` → `master_dealers`, verify column exists.

### Server Action Migration (Optional, per module)

Migrate from `resolveGL()` (flat) to `determineGLAccount()` (hierarchical) in server actions that should benefit from group-based resolution:
- `createCreditMemo.ts` — pass customer posting group from dealer
- `createCashReceipt.ts` — pass customer posting group
- `applyCashReceiptToInvoices.ts` — pass customer posting group

### No Migration Needed For

- `arMonitoringDashboard.ts` — dashboard aggregation, groups don't apply
- `reconcileGLAR.ts` — reconciliation uses single AR account
- `fiscalPeriodActions.ts` — year-end closing uses retained earnings
- `eclProvisionActions.ts` — ECL is bad debt provisioning across all customers

---

## 9. Test Cases & Edge Cases

### Current Working System (Priority 0: No Changes Needed)

| # | Test | Steps | Expected |
|---|------|-------|----------|
| TC-1 | Flat GL resolution | Create credit memo | `resolveGL('sales', 'ar_control')` returns UUID for GL 1702 |
| TC-2 | Multiple GL resolution | Create cash receipt | `resolveMultipleGL` returns bank_control + unapplied_cash |
| TC-3 | Cache hit | Repeat same resolveGL call within 10 min | Returns cached value (<1ms) |
| TC-4 | Cache expiry | Wait 10 minutes, repeat call | Cache miss, queries DB again |
| TC-5 | Missing profile | Deactivate `sales\|ar_control` profile | `PostingProfileNotFoundError` thrown |
| TC-6 | Tax matrix intra-state | Invoice from KU-001 to KA customer | CGST (2630) + SGST (2631) |
| TC-7 | Tax matrix inter-state | Invoice from KU-001 to AP customer | IGST (2632) |
| TC-8 | Simulation dry_run | Run simulation with sales\|revenue | Shows GL 4001, Priority 10, no cache write |

### Phase 2 Tests (After Gaps Fixed)

| # | Test | Steps | Expected |
|---|------|-------|----------|
| TC-P2-1 | Assign group to dealer | Set dealer X posting group = DEALER | Saved to master_dealers.customer_posting_group_id |
| TC-P2-2 | Group-based resolution | Invoice for dealer X (group=DEALER) with warehouse-specific rule | Priority 80 rule matches (group+warehouse) |
| TC-P2-3 | Fallback to default | Invoice for dealer Y (no group) | Falls back to Priority 10 default |
| TC-P2-4 | Delete group with active rule | Try deleting group used in posting profile | Blocked by FK constraint (ON DELETE RESTRICT) |
| TC-P2-5 | Deactivate group | Set is_active=false on group | Posting profiles still reference it, but new assignments blocked |

### Edge Cases

| # | Edge Case | Expected Behavior |
|---|-----------|-------------------|
| E-1 | Profile exists but GL account is deactivated | `determineGLAccount` returns the profile; `validateAllGLAccountsActive` catches it |
| E-2 | Two profiles with same priority for same criteria | First one returned (DB ordering by created_at) — admin should avoid this |
| E-3 | Group assigned to dealer but no group-specific profile exists | Falls back to lower priority (default) — works correctly |
| E-4 | Warehouse deleted that has posting profiles | Blocked by FK constraint (ON DELETE RESTRICT) |
| E-5 | 500+ posting profiles | Cache handles up to 500 entries (LRU eviction), DB query has covering index |
| E-6 | Concurrent profile update + cache | Stale cache serves old value for up to 10 min — acceptable for config data |
| E-7 | Import XLSX with invalid module_type | Row-by-row validation catches it, other rows still import |

---

## 10. UX Improvements — IMPLEMENTED

### Issues Found and Fixes Applied

| # | Issue | Fix | Status |
|---|-------|-----|--------|
| 1 | No indication which sections are Active vs Setup-only | Changed navigation card badges: "Active" (green) for Matrix/Tax/Simulation, "Setup Only" (gray) for Customer/Item/Vendor Groups | **DONE** |
| 2 | Getting Started guide implied wrong workflow order | Reordered: Step 1 Matrix (Required) → Step 2 Tax Matrix (Required for GST) → Step 3 Simulation (Recommended) → Step 4 Groups (Future—Phase 2) | **DONE** |
| 3 | No context on Customer/Item/Vendor Group pages about their current status | Added "Master Data — Setup Only" info alert on all 3 group pages explaining groups are available for matrix assignment, full integration in Phase 2 | **DONE** |
| 4 | Main "How Posting Profiles Work" alert was misleading | Updated to clearly distinguish Active vs Setup Only badges with inline explanation | **DONE** |
| 5 | `invoiceGLMapping.ts` queried non-existent tables/columns, generating runtime errors | Fixed table names (`dealers` → `master_dealers`, `products` → `master_products`), returns null gracefully | **DONE** |

### Files Modified

| File | Change |
|------|--------|
| `PostingProfilesDashboard.tsx` | Badge variants, Getting Started guide reorder, info alert update |
| `CustomerPostingGroupsManager.tsx` | Added "Master Data — Setup Only" Alert with Phase 2 context |
| `ItemPostingGroupsManager.tsx` | Added "Master Data — Setup Only" Alert with Ind AS 2 context |
| `VendorPostingGroupsManager.tsx` | Added "Master Data — Setup Only" Alert with MSMED Act 2006 context |
| `invoiceGLMapping.ts` | Fixed table names, added Phase 2 comments, removed spurious console errors |

---

## Summary

| Section | Status | Used at Runtime? | Action Needed? |
|---------|--------|-----------------|----------------|
| **Posting Profiles Matrix** | Working | Yes (145 profiles, 20+ server actions) | No |
| **Customer Posting Groups** | Master data only | No (FK missing on master_dealers) | Phase 2 |
| **Item Posting Groups** | Master data only | No (FK missing on master_products) | Phase 2 |
| **Vendor Posting Groups** | Master data only | No (FK missing on suppliers) | Phase 2 |
| **Tax Determination Matrix** | Working | Yes (invoiceGLMapping.ts) | No |
| **Posting Simulation** | Working | Yes (testing tool) | No |
| **Hierarchical Matching** | Engine ready, data not wired | Partially (only for warehouse-based rules) | Phase 2 for groups |
