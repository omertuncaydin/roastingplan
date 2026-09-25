// Render the Jüri page at desktop and phone widths (Playwright; run from the repo root: node tests/shot-desk.mjs)
import { chromium } from 'playwright-core';
import fs from 'fs'; import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname);
const html=fs.readFileSync(path.join(here,'..','grupal.html'),'utf8');
const MD=JSON.parse(fs.readFileSync(path.join(here,'mock-meydan.json'),'utf8'));
const ord=MD.offers.slice().sort((a,b)=>((b.dep||0)-(a.dep||0))); const mineId=ord[5].id;
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
async function shot(vp,theme,name,steps){
  const ctx=await browser.newContext({viewport:vp,deviceScaleFactor:1.5,locale:'tr-TR'});
  await ctx.addInitScript((th)=>{ try{ if(th==='dark') localStorage.removeItem('grupal_theme'); else localStorage.setItem('grupal_theme',th); localStorage.removeItem('grupal_jband'); localStorage.removeItem('grupal_jdf'); localStorage.removeItem('grupal_dbasket'); }catch(e){} },theme);
  const page=await ctx.newPage();
  await page.route('**/*',async route=>{ const u=route.request().url();
    if(u.startsWith('https://grup-al.com/juri')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
    if(u.includes('/meydan')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(MD)});
    if(u.includes('/offer-mine')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({votes:[{id:mineId,paid:true,qty:2}]})});
    if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'});
    return route.fulfill({status:204,body:''}); });
  await page.goto('https://grup-al.com/juri'); await page.waitForTimeout(1200);
  if(steps) await steps(page);
  await page.screenshot({path:path.join(here,'..','..','_shots',name+'.png')});
  const info=await page.evaluate(()=>({desk:document.body.classList.contains('jdesk'),cards:document.querySelectorAll('.jcard').length,grid:!!document.querySelector('.jdk-grid'),deck:!!document.getElementById('jDeck'),drawer:!!document.getElementById('jDrawer'),err:window.__err||null}));
  console.log(name, JSON.stringify(info)); await ctx.close(); }
fs.mkdirSync(path.join(here,'..','..','_shots'),{recursive:true});
await shot({width:1366,height:820},'dark','desk_dark');
// with photos: two showcase cards + list
{ const photo=fs.existsSync(path.join(here,'..','..','_shots','fakephoto.b64'))?fs.readFileSync(path.join(here,'..','..','_shots','fakephoto.b64'),'utf8'):'';
  const MDP=JSON.parse(JSON.stringify(MD)); MDP.offers[0].img_url='https://x.test/o/a.jpg'; MDP.offers[3].img_url='https://x.test/o/b.jpg';
  const ctx=await browser.newContext({viewport:{width:1366,height:820},deviceScaleFactor:1.5,locale:'tr-TR'}); await ctx.addInitScript(()=>{ try{ localStorage.clear(); }catch(e){} }); const page=await ctx.newPage();
  await page.route('**/*',async route=>{ const u=route.request().url();
    if(u.startsWith('https://grup-al.com/juri')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
    if(u.includes('x.test/o/')) return photo?route.fulfill({status:200,contentType:'image/jpeg',body:Buffer.from(photo.split(',')[1],'base64')}):route.fulfill({status:404,body:''});
    if(u.includes('/meydan')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(MDP)});
    if(u.includes('/offer-mine')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({votes:[{id:mineId,paid:true,qty:2}]})});
    if(u.includes('/campaigns')) return route.fulfill({status:200,contentType:'application/json',body:'[]'}); return route.fulfill({status:204,body:''}); });
  await page.goto('https://grup-al.com/juri'); await page.waitForTimeout(1400); await page.screenshot({path:path.join(here,'..','..','_shots','desk_photos_list.png')}); await ctx.close(); }
await shot({width:1366,height:820},'red','desk_red', async p=>{ await p.click('.jcard[data-i="1"]'); await p.waitForTimeout(400); });
await shot({width:1366,height:820},'isik','desk_isik', async p=>{ await p.click('.jdk-f:nth-child(3)'); await p.waitForTimeout(300); });
await shot({width:390,height:844},'dark','phone_dark');
await browser.close();
