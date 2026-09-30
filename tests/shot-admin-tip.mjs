// v30p: Jüri üyeleri — hover on "n paket" shows the per-coffee breakdown (proxy v3.51 coffees)
import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const html=fs.readFileSync(process.cwd()+'/grupal-admin.html','utf8');
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const ctx=await browser.newContext({viewport:{width:1100,height:800},deviceScaleFactor:2,locale:'tr-TR'}); const page=await ctx.newPage();
const users=[{email:'drbarban@yahoo.com',name:'Barış Bağbancı',phone:'+905322262653',wa:false,ok:true,boxes:4,hemen:1,orders:2,devs:1,first:'2026-09-20T10:00:00Z',last:'2026-09-29T18:33:00Z',coffees:[{name:'El Recreo #1',q:2,hemen:0,conv:2,done:0},{name:'Baho Natural #2',q:1,hemen:1,conv:0,done:0},{name:'AA Inoi Kianderi #035',q:1,hemen:0,conv:0,done:0}]},
 {email:'s.abencem@gmail.com',name:'Cem Tanır',phone:'+905539597371',wa:false,ok:true,boxes:2,hemen:0,orders:1,devs:1,first:'2026-09-28T18:11:00Z',last:'2026-09-28T18:11:00Z',coffees:[{name:'El Recreo #1',q:2,hemen:0,conv:2,done:0}]}];
await page.route('**/*',async route=>{ const u=route.request().url(); const m=route.request().method();
  if(u.startsWith('https://guide.coffeenutz.net/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
  if(u.includes('/admin/users')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,n:users.length,users})});
  if(u.endsWith('/admin/offers')) return route.fulfill({status:200,contentType:'application/json',body:'[]'});
  return route.fulfill({status:200,contentType:'application/json',body:'{"ok":true,"offers":[],"settings":{}}'}); });
await page.addInitScript(()=>{ try{ localStorage.setItem('grupalKey','k'); }catch(e){} });
await page.goto('https://guide.coffeenutz.net/grupal-admin'); await page.waitForTimeout(600);
await page.evaluate(async()=>{ KEY='k'; const d=document.getElementById('memSet'); if(d) d.open=true; await loadUsers(); }); await page.waitForTimeout(400);
const tip=await page.$('#userList b.tip'); await tip.scrollIntoViewIfNeeded(); await tip.hover(); await page.waitForTimeout(300);
const box=await page.evaluate(()=>{ const el=document.getElementById('userList'); const r=el.getBoundingClientRect(); return {x:Math.max(0,r.left-8),y:Math.max(0,r.top-40),width:Math.min(r.width+16,1100),height:Math.min(r.height+60,600)}; });
await page.screenshot({path:'/tmp/_shots/admin_tip.png',clip:box});
console.log(await page.evaluate(()=>document.querySelector('#userList b.tip').getAttribute('data-tip')));
await browser.close(); console.log('ok');
