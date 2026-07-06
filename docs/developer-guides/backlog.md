---
title: "Documentation Backlog"
doc_id: "DEV-DOCS-BACKLOG"
owner: "Platform Engineering"
version: "1.1"
status: "Active"
classification: "Internal"
last_updated: "2026-06-26"
---

# Documentation Backlog

> The single tracking list for documentation work that is **known but deliberately not written yet** —
> usually because the underlying feature is not production-grade, is mid-change, or is awaiting a
> dependency. This keeps deferred items from being silently dropped.
>
> **Customer docs only describe shipped, stable behavior.** We do not document features that are about
> to change — it sets wrong expectations and forces immediate rework. When an item below becomes
> production-grade, follow the [authoring process](#authoring-process) and move it to *Documented*.

## How an item flows

```
Deferred ──▶ In progress ──▶ Documented
  (tracked    (verify →        (live in the
   here)       capture →        guide; logged in
               write)           the Changelog)
```

- **Deferred** — tracked here; **no** customer-facing steps or screenshots written yet.
- **In progress** — the feature is production-grade; someone is actively documenting it.
- **Documented** — published in the relevant guide, an entry added to the
  [Documentation Changelog](./changelog.md), and the row removed from the *Open* table below (recorded
  in this doc's [Change Log](#change-log)).

## Authoring process (per item)

When an item becomes production-grade, document it in this order (do **not** skip ahead):

1. **List** the exact changes to add to the guide (sections, steps).
2. **Verify** the behavior against `web_app` code **and** on staging via the
   `platform_automation` Playwright harness — never document from code-reading alone.
3. **Capture** real screenshots from staging (no placeholders).
4. **Write** the end-user steps and embed the captured screenshots (final stage), then review before commit.

---

## Open items

### O2C — Reports suite (14 reports)
**Status: Deferred — not production-grade.** These report screens exist under `/o2c/reports/*` but are
**not yet production-grade** (pending fixes). Document **individually, as each is fixed and verified** —
not as a speculative batch — so customer docs never describe behavior that's about to change.

**Target guide:** new `user-guides/o2c/reports.md` sub-page (wire into `SUBPAGES['/o2c']`), created only
when the first report ships production-grade.

| Reports | Trigger to document |
|---|---|
| collection-report, credit-utilization, delivery-challan, discount-report, hierarchical-product-sales, hierarchical-sales, invoice-cancellation, order-value, payment-allocation, price-history, product-sales, sales-report, sales-return, user-wise | each report fixed + production-grade |

### Finance — analytical / management reports
**Status: Deferred — confirm production-grade first.** These exist with real components, but (like the
O2C reports) code presence ≠ the team's production-grade bar — they need a product sign-off before
documenting. The **core statements** (Balance Sheet, P&L, Trial Balance, Cash Flow, Day Book, General
Ledger) are **already documented** in [Financial Reports](../user-guides/finance/financial-reports.md).

**Target guide:** extend `user-guides/finance/financial-reports.md` as each is confirmed.

| Reports (`/finance/reports/*` + top-level) | Trigger to document |
|---|---|
| dealer-outstanding, ecl-provisioning, group-summary, ar-health, ap-aging, pending-collection, reversal-frequency, discount-variance, gl-ar-reconciliation, customer-statements | per-report production-grade sign-off from Finance |

### Job Works — Compliance Alerts
**Status: Deferred — Pending UAT (gated).** `/job-work/compliance-alerts` is a preview surface: writer-side
integration on cancel-and-reverse paths is **partial** (only some failure cases write to
`compliance_alerts`), so the read queue **isn't exhaustive** and the **sidebar link is hidden**. Expected
in **DAEE-680 EPIC-1 P1.3 (auto-writer wiring)**. Until then the [Job Works guide](../user-guides/job-works/README.md)
notes it as *coming soon* with the **JE Audit Log (Finance → Audit)** workaround.

**Trigger to document:** auto-writer wiring complete (queue exhaustive) + sidebar link restored.

### Fixed Assets — export
**Status: Deferred — feature not built.** The [Fixed Assets register](../user-guides/finance/fixed-assets.md)
has **no export** today (no CSV/Excel/PDF) — unlike the Balance Sheet, P&L, and GST returns, which all
export. This is a **product gap** worth raising (an audit-grade asset register usually needs CSV/Excel).

**Trigger to document:** an export control ships on the Fixed Assets register/depreciation screens — then
add an *Export* section (Stripe-style, like Financial Reports / GST Compliance).

---

## Change Log

| Date | Change | Author |
|---|---|---|
| 2026-06-26 | Added **Finance analytical reports** (deferred pending sign-off), **JW Compliance Alerts** (Pending UAT, DAEE-680 EPIC-1 P1.3), and **Fixed Assets export** (not built). Ported the backlog to platform_automation as the canonical source. | Platform Eng |
| 2026-06-19 | Created the Documentation Backlog. Added the **O2C Reports suite (14 reports)** as *Deferred* pending production-grade fixes. | Platform Eng |
