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
  for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)){ try{ w.eval(m[1]); }catch(e){ console.log('script error',e.message); } }
  w.eval('window.__g=function(n){return eval(n)};');
  // a Düzenle form with the two link inputs (as offRow renders them)
  w.document.body.insertAdjacentHTML('beforeend','<div id="f" style="display:grid"><input id="oe_hemen"><input id="oe_done"></div>');
  return w;
}
(async()=>{
  T('admin version bumped', /const VERSION='v2026-09-30f';/.test(html));
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
  console.log(pass+' pass, '+fail+' fail'); process.exit(fail?1:0);
})();
