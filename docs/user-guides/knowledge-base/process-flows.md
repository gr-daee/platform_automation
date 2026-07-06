# ERP Process Flows

> **Audience:** Customer + Internal | **Section:** Knowledge Base | **Status:** Authored
>
> Part of the **[Knowledge Base](../knowledge-base.md)**.


Visual documentation of key business processes in DAEE ERP.

---

## Order to Cash (O2C) Flow

### Complete O2C Cycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ORDER TO CASH (O2C) WORKFLOW                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Sales   │───▶│  Sales   │───▶│ Picklist │───▶│  Sales   │───▶│ E-Invoice│
│  Indent  │    │  Order   │    │          │    │ Invoice  │    │  (IRN)   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │               │
     │               │               │               │               │
     ▼               ▼               ▼               ▼               ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Approval │    │   FEFO   │    │ Warehouse│    │   GST    │    │ E-Way    │
│ Workflow │    │Allocation│    │ Picking  │    │ Posting  │    │   Bill   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                     │
                     ▼
              ┌──────────┐    ┌──────────┐    ┌──────────┐
              │  Back    │───▶│ Payment  │───▶│ Dealer   │
              │  Order   │    │ Receipt  │    │ Ledger   │
              │(Shortage)│    │          │    │          │
              └──────────┘    └──────────┘    └──────────┘
```

### Key Steps

| Step | Module | Description | Automated |
|------|--------|-------------|-----------|
| 1 | Sales Indent | Customer order request | Manual |
| 2 | Approval | Multi-level approval workflow | Configurable |
| 3 | Sales Order | Confirmed order with allocation | Manual trigger |
| 4 | FEFO Allocation | First Expiry First Out allocation | Automatic |
| 5 | Picklist | Warehouse picking instructions | Automatic |
| 6 | Invoice | Sales invoice generation | Manual/Auto |
| 7 | E-Invoice | IRN generation via GST portal | Automatic |
| 8 | E-Way Bill | Transport document (if > 50K) | Automatic |
| 9 | Payment | Customer payment collection | Manual |
| 10 | Allocation | FIFO payment allocation | Automatic |

---

## FEFO Inventory Allocation

### Allocation Algorithm

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FEFO ALLOCATION ALGORITHM                              │
└─────────────────────────────────────────────────────────────────────────────┘

                         Sales Order Request
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Query Available     │
                    │ Inventory           │
                    │ ORDER BY expiry ASC │
                    └─────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ For Each Product    │
                    │ Line Item           │
                    └─────────────────────┘
                               │
                               ▼
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
    ┌─────────────────┐               ┌─────────────────┐
    │ Batch 1         │               │ Batch 2         │
    │ Exp: 2025-03-15 │               │ Exp: 2025-06-20 │
    │ Qty: 50 units   │               │ Qty: 100 units  │
    └─────────────────┘               └─────────────────┘
              │                                 │
              └────────────────┬────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Allocate from       │
                    │ Earliest Expiry     │
                    │ First               │
                    └─────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌───────────┐   ┌───────────┐   ┌───────────┐
       │ Allocated │   │ Allocated │   │   Back    │
       │ Line 1    │   │ Line 2    │   │   Order   │
       │ (Batch 1) │   │ (Batch 2) │   │(Shortage) │
       └───────────┘   └───────────┘   └───────────┘
```

### Example Allocation

**Order Request**: 80 units of Product ABC

| Batch | Expiry Date | Available | Allocated | Remaining |
|-------|-------------|-----------|-----------|-----------|
| B001 | 2025-03-15 | 50 | 50 | 0 |
| B002 | 2025-06-20 | 100 | 30 | 70 |

**Result**:
- Sales Order Line 1: 50 units (Batch B001, Exp: 2025-03-15)
- Sales Order Line 2: 30 units (Batch B002, Exp: 2025-06-20)

---

## Procure to Pay (P2P) Flow

### Complete P2P Cycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PROCURE TO PAY (P2P) WORKFLOW                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│Procurement│───▶│ Purchase │───▶│  Goods   │───▶│ Supplier │───▶│ Three-Way│
│  Request │    │  Order   │    │ Receipt  │    │ Invoice  │    │ Matching │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │               │
     │               │               │               │               │
     ▼               ▼               ▼               ▼               ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Approval │    │ Approval │    │ Quality  │    │ Invoice  │    │  Match   │
│ Workflow │    │ Workflow │    │  Check   │    │ Posting  │    │Validation│
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                     │                               │
                                     ▼                               ▼
                              ┌──────────┐                    ┌──────────┐
                              │ Putaway  │                    │ Payment  │
                              │          │                    │ Schedule │
                              └──────────┘                    └──────────┘
                                                                   │
                                                                   ▼
                                                             ┌──────────┐
                                                             │ Supplier │
                                                             │ Payment  │
                                                             └──────────┘
