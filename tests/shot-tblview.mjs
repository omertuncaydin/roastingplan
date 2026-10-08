// v12n: the ticket view for everyone — "Hemen-Al · n kaldı" → golden table tickets with Al (phone 390 + desktop 1366)
import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname);
const html=fs.readFileSync(path.join(here,'..','grupal.html'),'utf8');
const MD=JSON.parse(fs.readFileSync(path.join(here,'mock-meydan.json'),'utf8'));
const ord=MD.offers.slice().sort((a,b)=>((b.dep||0)-(a.dep||0)));
const M=JSON.parse(JSON.stringify(MD)); const T0=M.offers.find(x=>x.id===ord[0].id); T0.name='El Recreo #1'; T0.img_url='https://x.test/o/222.jpg'; T0.list_tl=1240; T0.jury_tl=745; T0.dep=17;
T0.hemen={url:'https://coffeenutz.net/cart/222:1',price:990,base:0,sold:0,inv:0,left:0,green_left:null,roast_at:'2026-10-11T20:59:00.000Z',priv:0,table_n:7,table:[['TBLA1','Barış'],['TBLA2','Ece'],['TBLA3','Nihat'],['TBLA4','Ayşe'],['TBLA5','Mehmet'],['TBLA6','Zeynep'],['TBLA7','Can']].map(([c,n],i)=>({c,n,tat:new Date(Date.now()-(8-i)*3600000).toISOString()}))};
if(M.cycle) M.cycle.next_close=new Date(Date.now()+3*86400000).toISOString();
const photo=fs.existsSync(path.join(here,'..','..','_shots','fakephoto.b64'))?fs.readFileSync(path.join(here,'..','..','_shots','fakephoto.b64'),'utf8'):'';
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const OUT=path.join(here,'..','..','_shots'); let bad=0;
for(const [w,h,tag,mobile] of [[390,844,'phone',true],[1366,900,'desk',false]]){
  const ctx=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,locale:'tr-TR',isMobile:mobile,hasTouch:mobile}); await ctx.addInitScript(()=>{ try{ localStorage.clear(); localStorage.setItem('grupal_welcomed','1'); localStorage.setItem('grupal_dev','DEVTEST001'); localStorage.setItem('grupal_terms_v','1'); }catch(e){} });
  const page=await ctx.newPage();
  await page.route('**/*',async route=>{ const u=route.request().url();
    if(u.startsWith('https://grup-al.com/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
    if(u.includes('x.test/o/')) return photo?route.fulfill({status:200,contentType:'image/jpeg',body:Buffer.from(photo.split(',')[1],'base64')}):route.fulfill({status:404,body:''});
    if(u.includes('/meydan')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(M)});
    if(u.includes('/offer-mine')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({votes:[],inv:[],hemen:[],moved:[],me:{member:false,name:'',ok:true,k:'k9'}})});
    if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'}); return route.fulfill({status:204,body:''}); });
  await page.goto('https://grup-al.com/juri'); await page.waitForTimeout(1200);
  await page.evaluate(id=>jTblOpen(id),T0.id); await page.waitForTimeout(500);
  const n=await page.evaluate(()=>document.querySelectorAll('#jSheet .jtk.gt.pub').length); if(n!==7) bad++;
  await page.screenshot({path:path.join(OUT,'tblview_'+tag+'.png')});
  await page.evaluate(()=>{ const b=document.querySelector('#jSheet .jtk.gt.pub .snd'); b&&eval(b.getAttribute('onclick')); }); await page.waitForTimeout(400);
  await page.screenshot({path:path.join(OUT,'tblview_'+tag+'_inb.png')});
  // v12p: quota seats (proxy still reporting left 2) render as full-width seat tickets
  await page.evaluate(id=>{ const o=STATE.offers.find(x=>x.id===id); o.hemen.left=2; o.hemen.table=[]; o.hemen.table_n=0; hbDel(id); jTblOpen(id); },T0.id); await page.waitForTimeout(400);
  const sw=await page.evaluate(()=>{ const e=document.querySelector('#jSheet .jtk.gt.kseat'); return e?e.getBoundingClientRect().width:0; }); if(sw<300) bad++;
  await page.screenshot({path:path.join(OUT,'tblview_'+tag+'_seat.png')});
  await ctx.close(); }
await browser.close(); console.log(bad?'BAD':'ok');
