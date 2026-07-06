# Order to Cash (O2C)

> Turn a dealer's demand into a delivered, invoiced, and collected sale — compliantly.

> **Audience:** Customer + Internal · **Module:** `/o2c` · **Status:** 🟢 Pilot (reference for all modules)
> **Verified:** against `web_app/src/app/o2c` + staging DB on 2026-06-17.

## What you can do
- **Raise & approve demand** — create a Sales **Indent**, route it for approval.
- **Fulfil** — convert to a **Sales Order**, allocate stock, pick (or raise **Back Orders**).
- **Invoice compliantly** — generate the **Tax Invoice**, **E-Invoice (IRN)**, and **E-Way Bill**.
- **Collect** — record payments, apply **early-payment discounts (EPD)**.
- **Adjust** — process **Sales Returns** (credit/debit notes).
- **Analyse** — 12 O2C reports (sales, collections, discounts, …).

## Before you begin

### What you need
- An active **dealer** record with a credit limit set.
- **Products** on a **price list** assigned to the dealer.
- A **warehouse** with available stock.
- Your company's **GSTIN** configured in tenant settings (required for E-Invoice and E-Way Bill).
- **Transport providers** set up in the master (for E-Way Bills with a transporter).

### Roles and what each can do

| Role | Typical responsibilities in O2C |
|---|---|
| **Territory Manager (TM) / Sales** | Create and submit indents |
| **Regional Manager (RM)** | Review indents, escalate approvals |
| **Approver / Sales Head** | Approve or reject submitted indents; proceed past stock shortfalls with **Approve Anyway** |
| **Warehouse Ops** | Allocate stock, generate and execute picklists, confirm dispatch |
| **Finance** | Generate invoices, record payments, process returns, apply EPD |
| **Admin** | Configure warehouses, transport providers, price lists, posting profiles |

<!-- INTERNAL:START -->
Access is permission-gated (`indents:*`, `sales_orders:*`, `invoices:*`, `ewaybill_management:*`, `payments:*`, `sales_return_orders:*`) and tenant-isolated via RLS. GL postings use posting profiles (never hardcoded COA). The 90-day overdue rule is a **hard block** in the live path (`processApproval.ts`) with **no Sales-Head override merged**; the configurable-window + override is DAEE-769 (branch `pavan/DAEE-769`, not yet released — see [O2C Developer Guide](../../developer-guides/o2c.md) §12 Known Gaps). *(Full permissions matrix, edge functions, data model → [O2C Developer Guide](../../developer-guides/o2c.md).)*
<!-- INTERNAL:END -->

