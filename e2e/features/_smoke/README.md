# DAEE QA Integration Tests

> Long-lived branch: **`qa/integration-tests`**
> Invoked by: **`/daee-qa-run`** skill in the Claude Code harness

This directory holds Playwright specs authored by `/daee-qa-run` to verify
DAEE `web_app` UI-affecting changes against `localhost:3000` (dev server
pointed at the staging Supabase DB). It intentionally lives **outside**
the main BDD suite so it can be run without global setup and without the
BDD generation prestep.

---

## Design

- **No BDD, no global setup.** `playwright.smoke.config.ts` bypasses
  `global.setup.ts` so it doesn't need the framework's `IACS-MD_EMAIL`
  (dash-cased) env vars. Auth is done by `daee-fresh-login.spec.ts`,
  which reads the actual `.env` names (`IACS_MD_USER_EMAIL` etc.) and
  saves the resulting session to `/tmp/iacs-md-fresh.json`.
- **Reusable auth state.** Every ticket-specific spec picks the fresh
  state first, falls back to `e2e/.auth/iacs-md.json` if not present.
- **Data-dependent skips, not hangs.** When a test needs a specific
  fixture (a dealer with invoice items, a range with GL data), it
  `test.skip()` with a clear message rather than failing.
- **Mutation tests are tagged `@mutation` and never run by default.**
  See `daee-1214-je-reverse.spec.ts`. Runs write real rows to staging;
  cleanup guidance lives in `web_app/docs/qa/daee-1214-mutation-cleanup.md`.

## File layout

| File | Ticket | Level | Runtime |
|---|---|---|---|
| `daee-fresh-login.spec.ts` | — | Setup (one-off) | ~25s |
| `daee-6tix-smoke.spec.ts` | 1214/1207/1208/1215/1199/1204 | Shell + DOM markers | ~60s |
| `daee-1207-gstr1-json-export.spec.ts` | 1207 | Byte-level (JSON) | ~15s |
| `daee-1208-gl-excel-subtotals.spec.ts` | 1208 | Byte-level (XLSX via ExcelJS) | data-dependent |
| `daee-1204-dealer-ledger-pdf.spec.ts` | 1204 | Byte-level (PDF via pdf-parse) | data-dependent |
| `daee-1214-je-reverse.spec.ts` | 1214 | Mutation (writes JEs) | ~90s, opt-in only |
| `playwright.smoke.config.ts` | — | Runner config | — |

## Running

```bash
cd ~/projects/platform_automation
git switch qa/integration-tests   # or a merged integration branch

# 1. Fresh IACS-MD login (once per shift or when auth expires)
TEST_BASE_URL=http://localhost:3000 \
  npx playwright test \
  --config e2e/features/_smoke/playwright.smoke.config.ts \
  --grep '@login-only'

# 2. Shell-level smoke (all 6 tickets, ~1 min)
TEST_BASE_URL=http://localhost:3000 \
  npx playwright test \
  --config e2e/features/_smoke/playwright.smoke.config.ts \
  --grep '@daee-smoke'

# 3. Byte-level checks (deterministic, opt-in per ticket)
TEST_BASE_URL=http://localhost:3000 \
  npx playwright test \
  --config e2e/features/_smoke/playwright.smoke.config.ts \
  --grep '@daee-1207|@daee-1208|@daee-1204'

# 4. Mutation tests — WRITES TO STAGING. Explicit invocation only.
TEST_BASE_URL=http://localhost:3000 \
  npx playwright test \
  --config e2e/features/_smoke/playwright.smoke.config.ts \
  --grep '@mutation'
```

## Adding new ticket coverage

`/daee-qa-run` adds new tests here automatically when the ticket ships
UI-affecting code and existing coverage doesn't apply. Naming pattern:

```
daee-<ticket>-<slug>.spec.ts    # ticket-specific
```

Follow the conventions in the skill file
(`~/.claude/commands/daee-qa-run.md`) — selector standards, data-dep
skip patterns, screenshot capture, mutation tagging.

## Environment

- **Dev server:** `http://localhost:3000` (`~/projects/web_app` running
  `npm run dev`, staging Supabase creds in `.env.local`)
- **Auth:** iacs-md profile (Rakesh Reddy on Idhyah Agri Crop Sciences)
- **Storage state:** `/tmp/iacs-md-fresh.json`, refreshed by
  `daee-fresh-login.spec.ts`. Cookie TTL is long but not forever; refresh
  when tests start redirecting to `/login`.

## Dependencies added by this branch

- `pdf-parse` (v2, class-based API) — PDF text extraction for
  `daee-1204-dealer-ledger-pdf.spec.ts`.
- `exceljs` — was already a devDep; used by
  `daee-1208-gl-excel-subtotals.spec.ts`.
