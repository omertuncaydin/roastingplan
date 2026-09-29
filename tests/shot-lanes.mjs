// v10a: Grup-Al / Hemen-Al lanes, sheet, invitations, guest banner — phone + desktop shots (run from repo root: node tests/shot-lanes.mjs)
import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname);
const html=fs.readFileSync(path.join(here,'..','grupal.html'),'utf8');
const MD=JSON.parse(fs.readFileSync(path.join(here,'mock-meydan.json'),'utf8'));
const ord=MD.offers.slice().sort((a,b)=>((b.dep||0)-(a.dep||0)));
const MH=JSON.parse(JSON.stringify(MD)); const H0=MH.offers.find(o=>o.id===ord[0].id), H1=MH.offers.find(o=>o.id===ord[1].id), H2=MH.offers.find(o=>o.id===ord[2].id);
const base={url:'https://coffeenutz.net/cart/222:1',price:1280,base:2,sold:0,inv:0,left:2,green_left:null,table:[],roast_at:'2026-10-05T20:59:00.000Z'};
H0.img_url='https://x.test/o/a.jpg'; H0.hemen={...base}; H0.list_tl=1600; H0.jury_tl=960;
H1.img_url='https://x.test/o/b.jpg'; H1.hemen={...base,left:0,sold:2}; H1.list_tl=1600; H1.jury_tl=960;
H2.img_url='https://x.test/o/c.jpg'; H2.hemen={...base,left:0,sold:2,table:[{c:'ABCD2345',n:'Ömer'}]}; H2.list_tl=1600; H2.jury_tl=960;
MH.offer_cfg.hemen_inv=2; MH.offer_cfg.hemen_inv_h=24;
const exp=new Date(Date.now()+3*86400000).toISOString();
const MINE={votes:[{id:H0.id,paid:true,qty:1}],inv:[{c:'INV1',id:H0.id,st:'p',at:new Date().toISOString(),exp,n:'Ömer'},{c:'INV2',id:H0.id,st:'u',at:new Date().toISOString(),exp,n:'Ömer',taker:'Ayşe'}],hemen:[]};
const photo=fs.existsSync(path.join(here,'..','..','_shots','fakephoto.b64'))?fs.readFileSync(path.join(here,'..','..','_shots','fakephoto.b64'),'utf8'):'';
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const OUT=path.join(here,'..','..','_shots'); fs.mkdirSync(OUT,{recursive:true});
async function shot(vp,name,mine,url,steps,md){ md=md||MH;
  const ctx=await browser.newContext({viewport:vp,deviceScaleFactor:1.5,locale:'tr-TR'}); await ctx.addInitScript(()=>{ try{ localStorage.clear(); localStorage.setItem('grupal_welcomed','1'); }catch(e){} }); const page=await ctx.newPage();
  await page.route('**/*',async route=>{ const u=route.request().url();
    if(u.startsWith('https://grup-al.com/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
    if(u.includes('x.test/o/')) return photo?route.fulfill({status:200,contentType:'image/jpeg',body:Buffer.from(photo.split(',')[1],'base64')}):route.fulfill({status:404,body:''});
    if(u.includes('/meydan')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(md)});
    if(u.includes('/offer-mine')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(mine)});
    if(u.includes('/inv-table')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true})});
    if(u.includes('/inv?c=')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,c:'ABCD2345',id:H2.id,name:'Ömer',coffee:H2.name,price:1280,url:'https://coffeenutz.net/cart/222:1',exp,st:'t'})});
    if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'}); return route.fulfill({status:204,body:''}); });
  await page.goto(url||'https://grup-al.com/juri'); await page.waitForTimeout(1300); if(steps) await steps(page);
  await page.screenshot({path:path.join(OUT,name+'.png')}); console.log(name); await ctx.close(); }
const E={votes:[],inv:[],hemen:[]};
await shot({width:390,height:844},'lanes_phone_card',E);
await shot({width:390,height:844},'lanes_phone_sheet',E,null,async p=>{ await p.evaluate(id=>jLaneOpen(id),H0.id); await p.waitForTimeout(500); });
await shot({width:390,height:844},'lanes_phone_full',E,null,async p=>{ await p.evaluate(id=>jLaneOpen(id),H1.id); await p.waitForTimeout(500); });
await shot({width:390,height:844},'lanes_phone_inv',MINE,null,async p=>{ await p.evaluate(id=>jInvOpen(id),H0.id); await p.waitForTimeout(500); });
await shot({width:390,height:844},'lanes_phone_guest',E,'https://grup-al.com/?d=ABCD2345');
await shot({width:1366,height:820},'lanes_desk_sheet',MINE,null,async p=>{ await p.evaluate(id=>jLaneOpen(id),H2.id); await p.waitForTimeout(500); });
// v10c: masaüstü ızgara paketleme — açık kart uzarken yanındaki sütunların sonraki kartları yukarı çekilir (boşluk yok)
const MH6=JSON.parse(JSON.stringify(MH)); for(const k of [3,4,5]){ const o=MH6.offers.find(x=>x.id===ord[k].id); o.img_url='https://x.test/o/'+k+'.jpg'; }   // 6 fotoğraflı kahve → vitrin 2 satır
await shot({width:1366,height:1000},'lanes_desk_masonry',MINE,null,async p=>{ await p.evaluate(id=>jLaneOpen(id),H0.id); await p.waitForTimeout(900);
  const m=await p.evaluate(()=>{ const cs=[...document.querySelectorAll('.jdk-grid>.jcard')].slice(0,6).map(c=>{ const r=c.getBoundingClientRect(); return {id:c.dataset.id,top:Math.round(r.top),h:Math.round(r.height),span:c.style.gridRowEnd}; }); return {mas:!!document.querySelector('.jdk-grid.jmas'),cs}; });
  console.log(JSON.stringify(m)); },MH6);
await browser.close();
