// v11j: Hemen-Al quantity step in the lane + the "al ›" popup
import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname);
const html=fs.readFileSync(path.join(here,'..','grupal.html'),'utf8');
const MD=JSON.parse(fs.readFileSync(path.join(here,'mock-meydan.json'),'utf8'));
const ord=MD.offers.slice().sort((a,b)=>((b.dep||0)-(a.dep||0)));
const MH=JSON.parse(JSON.stringify(MD)); const base={url:'https://coffeenutz.net/cart/222:1',price:1280,base:4,sold:0,inv:0,left:4,green_left:null,table:[],roast_at:'2026-10-05T20:59:00.000Z'};
for(const k of [0,1,2]){ const o=MH.offers.find(x=>x.id===ord[k].id); o.img_url='https://x.test/o/'+k+'.jpg'; o.hemen={...base}; o.list_tl=1600; o.jury_tl=960; o.basket_tl=1280; }
{ const o=MH.offers.find(x=>x.id===ord[1].id); o.name='El Recreo'; o.hemen={...base,left:0,sold:4,table:[{c:'ABCD2345',n:'Cgrierdgn'},{c:'EFGH2345',n:'Ayşe'}]}; }
MH.offer_cfg.hemen_inv=2; MH.offer_cfg.hemen_inv_h=24;
const photo=fs.existsSync(path.join(here,'..','..','_shots','fakephoto.b64'))?fs.readFileSync(path.join(here,'..','..','_shots','fakephoto.b64'),'utf8'):'';
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const OUT=path.join(here,'..','..','_shots'); fs.mkdirSync(OUT,{recursive:true});
const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,locale:'tr-TR',isMobile:true,hasTouch:true}); await ctx.addInitScript(()=>{ try{ localStorage.clear(); localStorage.setItem('grupal_welcomed','1'); localStorage.setItem('grupal_waok','1'); }catch(e){} });
const page=await ctx.newPage();
await page.route('**/*',async route=>{ const u=route.request().url();
  if(u.startsWith('https://grup-al.com/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
  if(u.includes('x.test/o/')) return photo?route.fulfill({status:200,contentType:'image/jpeg',body:Buffer.from(photo.split(',')[1],'base64')}):route.fulfill({status:404,body:''});
  if(u.includes('/meydan')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(MH)});
  if(u.includes('/offer-mine')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({votes:[],inv:[],hemen:[],me:{member:true,name:'Ömer',wa:true,ok:true}})});
  if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'}); return route.fulfill({status:204,body:''}); });
await page.goto('https://grup-al.com/juri'); await page.waitForTimeout(1100);
await page.evaluate(id=>{ jLaneOpen(id); },ord[0].id); await page.waitForTimeout(900); await page.evaluate(id=>{ jHemenPick(id); jHemenQty(id,1); },ord[0].id); await page.waitForTimeout(400);
await page.evaluate(id=>{ document.querySelector('.jcard[data-id="'+id+'"]').scrollIntoView({block:'center'}); },ord[0].id); await page.waitForTimeout(300);
await page.evaluate(()=>{ const l=document.querySelector('.jcard.lopen .jlanes'); if(l) l.scrollTop=l.scrollHeight; const b=document.querySelector('.jcard.lopen .jbody'); if(b) b.scrollTop=b.scrollHeight; }); await page.waitForTimeout(200); await page.screenshot({path:path.join(OUT,'hq_lane.png')});
await page.evaluate(id=>{ jLaneClose(); jHemenPop(id,'ABCD2345'); },ord[1].id); await page.waitForTimeout(600);
await page.screenshot({path:path.join(OUT,'hq_pop.png')});
console.log(await page.evaluate(()=>({pay:document.querySelector('.jcard.lopen .cta.pay')&&document.querySelector('.jcard.lopen .cta.pay').textContent, pop:document.querySelector('#jSheet .jhpop .go')&&document.querySelector('#jSheet .jhpop .go').textContent, sub:document.querySelector('#jSheet .jsh-sub')&&document.querySelector('#jSheet .jsh-sub').textContent})));
await browser.close(); console.log('ok');
