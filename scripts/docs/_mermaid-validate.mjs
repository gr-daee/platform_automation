import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const FILES = [
  'docs/developer-guides/dealer-applications.md',
  'docs/developer-guides/o2c.md',
  'docs/developer-guides/p2p.md',
  'docs/developer-guides/warehouse-management.md',
  'docs/developer-guides/plant-production.md',
  'docs/developer-guides/job-works.md',
  'docs/developer-guides/finance.md',
  'docs/developer-guides/hrms.md',
  'docs/developer-guides/README.md',
  'docs/developer-guides/dealers.md',
  'docs/developer-guides/sales-crm.md',
  'docs/developer-guides/products.md',
  'docs/developer-guides/price-lists.md',
  'docs/developer-guides/raw-materials.md',
  'docs/developer-guides/regions.md',
  'docs/developer-guides/logistics.md',
];
// extract mermaid blocks with the nearest preceding heading
function blocks(md){
  const out=[]; const lines=md.split('\n'); let head='(top)';
  for(let i=0;i<lines.length;i++){
    const hm=lines[i].match(/^#{1,6}\s+(.+)/); if(hm) head=hm[1].trim();
    if(lines[i].trim()==='```mermaid'){ const buf=[]; i++; while(i<lines.length && lines[i].trim()!=='```'){buf.push(lines[i]);i++;} out.push({head,code:buf.join('\n')}); }
  }
  return out;
}
const all=[];
for(const f of FILES){ let md; try{md=readFileSync(join(ROOT,f),'utf8');}catch{continue;} for(const b of blocks(md)) all.push({file:f.split('/').pop(),...b}); }
const browser=await chromium.launch();
const page=await browser.newContext().newPage? await (await browser.newContext()).newPage() : await browser.newPage();
await page.setContent('<!doctype html><html><body><script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script></body></html>', {waitUntil:'networkidle'});
await page.waitForFunction(()=>!!window.mermaid, {timeout:15000});
await page.evaluate(()=>mermaid.initialize({startOnLoad:false,securityLevel:'loose'}));
let pass=0,fail=0;
for(let i=0;i<all.length;i++){
  const b=all[i];
  const res=await page.evaluate(async (code)=>{ try{ await mermaid.parse(code); return {ok:true}; }catch(e){ return {ok:false,err:(e&&e.message||String(e)).split('\n').slice(0,4).join(' | ')}; } }, b.code);
  if(res.ok){pass++; /*console.log("  ✓ ["+b.file+"] "+b.head);*/}
  else{fail++; console.log("✗ ["+b.file+"] §"+b.head+"\n   ERR: "+res.err+"\n   first line: "+b.code.split('\n').find(l=>l.trim())); }
}
console.log("\nMermaid blocks: "+all.length+" | pass: "+pass+" | FAIL: "+fail);
await browser.close();
