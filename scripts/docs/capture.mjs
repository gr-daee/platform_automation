#!/usr/bin/env node
/**
 * DAEE docs screenshot capture (v2 — route + per-action).
 *
 * Scans guide .md for:
 *   ![alt](../assets/<module>/<file>.png)
 *   <!-- capture: { "project":"iacs-md", "route":"/o2c/indents", "action":"open-create-dialog", "highlight":"css" } -->
 * Logs in as the `project` persona (reusing e2e/.auth/<persona>.json), navigates BASE+route,
 * runs the named `action` (open a dialog / first row / etc.), optional `highlight`, screenshots.
 *
 * IMPORTANT (verified): only the `iacs-md` and `iacs-ed` profiles are active in
 * e2e/src/support/config/user-profiles.config.ts. `iacs-md` (MD) has o2c:* + finance:read +
 * warehouse:read, so it can VIEW almost every page. Use the persona override to shoot everything
 * with one session:  DOCS_CAPTURE_PERSONA=iacs-md  (or  --persona iacs-md).
 *
 * Env (.env): TEST_BASE_URL=https://staging.daee.in ; IACS_MD_USER_EMAIL / _PASSWORD / _TOTP_SECRET
 * Auth states: npx playwright test --project=setup   (writes e2e/.auth/iacs-md.json)
 *
 * Run: npm run docs:capture
 *   node scripts/docs/capture.mjs --persona iacs-md      # force one session for all shots
 *   node scripts/docs/capture.mjs --route-only           # skip actions (v1 behaviour)
 *   node scripts/docs/capture.mjs --only iacs-md          # only directives for this persona
 */
try { await import('dotenv/config'); } catch { /* optional */ }
import { chromium } from '@playwright/test';
import { readFileSync, readdirSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DOCS = join(ROOT, 'docs');
const AUTH = join(ROOT, 'e2e', '.auth');
const BASE = (process.env.TEST_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const argv = process.argv;
const arg = (f) => argv.includes(f) ? argv[argv.indexOf(f) + 1] : null;
const PERSONA_OVERRIDE = arg('--persona') || process.env.DOCS_CAPTURE_PERSONA || null;
const ROUTE_ONLY = argv.includes('--route-only') || process.env.DOCS_CAPTURE_ROUTE_ONLY === 'true';
const ONLY = arg('--only');
const REDACT = !argv.includes('--no-redact'); // PII masking ON by default (docs best practice)

// Meta/authoring docs contain *example* capture directives (illustrative, not real slots) —
// skip them so their examples don't produce stray screenshots.
const SKIP_DOCS = new Set(['AUTHORING.md', 'CAPTURE-HARNESS.md']);
function walk(dir) {
  const out = []; let es = []; try { es = readdirSync(dir); } catch { return out; }
  for (const e of es) { const p = join(dir, e); statSync(p).isDirectory() ? out.push(...walk(p)) : (e.endsWith('.md') && !e.startsWith('_') && !SKIP_DOCS.has(e)) && out.push(p); }
  return out;
}

// ── parse directives ────────────────────────────────────────────────────────
const RE = /!\[[^\]]*\]\(([^)]+\.png)\)\s*(?:\r?\n)\s*<!--\s*capture:\s*(\{[\s\S]*?\})\s*-->/g;
const shots = [];
for (const md of [...walk(join(DOCS, 'user-guides')), ...walk(join(DOCS, 'developer-guides'))]) {
  const text = readFileSync(md, 'utf8'); let m;
  while ((m = RE.exec(text))) {
    let cfg; try { cfg = JSON.parse(m[2]); } catch { console.warn('⚠️ bad capture JSON in', md); continue; }
    if (!cfg.route || !cfg.project) continue;
    shots.push({ persona: PERSONA_OVERRIDE || cfg.project, route: cfg.route, action: cfg.action || null, section: cfg.section || null, highlight: cfg.highlight || null, outPath: resolve(dirname(md), m[1]) });
  }
}
const MATCH = arg('--match') || process.env.DOCS_CAPTURE_MATCH || null; // route substring filter, comma-separated (e.g. "/products,/regions")
const MATCHES = MATCH ? MATCH.split(',').map(x => x.trim()).filter(Boolean) : null;
const seen = new Set();
const unique = shots
  .filter(s => !MATCHES || MATCHES.some(x => s.route.includes(x)))
  .filter(s => { const k = `${s.persona}|${s.route}|${s.action}|${s.outPath}`; return seen.has(k) ? false : (seen.add(k), true); });
const byPersona = unique.reduce((a, s) => ((a[s.persona] ||= []).push(s), a), {});
console.log(`📷 ${unique.length} screenshots · personas: ${Object.keys(byPersona).join(', ')} · BASE=${BASE}${ROUTE_ONLY ? ' · route-only' : ''}`);

