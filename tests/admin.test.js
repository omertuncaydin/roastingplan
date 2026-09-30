// Grup-Al admin — Düzenle link resolution (v30d cartLinkFrom). Run:  NODE_PATH=<node_modules> node tests/admin.test.js
const path=require('path'); const fs=require('fs'); const {JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync(path.join(__dirname,'..','grupal-admin.html'),'utf8');
let pass=0,fail=0; const T=(n,c)=>{ c?pass++:(fail++,console.log('FAIL',n)); };
const VARS={ok:true,handle:'kolombiya-jose-espinoza-recreo-1',title:'Recreo',variants:[
  {id:67856174350640,title:'Sonraki Kavrulma Tarihinde Gönderim / 250G',price:1240,available:true},
  {id:67856174350641,title:'28.09.26 Stoğundan Gönderim / 250G',price:1240,available:false}]};
function mk(variants){
  const vc=new VirtualConsole(); vc.on('jsdomError',()=>{}); vc.sendTo(console,{omitJSDOMErrors:true});
  const dom=new JSDOM(html,{url:'https://guide.coffeenutz.net/grupal-admin',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
  const w=dom.window; w.alerts=[]; w.alert=m=>w.alerts.push(String(m)); w.confirm=()=>false;
  w.fetch=async(u,init)=>{ const s=String(u); if(s.endsWith('/admin/variants')){ const b=JSON.parse(init.body); return {ok:true,status:200,json:async()=>(typeof variants==='function'?variants(b.url):variants)}; } return {ok:true,status:200,json:async()=>({ok:true,offers:[],settings:{}})}; };
  // top-level let/const inside an eval stay local to that eval: __g must be a DIRECT eval defined inside the same script text (as grupal.test.js does)
  let first=true; for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)){ try{ w.eval(m[1]+(first?'\n;window.__g=function(n){return eval(n)};':'')); first=false; }catch(e){ console.log('script error',e.message); } }
  // a Düzenle form with the two link inputs (as offRow renders them)
  w.document.body.insertAdjacentHTML('beforeend','<div id="f" style="display:grid"><input id="oe_hemen"><input id="oe_done"></div>');
  return w;
}
(async()=>{
  T('admin version bumped', /const VERSION='v2026-09-30p';/.test(html));
  let w=mk(VARS); const g=w.__g;
  // 1. cart permalink passes through (www stripped)
  let r=await g('cartLinkFrom')('https://www.coffeenutz.net/cart/123:1','oe_hemen',1240); T('cart permalink accepted, www stripped', r==='https://coffeenutz.net/cart/123:1');
  // 2. product link with ?variant= → direct
  r=await g('cartLinkFrom')('https://www.coffeenutz.net/products/kolombiya-jose-espinoza-recreo-1?variant=67856174350640','oe_hemen',1240); T('?variant= converted without a fetch', r==='https://coffeenutz.net/cart/67856174350640:1');
  // 3. bare product link → proxy list → single available variant at liste → auto
  r=await g('cartLinkFrom')('https://www.coffeenutz.net/products/kolombiya-jose-espinoza-recreo-1','oe_hemen',1240); T('bare product link → the available 1240 variant (Sonraki) picked', r==='https://coffeenutz.net/cart/67856174350640:1' && w.alerts.length===0);
  // 4. two available at the same price → the "Sonraki" one wins
  w=mk({ok:true,variants:[{id:1,title:'28.09.26 Stoğundan Gönderim / 250G',price:1240,available:true},{id:2,title:'Sonraki Kavrulma Tarihinde Gönderim / 250G',price:1240,available:true}]});
  r=await w.__g('cartLinkFrom')('https://coffeenutz.net/products/x','oe_hemen',1240); T('two candidates at liste → Sonraki preferred', r==='https://coffeenutz.net/cart/2:1');
  // 5. no price match → select box under the input, save aborted (null)
  w=mk({ok:true,variants:[{id:5,title:'250G',price:1300,available:true},{id:6,title:'1KG',price:4200,available:true}]});
  r=await w.__g('cartLinkFrom')('https://coffeenutz.net/products/x','oe_hemen',1240); let sel=w.document.getElementById('oe_hemen_pick');
  T('no match → null + select with both variants + alert', r===null && !!sel && sel.options.length===3 && /1KG · 4200 ₺/.test(sel.options[2].textContent) && w.alerts.length===1 && /listeden seç/.test(w.alerts[0]));
  sel.value='https://coffeenutz.net/cart/6:1'; sel.onchange(); T('choosing fills the input and removes the select', w.document.getElementById('oe_hemen').value==='https://coffeenutz.net/cart/6:1' && !w.document.getElementById('oe_hemen_pick'));
  // 6. proxy without the endpoint (old proxy) → alert with the manual recipe, null
  w=mk({error:'not found'}); r=await w.__g('cartLinkFrom')('https://coffeenutz.net/products/x','oe_hemen',1240);
  T('old proxy / error → null + manual-recipe alert', r===null && w.alerts.length===1 && /\?variant=/.test(w.alerts[0]));
  // 7. done link: no price preference, single available variant → still needs a choice? (one available, no pref → select)
  w=mk({ok:true,variants:[{id:9,title:'Tamamlama',price:645,available:true}]}); r=await w.__g('cartLinkFrom')('https://coffeenutz.net/products/t','oe_done',null);
  T('done link without price preference → select offered (no silent guess)', r===null && !!w.document.getElementById('oe_done_pick'));
  // 8. unrelated text passes through untouched (validation downstream rejects it)
  w=mk(VARS); r=await w.__g('cartLinkFrom')('https://coffeenutz.net/collections/all','oe_hemen',1240); T('non-product link passes through for the regex check', r==='https://coffeenutz.net/collections/all');
  r=await w.__g('cartLinkFrom')('','oe_hemen',1240); T('empty stays empty', r==='');
  // v30g: Jüri üyeleri panel renders from /admin/users; flag button posts /admin/user-flag
  { const w=mk(VARS); const calls=[]; const f0=w.fetch; w.fetch=async(u,init)=>{ const s=String(u); if(s.endsWith('/admin/users')) return {ok:true,status:200,json:async()=>({ok:true,n:2,users:[{email:'ayse@example.com',name:'Ayşe Kaya',phone:'+905321234567',wa:true,wa_at:'2026-09-30T10:00:00Z',ok:true,boxes:3,hemen:1,orders:2,devs:2,banned:false,first:'2026-09-30T09:00:00Z',last:'2026-09-30T11:00:00Z'},{email:'x@example.com',name:'',phone:null,wa:false,ok:false,boxes:0,hemen:0,orders:1,devs:1,banned:true,first:'2026-09-29T09:00:00Z',last:'2026-09-29T09:00:00Z'}]})}; if(s.endsWith('/admin/user-flag')){ calls.push(JSON.parse(init.body)); return {ok:true,status:200,json:async()=>({ok:true})}; } return f0(u,init); };
    w.document.body.insertAdjacentHTML('beforeend','<details id="memSet"><summary><span id="memSetSub"></span></summary><div id="userList"></div></details>'); await w.__g('loadUsers')(); const el=w.document.getElementById('userList');
    T('member rows (v30k): name · e-mail · phone, WhatsApp "✓ … kendisi" / "sorulmadı", 3 paket · ⚡1, 2 sipariş · 2 cihaz; buttons: Grupta değil (wa member), Onayla (flagged); no table', /Ayşe Kaya/.test(el.textContent) && /\+905321234567/.test(el.textContent) && /✓ WhatsApp · kendisi/.test(el.textContent) && /sorulmadı/.test(el.textContent) && !/katılmadı/.test(el.textContent) && /3 paket · ⚡1/.test(el.textContent) && /2 sipariş · 2 cihaz/.test(el.textContent) && !el.querySelector('table') && el.querySelectorAll('button').length===2 && el.querySelectorAll('button')[0].textContent==='Grupta değil' && el.querySelectorAll('button')[1].textContent==='Onayla' && /askıda/.test(el.textContent) && /grupta değil/.test(el.textContent) && !!w.document.getElementById('memSet') && /2 üye · grupta 1 · işaretli 1/.test(w.document.getElementById('memSetSub').textContent));
    w.confirm=()=>true; await w.__g('userFlag')('ayse@example.com',false); T('Grupta değil → POST /admin/user-flag {email, ok:false}', calls.length===1 && calls[0].email==='ayse@example.com' && calls[0].ok===false);
    // a member not yet asked and not flagged gets "Grupta ✓" → POST {email, wa:true}
    w.fetch=async(u,init)=>{ const s=String(u); if(s.endsWith('/admin/users')) return {ok:true,status:200,json:async()=>({ok:true,n:1,users:[{email:'z@example.com',name:'Zeynep',phone:'+905000000000',wa:false,ok:true,boxes:1,hemen:0,orders:1,devs:1,banned:false,first:'2026-09-29T09:00:00Z',last:'2026-09-29T09:00:00Z',coffees:[{name:'El Recreo',q:1,hemen:0,conv:1,done:0}]}]})}; if(s.endsWith('/admin/user-flag')){ calls.push(JSON.parse(init.body)); return {ok:true,status:200,json:async()=>({ok:true})}; } return f0(u,init); };
    await w.__g('loadUsers')(); const el2=w.document.getElementById('userList');
    T('v30p: "n paket" carries the per-coffee breakdown as a hover tip (data-tip)', (()=>{ const b=el2.querySelector('b.tip'); return !!b && b.textContent==='1 paket' && /tip/.test(b.className); })());
    T('unasked member: "Grupta ✓" + "Grupta değil" buttons', el2.querySelectorAll('button').length===2 && el2.querySelectorAll('button')[0].textContent==='Grupta ✓');
    await w.__g('userWa')('z@example.com',true); T('Grupta ✓ → POST /admin/user-flag {email, wa:true}', calls.some(c=>c.email==='z@example.com'&&c.wa===true));
    T('settings fields for login exist (s_login select · s_wagroup)', !!w.document.getElementById('s_login') && !!w.document.getElementById('s_wagroup') && /login_required:\$\('s_login'\)\.value/.test(html) && /wa_group_url:\$\('s_wagroup'\)/.test(html));
    T('v30o: no Ayarlar field for the favourites; Ayarlar save never sends offer_top5', !w.document.getElementById('s_top5') && !/offer_top5:\$\(/.test(html)); }
  // v30o: favourites live in Kahve listesi — each row: "☆ Favorilere ekle" / "★ n · çıkar"; toggle posts {offer_top5: ids}; max 5
  { const w=mk(VARS); const posts=[]; const f0=w.fetch; w.fetch=async(u,init)=>{ const s=String(u); if(s.endsWith('/admin/settings')&&init&&init.method==='POST'){ posts.push(JSON.parse(init.body)); return {ok:true,status:200,json:async()=>({ok:true})}; } if(s.endsWith('/admin/settings')) return {ok:true,status:200,json:async()=>({ok:true,settings:{offer_top5:'22222222-2222-4222-8222-222222222222'}})}; if(s.endsWith('/admin/users')) return {ok:true,status:200,json:async()=>({ok:true,n:0,users:[]})}; return f0(u,init); };
    w.__g("OFFERS=[{id:'11111111-1111-4111-8111-111111111111',name:'El Recreo',active:true,published:true,dep:17,n:17,seated:0,meta:{}},{id:'22222222-2222-4222-8222-222222222222',name:'Baho',active:true,published:true,dep:3,n:3,seated:0,meta:{}}]; OFFCFG={goal:40,dep_url:'https://coffeenutz.net/cart/1:1'};");
    await w.__g('loadOfferSettings')(); const btn=id=>[...w.document.querySelectorAll('#offList button')].find(b=>(b.getAttribute('onclick')||'').includes("favToggle('"+id+"')"));
    T('settings offer_top5 → Baho row shows "★ 1 · çıkar", El Recreo row shows "☆ Favorilere ekle"', btn('22222222-2222-4222-8222-222222222222').textContent==='★ 1 · çıkar' && btn('11111111-1111-4111-8111-111111111111').textContent==='☆ Favorilere ekle');
    await w.__g('favToggle')('11111111-1111-4111-8111-111111111111'); T('☆ on El Recreo → POST /admin/settings {offer_top5:"baho-id,recreo-id"} and the row flips to "★ 2 · çıkar"', posts.length===1 && posts[0].offer_top5==='22222222-2222-4222-8222-222222222222,11111111-1111-4111-8111-111111111111' && btn('11111111-1111-4111-8111-111111111111').textContent==='★ 2 · çıkar');
    await w.__g('favToggle')('22222222-2222-4222-8222-222222222222'); T('★ on Baho → removed; El Recreo becomes ★ 1', posts[1].offer_top5==='11111111-1111-4111-8111-111111111111' && btn('11111111-1111-4111-8111-111111111111').textContent==='★ 1 · çıkar' && btn('22222222-2222-4222-8222-222222222222').textContent==='☆ Favorilere ekle');
    w.__g("TOP5=['a','b','c','d','e']"); posts.length=0; await w.__g('favToggle')('22222222-2222-4222-8222-222222222222'); T('sixth favourite → alert, nothing posted', posts.length===0 && w.alerts.some(a=>/5.i dolu/.test(a))); }
  // v30i: "Kilitle şimdi" appears only on published, unlocked coffees with kapora; posts /admin/offer-lock; members backfill button posts /admin/members-backfill
  { const w=mk(VARS); const calls=[]; const f0=w.fetch; w.fetch=async(u,init)=>{ const s=String(u); if(s.endsWith('/admin/offer-lock')){ calls.push(['lock',JSON.parse(init.body)]); return {ok:true,status:200,json:async()=>({ok:true,lock:{n:3,dep:17,dep_tl:100},offers:[]})}; } if(s.endsWith('/admin/members-backfill')){ calls.push(['bf']); return {ok:true,status:200,json:async()=>({ok:true,created:12,skipped:2,looked:12,shopify:'ok'})}; } if(s.endsWith('/admin/users')) return {ok:true,status:200,json:async()=>({ok:true,n:0,users:[]})}; return f0(u,init); };
    w.__g("OFFERS=[{id:'11111111-1111-4111-8111-111111111111',name:'El Recreo',active:true,published:true,dep:17,n:17,seated:0,meta:{}},{id:'22222222-2222-4222-8222-222222222222',name:'Locked',active:true,published:true,dep:40,n:40,seated:0,lock:{n:2,dep:40,at:'2026-09-20T10:00:00Z',state:'locked'},meta:{}},{id:'33333333-3333-4333-8333-333333333333',name:'Draft',active:true,published:false,dep:3,n:3,seated:0,meta:{}}]; OFFCFG={goal:40,dep_url:'https://coffeenutz.net/cart/1:1'}; renderOffersAdmin();");
    const btns=[...w.document.querySelectorAll('#offList button')].filter(b=>/Kilitle şimdi/.test(b.textContent));
    T('Kilitle şimdi: only on El Recreo (published, kapora, not locked) — not on the locked one, not on the draft', btns.length===1 && /17 kapora/.test(btns[0].textContent) && btns[0].getAttribute('onclick').includes("offLockNow('11111111-1111-4111-8111-111111111111')"));
    // v30l: the prompt asks the lock's deposit (prefilled with the setting); the typed value goes as dep_tl; cancel = nothing sent; bad value = alert, nothing sent
    const prompts=[]; w.document.getElementById('s_depamt').value='200'; w.prompt=(msg,def)=>{ prompts.push([msg,def]); return '100'; };
    await w.__g('offLockNow')('11111111-1111-4111-8111-111111111111'); T('Kilitle şimdi → prompt (prefilled 200 from settings) → typed 100 → POST /admin/offer-lock {id, dep_tl:100} + WhatsApp reminder alert', prompts.length===1 && prompts[0][1]==='200' && /kapora verenlerin GERÇEKTEN ödediği/.test(prompts[0][0]) && calls.some(c=>c[0]==='lock'&&c[1].id==='11111111-1111-4111-8111-111111111111'&&c[1].dep_tl===100) && w.alerts.some(a=>/Kilitlendi · oturum #3/.test(a) && /100 TL\/paket/.test(a)));
    w.__g("OFFERS=[{id:'11111111-1111-4111-8111-111111111111',name:'El Recreo',active:true,published:true,dep:17,n:17,seated:0,meta:{}},{id:'22222222-2222-4222-8222-222222222222',name:'Locked',active:true,published:true,dep:40,n:40,seated:0,lock:{n:2,dep:40,at:'2026-09-20T10:00:00Z',state:'locked'},meta:{}}];");   // the lock reply replaced OFFERS with []
    calls.length=0; w.prompt=()=>null; await w.__g('offLockNow')('11111111-1111-4111-8111-111111111111'); T('prompt cancelled → no request', !calls.some(c=>c[0]==='lock'));
    w.prompt=()=>'9999'; await w.__g('offLockNow')('11111111-1111-4111-8111-111111111111'); T('deposit outside 0–5000 → alert, no request', !calls.some(c=>c[0]==='lock') && w.alerts.some(a=>/0–5000/.test(a)));
    w.__g("OFFERS[1].lock.dep_tl=100; renderOffersAdmin();"); T('locked row shows the lock deposit "100 TL/paket"', /40 kapora · 100 TL\/paket/.test(w.document.getElementById('offList').textContent));
    await w.__g('membersBackfill')(); T('Eski kaporalardan üye çıkar → POST /admin/members-backfill, message shows counts', calls.some(c=>c[0]==='bf') && /12 yeni üye · 2 zaten vardı/.test(w.document.getElementById('memBfMsg').textContent)); }
  console.log(pass+' pass, '+fail+' fail'); process.exit(fail?1:0);
})();
