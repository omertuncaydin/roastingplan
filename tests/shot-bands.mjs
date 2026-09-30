// v11c: phone — tapping a group opens a deck of that group's cards (no rows); page-1 deck unchanged; no snap
import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname);
const html=fs.readFileSync(path.join(here,'..','grupal.html'),'utf8');
const MD=JSON.parse(fs.readFileSync(path.join(here,'mock-meydan.json'),'utf8'));
const ord=MD.offers.slice().sort((a,b)=>((b.dep||0)-(a.dep||0)));
const MH=JSON.parse(JSON.stringify(MD)); const base={url:'https://coffeenutz.net/cart/222:1',price:1280,base:2,sold:0,inv:0,left:2,green_left:null,table:[],roast_at:'2026-10-05T20:59:00.000Z'};
for(const k of [0,1,2,3,4,5]){ const o=MH.offers.find(x=>x.id===ord[k].id); o.img_url='https://x.test/o/'+k+'.jpg'; o.hemen={...base}; o.list_tl=1600; o.jury_tl=960; o.basket_tl=1280; }
const photo=fs.existsSync(path.join(here,'..','..','_shots','fakephoto.b64'))?fs.readFileSync(path.join(here,'..','..','_shots','fakephoto.b64'),'utf8'):'';
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const OUT=path.join(here,'..','..','_shots'); fs.mkdirSync(OUT,{recursive:true});
const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,locale:'tr-TR',isMobile:true,hasTouch:true}); await ctx.addInitScript(()=>{ try{ localStorage.clear(); localStorage.setItem('grupal_welcomed','1'); }catch(e){} });
const page=await ctx.newPage();
await page.route('**/*',async route=>{ const u=route.request().url();
  if(u.startsWith('https://grup-al.com/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
  if(u.includes('x.test/o/')) return photo?route.fulfill({status:200,contentType:'image/jpeg',body:Buffer.from(photo.split(',')[1],'base64')}):route.fulfill({status:404,body:''});
  if(u.includes('/meydan')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(MH)});
  if(u.includes('/offer-mine')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({votes:[],inv:[],hemen:[],me:{member:true,name:'Ömer Aydın',wa:true,ok:true}})});
  if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'}); return route.fulfill({status:204,body:''}); });
await page.goto('https://grup-al.com/juri'); await page.waitForTimeout(1200);
await page.evaluate(()=>{ jOpenBand('hafif'); }); await page.waitForTimeout(900);
await page.evaluate(()=>{ const b=document.getElementById('jb_hafif'); b.scrollIntoView({block:'start'}); window.scrollBy(0,-60); }); await page.waitForTimeout(400);
await page.screenshot({path:path.join(OUT,'band_cards.png')});
const m=await page.evaluate(()=>{ const b=document.getElementById('jb_hafif'); const d=b.querySelector('.jdeck-b'); const cards=[...d.querySelectorAll('.jcard')]; const r=cards[0].getBoundingClientRect(); return {n:cards.length, rows:b.querySelectorAll('.orow').length, cardW:Math.round(r.width), bandW:Math.round(b.getBoundingClientRect().width), scrollable:d.scrollWidth>d.clientWidth, snapY:getComputedStyle(document.documentElement).scrollSnapType, hint:!!document.querySelector('.jhint'), chip:document.getElementById('bindChip').textContent}; });
console.log(JSON.stringify(m)); await browser.close(); console.log((m.n>3&&m.rows===0&&m.scrollable&&/none/.test(m.snapY)&&!m.hint)?'ok':'FAIL');
