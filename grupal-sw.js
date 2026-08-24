/* grupal-sw.js · v2026-08-24a · Grup-Al service worker
   Scope is /grupal ONLY. This worker must never touch the rest of the fleet:
   it handles same-origin GETs whose path starts with /grupal, EXCEPT the admin
   cockpit, and it never caches API calls (Supabase is cross-origin anyway).
   Strategy: network-first with cache fallback, so a push always wins and the
   cache only speaks when the network is gone. */
const V='grupal-v2026-08-24a';
const CORE=['/grupal','/grupal.html','/manifest-grupal.json','/grupal-icon-192.png','/grupal-icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.indexOf('grupal-')===0&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET') return;
  const u=new URL(req.url);
  if(u.origin!==location.origin) return;
  if(u.pathname.indexOf('/grupal')!==0) return;
  if(u.pathname.indexOf('/grupal-admin')===0) return;   // cockpit stays raw network, always
  e.respondWith(
    fetch(req).then(r=>{
      if(r&&r.ok&&r.type==='basic'){ const cp=r.clone(); caches.open(V).then(c=>c.put(req,cp)); }
      return r;
    }).catch(()=>caches.match(req).then(m=>m||caches.match('/grupal')).then(m=>m||new Response(
      '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="background:#16130f;color:#f3ede4;font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center"><div><div style="font-weight:800;font-size:20px;color:#c98a3c;letter-spacing:3px">GRUP-AL</div><div style="margin-top:10px;font-size:14px;color:#a8998a">Bağlantı yok. İnternete dönünce masa burada.</div></div></body>',
      {headers:{'content-type':'text/html; charset=utf-8'}})))
  );
});
/* push groundwork: handlers are live, the SUBSCRIBE flow ships with VAPID keys later.
   A push that ever arrives renders honestly; nothing pretends to be subscribed. */
self.addEventListener('push',e=>{
  let d={}; try{ d=e.data?e.data.json():{}; }catch(err){ d={body:e.data&&e.data.text?e.data.text():''}; }
  e.waitUntil(self.registration.showNotification(d.title||'Grup-Al',{
    body:d.body||'',icon:'/grupal-icon-192.png',badge:'/grupal-icon-192.png',data:{url:d.url||'/grupal'}}));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url=(e.notification.data&&e.notification.data.url)||'/grupal';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{
    for(const w of ws){ if(w.url.indexOf('/grupal')>=0&&'focus' in w) return w.focus(); }
    return self.clients.openWindow(url);
  }));
});
