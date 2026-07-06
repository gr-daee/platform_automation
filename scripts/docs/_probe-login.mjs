// TEMP probe: automated staging login with TOTP window-boundary handling + retries.
import { chromium } from '@playwright/test';
import * as OTP from 'otpauth';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BASE = (process.env.TEST_BASE_URL || '').replace(/\/+$/, '');
const EMAIL = process.env.IACS_MD_USER_EMAIL;
const PASS = process.env.IACS_MD_USER_PASSWORD;
const SECRET = process.env.IACS_MD_USER_TOTP_SECRET;
const out = join(ROOT, 'e2e', '.auth', 'iacs-md.json');
const totp = new OTP.TOTP({ algorithm: 'SHA1', digits: 6, period: 30, secret: OTP.Secret.fromBase32(SECRET) });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

console.log('BASE=', BASE, 'EMAIL=', EMAIL, 'secretLen=', SECRET?.length);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });

await page.locator('input[type=email], input[name=email], #email').first().fill(EMAIL);
await page.locator('input[type=password]').first().fill(PASS);
await page.getByRole('button', { name: /sign in/i }).first().click();

const totpInput = page.locator('input#verify-code, input#totp-code, input[autocomplete="one-time-code"], input[inputmode="numeric"]').first();
await totpInput.waitFor({ state: 'visible', timeout: 30000 });
console.log('reached TOTP step');

let loggedIn = false;
for (let attempt = 1; attempt <= 3 && !loggedIn; attempt++) {
  // start each attempt early in a fresh 30s window so the code can't expire mid-submit
  const intoWin = Math.floor(Date.now() / 1000) % 30;
  if (intoWin > 22) { console.log(`  waiting ${30 - intoWin}s for fresh window…`); await sleep((31 - intoWin) * 1000); }
  const code = totp.generate();
  console.log(`  attempt ${attempt}: code=${code} (t+${Math.floor(Date.now()/1000)%30}s)`);
  await totpInput.click();
  await totpInput.fill('');
  await totpInput.pressSequentially(code, { delay: 50 });
  await sleep(300);
  // some apps auto-submit on 6th digit; otherwise click Verify
  const verify = page.getByRole('button', { name: /verify/i }).first();
  if (await verify.isEnabled().catch(() => false)) await verify.click().catch(() => {});
  // wait for navigation away from the verify screen
  try { await page.waitForFunction(() => !/verify identity/i.test(document.body.innerText), { timeout: 8000 }); loggedIn = true; }
  catch { console.log('   still on verify screen; current url:', page.url()); }
}

if (loggedIn) {
  await page.waitForLoadState('networkidle').catch(() => {});
  mkdirSync(dirname(out), { recursive: true });
  await ctx.storageState({ path: out });
  console.log('✅ LOGGED IN — saved', out.replace(ROOT + '/', ''), '| url:', page.url());
} else {
  console.log('❌ login did not pass TOTP after retries. url:', page.url());
  await page.screenshot({ path: join(ROOT, 'e2e', '.auth', 'probe-fail.png') });
}
await browser.close();
process.exit(loggedIn ? 0 : 1);
