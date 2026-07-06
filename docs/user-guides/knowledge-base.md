# Knowledge Base

> DAEE's in-app **help library** — searchable articles (guides, FAQs, SOPs, troubleshooting, release
> notes) organised by module, with an approval-governed authoring workflow. It's also the **source
> corpus** for the planned read-only AI assistant.

> **Audience:** Customer + Internal · **Module:** `/knowledge-base` · **Status:** 🟢 Authored
> **Verified:** against `web_app/src/app/knowledge-base` (`kbActions.ts`, `kb.types.ts`) + `kb_articles` schema on 2026-07-06.

## What you can do
- **Find answers fast** — full-text **search** across article titles, summaries and bodies, plus filters by
  **module** and **category**.
- **Browse by area** — articles are tagged to a **module** (O2C, P2P, Inventory, Finance, Plant, HRMS, CRM,
  General) and a **category** (Guide, FAQ, SOP, Troubleshooting, Release note).
- **Read & rate** — open an article and mark it **helpful / not helpful** so owners can improve content.
- **Author & govern** (admins) — write articles and move them through a **review → approve → publish**
  workflow with version and compliance metadata.

## Browse the Knowledge Base
The curated content readers see, organised for review:

| Page | What's in it |
|---|---|
| **[Glossary](./knowledge-base/glossary.md)** | Plain-language definitions of DAEE/ERP terms (A–Z) |
| **[Process Flows](./knowledge-base/process-flows.md)** | Step-by-step flows — O2C, FEFO, P2P, payment allocation, VAN, E-Invoice, IWT, QC |
| **[Troubleshooting](./knowledge-base/troubleshooting.md)** | Common issues and fixes by module (O2C, P2P, Inventory, Finance) |
| **[FAQs](./knowledge-base/faqs.md)** | Frequently asked questions across O2C, P2P, Inventory, Finance, Compliance |
| **[AI Assistant Guide](./knowledge-base/ai-assistant.md)** | How the **planned** read-only assistant will work |

## Before you begin
- The Knowledge Base is **permission-gated** and **tenant-isolated** — you only see your organisation's
  articles, and only **published** ones unless you have authoring rights.

### Roles and what each can do
| Role | What they can do |
|---|---|
| **Reader** (`knowledge_base: read`) | Search, browse, read **published** articles, submit feedback |
| **Author** (`create` / `update`) | Create/edit articles, submit for review |
| **Approver** (`approve`) | Approve and **publish** articles |

## Using the Knowledge Base (reader)
1. Open **Knowledge Base**. Use the **search bar** for a question or keyword, and the **module** filter to
   narrow the list.
2. Open an article to read it. Articles show their **module**, **category** and **tags**.
3. Use **Helpful / Not helpful** at the end to give feedback — it's recorded per article for the owners.

> **Tip** Search matches the **title, summary and full body** of published articles, so you can search on a
> phrase from inside an article, not just its title.

## Authoring & governance (admin)
Articles move through a controlled lifecycle so only reviewed, approved content is published:

```
Draft  →  Pending review  →  Approved  →  Published        (Archived when retired)
(status)                                   + approval_status = approved · is_active = true
```

1. **Create a draft** — title, **module**, **category**, tags, summary, and the article body (Markdown).
   Add **governance metadata**: **version**, **compliance area** (e.g. GST / E-Invoice), **effective date**
   and **review-due date**.
2. **Submit for review** — the article moves to **Pending review**.
3. **Approve** — an approver (with `approve` permission) approves it.
4. **Publish** — publishing makes it **live and searchable** for readers. Editing a published article sends
   it back through review before the change goes live.

> **Caution** Approve and publish are a **segregation-of-duties** control — keep authoring and approval with
> different people where your policy requires it. Set a **review-due date** so content is refreshed before it
> goes stale (compliance-sensitive articles especially).

## AI Assistant (planned)
A **read-only, citation-first AI assistant** is planned on top of the Knowledge Base. When available it will:
- answer **only from published + approved** KB articles (never from live ERP data or model memory),
- return an answer **with citations** to the source articles,
- respect **tenant** and **role** boundaries, and say *"not enough approved knowledge found"* rather than guess.

It will **not** change data, approve documents, or report live balances / invoice status / stock. Until it
ships, the Knowledge Base search + articles are the help surface.

<!-- INTERNAL:START -->
**Data model:** `kb_articles` (+ `kb_feedback`), tenant-isolated via RLS (`tenant_id = profile lookup`).
Two state fields: `status` (draft/pending_review/approved/published/archived) and `approval_status`
(pending/approved/rejected). Server actions (`kbActions.ts`) enforce `check('knowledge_base', <action>)` and
scope every query by `tenant_id`. Full-text search uses the generated `search_vector` (title^A/summary^B/
body^C) GIN column via `.textSearch('search_vector', q, { type: 'websearch' })`; the list is paginated
(exact count + `.range()`), so it never truncates at the 1000-row cap.

**Migrations (applied in staging 2026-07-06; in PROD apply BEFORE the search code deploys, else `.textSearch(search_vector)` errors):** `20260706120000_kb_status_check_extend.sql` (P0 — the base
`chk_kb_status` only allowed draft/published/archived, so submit→approve→publish failed until the CHECK is
widened) and `20260706120500_kb_fts_search_vector.sql` (the `search_vector` column). Content seed +
verification: `daee-production/docs/runbooks/seed-kb-ai-prerequisite-content.md`.

**AI assistant status:** design only — see `web_app/docs/internal/DAEE-KB-CHATBOT-IMPLEMENTATION-PLAN-2026-05-22.md`
(read-first, citation-first RAG; Ollama for the pilot → Claude later behind a provider abstraction; pgvector
in Supabase). No chatbot code exists yet; retrieval must filter published+approved+active+tenant.
<!-- INTERNAL:END -->

## Common mistakes & warnings
- **Publishing without review** — use the workflow; editing a published article re-triggers review by design.
- **No review-due date on compliance content** — set one so GST/E-Invoice articles don't silently go stale.
- **Treating the (future) AI answer as live truth** — the assistant explains approved *knowledge*; it does not
  read live balances, invoice status or stock.

## Related workflows
[Finance & Accounts](./finance/README.md) · [Order to Cash](./o2c/order-to-cash.md) · [Procure to Pay](./p2p/procure-to-pay.md) · [Documentation authoring](./AUTHORING.md)

## Support and escalation
Content accuracy / approvals → **KB owner / module SME**. Access or permission issues → **Admin**. AI
assistant rollout → **Product / Engineering**.
