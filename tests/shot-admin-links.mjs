// v2026-10-02a (proxy v3.55): "Sipariş eşle" — PayTR ödedi, Shopify sipariş yok: link listesi + elle eşleme formu
import { chromium } from 'playwright-core'; import fs from 'fs';
const html=fs.readFileSync(process.cwd()+'/grupal-admin.html','utf8');
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const ctx=await browser.newContext({viewport:{width:1100,height:900},deviceScaleFactor:2,locale:'tr-TR'}); const page=await ctx.newPage();
const OFF=[{id:'ab76b0ca-f23c-41a3-b1b3-99bd6d450f1a',name:'El Recreo #1',pub:true,locked:true},{id:'22222222-2222-4222-8222-222222222222',name:'Baho',pub:true,locked:false},{id:'33333333-3333-4333-8333-333333333333',name:'AA Inoi',pub:true,locked:false}];
const links=[
  {code:'GAKPGZ4Y',kind:'done',offer:OFF[0].id,coffee:'El Recreo #1',dev:'VGZPK1CBVR',email:'bkermen@gmail.com',name:'Burçin Kermen',at:'2026-10-02T07:02:00.000Z',exp:'2026-10-03T07:02:00.000Z',qty:1,total:645,off:595,inv:null,state:'missing',x:null},
  {code:'HAQ7R2MN',kind:'hemen',offer:OFF[1].id,coffee:'Baho',dev:'K3PD8ZT1QW',email:null,name:'',at:'2026-10-02T13:41:00.000Z',exp:'2026-10-02T15:41:00.000Z',qty:2,total:2560,off:640,inv:null,state:'wait',x:null},
  {code:'GAZ4N8PL',kind:'done',offer:OFF[0].id,coffee:'El Recreo #1',dev:'JURY000001',email:'drbarban@yahoo.com',name:'Barış Bağbancı',at:'2026-10-01T09:12:00.000Z',exp:'2026-10-02T09:12:00.000Z',qty:2,total:1290,off:1190,inv:null,state:'ok',x:null},
  {code:'HAX2V9KD',kind:'hemen',offer:OFF[2].id,coffee:'AA Inoi',dev:'RT5MN2PQ8S',email:null,name:'Can',at:'2026-09-30T19:05:00.000Z',exp:'2026-09-30T21:05:00.000Z',qty:1,total:1280,off:320,inv:'A7KQ2M',state:'x',x:'2026-10-01T08:00:00Z'}];
await page.route('**/*',async route=>{ const u=route.request().url();
  if(u.startsWith('https://guide.coffeenutz.net/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
  if(u.endsWith('/admin/links-open')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,links,n_missing:1,offers:OFF})});
  if(u.includes('/admin/users')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,n:0,users:[]})});
  if(u.endsWith('/admin/offers')) return route.fulfill({status:200,contentType:'application/json',body:'[]'});
  return route.fulfill({status:200,contentType:'application/json',body:'{"ok":true,"offers":[],"settings":{}}'}); });
await page.addInitScript(()=>{ try{ localStorage.setItem('grupalKey','k'); }catch(e){} });
await page.goto('https://guide.coffeenutz.net/grupal-admin'); await page.waitForTimeout(600);
await page.evaluate(async()=>{ KEY='k'; const d=document.getElementById('lnkSet'); if(d) d.open=true; await loadLinks(); omFill('GAKPGZ4Y'); document.getElementById('om_order').value='19090156192048'; }); await page.waitForTimeout(400);
const box=await page.evaluate(()=>{ const el=document.getElementById('lnkSet'); el.scrollIntoView(); const r=el.getBoundingClientRect(); return {x:Math.max(0,r.left-8),y:Math.max(0,r.top-8),width:Math.min(r.width+16,1100),height:Math.min(r.height+16,880)}; });
await page.screenshot({path:'/tmp/_shots/admin_links.png',clip:box});
console.log(await page.evaluate(()=>document.getElementById('lnkSub').textContent+' | '+document.getElementById('lnkList').textContent.slice(0,160)));
await browser.close(); console.log('ok');