```

### Three-Way Matching

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         THREE-WAY MATCHING                                  │
└─────────────────────────────────────────────────────────────────────────────┘

        Purchase Order              GRN                    Supplier Invoice
        ┌───────────┐          ┌───────────┐             ┌───────────┐
        │ Item: ABC │          │ Item: ABC │             │ Item: ABC │
        │ Qty: 100  │          │ Qty: 98   │             │ Qty: 100  │
        │ Price: 50 │          │           │             │ Price: 50 │
        └───────────┘          └───────────┘             └───────────┘
              │                      │                         │
              └──────────────────────┼─────────────────────────┘
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │   MATCHING RULES    │
                          │                     │
                          │ Qty Tolerance: 2%   │
                          │ Price Tolerance: 0% │
                          └─────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                    ▼                                 ▼
          ┌─────────────────┐               ┌─────────────────┐
          │   ✓ MATCHED     │               │   ✗ EXCEPTION   │
          │                 │               │                 │
          │ Proceed to      │               │ Route to        │
          │ Payment         │               │ Approval        │
          └─────────────────┘               └─────────────────┘
```

---

## Payment Allocation (FIFO)

### Auto-Allocation Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FIFO PAYMENT ALLOCATION                                  │
└─────────────────────────────────────────────────────────────────────────────┘

                         Payment Received: ₹25,000
                                     │
                                     ▼
                    ┌─────────────────────────────────┐
                    │ Query Outstanding Invoices      │
                    │ ORDER BY invoice_date ASC       │
                    └─────────────────────────────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
        ▼                            ▼                            ▼
┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│ Invoice #001  │          │ Invoice #002  │          │ Invoice #003  │
│ Date: Jan 15  │          │ Date: Jan 20  │          │ Date: Jan 25  │
│ Due: ₹10,000  │          │ Due: ₹15,000  │          │ Due: ₹20,000  │
└───────────────┘          └───────────────┘          └───────────────┘
        │                            │                            │
        ▼                            ▼                            ▼
┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│ Allocate:     │          │ Allocate:     │          │ Allocate:     │
│ ₹10,000       │          │ ₹15,000       │          │ ₹0            │
│ Status: PAID  │          │ Status: PAID  │          │ Status: UNPAID│
└───────────────┘          └───────────────┘          └───────────────┘

Result: Payment ₹25,000 allocated to Invoice #001 and #002
```

---

## VAN Payment Reconciliation

### Automatic Reconciliation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    VAN PAYMENT RECONCILIATION                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Dealer    │────▶│  Bank       │────▶│   Webhook   │────▶│    DAEE     │
│   Payment   │     │  Transfer   │     │  (Axis)     │     │   System    │
│   via VAN   │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                    ┌─────────────────────┐
                                    │ Validation Check    │
                                    │ - VAN exists        │
                                    │ - Dealer active     │
                                    │ - Amount > 0        │
                                    └─────────────────────┘
                                               │
                          ┌────────────────────┼────────────────────┐
                          │                    │                    │
                          ▼                    ▼                    ▼
                   ┌───────────┐        ┌───────────┐        ┌───────────┐
                   │  SUCCESS  │        │  PENDING  │        │  FAILED   │
                   │           │        │           │        │           │
                   │ Post to   │        │ Manual    │        │ Log Error │
                   │ GL & AR   │        │ Review    │        │ Notify    │
                   └───────────┘        └───────────┘        └───────────┘
                          │
                          ▼
                   ┌───────────┐
                   │ FIFO      │
                   │Allocation │
                   │to Invoices│
                   └───────────┘
```

---

## E-Invoice Generation Flow

### IRN Generation Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      E-INVOICE (IRN) GENERATION                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Sales     │────▶│   Validate   │────▶│    Send to   │────▶│   Receive    │
│   Invoice    │     │   Invoice    │     │   Provider   │     │     IRN      │
│   Created    │     │   Data       │     │  (GSTzen)    │     │              │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                            │                    │                     │
                            │                    │                     │
                            ▼                    ▼                     ▼
                     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
                     │ Validations: │     │ If Primary   │     │ Store:       │
                     │ - GSTIN      │     │ Fails, Try:  │     │ - IRN        │
                     │ - HSN        │     │   1. MEON    │     │ - Signed PDF │
                     │ - Address    │     │   2. ZOOP    │     │ - QR Code    │
                     │ - Amount     │     │              │     │ - Ack No     │
                     └──────────────┘     └──────────────┘     └──────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
       ┌──────────────┐           ┌──────────────┐
       │   ✓ VALID    │           │   ✗ ERRORS   │
       │              │           │              │
       │   Proceed    │           │ Show Error   │
       │              │           │ Allow Fix    │
       └──────────────┘           └──────────────┘
