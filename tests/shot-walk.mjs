// v11k: the walk on the real page — phone C (centred deck card) and desktop B (strip above the price row)
import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname);
const html=fs.readFileSync(path.join(here,'..','grupal.html'),'utf8');
const MD=JSON.parse(fs.readFileSync(path.join(here,'mock-meydan.json'),'utf8'));
const ord=MD.offers.slice().sort((a,b)=>((b.dep||0)-(a.dep||0)));
const MH=JSON.parse(JSON.stringify(MD)); const base={url:'https://coffeenutz.net/cart/222:1',price:990,base:2,sold:0,inv:0,left:2,green_left:null,table:[],roast_at:'2026-10-05T20:59:00.000Z'};
const PEOPLE=[['Barış',4],['Cem',2],['Muaaz',2],['Sabri',1],['Kerim',1],['Fikret',1],['Ömer',1],['Cem B.',1],['Ayşe',1],['Deniz',1],['Elif',1],['Can',1]];
for(const k of [0,1,2,3,4,5]){ const o=MH.offers.find(x=>x.id===ord[k].id); o.img_url='https://x.test/o/'+k+'.jpg'; o.hemen={...base}; o.list_tl=1240; o.jury_tl=745; o.basket_tl=990; }
{ const o=MH.offers.find(x=>x.id===ord[0].id); o.name='El Recreo #1'; o.dep=17; o.people=PEOPLE.map(([n,q],i)=>({n,q,k:'k'+i})); }
{ const o=MH.offers.find(x=>x.id===ord[1].id); o.dep=9; o.people=PEOPLE.slice(0,5).map(([n,q],i)=>({n,q,k:'z'+i})); }
const photo=fs.existsSync(path.join(here,'..','..','_shots','fakephoto.b64'))?fs.readFileSync(path.join(here,'..','..','_shots','fakephoto.b64'),'utf8'):'';
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const OUT=path.join(here,'..','..','_shots'); fs.mkdirSync(OUT,{recursive:true}); let bad=0;
async function run(width,height,file,steps){
  const mobile=width<960; const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:2,locale:'tr-TR',isMobile:mobile,hasTouch:mobile}); await ctx.addInitScript(()=>{ try{ localStorage.clear(); localStorage.setItem('grupal_welcomed','1'); localStorage.setItem('grupal_waok','1'); }catch(e){} });
  const page=await ctx.newPage();
  await page.route('**/*',async route=>{ const u=route.request().url();
    if(u.startsWith('https://grup-al.com/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
    if(u.includes('x.test/o/')) return photo?route.fulfill({status:200,contentType:'image/jpeg',body:Buffer.from(photo.split(',')[1],'base64')}):route.fulfill({status:404,body:''});
    if(u.includes('/meydan')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(MH)});
    if(u.includes('/offer-mine')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({votes:[],inv:[],hemen:[],me:{member:true,name:'Ömer Aydın',wa:true,ok:true,k:'k6'}})});
    if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'}); return route.fulfill({status:204,body:''}); });
  await page.goto('https://grup-al.com/juri'); await page.waitForTimeout(900);
  const m=await steps(page); console.log(width+'px', JSON.stringify(m)); if(m.bad) bad++;
  await ctx.close(); }
await run(390,844,'walk_phone',async page=>{
  await page.waitForTimeout(1300);   // settle → first card walks
  const mid=await page.evaluate(id=>{ const c=document.querySelector('#jDeck .jcard[data-id="'+id+'"]'); const el=c.querySelector('.jwc'); const figs=[...el.querySelectorAll('.jwfig')].filter(f=>+f.style.opacity>0.2); const nl=el.querySelector('.jwnl'); return {figsVisible:figs.length,name:nl.textContent,nameOp:+nl.style.opacity,drum:el.querySelector('.jwdrum text').textContent}; },ord[0].id);
  await page.evaluate(id=>{ document.querySelector('#jDeck .jcard[data-id="'+id+'"]').scrollIntoView({block:'center',inline:'center'}); },ord[0].id); await page.waitForTimeout(100);
  await page.screenshot({path:path.join(OUT,'walk_phone_mid.png')});
  await page.waitForTimeout(3200);
  const end=await page.evaluate(id=>{ const c=document.querySelector('#jDeck .jcard[data-id="'+id+'"]'); const el=c.querySelector('.jwc'); return {drum:el.querySelector('.jwdrum text').textContent, played:!!JWALK.played[id], figsLeft:[...el.querySelectorAll('.jwfig')].filter(f=>+f.style.opacity>0.2).length}; },ord[0].id);
  await page.screenshot({path:path.join(OUT,'walk_phone_end.png')});
  // re-render must NOT replay
  await page.evaluate(()=>renderOffers(STATE)); await page.waitForTimeout(500);
  const re=await page.evaluate(id=>{ const c=document.querySelector('#jDeck .jcard[data-id="'+id+'"]'); const el=c.querySelector('.jwc'); return {drum:el.querySelector('.jwdrum text').textContent, figs:el.querySelectorAll('.jwfig').length}; },ord[0].id);
  return {mid,end,re,bad:!(mid.figsVisible>0&&end.drum==='17'&&end.played&&re.drum==='17'&&re.figs===0)}; });
await run(1366,900,'walk_desk',async page=>{
  await page.waitForTimeout(1200);
  const mid=await page.evaluate(id=>{ const el=document.querySelector('.jwb[data-w="'+id+'"]'); return {cnt:el.querySelector('.jwcnt b').textContent, figs:[...el.querySelectorAll('.jwfig')].filter(f=>+f.style.opacity>0.2).length}; },ord[0].id);
  await page.screenshot({path:path.join(OUT,'walk_desk_mid.png')});
  await page.waitForTimeout(3500);
  const end=await page.evaluate(id=>{ const el=document.querySelector('.jwb[data-w="'+id+'"]'); const on=el.querySelectorAll('.jwslots i.on').length; return {cnt:el.querySelector('.jwcnt b').textContent,on,me:el.querySelectorAll('.jwslots i.on.me').length,done:el.classList.contains('done'),title:el.querySelectorAll('.jwslots i')[0].getAttribute('title')}; },ord[0].id);
  await page.screenshot({path:path.join(OUT,'walk_desk_end.png')});
  await page.evaluate(()=>renderOffers(STATE)); await page.waitForTimeout(400);
  const re=await page.evaluate(id=>{ const el=document.querySelector('.jwb[data-w="'+id+'"]'); return {cnt:el.querySelector('.jwcnt b').textContent,on:el.querySelectorAll('.jwslots i.on').length,done:el.classList.contains('done')}; },ord[0].id);
  return {mid,end,re,bad:!(end.cnt==='17'&&end.on===17&&end.me===1&&end.done&&/Barış ×4/.test(end.title)&&re.cnt==='17'&&re.on===17&&re.done)}; });
await browser.close(); console.log(bad?'FAIL':'ok'); process.exit(bad?1:0);
