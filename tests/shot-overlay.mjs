// v10p: desktop 1366 — open card overlays the card below; nothing moves. Two shots: closed / open (same scroll), plus position diff.
import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname);
const html=fs.readFileSync(path.join(here,'..','grupal.html'),'utf8');
const MD=JSON.parse(fs.readFileSync(path.join(here,'mock-meydan.json'),'utf8'));
const ord=MD.offers.slice().sort((a,b)=>((b.dep||0)-(a.dep||0)));
const MH=JSON.parse(JSON.stringify(MD)); const base={url:'https://coffeenutz.net/cart/222:1',price:1280,base:2,sold:0,inv:0,left:2,green_left:null,table:[],roast_at:'2026-10-05T20:59:00.000Z'};
for(const k of [0,1,2,3,4,5]){ const o=MH.offers.find(x=>x.id===ord[k].id); o.img_url='https://x.test/o/'+k+'.jpg'; o.hemen={...base}; o.list_tl=1600; o.jury_tl=960; o.basket_tl=1280; }
MH.offer_cfg.hemen_inv=2; MH.offer_cfg.hemen_inv_h=24;
const photo=fs.existsSync(path.join(here,'..','..','_shots','fakephoto.b64'))?fs.readFileSync(path.join(here,'..','..','_shots','fakephoto.b64'),'utf8'):'';
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const OUT=path.join(here,'..','..','_shots'); fs.mkdirSync(OUT,{recursive:true});
const ctx=await browser.newContext({viewport:{width:1366,height:900},deviceScaleFactor:1.5,locale:'tr-TR'}); await ctx.addInitScript(()=>{ try{ localStorage.clear(); localStorage.setItem('grupal_welcomed','1'); localStorage.setItem('grupal_jdv','cards'); }catch(e){} }); const page=await ctx.newPage();
await page.route('**/*',async route=>{ const u=route.request().url();
  if(u.startsWith('https://grup-al.com/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
  if(u.includes('x.test/o/')) return photo?route.fulfill({status:200,contentType:'image/jpeg',body:Buffer.from(photo.split(',')[1],'base64')}):route.fulfill({status:404,body:''});
  if(u.includes('/meydan')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(MH)});
  if(u.includes('/offer-mine')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({votes:[{id:ord[0].id,paid:true,qty:2}],inv:[],hemen:[],me:{member:true,wa:true,ok:true}})});
  if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'}); return route.fulfill({status:204,body:''}); });
await page.goto('https://grup-al.com/juri'); await page.waitForTimeout(1200);
const pos=async()=>page.evaluate(()=>[...document.querySelectorAll('.jdk-grid .jcard, .jdk-sub')].map(c=>{ const r=c.getBoundingClientRect(); return [c.dataset.id||c.textContent.trim().slice(0,12), Math.round(r.top), Math.round(r.height)]; }));
const before=await pos(); await page.screenshot({path:path.join(OUT,'ov1_closed.png')});
await page.evaluate(id=>jLaneOpen(id),ord[1].id); await page.waitForTimeout(900);
const after=await pos(); await page.screenshot({path:path.join(OUT,'ov2_open.png')});
const open=await page.evaluate(()=>{ const c=document.querySelector('.jcard.lopen'); const b=c.querySelector('.jbody').getBoundingClientRect(); const r=c.getBoundingClientRect(); return {card:Math.round(r.height),body:Math.round(b.height),bodyBottomBeyondCard:Math.round(b.bottom-r.bottom)}; });
const moved=before.filter((p,i)=>!after[i]||p[1]!==after[i][1]||p[2]!==after[i][2]);
console.log(JSON.stringify({moved,open}));
await page.mouse.click(700,860); await page.waitForTimeout(300); const closed=await page.evaluate(()=>!document.querySelector('.jcard.lopen')); console.log('click outside closed:',closed);
await browser.close(); if(moved.length||!closed||open.bodyBottomBeyondCard<100){ console.log('FAIL'); process.exit(1); } console.log('ok');
