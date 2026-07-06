# DAEE ERP — Full Module & Page Map

Authoritative enumeration of **every sidebar module and page**, derived from
`web_app/src/components/sidebar/app-sidebar.tsx`. This is the coverage checklist —
each page below gets a workflow section + screenshot slot(s) in its module guide.

Status: ⚪ stub · 🟡 in progress · 🟢 authored

---

## 1. Executive Dashboard — `executive-dashboard/` ⚪
- Executive Dashboard — `/dashboard/executive`

## 2. Dealer Applications — `dealer-applications/` ⚪
- Dealer Applications (list/intake) — `/dealer-applications`
- Dashboard — `/dealer-applications/dashboard`
- Custom Dealer Form Builder — `/dealer-applications/custom-dealer-form-builder`
- Terms and Conditions — `/dealer-applications/dealer-application-terms-and-conditions`

## 3. Order to Cash (O2C) — `o2c/` 🟢 (pilot: `o2c/order-to-cash.md`)
- Sales Indents — `/o2c/indents`
- Sales Orders — `/o2c/sales-orders`
- Invoices — `/o2c/invoices`
- Back Orders — `/o2c/back-orders`
- Sales Returns — `/o2c/sales-returns`
- Production Management — `/o2c/production`
- Background Jobs — `/o2c/jobs`
- Operation Audit — `/o2c/audit`
- Reports — `/o2c/reports` → Sales, Product Sales, Discount, User-Wise, Credit Utilization,
  Collection, Payment Allocation, Invoice Cancellation, Order Value, Sales Return,
  Delivery Challan, Price History (12 reports)
  🟢 Guide: [`o2c/reports.md`](./o2c/reports.md) — covers Collection Report + Hierarchical Product Sales.

## 4. Finance & Accounts — `finance/` ⚪
- Dashboard — `/finance/dashboard`
- **Accounts Receivable**: Cash Receipts `/finance/cash-receipts`, Credit Memos `/finance/credit-memos`,
  Dealer Ledger `/finance/dealer-ledger`, Debit Notes `/finance/debit-memos`,
  Payment Discounts (EPD) `/finance/payment-discounts`, EPD Summary `/finance/epd-summary`,
  EPD Override Approvals `/finance/epd-overrides`, Dealer Advances `/finance/dealer-advances`,
  Bulk Unapply `/finance/bulk-unapply`, Security Deposits `/finance/dealer-security-deposits`,
  AR Aging `/finance/ar-aging`, Dealer Outstanding `/finance/reports/dealer-outstanding`,
  Customer Statements `/finance/reports/customer-statements`
- **Accounts Payable**: Supplier Invoices `/finance/ap-invoices`, Vendor Payments `/finance/ap-payments`,
  AP Aging `/finance/reports/ap-aging`, Supplier Ledger `/finance/supplier-ledger`
- **Payroll Accounting**: Posting Runs `/finance/payroll-posting`, Disbursement `/finance/payroll-disbursement`,
  Liabilities `/finance/payroll-liabilities`
- **Fixed Assets**: Asset Register `/finance/fixed-assets`, Acquisitions `/finance/fixed-assets/acquisitions`,
  Capitalization `/finance/fixed-assets/capitalization`, Depreciation `/finance/fixed-assets/depreciation`
- **General Ledger**: Chart of Accounts `/finance/chart-of-accounts`, Journal Entries `/finance/journal-entries`,
  Trial Balance `/finance/reports/trial-balance`, GL Report `/finance/reports/general-ledger`
- **Banking & Collections**: VAN Payments `/finance/van-payments`, Virtual Account Numbers `/finance/van-management`,
  Payment Reconciliation `/finance/reconciliation`
- **Financial Reports**: Day Book, Profit & Loss, Balance Sheet, Schedule III Disclosures,
  Cash Flow, Group Summary, GL-AR Reconciliation, AR Health, Discount Variance (SA 240),
  Reversal Frequency (SA 240), ECL Provisioning (Ind AS 109)
- **GST Compliance**: GSTR-1 Review, GSTR-2 Inward, 2B Reconciliation, 3B ITC Summary,
  GSTR-2 Report, GSTR-3B Report (under `/finance/compliance/…`)
- **Data Imports**: Import Batches `/finance/imports`, OCR Scanner `/finance/imports?tab=ocr`
- **Setup & Configuration**: Posting Profiles, Payment Terms, Fiscal Periods, Customer/Vendor/Item
  Posting Groups, Tax Matrix, Posting Simulation, EPD Slab Config, EPD Settings, EPD Calculator,
  VAN Configuration, Banks (under `/finance/posting-profiles/…`, `/finance/settings/…`)

