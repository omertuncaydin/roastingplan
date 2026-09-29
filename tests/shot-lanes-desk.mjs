// v10g: desktop grid card with both lanes open at two common widths (1366 laptop · 1728 MacBook) — lanes must sit side by side without overflow
import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname);
const html=fs.readFileSync(path.join(here,'..','grupal.html'),'utf8');
const MD=JSON.parse(fs.readFileSync(path.join(here,'mock-meydan.json'),'utf8'));
const ord=MD.offers.slice().sort((a,b)=>((b.dep||0)-(a.dep||0)));
const MH=JSON.parse(JSON.stringify(MD)); const base={url:'https://coffeenutz.net/cart/222:1',price:1280,base:2,sold:0,inv:0,left:2,green_left:null,table:[],roast_at:'2026-10-05T20:59:00.000Z'};
for(const k of [0,1,2,3,4,5]){ const o=MH.offers.find(x=>x.id===ord[k].id); o.img_url='https://x.test/o/'+k+'.jpg'; if(k<5) o.hemen={...base}; o.list_tl=1600; o.jury_tl=960; o.basket_tl=1280; }   // k=5: photo, no Hemen-Al link → locked lane (v10h)
MH.offer_cfg.hemen_inv=2; MH.offer_cfg.hemen_inv_h=24;
const H0=MH.offers.find(o=>o.id===ord[0].id);
const MINE={votes:[{id:H0.id,paid:true,qty:2}],inv:[],hemen:[]};
const photo=fs.existsSync(path.join(here,'..','..','_shots','fakephoto.b64'))?fs.readFileSync(path.join(here,'..','..','_shots','fakephoto.b64'),'utf8'):'';
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const OUT=path.join(here,'..','..','_shots'); fs.mkdirSync(OUT,{recursive:true});
async function shot(vp,name,openId){ openId=openId||H0.id;
  const ctx=await browser.newContext({viewport:vp,deviceScaleFactor:1.5,locale:'tr-TR'}); await ctx.addInitScript(()=>{ try{ localStorage.clear(); localStorage.setItem('grupal_welcomed','1'); }catch(e){} }); const page=await ctx.newPage();
  await page.route('**/*',async route=>{ const u=route.request().url();
    if(u.startsWith('https://grup-al.com/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
    if(u.includes('x.test/o/')) return photo?route.fulfill({status:200,contentType:'image/jpeg',body:Buffer.from(photo.split(',')[1],'base64')}):route.fulfill({status:404,body:''});
    if(u.includes('/meydan')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(MH)});
    if(u.includes('/offer-mine')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(MINE)});
    if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'}); return route.fulfill({status:204,body:''}); });
  await page.goto('https://grup-al.com/juri'); await page.waitForTimeout(1200);
  await page.evaluate(id=>jLaneOpen(id),openId); await page.waitForTimeout(900);
  const m=await page.evaluate(()=>{ const c=document.querySelector('.jcard.lopen'); const ls=[...c.querySelectorAll('.jlane')].map(l=>{ const r=l.getBoundingClientRect(); return {w:Math.round(r.width),x:Math.round(r.left),sw:l.scrollWidth,cw:l.clientWidth}; }); const cr=c.getBoundingClientRect(); return {card:Math.round(cr.width),lanes:ls,sideBySide:ls.length===2&&ls[1].x>ls[0].x+ls[0].w-2,overflow:ls.some(l=>l.sw>l.cw+1)}; });
  console.log(name, JSON.stringify(m));
  const el=await page.$('.jcard.lopen'); await el.screenshot({path:path.join(OUT,name+'.png')}); await ctx.close(); return m; }
const a=await shot({width:1366,height:900},'lanes_desk_1366');
const b=await shot({width:1728,height:1000},'lanes_desk_1728');
const c=await shot({width:1366,height:900},'lanes_desk_locked',ord[5].id);   // v10h: locked Hemen-Al lane
await browser.close();
if(!(a.sideBySide&&b.sideBySide&&c.sideBySide&&!a.overflow&&!b.overflow&&!c.overflow)){ console.log('FAIL lanes layout'); process.exit(1); } console.log('ok');
