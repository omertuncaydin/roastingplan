// v11n: HALKA AÇILIR on the real page — desktop hover opens the ring into the strip (people walk in, count climbs), leave rolls it back;
// phone tap opens (auto-closes after 5 s), second tap closes; locked coffee walks the lot's people and says "kavruluyor"; a /meydan refresh while open is deferred.
import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname);
const html=fs.readFileSync(path.join(here,'..','grupal.html'),'utf8');
const MD=JSON.parse(fs.readFileSync(path.join(here,'mock-meydan.json'),'utf8'));
const ord=MD.offers.slice().sort((a,b)=>((b.dep||0)-(a.dep||0)));
const MH=JSON.parse(JSON.stringify(MD)); const base={url:'https://coffeenutz.net/cart/222:1',price:990,base:2,sold:0,inv:0,left:2,green_left:null,table:[],roast_at:'2026-10-05T20:59:00.000Z'};
const PEOPLE=[['Barış',4],['Cem',2],['Muaaz',2],['Sabri',1],['Kerim',1],['Fikret',1],['Ömer',1],['Cem B.',1],['Ayşe',1],['Deniz',1],['Elif',1],['Can',1]];
for(const k of [0,1,2,3,4,5]){ const o=MH.offers.find(x=>x.id===ord[k].id); o.img_url='https://x.test/o/'+k+'.jpg'; o.hemen={...base}; o.list_tl=1240; o.jury_tl=745; o.basket_tl=990; }
// card 0: locked lot of 17 (names in lock.people), live counter 0 for the next lot · card 1: open run of 9 with 5 names · card 2: nobody yet
{ const o=MH.offers.find(x=>x.id===ord[0].id); o.name='El Recreo #1'; o.dep=0; o.people=[]; o.lock={at:'2026-09-30T10:00:00Z',n:1,close:'2026-10-04T20:59:00Z',state:'locked',dep:17,dep_tl:100,forced:true,people:PEOPLE.map(([n,q],i)=>({n,q,k:'k'+i}))}; }
{ const o=MH.offers.find(x=>x.id===ord[1].id); o.dep=10; o.people=PEOPLE.slice(0,5).map(([n,q],i)=>({n,q,k:'z'+i})); delete o.lock; }
{ const o=MH.offers.find(x=>x.id===ord[2].id); o.dep=0; o.people=[]; delete o.lock; }
const photo=fs.existsSync(path.join(here,'..','..','_shots','fakephoto.b64'))?fs.readFileSync(path.join(here,'..','..','_shots','fakephoto.b64'),'utf8'):'';
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const OUT=path.join(here,'..','..','_shots'); fs.mkdirSync(OUT,{recursive:true}); let bad=0;
async function run(width,height,steps){
  const mobile=width<960; const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:2,locale:'tr-TR',isMobile:mobile,hasTouch:mobile}); await ctx.addInitScript(()=>{ try{ localStorage.clear(); localStorage.setItem('grupal_welcomed','1'); localStorage.setItem('grupal_dev','DEVTEST001'); }catch(e){} });
  const page=await ctx.newPage(); let meydanHits=0;
  await page.route('**/*',async route=>{ const u=route.request().url();
    if(u.startsWith('https://grup-al.com/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
    if(u.includes('x.test/o/')) return photo?route.fulfill({status:200,contentType:'image/jpeg',body:Buffer.from(photo.split(',')[1],'base64')}):route.fulfill({status:404,body:''});
    if(u.includes('/meydan')){ meydanHits++; return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(MH)}); }
    if(u.includes('/offer-mine')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({votes:[],inv:[],hemen:[],me:{member:true,name:'Ömer Aydın',wa:true,ok:true,k:'k6'}})});
    if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'}); return route.fulfill({status:204,body:''}); });
  await page.goto('https://grup-al.com/juri'); await page.waitForTimeout(900);
  const m=await steps(page); console.log(width+'px', JSON.stringify(m)); if(m.bad) bad++;
  await ctx.close(); }
const state=(page,id)=>page.evaluate(id=>{ const c=document.querySelector('.jcard[data-id="'+id+'"]'); const r=c&&c.__jwa; const strip=c.querySelector('.jwa'), ring=c.querySelector('svg.jring'); const figs=[...c.querySelectorAll('.jwfig')].filter(f=>+f.style.opacity>0.2);
  return {rig:!!r, st:r?r.state:null, cnt:ring.querySelector('text').textContent, strip:strip.style.visibility, ringX:ring.style.transform, figs:figs.length, nl:c.querySelector('.jwnl').textContent, nlOp:+c.querySelector('.jwnl').style.opacity||0, lf:c.querySelector('.jwlf').textContent, lfOp:+c.querySelector('.jwlf').style.opacity||0, lot:r?r.lot:null, pending:!!JWALK.pending}; },id);
