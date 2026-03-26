# FEATURE-001 - Cash Receipts (Manual & VAN) Analysis

**Metadata**
- **ID**: FEATURE-001
- **Module**: Finance - Cash Receipts
- **Story**: DAE-128 (Manual), DAEE-38 (VAN)
- **Date**: 2026-02-18
- **Status**: Analysis

---

## Feature Overview

### Purpose
Cash Receipts support two flows: (1) Manual creation and application to invoices with EPD handling, and (2) Automated VAN (Virtual Account Number) payments from Axis Bank with validation → posting → FIFO allocation and EPD. Tenant configuration drives EPD approach (reduce outstanding vs create CCN) and EPD slab formulas.

### User Stories
- **As a** Finance user, **I want to** create manual cash receipts and apply them to open invoices with optional EPD, **so that** customer payments are recorded and allocated correctly.
- **As a** system, **I want to** receive VAN validation and posting API calls from the bank, **so that** payments are auto-allocated FIFO with EPD per tenant config.
- **As a** tenant admin, **I want to** configure EPD approach, formula, and slabs, **so that** early payment discounts are applied consistently.

### Acceptance Criteria (Summary)
1. Manual: Create cash receipt → Apply to invoices (with EPD toggle/adjust) → Discount reduces outstanding or CCN per config.
2. VAN: Validation API accepts valid VAN → Posting API posts payment → Cash receipt created → FIFO allocation → EPD per slabs.
3. EPD: Tenant config (2 approaches, 2 formulas); EPD slabs tenant-configurable; EPD on taxable amount only.

---

## Test Scenario Identification

### 1. Manual Cash Receipts (UI)

| Scenario ID | Description | Priority | Test ID |
|-------------|-------------|----------|---------|
| FS-001-001 | User creates manual cash receipt with valid data | P0 | FIN-CR-TC-001 |
| FS-001-002 | User applies cash receipt to single invoice | P0 | FIN-CR-TC-002 |
| FS-001-003 | User adjusts EPD discount amount (within max) | P1 | FIN-CR-TC-003 |
| FS-001-004 | User toggles EPD enabled/disabled on application | P1 | FIN-CR-TC-004 |
| FS-001-005 | User applies payment to multiple invoices | P1 | FIN-CR-TC-005 |

### 2. VAN API - Validation

| Scenario ID | CSV ID | Description | Priority | Test ID |
|-------------|--------|-------------|----------|---------|
| FS-001-006 | TC_ABP_01 | Valid VAN with mapped dealer | P0 | FIN-VAN-TC-001 |
| FS-001-007 | TC_ABP_02 | Invalid/unmapped VAN rejected | P0 | FIN-VAN-TC-002 |
| FS-001-008 | TC_ABP_03 | Invalid signature rejected | P0 | FIN-VAN-TC-003 |
| FS-001-009 | TC_ABP_04 | Inactive dealer VAN rejected | P1 | FIN-VAN-TC-004 |

### 3. VAN API - Posting

| Scenario ID | CSV ID | Description | Priority | Test ID |
|-------------|--------|-------------|----------|---------|
| FS-001-010 | TC_ABP_05 | Successful posting with FIFO allocation | P0 | FIN-VAN-TC-005 |
| FS-001-011 | TC_ABP_06 | Unvalidated payment rejected | P0 | FIN-VAN-TC-006 |
| FS-001-012 | TC_ABP_07 | Duplicate UTR rejected | P1 | FIN-VAN-TC-007 |
| FS-001-013 | TC_ABP_08 | Amount mismatch rejected | P1 | FIN-VAN-TC-008 |

### 4. VAN EPD Discount

