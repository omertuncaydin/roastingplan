// v11w: "Seçilmezse kaydır" tickbox in the kapora bar · roll line in the lane · Hemen-Al grind select — phone + desktop
import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname);
const html=fs.readFileSync(path.join(here,'..','grupal.html'),'utf8');
const MD=JSON.parse(fs.readFileSync(path.join(here,'mock-meydan.json'),'utf8'));
const ord=MD.offers.slice().sort((a,b)=>((b.dep||0)-(a.dep||0)));
const MR=JSON.parse(JSON.stringify(MD)); const R0=MR.offers.find(x=>x.id===ord[0].id), R1=MR.offers.find(x=>x.id===ord[1].id), R2=MR.offers.find(x=>x.id===ord[2].id);
for(const [o,v,p] of [[R0,222,990],[R1,333,980]]){ o.img_url='https://x.test/o/'+v+'.jpg'; o.hemen={url:'https://coffeenutz.net/cart/'+v+':1',price:p,base:3,sold:0,inv:0,left:3,green_left:null,table:[],roast_at:'2026-10-05T20:59:00.000Z'}; o.list_tl=1240; o.jury_tl=745; }
const photo=fs.existsSync(path.join(here,'..','..','_shots','fakephoto.b64'))?fs.readFileSync(path.join(here,'..','..','_shots','fakephoto.b64'),'utf8'):'';
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const OUT=path.join(here,'..','..','_shots'); fs.mkdirSync(OUT,{recursive:true}); let bad=0;
for(const [w,h,tag,mobile] of [[390,844,'phone',true],[1366,900,'desk',false]]){
  const ctx=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,locale:'tr-TR',isMobile:mobile,hasTouch:mobile}); await ctx.addInitScript(()=>{ try{ localStorage.clear(); localStorage.setItem('grupal_welcomed','1'); localStorage.setItem('grupal_dev','DEVTEST001'); localStorage.setItem('grupal_terms_v','1'); }catch(e){} });
  const page=await ctx.newPage();
  await page.route('**/*',async route=>{ const u=route.request().url();
    if(u.startsWith('https://grup-al.com/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
    if(u.includes('x.test/o/')) return photo?route.fulfill({status:200,contentType:'image/jpeg',body:Buffer.from(photo.split(',')[1],'base64')}):route.fulfill({status:404,body:''});
    if(u.includes('/meydan')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(MR)});
    if(u.includes('/offer-mine')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({votes:[{id:R2.id,paid:true,qty:1,roll:true}],inv:[],hemen:[],moved:[],me:{member:true,name:'Ömer Aydın',wa:true,ok:true,k:'k6'}})});
    if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'}); return route.fulfill({status:204,body:''}); });
  await page.goto('https://grup-al.com/juri'); await page.waitForTimeout(1200);
  await page.evaluate(([a,b])=>{ dbAdd(a,1); jHemenGo(b,null,1); },[R0.id,R1.id]); await page.waitForTimeout(400);
  await page.screenshot({path:path.join(OUT,'roll_bars_'+tag+'.png')});
  const st=await page.evaluate(()=>({roll:!!document.querySelector('#dbBar #dbRoll'), grind:!!document.querySelector('#hbBar select.hbgrind'), txt:document.getElementById('dbBar').textContent}));
  if(!(st.roll&&st.grind&&/Seçilmezse oyumu/.test(st.txt))) bad++;
  if(mobile){ await page.evaluate(id=>{ document.querySelector('#jDeck .jcard[data-id="'+id+'"]').scrollIntoView({block:'center',inline:'center'}); jLaneOpen(id); },R2.id); await page.waitForTimeout(600); await page.screenshot({path:path.join(OUT,'roll_lane_phone.png')});
    const ln=await page.evaluate(()=>{ const e=document.querySelector('.jcard.lopen .jlane.ga .jroll'); return e?e.textContent:''; }); if(!/en popülere kayar ✓/.test(ln)) bad++; }
  await ctx.close(); }
await browser.close(); console.log(bad?'BAD':'ok');
