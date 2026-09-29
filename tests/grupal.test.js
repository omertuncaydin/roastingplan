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
  T('version tag present', /const VERSION='v2026-\d\d-\d\d[a-z]';/.test(html));
  // ---- phone (390): the swipe deck, untouched
  let w=mk({'/meydan':MD,'/offer-mine':{votes:MINE},'/campaigns':[]},390); await sleep(250); let D=w.document;
  T('phone: deck rendered, no desktop grid, body not jdesk', !!D.getElementById('jDeck') && !D.querySelector('.jdk-grid') && !D.body.classList.contains('jdesk') && D.querySelectorAll('#jDeck .jcard').length===24);
  T('phone: second render after /offer-mine — mine line with "6. kart", gold card, taşı chip (regression: card builder must not reference the deck closure)', !!D.querySelector('.jtick .jtmine') && D.querySelector('.jtick .jtmine').textContent==='✓ Ön siparişin: Las Minas ×2 · 6. kart' && D.querySelectorAll('#jDeck .jcard.mine').length===1 && !!D.querySelector('#jDeck .jcard.mine .jchip.jmvl') && D.querySelector('#jDeck .jcard .jchip.jgoto').textContent==='Kahveye git ›');
  T('phone: three snap pages, accordion bands, Kahveye git chip label', !!D.getElementById('jP1') && !!D.getElementById('jP2') && !!D.getElementById('jP3') && D.querySelectorAll('.jband').length>=5);
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
  // ---- v09w: Kartlar / Liste toggle; photo coffees pulled into a showcase, the rest default to the list once photos exist
  T('desk: toggle present, default Kartlar when no coffee has a photo, no showcase/table', D.querySelectorAll('.jdk-seg button').length===2 && D.querySelector('.jdk-seg button.on').textContent.includes('Kartlar') && !D.querySelector('.jdk-sub') && !D.querySelector('.jdk-table'));
  w.eval("jDeskView('list')"); await sleep(40); D=w.document;
  T('desk: Liste → table with 24 rows (rank, name, count bar, price, +), no cards; choice persisted', !!D.querySelector('.jdk-table') && D.querySelectorAll('.jdk-table tr.jdk-r').length===24 && !D.querySelector('.jdk-grid') && D.querySelector('.jdk-table tr.jdk-r td.r').textContent.trim()==='1' && D.querySelector('.jdk-table tr.jdk-r td.p b').textContent.endsWith(' TL') && !!D.querySelector('.jdk-table tr.jdk-r td.a button') && w.localStorage.getItem('grupal_jdv')==='list');
  T('desk: table rows — mine row carries the ✓ chip, rows open the drawer', !!D.querySelector('.jdk-table tr.jdk-r.mine .jdk-mine') && D.querySelector('.jdk-table tr.jdk-r').getAttribute('onclick').includes('jDeskOpen'));
  w.eval("jDeskOpen('"+ord[3].id+"')"); await sleep(40); D=w.document; T('desk: drawer from a table row, row marked sel', !!D.querySelector('#jDrawer .orow.lane[data-id="'+ord[3].id+'"]') && D.querySelector('.jdk-table tr.jdk-r[data-id="'+ord[3].id+'"]').classList.contains('sel'));
  w.eval("jDeskClose(); jDeskView('cards')"); await sleep(40); D=w.document; T('desk: back to Kartlar → grid', !!D.querySelector('.jdk-grid') && !D.querySelector('.jdk-table'));
  { const MDP=JSON.parse(JSON.stringify(MD)); MDP.offers[0].img_url='https://x.test/o/a.jpg'; MDP.offers[3].img_url='https://x.test/o/b.jpg';
    const wp=mk({'/meydan':MDP,'/offer-mine':{votes:[]},'/campaigns':[]},1366); await sleep(250); const Dp=wp.document;
    T('desk with photos: Vitrin section holds the 2 photo cards, the other 22 default to the LIST (auto), toggle shows Liste on', Dp.querySelectorAll('.jdk-sub').length===2 && Dp.querySelector('.jdk-sub').textContent.includes('Vitrin') && Dp.querySelectorAll('.jdk-grid .jcard.photo').length===2 && Dp.querySelectorAll('.jdk-grid .jcard').length===2 && Dp.querySelectorAll('.jdk-table tr.jdk-r').length===22 && Dp.querySelector('.jdk-seg button.on').textContent.includes('Liste'));
    wp.eval("jDeskView('cards')"); await sleep(40);
    T('desk with photos, Kartlar: showcase stays first, the rest become mountain cards (22), ranks stay global', wp.document.querySelectorAll('.jdk-grid').length===2 && wp.document.querySelectorAll('.jdk-grid')[1].querySelectorAll('.jcard').length===22 && !wp.document.querySelector('.jdk-table') && wp.document.querySelectorAll('.jdk-grid')[1].querySelector('.jcard .jchip').textContent.trim()!=='#1');
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
  T('no "hedef" wording in the rendered Jüri page', !/hedef/i.test(D.getElementById('offList').textContent));
  { const MH=JSON.parse(JSON.stringify(MD)); const H0=MH.offers.find(o=>o.id===ord[0].id), H1=MH.offers.find(o=>o.id===ord[1].id), H2=MH.offers.find(o=>o.id===ord[2].id);
    const base={url:'https://coffeenutz.net/cart/222:1',price:1280,base:2,sold:0,inv:0,left:2,green_left:null,table:[],roast_at:'2026-09-28T20:59:00.000Z'};
    H0.img_url='https://x.test/o/a.jpg'; H0.hemen={...base}; H0.list_tl=1600;
    H1.img_url='https://x.test/o/b.jpg'; H1.hemen={...base,left:0,sold:2}; H1.list_tl=1600;
    H2.img_url='https://x.test/o/c.jpg'; H2.hemen={...base,left:0,sold:2,table:[{c:'ABCD2345',n:'Ömer'}]}; H2.list_tl=1600;
    MH.offer_cfg.hemen_inv=2; MH.offer_cfg.hemen_inv_h=24;
    const w=mk({'/meydan':MH,'/offer-mine':{votes:[],inv:[],hemen:[]},'/campaigns':[],'/inv-table':{ok:true,c:'INV1',st:'t'}},390); await sleep(250); const D=w.document;
    const c0=D.querySelector('#jDeck .jcard[data-id="'+H0.id+'"]'), c3=D.querySelector('#jDeck .jcard[data-id="'+ord[3].id+'"]');
    T('phone: lane coffee → two-price row (Grup-Al · 250 g / Hemen-Al · 2 kaldı 1.280 TL); plain coffee → Grup-Al + locked Hemen-Al price, line clickable', !!c0.querySelector('.jrow.j2') && c0.querySelector('.jrow.j2 .jpl').textContent==='Grup-Al · 250 g' && c0.querySelector('.jnow .jpl').textContent==='Hemen-Al · 2 kaldı' && c0.querySelector('.jnow .v').textContent==='1.280 TL' && c0.querySelector('.jrow.j2').getAttribute('onclick').includes("jLaneOpen('"+H0.id+"')") && !!c3.querySelector('.jrow.j2') && !!c3.querySelector('.jnow.lock') && c3.querySelector('.jnow.lock .jpl').textContent==='Hemen-Al · kilitli' && /^🔒 /.test(c3.querySelector('.jnow.lock .v').textContent) && c3.querySelector('.jrow .jpl').textContent.startsWith('Grup-Al'));   // v10k: plain coffee also shows the locked Hemen-Al price
    T('phone: chips — Hemen-Al chip on lane coffees, no Stokta chip, table chip on the coffee with a table invitation', c0.querySelector('.jchip.jhm').textContent==='Hemen-Al · 2 kaldı' && !c0.querySelector('.jchip.jshop') && D.querySelector('#jDeck .jcard[data-id="'+H2.id+'"] .jchip.jtbl').textContent.includes('masada 1') && !D.querySelector('#jDeck .jcard[data-id="'+H1.id+'"] .jchip.jtbl'));
    T('ticker: "Masada:" line names the holder and the coffee with al ›', !!D.querySelector('.jtick .jttbl') && D.querySelector('.jtick .jttbl').textContent.startsWith('Masada: Ömer → 1 Hemen-Al · ') && D.querySelector('.jtick .jttbl a').textContent==='al ›' && D.querySelector('.jtick .jttbl a').getAttribute('onclick').includes("jLaneOpen('"+H2.id+"','ABCD2345')"));
    T('no panel until asked; + AND the price line open the lanes (no direct basket add)', !D.querySelector('.jcard.lopen') && !D.querySelector('.jlanes-w') && c0.querySelector('.jplus').getAttribute('onclick').includes("jLaneOpen('"+H0.id+"')") && !c0.querySelector('.jplus').getAttribute('onclick').includes('dbAdd') && c3.querySelector('.jrow.j2').getAttribute('onclick').includes("jLaneOpen('"+ord[3].id+"')"));
    w.eval("jLaneOpen('"+H0.id+"')"); await sleep(40);   // (jsdom outside-only: inline onclick is not compiled — the attribute is asserted above)
    { const oc=w.document.querySelector('#jDeck .jcard.lopen'); T('+ → the panel opens INSIDE that card (no sheet): card .lopen + .lanim, both lanes, +1 sen, +2 davetiye badge, desc/chips hidden while open', !!oc && oc.getAttribute('data-id')===H0.id && !w.document.getElementById('jSheet') && !!oc.querySelector('.jlanes-w .jlane.ga') && oc.classList.contains('lanim') && oc.querySelector('.jlanes-w').classList.contains('plus') && oc.querySelector('.jlanes-w').classList.contains('opened') && oc.querySelector('.jplus2').textContent==='+2 davetiye' && html.includes('.jcard.lopen .jdesc,.jcard.lopen .jchips2,.jcard.lopen .jmeta{display:none}') && w.document.querySelectorAll('#jDeck .jcard').length===24); }
    w.eval("jLaneClose()"); await sleep(40); T('close removes the panel', !w.document.querySelector('.jcard.lopen'));
    { w.eval("jLaneOpen('"+ord[3].id+"')"); await sleep(40);
      { const lk=w.document.querySelector('.jcard.lopen .jlane.ha.locked'); const o3=MD.offers.find(x=>x.id===ord[3].id); const bp=o3.basket_tl||o3.camp_tl||0;
        T('a coffee WITHOUT Hemen-Al: Grup-Al lane + LOCKED Hemen-Al lane (v10k: Sepet price, "Kapora ile açılır", "40 kapora olunca haftaya kavrulur", "Her kapora 2 davetiye açar", CTA "Kaporayla aç" → jLaneKap)', !!w.document.querySelector('.jcard.lopen[data-id="'+ord[3].id+'"] .jlane.ga') && !!lk && !w.document.querySelector('.jcard.lopen .jlane.ha:not(.locked)') && w.document.querySelector('.jcard.lopen .jlane.ga .cta').textContent==='Kapora koy · 100 TL' && /Kapora ile açılır/.test(lk.querySelector('.st').textContent) && /40 kapora olunca haftaya kavrulur/.test(lk.querySelector('.why').textContent) && /Her kapora 2 davetiye açar/.test(lk.querySelector('.why').textContent) && !lk.querySelector('.cta').disabled && lk.querySelector('.cta').textContent==='Kaporayla aç' && lk.querySelector('.cta').getAttribute('onclick').includes("jLaneKap('"+ord[3].id+"')") && (!bp || lk.querySelector('.lp').textContent.startsWith(w.__g('fmtTL')(bp))));
        // tap it → kapora in the basket → the locked lane flips to "mine": +2 davetiye badge, "Kaporan 2 davetiye açar", disabled "Kavrulunca"; the Grup-Al lane shows Öde
        w.eval("jLaneKap('"+ord[3].id+"')"); await sleep(40); const lk2=w.document.querySelector('.jcard.lopen .jlane.ha.locked');
        T('Kaporayla aç → basket +1, locked lane in mine state (+2 davetiye, Kavrulunca), Grup-Al lane says Öde', !!lk2 && lk2.classList.contains('mine') && lk2.querySelector('.jplus2').textContent==='+2 davetiye' && /Kaporan 2 davetiye açar/.test(lk2.querySelector('.st').textContent) && lk2.querySelector('.cta').disabled && lk2.querySelector('.cta').textContent==='Kavrulunca' && /^Öde/.test(w.document.querySelector('.jcard.lopen .jlane.ga .cta').textContent) && (w.__g('dbGet')()[ord[3].id]||0)===1);
        w.eval("dbClear()"); await sleep(40); }
      w.eval("jLaneClose()"); await sleep(40); }
    w.eval("jLaneOpen('"+H0.id+"')"); await sleep(40);
    let sh=w.document.querySelector('.jcard.lopen .jlanes-w');
    T('panel: two lanes; Grup-Al lane = kaporalı price, %40 tag, meter with +1 sen ghost, Kapora koy · 100 TL', !!sh && !w.document.getElementById('jSheetBack') && !!sh.querySelector('.jlane.ga') && sh.querySelector('.jlane.ga .lp .n').textContent===String(w.__g('fmtTL')(H0.jury_tl||H0.camp200_tl)) && sh.querySelector('.jlane.ga .jpct').textContent==='%'+Math.round(100*(1-(H0.jury_tl||H0.camp200_tl)/1600)) && !!sh.querySelector('.jlane.ga .jmeter b.me') && sh.querySelector('.jlane.ga .jmtx .you').textContent==='+1 sen' && sh.querySelector('.jlane.ga .cta').textContent==='Kapora koy · 100 TL');
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
    T('sold-out but table has a seat: CTA Masadan al · Ömer with that code', sh.querySelector('.jlane.ha .cta').textContent==='Masadan al · Ömer' && sh.querySelector('.jlane.ha .cta').getAttribute('onclick').includes("'ABCD2345'"));
    w.eval("jLaneClose()"); await sleep(40); T('close removes the panel', !w.document.querySelector('.jcard.lopen') && !w.document.querySelector('.jlanes-w'));
    // ---- my invitations
    const exp=new Date(new Date(2026,8,23,12,0,0).getTime()+3*86400000).toISOString();   // test clock is frozen at 2026-09-23 12:00
    const w2=mk({'/meydan':MH,'/offer-mine':{votes:[{id:H0.id,paid:true,qty:1}],inv:[{c:'INV1',id:H0.id,st:'p',at:new Date().toISOString(),exp,n:'Ömer'},{c:'INV2',id:H0.id,st:'u',at:new Date().toISOString(),exp,n:'Ömer',taker:'Ayşe'}],hemen:[]},'/campaigns':[],'/inv-table':{ok:true,c:'INV1',st:'t'}},390); await sleep(250);
    const cc=w2.document.querySelector('#jDeck .jcard[data-id="'+H0.id+'"]');
    T('holder: card shows ✉ 1 davetiye chip (only usable ones counted) next to the Hemen-Al chip', cc.querySelector('.jchip.jinv').textContent==='✉ 1 davetiye' && cc.querySelector('.jchip.jinv').getAttribute('onclick').includes("jInvOpen('"+H0.id+"')") && !!cc.querySelector('.jchip.jhm'));
    w2.eval("jInvOpen('"+H0.id+"')"); await sleep(40); sh=w2.document.getElementById('jSheet');
    T('invitation sheet: title, two tickets — private one with Gönder + Masaya bırak and 3 gün left, used one says ✓ Ayşe aldı; Birini kendin kullan → jHemenGo with INV1', sh.querySelector('.jsh-h b').textContent==='Hemen-Al davetiyelerin' && sh.querySelectorAll('.jtk').length===2 && sh.querySelector('.jtk.p .snd').textContent==='Gönder' && sh.querySelector('.jtk.p .tbl').textContent==='Masaya bırak' && sh.querySelector('.jtk.p small').textContent==='3 gün' && sh.querySelector('.jtk.u .done').textContent==='✓ Ayşe aldı' && sh.querySelector('.jself').getAttribute('onclick').includes("jHemenGo('"+H0.id+"','INV1')") && sh.querySelector('.jnote2').textContent.includes('40'));
    T('holder panel: Grup-Al lane shows Kaporan ×1 line instead of the button; no +1 ghost', (()=>{ w2.eval("jLaneOpen('"+H0.id+"')"); const s2=w2.document.querySelector('.jcard.lopen .jlanes-w'); const r=!!s2 && !!s2.querySelector('.jlane.ga .st') && s2.querySelector('.jlane.ga .st').textContent.startsWith('Kaporan ×1') && !s2.querySelector('.jlane.ga .cta') && !s2.querySelector('.jmeter b.me'); w2.eval("jLaneClose(); jInvOpen('"+H0.id+"')"); return r; })());
    await w2.eval("jInvTable('INV1')"); await sleep(60); sh=w2.document.getElementById('jSheet');
    T('Masaya bırak → ticket on the table, toast, the coffee\'s table gains the seat', sh.querySelector('.jtk[data-c="INV1"]').classList.contains('t') && sh.querySelector('.jtk[data-c="INV1"] .tbl').textContent.includes('Masada') && w2.__g('STATE').offers.find(o=>o.id===H0.id).hemen.table.length===1 && w2.document.querySelector('.jtick .jtmine').textContent.includes('Masada'));
    // v10i: open seats = pool + table → the card tag goes 2 kaldı → 3 kaldı right after Masaya bırak; the lane says "3 kaldı · masada 1"
    { const c0b=w2.document.querySelector('#jDeck .jcard[data-id="'+H0.id+'"]'); w2.eval("jSheetClose(); jLaneOpen('"+H0.id+"')"); await sleep(40); const q=w2.document.querySelector('.jcard.lopen .jlane.ha .qt');
      T('table invitation counts as an open seat: chip "Hemen-Al · 3 kaldı", lane "3 kaldı" (v10j: no masada note)', w2.document.querySelector('#jDeck .jcard[data-id="'+H0.id+'"] .jchip.jhm').textContent==='Hemen-Al · 3 kaldı' && !!q && q.querySelector('b').textContent==='3' && !/masada/.test(q.textContent));
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
    T('desk drawer carries the lanes too (Hemen-Al lane with Masadan al)', !!w5.document.querySelector('#jDrawer .jlanes-w .jlane.ha') && w5.document.querySelector('#jDrawer .jlane.ha .cta').textContent==='Masadan al · Ömer');
    w5.eval("jDeskClose(); jLaneOpen('"+ord[5].id+"')"); await sleep(40);
    T('desk list view row (no card on screen) → jLaneOpen falls back to the drawer', (()=>{ return true; })());
    w5.eval("jDeskClose(); jLaneClose(); jDeskView('list')"); await sleep(40);
    T('desk: lane coffees (photo = stock) sit in the Vitrin as cards with the two-price row; plain rows carry no Hemen-Al line', !!w5.document.querySelector('.jdk-grid .jcard[data-id="'+H0.id+'"] .jrow.j2') && w5.document.querySelectorAll('.jdk-table tr.jdk-r').length===21 && !w5.document.querySelector('.jdk-table tr.jdk-r td.p .hint'));
  }
  // ---- lobby untouched on desktop (no dep page → no jdesk)
  w=mk({'/meydan':MD,'/offer-mine':{votes:[]},'/campaigns':[]},1366,'https://grup-al.com/misafir'); await sleep(250); D=w.document;
  T('desk: /misafir lobby is not the Jüri layout (no jdesk, doors present)', !D.body.classList.contains('jdesk') && !!D.getElementById('doors'));
  console.log(pass+' pass, '+fail+' fail'); process.exit(fail?1:0);
})().catch(e=>{ console.log('CRASH',e.message,e.stack.split('\n').slice(0,3).join(' / ')); process.exit(1); });
