# Playwright Docs-Capture Harness — Design

How DAEE training screenshots are produced and kept in sync — reusing the existing
`platform_automation` Playwright framework (personas, baseURL, reporters).

## Goals
- **Living documentation:** screenshots regenerate on demand → never drift from the UI (ERP best practice).
- **Single source:** the same module `.md` drives both the prose *and* the capture (via inline
  `<!-- capture: {...} -->` directives next to each screenshot slot).
- **Multi-persona:** reuse `e2e/.auth/*.json` `storageState` so each screen is shot as the right role.

## How it works
1. **Author** a module guide with screenshot slots:
   ```md
   ![O2C — Create Indent](../assets/o2c/02-create-indent.png)
   <!-- capture: { "project": "iacs-md", "route": "/o2c/indents", "action": "open-create-dialog", "highlight": "button:has-text('Create')" } -->
   ```
2. **`npm run docs:capture`** parses every `capture` directive, and for each:
   - launches a context with the directive's `project` persona (`storageState`),
   - navigates to `route` (baseURL from `TEST_BASE_URL`, default `http://localhost:3000`),
   - runs the optional named `action` (a small registry of reusable steps, e.g.
     `open-create-dialog`, `open-first-invoice`, `process-workflow`),
   - optionally highlights an element (`highlight` selector → outline overlay),
   - writes `assets/<module>/<slot>.png` (full-page or element-scoped).
3. **`npm run docs:build`** renders each module `.md` into `_generated/<module>.customer.md`
   (INTERNAL blocks stripped) and `<module>.internal.md`, then to PDF.

## Proposed structure (additive to platform_automation)
```
e2e/docs-capture/
├── capture.spec.ts        ← reads */*.md capture directives, drives + screenshots
├── actions/               ← named reusable actions (open-create-dialog, …)
└── parse-directives.ts    ← extract { project, route, action, highlight } from md
scripts/docs/
├── build-guides.ts        ← strip INTERNAL, render customer/internal md
└── md-to-pdf.ts           ← PDF export (playwright page.pdf or md→pdf)
docs/user-guides/assets/   ← capture output
```
package.json scripts:
```json
"docs:capture": "playwright test e2e/docs-capture/capture.spec.ts --project=docs",
"docs:build":   "tsx scripts/docs/build-guides.ts",
"docs:pdf":     "tsx scripts/docs/md-to-pdf.ts"
```

## Prerequisites to run
- App reachable at `TEST_BASE_URL` (local `localhost:3000` or a deployed staging URL).
- Valid persona `storageState` files (already used by the test suite).
- **Seeded, non-PII data** on that environment (IACS staging tenant) — screenshots must not
  contain real customer data.

## Screenshot best practices (enforced by the harness)
These are applied automatically so every shot is consistent and safe to publish:
1. **PII redaction (ON by default).** Before each shot, real **emails, phone numbers, GSTIN, PAN,
   Aadhaar** are format-preserving masked (`m•••@•••.com`, `99••••••24`, `36•••••••••••K`). Disable
   only for internal debugging with `--no-redact`. *Never publish a customer screenshot with live PII.*
2. **Wait for the page to finish.** `settle()` = networkidle → let the loading spinner mount → poll
   until it clears (≤18s) → short pause. No "spinner / skeleton / blank" shots.
3. **Consistent framing.** Fixed **1440×900 viewport at 2× DPI**, light theme, one persona session —
   uniform look across the whole doc set. Viewport-framed (not full-page) to avoid empty whitespace.
