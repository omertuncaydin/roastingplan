// masa mockups → one screenshot per mockup (finished state) + a mid-animation frame for 1 and 3
import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const html=fs.readFileSync('/tmp/work6/mock/masa/masa-mockups.html','utf8');
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const ctx=await browser.newContext({viewport:{width:420,height:900},deviceScaleFactor:2,locale:'tr-TR'}); const page=await ctx.newPage();
await page.route('**/*',async route=>{ const u=route.request().url(); if(u.startsWith('https://mock.test/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html}); return route.fulfill({status:204,body:''}); });
await page.goto('https://mock.test/masa'); await page.waitForTimeout(7000);
const OUT='/tmp/_shots/masa'; fs.mkdirSync(OUT,{recursive:true});
const secs=await page.$$('section'); console.log('sections',secs.length);
for(let i=0;i<secs.length;i++){ await secs[i].scrollIntoViewIfNeeded(); await page.waitForTimeout(200); await secs[i].screenshot({path:path.join(OUT,'m'+(i+1)+'.png')}); }
// mid-animation frames
for(const n of [1,2,3,4,5]){ await page.evaluate(k=>window.masaPlay(k),n); await page.waitForTimeout(900); const s=secs[n-1]; await s.scrollIntoViewIfNeeded(); await s.screenshot({path:path.join(OUT,'m'+n+'_mid.png')}); await page.waitForTimeout(2600); console.log('done',n,await page.evaluate(k=>window.masaDone(k),n)); }
await page.screenshot({path:path.join(OUT,'all.png'),fullPage:true});
await browser.close(); console.log('ok');