await run(1366,900,async page=>{
  const id0=ord[0].id, id1=ord[1].id, id2=ord[2].id;
  const s0=await state(page,id0); // closed: rig built, ring at rest with the live counter 0
  const z=await page.$('.jcard[data-id="'+id0+'"]'); const bb=await z.boundingBox(); await page.mouse.move(bb.x+bb.width/2,bb.y+bb.height*0.55); await page.waitForTimeout(650);   // v11o: hover anywhere on the card
  const mid=await state(page,id0); await page.screenshot({path:path.join(OUT,'ring_desk_mid.png')});
  await page.waitForTimeout(3600); const open=await state(page,id0); await page.screenshot({path:path.join(OUT,'ring_desk_open.png')});
  // a refresh while open is deferred, then applied on close
  await page.evaluate(()=>loadMeydan()); await page.waitForTimeout(300); const pend=await state(page,id0);
  await page.mouse.move(5,5); await page.waitForTimeout(900); const closed=await state(page,id0); await page.screenshot({path:path.join(OUT,'ring_desk_closed.png')});
  // open run card: "n kaldı"; empty card: "henüz kimse yok"
  const z1=await page.$('.jcard[data-id="'+id1+'"]'); const b1=await z1.boundingBox(); await page.mouse.move(b1.x+b1.width/2,b1.y+b1.height*0.55); await page.waitForTimeout(3000); const run1=await state(page,id1); await page.screenshot({path:path.join(OUT,'ring_desk_run.png')}); await page.mouse.move(5,5); await page.waitForTimeout(900);
  const z2=await page.$('.jcard[data-id="'+id2+'"]'); const b2=await z2.boundingBox(); await page.mouse.move(b2.x+b2.width/2,b2.y+b2.height*0.55); await page.waitForTimeout(900); const run2=await state(page,id2); await page.mouse.move(5,5); await page.waitForTimeout(900);
  // the drawer must not open from the ring (click)
  const zz=await page.$('.jcard[data-id="'+id0+'"] .jwz'); const zb=await zz.boundingBox(); await page.mouse.move(zb.x+25,zb.y+25); await page.mouse.click(zb.x+25,zb.y+25); await page.waitForTimeout(300); const drawer=await page.evaluate(()=>!!document.getElementById('jDrawer'));
  await page.mouse.click(bb.x+bb.width/2,bb.y+bb.height*0.45); await page.waitForTimeout(400); const drawer2=await page.evaluate(()=>!!document.getElementById('jDrawer')); await page.evaluate(()=>{ try{ jDeskClose(); }catch(e){} }); await page.waitForTimeout(300);
  return {s0,mid,open,pend,closed,run1,run2,drawer,drawer2,bad:!(!drawer&&drawer2&&s0.rig&&s0.st==='closed'&&s0.cnt==='0'&&mid.st==='opening'&&mid.strip==='visible'&&open.st==='open'&&open.cnt==='17'&&open.lot===true&&open.lf==='kavruluyor'&&open.figs===0&&pend.pending&&closed.st==='closed'&&closed.cnt==='0'&&closed.strip==='hidden'&&!closed.pending&&run1.st==='open'&&run1.cnt==='10'&&run1.lf==='30 kaldı'&&run2.nl.startsWith('henüz kimse yok'))}; });
await run(390,844,async page=>{
  const id0=ord[0].id;
  await page.evaluate(id=>{ document.querySelector('#jDeck .jcard[data-id="'+id+'"]').scrollIntoView({block:'center',inline:'center'}); },id0); await page.waitForTimeout(300);
  const z=await page.$('#jDeck .jcard[data-id="'+id0+'"] .jwz'); const bb=await z.boundingBox(); await page.touchscreen.tap(bb.x+25,bb.y+25); await page.waitForTimeout(900);
  const mid=await state(page,id0); await page.screenshot({path:path.join(OUT,'ring_phone_mid.png')});
  await page.waitForTimeout(3000); const open=await state(page,id0); await page.screenshot({path:path.join(OUT,'ring_phone_open.png')});
  await page.waitForTimeout(6500); const auto=await state(page,id0);   // auto-close 5 s after the walk ends
  await page.touchscreen.tap(bb.x+25,bb.y+25); await page.waitForTimeout(1500); const re=await state(page,id0); await page.touchscreen.tap(bb.x+25,bb.y+25); await page.waitForTimeout(900); const tap2=await state(page,id0);
  const lanes=await page.evaluate(()=>!!document.querySelector('.jcard.lopen'));
  return {mid,open,auto,re,tap2,lanes,bad:!(mid.st==='opening'&&mid.strip==='visible'&&open.st==='open'&&open.cnt==='17'&&auto.st==='closed'&&re.st==='opening'&&(tap2.st==='closing'||tap2.st==='closed')&&!lanes)}; });
await browser.close(); console.log(bad?'BAD':'ok');
