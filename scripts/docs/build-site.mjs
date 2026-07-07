#!/usr/bin/env node
/**
 * DAEE docs → single-file HTML site (Stripe-style).
 * Reads every .md under docs/user-guides and docs/developer-guides, embeds them
 * into a self-contained docs/site/index.html that renders with marked + mermaid
 * (CDN), a Stripe-like theme, Customer/Internal toggle, and screenshot placeholders.
 *
 * Run: node scripts/docs/build-site.mjs   (from platform_automation/)
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join, relative, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DOCS = join(ROOT, 'docs');
const OUT_DIR = join(DOCS, 'site');

// Internal planning docs — kept in the repo for the team. They're still published to the site
// but flagged as INTERNAL: kept out of the module sidebar, surfaced only via the header
// "Internal docs" links (Internal view only), and badged when opened.
const INTERNAL_FILES = new Set(['MODULE-MAP.md', 'CAPTURE-HARNESS.md', 'AUTHORING.md']);

function walk(dir) {
  const out = [];
  let entries = [];
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (e.endsWith('.md') && !e.startsWith('_')) out.push(p); // skip _TEMPLATE only
  }
  return out;
}

function titleOf(md, fallback) {
  const m = md.match(/^#\s+(.+?)\s*$/m);
  return m ? m[1].replace(/[`*]/g, '') : fallback;
}

const groups = [
  { key: 'user-guides', label: 'User Guides' },
  { key: 'developer-guides', label: 'Developer Guides' },
];

// Map each published guide to the product route it documents (so the nav, which
// mirrors the app sidebar, can resolve a module → its guide page).
const DOC_ROUTE = {
  'user-guides/README.md': '/',
  'user-guides/security.md': '/security',
  'user-guides/knowledge-base.md': '/knowledge-base',
  'user-guides/knowledge-base/glossary.md': '/knowledge-base/glossary',
  'user-guides/knowledge-base/process-flows.md': '/knowledge-base/process-flows',
  'user-guides/knowledge-base/troubleshooting.md': '/knowledge-base/troubleshooting',
  'user-guides/knowledge-base/faqs.md': '/knowledge-base/faqs',
  'user-guides/knowledge-base/ai-assistant.md': '/knowledge-base/ai-assistant',
  'user-guides/address-book.md': '/address-book',
  'user-guides/use-cases/README.md': '/use-cases',
  'user-guides/use-cases/onboard-dealer-first-order.md': '/use-cases/onboard',
  'user-guides/o2c/order-to-cash.md': '/o2c',
  'user-guides/o2c/sales-indents.md': '/o2c/indents',
  'user-guides/o2c/sales-orders.md': '/o2c/sales-orders',
  'user-guides/o2c/invoices.md': '/o2c/invoices',
  'user-guides/o2c/sales-returns.md': '/o2c/sales-returns',
  'user-guides/o2c/back-orders.md': '/o2c/back-orders',
  'user-guides/o2c/reports.md': '/o2c/reports',
  'user-guides/p2p/procure-to-pay.md': '/p2p',
  'user-guides/warehouse-management/README.md': '/warehouse-management',
  'user-guides/warehouse-management/iwt.md': '/warehouse-management/iwt',
  'user-guides/warehouse-management/inventory.md': '/warehouse-management/inventory',
  'user-guides/warehouse-management/stock-audit.md': '/warehouse-management/cycle-count',
  'user-guides/plant-production/README.md': '/plant-production',
  'user-guides/plant-production/qr-and-batch-traceability.md': '/plant-production/qr-batch',
  'user-guides/p2p/three-way-matching-and-payments.md': '/p2p/matching-payments',
  'user-guides/job-works/README.md': '/job-work',
  'user-guides/hrms/README.md': '/hrms',
  'user-guides/finance/README.md': '/finance',
  'user-guides/finance/chart-of-accounts.md': '/finance/chart-of-accounts',
  'user-guides/finance/configuration.md': '/finance/configuration',
  'user-guides/finance/receipts-credits-discounts.md': '/finance/receipts-credits-discounts',
  'user-guides/finance/accounts-payable.md': '/finance/accounts-payable',
  'user-guides/finance/payroll.md': '/finance/payroll',
  'user-guides/finance/van.md': '/finance/van',
  'user-guides/finance/gst-compliance.md': '/finance/gst-compliance',
  'user-guides/finance/posting-profiles.md': '/finance/posting-profiles',
  'user-guides/finance/fixed-assets.md': '/finance/fixed-assets',
  'user-guides/finance/financial-reports.md': '/finance/reports',
  'user-guides/finance/screens.md': '/finance/screens',
  'user-guides/dealer-applications/dealer-applications.md': '/dealer-applications',
  'user-guides/dealers/README.md': '/dealers',
  'user-guides/sales-crm/README.md': '/sales-crm',
  'user-guides/sales-crm/visits.md': '/sales-crm/visits',
  'user-guides/sales-crm/followups.md': '/sales-crm/followups',
  'user-guides/sales-crm/target-management.md': '/sales-crm/target-management',
  'user-guides/products/README.md': '/products',
  'user-guides/price-lists/README.md': '/price-lists',
  'user-guides/raw-materials/README.md': '/raw-materials',
  'user-guides/regions/README.md': '/regions',
  'user-guides/logistics/README.md': '/logistics-transport-management',
  'user-guides/suppliers/suppliers.md': '/p2p/suppliers',
  'developer-guides/README.md': 'dev:/',
  'developer-guides/changelog.md': 'dev:/changelog',
  'developer-guides/backlog.md': 'dev:/backlog',
  'developer-guides/dealer-applications.md': 'dev:/dealer-applications',
  'developer-guides/o2c.md': 'dev:/o2c',
  'developer-guides/p2p.md': 'dev:/p2p',
  'developer-guides/warehouse-management.md': 'dev:/warehouse-management',
  'developer-guides/plant-production.md': 'dev:/plant-production',
  'developer-guides/job-works.md': 'dev:/job-work',
  'developer-guides/hrms.md': 'dev:/hrms',
  'developer-guides/finance.md': 'dev:/finance',
  'developer-guides/dealers.md': 'dev:/dealers',
  'developer-guides/sales-crm.md': 'dev:/sales-crm',
  'developer-guides/products.md': 'dev:/products',
  'developer-guides/price-lists.md': 'dev:/price-lists',
  'developer-guides/raw-materials.md': 'dev:/raw-materials',
  'developer-guides/regions.md': 'dev:/regions',
  'developer-guides/logistics.md': 'dev:/logistics-transport-management',
  'developer-guides/knowledge-base.md': 'dev:/knowledge-base',
};

const docs = [];
for (const g of groups) {
  for (const file of walk(join(DOCS, g.key)).sort()) {
    const rel = relative(DOCS, file);
    let md = readFileSync(file, 'utf8');
    // Extract YAML front-matter (enterprise doc metadata) → render as a clean card, not raw text.
    let meta = null;
    const fm = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    if (fm) {
      meta = {};
      for (const line of fm[1].split(/\r?\n/)) {
        const mm = line.match(/^(\w[\w-]*):\s*(.*)$/);
        if (mm) meta[mm[1]] = mm[2].replace(/^["']|["']$/g, '').trim();
      }
      md = md.slice(fm[0].length);
    }
    // Rewrite screenshot paths (written module-relative, e.g. ../assets/o2c/x.png)
    // to paths relative to the site output dir so the <img> resolves when opened.
    md = md.replace(/(!\[[^\]]*\]\()([^)]+\.png)(\))/g,
      (_m, pre, p, post) => pre + relative(OUT_DIR, resolve(dirname(file), p)) + post);
    const seg = rel.split('/');
    const sub = seg.length > 2 ? seg[1] : '';   // subfolder (o2c, dealers, …)
    docs.push({
      id: rel.replace(/[^\w]+/g, '-').replace(/-md$/, ''),
      group: g.label,
      sub,
      rel,
      file,
      meta,
      internal: INTERNAL_FILES.has(seg[seg.length - 1]),
      route: DOC_ROUTE[rel.split('\\').join('/')] || null,
      title: titleOf(md, seg[seg.length - 1].replace(/\.md$/, '')),
      md,
    });
  }
}

// ── Authoritative navigation — mirrors web_app/src/components/sidebar/app-sidebar.tsx
//    (data.navMain top-level modules + master-data, exact labels & order).
//    Each module resolves to its published guide by route; unmapped → "Soon".
const MODULES = [
  { route: '/dashboard/executive',   label: 'Executive Dashboard' },
  { route: '/dealer-applications',   label: 'Dealer Applications' },
  { route: '/o2c',                   label: 'Order to Cash (O2C)' },
  { route: '/finance',               label: 'Finance & Accounts' },
  { route: '/warehouse-management',  label: 'Warehouse Management' },
  { route: '/plant-production',      label: 'Plant Production' },
  { route: '/job-work',              label: 'Job Works' },
  { route: '/hrms',                  label: 'Human Resources' },
  { route: '/p2p',                   label: 'Procure to Pay (P2P)' },
  { route: '/sales-crm',             label: 'Sales CRM' },
  { route: '/crm/gamified-rebate',   label: 'Gamified Rebate' },
  { route: '/knowledge-base',        label: 'Knowledge Base' },
];
const MASTER = [
  { route: '/dealers',                         label: 'Dealers' },
  { route: '/p2p/suppliers',                   label: 'Suppliers' },
  { route: '/products',                        label: 'Products' },
  { route: '/price-lists',                     label: 'Price Lists' },
  { route: '/raw-materials',                   label: 'Raw Materials' },
  { route: '/regions',                         label: 'Regions & Territories' },
  { route: '/logistics-transport-management',  label: 'Logistics & Transport' },
  { route: '/address-book',                    label: 'Address Book' },
];

const byRoute = {};
for (const d of docs) if (d.route) byRoute[d.route] = d;
const byRel = {};
for (const d of docs) byRel[d.rel.split('\\').join('/')] = d;

// Rewrite inter-doc Markdown links for the single-file SPA:
//   • link to a PUBLISHED guide  → in-site hash route  [text](#<id>[::<anchor>])
//   • link to an unwritten/internal .md → plain text (no dead link the customer can hit)
// External (http) and image links are left untouched.
const LINK_RE = /\[([^\]]+)\]\(([^)\s]+\.md)(#[^)]*)?\)/g;
for (const d of docs) {
  // 1) Same-page anchor links ([Guides](#section)) FIRST — while the only `#…` links in the
  //    source are genuine in-page anchors — so the SPA routes to THIS doc + scrolls, instead
  //    of mistaking the fragment for a doc id and jumping to the wrong page.
  d.md = d.md.replace(/\[([^\]]+)\]\(#([A-Za-z][\w-]*)\)/g, (_m, text, frag) => `[${text}](#${d.id}::${frag})`);
  // 2) Then cross-doc .md links → in-site hash route (published) or plain text (unwritten).
  d.md = d.md.replace(LINK_RE, (m, text, target, frag) => {
    if (/^https?:/i.test(target)) return m;
    const relT = relative(DOCS, resolve(dirname(d.file), target)).split('\\').join('/');
    const t = byRel[relT];
    if (t) return `[${text}](#${t.id}${frag ? '::' + frag.slice(1) : ''})`;
    return text; // unpublished or internal target → keep the words, drop the broken link
  });
}

// taxonomy entry → linked item {label,id} when a guide exists, else {label,soon:true}
const mod = (m) => { const d = byRoute[m.route]; return d ? { label: m.label, id: d.id } : { label: m.label, soon: true }; };
// explicit published-doc entry (Get-started / Developer sections) with a nav label override
const NAV_LABEL = {
  'user-guides/README.md': 'Overview',
  'user-guides/security.md': 'Security & Trust',
  'user-guides/sales-crm/visits.md': 'Dealer Visits',
  'user-guides/sales-crm/followups.md': 'Follow-ups',
  'user-guides/sales-crm/target-management.md': 'Target Management',
  'user-guides/knowledge-base.md': 'Knowledge Base',
  'user-guides/knowledge-base/glossary.md': 'Glossary',
  'user-guides/knowledge-base/process-flows.md': 'Process Flows',
  'user-guides/knowledge-base/troubleshooting.md': 'Troubleshooting',
  'user-guides/knowledge-base/faqs.md': 'FAQs',
  'user-guides/knowledge-base/ai-assistant.md': 'AI Assistant Guide',
  'user-guides/address-book.md': 'Address Book',
  'user-guides/o2c/sales-indents.md': 'Sales Indents',
  'user-guides/o2c/sales-orders.md': 'Sales Orders',
  'user-guides/o2c/invoices.md': 'Invoices & E-Way Bills',
  'user-guides/o2c/sales-returns.md': 'Sales Returns',
  'user-guides/o2c/back-orders.md': 'Back Orders',
  'user-guides/o2c/reports.md': 'Reports (Collection & Product Sales)',
  'user-guides/use-cases/README.md': 'Common use cases',
  'user-guides/use-cases/onboard-dealer-first-order.md': 'Example: onboard & first order',
  'developer-guides/README.md': 'Architecture & conventions',
  'developer-guides/changelog.md': 'Documentation Changelog',
  'developer-guides/dealer-applications.md': 'Dealer Applications',
  'developer-guides/o2c.md': 'Order to Cash (O2C)',
  'developer-guides/p2p.md': 'Procure to Pay (P2P)',
  'developer-guides/warehouse-management.md': 'Warehouse Management',
  'developer-guides/plant-production.md': 'Plant Production',
  'developer-guides/job-works.md': 'Job Works',
  'developer-guides/hrms.md': 'Human Resources',
  'developer-guides/finance.md': 'Finance & Accounts',
  'developer-guides/dealers.md': 'Dealers',
  'developer-guides/sales-crm.md': 'Sales CRM',
  'developer-guides/products.md': 'Products',
  'developer-guides/price-lists.md': 'Price Lists',
  'developer-guides/raw-materials.md': 'Raw Materials',
  'developer-guides/regions.md': 'Regions & Territories',
  'developer-guides/logistics.md': 'Logistics & Transport',
  'developer-guides/knowledge-base.md': 'Knowledge Base (Architecture & AI Retrieval)',
  'user-guides/finance/screens.md': 'Finance — Screen Index',
  'user-guides/finance/chart-of-accounts.md': 'Chart of Accounts',
  'user-guides/finance/configuration.md': 'Finance Setup & Configuration',
  'user-guides/finance/receipts-credits-discounts.md': 'Receipts, Credits & Discounts',
  'user-guides/finance/accounts-payable.md': 'Accounts Payable',
  'user-guides/finance/payroll.md': 'Payroll Accounting',
  'user-guides/finance/van.md': 'Bank Collections (VAN)',
  'user-guides/finance/gst-compliance.md': 'GST Compliance',
  'user-guides/finance/posting-profiles.md': 'Posting Profiles',
  'user-guides/finance/fixed-assets.md': 'Fixed Assets',
  'user-guides/finance/financial-reports.md': 'Financial Reports',
  'user-guides/p2p/three-way-matching-and-payments.md': 'Three-Way Matching & Payments',
  'user-guides/plant-production/qr-and-batch-traceability.md': 'QR Labels & Batch Traceability',
  'user-guides/warehouse-management/iwt.md': 'Inter-Warehouse Transfer',
  'user-guides/warehouse-management/inventory.md': 'Managing Inventory',
  'user-guides/warehouse-management/stock-audit.md': 'Stock Audit',
};
const pub = (rel) => { const d = byRel[rel]; return d ? { label: NAV_LABEL[rel] || d.title, id: d.id } : null; };
// Sub-pages shown indented under their parent module in the Modules nav.
const SUBPAGES = {
  '/sales-crm': ['user-guides/sales-crm/visits.md', 'user-guides/sales-crm/followups.md', 'user-guides/sales-crm/target-management.md'],
  '/knowledge-base': ['user-guides/knowledge-base/glossary.md', 'user-guides/knowledge-base/process-flows.md', 'user-guides/knowledge-base/troubleshooting.md', 'user-guides/knowledge-base/faqs.md', 'user-guides/knowledge-base/ai-assistant.md'],
  '/finance': ['user-guides/finance/chart-of-accounts.md', 'user-guides/finance/configuration.md', 'user-guides/finance/receipts-credits-discounts.md', 'user-guides/finance/accounts-payable.md', 'user-guides/finance/payroll.md', 'user-guides/finance/van.md', 'user-guides/finance/gst-compliance.md', 'user-guides/finance/posting-profiles.md', 'user-guides/finance/fixed-assets.md', 'user-guides/finance/financial-reports.md', 'user-guides/finance/screens.md'],
  '/o2c': ['user-guides/o2c/sales-indents.md', 'user-guides/o2c/sales-orders.md', 'user-guides/o2c/invoices.md', 'user-guides/o2c/back-orders.md', 'user-guides/o2c/sales-returns.md', 'user-guides/o2c/reports.md'],
  '/p2p': ['user-guides/p2p/three-way-matching-and-payments.md'],
  // QR spans both modules: generated in Plant Production, scanned in Warehouse — surfaced under both.
  '/warehouse-management': ['user-guides/warehouse-management/iwt.md', 'user-guides/warehouse-management/inventory.md', 'user-guides/warehouse-management/stock-audit.md', 'user-guides/plant-production/qr-and-batch-traceability.md'],
};
const modWithSubs = (m) => { const base = mod(m); const subs = (SUBPAGES[m.route] || []).map(pub).filter(Boolean).map(s => ({ ...s, sub: true })); return [base, ...subs]; };

const NAV = [
  { section: 'Get started', items: [pub('user-guides/README.md'), pub('user-guides/security.md'), pub('user-guides/use-cases/README.md'), pub('user-guides/use-cases/onboard-dealer-first-order.md')].filter(Boolean) },
  { section: 'Modules',     items: MODULES.flatMap(modWithSubs) },
  { section: 'Master data', items: MASTER.map(mod) },
  { section: 'Developer guides', dev: true, items: [pub('developer-guides/README.md'), pub('developer-guides/changelog.md'), pub('developer-guides/dealer-applications.md'), pub('developer-guides/o2c.md'), pub('developer-guides/p2p.md'), pub('developer-guides/warehouse-management.md'), pub('developer-guides/plant-production.md'), pub('developer-guides/job-works.md'), pub('developer-guides/finance.md'), pub('developer-guides/hrms.md'), pub('developer-guides/dealers.md'), pub('developer-guides/sales-crm.md'), pub('developer-guides/products.md'), pub('developer-guides/price-lists.md'), pub('developer-guides/raw-materials.md'), pub('developer-guides/regions.md'), pub('developer-guides/logistics.md')].filter(Boolean) },
];

// Landing page = the Overview hub.
const HOME_ID = (byRel['user-guides/README.md'] || docs[0]).id;

// Internal-only docs surfaced in the header (Internal view), kept out of the module sidebar.
const INTERNAL_LABEL = {
  'user-guides/MODULE-MAP.md': 'Module Map',
  'user-guides/CAPTURE-HARNESS.md': 'Capture Harness',
};
const internalLinks = docs.filter(d => d.internal)
  .map(d => ({ label: INTERNAL_LABEL[d.rel.split('\\').join('/')] || d.title, id: d.id }));

const dataJson = JSON.stringify(docs).replace(/</g, '\\u003c');
const navJson = JSON.stringify(NAV).replace(/</g, '\\u003c');
const internalJson = JSON.stringify(internalLinks).replace(/</g, '\\u003c');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>DAEE ERP — Documentation</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
<style>
:root{
  --accent:#635bff;--accent-d:#4b45c6;--ink:#1a1f36;--body:#3c4257;--muted:#697386;
  --border:#e3e8ee;--line:#eef1f6;--bg:#fff;--code:#f6f9fc;--sidebar:#fbfcfe;
  --note:#3b82f6;--tip:#0ea371;--caution:#d97706;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:var(--body);background:var(--bg);font-size:15px;line-height:1.65;-webkit-font-smoothing:antialiased}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
code{font-family:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.86em}
/* top bar */
.topbar{position:sticky;top:0;z-index:20;height:56px;display:flex;align-items:center;gap:16px;padding:0 20px;background:rgba(255,255,255,.9);backdrop-filter:blur(8px);border-bottom:1px solid var(--border)}
.brand{font-weight:700;color:var(--ink);font-size:15px;letter-spacing:-.01em}
.brand .dot{color:var(--accent)}
.spacer{flex:1}
.toggle{display:inline-flex;border:1px solid var(--border);border-radius:8px;overflow:hidden}
.toggle button{border:0;background:#fff;color:var(--muted);padding:6px 12px;font:inherit;font-size:13px;cursor:pointer}
.toggle button.on{background:var(--accent);color:#fff}
#q{border:1px solid var(--border);border-radius:8px;padding:7px 10px;font:inherit;font-size:13px;width:200px}
/* layout */
.wrap{display:grid;grid-template-columns:280px minmax(0,1fr);align-items:start}
.side{position:sticky;top:56px;height:calc(100vh - 56px);overflow:auto;border-right:1px solid var(--border);background:var(--sidebar);padding:18px 12px 60px}
.side .grp{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:18px 10px 6px}
.side .sub{font-size:11px;font-weight:600;color:#9aa3b2;margin:10px 12px 2px;text-transform:capitalize}
.side a{display:block;padding:6px 10px;border-radius:7px;color:var(--body);font-size:13.5px;line-height:1.35}
.side a:hover{background:#eef1fb;text-decoration:none}
.side a.active{background:#ecebff;color:var(--accent-d);font-weight:600}
.side a.subitem{margin-left:12px;font-size:12.5px;color:var(--muted)}
.side .soon{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 10px;color:#9aa3b2;font-size:13.5px;line-height:1.35;cursor:default}
.side .soon .tag{font-size:9px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#9aa3b2;background:#eef1f6;border:1px solid var(--border);border-radius:999px;padding:1px 6px}
.main{display:grid;grid-template-columns:minmax(0,1fr) 240px;gap:56px;max-width:1340px;margin:0 auto;padding:44px 56px 100px}
.main.notoc{grid-template-columns:minmax(0,1fr);max-width:1000px}
.content{min-width:0}
.toc{position:sticky;top:80px;height:max-content;font-size:13px}
.toc .h{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
.toc a{display:block;color:var(--muted);padding:3px 0;border-left:2px solid var(--line);padding-left:10px}
.toc a.lvl3{padding-left:22px}
.toc a:hover{color:var(--accent)}
.toc a.active{color:var(--accent);border-left-color:var(--accent)}
/* content typography */
.content h1{font-size:2rem;font-weight:700;color:var(--ink);letter-spacing:-.02em;margin:.2em 0 .4em}
.content h2{font-size:1.4rem;font-weight:600;color:var(--ink);margin:2em 0 .6em;padding-top:1em;border-top:1px solid var(--line)}
.content h3{font-size:1.12rem;font-weight:600;color:var(--ink);margin:1.6em 0 .4em}
.content h4{font-size:1rem;font-weight:600;color:var(--ink);margin:1.3em 0 .3em}
.content p{margin:.7em 0}
/* Keep prose at a comfortable reading width; let tables / code / diagrams use the full content area. */
.content>p,.content>ul,.content>ol,.content>blockquote,.content>h1,.content>h2,.content>h3,.content>h4{max-width:780px}
.content ul,.content ol{padding-left:1.4em}.content li{margin:.3em 0}
.content blockquote{margin:1em 0;padding:12px 16px;border-left:3px solid var(--border);background:#f8fafc;border-radius:0 8px 8px 0;color:var(--body)}
.content blockquote.note{border-left-color:var(--note);background:#eff6ff}
.content blockquote.tip{border-left-color:var(--tip);background:#ecfdf5}
.content blockquote.caution{border-left-color:var(--caution);background:#fffbeb}
.content blockquote p{margin:.2em 0}
.content :not(pre)>code{background:var(--code);border:1px solid var(--line);border-radius:5px;padding:.12em .4em;color:#5b3fb8}
.content pre{background:#0a2540;color:#e6edf6;border-radius:10px;padding:16px 18px;overflow:auto;font-size:13px;line-height:1.55}
.content pre code{color:inherit;background:none;border:0;padding:0}
.content table{border-collapse:collapse;width:100%;margin:1.2em 0;font-size:13.5px;table-layout:fixed}
.content th,.content td{border:1px solid var(--border);padding:10px 14px;text-align:left;vertical-align:top;overflow-wrap:anywhere}
.content th{background:var(--code);font-weight:600;color:var(--ink)}
/* 2-col tables = short label + explanation → narrow first column; 3-col → even thirds (set per-table by column count). */
.content table.cols-2 td:first-child,.content table.cols-2 th:first-child{width:30%}
.content tr:nth-child(even) td{background:#fcfdfe}
.content hr{border:0;border-top:1px solid var(--line);margin:2em 0}
.shot{display:flex;align-items:center;gap:10px;border:1px dashed #c7d0e0;background:#f7f9fc;color:var(--muted);border-radius:10px;padding:14px 16px;margin:.8em 0;font-size:13px}
.shot .cam{font-size:18px}
.docshot{max-width:100%;height:auto;border:1px solid var(--border);border-radius:10px;box-shadow:0 1px 3px rgba(10,37,64,.08);margin:.8em 0;display:block}
.mermaid{background:#fff;border:1px solid var(--border);border-radius:10px;padding:16px;margin:1em 0;overflow:auto;text-align:center}
.badge{display:inline-block;font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;background:#ecebff;color:var(--accent-d);margin-left:8px;vertical-align:middle}
/* internal-doc links in the header (Internal view only) — visually distinct from product docs */
.intlinks{display:none;align-items:center;gap:6px;margin-left:14px;padding-left:14px;border-left:1px solid var(--border)}
.intlinks.show{display:inline-flex}
.intlinks .lbl{font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#b25a00}
.intlinks a{font-size:12.5px;color:#92400e;background:#fff7ed;border:1px solid #fed7aa;border-radius:7px;padding:3px 9px}
.intlinks a:hover{background:#ffedd5;text-decoration:none}
.intbanner{display:flex;align-items:center;gap:8px;background:#fff7ed;border:1px solid #fed7aa;color:#92400e;border-radius:10px;padding:10px 14px;margin:0 0 1.4em;font-size:13px;font-weight:500}
.metacard{display:flex;flex-wrap:wrap;gap:6px 20px;background:var(--code);border:1px solid var(--border);border-radius:10px;padding:12px 16px;margin:0 0 1.6em;font-size:12.5px;color:var(--muted);max-width:780px}
.metacard span b{color:var(--ink);font-weight:600;margin-right:4px}
.metacard .full{flex-basis:100%}
/* click-to-zoom affordance + lightbox (magnifier for diagrams & screenshots) */
.content .mermaid,.content img.docshot{cursor:zoom-in}
.lb{position:fixed;inset:0;z-index:100;background:rgba(10,37,64,.85);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px)}
.lb.hidden{display:none}
.lb-stage{width:94vw;height:90vh;overflow:hidden;cursor:grab;touch-action:none}
.lb-stage.grabbing{cursor:grabbing}
.lb-stage svg,.lb-stage img{display:block;user-select:none;-webkit-user-drag:none;background:#fff;border-radius:8px}
.lb-close{position:absolute;top:16px;right:22px;width:40px;height:40px;border:0;border-radius:50%;background:#fff;color:var(--ink);font-size:24px;line-height:1;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.25)}
.lb-hint{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);color:#fff;font-size:12px;opacity:.85;background:rgba(0,0,0,.35);padding:5px 14px;border-radius:999px}
.intbanner b{font-weight:700}
.hidden{display:none}
@media(max-width:1100px){.main{grid-template-columns:1fr}.toc{display:none}}
@media(max-width:760px){.wrap{grid-template-columns:1fr}.side{display:none}}
</style>
</head>
<body>
<div class="topbar">
  <span class="brand">DAEE ERP <span class="dot">/</span> Docs</span>
  <span class="badge" id="variant-badge">Customer</span>
  <span class="intlinks" id="intlinks"></span>
  <span class="spacer"></span>
  <input id="q" placeholder="Filter pages…" oninput="filterNav(this.value)"/>
  <span class="toggle">
    <button id="t-cust" class="on" onclick="setAudience('customer')">Customer</button>
    <button id="t-int" onclick="setAudience('internal')">Internal</button>
  </span>
</div>
<div class="wrap">
  <nav class="side" id="side"></nav>
  <div class="main">
    <article class="content" id="content"></article>
    <aside class="toc" id="toc"></aside>
  </div>
</div>
<div class="lb hidden" id="lightbox">
  <button class="lb-close" id="lb-close" aria-label="Close">×</button>
  <div class="lb-stage" id="lb-stage"></div>
  <div class="lb-hint">scroll to zoom · drag to pan · Esc to close</div>
</div>
<script>const DOCS = ${dataJson}; const NAV = ${navJson}; const HOME_ID = ${JSON.stringify(HOME_ID)}; const INTERNAL_LINKS = ${internalJson};</script>
<script>
let audience = 'customer';
mermaid.initialize({ startOnLoad:false, theme:'neutral', securityLevel:'loose' });

// GitHub-style heading slug so authored anchors (e.g. #pages--buttons) match generated ids.
function slug(s){return s.toLowerCase().replace(/[^\\w\\s-]/g,'').trim().replace(/\\s/g,'-');}
function stripInternal(md){ return md.replace(/<!--\\s*INTERNAL:START\\s*-->[\\s\\S]*?<!--\\s*INTERNAL:END\\s*-->/g,''); }

function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;');}
function buildNav(){
  const side = document.getElementById('side');
  let html='';
  for(const sec of NAV){
    if(sec.dev && audience==='customer') continue;       // developer guides hidden from customers
    const items=(sec.items||[]).filter(Boolean);
    if(!items.length) continue;
    html+='<div class="grp">'+esc(sec.section)+'</div>';
    for(const it of items){
      if(it.id) html+='<a class="'+(it.sub?'subitem':'')+'" data-id="'+it.id+'" href="#'+it.id+'">'+esc(it.label)+'</a>';
      else html+='<div class="soon" title="Documentation in progress"><span>'+esc(it.label)+'</span><span class="tag">Soon</span></div>';
    }
  }
  side.innerHTML=html;
  document.querySelectorAll('#side a').forEach(a=>a.classList.toggle('active',a.dataset.id===current));
}
function buildInternalLinks(){
  const box=document.getElementById('intlinks');
  if(!INTERNAL_LINKS.length){ box.innerHTML=''; return; }
  box.innerHTML='<span class="lbl">Internal docs</span>'+
    INTERNAL_LINKS.map(l=>'<a data-id="'+l.id+'" href="#'+l.id+'">'+esc(l.label)+'</a>').join('');
}
function applyChrome(){ document.getElementById('intlinks').classList.toggle('show', audience==='internal'); }
function filterNav(q){
  q=q.toLowerCase();
  document.querySelectorAll('#side a, #side .soon').forEach(el=>{
    el.style.display = el.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}
function setAudience(a){
  audience=a;
  document.getElementById('t-cust').classList.toggle('on',a==='customer');
  document.getElementById('t-int').classList.toggle('on',a==='internal');
  document.getElementById('variant-badge').textContent = a==='customer'?'Customer':'Internal';
  buildNav();          // re-render nav so the Developer guides section shows/hides
  applyChrome();       // show/hide the header Internal-docs links
  render(current);
}
let current=null;
function render(id){
  const d = DOCS.find(x=>x.id===id) || DOCS[0];
  current = d.id;
  let md = audience==='customer' ? stripInternal(d.md) : d.md;
  const content = document.getElementById('content');
  const banner = d.internal ? '<div class="intbanner">🔒 <span><b>Internal documentation</b> — for the DAEE team. Not part of the customer guide.</span></div>' : '';
  let metaCard = '';
  if (d.meta) {
    const m = d.meta, chip = (k, v) => v ? '<span><b>' + k + '</b> ' + esc(v) + '</span>' : '';
    const row = chip('Doc ID', m.doc_id) + chip('Version', m.version) + chip('Status', m.status) +
      chip('Classification', m.classification) + chip('Owner', m.owner) +
      chip('Updated', m.last_updated) + chip('Next review', m.next_review) +
      (m.reviewers ? '<span class="full"><b>Reviewers</b> ' + esc(m.reviewers) + '</span>' : '');
    if (row) metaCard = '<div class="metacard">' + row + '</div>';
  }
  content.innerHTML = banner + metaCard + marked.parse(md);
  // screenshot placeholders
  content.querySelectorAll('img').forEach(img=>{
    img.loading='lazy';
    img.classList.add('docshot');
    // If the screenshot isn't captured yet, fall back to a labelled placeholder card.
    img.addEventListener('error',()=>{
      const box=document.createElement('div');
      box.className='shot';
      box.innerHTML='<span class="cam">📷</span><span><b>Screenshot pending:</b> '+(img.alt||'')+' <i>(run npm run docs:capture)</i></span>';
      img.replaceWith(box);
    },{once:true});
  });
  // tag tables by column count so 2-col (label/explanation) and 3-col (even thirds) lay out well
  content.querySelectorAll('table').forEach(t=>{
    const n=(t.querySelector('tr')||{}).children?.length||0;
    if(n) t.classList.add('cols-'+n);
  });
  // mermaid blocks
  content.querySelectorAll('pre > code.language-mermaid').forEach(code=>{
    const div=document.createElement('div'); div.className='mermaid'; div.textContent=code.textContent;
    code.parentElement.replaceWith(div);
  });
  // callouts
  content.querySelectorAll('blockquote').forEach(bq=>{
    const t=bq.textContent.trim().toLowerCase();
    // Drop internal provenance/meta lines from the rendered docs.
    if(t.startsWith('audience:')||t.startsWith('verified:')||t.startsWith('status:')){ bq.remove(); return; }
    if(t.startsWith('note')) bq.classList.add('note');
    else if(t.startsWith('tip')) bq.classList.add('tip');
    else if(t.startsWith('caution')||t.startsWith('warning')) bq.classList.add('caution');
  });
  // heading anchors + TOC
  const toc=['<div class="h">On this page</div>'];
  content.querySelectorAll('h2,h3').forEach(h=>{
    const id=slug(h.textContent); h.id=id;
    toc.push('<a class="'+(h.tagName==='H3'?'lvl3':'')+'" href="#'+current+'::'+id+'">'+h.textContent+'</a>');
  });
  document.getElementById('toc').innerHTML = toc.length>1 ? toc.join('') : '';
  // Collapse the right rail (and re-center content) on pages with no on-this-page links.
  document.querySelector('.main').classList.toggle('notoc', toc.length<=1);
  try{ mermaid.run({ querySelector:'.mermaid' }); }catch(e){}
  document.querySelectorAll('#side a').forEach(a=>a.classList.toggle('active',a.dataset.id===current));
  window.scrollTo(0,0);
}
// ── magnifier / lightbox: click a diagram or screenshot → zoom & pan ──
function openLightbox(node){
  const lb=document.getElementById('lightbox'), stage=document.getElementById('lb-stage');
  stage.innerHTML='';
  const clone=node.cloneNode(true);
  clone.classList.remove('mermaid','docshot');
  clone.style.maxWidth='none'; clone.style.maxHeight='none'; clone.style.margin='0'; clone.style.boxShadow='none'; clone.style.border='0';
  stage.appendChild(clone);
  lb.classList.remove('hidden');
  let scale=1, tx=0, ty=0, drag=false, sx=0, sy=0;
  const apply=()=>{ clone.style.transformOrigin='0 0'; clone.style.transform='translate('+tx+'px,'+ty+'px) scale('+scale+')'; };
  requestAnimationFrame(()=>{
    const sr=stage.getBoundingClientRect(), cr=clone.getBoundingClientRect();
    const cw=cr.width||1, ch=cr.height||1;
    scale=Math.min(sr.width/cw, sr.height/ch, 1.5)||1;
    tx=(sr.width-cw*scale)/2; ty=(sr.height-ch*scale)/2; apply();
  });
  stage.onwheel=(e)=>{ e.preventDefault(); const r=stage.getBoundingClientRect(), mx=e.clientX-r.left, my=e.clientY-r.top;
    const f=e.deltaY<0?1.15:1/1.15, ns=Math.min(12,Math.max(0.1,scale*f));
    tx=mx-(mx-tx)*(ns/scale); ty=my-(my-ty)*(ns/scale); scale=ns; apply(); };
  stage.onpointerdown=(e)=>{ drag=true; sx=e.clientX-tx; sy=e.clientY-ty; stage.classList.add('grabbing'); stage.setPointerCapture(e.pointerId); };
  stage.onpointermove=(e)=>{ if(drag){ tx=e.clientX-sx; ty=e.clientY-sy; apply(); } };
  stage.onpointerup=stage.onpointercancel=()=>{ drag=false; stage.classList.remove('grabbing'); };
}
function closeLightbox(){ const lb=document.getElementById('lightbox'); lb.classList.add('hidden'); document.getElementById('lb-stage').innerHTML=''; }
document.getElementById('content').addEventListener('click', e=>{ const t=e.target.closest('.mermaid, img.docshot'); if(t) openLightbox(t); });
document.getElementById('lb-close').addEventListener('click', closeLightbox);
document.getElementById('lightbox').addEventListener('click', e=>{ if(e.target.id==='lightbox') closeLightbox(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeLightbox(); });

function onHash(){
  const raw=decodeURIComponent(location.hash.slice(1));
  const [id,anchor]=raw.split('::');
  if(id && id!==current) render(id);
  if(anchor){ const el=document.getElementById(anchor); if(el) el.scrollIntoView({behavior:'smooth'}); }
  else if(!id) render(HOME_ID);
}
buildNav();
buildInternalLinks();
applyChrome();
window.addEventListener('hashchange',onHash);
onHash();
if(!location.hash) render(HOME_ID);
</script>
</body>
</html>`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'index.html'), html, 'utf8');
console.log(`✅ Built ${docs.length} pages → ${relative(ROOT, join(OUT_DIR, 'index.html'))}`);
console.log(docs.map(d => `   • [${d.group}] ${d.title}`).join('\n'));
