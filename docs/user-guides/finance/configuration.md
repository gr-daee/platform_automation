# Finance Setup & Configuration (your settings)

> DAEE runs the **same software for every business**, but it behaves according to **your
> organization's settings**. This page explains those settings in plain language — what they are, what
> each controls, examples, and exactly **what must be in place before you go live**.

> **Audience:** Customer + Internal · **Module:** `/finance` (configuration) · **Status:** 🟢 Authored
> **Verified:** against `tenant_settings` (PROD, read-only) + `web_app/src/app/finance` on 2026-06-18.

For the full module, see the **[Finance & Accounts guide](./README.md)**.

## What "your settings" are
Your organization (your **tenant**) has its own private set of configuration values — think of them as
the **dials** that make DAEE post, number, tax, and discount things **your way**. None of the finance
numbers in DAEE are hard-coded; they come from **your** settings. You start from sensible **defaults**
and customize.

- Settings are grouped into **areas** (finance, banking, document numbering, security, and module areas like sales).
- Each setting can be **active or inactive** over time — your **live, active** values drive every calculation. (This is why two organizations can legitimately see different results for the same transaction.)
- Most settings are configured **once, at onboarding** (by DAEE with your finance lead); a few have **self-service screens** you manage day-to-day.

> **Example** A real agri-inputs organization runs **48 finance settings** (early/advance-payment
> discounts, default accounts, numbering) out of ~79 total — most set once at onboarding, then left to
> run.

## The areas you configure

