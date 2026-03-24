# DAEE-236: Posting Profiles Single Source of Truth — Comprehensive Test Cases

**Ticket:** DAEE-236 + DAEE-247
**Date:** March 5, 2026
**By:** Gireesh (SRE) & Poojitha (FullStack) & Pavan (DevSecOps) & Geetha (UX/UI)
**Environments:** Staging (`aapqtirfzwzfosvnzawo`) | Production (`fuedgyvbymaljpnflmdy`)
**Tenant:** IDHYAHAGRI (`d2353f40-81ea-4f43-99d5-58dcf0becdc5`)

---

## UI Route Audit — Actual Pages vs Server Actions

Before testing, it's critical to understand which server actions have UI pages and which are backend-only or dead code:

| Server Action File | UI Page Exists? | Actual Route / Caller | Test Method |
|---|---|---|---|
| `cashReceiptActions.ts` | YES | `/finance/cash-receipts/new`, `/finance/cash-receipts/[id]`, `/[id]/apply`, `/[id]/edit` | UI functional test |
| `applyCashReceiptToInvoices.ts` | YES | `/finance/cash-receipts/[id]/apply/page.tsx` | UI functional test |
| `unapplyCashReceiptFromInvoices.ts` | YES | `/finance/cash-receipts/[id]/page.tsx` (unapply button) | UI functional test |
| `vanPaymentActions.ts` | YES | `/finance/van-payments/[id]/reconcile` + `PaymentReconciliationDialog.tsx` | UI functional test |
| `createCreditMemo.ts` | YES | `/finance/credit-memos/new/page.tsx` + `/o2c/sales-returns/[id]/CreateCreditMemoButton.tsx` | UI functional test (2 paths) |
| `creditMemoActions.ts` | YES | `/finance/credit-memos/page.tsx`, `/finance/credit-memos/new/page.tsx` | UI functional test |
| `fiscalPeriodActions.ts` | YES | `/finance/fiscal-periods/page.tsx` | UI functional test |
| `dealerLedgerActions.ts` | YES | `/finance/dealer-ledger/page.tsx` + PDF download components | UI functional test |
| `epdSettingsActions.ts` | YES | `/finance/epd-settings/page.tsx` | UI functional test |
| `getInvoiceEPDStatus.ts` | Indirect | Called by `/finance/cash-receipts/[id]/apply/page.tsx`, EPD calculator | Tested via cash receipt apply flow |
| `journal-automation.ts` | Indirect | Called by `o2c/actions/createInvoice.ts`, `createPayment.ts` | Tested via O2C invoice creation |
| `createDiscountJournalEntry.ts` | Indirect | Called by `createPaymentDiscount.ts`, `vanPaymentActions.ts`, `applyCashReceiptToInvoices.ts` | Tested via VAN reconciliation / cash receipt apply |
| `arMonitoringDashboard.ts` | YES | `/finance/reports/ar-health/page.tsx` | UI functional test |
| `reconcileGLAR.ts` | YES | `/finance/reports/gl-ar-reconciliation/page.tsx` | UI functional test |
| `eclProvisionActions.ts` | YES (report) | `/finance/reports/ecl-provisioning/page.tsx` | UI functional test |
| **writeOffActions.ts** | **NO** | **ZERO imports — dead code, no UI callers** | **Code review only** |
| **postInventoryMovement.ts** | **NO** | **ZERO imports — dead code, no UI callers** | **Code review only** |
| **postSupplierInvoice.ts** | **NO** | **ZERO imports — dead code** (P2P uses its own actions at `/p2p/supplier-invoices`) | **Code review only** |
| **postVendorPayment.ts** | **NO** | **ZERO imports — dead code** (AP payments exist at `/finance/ap-payments` but use different actions) | **Code review only** |

---

## Table of Contents

