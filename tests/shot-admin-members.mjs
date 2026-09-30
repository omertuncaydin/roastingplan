// admin members panel render check (v30k) at the admin's real column width
import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname);
const html=fs.readFileSync(path.join(here,'..','grupal-admin.html'),'utf8');
const users=[{email:'drbarban@yahoo.com',name:'Barış Bağbancı',phone:'+905322262653',wa:false,ok:true,boxes:4,hemen:0,orders:0,devs:1,banned:false,first:'2026-09-29T18:33:00Z',last:'2026-09-29T18:33:00Z'},{email:'s.abencem@gmail.com',name:'Cem Tanır',phone:'+905539597371',wa:true,wa_by:'admin',wa_at:'2026-09-30T08:00:00Z',ok:true,boxes:2,hemen:1,orders:1,devs:1,banned:false,first:'2026-09-28T18:11:00Z',last:'2026-09-28T18:11:00Z'},{email:'mzshawa@gmail.com',name:'MHD Muaaz ALSHAWA',phone:'+905316305075',wa:false,ok:false,boxes:2,hemen:0,orders:0,devs:2,banned:true,first:'2026-09-20T16:36:00Z',last:'2026-09-20T16:36:00Z'}];
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const ctx=await browser.newContext({viewport:{width:1366,height:900},deviceScaleFactor:1.5,locale:'tr-TR'}); await ctx.addInitScript(()=>{ try{ localStorage.setItem('grupalKey','adminkey'); }catch(e){} }); const page=await ctx.newPage();
await page.route('**/*',async route=>{ const u=route.request().url();
  if(u.startsWith('https://guide.coffeenutz.net/')&&!u.includes('/functions/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
  if(u.endsWith('/admin/users')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,n:users.length,users})});
  if(u.endsWith('/admin/list')) return route.fulfill({status:200,contentType:'application/json',body:'[]'});
  if(u.endsWith('/admin/offers')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,offers:[],cfg:{goal:40}})});
  if(u.endsWith('/admin/settings')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({settings:{},cfg:{goal:40}})});
  if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'}); return route.fulfill({status:200,contentType:'application/json',body:'{}'}); });
await page.goto('https://guide.coffeenutz.net/grupal-admin'); await page.waitForTimeout(800);
await page.evaluate(()=>{ const k=document.getElementById('ccKey'); if(k){ k.value='adminkey'; } return typeof unlock==='function'?unlock():null; }); await page.waitForTimeout(800);
await page.evaluate(()=>{ const d=document.getElementById('memSet'); if(d) d.open=true; }); await page.waitForTimeout(300);
const el=await page.$('#memSet'); const box=await el.boundingBox(); const over=await page.evaluate(()=>{ const d=document.getElementById('memSet'); const r=d.getBoundingClientRect(); return [...d.querySelectorAll('button')].some(b=>b.getBoundingClientRect().right>r.right+1); });
await el.screenshot({path:'/tmp/_shots/admin_members.png'}); console.log('overflow:',over, 'height',Math.round(box.height)); await browser.close(); if(over) process.exit(1);
