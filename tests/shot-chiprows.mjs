// v10w: chip rows on a locked card (status + CTA + Detay/Kahveye git + Hemen-Al + davetiye) must fit in ≤ 2 rows — desktop grid widths and phones
import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname);
const html=fs.readFileSync(path.join(here,'..','grupal.html'),'utf8');
const MD=JSON.parse(fs.readFileSync(path.join(here,'mock-meydan.json'),'utf8'));
const ord=MD.offers.slice().sort((a,b)=>((b.dep||0)-(a.dep||0)));
const MH=JSON.parse(JSON.stringify(MD)); const base={url:'https://coffeenutz.net/cart/222:1',price:990,base:4,sold:0,inv:0,left:4,green_left:null,table:[],roast_at:'2026-10-05T20:59:00.000Z'};
for(const k of [0,1,2,3,4,5]){ const o=MH.offers.find(x=>x.id===ord[k].id); o.img_url='https://x.test/o/'+k+'.jpg'; o.hemen={...base}; o.list_tl=1240; o.jury_tl=745; o.basket_tl=990; }
{ const o=MH.offers.find(x=>x.id===ord[1].id); o.name='El Recreo #1'; o.dep=17; o.conv=17; o.won_at='2026-09-30T09:00:00Z'; o.lock={at:'2026-09-30T09:00:00Z',n:3,dep:17,dep_tl:100,state:'locked',forced:true,close:'2026-10-05T20:59:00Z'}; }
MH.offer_cfg.hemen_inv=2; MH.offer_cfg.hemen_inv_h=24;
const now=Date.now(); const inv=[1,2,3,4].map(i=>({c:'INV'+i,id:ord[1].id,st:'p',at:new Date(now-3600000).toISOString(),exp:new Date(now+6*86400000).toISOString(),n:'Ömer'}));
const photo=fs.existsSync(path.join(here,'..','..','_shots','fakephoto.b64'))?fs.readFileSync(path.join(here,'..','..','_shots','fakephoto.b64'),'utf8'):'';
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const OUT=path.join(here,'..','..','_shots'); fs.mkdirSync(OUT,{recursive:true});
let bad=0;
async function run(width,height,file){
  const mobile=width<600; const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:2,locale:'tr-TR',isMobile:mobile,hasTouch:mobile}); await ctx.addInitScript(()=>{ try{ localStorage.clear(); localStorage.setItem('grupal_welcomed','1'); localStorage.setItem('grupal_waok','1'); }catch(e){} });
  const page=await ctx.newPage();
  await page.route('**/*',async route=>{ const u=route.request().url();
    if(u.startsWith('https://grup-al.com/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
    if(u.includes('x.test/o/')) return photo?route.fulfill({status:200,contentType:'image/jpeg',body:Buffer.from(photo.split(',')[1],'base64')}):route.fulfill({status:404,body:''});
    if(u.includes('/meydan')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(MH)});
    if(u.includes('/offer-mine')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({votes:[{id:ord[1].id,paid:true,qty:2,conv:true,done:false}],inv,hemen:[],me:{member:true,wa:true,ok:true}})});
    if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'}); return route.fulfill({status:204,body:''}); });
  await page.goto('https://grup-al.com/juri'); await page.waitForTimeout(1000);
  if(mobile){ await page.evaluate(()=>{ const el=document.querySelector('.jcard[data-i="1"]'); if(el) el.scrollIntoView({block:'center',inline:'center'}); }); await page.waitForTimeout(300); }
  const m=await page.evaluate(id=>{ const c=document.querySelector('.jcard[data-id="'+id+'"]'); if(!c) return null; const chips=[...c.querySelectorAll('.jchips2 .jchip')]; const tops=[...new Set(chips.map(x=>Math.round(x.getBoundingClientRect().top)))]; const w=c.getBoundingClientRect().width; return {card:Math.round(w),rows:tops.length,chips:chips.map(x=>[x.textContent.trim(),Math.round(x.getBoundingClientRect().width)])}; },ord[1].id);
  console.log(width+'px', JSON.stringify(m)); if(!m||m.rows>2) bad++;
  if(file){ const b=await page.evaluate(id=>{ const r=document.querySelector('.jcard[data-id="'+id+'"]').getBoundingClientRect(); return {x:r.left-4,y:r.top-4,width:r.width+8,height:r.height+8}; },ord[1].id); await page.screenshot({path:path.join(OUT,file),clip:b}); }
  await ctx.close(); }
await run(1180,900,null); await run(1366,900,'chips_desk.png'); await run(1440,900,null); await run(1512,900,null); await run(1728,1000,null);
await run(360,780,null); await run(390,844,'chips_phone.png'); await run(430,932,null);
await browser.close(); console.log(bad?'FAIL':'ok'); process.exit(bad?1:0);