### The flow at a glance
```
Indent              Sales Order                         Invoice
─────────           ─────────────────────────           ──────────────────────────
Draft → Submitted   Allocate stock → Generate Picklist  Generate E-Invoice (IRN)
  → Approve           → Pick → Generate E-Invoice ─────▶   → Create E-Way Bill
  → Process Workflow  (short stock → Back Orders)          → Collect payment (EPD)
       └─ creates the Sales Order                          → Sales Return (if needed)
```
Each stage has its own **detailed guide** with buttons and step-by-step screenshots — see
[Detailed guides](#detailed-guides) below.

---

## Quickstart: take your first order
**You'll:** raise an indent, approve it, and turn it into a sales order · **Time:** ~5 min · **Role:** Sales + Approver

1. Go to **O2C → Sales Indents** and click **Create Indent**.
   ![Sales Indents list → Create](../assets/o2c/qs-01-indents-list.png)
   <!-- capture: { "project": "iacs-md", "route": "/o2c/indents", "highlight": "button:has-text('Create')" } -->
2. Pick the **dealer**, add **product lines** (quantity; price auto-fills from the price list), review totals, and **Submit**.
   ![Create Indent form](../assets/o2c/qs-02-create-indent.png)
   <!-- capture: { "project": "iacs-md", "route": "/o2c/indents", "action": "open-create-dialog" } -->
   > **Tip** Price, discount, and tax default from the dealer's price list — you rarely type them.
3. Open the submitted indent and click **Approve** → confirm in the dialog.
   ![Approve indent dialog](../assets/o2c/indent-04-approve-dialog.png)
   <!-- capture: { "project": "iacs-md", "route": "/o2c/indents/4c5b0044-2c00-4762-a366-dddedf57b0eb", "action": "click-approve" } -->
   > **Caution** If the dealer has any invoice **unpaid for 90+ days**, approval is **blocked** — collect the overdue amount first (see [Sales Indents → Approve](./sales-indents.md#2-approve-an-indent-incl-the-overdue-block)).
4. On the approved indent, click **Process Workflow** → a **Sales Order** is created (short-stock lines become **Back Orders**).
   ![Process Workflow dialog](../assets/o2c/indent-06-process-dialog.png)
   <!-- capture: { "project": "iacs-md", "route": "/o2c/indents/17e43d65-5d4d-4f3d-80fe-e14c1f21eee3", "action": "click-process-workflow" } -->

**Next steps:** [Fulfil the Sales Order](./sales-orders.md) · [Invoice & E-Way Bill](./invoices.md) · [Collect payment](../finance/receipts-credits-discounts.md#cash-receipts-record-and-apply).

---

## Detailed guides

The end-to-end flow is documented **stage by stage**, mirroring the O2C sidebar:

| Stage | Guide | Covers |
|---|---|---|
| **1. Indent** | **[Sales Indents](./sales-indents.md)** | Raise → submit → **approve** (overdue block) → **Process Workflow** to a Sales Order |
| **2. Fulfil** | **[Sales Orders](./sales-orders.md)** | Allocate → **generate picklist** → scan-pick → **Generate E-Invoice** |
| **3. Invoice** | **[Invoices & E-Way Bills](./invoices.md)** | Tax Invoice + **IRN** → **E-Way Bill** (Part-A/B) → PDF → edit / cancel |
| **Exceptions** | **[Back Orders](./back-orders.md)** · **[Sales Returns](./sales-returns.md)** | Short-stock demand · returns + credit notes |
| **Analyse** | **[O2C Reports](./reports.md)** | Collection & product-sales reporting |

Collection (cash receipts + EPD) is a **Finance** activity → **[Receipts, Credits & Discounts](../finance/receipts-credits-discounts.md)**.

---

## Common use cases
- **Sell, invoice and move goods compliantly** — the end-to-end happy path (Quickstart → allocate/pick → Invoice/E-Way Bill → Collect).
- **First order for a brand-new dealer** → see [Onboard a dealer and fulfil the first order](../use-cases/onboard-dealer-first-order.md) (spans Dealer Applications → Dealers → O2C → Finance).
- **Damaged-goods return** → [Handle a sales return](./sales-returns.md).
- **Collect early with a discount** → [Collect with EPD](../finance/receipts-credits-discounts.md#early-payment-discount-epd).

## Reference
- **Indent fields:** Dealer*, Territory, Product/Package*, Quantity*, Unit Price (price-list), Discount%, Tax%.
- **Statuses:** Indent — Draft → Submitted → Approved → Converted (or Rejected). Sales Order — Allocated → Picked → Ready to ship → Shipped → Delivered. Invoice — Draft → Generated → Sent → Paid / Partially paid (or Cancelled).
<!-- INTERNAL:START -->Indent codes: `draft, submitted, approved, converted, back_order_created, rejected`. SO codes: `created, allocated, partial_allocated, picked, packed, ready_to_ship, shipped, delivered, completed, cancelled`. Invoice codes: `draft, generated, sent, paid, partial_paid, overdue, cancelled`. Schema → Developer Guide.<!-- INTERNAL:END -->
- **Reports (O2C → Reports):** Sales, Product Sales, Discount, Collection, Credit Utilization, Payment Allocation, Invoice Cancellation, Order Value, Sales Return, Delivery Challan, Price History, User-Wise.
<!-- INTERNAL:START -->
Every action is audit-logged via `log_o2c_operation` RPC; E-Invoice and E-Way Bill run through GSTZen; GL postings use posting profiles (never hardcoded COA); sales data flows to GSTR-1 (incl. credit/debit notes). Worker jobs (BullMQ) carry `tenantId` in every payload. *(Tables, edge functions, permissions, compliance controls, and known gaps → [O2C Developer Guide](../../developer-guides/o2c.md).)*
<!-- INTERNAL:END -->

## Troubleshooting
| Message | Cause | Fix |
|---|---|---|
| "Cannot approve indent: Dealer has N invoice(s) unpaid for 90+ days…" | 90-day overdue **hard block** on approval (no in-app override in the current release) | **Collect** the overdue invoice(s); the block clears once none are 90+ days unpaid. Confirm receipts with Finance. |
| "Please select a warehouse before approving" | No fulfilling warehouse chosen | Pick the warehouse on the indent, then Approve |
| "Generate E-Invoice (IRN) first" | Tried to make the E-Way Bill before the IRN | Generate the E-Invoice first, then create the E-Way Bill |
| "Transporter ID must be a valid 15-char GSTIN or TRANSIN" | Bad/missing transporter | Pick a master transporter with a GST id, or use *Own vehicle* |

## Support and escalation
- **E-Invoice IRN failed** — use **Retry E-Invoice** on the Sales Order or Invoice page. If the error persists, check that the seller GSTIN, buyer GSTIN, HSN codes, and UOM values on the invoice are correct; then retry.
- **E-Way Bill creation blocked ("Generate E-Invoice first")** — the IRN must exist before an EWB can be issued. Generate the E-Invoice first, then create the E-Way Bill.
- **Dealer blocked due to overdue invoices** — the dealer must settle overdue invoices before new orders can be approved. Contact Finance to confirm payments received. If the business situation requires an exception, escalate to your Sales Head.
- **Back order not converting to a Sales Order** — stock must be available in the warehouse. Once stock arrives and is receipted, re-run the Process Workflow from the indent.
- **Invoice cancelled but GL not reversed** — contact your Finance team or DAEE administrator. Invoice cancellation triggers an automatic GL reversal; if the journal entry is missing, it may need to be recovered manually.
- **EPD credit note not issued after early payment** — confirm the payment was applied within the early-payment window defined on the price list or payment terms. If the window was missed, no automatic credit note is issued.

## Related workflows
- [Onboard a dealer and fulfil the first order](../use-cases/onboard-dealer-first-order.md) — spans Dealer Applications → Dealers → O2C → Finance.
- [Handle a sales return](./sales-returns.md) — Credit Note issuance and stock/GL reversal.
- [Collect with EPD](../finance/receipts-credits-discounts.md#early-payment-discount-epd) — early-payment discount credit note flow.

## Next steps & related
[Finance → Accounts Receivable](../finance/README.md) · [Warehouse → Picklists](../warehouse-management/README.md) · [Dealer Applications](../dealer-applications/dealer-applications.md)
