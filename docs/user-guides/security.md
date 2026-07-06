# Security & Trust

> DAEE runs the money and operations of dealer-led, finance-sensitive businesses — so security and
> auditability are not features, they're the foundation. This page explains, in plain terms, **how your
> data and your money are protected**, including the **bank-integration (VAN)** layer.

> **Audience:** Customer + Internal · **Module:** platform (security) · **Status:** 🟢 Authored
> **Verified:** against `web_app` (auth/RLS/permissions) + the Axis VAN edge functions on 2026-06-18.

## The short version
- **Your data is isolated to your organization** — enforced in the database, not just the app.
- **Strong sign-in** — multi-factor authentication for every user; optional Google single sign-on.
- **Least-privilege access** — role-based permissions decide what each person can see and do.
- **Everything is logged** — a full, reviewable audit trail of who did what, and when.
- **Encrypted** — in transit and at rest; sensitive values and personal data are protected.
- **Bank collections are cryptographically verified** — every VAN callback is signature-checked, rate-limited, and de-duplicated.
- **Deterministic core** — your accounting, tax, and compliance results are reproducible and audited; AI never silently changes your books.

---

## 1. Your data is isolated (multi-tenant by design)
Every organization runs in its own **tenant**. Isolation is enforced at the **database** layer — each
record is tagged to your organization and access rules are applied on **every** query, so one
organization can never see or touch another's data. The application adds a second check on top. This is
defense-in-depth: even a mistake in the app cannot cross the tenant boundary.

<!-- INTERNAL:START -->
Postgres **Row-Level Security (RLS)** on every tenant table (`tenant_id` predicate), enforced regardless of the query path; server actions independently call `getServerPermissions().check(module, action)`. Tenant resolved from `profiles.tenant_id` after `supabase.auth.getUser()`. Service-role (worker/edge) paths are audit-logged and scoped by `tenant_id` in code.
<!-- INTERNAL:END -->

## 2. Access control — who can sign in, and what they can do
- **Multi-factor authentication (MFA)** — users sign in with email + password **and** a one-time code from an authenticator app. First-time users enrol once.
- **Single sign-on** — Google SSO is supported.
- **Role-based permissions (RBAC)** — what a person can view or do is governed by their **role**. If something isn't visible, their role doesn't grant it. Permissions are **least-privilege** by default — access is granted, not assumed.

<!-- INTERNAL:START -->
TOTP-based MFA (authenticator app); permissions are `module:action` pairs resolved from `user_effective_permissions` (process-cached), checked server-side on every action. No client-trusted authorization.
<!-- INTERNAL:END -->

## 3. Everything is audited
DAEE keeps a **reviewable trail** of significant actions — postings, document-state changes, approvals,
and master-data edits — with **who, what, and when**. Financial history is **append-only**: entries are
reversed, never silently overwritten, so your books and approvals stand up to audit.

<!-- INTERNAL:START -->
Audit surfaces include `audit_logs_unified` and append-only history/event tables (e.g. `lead_stage_history`, `kpi_signoffs`, journal reversals). Journal-entry audit and CARO-2020-relevant trails are tracked; do not mutate prior audit rows.
<!-- INTERNAL:END -->

## 4. Encryption & data protection
- **In transit** — all traffic is encrypted (TLS/HTTPS).
- **At rest** — your data is encrypted at rest by the managed database platform.
- **Sensitive values** — secrets and selected sensitive settings are stored **encrypted**, not in plain text.
- **Personal data is masked** — where personal/bank details appear in logs or operational views, they are **masked** (e.g. partial account numbers), so day-to-day operators don't see full PII.

<!-- INTERNAL:START -->
TLS in transit; Supabase/Postgres encryption at rest. `tenant_settings.setting_value_encrypted` + `is_encrypted` for sensitive config. PII masking applied in VAN edge functions (sender bank details) and operational views.
<!-- INTERNAL:END -->

