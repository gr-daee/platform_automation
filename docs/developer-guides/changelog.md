---
title: Documentation Changelog
doc_id: DEV-DOCS-CHANGELOG
owner: Platform Engineering
status: Active
classification: Internal
last_updated: 2026-07-02
---

# Documentation Changelog

> The single, chronological record of changes to the DAEE documentation. **Every feature or behavior
> change must add an entry here** (see [Documentation maintenance](./README.md#documentation-maintenance-mandatory)).
> Newest first.

## How to add an entry
Add a row to the current date's table (create a new dated section if none exists):

`| Scope | Modules | Summary | Author |`

- **Scope** — `Customer`, `Internal`, or `Both`.
- **Modules** — the guide(s) touched (e.g. *Finance*, *Sales CRM*, *Warehouse*).
- **Summary** — what changed, in one line. Reference the per-guide Change Log for detail.
- Also bump the affected guide's own **Change Log** + front-matter `version`/`last_updated`.

---

## 2026-07-02

| Scope | Modules | Summary | Author |
|---|---|---|---|
| Both | O2C | New **O2C → Reports** user guide (`o2c/reports.md`) — Collection Report (allocation split on By Dealer/Region/Territory + advance-lifecycle Dealer Advance Status columns) and Hierarchical Product Sales (Group By state/region/territory/dealer + on-screen tree parity). Registered in nav (`build-site.mjs`). Screenshots pending capture. | Platform Eng |
| Both | Finance | Updated **VAN** page: list now shows dealer **Region / Territory / City** + **Cash Receipt link**; **XLSX** export replaces CSV; **manual invoice allocation removed** from the list surface (use Cash Receipts); Dealer picker cap lifted. Updated **Chart of Accounts**: searchable parent-account picker + re-parent across asset sub-groups. Updated **Receipts, Credits & Discounts** Security Deposits: searchable dealer picker + **Bank Account** picker on Record Deposit. | Platform Eng |
| Internal | Platform | **`fetchAllInBatches` `dedupeKey`** option documented in the new O2C Reports guide's INTERNAL block — cross-batch dedup with warn-log telemetry as defence against offset-based paging + concurrent-INSERT race. | Platform Eng |
| Internal | O2C | New implementation record `implementations/2026-07/IMPL-056_daee1184-1185-reports-uat-hardening.md` + UAT test-cases `test-cases/DAEE-1184-1185-REPORTS-UAT-2026-07.md` covering the branch-only DAEE-1184 / DAEE-1185 work (merge-pending to main). | Platform Eng |

## 2026-06-26

| Scope | Modules | Summary | Author |
|---|---|---|---|
| Both | Finance | New deep-reference guides — **GST Compliance** (GSTR-1/2B/3B, Rule 36(4)), **Posting Profiles** (Matrix rule-priority + posting groups), **Fixed Assets** (CWIP→capitalize→depreciate, Schedule II / Ind AS 16), **Financial Reports** (Schedule III statements + Stripe-style export). Enriched **Chart of Accounts** (control/header/leaf model). Verified against staging with screenshots. | Platform Eng |
| Both | O2C | E-Way Bill step re-captured as the **Create E-Way Bill dialog**; standalone menu now redirects to Logistics & Transport. | Platform Eng |
| Both | P2P / Plant / Job Works | P2P **Reports** (inward GSTR-2/3B ITC). Plant **Production Planning** + Scrap/Expiry/Reports steps and BOM/work-order gotchas. Job Works **Sales Returns / Dashboard / JW Outstanding**; Compliance Alerts marked *coming soon* (Pending UAT). | Platform Eng |
| Internal | P2P / Plant / Job Works / Finance | Developer guides — **Segregation-of-Duties** controls, **posting-profile rule-priority** + COA account-kinds, Rule 36(4) + fixed-asset depreciation controls, JW Outstanding integration. | Platform Eng |
| Internal | Platform | **Documentation Backlog** expanded — Finance analytical reports, JW Compliance Alerts (DAEE-680 EPIC-1 P1.3), Fixed-Assets export (deferred). | Platform Eng |

## 2026-06-19

| Scope | Modules | Summary | Author |
|---|---|---|---|
| Internal | Platform | New **[Documentation Backlog](./backlog.md)** — tracks documentation work that is known but deliberately deferred (feature not yet production-grade / mid-change). First entry: the **O2C Reports suite (14 reports)**, to be documented individually as each report is fixed and verified. | Platform Eng |
| Internal | O2C | Verified the DRI End-User Guide draft against `web_app` code: confirmed the **90-day unpaid-invoice block on approve** (`processApproval.ts`), **stock warning + `skipStockCheck` override**, and that **Process Workflow creates the Sales Order** (not auto on approve). Confirmed **`/o2c/eway-bills` is deprecated** (redirects to Logistics & Transport) — no standalone O2C E-Way Bills screen to document. | Platform Eng |

## 2026-06-18

| Scope | Modules | Summary | Author |
|---|---|---|---|
| Both | Platform | Migrated the documentation into the web_app `/docs` route — native Next.js App Router, `@/registry/new-york-v4/ui` styling, generated sidebar, breadcrumbed content, **Customer/Internal audience toggle** (server-side stripping), client search (⌘K), client-rendered **Mermaid**, and an image/diagram **lightbox** (click-to-zoom). | Platform Eng |
| Both | Finance | New **[Chart of Accounts](../user-guides/finance/chart-of-accounts.md)** guide — 5 account classes, normal balance, hierarchy, Schedule III (Companies Act 2013) presentation, import/export, posting profiles. | Platform Eng |
| Both | Finance | New **[Finance Setup & Configuration](../user-guides/finance/configuration.md)** guide — plain-language tenant-settings explainer, areas table with examples, and a **mandatory-before-go-live** checklist. Verified against PROD `tenant_settings`. | Platform Eng |
| Both | Finance | EPD & APD — added general-accounting primers; verified every EPD (22) and APD (26) setting against PROD `tenant_settings`; documented **where each is configured** (EPD self-serve screens vs APD admin-only) and a governance contrast. | Platform Eng |
| Internal | All modules | Verified edge-function / business-logic coverage against the 73 backend functions; each dev guide now distinguishes **wired** vs **present-but-unreferenced** functions; corrected Sales CRM (RPC state machine + GSTIN 4-eyes promote) and Job Works (`job-work-sales-return-management`). | Platform Eng |
| Customer | Plant Production / Warehouse | Removed **QR Labels & Batch Traceability** from the Plant Production sidebar (it stays under Warehouse Management, where it's scanned). | Platform Eng |
| Both | Master data | Authored full customer + developer guides for **Products, Price Lists, Raw Materials, Regions & Territories, Logistics & Transport**, with staging screenshots. | Platform Eng |
| Both | Sales CRM | Authored the **Sales CRM** customer hub + developer guide (categories, lead pipeline, target-management cascade). | Platform Eng |
| Customer | Platform | Reworked the docs home + Use Cases pages to enterprise standard; fixed link affordance (distinct link colour + underline) and interactive tables. | Platform Eng |

## 2026-06-17

| Scope | Modules | Summary | Author |
|---|---|---|---|
| Internal | Platform | Established the enterprise **developer-guide** standard (front-matter, change log, glossary, architecture + lifecycle Mermaid, controls, RACI, test automation) and the platform architecture overview. | Platform Eng |
| Internal | O2C, Dealers, Dealer Applications, Finance, P2P, Warehouse, Plant Production, HRMS, Job Works | Initial enterprise developer guides per module — lifecycles, API surface, data model, permissions, compliance controls. | Platform Eng |
| Customer | O2C, Finance, Warehouse, P2P, Plant Production, HRMS, Dealers, Suppliers | Initial customer hubs with verified workflows and staging screenshots. | Platform Eng |
