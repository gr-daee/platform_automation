# Welcome to DAEE ERP

**DAEE is a trusted, India-first ERP** built for **dealer-led, distribution-heavy, and
finance-sensitive businesses**. It runs your whole operation on one audited system — sales (Order to
Cash), procurement (Procure to Pay), inventory and warehousing, plant production, finance and
accounting, GST compliance, and HR — so operational events and your books stay **one connected
truth**. Statutory documents (E-Invoice/IRN, E-Way Bill, GST returns) are generated from your real
transactions, not bolted on.

> **Our trust contract.** The accounting, tax, document-state, and compliance core is
> **deterministic** — *same input, same output, every time* — reviewable, reproducible, and fully
> audited. AI is used carefully, only where it earns its place (explanation, reconciliation,
> exception triage); it never becomes the source of truth and never silently changes your books,
> master data, or pricing.

<!-- INTERNAL:START -->
**Maintaining these docs?** See **[AUTHORING.md](./AUTHORING.md)** — the end-to-end guide to adding or
updating a page (write → screenshots → nav → preview → sync to web_app → verify). Companions:
[`_TEMPLATE.md`](./_TEMPLATE.md) (page skeleton), [`CAPTURE-HARNESS.md`](./CAPTURE-HARNESS.md)
(screenshots), [`MODULE-MAP.md`](./MODULE-MAP.md) (module index).
<!-- INTERNAL:END -->

## Why businesses run on DAEE

| | |
|---|---|
| **Connected business truth** | Sales, dealers, stock, production, and finance share one source of data — no silos, no re-keying, no reconciling disconnected tools. |
| **Inventory-to-cash closure** | Purchase, stock, fulfilment, cash, COGS, and margin close together — you see the whole loop, not fragments. |
| **Finance trust & compliance** | E-Invoice (IRN), E-Way Bills, and GST returns come from your real transactions; every entry posts to the ledger through your accounting rules, with a full audit trail. |
| **Control built in** | Real-time credit limits, stock availability, and approval workflows stop mistakes before they happen. |
| **Evidence-backed AI, carefully** | AI assists with explanation, reconciliation, and exception triage — bounded, auditable, and human-reviewed. The system of record stays deterministic. |
| **Secure & private** | Your data is isolated to your organization, protected by multi-factor sign-in and role-based permissions, with every action logged. |

> **🔒 Security & trust.** Your data is isolated per organization (enforced in the database), access is
> MFA-protected and role-based, everything is audited, and data is encrypted in transit and at rest. Even
> **bank collections (VAN)** are cryptographically signature-verified, rate-limited, and replay-safe. →
> **[Read how we keep you secure](./security.md)**

---

## Explore the guides

Every module has its own guide. They share one shape — **Overview → before you begin → step-by-step
workflows (with screenshots) → pages & areas → common use cases → reference → troubleshooting.** Start
with a quickstart below, or jump straight to a module.

