// v11q: Hemen-Al basket on the real page (phone): Sepete git on coffee A → (back from Shopify) → Sepete git on coffee B → one link with both; bar + lane line
import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname);
const html=fs.readFileSync(path.join(here,'..','grupal.html'),'utf8');
const MD=JSON.parse(fs.readFileSync(path.join(here,'mock-meydan.json'),'utf8'));
const ord=MD.offers.slice().sort((a,b)=>((b.dep||0)-(a.dep||0)));
const MH=JSON.parse(JSON.stringify(MD)); const A=MH.offers.find(x=>x.id===ord[0].id), B=MH.offers.find(x=>x.id===ord[1].id);
for(const [o,v,p] of [[A,222,990],[B,333,980]]){ o.img_url='https://x.test/o/'+v+'.jpg'; o.hemen={url:'https://coffeenutz.net/cart/'+v+':1',price:p,base:3,sold:0,inv:0,left:3,green_left:null,table:[],roast_at:'2026-10-05T20:59:00.000Z'}; o.list_tl=1240; o.jury_tl=745; }
const photo=fs.existsSync(path.join(here,'..','..','_shots','fakephoto.b64'))?fs.readFileSync(path.join(here,'..','..','_shots','fakephoto.b64'),'utf8'):'';
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const OUT=path.join(here,'..','..','_shots'); fs.mkdirSync(OUT,{recursive:true});
const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,locale:'tr-TR',isMobile:true,hasTouch:true}); await ctx.addInitScript(()=>{ try{ localStorage.clear(); localStorage.setItem('grupal_welcomed','1'); localStorage.setItem('grupal_dev','DEVTEST001'); }catch(e){} });
const page=await ctx.newPage(); const links=[];
await page.route('**/*',async route=>{ const u=route.request().url();
  if(u.startsWith('https://grup-al.com/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
  if(u.includes('x.test/o/')) return photo?route.fulfill({status:200,contentType:'image/jpeg',body:Buffer.from(photo.split(',')[1],'base64')}):route.fulfill({status:404,body:''});
  if(u.includes('/meydan')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(MH)});
  if(u.includes('/offer-mine')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({votes:[],inv:[],hemen:[],me:{member:true,name:'Ömer Aydın',wa:true,ok:true,k:'k6'}})});
  if(u.includes('/hemen-link')){ const b=route.request().postDataJSON(); links.push(b); return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,url:'https://coffeenutz.net/cart/'+b.items.map(i=>(i.id===A.id?222:333)+':'+i.qty).join(',')+'?discount=HAMULTI1&attributes[hemen]=1',items:b.items})}); }
  if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'}); return route.fulfill({status:204,body:''}); });
await page.goto('https://grup-al.com/juri'); await page.waitForTimeout(900);
await page.evaluate(()=>{ window.__nav=[]; window.jNavigate=u=>{ window.__nav.push(u); }; });
// coffee A: open lane → Sepete → stepper 2 → Sepete git
await page.evaluate(id=>jLaneOpen(id),A.id); await page.waitForTimeout(500);
await page.evaluate(id=>{ jHemenPick(id); jHemenQty(id,1); },A.id); await page.waitForTimeout(300);
await page.evaluate(id=>jHemenGo(id,null,2),A.id); await page.waitForTimeout(400); await page.screenshot({path:path.join(OUT,'hbasket_added.png')}); await page.evaluate(()=>hbGo()); await page.waitForTimeout(500);
// "back from Shopify": re-render → bar visible; open coffee B
await page.evaluate(()=>{ jLaneClose(); renderOffers(STATE); }); await page.waitForTimeout(300);
await page.evaluate(id=>{ document.querySelector('#jDeck .jcard[data-id="'+id+'"]').scrollIntoView({block:'center',inline:'center'}); jLaneOpen(id); },B.id); await page.waitForTimeout(600);
await page.evaluate(id=>jHemenPick(id),B.id); await page.waitForTimeout(300);
await page.screenshot({path:path.join(OUT,'hbasket_lane.png')});
await page.evaluate(id=>jHemenGo(id,null,1),B.id); await page.waitForTimeout(400); await page.evaluate(()=>hbGo()); await page.waitForTimeout(500);
await page.evaluate(()=>{ jLaneClose(); renderOffers(STATE); }); await page.waitForTimeout(300);
await page.screenshot({path:path.join(OUT,'hbasket_bar.png')});
const st=await page.evaluate(()=>({nav:window.__nav, items:hbItems(), bar:document.getElementById('hbBar')&&document.getElementById('hbBar').textContent}));
console.log(JSON.stringify({links:links.map(l=>l.items), ...st}));
const ok=links.length===2&&links[1].items.length===2&&st.nav[1].includes('222:2,333:1')&&st.items.length===2&&/2 kahve · 3 paket · 2\.960 TL/.test(st.bar);
await browser.close(); console.log(ok?'ok':'BAD');