```

### Common Validation Errors

| Error Code | Description | Resolution |
|------------|-------------|------------|
| GSTIN_INVALID | GSTIN format incorrect | Verify 15-character format |
| HSN_INVALID | HSN code not recognized | Update to valid HSN code |
| PIN_MISMATCH | PIN code doesn't match state | Correct address PIN |
| AMOUNT_ZERO | Invoice amount is zero | Check invoice calculations |
| DUPLICATE_IRN | IRN already exists | Invoice already processed |

---

## Inter-Warehouse Transfer

### IWT Process Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    INTER-WAREHOUSE TRANSFER (IWT)                           │
└─────────────────────────────────────────────────────────────────────────────┘

     Source Warehouse                In Transit               Dest Warehouse
          │                              │                          │
          ▼                              │                          │
    ┌───────────┐                        │                          │
    │ Create    │                        │                          │
    │ Transfer  │                        │                          │
    │ Request   │                        │                          │
    └───────────┘                        │                          │
          │                              │                          │
          ▼                              │                          │
    ┌───────────┐                        │                          │
    │ Approval  │                        │                          │
    │ (if reqd) │                        │                          │
    └───────────┘                        │                          │
          │                              │                          │
          ▼                              │                          │
    ┌───────────┐                        │                          │
    │ Pick &    │                        │                          │
    │ Pack      │                        │                          │
    └───────────┘                        │                          │
          │                              │                          │
          ▼                              ▼                          │
    ┌───────────┐              ┌───────────────┐                    │
    │ Ship      │─────────────▶│   In Transit  │                    │
    │ (Deduct   │              │   Inventory   │                    │
    │  Stock)   │              │               │                    │
    └───────────┘              └───────────────┘                    │
                                       │                            │
                                       │                            ▼
                                       │                     ┌───────────┐
                                       └────────────────────▶│ Receive   │
                                                             │ (Add      │
                                                             │  Stock)   │
                                                             └───────────┘
                                                                   │
                                                                   ▼
                                                             ┌───────────┐
                                                             │ Putaway   │
                                                             │           │
                                                             └───────────┘
```

---

## Quality Control Workflow

### QC at Goods Receipt

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    QUALITY CONTROL WORKFLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                         Goods Receipt (GRN)
                                │
                                ▼
                    ┌───────────────────────┐
                    │ QC Required?          │
                    │ (Based on Product/    │
                    │  Supplier Config)     │
                    └───────────────────────┘
                                │
              ┌─────────────────┴─────────────────┐
              │                                   │
              ▼                                   ▼
       ┌─────────────┐                    ┌─────────────┐
       │ QC Required │                    │ Skip QC     │
       │             │                    │             │
       │ Status:     │                    │ Status:     │
       │ Quarantine  │                    │ Available   │
       └─────────────┘                    └─────────────┘
              │
              ▼
    ┌─────────────────────┐
    │ QC Inspection       │
    │ - Visual Check      │
    │ - Parameter Tests   │
    │ - Documentation     │
    └─────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
┌───────┐          ┌───────┐
│ PASS  │          │ FAIL  │
│       │          │       │
│Release│          │Reject/│
│Stock  │          │Return │
└───────┘          └───────┘
```

---

## Approval Workflow Configuration

### Multi-Level Approval

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    APPROVAL WORKFLOW CONFIGURATION                          │
└─────────────────────────────────────────────────────────────────────────────┘

         Document Submitted
                │
                ▼
    ┌───────────────────────┐
    │ Determine Approval    │
    │ Level Based on:       │
    │ - Amount              │
    │ - Document Type       │
    │ - Requester Role      │
    └───────────────────────┘
                │
    ┌───────────┼───────────────────────────────┐
    │           │                               │
    ▼           ▼                               ▼
┌───────┐  ┌───────────┐               ┌───────────────┐
│ Auto  │  │ Single    │               │ Multi-Level   │
│Approve│  │ Approval  │               │ Approval      │
│       │  │           │               │               │
│< 10K  │  │ 10K-50K   │               │ > 50K         │
└───────┘  └───────────┘               └───────────────┘
                │                               │
                ▼                               │
         ┌───────────┐                ┌─────────┴─────────┐
         │ Approver 1│                │                   │
         │ (Manager) │                ▼                   ▼
         └───────────┘         ┌───────────┐      ┌───────────┐
                │              │ Approver 1│      │ Approver 2│
                │              │ (Manager) │────▶ │ (Director)│
                │              └───────────┘      └───────────┘
                │                                       │
                └───────────────────────────────────────┘
                                │
                                ▼
                         ┌───────────┐
                         │ APPROVED  │
                         │           │
                         │ Process   │
                         │ Document  │
                         └───────────┘
```

### Approval Thresholds Example

| Document Type | Level 1 | Level 2 | Level 3 |
|---------------|---------|---------|---------|
| Purchase Order | Manager (< 50K) | Director (50K-200K) | CEO (> 200K) |
| Expense Claim | Manager (< 10K) | Finance Head (> 10K) | - |
| Credit Note | Accounts (< 25K) | Finance Head (> 25K) | - |
| Stock Adjustment | Warehouse Mgr (< 100 units) | Inventory Head (> 100) | - |
