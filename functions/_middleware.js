// functions/_middleware.js — Cloudflare Pages Function (2026-09-07, Ömer: "grup-al.com adres çubuğunda kalsın")
// grup-al.com bu Pages projesine özel alan adı olarak bağlanınca: grup-al.com/ ve grup-al.com/meydan → Grup-Al sayfası (grupal.html)
// yeniden yazılarak sunulur (adres değişmez; sayfa /meydan yolunu Meydan modu sayar). www → apex 301. Diğer yollar ve
// guide.coffeenutz.net olduğu gibi (next). GoDaddy yönlendirmesi (302) ile adres çubuğu KORUNAMAZ — bu dosya o yüzden var.
export async function onRequest(ctx) {
  const url = new URL(ctx.request.url);
  const host = url.hostname.toLowerCase();
  if (host === 'www.grup-al.com') { url.hostname = 'grup-al.com'; return Response.redirect(url.toString(), 301); }
  if (host === 'grup-al.com') {
    const p = url.pathname.replace(/\/+$/, '') || '/';
    if (p === '/' || p === '/index.html' || p === '/meydan') {
      const u = new URL(url.toString()); u.pathname = '/grupal.html';
      return ctx.env.ASSETS.fetch(new Request(u.toString(), ctx.request));
    }
  }
  return ctx.next();
}
