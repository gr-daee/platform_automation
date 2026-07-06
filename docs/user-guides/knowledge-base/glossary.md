# ERP Glossary

> **Audience:** Customer + Internal | **Section:** Knowledge Base | **Status:** Authored
>
> Part of the **[Knowledge Base](../knowledge-base.md)**.


Complete terminology reference for DAEE ERP system. Terms are organized alphabetically with cross-references to related concepts.

---

## A

### Accounts Payable (AP)
Money owed by the company to suppliers for goods/services received. Tracked through supplier invoices and managed via payment runs.
- **Related**: Supplier Invoice, Vendor Posting Groups

### Accounts Receivable (AR)
Money owed to the company by customers for goods/services delivered. Tracked through sales invoices and managed via payment collection.
- **Related**: Customer Invoice, Dealer Ledger

### Aging Report
Financial report showing outstanding receivables/payables categorized by age (0-30, 31-60, 61-90, 90+ days).
- **Related**: AR Aging, Collection Management

### Allocation
Process of reserving inventory for a specific sales order or customer. In DAEE, uses FEFO (First Expiry First Out) algorithm.
- **Related**: FEFO Allocation, [Inventory Reservation](#inventory-reservation)

### Approval Workflow
Configurable multi-level approval process for business documents (purchase orders, expenses, leave requests).
- **Related**: P2P Approvals, Role Permissions

### Audit Trail
Complete log of all system activities including who made changes, when, and what was changed.
- **Related**: Audit Logs, Operation Audit

---

## B

### Back Order
Portion of a sales order that cannot be fulfilled immediately due to insufficient stock. Automatically created when FEFO allocation finds shortage.
- **Related**: Back Order Management, FEFO Allocation

### Batch Number
Unique identifier for a production lot. Critical for traceability in pharmaceutical industry.
- **Related**: Batch Tracking, [Manufacturing Date](#manufacturing-date)

### Bill of Materials (BOM)
List of raw materials, components, and quantities required to manufacture a finished product.
- **Related**: Plant Production, [Material Requirements](#material-requirements-planning)

### Bin
Smallest storage location within a warehouse. Part of hierarchy: Warehouse > Zone > Aisle > Rack > Bin.
- **Related**: Bin Management, Putaway Tasks

---

## C

### Cash Receipt
Record of cash payment received from a customer. Creates journal entry debiting cash and crediting AR.
- **Related**: Cash Receipts, Payment Allocation

### CGST (Central GST)
Central component of GST tax collected by the Central Government on intra-state transactions.
- **Related**: GST Compliance, Tax Determination

### Chart of Accounts (COA)
Structured list of all general ledger accounts used in financial reporting.
- **Related**: COA Setup, [Account Types](#account-types)

### Credit Limit
Maximum amount of credit extended to a customer. Sales orders blocked when limit exceeded.
- **Related**: Dealer Management, [Order Blocking](#order-blocking)

### Credit Memo
Document issued to reduce amount owed by customer (for returns, discounts, corrections).
- **Related**: Credit Memos, Sales Returns

### Cycle Counting
Periodic inventory verification process where a subset of inventory is counted on a scheduled basis.
- **Related**: Cycle Counting, Stock Adjustments

---

## D

### Dealer
Customer in DAEE system. Typically a distributor, retailer, or end customer.
- **Related**: Dealer Management, Dealer Ledger

### Dealer Application
Process for onboarding new dealers including KYC verification and credit approval.
- **Related**: Dealer Applications, E-Sign

### Dealer Ledger
Detailed transaction history for a specific dealer showing all invoices, payments, and adjustments.
- **Related**: Dealer Ledger, AR Sub-ledger

### Delivery Challan
Document accompanying goods during transport. May be used for goods sent on approval or for job work.
- **Related**: Delivery Challans, E-Way Bill

---

## E

### E-Invoice (IRN)
Electronic invoice registered with the GST portal, generating an Invoice Reference Number (IRN) and QR code.
- **Related**: E-Invoice Generation, GST Compliance

### E-Way Bill
Electronic document required for movement of goods exceeding INR 50,000. Generated through NIC portal.
- **Related**: E-Way Bill Management, Transport Management

### E-Sign
Digital signature using Aadhaar-based authentication. Used for dealer agreements and legal documents.
- **Related**: E-Sign Integration, eSign Management

### Early Payment Discount (EPD)
Discount offered to customers for paying invoices before the due date (e.g., 2% discount if paid within 10 days).
- **Related**: Payment Terms, Discount Configurations

### Expiry Date
Date after which a product should not be sold or used. Critical for pharmaceutical compliance.
- **Related**: FEFO Allocation, Batch Tracking

---

## F

### FEFO (First Expiry First Out)
Inventory allocation method that prioritizes items with earliest expiry dates. Mandatory for pharmaceuticals.
- **Related**: FEFO Allocation, Batch Tracking

### FIFO (First In First Out)
Inventory costing method where oldest stock is assumed sold first. Also used in payment allocation.
- **Related**: Payment Allocation, [Inventory Costing](#inventory-costing)

### Fiscal Period
Accounting period (month/quarter/year) for financial reporting. Controls posting dates and period closures.
- **Related**: Fiscal Periods, [Period Close](#period-close)

### Freight
Transportation charges for shipping goods. May be charged separately or included in product price.
- **Related**: Transport Management, [Invoice Charges](#invoice-charges)

---

## G

### General Ledger (GL)
Primary accounting record containing all financial transactions organized by account.
- **Related**: General Ledger, Journal Entries

### GRN (Goods Receipt Note)
Document recording receipt of goods from a supplier against a purchase order.
- **Related**: Goods Receipt Notes, Three-Way Matching

### GST (Goods and Services Tax)
Indirect tax on supply of goods and services in India. Includes CGST, SGST, and IGST.
- **Related**: GST Compliance, Tax Determination

### GSTIN
15-digit GST Identification Number assigned to registered businesses.
- **Related**: GSTN Verification, Dealer Management

---

## H

### HSN Code
Harmonized System of Nomenclature code for classifying goods. Required for GST compliance.
- **Related**: Product Master, Tax Configuration

---

## I

### IGST (Integrated GST)
GST collected on inter-state transactions where origin and destination states differ.
- **Related**: GST Compliance, Tax Determination

### Indent
Initial sales request from a customer before conversion to a sales order. Subject to approval workflow.
- **Related**: Sales Indents, [Order Processing](#order-processing)

### Inter-Warehouse Transfer (IWT)
Movement of inventory between warehouses within the same organization.
- **Related**: Inter-Warehouse Transfer, [Stock Movement](#stock-movement)

### Inventory Allocation
See [Allocation](#allocation)

### Invoice Reference Number (IRN)
Unique identifier generated by GST portal for e-invoices. 64-character alphanumeric string.
- **Related**: E-Invoice, E-Invoice Generation

---

## J

### Journal Entry
Accounting record of a transaction with debit and credit entries that must balance.
- **Related**: Journal Entries, General Ledger

---

## K

### KYC (Know Your Customer)
Verification process for customer/employee identity and documentation.
- **Related**: Dealer Applications, Employee KYC

---

## L

### Ledger Account
Individual account in the Chart of Accounts (e.g., Cash, Accounts Receivable, Sales Revenue).
- **Related**: Chart of Accounts, [Posting Profile](#posting-profile)

### Lead Time
Time between order placement and receipt of goods. Used in purchase planning.
- **Related**: [Procurement Planning](#procurement-planning), Supplier Performance

### Leave Balance
Remaining leave days available to an employee by leave type.
- **Related**: Leave Balances, Leave Management

---

## M

### Manufacturing Date
Date when a product batch was manufactured. Used along with expiry date for shelf life calculation.
- **Related**: Batch Tracking, Quality Control

### Material Requirements Planning (MRP)
Process of determining raw material needs based on production schedules and current inventory.
- **Related**: Material Requirements, [Bill of Materials](#bill-of-materials-bom)

### Multi-Tenant
Architecture where single software instance serves multiple organizations with complete data isolation.
- **Related**: Tenant Management, [RLS Security](#row-level-security)

---

## N

### Net Amount
Invoice amount after all discounts but before taxes.
- **Related**: [Invoice Calculation](#invoice-calculation), [Discount Processing](#discount-processing)

---

## O

### Order to Cash (O2C)
Complete business process from receiving customer order to collecting payment.
- **Related**: O2C Module, Complete O2C Cycle

### Outstanding Balance
Unpaid amount owed by a customer across all invoices.
- **Related**: Dealer Ledger, [Aging Report](#aging-report)

---

## P

### Payment Allocation
Process of applying customer payments to specific invoices. DAEE uses FIFO allocation.
- **Related**: Payment Allocation, [FIFO](#fifo-first-in-first-out)

### Payment Terms
Conditions for payment including due date calculation and early payment discounts.
- **Related**: Payment Terms, [Early Payment Discount](#early-payment-discount-epd)

### Picklist
Document used by warehouse staff to pick items for a sales order.
- **Related**: Picklists, FEFO Allocation

### Posting Profile
Configuration that maps business transactions to specific GL accounts.
- **Related**: Posting Profiles, Customer Posting Groups

### Price List
Collection of product prices applicable to specific customers or customer categories.
- **Related**: Price Lists, Customer Pricing

### Procure to Pay (P2P)
Complete business process from identifying procurement need to paying suppliers.
- **Related**: P2P Module, Purchase Orders

### Purchase Order (PO)
Formal document sent to supplier to order goods or services.
- **Related**: Purchase Orders, Procurement Requests

### Putaway
Process of storing received goods in appropriate warehouse location.
- **Related**: Putaway Tasks, Bin Management

---

## Q

### Quality Control (QC)
Process of inspecting goods to ensure they meet quality standards before acceptance.
- **Related**: Quality Control, QC Parameters

---

## R

### RBAC (Role-Based Access Control)
Security model where permissions are assigned to roles, and users are assigned to roles.
- **Related**: Role Management, Permission Matrix

### Reconciliation
Process of verifying that two sets of records match (e.g., bank reconciliation, VAN reconciliation).
- **Related**: Payment Reconciliation, VAN Payments

### Row Level Security (RLS)
Database-level security that restricts data access based on user context (tenant, role).
- **Related**: [Multi-Tenant](#multi-tenant), [Security Architecture](#security-architecture)

---

## S

### Sales Order
Confirmed customer order ready for fulfillment. Created from approved sales indent.
- **Related**: Sales Orders, FEFO Allocation

### Sales Return
Process of accepting returned goods from customer and issuing credit memo.
- **Related**: Sales Returns, [Credit Memo](#credit-memo)

### SGST (State GST)
State component of GST collected by the State Government on intra-state transactions.
- **Related**: GST Compliance, Tax Determination

### SKU (Stock Keeping Unit)
Unique identifier for a product variant. May include product, size, color, packaging.
- **Related**: Product Master, Product Variants

### Stock Adjustment
Correction to inventory quantities due to damage, theft, counting errors, or expiry.
- **Related**: Stock Adjustments, Cycle Counting

### Supplier Invoice
Invoice received from supplier for goods or services purchased.
- **Related**: Supplier Invoices, Three-Way Matching

---

## T

### Tax Determination
Process of calculating applicable taxes based on transaction type, location, and product classification.
- **Related**: Tax Determination, GST Compliance

### Tenant
Organization or company using DAEE ERP. Each tenant has isolated data and configuration.
- **Related**: Tenant Management, [Multi-Tenant](#multi-tenant)

### Three-Way Matching
Verification process comparing PO, GRN, and Supplier Invoice before payment approval.
- **Related**: Three-Way Matching, [Invoice Verification](#invoice-verification)

### TIN/TAN
Tax Identification Numbers required for business registration in India.
- **Related**: Dealer Management, [Tax Compliance](#tax-compliance)

---

## U

### Unit of Measure (UOM)
Standard unit for measuring product quantities (e.g., pieces, boxes, kg, liters).
- **Related**: Units of Measure, [UOM Conversion](#uom-conversion)

### UTR (Unique Transaction Reference)
Unique identifier for bank transactions. Used in VAN payment reconciliation.
- **Related**: VAN Payments, Payment Reconciliation

---

## V

### VAN (Virtual Account Number)
Unique bank account number assigned to each dealer for automatic payment reconciliation.
- **Related**: Virtual Account Numbers, VAN Payments

### Volume Discount
Discount offered based on quantity ordered or cumulative purchase value.
- **Related**: Volume Discounts, Promotional Schemes

---

## W

### Warehouse
Physical location for storing inventory. Contains zones, aisles, racks, and bins.
- **Related**: Warehouse Management, Bin Management

### Work Order
Production order specifying what to manufacture, quantity, and schedule.
- **Related**: Work Orders, [Bill of Materials](#bill-of-materials-bom)

---

## Z

### Zone
Area within a warehouse for organizing storage (e.g., cold storage, bulk storage, picking zone).
- **Related**: Zones, Aisles & Racks, Warehouse Management
