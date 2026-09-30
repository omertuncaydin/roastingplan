// v10n: login sheet states on the real page (phone 390): mail · code · phone · WhatsApp · signed-in top bar
import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname);
const html=fs.readFileSync(path.join(here,'..','grupal.html'),'utf8');
const MD=JSON.parse(fs.readFileSync(path.join(here,'mock-meydan.json'),'utf8'));
const ord=MD.offers.slice().sort((a,b)=>((b.dep||0)-(a.dep||0)));
const M=JSON.parse(JSON.stringify(MD)); const o=M.offers.find(x=>x.id===ord[0].id); o.img_url='https://x.test/o/a.jpg'; o.hemen={url:'https://coffeenutz.net/cart/222:1',price:885,base:2,sold:0,inv:0,left:2,green_left:null,table:[],roast_at:'2026-10-05T20:59:00.000Z'}; o.list_tl=1105; o.jury_tl=665; o.basket_tl=885; M.offer_cfg.hemen_inv=2; M.offer_cfg.dep_amt=200; M.offer_cfg.login_required=true; M.offer_cfg.wa_group_url='https://chat.whatsapp.com/ABCdef123456';
const photo=fs.existsSync(path.join(here,'..','..','_shots','fakephoto.b64'))?fs.readFileSync(path.join(here,'..','..','_shots','fakephoto.b64'),'utf8'):'';
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const OUT=path.join(here,'..','..','_shots'); fs.mkdirSync(OUT,{recursive:true});
let me={email:'ayse.kaya@example.com',dev:'PHONE00001',phone:null,wa:false,ok:true,name:null};
const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,locale:'tr-TR'}); await ctx.addInitScript(()=>{ try{ localStorage.clear(); localStorage.setItem('grupal_welcomed','1'); }catch(e){} }); const page=await ctx.newPage();
await page.route('**/*',async route=>{ const u=route.request().url(); const body=route.request().postDataJSON?route.request().postDataJSON():null;
  if(u.startsWith('https://grup-al.com/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
  if(u.includes('x.test/o/')) return photo?route.fulfill({status:200,contentType:'image/jpeg',body:Buffer.from(photo.split(',')[1],'base64')}):route.fulfill({status:404,body:''});
  if(u.includes('/meydan')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(M)});
  if(u.includes('/offer-mine')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({votes:[],inv:[],hemen:[]})});
  if(u.endsWith('/auth/otp')) return route.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'});
  if(u.endsWith('/auth/verify')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,access_token:'tok',refresh_token:'ref',expires_in:3600,email:'ayse.kaya@example.com'})});
  if(u.endsWith('/me')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,me,merged:0})});
  if(u.endsWith('/me-profile')){ if(body&&'phone' in body) me={...me,phone:'+905321234567',name:body.name||null}; if(body&&body.wa) me={...me,wa:true}; return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,me})}); }
  if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'}); return route.fulfill({status:204,body:''}); });
await page.goto('https://grup-al.com/juri'); await page.waitForTimeout(1200);
const shots=[];
async function snap(name){ await page.waitForTimeout(250); await page.screenshot({path:path.join(OUT,name+'.png')}); shots.push(name); }
await page.evaluate(id=>{ jLaneOpen(id); jLaneKap(id); },o.id); await snap('lg1_mail');
await page.fill('#jlgMail','ayse.kaya@example.com'); await page.evaluate(()=>jLoginSend()); await snap('lg2_code');
await page.fill('#jlgCode','123456'); await page.evaluate(()=>jLoginVerify()); await page.waitForTimeout(200); await snap('lg3_phone');
await page.fill('#jlgName','Ayşe'); await page.fill('#jlgPhone','0532 123 45 67'); await page.evaluate(()=>jLoginPhone()); await page.waitForTimeout(200); await snap('lg4_wa');
await page.check('#jlgWa'); await page.evaluate(()=>jLoginWa()); await page.waitForTimeout(1500); await snap('lg5_done');
await browser.close(); console.log(shots.join(' '));
