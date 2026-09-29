import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const here='/tmp/work6/tests'; const html=fs.readFileSync('/tmp/work6/grupal.html','utf8'); const MD=JSON.parse(fs.readFileSync(path.join(here,'mock-meydan.json'),'utf8'));
const ord=MD.offers.slice().sort((a,b)=>((b.dep||0)-(a.dep||0))); const MH=JSON.parse(JSON.stringify(MD)); const H0=MH.offers.find(o=>o.id===ord[0].id), H2=MH.offers.find(o=>o.id===ord[2].id);
H0.img_url='https://x.test/o/a.jpg'; H0.hemen={url:'https://coffeenutz.net/cart/222:1',price:1280,base:2,sold:0,inv:0,left:2,green_left:null,table:[],roast_at:'2026-10-05T20:59:00.000Z'}; H0.list_tl=1600; H0.jury_tl=960;
H2.img_url='https://x.test/o/c.jpg'; H2.hemen={url:'https://coffeenutz.net/cart/222:1',price:1280,base:2,sold:2,inv:0,left:0,green_left:null,table:[{c:'ABCD2345',n:'Ömer'}],roast_at:'2026-10-05T20:59:00.000Z'}; H2.list_tl=1600; H2.jury_tl=960;
MH.offer_cfg.hemen_inv=2;
const photo=fs.existsSync('/tmp/_shots/fakephoto.b64')?fs.readFileSync('/tmp/_shots/fakephoto.b64','utf8'):'';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
async function page(vp){ const ctx=await b.newContext({viewport:vp,deviceScaleFactor:1.5,locale:'tr-TR'}); await ctx.addInitScript(()=>{ try{ localStorage.clear(); localStorage.setItem('grupal_welcomed','1'); }catch(e){} }); const p=await ctx.newPage();
  await p.route('**/*',async route=>{ const u=route.request().url(); if(u.startsWith('https://grup-al.com/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
    if(u.includes('x.test/o/')) return photo?route.fulfill({status:200,contentType:'image/jpeg',body:Buffer.from(photo.split(',')[1],'base64')}):route.fulfill({status:404,body:''});
    if(u.includes('/meydan')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(MH)});
    if(u.includes('/offer-mine')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({votes:[],inv:[],hemen:[]})});
    if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'}); return route.fulfill({status:204,body:''}); });
  await p.goto('https://grup-al.com/juri'); await p.waitForTimeout(1300); return {p,ctx}; }
{ const {p,ctx}=await page({width:390,height:844}); await p.click('.jcard[data-id="'+H0.id+'"] .jrow.j2'); await p.waitForTimeout(400); await p.screenshot({path:'/tmp/_shots/inc_1.png'}); await p.waitForTimeout(2200); await p.screenshot({path:'/tmp/_shots/inc_2.png'});
  await p.evaluate(()=>jLaneClose()); await p.evaluate(id=>jLaneOpen(id),ord[3].id); await p.waitForTimeout(2300); await p.screenshot({path:'/tmp/_shots/inc_3.png'}); await ctx.close(); }
{ const {p,ctx}=await page({width:1366,height:900}); await p.evaluate(id=>jLaneOpen(id),H0.id); await p.waitForTimeout(2300); await p.evaluate(id=>jLaneKap(id),H0.id); await p.waitForTimeout(400); await p.screenshot({path:'/tmp/_shots/inc_desk.png'});
  await p.evaluate(id=>jDeskOpen(id),H2.id); await p.waitForTimeout(600); await p.screenshot({path:'/tmp/_shots/inc_drawer.png'}); await ctx.close(); }
await b.close(); console.log('ok');
