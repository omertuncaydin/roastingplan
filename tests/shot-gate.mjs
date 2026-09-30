// v10o: the one-time WhatsApp gate on the real page (phone 390): sheet on first Kapora koy · after Devam · bind sheet
import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname);
const html=fs.readFileSync(path.join(here,'..','grupal.html'),'utf8');
const MD=JSON.parse(fs.readFileSync(path.join(here,'mock-meydan.json'),'utf8'));
const ord=MD.offers.slice().sort((a,b)=>((b.dep||0)-(a.dep||0)));
const M=JSON.parse(JSON.stringify(MD)); const o=M.offers.find(x=>x.id===ord[0].id); o.img_url='https://x.test/o/a.jpg'; o.hemen={url:'https://coffeenutz.net/cart/222:1',price:885,base:2,sold:0,inv:0,left:2,green_left:null,table:[],roast_at:'2026-10-05T20:59:00.000Z'}; o.list_tl=1105; o.jury_tl=665; o.basket_tl=885; M.offer_cfg.hemen_inv=2; M.offer_cfg.dep_amt=200; M.offer_cfg.login_required=true; M.offer_cfg.wa_group_url='https://chat.whatsapp.com/ABCdef123456';
const photo=fs.existsSync(path.join(here,'..','..','_shots','fakephoto.b64'))?fs.readFileSync(path.join(here,'..','..','_shots','fakephoto.b64'),'utf8'):'';
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const OUT=path.join(here,'..','..','_shots'); fs.mkdirSync(OUT,{recursive:true});
const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,locale:'tr-TR'}); await ctx.addInitScript(()=>{ try{ localStorage.clear(); localStorage.setItem('grupal_welcomed','1'); }catch(e){} }); const page=await ctx.newPage();
await page.route('**/*',async route=>{ const u=route.request().url();
  if(u.startsWith('https://grup-al.com/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
  if(u.includes('x.test/o/')) return photo?route.fulfill({status:200,contentType:'image/jpeg',body:Buffer.from(photo.split(',')[1],'base64')}):route.fulfill({status:404,body:''});
  if(u.includes('/meydan')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(M)});
  if(u.includes('/offer-mine')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({votes:[],inv:[],hemen:[],me:{member:false,name:'',phone_tail:null,wa:false,ok:true}})});
  if(u.endsWith('/wa-ok')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,wa:true,wa_at:new Date().toISOString(),me:null})});
  if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'}); return route.fulfill({status:204,body:''}); });
await page.goto('https://grup-al.com/juri'); await page.waitForTimeout(1200);
const shots=[]; async function snap(name){ await page.waitForTimeout(250); await page.screenshot({path:path.join(OUT,name+'.png')}); shots.push(name); }
await page.evaluate(id=>{ jLaneOpen(id); jLaneKap(id); },o.id); await snap('gt1_sheet');
await page.evaluate(()=>{ const c=document.getElementById('jgWa'); if(c){ c.checked=true; c.dispatchEvent(new Event('change',{bubbles:true})); } }); await page.evaluate(()=>jGateWa()); await page.waitForTimeout(1500); await snap('gt2_after');
await page.evaluate(()=>jBindOpen()); await snap('gt3_bind');
await browser.close(); console.log(shots.join(' '));