## 5. Secure bank integration (Virtual Accounts / VAN)
Collecting money straight from the bank is the highest-trust integration in DAEE, so it has its own
layered controls. When the bank notifies DAEE of a payment into your **Virtual Account (VAN)**:

- **Authenticity & integrity** — every callback is authenticated with an **API key** and a **digital signature (HMAC-SHA256)**. DAEE verifies the signature before accepting the message, so a request can't be forged or tampered with in transit.
- **Network allowlisting** — only the **bank's approved IP addresses** can reach the endpoint.
- **Rate limiting** — requests are throttled in tiers to absorb spikes and block abuse, **without dropping genuine bank notifications**.
- **No double-posting** — each notification is processed **idempotently**: a retry or duplicate can't credit a payment twice.
- **PII masking** — the sender's bank details are **masked** in the UI and logs.
- **Traceability & retention** — each request carries a unique **request id**, and security-relevant logs are **retained for incident response** in line with **CERT-In** directions.

The result: money-in is verified, attributable, and replay-safe — and you can reconcile every rupee back
to a signed, traceable bank event. *(How to use VAN day-to-day → [Bank Collections (VAN)](./finance/van.md).)*

<!-- INTERNAL:START -->
Edge functions `axis-bank-validation` (verify) + `axis-bank-posting` (post): **API Key + HMAC-SHA256** request signing (verified in code), **4-tier rate limiting** (Redis), **Axis IP allowlist**, **fail-open** so genuine collections aren't lost during limiter issues, **idempotency** keys, **X-Request-Id** correlation, PII masking, and **CERT-In 180-day** log retention (DAEE-316). Polling/reconciliation via `van-payment-polling` / `van-auto-reconciliation`. Full contract is **CONFIDENTIAL**: `daee-production/docs/axis-bank-security/DAEE_Axis_Bank_VAN_Production_Integration_Guide_Enterprise` — share only with the Axis integration team under NDA.
<!-- INTERNAL:END -->

## 6. Data residency, backups & continuity
- **Residency** — your data is hosted in an **India region**, aligning with data-localisation expectations for Indian financial operations.
- **Backups** — the managed database platform takes regular automated backups with point-in-time recovery, so data can be restored after an incident.
- **Retention** — security-relevant logs are retained for incident response in line with **CERT-In** directions; financial records follow statutory retention.
- **Continuity** — the platform runs on managed, redundant infrastructure; recovery procedures exist for restoring service and data.

> **Note** Exact RPO/RTO targets, backup cadence, and the incident-response runbook are available to
> your security/procurement team on request under NDA.

## 7. Compliance & the deterministic core
- **Statutory documents come from real transactions** — E-Invoice (IRN), E-Way Bills, and GST returns are generated from your actual postings, not re-keyed, so they reconcile to the ledger.
- **Deterministic, reproducible results** — accounting, tax, document-state, and compliance logic give the *same output for the same input, every time*, and are fully audited.
- **AI is bounded** — AI assists with explanation, reconciliation, and exception triage only; it **never** becomes the system of record or silently changes your books, master data, or pricing.
- **India-first compliance** — GST, E-Invoice, E-Way Bill, TDS, and Companies Act (Schedule III) treatment are built in; security logs follow **CERT-In** retention.

## What you're responsible for
Security is shared. To keep your organization safe:
- **Enrol every user in MFA** and keep authenticator devices secure.
- **Assign roles carefully** — grant the least access each person needs.
- **Off-board promptly** — deactivate users who leave.
- **Protect credentials** — never share logins; report anything suspicious to your administrator.

## Support & escalation
- **Access, roles, MFA** → your organization administrator.
- **A suspected security incident** → notify your administrator immediately; they escalate to DAEE.
- **Bank-integration (VAN) questions** → Finance + your DAEE contact.

## Related
[Platform overview](./README.md) · [Bank Collections (VAN)](./finance/van.md) · [Finance Setup & Configuration](./finance/configuration.md) · [Finance & Accounts](./finance/README.md)