## 5. Warehouse Management — `warehouse-management/` ⚪
- Dashboard, Warehouses, Zones, Aisles, Racks, Bins (`/warehouse-management/…`)
- Inventory — `/o2c/inventory`
- Inter-warehouse Transfers — `/warehouse-management/iwt`
- Picklists — `/warehouse-management/picking`
- Cycle Count — `/warehouse-management/cycle-count`
- Raw Material Inventory — `/raw-material-inventory`
- **Inventory Reports**: Stock Movement, Batch Tracking, Inventory Health, Inventory Ledger,
  Inter-Warehouse Transfer (`/inventory/reports/…`), Warehouse Stock (`/warehouse-management/reports/stock`)

## 6. Plant Production — `plant-production/` ⚪
- Plants Setup, BOM Management, Production Orders, Material Approvals, Material Requests,
  Production Planning, Material Issuance, Quality Control, Packaging, QR Generator, Scrap Records,
  Expiry Alerts, Anomalies, Posting Profiles, Production Reports (`/plant-production/…`)
- Job Work Dashboard — `/job-work/dashboard`

## 7. Job Works — `job-works/` ⚪
- Job Work Orders `/job-work`, JW Invoices `/job-work/invoices`, JW Sales Returns `/job-work/sales-returns`,
  JW Credit Memos `/job-work/credit-memos`, JW Customers `/job-work/customers`,
  JW Outstanding `/finance/reports/dealer-outstanding?customer_scope=jw`

## 8. Human Resources (HRMS) — `hrms/` ⚪
- Dashboard `/hrms`
- **Employee Management**: Directory `/hrms/employees`, KYC `/hrms/employees/kyc`, Benefits `/hrms/benefits`
- **Leave Management**: Requests `/hrms/leaves`, Types `/hrms/leaves/leave-types`
- Payroll `/hrms/payroll`
- **Expense Management**: My Claims `/hrms/expenses`, Categories `/hrms/expenses/categories`
- Attrition `/hrms/attrition`, Appraisals `/hrms/appraisals`, Departments `/hrms/departments`, Designations `/hrms/designations`

## 9. Procure to Pay (P2P) — `p2p/` ⚪
- Dashboard `/p2p`, Procurement Requests `/p2p/procurement-requests`, RFQ `/p2p/rfq`,
  Supplier Quotes `/p2p/quotes`, Purchase Orders `/p2p/purchase-orders`, Goods Receipt Notes `/p2p/grn`,
  Supplier Invoices `/p2p/supplier-invoices`, Three-Way Matching `/p2p/matching`,
  Payment Queue `/p2p/payment-queue`, Supplier Categories `/p2p/suppliers/categories`,
  Approval Workflows `/p2p/approval-workflow`

## 10. Sales CRM — `sales-crm/` ⚪
- Product Attributes → Sales Categories — `/sales-crm/sales-categories`

## 11. Gamified Rebate — `gamified-rebate/` ⚪
- Dealer Portal `/crm/gamified-rebate/dealer-portal`, Campaigns `/crm/gamified-rebate/campaigns`,
  Dashboard `/crm/gamified-rebate/dashboard`

## 12. Documentation — `documentation/` ⚪ — `/docs`
## 13. Support — `support/` ⚪ — `/support`
## 14. Notes — `notes/` ⚪ — `/notes`
## 15. Dealers — `dealers/` ⚪ — `/dealers`
## 16. Regions & Territories — `regions/` ⚪ — `/regions`
## 17. Logistics & Transport Management — `logistics/` ⚪ — `/logistics-transport-management`
## 18. Products — `products/` ⚪ — `/products`
## 19. Price Lists — `price-lists/` ⚪ — `/price-lists`
## 20. Raw Materials — `raw-materials/` ⚪ — `/raw-materials`
## 21. Suppliers — `suppliers/` ⚪ — `/p2p/suppliers` (supplier master; categories at `/p2p/suppliers/categories`)
## 22. Factory — `factory/` ⚪ — nav group (`#`); confirm intended sub-pages with product
## 23. Research & Development — `research-development/` ⚪ — `/research-development`
## 24. Address Book — `address-book.md` 🟢 — `/address-book` (shared master data; dealer Bill-To/Ship-To, warehouse dispatch/seller, company Bill-From)

---

### Coverage notes
- **Role/persona visibility:** the sidebar is permission-filtered, so a given operator
  sees a subset. Each module guide states which personas see it (RBAC).
- **Cross-module links:** Suppliers ↔ P2P ↔ Finance AP; Dealers ↔ Dealer Applications ↔ O2C;
  Warehouse ↔ Inventory reports; Plant Production ↔ Job Works. Documented as cross-refs.
- **`Factory`** currently points to `#` (group placeholder) — flag to product for intended pages.