// ── v2 action registry (best-effort, resilient; failures fall back to route shot) ──
// Wait for the page/route to actually finish rendering — networkidle + any loading
// spinner gone + a short settle. This is what stops blank "spinner + watermark" shots.
async function settle(page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  // Let the post-navigation spinner actually MOUNT before we poll for its absence —
  // otherwise we pass during the brief blank moment right after a SPA row-click and
  // screenshot the loading state. (Diagnosed: detail page needs ~10s to hydrate.)
  await page.waitForTimeout(1500);
  await page.waitForFunction(
    // Detail pages (e.g. invoice) fetch client-side and show a `animate-pulse` skeleton, not a
    // spinner — wait that out too, else lower sections (E-Way Bill) aren't mounted when we act.
    () => !document.querySelector('.animate-spin, [class*="spin"], [class*="pulse"], [aria-busy="true"], [role="status"]'),
    { timeout: 18000 },
  ).catch(() => {});
  await page.waitForTimeout(800);
}
// Best practice: redact customer PII before every shot (training docs must not leak real
// emails / phones / GSTIN / PAN / Aadhaar). Format-preserving masks; toggle with --no-redact.
async function redactPII(page) {
  await page.evaluate(() => {
    const mask = (s) => s
      .replace(/([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+(\.[A-Za-z]{2,})/g, '$1•••@•••$2')
      .replace(/(\+?91[\s-]?)?([6-9]\d{9})\b/g, (_m, p, n) => (p ? '+91 ' : '') + n.slice(0, 2) + '••••••' + n.slice(-2))
      .replace(/\b(\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d])\b/g, (m) => m.slice(0, 2) + '•••••••••••' + m.slice(-1)) // GSTIN
      .replace(/\b([A-Z]{5}\d{4}[A-Z])\b/g, 'AAAAA0000A')                                                        // PAN
      .replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, 'XXXX XXXX XXXX');                                                   // Aadhaar
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = []; let n; while ((n = w.nextNode())) nodes.push(n);
    for (const node of nodes) { const t = node.nodeValue; if (t && /[@\d]/.test(t)) { const m = mask(t); if (m !== t) node.nodeValue = m; } }
    // mask values inside inputs too
    for (const el of document.querySelectorAll('input,textarea')) { if (el.value && /[@\d]/.test(el.value)) el.value = mask(el.value); }
  }).catch(() => {});
}
const clickByText = (page, re) => page.getByRole('button', { name: re }).first().click({ timeout: 6000 });
const clickCreate = (page, re) =>
  page.getByRole('button', { name: re }).or(page.getByRole('link', { name: re })).first().click({ timeout: 8000 });
async function openFirstRow(page) {
  const link = page.locator('table tbody tr a, table tbody tr [role="link"]').first();
  if (await link.count()) await link.click({ timeout: 6000 });
  else await page.locator('table tbody tr').first().click({ timeout: 6000 });
  await settle(page); // SPA navigation → detail page must finish loading before we shoot
}
const waitDialog = (page) => page.locator('[role="dialog"]').first().waitFor({ state: 'visible', timeout: 8000 });
// Open the first table row's "⋮ Open menu" actions menu (verified affordance on list pages).
const openRowMenu = (page) => page.locator('table tbody tr').first().getByRole('button', { name: /open menu/i }).click({ timeout: 8000 });

