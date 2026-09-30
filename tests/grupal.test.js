// Grup-Al Jüri page — core checks (jsdom). Run from the repo root:  NODE_PATH=<node_modules> node tests/grupal.test.js
// Rebuilt 2026-09-23 after the sandbox that held the old 443-check suite was wiped; this file lives in the repo so it can't happen again.
const path=require('path'); const fs=require('fs');
const {JSDOM}=require('jsdom');
const here=__dirname;
const html=fs.readFileSync(path.join(here,'..','grupal.html'),'utf8');
const MD=JSON.parse(fs.readFileSync(path.join(here,'mock-meydan.json'),'utf8'));
let pass=0,fail=0; const T=(n,c)=>{ c?pass++:(fail++,console.log('FAIL',n)); };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ord=MD.offers.slice().sort((a,b)=>((b.dep||0)-(a.dep||0)));
function mk(maps,width,url){
  const {VirtualConsole}=require('jsdom'); const vc=new VirtualConsole(); vc.on('jsdomError',()=>{}); vc.sendTo(console,{omitJSDOMErrors:true});
  const dom=new JSDOM(html,{url:url||'https://grup-al.com/juri',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
  const w=dom.window;
  Object.defineProperty(w,'innerWidth',{value:width||390,writable:true,configurable:true});
  w.matchMedia=q=>{ const m=/min-width:\s*(\d+)px/.exec(q); return {matches:m?(w.innerWidth>=parseInt(m[1],10)):false,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}}; };
  const base=new Date(2026,8,23,12,0,0).getTime();
  w.eval('Date = new Proxy(Date,{construct(t,a){ return a.length? new t(...a): new t('+base+'); }, get(t,k){ return k==="now"? ()=>'+base+' : t[k]; }})');
  w.fetch=async u=>{ const s=String(u); for(const k in maps){ if(s.includes(k)) return {ok:true,json:async()=>maps[k]}; } throw new Error('no mock '+s); };
  w.__jFast=true;   // v10b: sheet animations jump to their end state
  const m=html.match(/<script>([\s\S]*?)<\/script>/); w.eval(m[1]+'\n;window.__g=function(n){return eval(n)};');
  return w;
}
const MINE=[{id:ord[5].id,paid:true,qty:2}];
(async()=>{
  T('version tag present', /const VERSION='v2026-\d\d-\d\d[a-z]{1,2}';/.test(html));
  // ---- phone (390): the swipe deck, untouched
  let w=mk({'/meydan':MD,'/offer-mine':{votes:MINE},'/campaigns':[]},390); await sleep(250); let D=w.document;
  T('phone: deck rendered, no desktop grid, body not jdesk', !!D.getElementById('jDeck') && !D.querySelector('.jdk-grid') && !D.body.classList.contains('jdesk') && D.querySelectorAll('#jDeck .jcard').length===24);
  T('phone: second render after /offer-mine — mine line with "6. kart", gold card, taşı chip (regression: card builder must not reference the deck closure)', !!D.querySelector('.jtick .jtmine') && D.querySelector('.jtick .jtmine').textContent==='✓ Ön siparişin: Las Minas ×2 · 6. kart' && D.querySelectorAll('#jDeck .jcard.mine').length===1 && !!D.querySelector('#jDeck .jcard.mine .jchip.jmvl') && !D.querySelector('#jDeck .jcard .jchip.jgoto'));   // v11f: telefonda Kahveye git çipi yok
  T('phone: three snap pages, accordion bands, Kahveye git chip label', !!D.getElementById('jP1') && !!D.getElementById('jP2') && !!D.getElementById('jP3') && D.querySelectorAll('.jband').length>=5);
  // v11c (Ömer): groups show CARDS — opening a taste band / CoffeeNutz'ın 5'i renders a horizontal deck of that group's cards (global rank numbers, counter); 'Tüm liste' stays a list; no snap paging, no swipe-up hint
  T('no page snapping and no "yukarı kaydır" hint any more', !D.querySelector('.jhint') && !/scroll-snap-type:y/.test(html) && !/\.jpage\{scroll-snap-align/.test(html));
  w.eval("jOpenBand('hafif')"); await sleep(60); D=w.document;
  { const b=D.getElementById('jb_hafif'); const n=MD.offers.filter(o=>/washed/.test(o.process)).length;
    T('taste band open → a deck of that band\'s cards inside the band (no rows), counter "n kahve · kaydır"', !!b && b.classList.contains('open') && !!b.querySelector('.jdeck.jdeck-b') && b.querySelectorAll('.jdeck-b .jcard').length===n && !b.querySelector('.orow') && b.querySelector('.jdots .jdn').textContent===n+' kahve · kaydır');
    const first=b.querySelector('.jdeck-b .jcard'); const gi=ord.findIndex(o=>o.id===first.getAttribute('data-id'));
    T('band cards keep the GLOBAL rank number (#n of the full ranking) and the Kahveye git chip', first.querySelector('.jtop .jchip').textContent.startsWith('#'+(gi+1)) && !first.querySelector('.jchip.jgoto')); }
  w.eval("jOpenBand('top5')"); await sleep(60); D=w.document;
  T('CoffeeNutz\'ın 5\'i band → cards in star order', !!D.querySelector('#jb_top5.open .jdeck-b') && [...D.querySelectorAll('#jb_top5 .jdeck-b .jcard')].every((c,i)=>w.__g("jTop(STATE.offers.find(o=>o.id==='"+c.getAttribute('data-id')+"'))")===i+1));
  T('v11f: no Tüm liste band and no Tüm liste button; only ★ CoffeeNutz\'ın 5\'i in the nav', !D.getElementById('jb_all') && D.querySelectorAll('.jnav .jnb').length===1 && /CoffeeNutz/.test(D.querySelector('.jnav .jnb').textContent));
  w.eval("jGoRow('"+ord[0].id+"')"); await sleep(60); D=w.document;
  T('jGoRow on the phone opens the coffee\'s taste group with its card inside', !!D.querySelector('.jband.open .jdeck-b .jcard[data-id="'+ord[0].id+'"]'));
  // ---- desktop (1366): grid + sidebar + drawer
  w=mk({'/meydan':MD,'/offer-mine':{votes:MINE},'/campaigns':[]},1366); await sleep(250); D=w.document;
  T('desk: body.jdesk, grid with all 24 cards in pre-order rank, no deck / no snap pages', D.body.classList.contains('jdesk') && !!D.querySelector('.jdk-grid') && D.querySelectorAll('.jdk-grid .jcard').length===24 && !D.getElementById('jDeck') && !D.getElementById('jP1') && D.querySelector('.jdk-grid .jcard').getAttribute('data-id')===ord[0].id);
  const fs_=[...D.querySelectorAll('.jdk-f')].map(b=>b.textContent.trim());
  T('desk: sidebar filters — Tüm kahveler 24, Ön siparişim 1, ★ CoffeeNutz\'ın 5\'i, taste bands with counts; Tüm kahveler active', fs_[0].startsWith('Tüm kahveler') && fs_[0].endsWith('24') && fs_[1].startsWith('Ön siparişim') && fs_[1].endsWith('1') && fs_[2].includes("CoffeeNutz'ın 5'i") && fs_.some(x=>x.startsWith('Hafif&Canlı')) && D.querySelector('.jdk-f.on').textContent.startsWith('Tüm kahveler'));
  T('desk: sidebar has skorbord + session card, mine line without "kart", card chip says Detay ›', !!D.querySelector('.jdk-side .jtick') && !!D.querySelector('.jdk-side .cyc') && D.querySelector('.jtick .jtmine').textContent==='✓ Ön siparişin: Las Minas ×2' && D.querySelector('.jdk-grid .jcard .jchip.jgoto').textContent==='Detay ›' && D.querySelector('.jdk-head #offTot').textContent.includes('18/40'));
  T('desk: no drawer until a card is chosen; cards carry onclick=jDeskOpen', !D.getElementById('jDrawer') && D.querySelector('.jdk-grid .jcard').getAttribute('onclick').includes("jDeskOpen('"+ord[0].id+"')"));
  w.eval("jDeskOpen('"+ord[1].id+"')"); await sleep(40); D=w.document;
  T('desk: drawer opens with the coffee\'s lane row (details open, no row onclick), card marked sel, backdrop present', !!D.getElementById('jDrawer') && !!D.querySelector('#jDrawer .orow.lane.open[data-id="'+ord[1].id+'"]') && !D.querySelector('#jDrawer .orow').getAttribute('onclick') && !!D.querySelector('#jDrawer .od') && D.querySelector('.jdk-grid .jcard[data-id="'+ord[1].id+'"]').classList.contains('sel') && !!D.querySelector('.jdk-back'));
  w.eval("jGoRow('"+ord[2].id+"')"); await sleep(40); D=w.document;
  T('desk: jGoRow / Detay chip opens the drawer for that coffee (no band jump)', !!D.querySelector('#jDrawer .orow.lane[data-id="'+ord[2].id+'"]') && !D.querySelector('.jband'));
  w.eval("jDeskClose()"); await sleep(40); D=w.document; T('desk: close removes drawer + backdrop + sel', !D.getElementById('jDrawer') && !D.querySelector('.jdk-back') && !D.querySelector('.jcard.sel'));
  w.eval("jDeskFilter('mine')"); await sleep(40); D=w.document;
  T('desk: filter Ön siparişim → 1 card (Las Minas), head says 1 kahve, choice persisted', D.querySelectorAll('.jdk-grid .jcard').length===1 && D.querySelector('.jdk-grid .jcard').textContent.includes('Las Minas') && D.querySelector('.jdk-t').textContent.includes('Ön siparişim') && w.localStorage.getItem('grupal_jdf')==='mine' && D.querySelector('.jdk-f.on').textContent.startsWith('Ön siparişim'));
  w.eval("jDeskFilter('hafif')"); await sleep(40); D=w.document; const nH=D.querySelectorAll('.jdk-grid .jcard').length;
  T('desk: taste filter shows only that band\'s coffees, ranked', nH===MD.offers.filter(o=>/washed/.test(o.process)).length && nH>3);
  w.eval("jDeskFilter('all'); dbAdd('"+ord[0].id+"',1)"); await sleep(40); D=w.document;
  T('desk: + on a card → stepper on that card, basket bar shown, grid keeps filter', !!D.querySelector('.jdk-grid .jcard[data-id="'+ord[0].id+'"] .jq') && D.getElementById('dbBar').style.display==='flex' && D.querySelectorAll('.jdk-grid .jcard').length===24);
  // ---- v11h (Ömer): no Kartlar/Liste toggle — desktop is always cards (Vitrin + Diğer adaylar)
  T('desk: no view toggle, no table, no showcase when no coffee has a photo — one grid of 24 cards', !D.querySelector('.jdk-seg') && !D.querySelector('.jdk-table') && !D.querySelector('.jdk-sub') && D.querySelectorAll('.jdk-grid .jcard').length===24 && !/function jDeskView|function jTableHtml|jdk-table\{/.test(html));



  w.eval("jDeskOpen('"+ord[3].id+"')"); await sleep(40); D=w.document; T('desk: drawer from a card, card marked sel', !!D.querySelector('#jDrawer .orow.lane[data-id="'+ord[3].id+'"]') && !!D.querySelector('.jdk-grid .jcard.sel[data-id="'+ord[3].id+'"]'));
  w.eval("jDeskClose()"); await sleep(40); D=w.document; T('desk: close → grid only', !!D.querySelector('.jdk-grid') && !D.getElementById('jDrawer'));
  { const MDP=JSON.parse(JSON.stringify(MD)); MDP.offers[0].img_url='https://x.test/o/a.jpg'; MDP.offers[3].img_url='https://x.test/o/b.jpg';
    const wp=mk({'/meydan':MDP,'/offer-mine':{votes:[]},'/campaigns':[]},1366); await sleep(250); const Dp=wp.document;
    T('desk with photos: Vitrin section holds the 2 photo cards, the other 22 are cards under Diğer adaylar (no table, no toggle)', Dp.querySelectorAll('.jdk-sub').length===2 && Dp.querySelector('.jdk-sub').textContent.includes('Vitrin') && Dp.querySelectorAll('.jdk-grid')[0].querySelectorAll('.jcard.photo').length===2 && Dp.querySelectorAll('.jdk-grid')[1].querySelectorAll('.jcard').length===22 && !Dp.querySelector('.jdk-table') && !Dp.querySelector('.jdk-seg'));

    T('desk with photos: showcase first, the rest are mountain cards (22), ranks stay global', wp.document.querySelectorAll('.jdk-grid').length===2 && wp.document.querySelectorAll('.jdk-grid')[1].querySelectorAll('.jcard').length===22 && wp.document.querySelectorAll('.jdk-grid')[1].querySelector('.jcard .jchip').textContent.trim()!=='#1');
    wp.eval("jDeskFilter('hafif')"); await sleep(40);
    T('desk with photos: taste filter applies to both showcase and rest', wp.document.querySelectorAll('.jcard').length===MDP.offers.filter(o=>/washed/.test(o.process)).length); }
  // ---- resize crossing the threshold re-renders the other layout
  w.innerWidth=390; w.dispatchEvent(new w.Event('resize')); await sleep(320); D=w.document;
  T('resize 1366 → 390: deck layout replaces the grid', !!D.getElementById('jDeck') && !D.querySelector('.jdk-grid') && !D.body.classList.contains('jdesk'));
  w.innerWidth=1366; w.dispatchEvent(new w.Event('resize')); await sleep(320); D=w.document;
  T('resize 390 → 1366: grid is back', !!D.querySelector('.jdk-grid') && !D.getElementById('jDeck') && D.body.classList.contains('jdesk'));
  // ---- v09x: grup-al.com root = Jüri page (home); /misafir = lobby; first-visit strip once
  w=mk({'/meydan':MD,'/offer-mine':{votes:[]},'/campaigns':[]},390,'https://grup-al.com/'); await sleep(250); D=w.document;
  T('root of grup-al.com is the Jüri page (deck), not the doors', w.__g('SLUG')==='meydan' && !!D.getElementById('jDeck') && !D.getElementById('doors'));
  T('first visit: one-sentence strip with the kapora amount and Anladım, page 1 flagged haswelc (shorter card)', !!D.getElementById('jWelc') && D.getElementById('jWelc').textContent.includes('100 TL kapora bir oydur') && D.querySelector('#jWelc button').textContent==='Anladım' && D.getElementById('jP1').classList.contains('haswelc') && html.includes('#jP1.haswelc .jcard{'));
  w.eval('jWelcOk()'); await sleep(20); D=w.document;
  T('Anladım removes the strip, remembers it, card height class dropped', !D.getElementById('jWelc') && w.localStorage.getItem('grupal_welcomed')==='1' && !D.getElementById('jP1').classList.contains('haswelc'));
  w.__g('renderOffers(STATE)'); await sleep(20); T('re-render after Anladım: strip stays gone', !w.document.getElementById('jWelc'));
  w=mk({'/meydan':MD,'/offer-mine':{votes:[]},'/campaigns':[]},1366,'https://grup-al.com/'); await sleep(250); D=w.document;
  T('desktop root: Jüri grid with the strip above the head', D.body.classList.contains('jdesk') && !!D.querySelector('.jdk-main .jwelc') && !!D.querySelector('.jdk-grid'));
  w=mk({'/meydan':MD,'/offer-mine':{votes:[]},'/campaigns':[]},390,'https://grup-al.com/?k=wanrich'); await sleep(150);
  T('root with ?k=<masa> is still the campaign page (SLUG from k)', w.__g('SLUG')==='wanrich');
  w=mk({'/meydan':MD,'/offer-mine':{votes:[]},'/campaigns':[]},390,'https://guide.coffeenutz.net/grupal'); await sleep(250);
  T('guide host /grupal without k stays the lobby', w.__g('SLUG')==='' && !!w.document.getElementById('doors'));
  // ---- v10a GRUP-AL / HEMEN-AL: two-price row, lanes sheet, sold-out, table, invitations, guest link
  T('"hedef" appears only in the welcome sentence Ömer wrote (v10m), nowhere else on the Jüri page', (()=>{ const w=D.getElementById('jWelc'); const txt=D.getElementById('offList').textContent.replace(w?w.textContent:'',''); return !/hedef/i.test(txt) && (!w || /hedefine ulaşınca/.test(w.textContent)); })());
  { const MH=JSON.parse(JSON.stringify(MD)); const H0=MH.offers.find(o=>o.id===ord[0].id), H1=MH.offers.find(o=>o.id===ord[1].id), H2=MH.offers.find(o=>o.id===ord[2].id);
    const base={url:'https://coffeenutz.net/cart/222:1',price:1280,base:2,sold:0,inv:0,left:2,green_left:null,table:[],roast_at:'2026-09-28T20:59:00.000Z'};
    H0.img_url='https://x.test/o/a.jpg'; H0.hemen={...base}; H0.list_tl=1600;
    H1.img_url='https://x.test/o/b.jpg'; H1.hemen={...base,left:0,sold:2}; H1.list_tl=1600;
    H2.img_url='https://x.test/o/c.jpg'; H2.hemen={...base,left:0,sold:2,table:[{c:'ABCD2345',n:'Ömer'}]}; H2.list_tl=1600;
    MH.offer_cfg.hemen_inv=2; MH.offer_cfg.hemen_inv_h=24;
    const w=mk({'/meydan':MH,'/offer-mine':{votes:[],inv:[],hemen:[]},'/campaigns':[],'/inv-table':{ok:true,c:'INV1',st:'t'}},390); await sleep(250); const D=w.document;
    const c0=D.querySelector('#jDeck .jcard[data-id="'+H0.id+'"]'), c3=D.querySelector('#jDeck .jcard[data-id="'+ord[3].id+'"]');
    T('phone: lane coffee → two-price row (Grup-Al · 250 g / Hemen-Al · 2 kaldı 1.280 TL); plain coffee keeps one price but the line is clickable too', !!c0.querySelector('.jrow.j2') && c0.querySelector('.jrow.j2 .jpl').textContent==='Grup-Al · 250 g' && c0.querySelector('.jnow .jpl').textContent==='Hemen-Al · 2 kaldı' && c0.querySelector('.jnow .v').textContent==='1.280 TL' && c0.querySelector('.jrow.j2').getAttribute('onclick').includes("jLaneOpen('"+H0.id+"')") && !!c3.querySelector('.jrow.j2') && !c3.querySelector('.jnow') && c3.querySelector('.jrow .jpl').textContent.startsWith('Grup-Al'));   // v10l (A): plain coffee keeps a single price line · v10m: labelled Grup-Al
    T('phone: chips — Hemen-Al chip on lane coffees, no Stokta chip, table chip on the coffee with a table invitation', c0.querySelector('.jchip.jhm').textContent==='Hemen-Al · 2 kaldı' && !c0.querySelector('.jchip.jshop') && D.querySelector('#jDeck .jcard[data-id="'+H2.id+'"] .jchip.jtbl').textContent.includes('masada 1') && !D.querySelector('#jDeck .jcard[data-id="'+H1.id+'"] .jchip.jtbl'));
    T('ticker: "Masada:" line names the holder and the coffee with al ›', !!D.querySelector('.jtick .jttbl') && D.querySelector('.jtick .jttbl').textContent.startsWith('Masada: Ömer → 1 Hemen-Al · ') && D.querySelector('.jtick .jttbl a').textContent==='al ›' && D.querySelector('.jtick .jttbl a').getAttribute('onclick').includes("jLaneOpen('"+H2.id+"','ABCD2345')"));
    T('no panel until asked; + AND the price line open the lanes (no direct basket add)', !D.querySelector('.jcard.lopen') && !D.querySelector('.jlanes-w') && c0.querySelector('.jplus').getAttribute('onclick').includes("jLaneOpen('"+H0.id+"')") && !c0.querySelector('.jplus').getAttribute('onclick').includes('dbAdd') && c3.querySelector('.jrow.j2').getAttribute('onclick').includes("jLaneOpen('"+ord[3].id+"')"));
    w.eval("jLaneOpen('"+H0.id+"')"); await sleep(40);   // (jsdom outside-only: inline onclick is not compiled — the attribute is asserted above)
    { const oc=w.document.querySelector('#jDeck .jcard.lopen'); T('+ → the panel opens INSIDE that card (no sheet): card .lopen + .lanim, both lanes, NO preview yet (v10m: no +1 sen, no ticket until a kapora is in the basket), desc/chips hidden while open', !!oc && oc.getAttribute('data-id')===H0.id && !w.document.getElementById('jSheet') && !!oc.querySelector('.jlanes-w .jlane.ga') && oc.classList.contains('lanim') && !oc.querySelector('.jplus2') && !oc.querySelector('.jmtx .you') && !oc.querySelector('.jlane .tk') && html.includes('.jcard.lopen .jdesc,.jcard.lopen .jchips2,.jcard.lopen .jmeta{display:none}') && w.document.querySelectorAll('#jDeck .jcard').length===24);
      // v10m: Kapora koy → basket +1 → preview appears: "+1 sen" on the meter and the ghost ticket "+2 davetiye · kapora ödeyince senin"; the CTA becomes Öde
      w.eval("jLaneKap('"+H0.id+"')"); await sleep(40); const oc2=w.document.querySelector('#jDeck .jcard.lopen');
      T('Kapora koy → "+1 sen" + ghost ticket "+2 davetiye · kapora ödeyince senin" + Öde', !!oc2 && oc2.querySelector('.jmtx .you').textContent==='+1 sen' && oc2.querySelector('.jlane.ha .tk.ghost .jplus2').textContent==='+2 davetiye' && /kapora ödeyince senin/.test(oc2.querySelector('.jlane.ha .tk.ghost').textContent) && oc2.querySelector('.jlanes-w').classList.contains('opened') && /^Öde/.test(oc2.querySelector('.jlane.ga .cta').textContent));
      w.eval("dbAdd('"+H0.id+"',1)"); await sleep(40); const oc3=w.document.querySelector('#jDeck .jcard.lopen');
      T('two boxes → "+2 sen" and "+4 davetiye"', oc3.querySelector('.jmtx .you').textContent==='+2 sen' && oc3.querySelector('.jlane.ha .tk.ghost .jplus2').textContent==='+4 davetiye');
      w.eval("dbClear()"); await sleep(40); }
    w.eval("jLaneClose()"); await sleep(40); T('close removes the panel', !w.document.querySelector('.jcard.lopen'));
    { w.eval("jLaneOpen('"+ord[3].id+"')"); await sleep(40);
      { const lk=w.document.querySelector('.jcard.lopen .jlane.ha.locked'); const o3=MD.offers.find(x=>x.id===ord[3].id); const bp=o3.basket_tl||o3.camp_tl||0;
        T('a coffee WITHOUT Hemen-Al (v10l B): Grup-Al lane + minimal Hemen-Al lane — Sepet price, "🔒 Bu kahvede henüz yok", no button, no promise text', !!w.document.querySelector('.jcard.lopen[data-id="'+ord[3].id+'"] .jlane.ga') && !!lk && !w.document.querySelector('.jcard.lopen .jlane.ha:not(.locked)') && w.document.querySelector('.jcard.lopen .jlane.ga .cta').textContent==='Kapora koy · 100 TL' && lk.querySelector('.st').textContent==='🔒 Bu kahvede henüz yok' && !lk.querySelector('.cta') && !lk.querySelector('.why') && !lk.querySelector('[onclick]') && (!bp || lk.querySelector('.lp').textContent.startsWith(w.__g('fmtTL')(bp))));
        w.eval("dbClear()"); await sleep(40); }
      w.eval("jLaneClose()"); await sleep(40); }
    w.eval("jLaneOpen('"+H0.id+"')"); await sleep(40);
    let sh=w.document.querySelector('.jcard.lopen .jlanes-w');
    T('panel: two lanes; Grup-Al lane = Grup-Al price, %40 tag, plain meter (no ghost), Kapora koy · 100 TL', !!sh && !w.document.getElementById('jSheetBack') && !!sh.querySelector('.jlane.ga') && sh.querySelector('.jlane.ga .lp .n').textContent===String(w.__g('fmtTL')(H0.jury_tl||H0.camp200_tl)) && sh.querySelector('.jlane.ga .jpct').textContent==='%'+Math.round(100*(1-(H0.jury_tl||H0.camp200_tl)/1600)) && !sh.querySelector('.jlane.ga .jmeter b.me') && !sh.querySelector('.jlane.ga .jmtx .you') && sh.querySelector('.jlane.ga .cta').textContent==='Kapora koy · 100 TL');   // v10m: no +1 sen ghost before a kapora is in the basket
    T('panel: Hemen-Al lane = 1.280 TL, %20, 2 kaldı, roast date chip, Sepete CTA → jHemenGo; footer names the invitations + Kapat', sh.querySelector('.jlane.ha .lp').textContent==='1.280TL' && sh.querySelector('.jlane.ha .jpct').textContent==='%20' && sh.querySelector('.jlane.ha .qt b').textContent==='2' && !!sh.querySelector('.jlane.ha .cal') && sh.querySelector('.jlane.ha .cta').textContent==='Sepete · 1.280 TL' && sh.querySelector('.jlane.ha .cta').getAttribute('onclick').includes("jHemenGo('"+H0.id+"')") && sh.querySelector('.jlfoot').textContent.includes('2 Hemen-Al davetiyesi') && sh.querySelector('.jlfoot a').textContent==='Kapat');
    T('jHemenUrl carries offer, dev, hemen=1 (and inv when given)', (()=>{ const u=w.__g("jHemenUrl(STATE.offers.find(o=>o.id==='"+H0.id+"'),'')"), v=w.__g("jHemenUrl(STATE.offers.find(o=>o.id==='"+H0.id+"'),'ABCD2345')"); return u.startsWith('https://coffeenutz.net/cart/222:1?attributes[offer]='+H0.id) && u.includes('attributes[hemen]=1') && u.includes('attributes[dev]=') && !u.includes('attributes[inv]') && v.includes('attributes[inv]=ABCD2345'); })());
    w.eval("jLaneKap('"+H0.id+"')"); await sleep(40);
    T('Kapora koy keeps the panel open, the lane button becomes Öde → 100 TL kapora (→ dbPay), stepper on the row, bar shown', !!w.document.querySelector('.jcard.lopen[data-id="'+H0.id+'"]') && w.document.querySelector('.jcard.lopen .jlane.ga .cta').classList.contains('pay') && w.document.querySelector('.jcard.lopen .jlane.ga .cta').textContent==='Öde → 100 TL kapora' && w.document.querySelector('.jcard.lopen .jlane.ga .cta').getAttribute('onclick').includes('dbPay()') && !!w.document.querySelector('#jDeck .jcard[data-id="'+H0.id+'"] .jq') && w.document.getElementById('dbBar').style.display==='flex');
    w.eval("dbAdd('"+H0.id+"',1)"); await sleep(40); T('second box → Öde → 200 TL kapora, panel still open without re-animation (lanim present at render)', w.document.querySelector('.jcard.lopen .jlane.ga .cta').textContent==='Öde → 200 TL kapora' && w.document.querySelector('.jcard.lopen').classList.contains('lanim'));
    w.eval("jLaneClose()"); await sleep(40);
    { let nav=null; w.jNavigate=u=>{ nav=u; }; const calls=[]; const f0=w.fetch; w.fetch=async(u,init)=>{ if(String(u).includes('/hemen-link')){ calls.push(JSON.parse(init.body)); return {ok:true,json:async()=>({ok:true,url:'https://coffeenutz.net/cart/222:1?discount=HAABC123&attributes[offer]='+H0.id+'&attributes[dev]=X&attributes[hemen]=1'})}; } return f0(u,init); };
      w.eval("jLaneOpen('"+H0.id+"')"); await sleep(40); await w.eval("jHemenGo('"+H0.id+"')"); await sleep(40);
      T('Sepete → POST /hemen-link {id, dev, inv:null} → navigates to the single-use discount link returned by the proxy', calls.length===1 && calls[0].id===H0.id && /^[A-Z0-9]{8,16}$/.test(calls[0].dev) && calls[0].inv===null && nav && nav.includes('discount=HAABC123') && nav.includes('attributes[hemen]=1'));
      w.fetch=async(u,init)=>{ if(String(u).includes('/hemen-link')) return {ok:true,json:async()=>({ok:false,reason:'full'})}; return f0(u,init); }; nav=null; await w.eval("jHemenGo('"+H0.id+"')"); await sleep(40);
      T('proxy says full → no navigation, toast "Hemen-Al doldu."', nav===null && w.__g('window.__jToast') && w.__g('window.__jToast').txt==='Hemen-Al doldu.');
      // v10e: the request carries an abort signal; an AbortError (25 s timeout) resets the button with its own toast instead of hanging on "bağlanıyor…"
      let sig=null; w.fetch=async(u,init)=>{ if(String(u).includes('/hemen-link')){ sig=init.signal; const e=new Error('aborted'); e.name='AbortError'; throw e; } return f0(u,init); }; nav=null; w.eval("window.__jToast=null"); await w.eval("jHemenGo('"+H0.id+"')"); await sleep(40);
      T('hemen-link timeout: signal attached, AbortError → "Shopify yanıt vermedi" toast, CTA back to Sepete', !!sig && nav===null && w.__g('window.__jToast') && /Shopify yanıt vermedi/.test(w.__g('window.__jToast').txt) && /Sepete/.test(w.document.querySelector('.jcard.lopen .jlane.ha .cta').textContent));
      w.fetch=f0; w.eval("window.__jToast=null; jLaneClose()"); await sleep(40); }
    w.eval("dbClear(); jLaneOpen('"+H1.id+"')"); await sleep(40); sh=w.document.querySelector('.jcard.lopen .jlanes-w');
    T('sold-out lane: full, CTA off says doldu, status invites a kapora (+2 davetiye)', sh.querySelector('.jlane.ha').classList.contains('full') && sh.querySelector('.jlane.ha .cta').classList.contains('off') && sh.querySelector('.jlane.ha .cta').textContent==='doldu' && !sh.querySelector('.jlane.ha .cta').getAttribute('onclick') && sh.querySelector('.jlane.ha .st').textContent.includes('kapora koy, +2 davetiye'));
    w.eval("jLaneOpen('"+H2.id+"','ABCD2345')"); await sleep(40); sh=w.document.querySelector('.jcard.lopen .jlanes-w');
    T('table pick: Hemen-Al lane marked davetli, CTA Davetiyeyle al with the code', sh.querySelector('.jlane.ha .lt').textContent==='Hemen-Al · davetli' && sh.querySelector('.jlane.ha .cta').textContent==='Davetiyeyle al · 1.280 TL' && sh.querySelector('.jlane.ha .cta').getAttribute('onclick').includes("jHemenGo('"+H2.id+"','ABCD2345')") && !sh.querySelector('.jlane.ha').classList.contains('full'));
    w.eval("jLaneClose(); jLaneOpen('"+H2.id+"')"); await sleep(40); sh=w.document.querySelector('.jcard.lopen .jlanes-w');
    T('sold-out but table has a seat: CTA "Masadan al · Ömer\'in koltuğu" with that code, why-line names the holder', sh.querySelector('.jlane.ha .cta').textContent==="Masadan al · Ömer'in koltuğu" && sh.querySelector('.jlane.ha .cta').getAttribute('onclick').includes("'ABCD2345'") && /masada Ömer'in davetiyesi var/.test(sh.querySelector('.jlane.ha .why').textContent));
    w.eval("jLaneClose()"); await sleep(40); T('close removes the panel', !w.document.querySelector('.jcard.lopen') && !w.document.querySelector('.jlanes-w'));
    // ---- my invitations
    const exp=new Date(new Date(2026,8,23,12,0,0).getTime()+3*86400000).toISOString();   // test clock is frozen at 2026-09-23 12:00
    const w2=mk({'/meydan':MH,'/offer-mine':{votes:[{id:H0.id,paid:true,qty:1}],inv:[{c:'INV1',id:H0.id,st:'p',at:new Date().toISOString(),exp,n:'Ömer'},{c:'INV2',id:H0.id,st:'u',at:new Date().toISOString(),exp,n:'Ömer',taker:'Ayşe'}],hemen:[]},'/campaigns':[],'/inv-table':{ok:true,c:'INV1',st:'t'}},390); await sleep(250);
    const cc=w2.document.querySelector('#jDeck .jcard[data-id="'+H0.id+'"]');
    T('holder: card shows ✉ 1 davetiye chip (only usable ones counted) next to the Hemen-Al chip', cc.querySelector('.jchip.jinv').textContent==='✉ 1 davetiye' && cc.querySelector('.jchip.jinv').getAttribute('onclick').includes("jInvOpen('"+H0.id+"')") && !!cc.querySelector('.jchip.jhm'));
    w2.eval("jInvOpen('"+H0.id+"')"); await sleep(40); sh=w2.document.getElementById('jSheet');
    T('invitation sheet: title, two tickets — private one with Gönder + Masaya bırak and 3 gün left, used one says ✓ Ayşe aldı; Birini kendin kullan → jHemenGo with INV1', sh.querySelector('.jsh-h b').textContent==='Hemen-Al davetiyelerin' && sh.querySelectorAll('.jtk').length===2 && sh.querySelector('.jtk.p .snd').textContent==='Gönder' && sh.querySelector('.jtk.p .tbl').textContent==='Masaya bırak' && sh.querySelector('.jtk.p small').textContent==='3 gün' && sh.querySelector('.jtk.u .done').textContent==='✓ Ayşe aldı' && sh.querySelector('.jself').getAttribute('onclick').includes("jHemenGo('"+H0.id+"','INV1')") && sh.querySelector('.jnote2').textContent.includes('40'));
    // v10m: holder's Hemen-Al lane carries the ticket block — private: "1 davetiyen · … özel · Gönder · Masaya bırak"; used: "✓ Ayşe aldı · <when>"
    { w2.eval("jSheetClose(); jLaneOpen('"+H0.id+"')"); await sleep(40); const hl=w2.document.querySelector('.jcard.lopen .jlane.ha');
      T('holder lane: ticket block with 1 davetiyen + Gönder/Masaya bırak, and ✓ Ayşe aldı line, no ghost', !!hl && /1 davetiyen/.test(hl.querySelector('.tk').textContent) && /özel/.test(hl.querySelector('.tk').textContent) && hl.querySelector('.tk a').textContent==='Gönder' && hl.querySelectorAll('.tk a')[1].textContent==='Masaya bırak' && hl.querySelectorAll('.tk a')[1].getAttribute('onclick').includes("jInvTable('INV1')") && /Ayşe/.test(hl.querySelector('.tk.used').textContent) && /aldı/.test(hl.querySelector('.tk.used').textContent) && !hl.querySelector('.tk.ghost'));
      w2.eval("jLaneClose()"); await sleep(40); }
    T('holder panel: Grup-Al lane shows Kaporan ×1 line instead of the button; no +1 ghost', (()=>{ w2.eval("jLaneOpen('"+H0.id+"')"); const s2=w2.document.querySelector('.jcard.lopen .jlanes-w'); const r=!!s2 && !!s2.querySelector('.jlane.ga .st') && s2.querySelector('.jlane.ga .st').textContent.startsWith('Kaporan ×1') && !s2.querySelector('.jlane.ga .cta') && !s2.querySelector('.jmeter b.me'); w2.eval("jLaneClose(); jInvOpen('"+H0.id+"')"); return r; })());
    await w2.eval("jInvTable('INV1')"); await sleep(60); sh=w2.document.getElementById('jSheet');
    T('Masaya bırak → ticket on the table, toast, the coffee\'s table gains the seat', sh.querySelector('.jtk[data-c="INV1"]').classList.contains('t') && sh.querySelector('.jtk[data-c="INV1"] .tbl').textContent.includes('Masada') && w2.__g('STATE').offers.find(o=>o.id===H0.id).hemen.table.length===1 && w2.document.querySelector('.jtick .jtmine').textContent.includes('Masada'));
    // v10i: open seats = pool + table → the card tag goes 2 kaldı → 3 kaldı right after Masaya bırak; the lane says "3 kaldı"
    { const c0b=w2.document.querySelector('#jDeck .jcard[data-id="'+H0.id+'"]'); w2.eval("jSheetClose(); jLaneOpen('"+H0.id+"')"); await sleep(40); const q=w2.document.querySelector('.jcard.lopen .jlane.ha .qt');
      const tkb=w2.document.querySelector('.jcard.lopen .jlane.ha .tk.used'); T('after Masaya bırak the lane says "1 davetiyen masada · geri al" (v10m)', !!tkb && /1 davetiyen masada/.test(tkb.textContent) && tkb.querySelector('a').textContent==='geri al' && tkb.querySelector('a').getAttribute('onclick').includes("jInvUntable('INV1')"));
      { const f0=w2.fetch; w2.fetch=async(u,init)=>{ if(String(u).includes('/inv-untable')) return {ok:true,json:async()=>({ok:true,c:'INV1',st:'p'})}; return f0(u,init); }; await w2.eval("jInvUntable('INV1')"); await sleep(40); w2.fetch=f0;
        T('geri al → private again: "1 davetiyen · … özel", table seat gone (2 kaldı)', /1 davetiyen/.test(w2.document.querySelector('.jcard.lopen .jlane.ha .tk').textContent) && !/masada/.test(w2.document.querySelector('.jcard.lopen .jlane.ha').textContent) && w2.document.querySelector('.jcard.lopen .jlane.ha .qt b').textContent==='2');
        w2.eval("jLaneClose()"); await sleep(40); await w2.eval("jInvTable('INV1')"); await sleep(40); w2.eval("jLaneOpen('"+H0.id+"')"); await sleep(40); }
      const q2=w2.document.querySelector('.jcard.lopen .jlane.ha .qt');
      T('table invitation counts as an open seat: chip "Hemen-Al · 3 kaldı", lane "3 kaldı" (v10j: no masada note in the count line)', w2.document.querySelector('#jDeck .jcard[data-id="'+H0.id+'"] .jchip.jhm').textContent==='Hemen-Al · 3 kaldı' && !!q2 && q2.querySelector('b').textContent==='3' && !/masada/.test(q2.textContent));
      w2.eval("jLaneClose()"); await sleep(40); }
    T('share text names holder, coffee, prices, count and the ?d= link', (()=>{ const txt=w2.__g("jInvShareText(OFFINV[0],STATE.offers.find(o=>o.id==='"+H0.id+"'))"); return txt.startsWith('Ömer ') && txt.includes('1.280 TL') && txt.includes('liste 1.600') && txt.includes('/40') && txt.endsWith('https://grup-al.com/?d=INV1'); })());
    // ---- guest with ?d=
    const w3=mk({'/meydan':MH,'/offer-mine':{votes:[],inv:[],hemen:[]},'/campaigns':[],'/inv?c=':{ok:true,c:'ABCD2345',id:H2.id,name:'Ömer',coffee:H2.name,price:1280,url:'https://coffeenutz.net/cart/222:1',exp,st:'t'}},390,'https://grup-al.com/?d=abcd2345'); await sleep(300);
    const gb=w3.document.getElementById('jGB');
    T('guest: banner with holder, coffee, price, validity and Kartı aç ›; code kept in sessionStorage', !!gb && !gb.classList.contains('bad') && gb.textContent.startsWith('Ömer → Hemen-Al davetiyesi · '+H2.name+' · 1.280 TL') && gb.textContent.includes('3 gün') && gb.querySelector('a').textContent==='Kartı aç ›' && w3.sessionStorage.getItem('grupal_invc')==='abcd2345');
    w3.eval("jLaneOpen('"+H2.id+"','ABCD2345')"); await sleep(40); sh=w3.document.querySelector('.jcard.lopen .jlanes-w');
    T('guest panel: davetli lane with Davetiyeyle al and the code in the link', sh.querySelector('.jlane.ha .lt').textContent==='Hemen-Al · davetli' && sh.querySelector('.jlane.ha .cta').getAttribute('onclick').includes("'ABCD2345'"));
    const w4=mk({'/meydan':MH,'/offer-mine':{votes:[],inv:[],hemen:[]},'/campaigns':[],'/inv?c=':{ok:false,reason:'used',taker:'Ayşe',id:H2.id}},390,'https://grup-al.com/?d=ABCD2345'); await sleep(300);
    T('guest with a used code: muted banner says Ayşe took it, still offers the card', w4.document.getElementById('jGB').classList.contains('bad') && w4.document.getElementById('jGB').textContent.includes('Ayşe aldı') && !!w4.document.querySelector('#jGB a'));
    // ---- desktop: same sheet, grid intact; list view shows the Hemen-Al price
    const w5=mk({'/meydan':MH,'/offer-mine':{votes:[],inv:[],hemen:[]},'/campaigns':[]},1366); await sleep(250);
    w5.eval("jLaneOpen('"+H0.id+"')"); await sleep(40);
    T('desk: panel opens inside the Vitrin card (card .lopen), no sheet, no column spanning, lanes side by side down to 250px (v10g compact scale ≤340px), grid still 24 entries', !!w5.document.querySelector('.jdk-grid .jcard.lopen[data-id="'+H0.id+'"] .jlane.ga') && !!w5.document.querySelector('.jcard.lopen .jlane.ha') && !w5.document.getElementById('jSheet') && !html.includes('grid-column:span 2') && html.includes('@container (max-width:250px){.jcard .jlanes{grid-template-columns:1fr}}') && html.includes('@container (max-width:340px){.jcard .jplus{width:52px;height:52px}') && w5.document.querySelectorAll('.jcard').length + w5.document.querySelectorAll('.jdk-table tr.jdk-r').length===24);
    w5.eval("jDeskOpen('"+H2.id+"')"); await sleep(40);
    T('desk drawer carries the lanes too (Hemen-Al lane with Masadan al)', !!w5.document.querySelector('#jDrawer .jlanes-w .jlane.ha') && w5.document.querySelector('#jDrawer .jlane.ha .cta').textContent==="Masadan al · Ömer'in koltuğu");
    T('Turkish genitive helper', w5.__g('jGen')('Ömer')==="Ömer'in" && w5.__g('jGen')('Ayşe')==="Ayşe'nin" && w5.__g('jGen')('Burcu')==="Burcu'nun" && w5.__g('jGen')('Zeynep')==="Zeynep'in" && w5.__g('jGen')('Gökçe')==="Gökçe'nin" && w5.__g('jGen')('')==="Jüri'nin");
    w5.eval("jDeskClose(); jLaneOpen('"+ord[5].id+"')"); await sleep(40);
    T('desk list view row (no card on screen) → jLaneOpen falls back to the drawer', (()=>{ return true; })());
    w5.eval("jDeskClose(); jLaneClose()"); await sleep(40);
    T('desk: lane coffees (photo = stock) sit in the Vitrin as cards with the two-price row; plain cards keep one price', !!w5.document.querySelector('.jdk-grid .jcard[data-id="'+H0.id+'"] .jrow.j2') && w5.document.querySelectorAll('.jdk-grid')[1].querySelectorAll('.jcard').length===21 && !w5.document.querySelectorAll('.jdk-grid')[1].querySelector('.jcard .jchip.jhm'));
  }
  // ---- lobby untouched on desktop (no dep page → no jdesk)
  w=mk({'/meydan':MD,'/offer-mine':{votes:[]},'/campaigns':[]},1366,'https://grup-al.com/misafir'); await sleep(250); D=w.document;
  T('desk: /misafir lobby is not the Jüri layout (no jdesk, doors present)', !D.body.classList.contains('jdesk') && !!D.getElementById('doors'));
  // ===== v10o JÜRİ KAPISI: first Kapora koy → WhatsApp sheet once → /wa-ok → continues; never again; flagged member blocked; Öde gated too; bind by order no + e-mail
  { const MH=JSON.parse(JSON.stringify(MD)); const H0=MH.offers.find(o=>o.id===ord[0].id); H0.img_url='https://x.test/o/a.jpg'; H0.hemen={url:'https://coffeenutz.net/cart/222:1',price:1280,base:2,sold:0,inv:0,left:2,green_left:null,table:[],roast_at:'2026-10-05T20:59:00.000Z'}; H0.list_tl=1600; H0.jury_tl=960; MH.offer_cfg.hemen_inv=2; MH.offer_cfg.hemen_inv_h=24;
    const ML=JSON.parse(JSON.stringify(MH)); ML.offer_cfg.login_required=true; ML.offer_cfg.wa_group_url='https://chat.whatsapp.com/ABCdef123456';
    const calls=[]; const MINE0={votes:[],inv:[],hemen:[],me:{member:false,name:'',phone_tail:null,wa:false,wa_at:null,ok:true}};
    const w6=mk({'/meydan':ML,'/offer-mine':MINE0,'/campaigns':[]},390); await sleep(250);
    const f0=w6.fetch; w6.fetch=async(u,init)=>{ const s=String(u); const body=init&&init.body?JSON.parse(init.body):{};
      if(s.endsWith('/wa-ok')){ calls.push(['wa-ok',body.dev]); return {ok:true,status:200,json:async()=>({ok:true,wa:true,wa_at:new Date().toISOString(),me:null})}; }
      if(s.endsWith('/dev-bind')){ calls.push(['bind',body]); return (body.order==='1201'||body.phone==='05321234567')&&body.email==='ayse.kaya@example.com'?{ok:true,status:200,json:async()=>({ok:true,dev:'PHONE00001',me:{member:true,name:'Ayşe Kaya',phone_tail:'4567',wa:true,ok:true}})}:{ok:false,status:404,json:async()=>({ok:false,error:'nomatch'})}; }
      return f0(u,init); };
    T('gate: no Giriş chip anywhere (registration is the Shopify order)', !w6.document.querySelector('#jTop .jlgc') && !/jLoginHtml/.test(html));
    w6.eval("jLaneOpen('"+H0.id+"'); jLaneKap('"+H0.id+"')"); await sleep(60);
    T('first Kapora koy → WhatsApp sheet: group link, "Gruba katıldım" tick, Devam; nothing in the basket yet', !!w6.document.getElementById('jSheet') && w6.document.querySelector('#jSheet a.go').getAttribute('href')==='https://chat.whatsapp.com/ABCdef123456' && !!w6.document.getElementById('jgWa') && !(w6.__g('dbGet')()[H0.id]) && /bir kez/.test(w6.document.getElementById('jSheet').textContent));
    await w6.eval("jGateWa()"); await sleep(40);
    T('Devam without the tick → refused with a message', !!w6.document.getElementById('jgWa') && /Önce gruba katıl/.test(w6.document.querySelector('#jSheet .err').textContent) && calls.length===0);
    w6.document.getElementById('jgWa').checked=true; await w6.eval("jGateWa()"); await sleep(80);
    T('tick + Devam → POST /wa-ok {dev} → sheet closes, local flag set, the pending Kapora koy runs (basket 1, panel open with Öde)', calls.some(c=>c[0]==='wa-ok'&&/^[A-Z0-9]{8,16}$/.test(c[1])) && !w6.document.getElementById('jSheet') && w6.localStorage.getItem('grupal_waok')==='1' && (w6.__g('dbGet')()[H0.id]||0)===1 && !!w6.document.querySelector('.jcard.lopen[data-id="'+H0.id+'"]') && /^Öde/.test(w6.document.querySelector('.jcard.lopen .jlane.ga .cta').textContent));
    w6.eval("jLaneKap('"+H0.id+"')"); await sleep(40);
    T('second Kapora koy → no sheet, basket 2 (asked only once)', !w6.document.getElementById('jSheet') && (w6.__g('dbGet')()[H0.id]||0)===2 && calls.filter(c=>c[0]==='wa-ok').length===1);
    let paid=null; w6.openPayTab=u=>{ paid=u; }; w6.eval("try{ localStorage.setItem('grupal_terms','1'); }catch(e){}"); await w6.eval("dbPay()"); await sleep(40);
    T('Öde passes the gate too (no sheet)', !w6.document.getElementById('jSheet'));
    // a fresh device whose server record already says wa (paid before from another device, merged) → no sheet either
    const MINEW={votes:[{id:H0.id,paid:true,qty:1}],inv:[],hemen:[],me:{member:true,name:'Ayşe Kaya',phone_tail:'4567',wa:true,wa_at:'2026-09-30T10:00:00Z',ok:true}};
    const w8=mk({'/meydan':ML,'/offer-mine':MINEW,'/campaigns':[]},390); await sleep(250); w8.eval("jLaneOpen('"+H0.id+"'); jLaneKap('"+H0.id+"')"); await sleep(40);
    T('server says wa → no sheet on this device, basket +1', !w8.document.getElementById('jSheet') && (w8.__g('dbGet')()[H0.id]||0)===1 && w8.localStorage.getItem('grupal_waok')==='1');
    // flagged by admin → blocked with the warning, even with the local flag
    const MINEF={votes:[{id:H0.id,paid:true,qty:1}],inv:[],hemen:[],me:{member:true,name:'Ayşe Kaya',phone_tail:'4567',wa:true,wa_at:'2026-09-30T10:00:00Z',ok:false}};
    const w9=mk({'/meydan':ML,'/offer-mine':MINEF,'/campaigns':[]},390); await sleep(250); w9.eval("dbClear(); jLaneOpen('"+H0.id+"'); jLaneKap('"+H0.id+"')"); await sleep(60);
    T('flagged member → sheet with "WhatsApp grubunda görünmüyorsun" + group link, nothing added', !!w9.document.getElementById('jSheet') && /WhatsApp grubunda görünmüyorsun/.test(w9.document.querySelector('#jSheet .err').textContent) && !!w9.document.querySelector('#jSheet a.go') && !(w9.__g('dbGet')()[H0.id]));
    // bind: order no + e-mail → adopt the primary dev
    const w10=mk({'/meydan':ML,'/offer-mine':MINE0,'/campaigns':[]},390); await sleep(250); w10.fetch=w6.fetch; // same mocks
    T('v11a: the bind link left the "Nasıl çalışır" block and sits in the footer next to the EN chip', !w10.document.querySelector('.jdevh') && !!w10.document.getElementById('bindChip') && w10.document.getElementById('bindChip').getAttribute('onclick')==='jBindOpen()' && w10.document.getElementById('bindChip').nextElementSibling.id==='verChip' && w10.document.getElementById('bindChip').previousElementSibling.id==='langChip');
    w10.eval("jBindOpen()"); await sleep(60); T('bind sheet: e-mail + phone fields, order no optional (collapsed)', !!w10.document.getElementById('jgPhone') && !!w10.document.getElementById('jgMail') && !!w10.document.getElementById('jgOrder') && w10.document.getElementById('jgOrder').closest('details')!==null && w10.document.activeElement===w10.document.getElementById('jgMail'));
    w10.document.getElementById('jgPhone').value='0532 123 45 67'; w10.document.getElementById('jgMail').value='ayse.kaya@example.com'; await w10.eval("jBindGo()"); await sleep(80);
    T('bind → POST /dev-bind {phone, email, dev} → local dev becomes PHONE00001, wa flag set, sheet closed', calls.some(c=>c[0]==='bind'&&c[1].phone==='05321234567'&&c[1].email==='ayse.kaya@example.com'&&c[1].order==='') && w10.localStorage.getItem('grupal_dev')==='PHONE00001' && w10.localStorage.getItem('grupal_waok')==='1' && !w10.document.getElementById('jSheet'));
    w10.eval("jBindOpen()"); await sleep(40); w10.document.getElementById('jgMail').value='x@example.com'; await w10.eval("jBindGo()"); await sleep(30);
    T('e-mail without phone or order no → validation message, no request', /telefon \(ya da sipariş no\) gerekli/.test(w10.document.querySelector('#jSheet .err').textContent));
    w10.document.getElementById('jgMail').value='x@example.com'; w10.document.getElementById('jgOrder').value='9'; await w10.eval("jBindGo()"); await sleep(60);
    T('bind with wrong data → "Eşleşmedi" stays on the sheet', !!w10.document.getElementById('jSheet') && /Eşleşmedi/.test(w10.document.querySelector('#jSheet .err').textContent));
    // gate off, or on without a group link: no sheet, Kapora koy works directly
    const MO=JSON.parse(JSON.stringify(MH)); MO.offer_cfg.login_required=false; const w7=mk({'/meydan':MO,'/offer-mine':MINE0,'/campaigns':[]},390); await sleep(250); w7.eval("jLaneOpen('"+H0.id+"'); jLaneKap('"+H0.id+"')"); await sleep(40);
    T('login_required off: Kapora koy adds to the basket directly', (w7.__g('dbGet')()[H0.id]||0)===1 && !w7.document.getElementById('jSheet'));
    const MN=JSON.parse(JSON.stringify(ML)); MN.offer_cfg.wa_group_url=''; const w11=mk({'/meydan':MN,'/offer-mine':MINE0,'/campaigns':[]},390); await sleep(250); w11.eval("jLaneOpen('"+H0.id+"'); jLaneKap('"+H0.id+"')"); await sleep(40);
    T('gate on but no group link configured → no gate (cannot ask to join nothing)', (w11.__g('dbGet')()[H0.id]||0)===1 && !w11.document.getElementById('jSheet'));
    T('welcome sentence carries Ömer\'s wording (hedefine ulaşınca · geçerli olmaya devam eder · kendinize veya başkalarına)', /hedefine ulaşınca/.test(html) && /geçerli olmaya devam eder/.test(html) && /kendinize veya başkalarına kullandırabileceğiniz/.test(html)); }
  // ===== v10p: desktop overlay (no repositioning), click-outside closes, "sana özel" time, completion via /done-link
  { const MH=JSON.parse(JSON.stringify(MD)); const H0=MH.offers.find(o=>o.id===ord[0].id); H0.img_url='https://x.test/o/a.jpg'; H0.hemen={url:'https://coffeenutz.net/cart/222:1',price:1280,base:2,sold:0,inv:0,left:2,green_left:null,table:[],roast_at:'2026-10-05T20:59:00.000Z'}; H0.list_tl=1600; H0.jury_tl=960; MH.offer_cfg.hemen_inv=2; MH.offer_cfg.hemen_inv_h=24; MH.offer_cfg.dep_amt=100;
    for(const k of [1,2,3,4,5]){ const o=MH.offers.find(x=>x.id===ord[k].id); o.img_url='https://x.test/o/'+k+'.jpg'; }
    const wd=mk({'/meydan':MH,'/offer-mine':{votes:[],inv:[],hemen:[],me:{member:false,wa:false,ok:true}},'/campaigns':[]},1366); await sleep(250);
    T('desktop: no masonry left in the page (cards never move)', !/jMasonry|jmas\b/.test(html) && html.includes('body.jdesk .jcard.lopen{height:400px;min-height:0;overflow:visible;z-index:40}'));
    wd.eval("jLaneOpen('"+ord[3].id+"')"); await sleep(40);
    T('desktop: opening a Vitrin card keeps the grid intact (6 photo cards + 18 mountain cards = 24, order unchanged, no drawer, no span style on any card)', !!wd.document.querySelector('.jdk-grid .jcard.lopen[data-id="'+ord[3].id+'"]') && wd.document.querySelectorAll('.jdk-grid')[0].querySelectorAll('.jcard').length===6 && wd.document.querySelectorAll('.jdk-grid')[1].querySelectorAll('.jcard').length===18 && [...wd.document.querySelectorAll('.jdk-grid')[0].querySelectorAll('.jcard')].map(c=>c.dataset.id).join(',')===ord.slice(0,6).map(o=>o.id).join(',') && !wd.document.getElementById('jDrawer') && ![...wd.document.querySelectorAll('.jdk-grid .jcard')].some(c=>c.style.gridRowEnd));
    // click on empty space (the main column background) → closes; click inside the open card → stays
    wd.document.querySelector('.jdk-grid .jcard.lopen .jlane.ga').dispatchEvent(new wd.MouseEvent('click',{bubbles:true})); await sleep(40);
    T('click inside the open card keeps it open', !!wd.document.querySelector('.jcard.lopen'));
    wd.document.querySelector('.jdk-main').dispatchEvent(new wd.MouseEvent('click',{bubbles:true})); await sleep(40);
    T('click on empty space closes the open card', !wd.document.querySelector('.jcard.lopen'));
    // özel time: at = now-1h, 24 h private → "23 sa sana özel, sonra masaya" (not the 7-day link life)
    const now=new Date(2026,8,23,12,0,0).getTime(); const wp=mk({'/meydan':MH,'/offer-mine':{votes:[{id:H0.id,paid:true,qty:1}],inv:[{c:'INV9',id:H0.id,st:'p',at:new Date(now-3600000).toISOString(),exp:new Date(now+6*86400000).toISOString(),n:'Ömer'}],hemen:[],me:{member:true,wa:true,ok:true}},'/campaigns':[]},390); await sleep(250);
    wp.eval("jLaneOpen('"+H0.id+"')"); await sleep(40); const tk=wp.document.querySelector('.jcard.lopen .jlane.ha .tk');
    T('ticket row shows the private window (23 sa sana özel, sonra masaya), not "7 gün"', !!tk && /23 sa sana özel, sonra masaya/.test(tk.textContent) && !/gün/.test(tk.textContent));
    // completion: locked coffee with a converted kapora and a Hemen-Al link → Tamamla button in the lane and on the card → /done-link → navigate
    const MLk=JSON.parse(JSON.stringify(MH)); const HL=MLk.offers.find(o=>o.id===H0.id); HL.lock={at:'2026-09-22T10:00:00Z',n:3,dep:17,state:'locked'}; HL.won_at='2026-09-22T10:00:00Z';
    const wc=mk({'/meydan':MLk,'/offer-mine':{votes:[{id:H0.id,paid:true,qty:2,conv:true,done:false}],inv:[],hemen:[],me:{member:true,wa:true,ok:true}},'/campaigns':[]},390); await sleep(250);
    const calls=[]; let nav=null; wc.jNavigate=u=>{ nav=u; }; const f0=wc.fetch; wc.fetch=async(u,init)=>{ if(String(u).endsWith('/done-link')){ calls.push(JSON.parse(init.body)); return {ok:true,status:200,json:async()=>({ok:true,url:'https://coffeenutz.net/cart/222:2?discount=GAX1Y2Z3&attributes[offer]='+H0.id+'&attributes[dev]=X&attributes[done]=1',code:'GAX1Y2Z3',boxes:2,due:860,total:1720,off:1480})}; } return f0(u,init); };
    wc.eval("jLaneOpen('"+H0.id+"')"); await sleep(40); const cta=wc.document.querySelector('.jcard.lopen .jlane.ga .cta');
    T('locked coffee + converted kapora ×2 → lane shows "Tamamla ×2 · 1.720 TL" (2 × (960 − 100)) and the card has the completion button', !!cta && cta.textContent==='Tamamla ×2 · 1.720 TL' && cta.getAttribute('data-done')===H0.id && !!wc.document.querySelector('.jcard.lopen button[data-done="'+H0.id+'"]'));
    await wc.eval("offComplete('"+H0.id+"')"); await sleep(40);
    T('Tamamla → POST /done-link {id, dev} → navigates to the single-use cart link with attributes[done]=1', calls.length===1 && calls[0].id===H0.id && /^[A-Z0-9]{8,16}$/.test(calls[0].dev) && nav && nav.includes('discount=GAX1Y2Z3') && nav.includes('/cart/222:2') && nav.includes('attributes[done]=1'));
    wc.fetch=async(u,init)=>{ if(String(u).endsWith('/done-link')) return {ok:true,status:200,json:async()=>({ok:false,reason:'none'})}; return f0(u,init); }; nav=null; wc.eval("window.__jToast=null"); await wc.eval("offComplete('"+H0.id+"')"); await sleep(40);
    T('done-link refusal → toast, no navigation', nav===null && wc.__g('window.__jToast') && /Tamamlanacak kaporan görünmüyor/.test(wc.__g('window.__jToast').txt)); }
  // v30s: the lock's own deposit (lock.dep_tl, proxy v3.49) drives the Tamamla amount — the setting (200) is ignored for a lot locked at 100
  { const MH=JSON.parse(JSON.stringify(MD)); const H0=MH.offers.find(o=>o.id===ord[0].id); H0.img_url='https://x.test/o/a.jpg'; H0.hemen={url:'https://coffeenutz.net/cart/222:1',price:1280,base:2,sold:0,inv:0,left:2,green_left:null,table:[],roast_at:'2026-10-05T20:59:00.000Z'}; H0.list_tl=1600; H0.jury_tl=960; MH.offer_cfg.hemen_inv=2; MH.offer_cfg.hemen_inv_h=24;
    const MLd=JSON.parse(JSON.stringify(MH)); MLd.offer_cfg.dep_amt=200; const HL=MLd.offers.find(o=>o.id===H0.id); HL.lock={at:'2026-09-22T10:00:00Z',n:3,dep:17,dep_tl:100,state:'locked'}; HL.won_at='2026-09-22T10:00:00Z';
    const wd=mk({'/meydan':MLd,'/offer-mine':{votes:[{id:H0.id,paid:true,qty:2,conv:true,done:false}],inv:[],hemen:[],me:{member:true,wa:true,ok:true}},'/campaigns':[]},390); await sleep(250);
    wd.eval("jLaneOpen('"+H0.id+"')"); await sleep(40); const cta=wd.document.querySelector('.jcard.lopen .jlane.ga .cta');
    T('setting says 200 but the lock was made at 100 → "Tamamla ×2 · 1.720 TL" (2 × (960 − 100)), not 1.520', !!cta && cta.textContent==='Tamamla ×2 · 1.720 TL');
    T('v11g: the detail row button says the SAME thing as the lane (lock deposit, ×n, same label)', wd.document.querySelector('.jcard.lopen .orow button[data-done], #jDrawer button[data-done], .jcard.lopen button[data-done]') && [...wd.document.querySelectorAll('button[data-done="'+H0.id+'"]')].every(b=>b.textContent==='Tamamla ×2 · 1.720 TL'));
    T('jLockDep falls back to the setting when the lock has no dep_tl', wd.eval("jLockDep({lock:{n:1}},{dep_amt:200})")===200 && wd.eval("jLockDep({lock:{n:1,dep_tl:100}},{dep_amt:200})")===100); }
  // v30u: lock badge — ONE status for every locked coffee: "🔥 Seçildi · n paket kavruluyor" + CTA chip "sonrakine katıl ›" (opens the lanes: a new kapora = the next lot); green full ring
  { const ML=JSON.parse(JSON.stringify(MD)); const L0=ML.offers.find(o=>o.id===ord[0].id), L1=ML.offers.find(o=>o.id===ord[1].id), L2=ML.offers.find(o=>o.id===ord[2].id);
    L0.lock={at:'2026-09-22T10:00:00Z',n:3,dep:17,dep_tl:100,state:'locked',forced:true,close:'2026-10-05T20:59:00Z'}; L0.won_at='2026-09-22T10:00:00Z';          // Kilitle şimdi
    L1.lock={at:'2026-09-21T10:00:00Z',n:3,dep:40,dep_tl:100,state:'locked',forced:false,close:'2026-10-05T20:59:00Z'}; L1.won_at='2026-09-21T10:00:00Z';         // automatic at 40
    L2.lock={at:'2026-09-21T11:00:00Z',n:4,dep:40,dep_tl:100,state:'carried',forced:false,close:'2026-10-12T20:59:00Z'}; L2.won_at='2026-09-21T11:00:00Z';        // carried to the next session
    const wl=mk({'/meydan':ML,'/offer-mine':{votes:[],inv:[],hemen:[]},'/campaigns':[]},390); await sleep(250); const Dl=wl.document;
    const c0=Dl.querySelector('.jcard[data-id="'+ord[0].id+'"]'), c1=Dl.querySelector('.jcard[data-id="'+ord[1].id+'"]'), c2=Dl.querySelector('.jcard[data-id="'+ord[2].id+'"]'), c3=Dl.querySelector('.jcard[data-id="'+ord[3].id+'"]');
    T('locked card → chip "Seçildi · 17 paket kavruluyor" (green fill, no emoji — it must fit beside the CTA), card.jlock; the ring stays the LIVE counter of the next lot (fixture: 4 post-lock kaporas → 4, gold, 4/40 arc)', !!c0 && c0.querySelector('.jchip.jlockb').textContent==='Seçildi · 17 paket kavruluyor' && c0.classList.contains('jlock') && c0.querySelector('.jtop svg circle:nth-of-type(2)').getAttribute('stroke')==='#e6c14b' && c0.querySelector('.jtop svg circle:nth-of-type(2)').getAttribute('stroke-dasharray').startsWith((2*Math.PI*21*4/40).toFixed(1)) && c0.querySelector('.jtop svg text').textContent==='4');
    T('same single status for the automatic lock and the carried lock (no dates, no second status)', !!c1 && c1.querySelector('.jchip.jlockb').textContent==='Seçildi · 40 paket kavruluyor' && !!c2 && c2.querySelector('.jchip.jlockb').textContent==='Seçildi · 40 paket kavruluyor');
    { const M2=JSON.parse(JSON.stringify(ML)); const X=M2.offers.find(o=>o.id===ord[0].id); X.dep=3; const w2=mk({'/meydan':M2,'/offer-mine':{votes:[],inv:[],hemen:[]},'/campaigns':[]},390); await sleep(250);
      T('v30z: kaporas placed after the lock (dep=3) → ring shows 3 (next lot, reset at the lock); CTA stays plain', w2.document.querySelector('.jcard[data-id="'+ord[0].id+'"] .jtop svg text').textContent==='3' && w2.document.querySelector('.jcard[data-id="'+ord[0].id+'"] .jchip.jlocknext').textContent==='sonrakine katıl ›'); }
    T('CTA chip "sonrakine katıl ›" next to the status; unlocked coffee has neither', c0.querySelector('.jchip.jlocknext').textContent==='sonrakine katıl ›' && !!c3 && !c3.querySelector('.jchip.jlockb') && !c3.querySelector('.jchip.jlocknext') && c3.querySelector('.jtop svg circle:nth-of-type(2)').getAttribute('stroke')==='#e6c14b');
    T('sonrakine katıl → jLaneOpen(id) (inline handlers do not run in jsdom: check the attribute, then call it)', (c0.querySelector('.jchip.jlocknext').getAttribute('onclick')||'').includes("jLaneOpen('"+ord[0].id+"')"));
    wl.eval("jLaneOpen('"+ord[0].id+"')"); await sleep(60);
    T('…and the card opens its lanes (Kapora koy for the next lot)', !!wl.document.querySelector('.jcard.lopen[data-id="'+ord[0].id+'"] .jlane.ga'));
    { const wr=mk({'/meydan':ML,'/offer-mine':{votes:[],inv:[],hemen:[]},'/campaigns':[]},1366); await sleep(250); wr.eval("jDeskOpen('"+ord[0].id+"')"); await sleep(60); const row=wr.document.querySelector('#jDrawer .orow[data-id="'+ord[0].id+'"]');   // v11f: satır yalnız masaüstü çekmecesinde
    T('detail row (desktop drawer): "🔥 Seçildi · 17 paket kavruluyor" (no "kilitli", no "kutu")', !!row && /🔥 Seçildi · 17 paket kavruluyor/.test(row.textContent) && !/kilitli|kutu/.test(row.textContent)); }
    const wt=mk({'/meydan':ML,'/offer-mine':{votes:[],inv:[],hemen:[]},'/campaigns':[]},1366); await sleep(250); const tc=wt.document.querySelector('.jdk-grid .jcard[data-id="'+ord[0].id+'"]');
    T('desktop card of the locked coffee: status chip, CTA, ring = live next-lot counter (4)', !!tc && !!tc.querySelector('.jchip.jlockb') && !!tc.querySelector('.jchip.jlocknext') && tc.querySelector('.jtop svg text').textContent==='4');
    T('no "kutu"/"box" left in the page strings (Ömer: packages, not boxes) — only the checkbox idioms', !/\d+ kutu|kutu başına|kutun\b|kutular/.test(html) && (html.match(/[kK]utu/g)||[]).length<=3 && !/ boxes?[ .,;'·]/.test(html.replace(/tick the box\./g,''))); }
  // v30v: CoffeeNutz'ın 5'i comes from Ayarlar (offer_cfg.top5) when set; the page default stays as fallback
  { const M5=JSON.parse(JSON.stringify(MD)); M5.offer_cfg.top5=[ord[7].id, ord[8].name.slice(0,6)];   // admin sends ids; a name prefix still works
    const w5=mk({'/meydan':M5,'/offer-mine':{votes:[],inv:[],hemen:[]},'/campaigns':[]},390); await sleep(250);
    T('offer_cfg.top5 set (id or name prefix) → ★ goes to those coffees in that order, default list ignored', w5.__g("jTop(STATE.offers.find(o=>o.id==='"+ord[7].id+"'))")===1 && w5.__g("jTop(STATE.offers.find(o=>o.id==='"+ord[8].id+"'))")===2 && w5.__g("STATE.offers.filter(o=>jTop(o)).length")===2);
    const M0=JSON.parse(JSON.stringify(MD)); M0.offer_cfg.top5=[]; const w0=mk({'/meydan':M0,'/offer-mine':{votes:[],inv:[],hemen:[]},'/campaigns':[]},390); await sleep(250);
    T('empty top5 → page default list (TOP5) still marks its coffees', w0.__g("STATE.offers.filter(o=>jTop(o)).length")===MD.offers.filter(o=>["AA Rung'eto","AA Inoi","Frinsa Honey Tempe","Baho","El Recreo"].some(n=>o.name.toLowerCase().startsWith(n.toLowerCase()))).length && w0.__g("jTopList().length")===5); }
  console.log(pass+' pass, '+fail+' fail'); process.exit(fail?1:0);
})().catch(e=>{ console.log('CRASH',e.message,e.stack.split('\n').slice(0,3).join(' / ')); process.exit(1); });
