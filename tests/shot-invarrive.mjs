// v11x: "davetiye geldi" — fresh private invitations after a kapora: lane opens, mini ticket pops, Sepete glows, ticket sheet follows (phone 390)
import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname);
const html=fs.readFileSync(path.join(here,'..','grupal.html'),'utf8');
const MD=JSON.parse(fs.readFileSync(path.join(here,'mock-meydan.json'),'utf8'));
const ord=MD.offers.slice().sort((a,b)=>((b.dep||0)-(a.dep||0)));
const base={url:'https://coffeenutz.net/cart/222:1',price:885,base:2,sold:0,inv:0,left:2,green_left:null,table:[],roast_at:'2026-10-05T20:59:00.000Z'};
const M=JSON.parse(JSON.stringify(MD)); const o=M.offers.find(x=>x.id===ord[2].id); o.name='Frinsa Honey Tempe #1'; o.img_url='https://x.test/o/a.jpg'; o.hemen={...base}; o.list_tl=1105; o.jury_tl=665; o.basket_tl=885; o.dep=2; M.offer_cfg.hemen_inv=2; M.offer_cfg.hemen_inv_h=24; M.offer_cfg.dep_amt=100; if(M.cycle){ M.cycle.next_close=new Date(Date.now()+5*86400000).toISOString(); }   // live clock: no mid-animation reload
const H0=ord[2]; const now=Date.now(); const exp=new Date(now+6*86400000).toISOString(), at=new Date(now-3600000).toISOString();
const mine={votes:[{id:H0.id,paid:true,qty:1}],inv:[{c:'INV1',id:H0.id,st:'p',at,exp,n:'Ömer'},{c:'INV2',id:H0.id,st:'p',at,exp,n:'Ömer'}],hemen:[],me:{member:true,name:'Ömer Aydın',wa:true,ok:true,k:'k6'}};
const photo=fs.existsSync(path.join(here,'..','..','_shots','fakephoto.b64'))?fs.readFileSync(path.join(here,'..','..','_shots','fakephoto.b64'),'utf8'):'';
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const OUT=path.join(here,'..','..','_shots'); let bad=0;
const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,locale:'tr-TR',isMobile:true,hasTouch:true}); await ctx.addInitScript(()=>{ try{ localStorage.clear(); localStorage.setItem('grupal_welcomed','1'); localStorage.setItem('grupal_dev','DEVTEST001'); }catch(e){} }); const page=await ctx.newPage();
await page.route('**/*',async route=>{ const u=route.request().url();
  if(u.startsWith('https://grup-al.com/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
  if(u.includes('x.test/o/')) return photo?route.fulfill({status:200,contentType:'image/jpeg',body:Buffer.from(photo.split(',')[1],'base64')}):route.fulfill({status:404,body:''});
  if(u.includes('/meydan')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(M)});
  if(u.includes('/offer-mine')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(mine)});
  if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'}); return route.fulfill({status:204,body:''}); });
await page.goto('https://grup-al.com/juri'); await page.waitForTimeout(1500);
const s1=await page.evaluate(()=>({lane:!!document.querySelector('.jcard.lopen'), pop:!!document.querySelector('.jlanes-w.tkpop'), tk:!!document.querySelector('.jcard.lopen .jlane.ha .tk.tkt'), sheet:!!(window.JSHEET)}));
await page.screenshot({path:path.join(OUT,'invarrive_1_lane.png')});
await page.waitForTimeout(2200);
const s2=await page.evaluate(()=>({sheet:!!document.querySelector('#jSheet .jtk'), toast:document.body.textContent.includes('Davetiyelerin geldi')}));
await page.screenshot({path:path.join(OUT,'invarrive_2_sheet.png')});
console.log(JSON.stringify({s1,s2})); if(!(s1.lane&&s1.pop&&s1.tk&&!s1.sheet&&s2.sheet)) bad++;
// desktop: same arrival → lane in the card grid opens, sheet follows
{ const ctx2=await browser.newContext({viewport:{width:1366,height:900},deviceScaleFactor:1,locale:'tr-TR'}); await ctx2.addInitScript(()=>{ try{ localStorage.clear(); localStorage.setItem('grupal_welcomed','1'); localStorage.setItem('grupal_dev','DEVTEST001'); }catch(e){} }); const pg=await ctx2.newPage();
  await pg.route('**/*',async route=>{ const u=route.request().url();
    if(u.startsWith('https://grup-al.com/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
    if(u.includes('x.test/o/')) return photo?route.fulfill({status:200,contentType:'image/jpeg',body:Buffer.from(photo.split(',')[1],'base64')}):route.fulfill({status:404,body:''});
    if(u.includes('/meydan')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(M)});
    if(u.includes('/offer-mine')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(mine)});
    if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'}); return route.fulfill({status:204,body:''}); });
  await pg.goto('https://grup-al.com/juri'); await pg.waitForTimeout(1200);
  const d1=await pg.evaluate(()=>({lane:!!document.querySelector('.jcard.lopen'), tk:!!document.querySelector('.jcard.lopen .jlane.ha .tk.tkt'), pop:!!document.querySelector('.jlanes-w.tkpop')}));
  await pg.screenshot({path:path.join(OUT,'invarrive_desk_1.png')}); await pg.waitForTimeout(2500);
  const d2=await pg.evaluate(()=>!!document.querySelector('#jSheet .jtk')); await pg.screenshot({path:path.join(OUT,'invarrive_desk_2.png')});
  console.log(JSON.stringify({d1,d2})); if(!(d1.lane&&d1.tk&&d2)) bad++; await ctx2.close(); }
await browser.close(); console.log(bad?'BAD':'ok');