### Start here
- **[Take your first order](./o2c/order-to-cash.md#quickstart-take-your-first-order)** — see DAEE work end to end in about five minutes.
- **[Onboard a dealer & fulfil the first order](./use-cases/onboard-dealer-first-order.md)** — the full cross-module journey.
- **[Common use cases](./use-cases/README.md)** — task-first walkthroughs that span modules.

### Operate your business
| Guide | What it covers |
|---|---|
| **[Order to Cash (O2C)](./o2c/order-to-cash.md)** | Orders, fulfilment, invoicing, collections |
| **[Procure to Pay (P2P)](./p2p/procure-to-pay.md)** | Procurement, [three-way matching & payments](./p2p/three-way-matching-and-payments.md) |
| **[Warehouse Management](./warehouse-management/README.md)** | Picking, [inter-warehouse transfers](./warehouse-management/iwt.md), [inventory](./warehouse-management/inventory.md) |
| **[Plant Production](./plant-production/README.md)** | Manufacturing, [QR & batch traceability](./plant-production/qr-and-batch-traceability.md) |
| **[Job Works](./job-works/README.md)** | Outsourced/job-work processing |
| **[Sales CRM](./sales-crm/README.md)** | Categories, lead pipeline, sales targets |
| **[Logistics & Transport](./logistics/README.md)** | Carriers, shipment tracking, E-Way Bill monitoring |

### Finance & people
| Guide | What it covers |
|---|---|
| **[Finance & Accounts](./finance/README.md)** | [Receipts, credits & discounts](./finance/receipts-credits-discounts.md), [accounts payable](./finance/accounts-payable.md), [payroll accounting](./finance/payroll.md), [bank collections (VAN)](./finance/van.md), [screen index](./finance/screens.md) |
| **[Human Resources](./hrms/README.md)** | Employees, leave, payroll handover |

### Master data
| Guide | What it covers |
|---|---|
| **[Dealer Applications](./dealer-applications/dealer-applications.md)** → **[Dealers](./dealers/README.md)** | Onboarding applicants and the dealer master |
| **[Suppliers](./suppliers/suppliers.md)** & **[Raw Materials](./raw-materials/README.md)** | Who you buy from and what you consume |
| **[Products](./products/README.md)** & **[Price Lists](./price-lists/README.md)** | What you sell and at what rate |
| **[Regions & Territories](./regions/README.md)** | Sales geography that routes dealers, leads, pricing, and targets |
| **[Address Book](./address-book.md)** | Bill-To/Ship-To (dealer), dispatch/seller (warehouse), Bill-From (company) — drives GST place-of-supply |

> **Note** The left-hand navigation mirrors your product menu exactly. Modules shown as **Soon** there
> are being authored progressively — this index lists the guides available today.

---

## How onboarding works

Getting live is a short, guided path. Some of it is set up **for you** when your organization is
provisioned; the rest is **your data and your first transactions**.

### 1. Your workspace is provisioned *(done for you)*
When your organization is set up, DAEE configures your **tenant** — your private, isolated workspace:

- **Company profile** — legal name, **GSTIN**, **PAN**, registered address, state, GST registration
  type, filing frequency, and turnover band.
- **Branding** — your **logo** and **authorized signature** that appear on invoices and documents.
- **Document numbering** — prefixes and formats for invoices, orders, and credit notes.
- **Your plan** — the modules enabled for your organization and your user allowance.
- **Accounting backbone** — chart of accounts, posting rules, fiscal periods, tax matrix, payment
  terms, and early-payment-discount slabs, so transactions post correctly from day one.

> **Note** This configuration is in place **before you first sign in** — you start on a system that
> already knows your company, your GST identity, and your accounting rules.

### 2. Sign in securely
Open your DAEE URL and sign in with your **email and password**, then confirm with a **one-time code
from your authenticator app** (multi-factor authentication). First-time users set up their
authenticator once; single sign-on with Google is also supported.

### 3. Your role shapes what you see
The left-hand navigation mirrors the modules enabled for your organization, and what you can view or
do is governed by **your role**. If something isn't visible, your administrator manages that access.

### 4. Load your master data *(what you provide)*
Before you transact, set up the records your operations reference:

| You provide | Used for |
|---|---|
| **[Dealers](./dealers/README.md)** (customers) | Credit limits, pricing, who you sell to |
| **[Products](./products/README.md)** & **[Price Lists](./price-lists/README.md)** | What you sell and at what rate |
| **Warehouses** (zones, racks, bins) | Where stock lives and moves |
| **[Suppliers](./suppliers/suppliers.md)** & **[Raw Materials](./raw-materials/README.md)** | Who you buy from and what |
| **[Regions & Territories](./regions/README.md)** | Sales structure and reporting |
| **[Address Book](./address-book.md)** | Bill-To/Ship-To, warehouse dispatch/seller, company Bill-From (GST place-of-supply) |
| **[Transport providers](./logistics/README.md)** | Required to generate E-Way Bills |
| **Opening balances** | Carrying forward ledgers and stock at go-live |

### 5. Start operating
Raise your first order, fulfil and invoice it compliantly, collect payment, and watch it reflect in
your ledgers and reports automatically.

---

## What you need to get started

- [ ] Your company's **GSTIN and PAN** (captured during provisioning)
- [ ] An **authenticator app** on your phone (for secure sign-in)
- [ ] Your **dealers, products, and price lists**
- [ ] At least one **warehouse** with stock (or opening balances)
- [ ] **Transport providers** if you ship goods that need an E-Way Bill
- [ ] **Suppliers** and **raw materials** if you procure or manufacture

---

## Where to go next

You're set up — now **[take your first order](./o2c/order-to-cash.md#quickstart-take-your-first-order)**
to see the end-to-end flow, follow the **[onboard-a-dealer journey](./use-cases/onboard-dealer-first-order.md)**,
or pick any module from **[Explore the guides](#explore-the-guides)** above.

<!-- INTERNAL:START -->
---

**For the DAEE team (internal):** The intro, trust contract, and value framing above are sourced from
the founder positioning decks `web_app/docs/presentations/DAEE-CONNECTED-ERP-AI-STRATEGIC-VALUES-2026-06-13`
and `DAEE-FOUNDER-VISION-MISSION-BOLT-ON-2026-06-13` (vision: *trusted India-first ERP for dealer-led,
distribution-heavy, finance-sensitive businesses*; the four values — connected truth, inventory-to-cash
closure, deterministic core + bounded AI, manufacturing/IoT later). Internal strategy in those decks
(MRR/concentration targets, capital, AI rollout phases, decision-rights) is **deliberately kept out of
the customer view** — and the decks warn against AI over-claiming, so AI is framed as bounded assistance,
not autonomy.

This documentation is generated from a single Markdown source and renders in two variants —
**Customer** and **Internal** — via the toggle in the top bar (internal-only blocks like this one are
stripped from the customer view). Screenshots are auto-captured from staging.daee.in by the Playwright
harness (`npm run docs:capture` — pass `--match "/route,/route"` to target specific pages) so they never
drift from the live app. Each customer hub pairs with a developer guide under **Developer guides**.

**Coverage today:** the full **Master Data** group is authored — Dealer Applications, Dealers, Suppliers,
Products, Price Lists, Raw Materials, Regions & Territories, and Logistics & Transport — alongside the
operational and finance modules (O2C, P2P, Warehouse, Plant Production, Job Works, Sales CRM, Finance,
HRMS). Modules still marked **Soon** in the sidebar (Executive Dashboard, Gamified Rebate) are next; the
**Explore the guides** index above is the source of truth for what's live. See the header **Internal
docs** links (Module Map, Capture Harness) for the capture workflow.
<!-- INTERNAL:END -->
