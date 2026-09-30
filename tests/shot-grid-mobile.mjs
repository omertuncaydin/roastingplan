// v11b: phone (390) and iPad (768/1024) render the same card grid as the desktop: filter chips row · race · welcome · Vitrin grid · session card at the bottom
import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname);
const html=fs.readFileSync(path.join(here,'..','grupal.html'),'utf8');
const MD=JSON.parse(fs.readFileSync(path.join(here,'mock-meydan.json'),'utf8'));
const ord=MD.offers.slice().sort((a,b)=>((b.dep||0)-(a.dep||0)));
const MH=JSON.parse(JSON.stringify(MD)); const base={url:'https://coffeenutz.net/cart/222:1',price:1280,base:2,sold:0,inv:0,left:2,green_left:null,table:[],roast_at:'2026-10-05T20:59:00.000Z'};
for(const k of [0,1,2,3,4,5]){ const o=MH.offers.find(x=>x.id===ord[k].id); o.img_url='https://x.test/o/'+k+'.jpg'; o.hemen={...base}; o.list_tl=1600; o.jury_tl=960; o.basket_tl=1280; }
{ const o=MH.offers.find(x=>x.id===ord[1].id); o.name='El Recreo'; o.dep=0; o.conv=17; o.won_at='2026-09-30T09:00:00Z'; o.lock={at:'2026-09-30T09:00:00Z',n:3,dep:17,dep_tl:100,state:'locked',forced:true,close:'2026-10-05T20:59:00Z'}; }
MH.offer_cfg.hemen_inv=2; MH.offer_cfg.hemen_inv_h=24;
const photo=fs.existsSync(path.join(here,'..','..','_shots','fakephoto.b64'))?fs.readFileSync(path.join(here,'..','..','_shots','fakephoto.b64'),'utf8'):'';
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const OUT=path.join(here,'..','..','_shots'); fs.mkdirSync(OUT,{recursive:true}); let bad=0;
async function run(width,height,file,opts={}){
  const mobile=width<1000; const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:2,locale:'tr-TR',isMobile:mobile,hasTouch:mobile}); await ctx.addInitScript(()=>{ try{ localStorage.clear(); localStorage.setItem('grupal_welcomed','1'); localStorage.setItem('grupal_waok','1'); }catch(e){} });
  const page=await ctx.newPage();
  await page.route('**/*',async route=>{ const u=route.request().url();
    if(u.startsWith('https://grup-al.com/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
    if(u.includes('x.test/o/')) return photo?route.fulfill({status:200,contentType:'image/jpeg',body:Buffer.from(photo.split(',')[1],'base64')}):route.fulfill({status:404,body:''});
    if(u.includes('/meydan')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(MH)});
    if(u.includes('/offer-mine')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({votes:[{id:ord[1].id,paid:true,qty:2,conv:true,done:false}],inv:[],hemen:[],me:{member:true,name:'Ömer Aydın',wa:true,ok:true}})});
    if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'}); return route.fulfill({status:204,body:''}); });
  await page.goto('https://grup-al.com/juri'); await page.waitForTimeout(1200);
  if(opts.open){ await page.evaluate(id=>jLaneOpen(id),ord[1].id); await page.waitForTimeout(500); await page.evaluate(id=>{ document.querySelector('.jcard[data-id="'+id+'"]').scrollIntoView({block:'start'}); window.scrollBy(0,-70); },ord[1].id); await page.waitForTimeout(300); }
  if(opts.drawer){ await page.evaluate(id=>jDeskOpen(id),ord[1].id); await page.waitForTimeout(500); }
  if(opts.basket){ await page.evaluate(id=>dbAdd(id,1),ord[0].id); await page.waitForTimeout(400); }
  const m=await page.evaluate(()=>({ jdesk:document.body.classList.contains('jdesk'), narrow:document.body.classList.contains('jnarrow'), deck:!!document.getElementById('jDeck'), grid:document.querySelectorAll('.jdk-grid .jcard').length, cols:(()=>{ const cs=[...document.querySelectorAll('.jdk-grid .jcard')].slice(0,6); const lefts=new Set(cs.map(c=>Math.round(c.getBoundingClientRect().left))); return lefts.size; })(), filt:!!document.querySelector('.jdk-filt'), filtRow:(()=>{ const f=document.querySelector('.jdk-filt'); if(!f) return 0; return new Set([...f.querySelectorAll('.jdk-f')].map(b=>Math.round(b.getBoundingClientRect().top))).size; })(), sessBelow:(()=>{ const s=document.querySelector('.jdk-sess'), g=document.querySelector('.jdk-grid'); return !!(s&&g)&&s.getBoundingClientRect().top>g.getBoundingClientRect().top; })(), hscroll:document.documentElement.scrollWidth>document.documentElement.clientWidth, ovf:(()=>{ const W=document.documentElement.clientWidth; const out=[]; for(const el of document.querySelectorAll('body *')){ const r=el.getBoundingClientRect(); if(r.width>0&&r.right>W+1&&getComputedStyle(el).position!=='fixed'&&!el.closest('.jdk-filt')) out.push(el.tagName+'.'+String(el.className).slice(0,30)+'#'+el.id+':'+Math.round(r.right)); } return out.slice(0,6); })(), chip:document.getElementById('bindChip').textContent, drawerW:(()=>{ const d=document.getElementById('jDrawer'); return d?Math.round(d.getBoundingClientRect().width):0; })(), bar:(()=>{ const b=document.getElementById('dbBar'); if(!b||b.style.display==='none') return null; const r=b.getBoundingClientRect(); return [Math.round(r.left),Math.round(r.width)]; })() }));
  console.log(width+'px', JSON.stringify(m)); if(!m.jdesk||m.deck||m.hscroll||!m.filt||(width<960&&(m.filtRow!==1||!m.sessBelow))||(opts.basket&&(!m.bar||m.bar[0]!==0||m.bar[1]!==width))||(opts.drawer&&width<960&&m.drawerW!==width)) bad++;
  await page.screenshot({path:path.join(OUT,file),fullPage:!!opts.full}); await ctx.close(); }
await run(390,844,'grid_phone.png',{full:true}); await run(390,844,'grid_phone_open.png',{open:true}); await run(390,844,'grid_phone_drawer.png',{drawer:true}); await run(390,844,'grid_phone_basket.png',{basket:true});
await run(768,1024,'grid_ipad.png'); await run(1024,768,'grid_ipad_land.png'); await run(1366,900,'grid_desk.png');
await browser.close(); console.log(bad?'FAIL':'ok'); process.exit(bad?1:0);
