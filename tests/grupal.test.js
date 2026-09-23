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
  const dom=new JSDOM(html,{url:url||'https://grup-al.com/juri',runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window;
  Object.defineProperty(w,'innerWidth',{value:width||390,writable:true,configurable:true});
  w.matchMedia=q=>{ const m=/min-width:\s*(\d+)px/.exec(q); return {matches:m?(w.innerWidth>=parseInt(m[1],10)):false,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}}; };
  const base=new Date(2026,8,23,12,0,0).getTime();
  w.eval('Date = new Proxy(Date,{construct(t,a){ return a.length? new t(...a): new t('+base+'); }, get(t,k){ return k==="now"? ()=>'+base+' : t[k]; }})');
  w.fetch=async u=>{ const s=String(u); for(const k in maps){ if(s.includes(k)) return {ok:true,json:async()=>maps[k]}; } throw new Error('no mock '+s); };
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
  // ---- resize crossing the threshold re-renders the other layout
  w.innerWidth=390; w.dispatchEvent(new w.Event('resize')); await sleep(320); D=w.document;
  T('resize 1366 → 390: deck layout replaces the grid', !!D.getElementById('jDeck') && !D.querySelector('.jdk-grid') && !D.body.classList.contains('jdesk'));
  w.innerWidth=1366; w.dispatchEvent(new w.Event('resize')); await sleep(320); D=w.document;
  T('resize 390 → 1366: grid is back', !!D.querySelector('.jdk-grid') && !D.getElementById('jDeck') && D.body.classList.contains('jdesk'));
  // ---- lobby untouched on desktop (no dep page → no jdesk)
  w=mk({'/meydan':MD,'/offer-mine':{votes:[]},'/campaigns':[]},1366,'https://grup-al.com/misafir'); await sleep(250); D=w.document;
  T('desk: /misafir lobby is not the Jüri layout (no jdesk, doors present)', !D.body.classList.contains('jdesk') && !!D.getElementById('doors'));
  console.log(pass+' pass, '+fail+' fail'); process.exit(fail?1:0);
})().catch(e=>{ console.log('CRASH',e.message,e.stack.split('\n').slice(0,3).join(' / ')); process.exit(1); });