1. [Pre-Requisite Checks](#1-pre-requisite-checks)
2. [Phase 1-2: Infrastructure — Resolver & Types](#2-phase-1-2-infrastructure)
3. [Phase 3: Reports — ECL, AR Health, GL-AR Recon](#3-phase-3-reports)
4. [Phase 3-4: Dead Code — Write-Offs, Credit Memo Actions (Code Review)](#4-phase-3-4-dead-code-review)
5. [Phase 5: Dealer Ledger & Discount Journal Entry](#5-phase-5-dealer-ledger)
6. [Phase 6: Journal Automation (O2C Invoice) & Fiscal Period](#6-phase-6-journal-automation)
7. [Phase 7: Apply/Unapply Cash Receipt & EPD Settings](#7-phase-7-cash-receipt-apply)
8. [Phase 8: VAN Payment Actions](#8-phase-8-van-payments)
9. [Phase 9: Credit Memo (createCreditMemo.ts) — FIXED wrong GL](#9-phase-9-credit-memo)
10. [Phase 9: Cash Receipt Actions — Create & Reverse](#10-phase-9-cash-receipts)
11. [Phase 9: Dead Code — Inventory, Supplier Invoice, Vendor Payment (Code Review)](#11-phase-9-dead-code-review)
12. [Cross-Environment Verification](#12-cross-environment)
13. [DAEE-247: GST Tax Rate Propagation Fix](#13-daee-247-gst)
14. [Negative / Edge Case Matrix](#14-negative-edge-cases)
15. [Regression Test Matrix](#15-regression-tests)
16. [GL Account Mapping Quick Reference](#16-gl-account-mapping)

---

## 1. Pre-Requisite Checks

### PRE-001: Verify Critical Posting Profiles Exist

**Priority:** P0 — BLOCKING
**Steps:**
1. Connect to the target database (staging or production)
2. Run:
```sql
SELECT pp.module_type, pp.account_type, pp.gl_account_id, pp.rule_priority, pp.is_active,
       coa.account_code, coa.account_name
FROM posting_profiles pp
LEFT JOIN master_chart_of_accounts coa ON coa.id = pp.gl_account_id
WHERE pp.tenant_id = 'd2353f40-81ea-4f43-99d5-58dcf0becdc5'
  AND pp.is_active = true
  AND (pp.module_type || '|' || pp.account_type) IN (
    'sales|ar_control',
    'sales|bad_debt_expense',
    'sales|credit_writeoff',
    'sales|early_payment_discount',
    'sales|revenue',
    'sales|gst_output_cgst',
    'sales|gst_output_sgst',
    'sales|gst_output_igst',
    'finance|bank_control',
    'finance|bank_van',
    'finance|unapplied_cash',
    'finance|retained_earnings',
    'finance|petty_cash',
    'purchase|ap_control',
    'purchase|gst_input_cgst',
    'inventory|inventory_asset',
    'dealer_management|credit_note'
  )
ORDER BY pp.module_type, pp.account_type;
```

**Expected:** All 17 rows returned with valid `gl_account_id` and `is_active = true`. If ANY row missing, add before proceeding.

### PRE-002: Verify finance_defaults Alignment

**Priority:** P1
**Steps:**
1. Run on target database:
```sql
SELECT setting_value FROM tenant_settings
WHERE tenant_id = 'd2353f40-81ea-4f43-99d5-58dcf0becdc5'
  AND setting_key = 'finance_defaults';
```
2. Parse the JSON and compare each UUID against posting_profiles.

**Expected:** All 10+ UUIDs in finance_defaults match corresponding posting_profile gl_account_ids. (Already fixed on both envs during this session.)

### PRE-003: Verify TypeScript Compilation

**Priority:** P0 — BLOCKING
**Steps:**
1. `cd /Users/pavana21/projects/web_app`
2. `npx tsc --noEmit`

**Expected:** Zero errors.

---

## 2. Phase 1-2: Infrastructure — Resolver & Types

### TC-INFRA-001: resolveGL returns correct UUID for known profile

**File:** `src/lib/posting-profile-resolver.ts`
**Priority:** P0

**Steps:**
1. Log in as a user with finance permissions
2. Navigate to `/finance/cash-receipts/new` and create a cash receipt
3. Check server logs for resolveGL call

**Expected:**
- `resolveGL(tenantId, 'finance', 'unapplied_cash')` returns the UUID matching posting_profiles
- No `PostingProfileNotFoundError` thrown
- Receipt created successfully

### TC-INFRA-002: resolveGL throws PostingProfileNotFoundError for missing profile

**Priority:** P0

**Steps:**
1. Temporarily deactivate `finance|unapplied_cash`:
```sql
UPDATE posting_profiles SET is_active = false
WHERE tenant_id = 'd2353f40-81ea-4f43-99d5-58dcf0becdc5'
  AND module_type = 'finance' AND account_type = 'unapplied_cash';
```
2. Navigate to `/finance/cash-receipts/new`, try creating a cash receipt
3. **IMMEDIATELY re-activate:**
```sql
UPDATE posting_profiles SET is_active = true
WHERE tenant_id = 'd2353f40-81ea-4f43-99d5-58dcf0becdc5'
  AND module_type = 'finance' AND account_type = 'unapplied_cash';
```

**Expected:** User sees error: "Unapplied Cash Account not configured. Please configure a finance|unapplied_cash posting profile." — NOT a generic 500 error.

### TC-INFRA-003: resolveMultipleGL batch resolution

**Priority:** P1

**Steps:**
1. Navigate to `/finance/van-payments/[id]/reconcile` and reconcile a VAN payment
2. Check server logs

**Expected:** Log shows `[VAN-RECONCILE] GL accounts resolved from posting_profiles` — single DB query for all 4 specs.

### TC-INFRA-004: Cache behavior — 10-minute TTL

**Priority:** P2

**Steps:**
1. Create a cash receipt (triggers resolveGL)
2. Immediately create another cash receipt
3. Check server logs

**Expected:** Second call within 10 min served from cache (no DB query in logs).

### TC-INFRA-005: PostingModuleType and PostingAccountType enums complete

**File:** `src/app/finance/posting-profiles/types.ts`
**Priority:** P1

**Steps:**
1. Open file and verify 9 module types and 96+ account types exist
2. Run `npx tsc --noEmit`

**Expected:** All types present. TypeScript compilation passes.

---

## 3. Phase 3: Reports — ECL Provisioning, AR Health, GL-AR Reconciliation

### TC-ECL-001: ECL Provisioning report — GL from posting_profiles

**File:** `src/app/finance/actions/eclProvisionActions.ts` (~L577)
**UI Page:** `/finance/reports/ecl-provisioning`
**Priority:** P1

**Steps:**
1. Navigate to `/finance/reports/ecl-provisioning`
2. The page loads ECL data and may trigger provision calculations
3. If the report has a "Book Provision" or "Calculate" action, execute it

**Expected:**
- GL accounts resolved from posting_profiles: `sales|bad_debt_expense` and `sales|credit_writeoff`
- No hardcoded `'6495'` or `'1709'` in logs
- Report data loads correctly

### TC-ARM-001: AR Health Dashboard uses resolved UUID

**File:** `src/app/finance/actions/arMonitoringDashboard.ts` (~L246)
**UI Page:** `/finance/reports/ar-health`
**Priority:** P2

**Steps:**
1. Navigate to `/finance/reports/ar-health`
2. Wait for dashboard to load

**Expected:**
- Dashboard queries journal_entry_lines using the resolved UUID for `sales|ar_control`
- NOT using `.eq('account.account_code', '1702')`
- AR balances and health metrics displayed correctly

### TC-REC-001: GL-AR Reconciliation uses resolved UUID

**File:** `src/app/finance/actions/reconcileGLAR.ts` (~L108)
**UI Page:** `/finance/reports/gl-ar-reconciliation`
**Priority:** P2

**Steps:**
1. Navigate to `/finance/reports/gl-ar-reconciliation`
2. Run reconciliation (or wait for auto-load)

**Expected:**
- Reconciliation uses resolved UUID for `sales|ar_control`
- NOT using `.eq('account.account_code', '1702')`
- GL balance and AR subledger totals computed correctly
- Variance reported accurately

---

## 4. Phase 3-4: Dead Code — Write-Offs, Credit Memo Actions (Code Review Only)

> **IMPORTANT:** These server actions have ZERO UI callers. They are dead code — server action files exist but no page or component imports them. Testing is limited to static code review.

### TC-WO-CR-001: writeOffActions.ts — Code review for resolveMultipleGL usage

**File:** `src/app/finance/actions/writeOffActions.ts`
**Priority:** P3 — Code review only, no UI to test
**Status:** DEAD CODE — zero imports across entire codebase

**Steps (Code Review):**
1. Open `writeOffActions.ts`
2. Verify `requestWriteOff` (~L157) uses `resolveMultipleGL(tenantId, [{module:'sales', account:'bad_debt_expense'}, {module:'sales', account:'ar_control'}])`
3. Verify `postWriteOff` (~L409) has same pattern with fallback for existing GL IDs
4. Verify `reverseWriteOff` (~L602) swaps debit/credit correctly
5. Confirm NO hardcoded `'6495'` or `'1702'` remain in GL resolution paths

**Expected:** All 3 functions use `resolveMultipleGL`. No hardcoded account codes. TypeScript compiles.

### TC-CMA-CR-001: creditMemoActions.ts — Code review for resolveGL usage

**File:** `src/app/finance/credit-memos/actions/creditMemoActions.ts` (~L1538)
**Priority:** P3 — Code review only (the NEW page at `/credit-memos/new` imports from this file, but the migrated function at ~L1538 is a different code path)

**Steps (Code Review):**
1. Verify the migrated section uses `resolveGL` instead of `['1702','1700','1200']` fallback loop
2. Confirm no hardcoded account code iteration

**Expected:** `resolveGL` used. No fallback chain.

---

## 5. Phase 5: Dealer Ledger & Discount Journal Entry

### TC-DL-001: Dealer Ledger AR lookup uses posting_profiles

**File:** `src/app/finance/dealer-ledger/actions/dealerLedgerActions.ts` (~L127)
**UI Page:** `/finance/dealer-ledger`
**Priority:** P1

**Steps:**
1. Navigate to `/finance/dealer-ledger`
2. Select a dealer from the list
3. View their ledger entries

**Expected:**
- AR account resolved from `sales|ar_control` via `resolveGL`
- NOT using `.eq('account_code', '1200')`
- Dealer balance computed correctly
- Ledger entries display properly

### TC-DJ-001: Discount Journal Entry uses posting_profiles

**File:** `src/app/finance/payment-discounts/actions/createDiscountJournalEntry.ts` (~L126)
**Priority:** P1 — Tested indirectly via VAN reconciliation or cash receipt apply with EPD

**Steps:**
1. This is called internally by `vanPaymentActions.ts` and `applyCashReceiptToInvoices.ts` during EPD processing
2. Test by reconciling a VAN payment that qualifies for EPD (see TC-VAN-002)
3. Or apply a cash receipt within EPD eligibility period (see TC-ACR-001)

**Expected:**
- AR account resolved from `resolveGL(tenantId, 'sales', 'ar_control')`
- NOT using `getGLAccountByCode(tenantId, '1200')`
- Discount JE posts correctly with proper debit/credit

---

## 6. Phase 6: Journal Automation (O2C Invoice) & Fiscal Period

### TC-JA-001: Invoice JE uses resolveMultipleGL

**File:** `src/lib/journal-automation.ts` (~L427-509)
**Caller:** `src/app/o2c/actions/createInvoice.ts` → `postInvoiceToJournal()`
**UI Page:** Invoice is created via O2C workflow — `/o2c/sales-orders/[id]` (convert SO to invoice)
**Priority:** P0

**Steps:**
1. Navigate to `/o2c/sales-orders`
2. Open a confirmed sales order
3. Generate invoice (this triggers `createInvoice.ts` → `postInvoiceToJournal()`)
4. Navigate to `/finance/journal-entries` and find the auto-generated JE

**Expected:**
- All GL accounts resolved from posting_profiles:
  - `sales|ar_control` for AR
  - `sales|revenue` for Sales Revenue
  - `sales|gst_output_cgst` / `sgst` / `igst` for GST (if applicable)
- NOT using `getCOAAccountByCode('1200')`, `getCOAAccountByCode('4100')`, etc.
- JE balances (total_debits = total_credits)

**Verification SQL:**
```sql
SELECT jeh.journal_number, jeh.description,
       jel.line_number, coa.account_code, coa.account_name,
       jel.debit_amount, jel.credit_amount
FROM journal_entry_headers jeh
JOIN journal_entry_lines jel ON jel.journal_entry_header_id = jeh.id
JOIN master_chart_of_accounts coa ON coa.id = jel.chart_of_account_id
WHERE jeh.tenant_id = 'd2353f40-81ea-4f43-99d5-58dcf0becdc5'
  AND jeh.source_module = 'o2c'
ORDER BY jeh.created_at DESC, jel.line_number
LIMIT 10;
```

### TC-JA-002: getCOAAccountByCode and getFinanceDefaults are @deprecated with zero callers

**File:** `src/lib/journal-automation.ts`
**Priority:** P1

**Steps:**
1. Run:
```bash
grep -rn "getCOAAccountByCode\|getFinanceDefaults" src/ --include="*.ts" --include="*.tsx"
```

**Expected:** Only results are the DEFINITION in `journal-automation.ts` (marked `@deprecated`). Zero callers.

### TC-FP-001: Year-End Close uses resolveGL for Retained Earnings

**File:** `src/app/finance/actions/fiscalPeriodActions.ts` (~L1008)
**UI Page:** `/finance/fiscal-periods`
**Priority:** P1

**Steps:**
1. Navigate to `/finance/fiscal-periods`
2. If a fiscal period is ready for closing, initiate the close process
3. If no period is closeable, verify the page loads without errors and check the code path via code review

**Expected:**
- Retained Earnings account resolved via `resolveGL(tenantId, 'finance', 'retained_earnings')`
- NOT using `.eq('account_code', '3200')`
- No `finance_defaults` query in this code path

---

## 7. Phase 7: Apply/Unapply Cash Receipt & EPD Settings

### TC-ACR-001: Apply Cash Receipt to Invoice — posting_profiles sole source

**File:** `src/app/finance/actions/applyCashReceiptToInvoices.ts`
**UI Page:** `/finance/cash-receipts/[id]/apply`
**Priority:** P0

**Steps:**
1. Navigate to `/finance/cash-receipts`
2. Click on an unapplied cash receipt to view details
3. Click "Apply" to go to `/finance/cash-receipts/[id]/apply`
4. Select an open invoice and apply the receipt

**Expected:**
- JE created:
  - Debit: `sales|ar_control` (AR reduces)
  - Credit: `finance|unapplied_cash` (Unapplied Cash reduces)
- If EPD applicable: additional debit `sales|early_payment_discount`
- No `finance_defaults` query in server logs
- No `findAccountByCode('2050')` or `findAccountByCode('1700')` in logs
- Invoice status updates correctly (paid/partial_paid)

**Verification SQL:**
```sql
SELECT jeh.journal_number, jeh.description,
       jel.line_number, coa.account_code, coa.account_name,
       jel.debit_amount, jel.credit_amount
FROM journal_entry_headers jeh
JOIN journal_entry_lines jel ON jel.journal_entry_header_id = jeh.id
JOIN master_chart_of_accounts coa ON coa.id = jel.chart_of_account_id
WHERE jeh.tenant_id = 'd2353f40-81ea-4f43-99d5-58dcf0becdc5'
  AND jeh.source_document_type = 'cash_receipt_application'
ORDER BY jeh.created_at DESC, jel.line_number
LIMIT 6;
```

### TC-UCR-001: Unapply Cash Receipt from Invoice — posting_profiles sole source

**File:** `src/app/finance/actions/unapplyCashReceiptFromInvoices.ts`
**UI Page:** `/finance/cash-receipts/[id]` (unapply button on cash receipt detail page)
**Priority:** P1

**Steps:**
1. Navigate to `/finance/cash-receipts/[id]` for a receipt that has been applied to an invoice
2. Find and click the "Unapply" action
3. Confirm the unapplication

**Expected:**
- Reversal JE created:
  - Debit: `finance|unapplied_cash` (increases back)
  - Credit: `sales|ar_control` (increases back)
- If EPD was applied: EPD reversal line included
- No `finance_defaults` query
- Invoice status reverts (paid → open/partial)

### TC-EPD-001: EPD Settings page loads correctly

**File:** `src/app/finance/epd-settings/actions/epdSettingsActions.ts`
**UI Page:** `/finance/epd-settings`
**Priority:** P2

**Steps:**
1. Navigate to `/finance/epd-settings`
2. Verify the page loads without errors

**Expected:** Page displays EPD slab configuration. No console errors related to GL resolution.

---

## 8. Phase 8: VAN Payment Actions

### TC-VAN-001: VAN Reconciliation — GL accounts from posting_profiles

**File:** `src/app/finance/van-payments/actions/vanPaymentActions.ts` (Block 1, ~L813)
**UI Page:** `/finance/van-payments/[id]/reconcile` OR `PaymentReconciliationDialog.tsx`
**Priority:** P0

**Steps:**
1. Navigate to `/finance/van-payments`
2. Click on an unreconciled VAN payment to view details at `/finance/van-payments/[id]`
3. Click "Reconcile" to open reconciliation dialog or navigate to `/finance/van-payments/[id]/reconcile`
4. Allocate payment to an invoice and submit

**Expected:**
- GL accounts resolved from posting_profiles:
  - `finance|bank_van` for VAN-specific Axis Bank (1812)
  - `finance|bank_control` as fallback generic bank
  - `sales|ar_control` for Trade Debtors
  - `sales|early_payment_discount` for EPD (if applicable)
- Server log shows: `[VAN-RECONCILE] GL accounts resolved from posting_profiles`
- JE created:
  - Debit: `finance|bank_van` (or `finance|bank_control` if VAN not configured)
  - Credit: `sales|ar_control`
- NO `tenant_settings` query for `finance_defaults`
- NO `axis_bank_van_gl_account_code` COA lookup

**Verification SQL:**
```sql
SELECT jeh.journal_number, jeh.description,
       jel.line_number, coa.account_code, coa.account_name,
       jel.debit_amount, jel.credit_amount
FROM journal_entry_headers jeh
JOIN journal_entry_lines jel ON jel.journal_entry_header_id = jeh.id
JOIN master_chart_of_accounts coa ON coa.id = jel.chart_of_account_id
WHERE jeh.tenant_id = 'd2353f40-81ea-4f43-99d5-58dcf0becdc5'
  AND jeh.description LIKE '%VAN%'
ORDER BY jeh.created_at DESC, jel.line_number
LIMIT 6;
```

### TC-VAN-002: VAN Reconciliation with EPD discount

**Priority:** P1

**Steps:**
1. Select a VAN payment that qualifies for EPD (payment within EPD window)
2. Reconcile and apply to an invoice within EPD period

**Expected:**
- Discount JE created using `sales|early_payment_discount` from posting_profiles
- Discount account NOT sourced from `financeDefaults.sales_discount_account_id`
- Discount amount calculated per EPD slab configuration

### TC-VAN-003: VAN bank fallback — bank_van missing, falls back to bank_control

**Priority:** P1

**Steps:**
1. Temporarily deactivate `finance|bank_van`:
```sql
UPDATE posting_profiles SET is_active = false
WHERE tenant_id = 'd2353f40-81ea-4f43-99d5-58dcf0becdc5'
  AND module_type = 'finance' AND account_type = 'bank_van';
```
2. Reconcile a VAN payment at `/finance/van-payments/[id]/reconcile`
3. **IMMEDIATELY re-activate:**
```sql
UPDATE posting_profiles SET is_active = true
WHERE tenant_id = 'd2353f40-81ea-4f43-99d5-58dcf0becdc5'
  AND module_type = 'finance' AND account_type = 'bank_van';
```

**Expected:**
- Reconciliation SUCCEEDS using `finance|bank_control` as bank account
- Log shows: `Bank: generic (bank_control)`
- JE posts correctly with fallback bank account

### TC-VAN-004: postSingleVANPaymentToGL — posting_profiles resolution

**File:** `src/app/finance/van-payments/actions/vanPaymentActions.ts` (Block 2, ~L1420)
**Priority:** P1 — Tested indirectly when VAN payments are posted to GL

**Steps:**
1. This function is called during VAN payment GL posting workflow
2. Verify via server logs during TC-VAN-001

**Expected:**
- Uses `resolveMultipleGL` for `finance|bank_van`, `finance|bank_control`, `sales|ar_control`
- VAN-specific bank used when available, fallback to generic
- No `tenant_settings` query

---

## 9. Phase 9: Credit Memo (createCreditMemo.ts) — FIXED Wrong GL

### TC-CM-001: Create Credit Memo via Finance UI — FIXED wrong GL accounts

**File:** `src/app/finance/actions/createCreditMemo.ts`
**UI Page:** `/finance/credit-memos/new`
**Priority:** P0 — CRITICAL (fixes wrong GL on both environments)

**Steps:**
1. Navigate to `/finance/credit-memos/new`
2. Create a new credit memo:
   - Select customer
   - Select original invoice
   - Choose reason (e.g., `transport_allowance`)
   - Enter credit amount
3. Submit

**Expected:**
- GL accounts resolved from posting_profiles:
  - `sales|ar_control` → Trade Debtors (AR)
  - `dealer_management|credit_note` → 4070 Credit Memo / Credit Note
- JE created:
  - Debit: 4070 Credit Memo account (contra-revenue)
  - Credit: AR account (Trade Debtors)
- **MUST NOT** use old wrong accounts: 11116 (staging old) or 4210 (production old)
- Credit memo status = 'applied' (auto-applied to source invoice per Issue #12)

**Verification SQL — CRITICAL:**
```sql
SELECT cm.credit_memo_number, cm.status,
       jeh.journal_number,
       jel.line_number, coa.account_code, coa.account_name,
       jel.debit_amount, jel.credit_amount
FROM credit_memos cm
JOIN journal_entry_headers jeh ON jeh.id = cm.gl_journal_id
JOIN journal_entry_lines jel ON jel.journal_entry_header_id = jeh.id
JOIN master_chart_of_accounts coa ON coa.id = jel.chart_of_account_id
WHERE cm.tenant_id = 'd2353f40-81ea-4f43-99d5-58dcf0becdc5'
ORDER BY cm.created_at DESC, jel.line_number
LIMIT 4;
```

**MUST VERIFY:** Debit line account_code = `4070` (NOT `11116` on staging, NOT `4210` on production).

### TC-CM-002: Create Credit Memo via Sales Return flow

**UI Page:** `/o2c/sales-returns/[id]` → `CreateCreditMemoButton` component
**Priority:** P1

**Steps:**
1. Navigate to `/o2c/sales-returns`
2. Open a completed sales return at `/o2c/sales-returns/[id]`
3. Click "Create Credit Memo" button (CreateCreditMemoButton component)
4. Verify credit memo created with correct GL

**Expected:** Same as TC-CM-001 — 4070 account used, not 11116/4210.

---

## 10. Phase 9: Cash Receipt Actions — Create & Reverse

### TC-CR-001: Create Cash Receipt — resolveGL for unapplied_cash

**File:** `src/app/finance/cash-receipts/actions/cashReceiptActions.ts` (Create block)
**UI Page:** `/finance/cash-receipts/new`
**Priority:** P0

**Steps:**
1. Navigate to `/finance/cash-receipts/new`
2. Fill in receipt details:
   - Select customer
   - Enter amount
   - Payment method: `bank_transfer`
   - Select bank account
3. Submit

**Expected:**
- `finance|unapplied_cash` resolved from posting_profiles
- JE created:
  - Debit: Bank account (from user selection)
  - Credit: `finance|unapplied_cash`
- NO `finance_defaults` query
- NO `tenant_settings` read

### TC-CR-002: Create Cash Receipt — Cash payment with Petty Cash

**UI Page:** `/finance/cash-receipts/new`
**Priority:** P1

**Steps:**
1. Navigate to `/finance/cash-receipts/new`
2. Fill in: Payment method = `cash`, do NOT select a bank account
3. Submit

**Expected:**
- Petty Cash account resolved via `resolveGL(tenantId, 'finance', 'petty_cash')`
- JE Debit uses Petty Cash account
- NOT using `financeDefaults.petty_cash_account_id`

### TC-CR-003: Create Cash Receipt — Petty Cash not configured

**Priority:** P1

**Steps:**
1. Temporarily deactivate `finance|petty_cash` profile in DB
2. Navigate to `/finance/cash-receipts/new`, try: payment_method = `cash`, no bank account
3. **IMMEDIATELY re-activate profile**

**Expected:** Error: "Petty Cash account not configured. Please select a bank/cash account or configure finance|petty_cash in Posting Profiles." Error code: `PETTY_CASH_NOT_CONFIGURED`

### TC-CR-004: Reverse Cash Receipt — posting_profiles sole source

**File:** `src/app/finance/cash-receipts/actions/cashReceiptActions.ts` (Reversal block)
**UI Page:** `/finance/cash-receipts/[id]` (reverse/cancel action)
**Priority:** P0

**Steps:**
1. Navigate to `/finance/cash-receipts/[id]` for an active receipt
2. Click "Reverse" / "Cancel Receipt"
3. Confirm reversal

**Expected:**
- Reversal JE created (opposite of original):
  - Debit: `finance|unapplied_cash`
  - Credit: Bank account (from receipt or `finance|bank_control` fallback)
- NO `finance_defaults` query
- NO `findAccountByCode('2050')` or `findAccountByCode('1112')` fallback chains
- NO `validateAccountId()` helper function calls
- Receipt status = 'reversed'

### TC-CR-005: Reverse Cash Receipt — bank_account_id is null (VAN/migrated)

**Priority:** P1

**Steps:**
1. Find a receipt in DB where `bank_account_id IS NULL` (VAN payment or migrated receipt):
```sql
SELECT id, receipt_number FROM cash_receipts
WHERE tenant_id = 'd2353f40-81ea-4f43-99d5-58dcf0becdc5'
  AND bank_account_id IS NULL AND status != 'reversed'
LIMIT 1;
```
2. Navigate to `/finance/cash-receipts/[id]` and reverse it

**Expected:**
- Bank account falls back to `finance|bank_control` from posting_profiles
- Reversal JE posts successfully
- Log shows fallback to posting profile bank account

---

## 11. Phase 9: Dead Code — Inventory, Supplier Invoice, Vendor Payment (Code Review Only)

> **IMPORTANT:** These 3 server actions have ZERO imports across the entire codebase. They are dead code — properly migrated but cannot be functionally tested via UI. The P2P module (`/p2p/supplier-invoices`) uses its own separate action files.

### TC-INV-CR-001: postInventoryMovement.ts — Code review

**File:** `src/app/finance/actions/postInventoryMovement.ts`
**Priority:** P3 — Code review only, DEAD CODE (zero imports)

**Steps (Code Review):**
1. Verify import: `import { resolveGL } from '@/lib/posting-profile-resolver'`
2. Verify: `inventory_account = await resolveGL(tenantId, 'inventory', 'inventory_asset')`
3. Verify no `finance_defaults` or `tenant_settings` query remains
4. Verify error message: "Please configure an inventory|inventory_asset posting profile"

**Expected:** Code correctly uses resolveGL. TypeScript compiles.

### TC-SUP-CR-001: postSupplierInvoice.ts — Code review

**File:** `src/app/finance/actions/postSupplierInvoice.ts`
**Priority:** P3 — Code review only, DEAD CODE (zero imports)
**Note:** The P2P module at `/p2p/supplier-invoices` uses its own actions, NOT this file.

**Steps (Code Review):**
1. Verify: `ap_account = await resolveGL(tenantId, 'purchase', 'ap_control')`
2. Verify GST input is non-blocking: `try { gst_input_account = await resolveGL(...) } catch { /* warning */ }`
3. Verify no `finance_defaults` reference

**Expected:** Code correctly uses resolveGL + non-blocking GST. TypeScript compiles.

### TC-VP-CR-001: postVendorPayment.ts — Code review

**File:** `src/app/finance/actions/postVendorPayment.ts`
**Priority:** P3 — Code review only, DEAD CODE (zero imports)
**Note:** AP Payments page at `/finance/ap-payments` uses different action files.

**Steps (Code Review):**
1. Verify: `ap_account = await resolveGL(tenantId, 'purchase', 'ap_control')`
2. Verify no `finance_defaults` reference

**Expected:** Code correctly uses resolveGL. TypeScript compiles.

---

## 12. Cross-Environment Verification

### TC-XENV-001: Core workflows pass on Staging

**Priority:** P0

**Steps:**
1. Deploy branch to staging
2. Run these core tests on staging:
   - TC-CR-001 (Create cash receipt)
   - TC-VAN-001 (VAN reconciliation)
   - TC-CM-001 (Create credit memo)
   - TC-ACR-001 (Apply cash receipt)
3. Verify all JEs post with correct GL accounts

**Expected:** All 4 tests pass on staging environment.

### TC-XENV-002: Core workflows pass on Production

**Priority:** P0

**Steps:**
1. Deploy branch to production
2. Run same 4 core tests on production
3. Verify GL accounts resolve to PRODUCTION UUIDs (different from staging)

**Expected:**
- All 4 tests pass
- GL account UUIDs are DIFFERENT from staging (different COA data)
- But ACCOUNT NAMES/PURPOSES are same (both resolve to "Trade Debtors", etc.)

### TC-XENV-003: Verify zero hardcoded codes in runtime paths

**Priority:** P0

**Steps:**
1. Run these greps on the deployed codebase:
```bash
grep -rn "'1702'" src/app/finance/ src/lib/journal-automation.ts
grep -rn "'1200'" src/app/finance/actions/ src/app/finance/dealer-ledger/ src/app/finance/payment-discounts/ src/app/finance/credit-memos/ src/lib/journal-automation.ts
grep -rn "'1709'" src/app/finance/
grep -rn "'6495'" src/app/finance/
grep -rn "'2050'" src/app/finance/
grep -rn "'3200'" src/app/finance/
grep -rn "'1112'" src/app/finance/ src/lib/journal-automation.ts
grep -rn "findAccountByCode" src/
grep -rn "finance_defaults" src/app/finance/actions/ src/app/finance/cash-receipts/ src/app/finance/van-payments/ src/lib/journal-automation.ts
```

**Expected:** ALL greps return ZERO runtime results. Only comments, deprecated definitions, or Admin UI write paths.

---

## 13. DAEE-247: GST Tax Rate Propagation Fix

### TC-GST-001: Create Indent — tax_percentage from product master

**File:** `src/app/o2c/actions/createIndent.ts`
**UI Page:** `/o2c/indents/create`
**Priority:** P0

**Steps:**
1. Navigate to `/o2c/indents/create`
2. Select a dealer
3. Add a product whose product master `tax_percentage` = 12%
4. Verify the tax_percentage shown in the form = 12%
5. Submit the indent

**Expected:**
- `tax_percentage` in indent_items = 12% (from product master, NOT hardcoded 18%)
- `cess_percentage` from product master
- Total amount calculated with correct GST

### TC-GST-002: Create Indent — GST-exempt product (0% tax)

**UI Page:** `/o2c/indents/create`
**Priority:** P0

**Steps:**
1. Add a product with `tax_percentage = 0` in product master (e.g., agricultural inputs exempt under Schedule III)
2. Verify tax shows 0% in form (NOT 18%)
3. Submit indent

**Expected:**
- `tax_percentage = 0` preserved (NOT overridden to 18%)
- The `?? 0` nullish coalescing ensures 0% is treated as valid, not falsy
- Total = base price (no GST added)

### TC-GST-003: Update Indent Items — tax from product master

**File:** `src/app/o2c/actions/updateIndentItems.ts`
**UI Page:** `/o2c/indents/[id]` (edit mode)
**Priority:** P1

**Steps:**
1. Open an existing indent at `/o2c/indents/[id]`
2. Edit quantities or add new items
3. Save

**Expected:**
- Tax percentage re-resolved from product master via `pricingData.tax_percentage`
- NOT using stale frontend-sent `item.tax_percentage`

### TC-GST-004: batchResolvePackagePrices — product master over price_list_items

**File:** `src/app/o2c/actions/batchResolvePackagePrices.ts`
**Priority:** P1 — Internal utility, tested indirectly via TC-GST-001

**Steps:**
1. This is called internally when adding products to an indent at `/o2c/indents/create`
2. Verify by checking indent_items `tax_percentage` after creation

**Expected:**
- Tax sourced from `product_variants.products.tax_percentage` (product master)
- Falls back to `selectedPriceItem.tax_percentage` only if product master is null

### TC-GST-005: CreateIndentForm — nullish coalescing for tax_rate

**File:** `src/app/o2c/components/CreateIndentForm.tsx` (~L450)
**Priority:** P2 — Code review + tested via TC-GST-002

**Steps (Code Review):**
1. Verify line ~450 uses `productPackage.tax_rate ?? 0` (NOT `|| 18`)

**Expected:** `?? 0` used. Product with `tax_rate = 0` shows 0%, not 18%.

---

## 13B. Posting Groups & invoiceGLMapping Gap Fixes (March 2026)

### TC-GAP-001: invoiceGLMapping — getCustomerPostingGroupId queries master_dealers (not dealers)

**File:** `src/app/finance/actions/invoiceGLMapping.ts`
**Priority:** P1 — Code review + verified via TC-CM-001 and invoice posting

**Steps (Code Review):**
1. Open `invoiceGLMapping.ts`, locate `getCustomerPostingGroupId()`
2. Verify `.from('master_dealers')` (NOT `.from('dealers')`)
3. Verify function returns `null` gracefully (Phase 2 column not yet added)
4. Verify NO console.error logs for missing table/column

**Expected:**
- Table name = `master_dealers` (correct)
- Returns null (no customer_posting_group_id column exists yet — Phase 2)
- No runtime errors in server console
- Invoice posting falls back to system default posting profile (priority 10)

### TC-GAP-002: invoiceGLMapping — getItemPostingGroupId queries master_products (not products)

**File:** `src/app/finance/actions/invoiceGLMapping.ts`
**Priority:** P1 — Code review + verified indirectly

**Steps (Code Review):**
1. Open `invoiceGLMapping.ts`, locate `getItemPostingGroupId()`
2. Verify `.from('master_products')` (NOT `.from('products')`)
3. Verify function returns `null` for non-null productId
4. Verify NO console.error logs for missing table/column

**Expected:**
- Table name = `master_products` (correct)
- Returns null (no item_posting_group_id column exists yet — Phase 2)
- No runtime errors in server console

### TC-GAP-003: Dashboard — Navigation cards show correct status badges

**File:** `src/app/finance/posting-profiles/components/PostingProfilesDashboard.tsx`
**UI Page:** `/finance/posting-profiles`
**Priority:** P1

**Steps:**
1. Navigate to `/finance/posting-profiles`
2. Verify card badges:
   - Posting Profiles Matrix → "Active" badge (primary variant)
   - Customer Posting Groups → "Setup Only" badge (secondary variant)
   - Item Posting Groups → "Setup Only" badge (secondary variant)
   - Vendor Posting Groups → "Setup Only" badge (secondary variant)
   - Tax Determination Matrix → "Active" badge (primary variant)
   - Posting Simulation → "Testing Tool" badge (outline variant)
3. Verify Getting Started guide order:
   - Step 1: Configure Posting Profiles Matrix (Required badge)
   - Step 2: Configure Tax Determination Matrix (Required for GST badge)
   - Step 3: Test with Simulation Tool (Recommended badge)
   - Step 4: Configure Posting Groups (Future — Phase 2 badge, muted step number)

**Expected:** All badges render correctly. Step 4 is visually de-emphasized (muted colors).

### TC-GAP-004: Customer Posting Groups page — info alert shown

**File:** `src/app/finance/posting-profiles/components/CustomerPostingGroupsManager.tsx`
**UI Page:** `/finance/posting-profiles/customer-groups`
**Priority:** P2

**Steps:**
1. Navigate to `/finance/posting-profiles/customer-groups`
2. Verify info alert at top with title "Master Data — Setup Only"
3. Verify alert mentions Phase 2 and dealer form integration

**Expected:** Alert visible above filter card. CRUD operations still work normally.

### TC-GAP-005: Item Posting Groups page — info alert shown

**File:** `src/app/finance/posting-profiles/components/ItemPostingGroupsManager.tsx`
**UI Page:** `/finance/posting-profiles/item-groups`
**Priority:** P2

**Steps:**
1. Navigate to `/finance/posting-profiles/item-groups`
2. Verify info alert at top with title "Master Data — Setup Only"
3. Verify alert mentions Phase 2 and Ind AS 2 context

**Expected:** Alert visible above filter card. CRUD operations still work normally.

### TC-GAP-006: Vendor Posting Groups page — info alert shown

**File:** `src/app/finance/posting-profiles/components/VendorPostingGroupsManager.tsx`
**UI Page:** `/finance/posting-profiles/vendor-groups`
**Priority:** P2

**Steps:**
1. Navigate to `/finance/posting-profiles/vendor-groups`
2. Verify info alert at top with title "Master Data — Setup Only"
3. Verify alert mentions Phase 2 and MSMED Act 2006 context

**Expected:** Alert visible above filter card. CRUD operations still work normally.

### TC-GAP-007: Main dashboard info alert — distinguishes Active vs Setup Only

**File:** `src/app/finance/posting-profiles/components/PostingProfilesDashboard.tsx`
**UI Page:** `/finance/posting-profiles`
**Priority:** P2

**Steps:**
1. Navigate to `/finance/posting-profiles`
2. Verify main info alert text mentions: "Sections marked Active are used in production. Sections marked Setup Only are master data preparation for future hierarchical matching."

**Expected:** Alert clearly explains Active vs Setup Only distinction with inline badges.

---

## 14. Negative / Edge Case Matrix

| # | Test Case | Expected Behavior | Severity | Test Method |
|---|-----------|-------------------|----------|-------------|
| NEG-001 | `posting_profiles` table has no rows for tenant | All GL-dependent actions fail with clear `PostingProfileNotFoundError` | P0 | Staging only — deactivate profiles, test, restore |
| NEG-002 | Duplicate profiles same module\|account, different `rule_priority` | Highest `rule_priority` wins (ORDER BY desc) | P1 | DB insert + test + cleanup |
| NEG-003 | `gl_account_id` points to inactive COA entry | resolveGL returns UUID (profile is active). JE insert may fail at constraint level | P2 | DB deactivate COA, test JE, restore |
| NEG-004 | `resolveMultipleGL` with partial match (3 of 4 found) | `PostingProfileNotFoundError` for first missing spec — entire batch fails atomically | P1 | Deactivate 1 of 4 profiles, test VAN recon, restore |
| NEG-005 | VAN payment — both `bank_van` and `bank_control` missing | `resolveMultipleGL` throws, reconciliation fails: "GL accounts not configured" | P1 | Deactivate both, test, restore |
| NEG-006 | Cash receipt reversal — null `bank_account_id` AND `bank_control` missing | Returns error: "Bank account not configured for receipt" | P1 | Test via TC-CR-005 variant |
| NEG-007 | Credit memo for cancelled invoice | Blocked before GL resolution: "Invoice has been cancelled" (INVOICE_CANCELLED) | P1 | Via `/finance/credit-memos/new` |
| NEG-008 | Credit memo amount > invoice total | Blocked: "Credit amount cannot exceed invoice total" (AMOUNT_EXCEEDS_INVOICE) | P1 | Via `/finance/credit-memos/new` |
| NEG-009 | Year-end close — `finance|retained_earnings` missing | Clear error pointing to missing posting profile | P1 | Deactivate, test at `/finance/fiscal-periods`, restore |
| NEG-010 | Stale cache after profile update (within 10 min) | Stale value used for up to 10 min. `clearGLCache()` for immediate refresh | P2 | Observe via logs |
| NEG-011 | GST-exempt product (tax = 0) in indent | `?? 0` preserves 0% — NOT overridden to 18% (old `\|\| 18` bug) | P0 | Via `/o2c/indents/create` (TC-GST-002) |

---

## 15. Regression Test Matrix

These existing workflows MUST continue to work after the migration. Only includes workflows with actual UI pages:

| # | Workflow | UI Route | Key Files | Pass Criteria |
|---|----------|----------|-----------|---------------|
| REG-001 | O2C: Indent → SO → Invoice | `/o2c/indents/create` → `/o2c/sales-orders/[id]` → Invoice | journal-automation.ts, createInvoice.ts | Invoice JE posts with correct AR, Revenue, GST |
| REG-002 | Cash Receipt: Create → Apply → Unapply | `/finance/cash-receipts/new` → `/[id]/apply` → `/[id]` | cashReceiptActions.ts, applyCashReceipt, unapplyCashReceipt | All JEs balance, invoice status toggles |
| REG-003 | VAN Payment: View → Reconcile | `/finance/van-payments` → `/[id]/reconcile` | vanPaymentActions.ts | VAN bank account used, EPD if eligible |
| REG-004 | Credit Memo: Create → Auto-apply | `/finance/credit-memos/new` or Sales Return button | createCreditMemo.ts | 4070 account (not 11116/4210), auto-applied |
| REG-005 | Fiscal Period: Year-End Close | `/finance/fiscal-periods` | fiscalPeriodActions.ts | Retained Earnings from posting_profiles |
| REG-006 | Dealer Ledger: View | `/finance/dealer-ledger` | dealerLedgerActions.ts | AR from posting_profiles, balance correct |
| REG-007 | EPD Settings: View | `/finance/epd-settings` | epdSettingsActions.ts | Page loads, no GL errors |
| REG-008 | ECL Report: View | `/finance/reports/ecl-provisioning` | eclProvisionActions.ts | GL from posting_profiles, report loads |
| REG-009 | AR Health Dashboard: View | `/finance/reports/ar-health` | arMonitoringDashboard.ts | AR UUID resolved, metrics correct |
| REG-010 | GL-AR Reconciliation: View | `/finance/reports/gl-ar-reconciliation` | reconcileGLAR.ts | AR UUID resolved, variance correct |
| REG-011 | O2C Indent: Create with GST | `/o2c/indents/create` | createIndent.ts, batchResolvePackagePrices.ts | Tax from product master, 0% preserved |

---

## 16. GL Account Mapping Quick Reference

| Posting Profile | Staging Code | Staging Name | Prod Code | Prod Name |
|----------------|-------------|-------------|-----------|-----------|
| `sales\|ar_control` | 1702 | Trade Debtors - A/R | 1601 | Trade Debtors |
| `sales\|bad_debt_expense` | 6495 | Bad Debts Written Off | 6495 | Bad Debts Written Off |
| `sales\|credit_writeoff` | 1709 | Provision for Doubtful Debts | 1709 | Provision for Doubtful |
| `sales\|early_payment_discount` | 6502 | EPD Discount Expense | 6502 | EPD Discount Expense |
| `sales\|revenue` | 4100 | Sales Revenue | 4001 | Sales Revenue |
| `finance\|bank_control` | 1112 | Primary Bank HDFC | 1810 | Primary Bank |
| `finance\|bank_van` | 1812 | Axis Bank VAN | 1812 | Axis Bank VAN |
| `finance\|unapplied_cash` | 2050 | Unapplied Cash | 2050 | Unapplied Cash |
| `finance\|retained_earnings` | 3200 | Retained Earnings | 3130 | Retained Earnings |
| `finance\|petty_cash` | 1802 | Petty Cash | 1802 | Petty Cash |
| `purchase\|ap_control` | 2200 | Accounts Payable | 2200 | Accounts Payable |
| `purchase\|gst_input_cgst` | 1410 | Input CGST | 1410 | Input CGST |
| `inventory\|inventory_asset` | 1300 | Inventory Asset | 1300 | Inventory Asset |
| `dealer_management\|credit_note` | 4070 | Credit Memo / Credit Note | 4070 | Credit Memo / Credit Note |

**Key Insight:** Account CODES differ between environments (e.g., AR = `1702` on staging vs `1601` on production), but the posting_profile (`sales|ar_control`) resolves to the correct UUID on each environment. This is the entire point of the migration.

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Test Cases | 72 |
| P0 (Critical — UI functional) | 20 |
| P1 (High — UI functional + edge) | 31 |
| P2 (Medium — reports/settings/UX) | 16 |
| P3 (Code review only — dead code) | 5 |
| Pre-Requisite Checks | 3 |
| Negative / Edge Cases | 11 |
| Regression Tests | 11 |
| Gap Fix Tests (Section 13B) | 7 |
| Phase Coverage | All 9 phases + DAEE-247 + Gap Fixes |
| Files Covered | All 29 modified + 4 UX fix files |
| Dead Code Files (no UI callers) | 4 (writeOff, postInventoryMovement, postSupplierInvoice, postVendorPayment) |
| Environments | Staging + Production |

### Dead Code Disclosure

The following 4 server action files were migrated from hardcoded codes → posting_profiles but have **ZERO imports** anywhere in the codebase. They are dead code — no UI page or component calls them:

1. `writeOffActions.ts` — No write-off UI exists
2. `postInventoryMovement.ts` — No inventory posting UI exists
3. `postSupplierInvoice.ts` — P2P uses its own actions at `/p2p/supplier-invoices`
4. `postVendorPayment.ts` — AP Payments uses different actions at `/finance/ap-payments`

These files were still migrated because: (a) they may be wired up in future, (b) they should not have broken hardcoded references lying around, (c) TypeScript compilation includes them.
