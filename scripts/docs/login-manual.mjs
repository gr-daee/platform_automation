#!/usr/bin/env node
/**
 * One-time MANUAL login → saves a Playwright storageState the docs capture reuses.
 * Use this when the automated TOTP login (global.setup) is flaky: you log in by hand
 * (email + password + authenticator code) in a real browser, then we snapshot the session.
 *
 *   node scripts/docs/login-manual.mjs              # persona iacs-md (default)
 *   node scripts/docs/login-manual.mjs --persona super-admin
 *
 * Then:  DOCS_CAPTURE_PERSONA=<persona> npm run docs:capture && npm run docs:site
 */
try { await import('dotenv/config'); } catch {}
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BASE = (process.env.TEST_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const persona = process.argv.includes('--persona') ? process.argv[process.argv.indexOf('--persona') + 1] : 'iacs-md';
const out = join(ROOT, 'e2e', '.auth', `${persona}.json`);

const browser = await chromium.launch({ headless: false });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });

console.log(`\n🌐 ${BASE}/login opened in a browser window.`);
console.log(`👉 Log in manually: email + password + authenticator (TOTP) code.`);
console.log(`   When you can see the app (logged in), come back here and press ENTER.\n`);

await new Promise((resolve) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Press ENTER once you are logged in… ', () => { rl.close(); resolve(); });
});

mkdirSync(dirname(out), { recursive: true });
await ctx.storageState({ path: out });
console.log(`\n✅ Saved session → ${out.replace(ROOT + '/', '')}`);
console.log(`Next:  DOCS_CAPTURE_PERSONA=${persona} npm run docs:capture && npm run docs:site`);
await browser.close();
