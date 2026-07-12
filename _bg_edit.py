# -*- coding: utf-8 -*-
# Assert-anchored, all-or-nothing upgrade of bell-gallery.html to v2026-07-13a.
import io, sys

TARGET = "/sessions/elegant-fervent-faraday/mnt/roastingplan/bell-gallery.html"

with io.open(TARGET, "r", encoding="utf-8") as f:
    c = f.read()

assert "—" not in c, "source already contains an em dash"
orig = c

def replace_once(s, old, new):
    assert s.count(old) == 1, "anchor not unique/found: %r (count=%d)" % (old[:60], s.count(old))
    return s.replace(old, new)

# ---- 1. Supabase CDN in <head> ----
c = replace_once(c,
    "</style>\n</head>",
    "</style>\n<script src=\"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2\"></script>\n</head>")

# ---- 2. CSS additions (inserted after the .foot rule, still inside <style>) ----
FOOT = ".foot{text-align:center;color:var(--muted);font-size:12px;margin-top:16px}"
CSS_ADD = FOOT + """
.hidden{display:none}
.sect{margin-top:22px}
.sectHead{font-size:17px;font-weight:800;margin:0 0 2px}
.sectSub{color:var(--muted);font-size:12px;line-height:1.5;margin-bottom:6px}
.jcard{border-color:var(--accent)}
.jcard .approve{display:flex;align-items:center;gap:11px;margin-top:12px;padding:11px 13px;border:1px solid var(--line);border-radius:11px;background:var(--panel2);font-weight:800;font-size:15px;cursor:pointer;user-select:none}
.jcard .approve input{width:22px;height:22px;accent-color:var(--gold);flex:none}
.jcard .approve .en{color:var(--muted);font-weight:600}
.jcard .approve.on{border-color:var(--gold);background:rgba(230,193,75,0.12);color:var(--gold)}
.jcard .approve.on .en{color:var(--gold)}
.jactions{display:flex;gap:8px;margin-top:10px}
.jbtn{flex:1;background:var(--panel2);border:1px solid var(--line);border-radius:9px;color:var(--ink);font-weight:700;font-size:13px;padding:9px;cursor:pointer}
.jbtn:hover{border-color:var(--accent)}
.jbtn.del:hover{border-color:#c94f3c;color:#e0a24a}
#juryNote{color:#e0a24a;margin-top:12px}
.toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#241c16;border:1px solid var(--line);color:var(--ink);padding:10px 16px;border-radius:10px;font-size:13px;z-index:60;box-shadow:0 8px 24px rgba(0,0,0,.45);max-width:88%}"""
c = replace_once(c, FOOT, CSS_ADD)

# ---- 3. Canvas heights 440 -> 460 (three curated canvases) ----
assert c.count('height="440"') == 3, "expected 3 curated canvases at height 440, found %d" % c.count('height="440"')
c = c.replace('height="440"', 'height="460"')

# ---- 4. Community + Jury sections before the link row ----
ROW = '  <div class="row">'
SECTIONS = """  <div class="sect" id="jurySection" style="display:none">
    <div class="card jcard" style="background:var(--panel);padding:14px 16px">
      <span class="tag">jüri · the jury</span>
      <div class="cap">Topluluk gönderileri · Community submissions</div>
      <div class="story"><div class="tr">Her gönderi burada. Kutuyu işaretle, oyuna girsin; kaldır, çıksın. Evreler her çandan hesaplanır.</div><div class="en">Every submission lands here. Tick the box to put a bell in the game, untick to pull it. Stages are computed from each bell.</div></div>
      <div class="meta" id="juryCount" style="margin-top:10px"></div>
      <div class="meta" id="juryNote"></div>
    </div>
    <div id="juryList"></div>
  </div>

  <div class="sect" id="commSection">
    <div class="sectHead">Topluluktan · From the community</div>
    <div class="sectSub">Onaylanmış gönderiler. Renkler ölçüm; evreler her çandan hesaplanır. · Approved submissions. Colors are measured; stages are computed from each bell.</div>
    <div id="commList"></div>
    <div class="meta" id="commEmpty"></div>
  </div>

""" + ROW
c = replace_once(c, ROW, SECTIONS)

