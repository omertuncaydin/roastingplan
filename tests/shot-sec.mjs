// v11u: "Benim için seç" (maket B) on the real page — phone sheet: chips → jury's pick card → quantity → Sepete ekle; desktop: sidebar button + sheet
import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname);
const html=fs.readFileSync(path.join(here,'..','grupal.html'),'utf8');
const MD=JSON.parse(fs.readFileSync(path.join(here,'mock-meydan.json'),'utf8'));
const ord=MD.offers.slice().sort((a,b)=>((b.dep||0)-(a.dep||0)));
const MH=JSON.parse(JSON.stringify(MD)); const S=[ord[0],ord[1],ord[2],ord[3]].map(o=>MH.offers.find(x=>x.id===o.id));
const lane=(o,v,p,left)=>{ o.img_url='https://x.test/o/'+v+'.jpg'; o.hemen={url:'https://coffeenutz.net/cart/'+v+':1',price:p,base:3,sold:3-left,inv:0,left,green_left:null,table:[],roast_at:'2026-10-05T20:59:00.000Z'}; o.list_tl=Math.round(p/0.8); o.jury_tl=Math.round(p/0.8*0.6); };
S[0].name='El Recreo #1'; S[0].process='natural'; S[0].note='Huila · 87,5 puan · natural · kırmızı ve sarı meyve, tropik dokunuş, sütlü çikolata'; S[0].dep=0; S[0].lock={at:'2026-09-30T10:00:00Z',n:1,close:'2026-10-04T20:59:00Z',state:'locked',dep:17,dep_tl:100,forced:true,people:[]}; S[0].conv=17; lane(S[0],201,990,14);
S[1].name='La Soledad #8'; S[1].process='honey'; S[1].note='Huila · 86,5 puan · honey · koyu orman meyvesi, siyah çay'; S[1].dep=4; lane(S[1],202,980,2);
S[2].name='AA Inoi Kianderi #035'; S[2].process='washed'; S[2].note='Kenya · 88 puan · washed · sulu siyah frenk üzümü'; S[2].dep=4; lane(S[2],203,855,4);
S[3].name='Frinsa Honey Tempe #1'; S[3].process='funky'; S[3].note='West Java · 88 puan · tempe · sakız, kırmızı jöle'; S[3].dep=2; lane(S[3],204,885,4);
const photo=fs.existsSync(path.join(here,'..','..','_shots','fakephoto.b64'))?fs.readFileSync(path.join(here,'..','..','_shots','fakephoto.b64'),'utf8'):'';
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const OUT=path.join(here,'..','..','_shots'); fs.mkdirSync(OUT,{recursive:true}); let bad=0;
for(const [w,h,file,mobile] of [[390,844,'sec_phone.png',true],[1366,900,'sec_desk.png',false]]){
  const ctx=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,locale:'tr-TR',isMobile:mobile,hasTouch:mobile}); await ctx.addInitScript(()=>{ try{ localStorage.clear(); localStorage.setItem('grupal_welcomed','1'); localStorage.setItem('grupal_dev','DEVTEST001'); }catch(e){} });
  const page=await ctx.newPage();
  await page.route('**/*',async route=>{ const u=route.request().url();
    if(u.startsWith('https://grup-al.com/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
    if(u.includes('x.test/o/')) return photo?route.fulfill({status:200,contentType:'image/jpeg',body:Buffer.from(photo.split(',')[1],'base64')}):route.fulfill({status:404,body:''});
    if(u.includes('/meydan')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(MH)});
    if(u.includes('/offer-mine')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({votes:[],inv:[],hemen:[],me:{member:true,name:'Ömer Aydın',wa:true,ok:true,k:'k6'}})});
    if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'}); return route.fulfill({status:204,body:''}); });
  await page.goto('https://grup-al.com/juri'); await page.waitForTimeout(900);
  const btn=await page.$('.jsecb'); if(!btn){ console.log(w,'no entry button'); bad++; await ctx.close(); continue; }
  await page.evaluate(()=>{ jSecOpen(); jSecK('dolgun'); }); await page.waitForTimeout(500);
  await page.screenshot({path:path.join(OUT,file)});
  const st=await page.evaluate(()=>({tag:document.querySelector('#jSheet .rc .tag').textContent, nm:document.querySelector('#jSheet .rc .nm').textContent, go:document.querySelector('#jSheet .rc .go').textContent, chips:[...document.querySelectorAll('#jSheet .chip')].map(c=>c.textContent)}));
  console.log(w, JSON.stringify(st)); if(!(st.tag==='🔥 Seçildi · 17 paket'&&st.nm==='El Recreo #1'&&/Sepete ekle · 1 × 990 TL/.test(st.go)&&st.chips.length===5)) bad++;
  await ctx.close(); }
await browser.close(); console.log(bad?'BAD':'ok');
