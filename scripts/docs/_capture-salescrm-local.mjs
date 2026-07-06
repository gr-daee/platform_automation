// Sales CRM capture from localhost:3000 (DAEE-499 dev server) → web_app VitePress public.
import { chromium } from '@playwright/test';
import * as OTP from 'otpauth';
import { mkdirSync } from 'node:fs';
const BASE = 'http://localhost:3000';
const EMAIL=process.env.IACS_MD_USER_EMAIL, PASS=process.env.IACS_MD_USER_PASSWORD, SECRET=process.env.IACS_MD_USER_TOTP_SECRET;
const OUT='/Users/pavana21/projects/web_app/docs/public/screenshots/sales-crm';
const totp=new OTP.TOTP({algorithm:'SHA1',digits:6,period:30,secret:OTP.Secret.fromBase32(SECRET)});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
mkdirSync(OUT,{recursive:true});

async function settle(p){ await p.waitForLoadState('networkidle').catch(()=>{}); await p.waitForTimeout(1500);
  await p.waitForFunction(()=>!document.querySelector('.animate-spin,[class*="spin"],[aria-busy="true"],[role="status"]'),{timeout:15000}).catch(()=>{}); await p.waitForTimeout(700); }
async function redact(p){ await p.evaluate(()=>{const mask=s=>s.replace(/([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+(\.[A-Za-z]{2,})/g,'$1•••@•••$2').replace(/(\+?91[\s-]?)?([6-9]\d{9})\b/g,(_m,p,n)=>(p?'+91 ':'')+n.slice(0,2)+'••••••'+n.slice(-2));
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const ns=[];let n;while((n=w.nextNode()))ns.push(n);for(const x of ns){const t=x.nodeValue;if(t&&/[@\d]/.test(t)){const m=mask(t);if(m!==t)x.nodeValue=m;}}}).catch(()=>{}); }

const browser=await chromium.launch();
const ctx=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});
const page=await ctx.newPage();
// ---- login (resilient: handles MFA or direct sign-in) ----
await page.goto(`${BASE}/login`,{waitUntil:'domcontentloaded',timeout:45000});
await page.waitForTimeout(800);
const emailIn=page.getByPlaceholder(/enter your email|email/i).first();
const passIn=page.getByPlaceholder(/enter your password|password/i).first();
await emailIn.click(); await emailIn.fill(EMAIL);
await passIn.click(); await passIn.fill(PASS);
await page.waitForTimeout(200);
const ev=await emailIn.inputValue().catch(()=>''); console.log('email filled:', ev? 'yes':'NO');
await page.getByRole('button',{name:/^sign in/i}).first().click().catch(()=>{});
let ok=false;
await sleep(2500);
// "Verify Identity" MFA step: code field has placeholder 000000, label "Verification Code", button "Verify Code"
const onMfa = await page.getByText(/verify identity|authenticator app/i).first().isVisible().catch(()=>false);
if(!onMfa && !/\/login/.test(page.url())){ ok=true; console.log('LOGGED IN (no MFA / direct)'); }
else if(onMfa){
  const totpInput=page.getByPlaceholder('000000').or(page.getByLabel(/verification code/i)).or(page.locator('input[type=text]:visible, input[inputmode]')).first();
  for(let a=1;a<=4&&!ok;a++){ const w=Math.floor(Date.now()/1000)%30; if(w>22){await sleep((31-w)*1000);}
    const code=totp.generate(); await totpInput.click().catch(()=>{}); await totpInput.fill('').catch(()=>{}); await totpInput.pressSequentially(code,{delay:60}); await sleep(300);
    const v=page.getByRole('button',{name:/verify code|verify/i}).first(); if(await v.isEnabled().catch(()=>false)) await v.click().catch(()=>{});
    try{ await page.waitForFunction(()=>!/verify identity/i.test(document.body.innerText),{timeout:9000}); ok=true; }catch{ console.log(`  totp attempt ${a} no pass`);} }
  if(ok) console.log('LOGGED IN (MFA)');
} else {
  try{ await page.waitForFunction(()=>!/\/login/.test(location.pathname),{timeout:8000}); ok=true; console.log('LOGGED IN (delayed)'); }catch{}
}
if(!ok){ console.log('LOGIN FAILED at',page.url()); await page.screenshot({path:`${OUT}/_login-debug.png`}); console.log('saved _login-debug.png'); await browser.close(); process.exit(1); }

// ---- shots: [route, file, openFirstRow?] ----
const shots=[
  ['/sales-crm/sales-categories','sales-categories-list',false],
  ['/sales-crm/sales-categories','sales-category-detail',true],
  ['/sales-crm/reports/revenue-by-category','revenue-by-category',false],
  ['/sales-crm/leads','leads-list',false],
  ['/sales-crm/leads','lead-detail',true],
  ['/sales-crm/visits','visits-list',false],
  ['/sales-crm/target-management/budget-cycles','budget-cycles',false],
  ['/sales-crm/target-management/budget-distribution','budget-distribution',false],
  ['/sales-crm/target-management/my-sales-plan','my-sales-plan',false],
  ['/sales-crm/target-management/performance','performance',false],
  ['/sales-crm/target-management/kpi-catalogue','kpi-catalogue',false],
];
let okc=0,bad=0;
for(const [route,file,openRow] of shots){
  try{
    await page.goto(BASE+route,{waitUntil:'domcontentloaded',timeout:45000}); await settle(page);
    if(openRow){ const row=page.locator('table tbody tr a, table tbody tr [role="link"], table tbody tr').first();
      if(await row.count()){ await row.click({timeout:6000}).catch(()=>{}); await settle(page);} }
    const info=await page.evaluate(()=>({url:location.pathname,len:(document.body.innerText||'').replace(/\s/g,'').length,denied:/access denied|not authori|forbidden|do not have permission/i.test(document.body.innerText)}));
    await redact(page);
    await page.screenshot({path:`${OUT}/${file}.png`});
    const flag = info.url.includes('/login')?'LOGIN-REDIR':info.denied?'DENIED':info.len<200?'EMPTY':'ok';
    if(flag==='ok')okc++; else bad++;
    console.log(`  ${flag==='ok'?'✓':'⚠'} ${file}  [${flag}]  ${route}`);
  }catch(e){ bad++; console.log(`  ✗ ${file} — ${e.message.split('\n')[0]}`); }
}
console.log(`\nSales CRM shots: ${okc} ok · ${bad} need attention → ${OUT}`);
await browser.close();
