// v11e: the in-card lane panel must NOT re-animate when the page re-renders (30 s refresh / basket change); the page must not auto-scroll to a "page" after a small scroll
import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname);
const html=fs.readFileSync(path.join(here,'..','grupal.html'),'utf8');
const MD=JSON.parse(fs.readFileSync(path.join(here,'mock-meydan.json'),'utf8'));
const ord=MD.offers.slice().sort((a,b)=>((b.dep||0)-(a.dep||0)));
const MH=JSON.parse(JSON.stringify(MD)); const base={url:'https://coffeenutz.net/cart/222:1',price:1280,base:2,sold:0,inv:0,left:2,green_left:null,table:[],roast_at:'2026-10-05T20:59:00.000Z'};
for(const k of [0,1,2]){ const o=MH.offers.find(x=>x.id===ord[k].id); o.img_url='https://x.test/o/'+k+'.jpg'; o.hemen={...base}; o.list_tl=1600; o.jury_tl=960; o.basket_tl=1280; }
MH.offer_cfg.hemen_inv=2; MH.offer_cfg.hemen_inv_h=24;
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,locale:'tr-TR',isMobile:true,hasTouch:true}); await ctx.addInitScript(()=>{ try{ localStorage.clear(); localStorage.setItem('grupal_welcomed','1'); localStorage.setItem('grupal_waok','1'); }catch(e){} });
const page=await ctx.newPage();
await page.route('**/*',async route=>{ const u=route.request().url();
  if(u.startsWith('https://grup-al.com/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
  if(u.includes('/meydan')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(MH)});
  if(u.includes('/offer-mine')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({votes:[],inv:[],hemen:[],me:{member:true,name:'Ömer',wa:true,ok:true}})});
  if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'}); return route.fulfill({status:204,body:''}); });
await page.goto('https://grup-al.com/juri'); await page.waitForTimeout(1100);
await page.evaluate(id=>{ jLaneOpen(id); jLaneKap(id); },ord[0].id); await page.waitForTimeout(1800);   // open + one kapora → "+1 sen" chip fully shown
const probe=()=>page.evaluate(()=>{ const c=document.querySelector('.jcard.lopen'); const w=c.querySelector('.jlanes-w'); const you=c.querySelector('.jmtx .you'); const cs=getComputedStyle(you); return {rows:getComputedStyle(w).gridTemplateRows, youOp:cs.opacity, youTr:cs.transform, cls:w.className}; });
const before=await probe();
await page.evaluate(()=>renderOffers(STATE)); const t0=await probe(); await page.waitForTimeout(120); const t1=await probe();   // re-render: everything must already be at its end state
console.log(JSON.stringify({before,t0,t1}));
const stable=before.youOp===t0.youOp&&t0.youOp===t1.youOp&&t0.youTr===before.youTr&&/plus/.test(t0.cls)&&/opened/.test(t0.cls)&&!/0px/.test(t0.rows)&&t0.rows===before.rows;
// no page paging: scroll 140 px, wait, position must stay
await page.evaluate(()=>{ jLaneClose(); window.scrollTo(0,140); }); await page.waitForTimeout(700); const y=await page.evaluate(()=>window.scrollY);
console.log('scrollY after 140px + 700ms:', y);
await browser.close(); const ok=stable&&Math.abs(y-140)<3; console.log(ok?'ok':'FAIL'); process.exit(ok?0:1);