# ---- 5. Version bump ----
c = replace_once(c, "v2026-07-12a", "v2026-07-13a")

# ---- 6. Replace all JS after the DATA const (rebase() through the boot lines) ----
START = "\nfunction rebase(v){"
END = "\n</script>\n</body>"
si = c.index(START)
ei = c.index(END)
assert 0 < si < ei, "script boundary anchors out of order"

NEWJS = r"""
/* ===== bell-gallery v2026-07-13a =====================================
   Public: the four curated bells with real stage pins, plus an approved
   community section with COMPUTED stage pins. Jury mode (Omer's signed-in
   Supabase session only): every submission with an in-the-game checkbox
   bound to `approved`, delete, and a replay link. No login UI: the session
   is reused from the same-origin localStorage the Guide/Listener created. */

// ---- Supabase (anon key + reused session), same pattern as crack-listen ----
var SUPA_URL='https://efjvfggwnhqkunjvoyjb.supabase.co';
var SUPA_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmanZmZ2d3bmhxa3VuanZveWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMTA5MDEsImV4cCI6MjA5Nzg4NjkwMX0.A42X5lr8bYarJZVjPmfb45oyVnWYREODF4a6Y7i_tDA';
var ADMIN_EMAIL='omer_aydin@coffeenutz.net';
var SB=null; try{ if(typeof supabase!=='undefined' && supabase.createClient) SB=supabase.createClient(SUPA_URL,SUPA_KEY); }catch(e){}

var JURY_ROWS=[], COMM_ROWS=[];
function $(id){ return document.getElementById(id); }
function el(tag,cls,txt){ var e=document.createElement(tag); if(cls) e.className=cls; if(txt!=null) e.textContent=txt; return e; }

// ---- bell math (curated look kept from the prior gallery) ----
function rebase(v){ if(!v||!v.length) return {cr:[],span:1}; var t0=v[0][0]; var cr=v.map(function(p){return {t:p[0]-t0,g:p[1]};}); return {cr:cr,span:cr[cr.length-1].t||1}; }
function binOf(cr,span){
  var bin=5, nb=Math.max(1,Math.ceil((span+bin)/bin)), counts=new Array(nb).fill(0);
  for(var k=0;k<cr.length;k++){ var i=Math.min(nb-1,Math.max(0,Math.floor(cr[k].t/bin))); counts[i]+=cr[k].g; }
  var sig=Math.max(1.0,nb/9), sm=new Array(nb).fill(0);
  for(var a=0;a<nb;a++){ var s=0,ws=0; for(var b=0;b<nb;b++){ var w=Math.exp(-0.5*((b-a)/sig)*((b-a)/sig)); s+=counts[b]*w; ws+=w; } sm[a]=s/ws; }
  return {counts:counts,sm:sm,nb:nb};
}

// ---- COMPUTED STAGES (submissions + non-curated bells). Never invents C1. ----
// 2 s gaussian-lite smoothed gain bins; A0=first crack(0); A1=argmax slope [A0..peak];
// B0=argmin curvature (A1..peak]; B1=peak center only if interior (>=2 declining bins
// after it); C0=first bin after B1 below 70% of peak.
function smoothGains(cr){
  var bin=2, span=cr.length?cr[cr.length-1].t:0, nb=Math.max(1,Math.ceil((span+bin)/bin));
  var g=new Array(nb).fill(0);
  for(var i=0;i<cr.length;i++){ var b=Math.min(nb-1,Math.max(0,Math.floor(cr[i].t/bin))); g[b]+=cr[i].g; }
  var sig=1.0, sm=new Array(nb).fill(0);
  for(var a=0;a<nb;a++){ var s=0,ws=0; for(var j=0;j<nb;j++){ var d=(j-a)/sig, w=Math.exp(-0.5*d*d); s+=g[j]*w; ws+=w; } sm[a]=s/ws; }
  return {sm:sm,nb:nb,bin:bin};
}
function computeStages(cr){
  if(!cr||!cr.length) return [];
  var o=smoothGains(cr), sm=o.sm, nb=o.nb, bin=o.bin;
  var ctr=function(i){ return (i+0.5)*bin; };
  var peak=-Infinity, peakIdx=0;
  for(var i=0;i<nb;i++){ if(sm[i]>peak){ peak=sm[i]; peakIdx=i; } }
  var stages=[['A0',0]];
  if(peakIdx>=1){
    var bestS=-Infinity, bestI=0;
    for(var s=0;s<peakIdx;s++){ var sl=sm[s+1]-sm[s]; if(sl>bestS){ bestS=sl; bestI=s; } }
    stages.push(['A1', ctr(bestI)]);
    var minC=Infinity, bI=-1;
    for(var k=bestI+1;k<=peakIdx;k++){ if(k-1<0||k+1>=nb) continue; var cu=sm[k-1]-2*sm[k]+sm[k+1]; if(cu<minC){ minC=cu; bI=k; } }
    if(bI>=0) stages.push(['B0', ctr(bI)]);
    var interior = (peakIdx<=nb-3) && sm[peakIdx+1]<peak && sm[peakIdx+2]<peak;
    if(interior){
      stages.push(['B1', ctr(peakIdx)]);
      var thr=0.7*peak, c0=-1;
      for(var m=peakIdx+1;m<nb;m++){ if(sm[m]<thr){ c0=m; break; } }
      if(c0>=0) stages.push(['C0', ctr(c0)]);
    }
  }
  return stages;
}

// ---- draw one/two bells + stage pins (reveal style) ----
function drawBellOn(cv, series, pins){
  if(!cv) return; var x=cv.getContext('2d'); if(!x) return;
  var W=cv.width, H=cv.height, L=54, gx=L, gy=34, gw=W-2*L, gh=H-110, base=gy+gh;
  x.clearRect(0,0,W,H); x.fillStyle='#201a15'; x.fillRect(0,0,W,H);
  var span=Math.max.apply(null, series.map(function(s){return s.span;}))||1;
  x.strokeStyle='#3a2f26'; x.lineWidth=2; x.beginPath(); x.moveTo(gx,base); x.lineTo(gx+gw,base); x.stroke();
  series.forEach(function(s){
    var o=binOf(s.cr,span), counts=o.counts, sm=o.sm, nb=o.nb;
    var peak=Math.max.apply(null,sm)||1, maxC=Math.max.apply(null,counts)||1;
    if(series.length===1){ x.fillStyle='rgba(201,138,60,0.26)'; var bw=Math.max(3,gw/nb-3);
      counts.forEach(function(n,i){ if(!n) return; var h2=(n/maxC)*(gh-26); x.fillRect(gx+(i/nb)*gw, base-h2, bw, h2); }); }
    x.strokeStyle=s.color; x.lineWidth=6; x.lineCap='round'; x.lineJoin='round'; x.globalAlpha=series.length>1?0.92:1; x.beginPath();
    for(var i=0;i<nb;i++){ var px=gx+((i+0.5)/nb)*gw, py=base-(sm[i]/peak)*(gh-26); i?x.lineTo(px,py):x.moveTo(px,py); }
    x.stroke(); x.globalAlpha=1;
  });
  if(pins && pins.stages && pins.stages.length){
    var nb2=Math.max(1,Math.ceil((span+5)/5));
    var col=pins.muted?'#b89a4a':'#e6c14b';
    var xForT=function(t){ var xx=gx+(t/(5*nb2))*gw; if(xx<gx) xx=gx; if(xx>gx+gw) xx=gx+gw; return xx; };
    x.textAlign='center';
    pins.stages.forEach(function(st){ var xg=xForT(st[1]);
      x.strokeStyle=col; x.lineWidth=2; x.globalAlpha=pins.muted?0.78:1; x.beginPath(); x.moveTo(xg,base-16); x.lineTo(xg,base+3); x.stroke();
      x.fillStyle=col; x.font='700 18px -apple-system,Helvetica,sans-serif'; x.fillText(st[0], xg, base+20); x.globalAlpha=1; });
    if(pins.computed){ x.textAlign='right'; x.fillStyle='#8a7a68'; x.font='600 15px -apple-system,Helvetica,sans-serif'; x.fillText('hesaplanan · computed', gx+gw, gy-4); }
    x.textAlign='left';
  }
  x.fillStyle='#a8998a'; x.font='600 22px -apple-system,Helvetica,sans-serif'; x.textAlign='left';
  x.fillText('çan · the bell · gain / 5 s', gx, base+44);
}

// ---- curated bells: REAL stages (from the crack-listen ecosystem CSVs) ----
var CURATED_STAGES={
  ref1400:[['A0',0],['A1',31.78],['B0',47.78],['B1',63.78],['C0',96.98]],
  grew1259:[['A0',0.05],['A1',46.25],['B0',50.25],['B1',50.25],['C0',61.85]],
  cut1440:[['A0',0],['A1',3.8],['B0',15.8],['B1',27.8]]
};
function drawCurated(){
  var r1=rebase(DATA.ref1400.v);  drawBellOn($('c1'),[{cr:r1.cr,span:r1.span,color:'#e6c14b'}],{stages:CURATED_STAGES.ref1400});
  var r2=rebase(DATA.grew1259.v); drawBellOn($('c2'),[{cr:r2.cr,span:r2.span,color:'#e6c14b'}],{stages:CURATED_STAGES.grew1259});
  var a=rebase(DATA.cut1440.v), b=rebase(DATA.cut1225.v);
  drawBellOn($('c3'),[{cr:a.cr,span:a.span,color:'#e6c14b'},{cr:b.cr,span:b.span,color:'#3c7a5a'}],{stages:CURATED_STAGES.cut1440});
  var m1=$('m1'); if(m1) m1.textContent='n=1 · '+DATA.ref1400.v.length+' çatlak · cracks · '+Math.round(r1.span)+' s';
  var m2=$('m2'); if(m2) m2.textContent='n=1 · '+DATA.grew1259.v.length+' çatlak · cracks · '+Math.round(r2.span)+' s';
}

// ---- small helpers ----
function toast(msg){ try{ var t=el('div','toast',msg); document.body.appendChild(t); setTimeout(function(){ try{t.remove();}catch(e){} },2600); }catch(e){} }
function fmtDate(s){ if(!s) return ''; try{ return new Date(s).toISOString().slice(0,10); }catch(e){ return String(s).slice(0,10); } }
function creditLine(row){ var c2=row.credit?String(row.credit):'', co=row.company?String(row.company):''; if(c2&&co) return c2+' · '+co; return c2||co; }
function copyReplay(id){ var link='https://guide.coffeenutz.net/replay.html?id='+id;
  try{ if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(link); toast('Bağlantı kopyalandı · Link copied'); } else toast(link); }catch(e){ toast(link); } }
var SQL_MSG='Güncelleme geçmedi: yönetici ilkeleri eksik olabilir. Supabase SQL düzenleyicide game-samples-admin.sql dosyasını bir kez çalıştır. · Update did not take: admin policies may be missing. Run game-samples-admin.sql once in the Supabase SQL editor.';
function showJuryNote(missing){ var e=$('juryNote'); if(!e) return; e.textContent = missing ? SQL_MSG : ''; }
function updateCount(){ var e=$('juryCount'); if(!e) return; var n=0; for(var i=0;i<JURY_ROWS.length;i++) if(JURY_ROWS[i].approved) n++; var m=JURY_ROWS.length-n; e.textContent = n+' onaylı · approved, '+m+' bekliyor · pending'; }

function bellFor(row){
  var reb=rebase(row.cracks||[]); var stages=computeStages(reb.cr);
  var cv=el('canvas'); cv.width=900; cv.height=380;
  drawBellOn(cv,[{cr:reb.cr,span:reb.span,color:'#e6c14b'}],{stages:stages,muted:true,computed:true});
  return {cv:cv, reb:reb, stages:stages};
}

// ---- PUBLIC community section (anon, approved only) ----
function buildCommCard(row){
  var card=el('div','card'); var b=bellFor(row);
  card.appendChild(el('div','cap', row.coffee || 'Topluluk kavurması · Community roast'));
  card.appendChild(b.cv);
  var cl=creditLine(row); if(cl) card.appendChild(el('div','meta', cl));
  card.appendChild(el('div','meta', 'ölçülen renk · measured color: '+row.terminal_ag+' Agtron'));
  card.appendChild(el('div','meta', b.reb.cr.length+' çatlak · cracks · '+Math.round(b.reb.span)+' s'));
  return card;
}
function renderCommunity(){
  var list=$('commList'); if(list) list.innerHTML='';
  var url=SUPA_URL+'/rest/v1/game_samples?approved=eq.true&select=id,coffee,credit,company,cracks,terminal_ag,created_at';
  var p;
  if(typeof fetch==='function'){
    p=fetch(url,{headers:{apikey:SUPA_KEY,Authorization:'Bearer '+SUPA_KEY}})
      .then(function(r){ return (r&&r.ok)?r.json():[]; }).catch(function(){ return []; });
  } else { p=Promise.resolve([]); }
  return p.then(function(rows){
    if(!Array.isArray(rows)) rows=[];
    COMM_ROWS=rows;
    if(list){ for(var i=0;i<rows.length;i++) list.appendChild(buildCommCard(rows[i])); }
    var em=$('commEmpty'); if(em) em.textContent = rows.length ? '' : 'Henüz onaylı gönderi yok. · No approved submissions yet.';
    return rows;
  });
}

// ---- JURY: flip approved, delete, replay link (his session only) ----
function updateApproved(id, val, revert){
  if(!SB){ if(revert) revert(); showJuryNote(true); return Promise.resolve(false); }
  return Promise.resolve(SB.from('game_samples').update({approved:val}).eq('id',id).select())
    .then(function(res){
      if(res && res.error){ if(revert) revert(); updateCount(); toast('Kaydedilemedi · Could not save'); showJuryNote(true); return false; }
      if(!res || !res.data || !res.data.length){ if(revert) revert(); updateCount(); showJuryNote(true); return false; }
      showJuryNote(false); updateCount();
      toast(val ? 'Oyuna eklendi · Added to the game' : 'Oyundan çıkarıldı · Removed from the game');
      return true;
    }).catch(function(){ if(revert) revert(); updateCount(); toast('Kaydedilemedi · Could not save'); showJuryNote(true); return false; });
}
function deleteRow(id, cardEl){
  var ok=true; try{ ok=confirm('Bu gönderiyi sil? Geri alınamaz. · Delete this submission? This cannot be undone.'); }catch(e){ ok=true; }
  if(!ok) return Promise.resolve(false);
  if(!SB){ showJuryNote(true); return Promise.resolve(false); }
  return Promise.resolve(SB.from('game_samples').delete().eq('id',id).select())
    .then(function(res){
      if(res && res.error || !res || !res.data || !res.data.length){ showJuryNote(true); toast('Silinemedi · Could not delete'); return false; }
      JURY_ROWS=JURY_ROWS.filter(function(r){ return r.id!==id; });
      if(cardEl) cardEl.remove(); updateCount(); toast('Silindi · Deleted'); return true;
    }).catch(function(){ showJuryNote(true); toast('Silinemedi · Could not delete'); return false; });
}
function buildJuryCard(row){
  var card=el('div','card jcard'); var b=bellFor(row);
  card.appendChild(el('div','cap', row.coffee || '-'));
  card.appendChild(b.cv);
  card.appendChild(el('div','meta', creditLine(row) || 'kredi yok · no credit'));
  card.appendChild(el('div','meta', b.reb.cr.length+' çatlak · cracks · '+Math.round(b.reb.span)+' s · '+row.terminal_ag+' Agtron · '+fmtDate(row.created_at)));
  var lab=el('label','approve');
  var cb=el('input'); cb.type='checkbox'; cb.checked=!!row.approved;
  var sp=el('span'); sp.innerHTML='Oyunda · <span class="en">In the game</span>';
  lab.appendChild(cb); lab.appendChild(sp);
  if(row.approved) lab.classList.add('on');
  cb.addEventListener('change', function(){
    var val=cb.checked; row.approved=val; lab.classList.toggle('on',val); updateCount();
    updateApproved(row.id, val, function(){ cb.checked=!val; row.approved=!val; lab.classList.toggle('on',!val); });
  });
  card.appendChild(lab);
  var act=el('div','jactions');
  var del=el('button','jbtn del'); del.innerHTML='Sil · <span class="en">Delete</span>';
  del.addEventListener('click', function(){ deleteRow(row.id, card); });
  var cp=el('button','jbtn'); cp.innerHTML='Tekrar bağlantısı · <span class="en">Replay link</span>';
  cp.addEventListener('click', function(){ copyReplay(row.id); });
  act.appendChild(del); act.appendChild(cp); card.appendChild(act);
  return card;
}
function renderJury(){
  var sec=$('jurySection'); if(sec) sec.style.display='';
  var comm=$('commSection'); if(comm) comm.style.display='none';
  var list=$('juryList'); if(list) list.innerHTML='';
  var q=SB.from('game_samples').select('id,coffee,credit,company,cracks,terminal_ag,replay_ok,approved,created_at');
  if(q && q.order) q=q.order('created_at',{ascending:false});
  return Promise.resolve(q).then(function(res){
    if(res && res.error){ showJuryNote(true); JURY_ROWS=[]; }
    else JURY_ROWS=(res && res.data) ? res.data : [];
    if(list){ for(var i=0;i<JURY_ROWS.length;i++) list.appendChild(buildJuryCard(JURY_ROWS[i])); }
    updateCount();
    return JURY_ROWS;
  }).catch(function(){ showJuryNote(true); JURY_ROWS=[]; updateCount(); return []; });
}

// ---- boot: public by default, jury only for his signed-in session ----
function boot(){
  try{ drawCurated(); }catch(e){}
  var admin=false, done;
  var afterUser=function(u){
    if(u && u.email && String(u.email).toLowerCase()===ADMIN_EMAIL){ admin=true; return renderJury(); }
    return renderCommunity();
  };
  var userP;
  if(SB && SB.auth && SB.auth.getUser){
    userP=Promise.resolve(SB.auth.getUser()).then(function(r){ return (r&&r.data)?r.data.user:null; }).catch(function(){ return null; });
  } else { userP=Promise.resolve(null); }
  done=userP.then(afterUser).then(function(){
    window.__bgState={admin:admin, jury:JURY_ROWS, comm:COMM_ROWS};
    if(window.__bgResolve) window.__bgResolve(window.__bgState);
    return window.__bgState;
  }).catch(function(err){
    window.__bgState={admin:admin, error:String(err)};
    if(window.__bgResolve) window.__bgResolve(window.__bgState);
  });
  return done;
}

// test hooks
window.__bg={computeStages:computeStages, rebase:rebase, drawBellOn:drawBellOn, buildJuryCard:buildJuryCard, buildCommCard:buildCommCard, renderJury:renderJury, renderCommunity:renderCommunity, updateApproved:updateApproved, deleteRow:deleteRow, boot:boot, sb:function(){return SB;}};
window.__bgReady=new Promise(function(res){ window.__bgResolve=res; });
try{ boot(); }catch(e){ if(window.__bgResolve) window.__bgResolve({error:String(e)}); }
"""

c = c[:si] + NEWJS + c[ei:]

# ---- Final guards: all-or-nothing ----
assert "—" not in c, "refusing to write: an em dash slipped in"
assert "v2026-07-13a" in c and "v2026-07-12a" not in c, "version bump incomplete"
assert c.count('height="460"') == 3
assert 'id="jurySection"' in c and 'id="commSection"' in c
assert 'supabase-js@2' in c
assert 'function computeStages' in c and 'function buildJuryCard' in c
assert c != orig

with io.open(TARGET, "w", encoding="utf-8") as f:
    f.write(c)
print("OK: wrote %d bytes (was %d)" % (len(c), len(orig)))