| Scenario ID | CSV ID | Description | Priority | Test ID |
|-------------|--------|-------------|----------|---------|
| FS-001-014 | TC_ABP_14 | EPD within 7 days (2.5%) | P0 | FIN-VAN-TC-014 |
| FS-001-015 | TC_ABP_15 | EPD 8-15 days (2.0%) | P0 | FIN-VAN-TC-015 |
| FS-001-016 | TC_ABP_16 | No EPD after 30 days | P1 | FIN-VAN-TC-016 |
| FS-001-017 | TC_ABP_17 | EPD on taxable amount only | P0 | FIN-VAN-TC-017 |

### 5. VAN FIFO & Advances

| Scenario ID | CSV ID | Description | Priority | Test ID |
|-------------|--------|-------------|----------|---------|
| FS-001-018 | TC_ABP_23 | FIFO allocation order | P0 | FIN-VAN-TC-023 |
| FS-001-019 | TC_ABP_24 | Overpayment creates dealer advance | P1 | FIN-VAN-TC-024 |
| FS-001-020 | TC_ABP_25 | No invoices → full advance | P1 | FIN-VAN-TC-025 |

### 6. Tenant EPD Configuration (UI)

| Scenario ID | Description | Priority | Test ID |
|-------------|-------------|----------|---------|
| FS-001-021 | Configure EPD approach (reduce outstanding vs create CCN) | P1 | FIN-EPD-TC-001 |
| FS-001-022 | Configure EPD formula | P1 | FIN-EPD-TC-002 |
| FS-001-023 | Add EPD slab (e.g. 0-7 days, 2.5%) | P1 | FIN-EPD-TC-003 |
| FS-001-024 | Verify EPD calculation with configured slabs | P1 | FIN-EPD-TC-004 |

### 7. Remaining VAN CSV Tests (40 total – reference only)
- TC_ABP_09–13: Sender/IFSC matching (FIX-001)
- TC_ABP_18–19: Partial EPD, tenant without slabs
- TC_ABP_20–22: Journal/bank account (1812, tenant override, Schedule III)
- TC_ABP_26–27, 31–32: Security (no debug, HMAC strictness, XSS, SQLi)
- TC_ABP_28–30: Zero/negative/large amount
- TC_ABP_33–40: Concurrency, expired VAN, reversal, fiscal year, idempotency, etc.

---

## Test Data Requirements

### Stable Data (TestDataLocator / DB)
- Active dealers with VAN mappings (`van_dealer_mappings`, `dealers`)
- Invoices with outstanding balances (`invoices`, `invoice_balance`)
- Tenant with EPD configuration (`epd_discount_slabs`, `tenant_settings`)

### Transactional Data (AUTO_QA_ prefix)
- Cash receipts: `AUTO_QA_${Date.now()}_CR`
- VAN UTRs: `AUTO_QA_${Date.now()}_UTR` or `AUTO_QA_${Date.now()}_VAN`
- Test payloads: unique `Tran_id`, `UTR` per run

### API Credentials (.env.local)
- `VAN_API_BASE_URL` (e.g. https://api-staging.daee.in)
- `VAN_API_KEY` (X-API-KEY)
- `VAN_SHARED_SECRET` (HMAC-SHA256)

---

## Integration Points

- **Cash receipt creation**: `cash_receipt_headers` (or equivalent), journal entry (Dr. Bank, Cr. Unapplied Cash).
- **Application**: `cash_receipt_applications` → invoice balance; EPD stored in application (discount_taken, discount_type, was_within_epd_period).
- **VAN**: `van_payment_collections` (status: validated → posted) → `cash_receipt_headers` → `cash_receipt_applications` (FIFO).
- **EPD**: `epd_discount_slabs` (days_from, days_to, discount_percentage), tenant EPD approach/formula in tenant_settings.

---

## Priority Summary

| Priority | Count | Focus |
|----------|-------|--------|
| P0 | 12 | Manual create/apply, VAN validation/posting happy path, EPD slabs, FIFO |
| P1 | 12 | EPD adjust/toggle, multi-invoice apply, VAN edge cases, overpayment/advance, EPD config UI |
| P2 | Remaining | Security, concurrency, reversal, fiscal year, idempotency (from CSV) |
