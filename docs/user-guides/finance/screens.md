# Finance & Accounts — Screen Index

> A visual index of **every Finance page**, grouped by area, with what each screen is for. For guided
> workflows (record a receipt, post a journal, month-end close, file GST) see the
> **[Finance & Accounts guide](./README.md)**.

> **Audience:** Customer + Internal · **Module:** `/finance` · **Status:** 🟢 Screen index
> **Verified:** all routes enumerated and captured from `web_app/src/app/finance` on 2026-06-17.

## Overview

### Finance Dashboard
Finance home — key balances, collections, and quick links across all areas.
![Finance Dashboard](../assets/finance/overview.png)
<!-- capture: { "project": "iacs-md", "route": "/finance" } -->

### Dashboard
Finance KPI dashboard — receivables, payables, and cash position at a glance.
![Dashboard](../assets/finance/dashboard.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/dashboard" } -->

## Accounts Receivable

### Adjustments
Post receivable adjustments and corrections.
![Adjustments](../assets/finance/adjustments.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/adjustments" } -->

### AR Aging
Outstanding receivables bucketed by age (current, 30/60/90+ days).
![AR Aging](../assets/finance/ar-aging.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/ar-aging" } -->

### Bulk Settlement Operations
Run large-scale receipt/settlement operations as a tracked job.
![Bulk Settlement Operations](../assets/finance/bulk-settlement-operations.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/bulk-settlement-operations" } -->

### Bulk Unapply
Reverse applied cash receipts in bulk (controlled correction tool).
![Bulk Unapply](../assets/finance/bulk-unapply.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/bulk-unapply" } -->

### Cash Receipts
Record money received from dealers and apply it to open invoices.
![Cash Receipts](../assets/finance/cash-receipts.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/cash-receipts" } -->

### Credit Memos
Issue and track credit notes (CCN) raised against dealer invoices.
![Credit Memos](../assets/finance/credit-memos.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/credit-memos" } -->

### Dealer Advances
Track advance payments received from dealers and their application.
![Dealer Advances](../assets/finance/dealer-advances.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/dealer-advances" } -->

### Dealer Ledger
The running account for each dealer — invoices, receipts, notes, balance.
![Dealer Ledger](../assets/finance/dealer-ledger.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/dealer-ledger" } -->

### Security Deposits
Record and track refundable security deposits held against dealers.
![Security Deposits](../assets/finance/dealer-security-deposits.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/dealer-security-deposits" } -->

### Debit Notes
Issue and track debit notes raised against dealers.
![Debit Notes](../assets/finance/debit-memos.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/debit-memos" } -->

### EPD Calculator
Preview the early-payment discount for a given amount and pay date.
![EPD Calculator](../assets/finance/epd-calculator.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/epd-calculator" } -->

### EPD Slab Configuration
Define the tenant-wide early-payment-discount slabs (days → %).
![EPD Slab Configuration](../assets/finance/epd-configuration.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/epd-configuration" } -->

### EPD Override Approvals
Review and approve manual exceptions to early-payment-discount rules.
![EPD Override Approvals](../assets/finance/epd-overrides.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/epd-overrides" } -->

### EPD Settings
Tenant-level early-payment-discount behaviour and toggles.
![EPD Settings](../assets/finance/epd-settings.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/epd-settings" } -->

### EPD Summary
Overview of early-payment discounts issued and their value.
![EPD Summary](../assets/finance/epd-summary.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/epd-summary" } -->

### Payment Discounts (EPD)
Set up dealer-specific early-payment-discount terms.
![Payment Discounts (EPD)](../assets/finance/payment-discounts.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/payment-discounts" } -->

### Payments
Capture and apply dealer payments.
![Payments](../assets/finance/payments.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/payments" } -->

## Accounts Payable

### Supplier Invoices
Capture and review supplier (vendor) bills for payment.
![Supplier Invoices](../assets/finance/ap-invoices.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/ap-invoices" } -->

### Vendor Payments
Pay approved, matched supplier invoices (with TDS where applicable).
![Vendor Payments](../assets/finance/ap-payments.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/ap-payments" } -->

### Supplier Ledger
The running account for each supplier — bills, payments, balance.
![Supplier Ledger](../assets/finance/supplier-ledger.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/supplier-ledger" } -->

## General Ledger

### Chart of Accounts
The tenant's account structure — every GL account transactions post to.
![Chart of Accounts](../assets/finance/chart-of-accounts.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/chart-of-accounts" } -->

### Journal Entries
Post and review manual, balanced GL entries.
![Journal Entries](../assets/finance/journal-entries.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/journal-entries" } -->

### Trial Balance
Debit/credit balances of all accounts — the GL must balance.
![Trial Balance](../assets/finance/trial-balance.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/trial-balance" } -->

## Banking & Collections

### Payment Reconciliation
Match bank/VAN receipts to invoices and ledger entries.
![Payment Reconciliation](../assets/finance/reconciliation.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/reconciliation" } -->

### Virtual Account Numbers
Issue and manage dealer virtual account numbers (VANs).
![Virtual Account Numbers](../assets/finance/van-management.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/van-management" } -->

### VAN Payments
Collections received into virtual account numbers (Axis VAN).
![VAN Payments](../assets/finance/van-payments.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/van-payments" } -->

### VAN Payments — Dashboard
VAN collection metrics and recent activity.
![VAN Payments — Dashboard](../assets/finance/van-payments-dashboard.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/van-payments/dashboard" } -->

### VAN Payments — Dealers
Dealers mapped to virtual account numbers.
![VAN Payments — Dealers](../assets/finance/van-payments-dealers.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/van-payments/dealers" } -->

### VAN Payments — List
All VAN payment transactions.
![VAN Payments — List](../assets/finance/van-payments-list.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/van-payments/list" } -->

### VAN Payments — Settings
VAN collection behaviour and mapping rules.
![VAN Payments — Settings](../assets/finance/van-payments-settings.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/van-payments/settings" } -->

## Financial Reports

### Balance Sheet
Assets, liabilities, and equity as at a date.
![Balance Sheet](../assets/finance/balance-sheet.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/balance-sheet" } -->

### Schedule III Disclosures
Companies-Act Schedule III presentation and disclosures.
![Schedule III Disclosures](../assets/finance/disclosures.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/disclosures" } -->

### Profit & Loss Statement
Income statement — revenue, expenses, and profitability.
![Profit & Loss Statement](../assets/finance/profit-loss.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/profit-loss" } -->

### Reports Home
Entry point to all financial and assurance reports.
![Reports Home](../assets/finance/reports.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/reports" } -->

### AP Aging Report
Payables bucketed by age.
![AP Aging Report](../assets/finance/reports-ap-aging.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/reports/ap-aging" } -->

### AR Aging Report
Receivables bucketed by age.
![AR Aging Report](../assets/finance/reports-ar-aging.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/reports/ar-aging" } -->

### AR Health Dashboard
Receivables health indicators and trends.
![AR Health Dashboard](../assets/finance/reports-ar-health.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/reports/ar-health" } -->

### Balance Sheet Report
Balance sheet report with filters and export.
![Balance Sheet Report](../assets/finance/reports-balance-sheet.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/reports/balance-sheet" } -->

### Cash Flow
Cash inflows and outflows.
![Cash Flow](../assets/finance/reports-cash-flow.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/reports/cash-flow" } -->

### Cash Flow Statement
Statement of cash flows (operating/investing/financing).
![Cash Flow Statement](../assets/finance/reports-cash-flow-statement.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/reports/cash-flow-statement" } -->

### Customer Statements
Per-dealer account statements for sharing.
![Customer Statements](../assets/finance/reports-customer-statements.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/reports/customer-statements" } -->

### Day Book
Chronological list of all postings for a date/period.
![Day Book](../assets/finance/reports-day-book.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/reports/day-book" } -->

### Dealer Outstanding
What each dealer currently owes.
![Dealer Outstanding](../assets/finance/reports-dealer-outstanding.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/reports/dealer-outstanding" } -->

### Discount Variance (SA 240)
Fraud-risk assurance view of unusual discounting.
![Discount Variance (SA 240)](../assets/finance/reports-discount-variance.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/reports/discount-variance" } -->

### ECL Provisioning (Ind AS 109)
Expected-credit-loss provisioning on receivables.
![ECL Provisioning (Ind AS 109)](../assets/finance/reports-ecl-provisioning.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/reports/ecl-provisioning" } -->

### General Ledger Report
Account-wise ledger detail.
![General Ledger Report](../assets/finance/reports-general-ledger.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/reports/general-ledger" } -->

### GL-AR Reconciliation
Confirms the AR sub-ledger ties to the General Ledger.
![GL-AR Reconciliation](../assets/finance/reports-gl-ar-reconciliation.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/reports/gl-ar-reconciliation" } -->

### Group Summary
Balances summarised by account group.
![Group Summary](../assets/finance/reports-group-summary.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/reports/group-summary" } -->

### Pending Collection
Receivables still to be collected.
![Pending Collection](../assets/finance/reports-pending-collection.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/reports/pending-collection" } -->

### P&L Report
Profit & loss report with filters and export.
![P&L Report](../assets/finance/reports-profit-loss.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/reports/profit-loss" } -->

### Reversal Frequency (SA 240)
Fraud-risk assurance view of frequent reversals.
![Reversal Frequency (SA 240)](../assets/finance/reports-reversal-frequency.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/reports/reversal-frequency" } -->

### Trial Balance Report
Trial balance report with filters and export.
![Trial Balance Report](../assets/finance/reports-trial-balance.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/reports/trial-balance" } -->

## GST Compliance

### GST Compliance Home
Entry point to GST return reviews and reconciliations.
![GST Compliance Home](../assets/finance/compliance.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/compliance" } -->

### GSTR-1 Review
Review and export outward supplies (sales + credit/debit notes).
![GSTR-1 Review](../assets/finance/compliance-gstr1.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/compliance/gstr1" } -->

### GSTR-2 Inward Review
Review inward supplies (purchases) for the period.
![GSTR-2 Inward Review](../assets/finance/compliance-gstr2-inward.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/compliance/gstr2-inward" } -->

### GSTR-2 Report
Inward-supply report for filing.
![GSTR-2 Report](../assets/finance/compliance-gstr2-report.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/compliance/gstr2-report" } -->

### 2B Reconciliation
Match purchases to GSTR-2B before claiming input tax credit.
![2B Reconciliation](../assets/finance/compliance-gstr2b-recon.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/compliance/gstr2b-recon" } -->

### 3B ITC Summary
Input-tax-credit summary for GSTR-3B.
![3B ITC Summary](../assets/finance/compliance-gstr3b-itc.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/compliance/gstr3b-itc" } -->

### GSTR-3B Report
Summary return report for filing.
![GSTR-3B Report](../assets/finance/compliance-gstr3b-report.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/compliance/gstr3b-report" } -->

## Fixed Assets

### Asset Register
The register of all fixed assets.
![Asset Register](../assets/finance/fixed-assets.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/fixed-assets" } -->

### Asset Acquisitions
Record new asset purchases.
![Asset Acquisitions](../assets/finance/fixed-assets-acquisitions.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/fixed-assets/acquisitions" } -->

### Capitalization
Capitalise assets (e.g. from CWIP) into the register.
![Capitalization](../assets/finance/fixed-assets-capitalization.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/fixed-assets/capitalization" } -->

### Depreciation Runs
Run and post periodic depreciation.
![Depreciation Runs](../assets/finance/fixed-assets-depreciation.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/fixed-assets/depreciation" } -->

## Payroll

### Payroll Disbursement
Disburse approved payroll.
![Payroll Disbursement](../assets/finance/payroll-disbursement.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/payroll-disbursement" } -->

### Payroll Liabilities
Track payroll-related liabilities (statutory dues, etc.).
![Payroll Liabilities](../assets/finance/payroll-liabilities.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/payroll-liabilities" } -->

### Payroll Posting Runs
Review HRMS payroll runs and post them to the General Ledger.
![Payroll Posting Runs](../assets/finance/payroll-posting.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/payroll-posting" } -->

## Setup

### Audit Trail
Immutable log of finance actions for audit and compliance.
![Audit Trail](../assets/finance/audit-trail.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/audit-trail" } -->

### Fiscal Periods
Open and close accounting periods; controls what dates can be posted.
![Fiscal Periods](../assets/finance/fiscal-periods.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/fiscal-periods" } -->

### Data Imports
Bulk-import finance data; batch tracking and OCR scanner.
![Data Imports](../assets/finance/imports.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/imports" } -->

### Payment Terms
Define payment terms used across dealers/suppliers.
![Payment Terms](../assets/finance/payment-terms.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/payment-terms" } -->

### Posting Profiles
Rules that route every transaction to the correct GL accounts.
![Posting Profiles](../assets/finance/posting-profiles.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/posting-profiles" } -->

### Customer Posting Groups
Group dealers for consistent GL posting.
![Customer Posting Groups](../assets/finance/posting-profiles-customer-groups.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/posting-profiles/customer-groups" } -->

### Item Posting Groups
Group items/products for consistent GL posting.
![Item Posting Groups](../assets/finance/posting-profiles-item-groups.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/posting-profiles/item-groups" } -->

### Posting Matrix
The matrix mapping transaction types to accounts.
![Posting Matrix](../assets/finance/posting-profiles-matrix.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/posting-profiles/matrix" } -->

### Posting Simulation
Preview the GL entries a transaction would create before posting.
![Posting Simulation](../assets/finance/posting-profiles-simulation.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/posting-profiles/simulation" } -->

### Tax Matrix
Tax-account mapping (CGST/SGST/IGST/cess).
![Tax Matrix](../assets/finance/posting-profiles-tax-matrix.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/posting-profiles/tax-matrix" } -->

### Vendor Posting Groups
Group suppliers for consistent GL posting.
![Vendor Posting Groups](../assets/finance/posting-profiles-vendor-groups.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/posting-profiles/vendor-groups" } -->

### Banks
Maintain bank master records.
![Banks](../assets/finance/settings-banks.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/settings/banks" } -->

### VAN Configuration
Configure the Axis virtual-account-number integration.
![VAN Configuration](../assets/finance/settings-van-configuration.png)
<!-- capture: { "project": "iacs-md", "route": "/finance/settings/van-configuration" } -->
