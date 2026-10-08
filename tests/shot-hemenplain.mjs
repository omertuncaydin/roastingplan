// v12g: plain Hemen-Al page (grup-al.com/hemen-al) — phone + desktop, one coffee in the basket
import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname);
const html=fs.readFileSync(path.join(here,'..','grupal.html'),'utf8');
const MD=JSON.parse(fs.readFileSync(path.join(here,'mock-meydan.json'),'utf8'));
const ord=MD.offers.slice().sort((a,b)=>((b.dep||0)-(a.dep||0)));
const MH=JSON.parse(JSON.stringify(MD)); const S=[ord[0],ord[1],ord[2],ord[3]].map(o=>MH.offers.find(x=>x.id===o.id));
const lane=(o,v,p,left)=>{ o.img_url='https://x.test/o/'+v+'.jpg'; o.hemen={url:'https://coffeenutz.net/cart/'+v+':1',price:p,base:3,sold:3-left,inv:0,left,green_left:null,table:[],roast_at:'2026-10-12T20:59:00.000Z'}; o.list_tl=Math.round(p/0.8); o.jury_tl=Math.round(p/0.8*0.6); };
S[0].name='El Recreo #1'; S[0].process='natural'; S[0].note='Huila · 87,5 puan · natural · kırmızı ve sarı meyve, tropik dokunuş, sütlü çikolata'; S[0].dep=0; S[0].lock={at:'2026-09-30T10:00:00Z',n:1,close:'2026-10-04T20:59:00Z',state:'locked',dep:17,dep_tl:100,forced:true,people:[]}; S[0].conv=17; lane(S[0],201,990,14);
S[1].name='La Soledad #8'; S[1].process='honey'; S[1].note='Huila · 86,5 puan · honey · koyu orman meyvesi, siyah çay'; S[1].dep=4; lane(S[1],202,980,2);
S[2].name='AA Inoi Kianderi #035'; S[2].process='washed'; S[2].note='Kenya · 88 puan · washed · sulu siyah frenk üzümü'; S[2].dep=4; lane(S[2],203,855,4);
S[3].name='Nuwa Senchi #3'; S[3].process='washed'; S[3].note='Peru · 86,8 puan · washed · şarabımsı koyu erik, koyu orman meyvesi reçeli'; S[3].dep=1; lane(S[3],204,865,0); S[3].hemen.table=[{c:'TBL1',n:'Nihat',tat:'2026-10-07T07:09:20Z'},{c:'TBL2',n:'Nihat',tat:'2026-10-07T10:24:28Z'}];
if(MH.cycle) MH.cycle.next_close=new Date(Date.now()+5*86400000).toISOString();
const photo=fs.existsSync(path.join(here,'..','..','_shots','fakephoto.b64'))?fs.readFileSync(path.join(here,'..','..','_shots','fakephoto.b64'),'utf8'):'';
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const OUT=path.join(here,'..','..','_shots'); let bad=0;
for(const [w,h,tag,mobile] of [[390,844,'phone',true],[1366,900,'desk',false]]){
  const ctx=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,locale:'tr-TR',isMobile:mobile,hasTouch:mobile}); await ctx.addInitScript(()=>{ try{ localStorage.clear(); localStorage.setItem('grupal_welcomed','1'); localStorage.setItem('grupal_dev','DEVTEST001'); }catch(e){} });
  const page=await ctx.newPage();
  await page.route('**/*',async route=>{ const u=route.request().url();
    if(u.startsWith('https://grup-al.com/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
    if(u.includes('x.test/o/')) return photo?route.fulfill({status:200,contentType:'image/jpeg',body:Buffer.from(photo.split(',')[1],'base64')}):route.fulfill({status:404,body:''});
    if(u.includes('/meydan')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(MH)});
    if(u.includes('/offer-mine')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({votes:[],inv:[],hemen:[],me:{member:true,name:'Ömer',wa:true,ok:true,k:'k6'}})});
    if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'}); return route.fulfill({status:204,body:''}); });
  await page.goto('https://grup-al.com/hemen-al'); await page.waitForTimeout(1300);
  await page.evaluate(id=>jHemenGo(id,null,1),S[1].id); await page.waitForTimeout(400);
  await page.screenshot({path:path.join(OUT,'hemenplain_'+tag+'.png')});
  const st=await page.evaluate(()=>({rows:document.querySelectorAll('.hp .hpc').length, plain:document.body.classList.contains('hplain'), deck:!!document.getElementById('jDeck'), bar:!!document.getElementById('hbBar')}));
  console.log(tag,JSON.stringify(st)); if(!(st.rows===4&&st.plain&&!st.deck&&st.bar)) bad++;
  await ctx.close(); }
await browser.close(); console.log(bad?'BAD':'ok');