| Area | What it controls | Who sets it | Example |
|---|---|---|---|
| **Default accounts** | Which **ledger account** each transaction posts to — receivables, bank, revenue, GST payable, sales discount, unapplied cash, credit memo, inventory | DAEE at onboarding | Revenue → your *Sales* account; GST → *CGST/SGST/IGST Payable* |
| **Document numbering** | The **prefix** and **start date** for your invoice/order numbers | DAEE at onboarding | Prefix `IACS`, effective **1 Apr 2026** (new fiscal year) |
| **Credit-note numbering** | The format for credit notes (CCN), and whether they auto-apply | DAEE at onboarding | `CCN/{financial-year}/{5-digit sequence}` |
| **Fiscal periods** | Which **dates** transactions may post to (open vs closed periods) | Finance | Apr 2026 open; prior years closed |
| **Early-Payment Discount (EPD)** | Pay-early reward — slabs, base, caps, governance | **You (self-service screens)** | See [Receipts, Credits & Discounts](./receipts-credits-discounts.md#how-to-customize-epd) |
| **Advance-Payment Discount (APD)** | Pay-in-advance reward — rate, GST/TDS, expiry, recapture | DAEE/admin (no self-serve screen) | See [APD](./receipts-credits-discounts.md#where-apd-is-configured) |
| **Banks** | Your **bank accounts** — the ledger each one posts to; the receiving account on receipts/deposits | **You (self-service screen)** | See [Set up a bank account](#set-up-a-bank-account) |
| **Banking (VAN)** | Virtual-account auto-allocation and auto-posting | Finance | See [Bank Collections (VAN)](./van.md) |
| **Chart of Accounts** | The master list of accounts everything posts to | Finance | See [Chart of Accounts](./chart-of-accounts.md) |

<!-- INTERNAL:START -->
Backing store: `tenant_settings` (per-tenant, `setting_key`/`setting_value`/`setting_category`/`is_active`, `unique_tenant_setting (tenant_id, setting_key)`). Idhyah (`d2353f40-…`) active-setting landscape (PROD, read-only 2026-06-18): `finance`=48, `(none)`=24, `finance_bulk_operations`=2, `system`/`security`/`plant_production`/`sales_crm`/`sales_planning`=1 each — **79 total**. "Default accounts" live in `finance_defaults` (JSON) plus discrete keys `ar_account_id`, `bank_account_id`, `revenue_account_id`, `cgst/sgst/igst_payable_account_id`. `finance_defaults` also carries `sales_discount_account_id`, `unapplied_cash_account_id`, `credit_memo_account_id`, `inventory_in_transit_account_id`, `inventory_finished_goods_account_id`. Numbering: `new_numbering_prefix=IACS`, `new_numbering_effective_date=2026-04-01`, `ccn_numbering_format=CCN/{FY}/{SEQ:5}`, `ccn_auto_apply=false`. EPD = self-serve screens (`/finance/epd-settings`, slab config, dealer payment-discounts, calculator); APD/numbering/defaults = no self-serve UI (onboarding/admin). Postings resolve accounts via posting profiles (`resolveGL`/`resolveMultipleGL`) seeded from these defaults — never hardcode codes.
<!-- INTERNAL:END -->

---

## Set up a bank account
**Role:** Finance · **Result:** a bank account that receipts, deposits, and payments can post against

Your **bank accounts** are a self-service master under **Finance → Settings → Banks**. Each one links to a
**bank ledger account** in the Chart of Accounts, so when money lands (a cash receipt, a security deposit,
a vendor payment) the cash side posts to the right ledger.

1. Go to **Finance → Settings → Banks** and click **Add Bank Account**.
   ![Bank Accounts list](../assets/finance/banks-01-list.png)
   <!-- capture: { "project": "iacs-md", "route": "/finance/settings/banks" } -->
2. Enter a **Nickname**, the **bank**, **account number**, and **IFSC**, then pick the **GL Account**
   (a bank-type account from the [Chart of Accounts](./chart-of-accounts.md)) this bank posts to. Set a
   **Default** bank if you want it pre-selected.
3. Mark it **Active**. It now appears in the **Bank Account picker** on Cash Receipts, Security Deposit
   *Record Deposit*, and vendor payments.

> **Caution** The **ledger account** you link is where the cash side of every receipt/deposit against this
> bank lands — pick the correct bank GL account, or your bank balances won't reconcile.

---

## Mandatory before you go live
These must be in place **before you raise your first transaction** — without them, postings or document
creation will fail or land in the wrong place.

- [ ] **[Chart of Accounts](./chart-of-accounts.md) loaded** — with **opening balances** carried forward at go-live.
- [ ] **Default accounts mapped** — at minimum: **receivables (AR control)**, **bank**, **revenue**, **GST payable (CGST, SGST, IGST)**, **sales discount**, **unapplied cash**, and **credit memo**. Every invoice, receipt, and credit note posts through these; if they're unset, the entry can't post.
- [ ] **Document numbering** — your **prefix** and **effective-from date** (ideally aligned to a fiscal-year start).
- [ ] **At least one fiscal period open** covering your go-live date.
- [ ] **Bank account** selected for receipts (and VAN, if you collect via virtual accounts).
- [ ] **Tax identity on the company profile** — **GSTIN** and **PAN** (set during organization provisioning — see the [platform overview](../README.md#how-onboarding-works)).
- [ ] **Discount policy decided** *(only if you offer discounts)* — EPD slabs configured, and/or APD policy handed to your administrator.

> **Caution** The **default accounts** and **Chart of Accounts** are the two that most often block go-live.
> Confirm both with your accountant first — a wrong revenue or GST-payable mapping misstates your books
> and your GST returns from day one.

### Example go-live configuration (a live agri-inputs organization)
- Document prefix **`IACS`**, effective **1 Apr 2026**; credit notes numbered **`CCN/{FY}/{sequence}`**.
- Default accounts mapped for AR, bank, revenue, CGST/SGST/IGST payable, sales discount, unapplied cash, credit memo, and inventory.
- **EPD** on (slab-based, GST-inclusive base, 15% cap, dual-approver governance); **APD** on (10% on direct advances, non-GST, 30-day expiry, clawback enabled).

---

## How your settings are managed
- **At onboarding** — DAEE configures your tenant (default accounts, numbering, tax identity, accounting backbone) **before you first sign in**, working from your finance lead's inputs.
- **Self-service (ongoing)** — **EPD** (slabs, settings, dealer rates, calculator), **VAN** configuration, and **bank** master are screens your finance team manages directly.
- **Admin/finance-controlled** — **APD**, **default accounts**, and **numbering** affect statutory and accounting treatment, so they're changed by your administrator (or via a support request), not casual toggles.

## Reference
- **Active settings drive behaviour.** A deactivated setting has no effect; the live active value wins.
- **Same software, your rules.** Two organizations (or two dealers) can legitimately see different numbers for the same transaction because their settings differ.
- **Accounts are resolved, not hard-coded.** Each transaction type maps to an account through **posting profiles**, seeded from your default accounts — so the same operation posts consistently every time.

## Support and escalation
- **Default accounts / numbering / APD / fiscal periods** → your **Finance Admin** (or raise a setup request to DAEE).
- **EPD slabs & settings** → self-service (Finance → Setup).
- **Chart of Accounts & opening balances** → Finance Admin / Controller.

## Related workflows
[Finance & Accounts](./README.md) · [Chart of Accounts](./chart-of-accounts.md) · [Receipts, Credits & Discounts](./receipts-credits-discounts.md) · [Bank Collections (VAN)](./van.md) · [Finance — Screen Index](./screens.md)
