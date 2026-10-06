// v10m: ticket states on the real page (phone 390): 1 no kapora · 2 kapora in basket · 3 paid holder · 4 used + on table · 5 stranger, table seat
import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname);
const html=fs.readFileSync(path.join(here,'..','grupal.html'),'utf8');
const MD=JSON.parse(fs.readFileSync(path.join(here,'mock-meydan.json'),'utf8'));
const ord=MD.offers.slice().sort((a,b)=>((b.dep||0)-(a.dep||0)));
const base={url:'https://coffeenutz.net/cart/222:1',price:885,base:2,sold:0,inv:0,left:2,green_left:null,table:[],roast_at:'2026-10-05T20:59:00.000Z'};
const mk=(tbl,left)=>{ const M=JSON.parse(JSON.stringify(MD)); const o=M.offers.find(x=>x.id===ord[0].id); o.name='Frinsa Honey Tempe #1'; o.img_url='https://x.test/o/a.jpg'; o.hemen={...base,table:tbl||[],left:left==null?2:left}; o.list_tl=1105; o.jury_tl=665; o.basket_tl=885; o.dep=2; M.offer_cfg.hemen_inv=2; M.offer_cfg.hemen_inv_h=24; M.offer_cfg.dep_amt=200; return M; };
const H0=ord[0]; const now=Date.now(); const exp=new Date(now+6*86400000).toISOString(), y=new Date(now-86400000+3600000*2).toISOString();
const photo=fs.existsSync(path.join(here,'..','..','_shots','fakephoto.b64'))?fs.readFileSync(path.join(here,'..','..','_shots','fakephoto.b64'),'utf8'):'';
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const OUT=path.join(here,'..','..','_shots'); fs.mkdirSync(OUT,{recursive:true});
async function shot(name,md,mine,steps){
  const ctx=await browser.newContext({viewport:{width:390,height:(process.env.VH?parseInt(process.env.VH):900)},deviceScaleFactor:2,locale:'tr-TR'}); await ctx.addInitScript(()=>{ try{ localStorage.clear(); localStorage.setItem('grupal_welcomed','1'); }catch(e){} }); const page=await ctx.newPage();
  await page.route('**/*',async route=>{ const u=route.request().url();
    if(u.startsWith('https://grup-al.com/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
    if(u.includes('x.test/o/')) return photo?route.fulfill({status:200,contentType:'image/jpeg',body:Buffer.from(photo.split(',')[1],'base64')}):route.fulfill({status:404,body:''});
    if(u.includes('/meydan')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(md)});
    if(u.includes('/offer-mine')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(mine)});
    if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'}); return route.fulfill({status:204,body:''}); });
  await page.goto('https://grup-al.com/juri'); await page.waitForTimeout(1200); await page.evaluate(id=>{ if(JSHEET) jSheetClose(); if(!(JLANE&&JLANE.id===id)) jLaneOpen(id); },H0.id); await page.waitForTimeout(1500);   // v11x: fresh invitations open the lane (and the sheet) by themselves if(steps) await steps(page);
  const el=await page.$('.jcard.lopen'); await el.screenshot({path:path.join(OUT,name+'.png')}); console.log(name); await ctx.close(); }
const E={votes:[],inv:[],hemen:[]};
await shot('tk1_none',mk(),E);
await shot('tk2_basket',mk(),E,async p=>{ await p.evaluate(id=>jLaneKap(id),H0.id); await p.waitForTimeout(1200); });
await shot('tk3_paid',mk(),{votes:[{id:H0.id,paid:true,qty:1}],inv:[{c:'INV1',id:H0.id,st:'p',at:new Date(now).toISOString(),exp,n:'Ömer'},{c:'INV2',id:H0.id,st:'p',at:new Date(now).toISOString(),exp,n:'Ömer'}],hemen:[]});
await shot('tk4_used',mk([{c:'INV2',n:'Ömer'}]),{votes:[{id:H0.id,paid:true,qty:1}],inv:[{c:'INV1',id:H0.id,st:'u',at:y,exp,n:'Ömer',taker:'Ayşe',tat:y},{c:'INV2',id:H0.id,st:'t',at:y,exp,n:'Ömer',tat:y}],hemen:[]});
await shot('tk5_table',mk([{c:'ABCD2345',n:'Ömer'},{c:'ABCD2346',n:'Zeynep'}],0),E);
await browser.close();