const ACTIONS = {
  'open-create-dialog': async (p) => { await clickByText(p, /create|add|new/i); await waitDialog(p); },
  // Address Book: open Add-Address dialog, then switch the Entity Type select to warehouse/company
  // so the entity-specific category options (Seller/Dispatch, HQ/Bill-From) are visible.
  'open-create-warehouse': async (p) => {
    await clickByText(p, /add address|create|add|new/i); await waitDialog(p);
    await p.locator('[role="dialog"]').first().getByRole('combobox').first().click({ timeout: 6000 });
    await p.getByRole('option', { name: /warehouse/i }).click({ timeout: 6000 });
    await settle(p);
  },
  'open-create-company': async (p) => {
    await clickByText(p, /add address|create|add|new/i); await waitDialog(p);
    await p.locator('[role="dialog"]').first().getByRole('combobox').first().click({ timeout: 6000 });
    await p.getByRole('option', { name: /company/i }).click({ timeout: 6000 });
    await settle(p);
  },
  // cash-receipts / sales-returns expose a CTA link (not a dialog button) that navigates to a
  // create page → click button-or-link by its real label, then settle (covers page-nav or dialog).
  'open-create':        async (p) => {
    const re = /new cash receipt|create return order|new receipt|create return|record/i;
    await p.getByRole('button', { name: re }).or(p.getByRole('link', { name: re })).first().click({ timeout: 8000 });
    await settle(p);
  },
  'open-first-application': openFirstRow,
  'open-first-dealer':      openFirstRow,
  'open-first-invoice':     openFirstRow,
  'open-first-product':     openFirstRow,
  // Dealer edit = list row ⋮ menu → Edit → form dialog (verified 2026-06-17).
  'open-dealer-edit':   async (p) => { await openRowMenu(p); await p.getByRole('menuitem', { name: /edit/i }).click({ timeout: 6000 }); await waitDialog(p); await settle(p); },
  'open-record-deposit': async (p) => { await openFirstRow(p); await clickByText(p, /record deposit/i); await waitDialog(p); },
  // Open the first application's form, then switch to the named section button (one shot per step).
  'open-app-form': async (p, s) => {
    await openFirstRow(p);
    if (s && s.section) {
      const re = new RegExp(s.section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      await p.getByRole('button', { name: re }).first().click({ timeout: 8000 });
      await settle(p);
    }
  },
  'open-approve':       async (p) => { await openFirstRow(p); await clickByText(p, /approve/i).catch(() => {}); await settle(p); },
  'process-workflow':   async (p) => { await openFirstRow(p); await clickByText(p, /process workflow/i).catch(() => {}); await settle(p); },
  'open-ewb-create':    async (p) => { await openFirstRow(p); await clickByText(p, /create e-?way ?bill/i).catch(() => {}); await waitDialog(p).catch(() => {}); },
  // ── detail-page actions ───────────────────────────────────────────────────
  // The directive's `route` is already a specific detail page (explicit record id chosen
  // for its exact status). We only CLICK the action button and wait for its dialog/modal —
  // we never click the dialog's final confirm, so nothing is committed on staging.
  'click-approve':          async (p) => { await clickByText(p, /approve/i); await waitDialog(p); },
  'click-process-workflow': async (p) => { await clickByText(p, /process workflow/i); await waitDialog(p); },
  'click-generate-einvoice':async (p) => { await clickByText(p, /generate e-?invoice/i); await waitDialog(p); },
  'click-create-ewb':       async (p) => { await clickByText(p, /create e-?way ?bill/i); await waitDialog(p); },
  // Scan dialogs (QR programme) — open the dialog on an already-loaded detail page; never input a
  // scan, so nothing is committed. Record id is in the directive's route (chosen for its status).
  'click-scan-load':    async (p) => { await clickByText(p, /scan & ?load/i); await waitDialog(p); },
  'click-scan-receive': async (p) => { await clickByText(p, /scan & ?receive/i); await waitDialog(p); },
  'click-scan-count':   async (p) => {
    // Icon-only button on the ACTIVE count row, title="Count by scanning QR (active line)".
    const btn = p.getByRole('button', { name: /count by scanning/i }).first();
    if (!(await btn.count())) {            // no active row yet → activate the first count row, then retry
      await p.locator('table tbody tr').first().click({ timeout: 6000 }).catch(() => {});
      await p.waitForTimeout(800);
    }
    await p.getByRole('button', { name: /count by scanning/i }).first().click({ timeout: 8000 });
    await waitDialog(p);
  },
  // Switch to a named tab on the current page (Radix tabs), then settle. s.section = tab label.
  'click-tab': async (p, s) => {
    if (!s || !s.section) return;
    const re = new RegExp(s.section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    await p.getByRole('tab', { name: re }).first().click({ timeout: 8000 })
      .catch(async () => { await p.getByText(re).first().click({ timeout: 6000 }); });
    await settle(p);
  },
};
async function runAction(page, s) {
  const name = s.action;
  if (!name || ROUTE_ONLY) return false;
  const fn = ACTIONS[name];
  if (!fn) { console.warn(`     (no action handler for "${name}" — route-only)`); return false; }
  try { await fn(page, s); await page.waitForTimeout(500); return true; }
  catch (e) { console.warn(`     ⚠️ action "${name}"${s.section ? ' [' + s.section + ']' : ''} failed (${e.message.split('\n')[0]}) — route shot`); return false; }
}

// ── capture ───────────────────────────────────────────────────────────────────
let ok = 0, fail = 0, skipped = 0;
for (const [persona, list] of Object.entries(byPersona)) {
  if (ONLY && persona !== ONLY) { skipped += list.length; continue; }
  const storageState = join(AUTH, `${persona}.json`);
  if (!existsSync(storageState)) {
    console.warn(`⏭  persona "${persona}" — missing ${storageState}. Generate it (npx playwright test --project=setup) or use --persona iacs-md.`);
    skipped += list.length; continue;
  }
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ storageState, viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  for (const s of list) {
    try {
      mkdirSync(dirname(s.outPath), { recursive: true });
      await page.goto(BASE + s.route, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await settle(page);
      const acted = await runAction(page, s);
      if (s.highlight) await page.evaluate((sel) => { const el = document.querySelector(sel); if (el) { el.style.outline = '3px solid #635bff'; el.style.outlineOffset = '2px'; } }, s.highlight).catch(() => {});
      if (REDACT) await redactPII(page); // mask customer PII before the shot
      await page.screenshot({ path: s.outPath }); // viewport-framed (1440x900 @2x) — clean, no empty-page whitespace
      ok++; console.log(`   ✓ ${persona} ${s.route}${s.action ? ` [${s.action}${acted ? '' : '~route'}]` : ''} → ${s.outPath.replace(ROOT + '/', '')}`);
    } catch (e) { fail++; console.warn(`   ✗ ${persona} ${s.route} — ${e.message.split('\n')[0]}`); }
  }
  await browser.close();
}
console.log(`\nDone. ✓ ${ok}  ✗ ${fail}  ⏭ ${skipped}.  Next: npm run docs:site`);
if (fail && !ok) process.exitCode = 1;
