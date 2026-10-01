import { chromium } from 'playwright-core'; import fs from 'fs'; import path from 'path';
const html=fs.readFileSync('/tmp/work6/mock/masa/masa-card-mockups.html','utf8');
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox']});
const ctx=await browser.newContext({viewport:{width:1100,height:900},deviceScaleFactor:2,locale:'tr-TR'}); const page=await ctx.newPage();
await page.route('**/*',async route=>{ const u=route.request().url(); if(u.startsWith('https://mock.test/')) return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html}); return route.fulfill({status:204,body:''}); });
await page.goto('https://mock.test/cards'); await page.waitForTimeout(7000);
const OUT='/tmp/_shots/masa'; const secs=await page.$$('section'); console.log('sections',secs.length);
for(const [i,k] of ['A','B','C','D'].entries()){ await page.evaluate(x=>window.masaPlay(x),k); await page.waitForTimeout(1100); const s=secs[i]; if(s){ await s.scrollIntoViewIfNeeded(); await s.screenshot({path:path.join(OUT,'c'+k+'_mid.png')}); } await page.waitForTimeout(2600); if(s) await s.screenshot({path:path.join(OUT,'c'+k+'.png')}); console.log(k, await page.evaluate(x=>window.masaDone(x),k)); }
await browser.close(); console.log('ok');
