// functions/_middleware.js — Cloudflare Pages Function v4 (2026-09-07, Ömer: "grup-al.com adres çubuğunda kalsın"; 10.09: dışarıya söylenen ad /juri)
// grup-al.com bu Pages projesine özel alan adı olarak bağlanınca: grup-al.com/ ve grup-al.com/meydan → Grup-Al sayfası (grupal.html)
// yeniden yazılarak sunulur (adres değişmez; sayfa /meydan yolunu Meydan modu sayar). www → apex 301. Diğer yollar ve
// guide.coffeenutz.net olduğu gibi (next). GoDaddy yönlendirmesi (302) ile adres çubuğu KORUNAMAZ — bu dosya o yüzden var.
// v2 (07-09 akşam): ASSETS.fetch'e /grupal.html verilince Pages "temiz URL" kuralı 308 ile /grupal'a yönlendiriyor ve tarayıcı
// grup-al.com/grupal'a düşüyordu (Web Analytics'te görüldü) — /meydan da /grupal'a dönüp Meydan modunu kaybediyordu.
// Şimdi uzantısız /grupal getirilir; yine de 3xx gelirse hedef İÇERİDE bir kez daha getirilir, tarayıcıya asla yönlendirme dönmez.
export async function onRequest(ctx) {
  const url = new URL(ctx.request.url);
  const host = url.hostname.toLowerCase();
  if (host === 'www.grup-al.com') { url.hostname = 'grup-al.com'; return Response.redirect(url.toString(), 301); }
  if (host === 'grup-al.com') {
    const p = url.pathname.replace(/\/+$/, '') || '/';
    // v3 (10.09, Ömer: dışarıya /juri denir): /juri → Jüri sayfası (sayfa yolu Meydan modu sayar) · /misafir → vitrin (kapılar)
    // v4 (10.09 öğle): /meydan artık KALICI (301) olarak /juri'ye gider — eski mail/reel linkleri kırılmaz, adres çubuğunda tek ad kalır; sorgu korunur
    if (p === '/meydan') { url.pathname = '/juri'; return Response.redirect(url.toString(), 301); }
    if (p === '/' || p === '/index.html' || p === '/juri' || p === '/misafir') return serveGrupal(ctx, url);
  }
  return ctx.next();
}

async function serveGrupal(ctx, url) {
  const fetchAsset = (path) => {
    const u = new URL(url.toString()); u.pathname = path;
    return ctx.env.ASSETS.fetch(new Request(u.toString(), ctx.request));
  };
  for (const path of ['/grupal', '/grupal.html']) {
    let res = await fetchAsset(path);
    // Pages'in kendi 30x yönlendirmesi gelirse (ör. /grupal.html → /grupal) hedefi içeride izle — en çok 2 adım
    for (let i = 0; i < 2 && res.status >= 300 && res.status < 400 && res.headers.get('location'); i++) {
      const loc = new URL(res.headers.get('location'), url);
      res = await fetchAsset(loc.pathname);
    }
    if (res.status === 200) return res;
  }
  return ctx.next();   // hiçbiri 200 vermediyse Pages'in normal davranışına bırak
}