4. **One screenshot per documented step**, taken in the state the step describes (the harness runs the
   step's `action` — open dialog / open row / click — *before* shooting).
5. **Highlight the target** where useful: a directive's `highlight` CSS selector gets a blurple outline
   so the reader sees exactly what to click.
6. **Deterministic data.** Capture against the **seeded IACS staging tenant**, not production; avoid
   time-sensitive values so re-runs are stable.
7. **Re-runnable / living docs.** Re-run on each release (or in CI) to refresh `assets/` then `docs:site`.

### Writing the step so it matches the screenshot
- Lead with the **imperative action** ("Click **Create E-Way Bill**", "Open the dealer → **Edit**").
- Name the on-screen label exactly (matches what the highlight points to).
- One step → one screenshot slot → one `capture` directive. Keep them adjacent in the `.md`.
- If a step can't be auto-captured to the exact sub-state (e.g. a create dialog whose button label the
  harness can't match), either add the precise `action`/`highlight`, or soften the caption to describe
  the captured state — don't leave a caption promising UI the screenshot doesn't show.

## Capture screenshots from staging.daee.in — steps

Implemented in `scripts/docs/capture.mjs` (route-level v1). It reads every
`<!-- capture: {project, route, highlight} -->` directive in the guides, logs in as that
**persona** (reusing the saved `e2e/.auth/<persona>.json` session), and screenshots
`TEST_BASE_URL + route` (full-page, 2× DPI) into the `assets/…` path next to the slot.

```bash
cd ~/projects/platform_automation

# 0. one-time: install deps + browsers
npm install
npx playwright install chromium

# 1. point at staging + set creds (.env)
cp .env.example .env            # then edit .env:
#   TEST_BASE_URL=https://staging.daee.in
#   TEST_ENV=staging
#   # ⚠️ EXACT names (the framework's error text "IACS-MD_EMAIL" is WRONG; .env.example is stale):
#   IACS_MD_USER_EMAIL=...
#   IACS_MD_USER_PASSWORD=...
#   IACS_MD_USER_TOTP_SECRET=...          # base32 TOTP secret for that user

# 2. generate the logged-in session (writes e2e/.auth/iacs-md.json)
npx playwright test --project=setup
#   (only iacs-md + iacs-ed profiles are active; others are commented out in user-profiles.config.ts)

# 3. capture from staging — shoot EVERY directive with the one iacs-md session
#    (iacs-md = MD: o2c:* + finance:read + warehouse:read → can view almost all pages)
DOCS_CAPTURE_PERSONA=iacs-md npm run docs:capture
#   node scripts/docs/capture.mjs --persona iacs-md --route-only   # skip dialog actions
#   node scripts/docs/capture.mjs --persona iacs-md --only iacs-md  # subset

# 4. rebuild the HTML site with the new screenshots
npm run docs:site
open docs/site/index.html
```

**If the automated TOTP login fails** (the app's custom MFA verify can reject programmatically-entered
codes even when the secret/clock are correct), do a **one-time manual login** instead — it saves the
same `e2e/.auth/<persona>.json` that capture reuses:
```bash
npm run docs:login                       # opens a browser; log in by hand (email+password+TOTP), press ENTER
DOCS_CAPTURE_PERSONA=iacs-md npm run docs:capture
npm run docs:site && open docs/site/index.html
```
`docs:capture` is a standalone script (it does **not** re-trigger the flaky `--project=setup` auth),
so once the session JSON exists it just uses it. Re-run `docs:login` if the session expires.

**Active personas (verified):** only `iacs-md` and `iacs-ed` are enabled in
`e2e/src/support/config/user-profiles.config.ts` (finance-admin / warehouse / super-admin are
commented out — "re-enable later"). Directives written against `iacs-finance-admin` / `admin`
therefore have **no session** — use **`DOCS_CAPTURE_PERSONA=iacs-md`** to shoot them all with the
MD session (MD can view O2C/Finance-read/Warehouse-read). Re-enable + add creds for the other
profiles later if you want role-accurate captures.

**Data hygiene:** capture against a **staging tenant with seeded, non-PII data** (IACS). Don't shoot
real customer data. Consistent viewport (1440×900, 2× DPI).

### Coverage & capability (v2)
- **28 directives**: 8 route-only + 20 with an in-page action.
- **v2 per-action capture is implemented** — the script opens the UI before shooting:
  `open-create-dialog`, `open-create`, `open-first-application|dealer|invoice`, `open-approve`,
  `process-workflow`, `open-ewb-create`. Action shots use the **viewport** (so the dialog/overlay is
  framed); route shots use **full-page**.
- Actions are **best-effort** with resilient role/text selectors; if one fails, the script falls back
  to a route screenshot and logs `~route`. Tune selectors per the live DOM, or pass `--route-only`.
- Until captured, the site shows labelled **placeholder cards** instead of broken images.

## Status
**Implemented (v1):** `scripts/docs/capture.mjs` + `npm run docs:capture`; `scripts/docs/build-site.mjs`
+ `npm run docs:site`. **Needs:** a reachable `staging.daee.in` + persona creds in `.env` +
`npm install`/`playwright install` (not present in every checkout). v2: per-action capture steps.
