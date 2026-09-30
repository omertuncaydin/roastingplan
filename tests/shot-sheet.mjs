// v11d: ONE coffee sheet on every device — phone: bottom sheet (lanes first, details below); desktop: right drawer. Opened by +, the price line and Detay ›.
import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname);
const html=fs.readFileSync(path.join(here,'..','grupal.html'),'utf8');
const MD=JSON.parse(fs.readFileSync(path.join(here,'mock-meydan.json'),'utf8'));
const ord=MD.offers.slice().sort((a,b)=>((b.dep||0)-(a.dep||0)));
const MH=JSON.parse(JSON.stringify(MD)); const base={url:'https://coffeenutz.net/cart/222:1',price:1280,base:2,sold:0,inv:0,left:2,green_left:null,table:[],roast_at:'2026-10-05T20:59:00.000Z'};
for(const k of [0,1,2,3,4,5]){ const o=MH.offers.find(x=>x.id===ord[k].id); o.img_url='https://x.test/o/'+k+'.jpg'; o.hemen={...base}; o.list_tl=1600; o.jury_tl=960; o.basket_tl=1280; }
{ const o=MH.offers.find(x=>x.id===ord[1].id); o.name='El Recreo'; o.dep=0; o.conv=17; o.won_at='2026-09-30T09:00:00Z'; o.lock={at:'2026-09-30T09:00:00Z',n:3,dep:17,dep_tl:100,state:'locked',forced:true,close:'2026-10-05T20:59:00Z'}; }
MH.offer_cfg.hemen_inv=2; MH.offer_cfg.hemen_inv_h=24;
const photo=fs.existsSync(path.join(here,'..','..','_shots','fakephoto.b64'))?fs.readFileSync(path.join(here,'..','..','_shots','fakephoto.b64'),'utf8'):'';
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const OUT=path.join(here,'..','..','_shots'); fs.mkdirSync(OUT,{recursive:true}); let bad=0;
async function run(width,height,file,id,mine){
  const mobile=width<960; const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:2,locale:'tr-TR',isMobile:mobile,hasTouch:mobile}); await ctx.addInitScript(()=>{ try{ localStorage.clear(); localStorage.setItem('grupal_welcomed','1'); localStorage.setItem('grupal_waok','1'); }catch(e){} });
  const page=await ctx.newPage();
  await page.route('**/*',async route=>{ const u=route.request().url();
    if(u.startsWith('https://grup-al.com/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
    if(u.includes('x.test/o/')) return photo?route.fulfill({status:200,contentType:'image/jpeg',body:Buffer.from(photo.split(',')[1],'base64')}):route.fulfill({status:404,body:''});
    if(u.includes('/meydan')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(MH)});
    if(u.includes('/offer-mine')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({votes:mine?[{id:ord[1].id,paid:true,qty:2,conv:true,done:false}]:[],inv:[],hemen:[],me:{member:true,name:'Ömer Aydın',wa:true,ok:true}})});
    if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'}); return route.fulfill({status:204,body:''}); });
  await page.goto('https://grup-al.com/juri'); await page.waitForTimeout(1100);
  await page.evaluate(i=>jLaneOpen(i),id); await page.waitForTimeout(1600);
  const m=await page.evaluate(()=>{ const d=document.getElementById('jDrawer'); if(!d) return null; const r=d.getBoundingClientRect(); const lanes=d.querySelector('.jlanes-w'), row=d.querySelector('.orow'); const ctas=[...d.querySelectorAll('.jlane .cta')].map(b=>b.textContent.trim()); const cardPanels=document.querySelectorAll('#offList .jlanes-w').length; return {x:Math.round(r.left),w:Math.round(r.width),top:Math.round(r.top),lanesFirst:!!lanes&&!!row&&(lanes.compareDocumentPosition(row)&4)===4,ctas,cardPanels,ctaVisible:(()=>{ const b=d.querySelector('.jlane.ga .cta'); if(!b) return false; const br=b.getBoundingClientRect(); return br.top>=0&&br.bottom<=window.innerHeight; })()}; });
  console.log(width+'px', JSON.stringify(m)); if(!m||!m.lanesFirst||m.cardPanels||!m.ctaVisible||(mobile&&(m.x!==0||m.w!==width))) bad++;
  await page.screenshot({path:path.join(OUT,file)}); await ctx.close(); }
await run(390,844,'sheet_phone.png',ord[1].id,true); await run(390,844,'sheet_phone_new.png',ord[0].id,false); await run(1366,900,'sheet_desk.png',ord[1].id,true);
await browser.close(); console.log(bad?'FAIL':'ok'); process.exit(bad?1:0);
