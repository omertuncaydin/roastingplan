// grupal-proxy v3.38 — Hemen-Al lane, invitations, table, counting. Run from repo root:
//   NODE_PATH=<node_modules> node --experimental-vm-modules tests/proxy.test.mjs   (needs the `typescript` package)
import { boot } from './proxy-harness.mjs';
import path from 'path'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const PROXY = process.env.PROXY || path.join(here, '..', 'proxy', 'proxy.ts');
let pass = 0, fail = 0; const T = (n, c) => { c ? pass++ : (fail++, console.log('FAIL', n)); };
const A = '10000000-0000-4000-8000-0000000000aa', B = '10000000-0000-4000-8000-0000000000bb';
// fixed clock: Tue 2026-09-29 12:00 UTC; cycle start Sunday 2026-09-27 20:59 UTC (weekly)
let NOW = Date.UTC(2026, 8, 29, 12, 0, 0); const realNow = Date.now; Date.now = () => NOW;
const px = await boot(PROXY, {
  grupal_settings: [
    { key: 'meydan_cycle_start', value: '2026-09-27T20:59:00.000Z' }, { key: 'offer_goal', value: '40' }, { key: 'offer_dep_amt', value: '100' },
    { key: 'offer_dep_url', value: 'https://coffeenutz.net/cart/111:1' }, { key: 'offer_hemen_base', value: '2' }, { key: 'offer_hemen_open', value: '0' }, { key: 'offer_hemen_inv', value: '10' } /* v3.66: the suite runs at 10 per kapora; the default (5) has its own test */ /* v3.60: the older fixtures assume lanes open without votes; the jury gate has its own block */ ],
  grupal_offers: [
    { id: A, name: 'El Recreo', origin: 'Kolombiya', process: 'washed', active: true, sort: 1, pub: { name: 'El Recreo', origin: 'Kolombiya', process: 'washed' }, meta: { list_tl: 1600, img_url: 'https://db.test/storage/v1/object/public/grupal/o/a.jpg', hemen_url: 'https://coffeenutz.net/cart/222:1', green_boxes: 4 }, created_at: '2026-09-01T00:00:00Z' },
    { id: B, name: 'Nuwa Senchi', origin: 'Peru', process: 'washed', active: true, sort: 2, pub: { name: 'Nuwa Senchi', origin: 'Peru', process: 'washed' }, meta: { list_tl: 1500 }, created_at: '2026-09-01T00:00:00Z' } ] });
const hook = (attrs, order) => px.call('POST', '/shopify-hook', { id: order.id, financial_status: 'paid', email: order.email || (String(attrs.dev || 'x').toLowerCase() + '@test.example') /* v3.46: e-mail = identity, so each test device gets its own */, customer: { first_name: order.name || 'Ömer' }, line_items: [{ quantity: order.qty || 1 }], note_attributes: Object.entries(attrs).map(([name, value]) => ({ name, value: String(value) })) });

let r = await px.call('GET', '/meydan');
T('v3.71 tag', r.json && r.json.v === '3.71');
let oa = r.json.offers.find(o => o.id === A), ob = r.json.offers.find(o => o.id === B);
T('A (photo + hemen_url) carries the lane: url, price 1280, base 2, left 2, sold 0, empty table, roast_at = next close + 1 day', oa.hemen && oa.hemen.url === 'https://coffeenutz.net/cart/222:1' && oa.hemen.price === 1280 && oa.hemen.base === 2 && oa.hemen.left === 2 && oa.hemen.sold === 0 && oa.hemen.table.length === 0 && oa.hemen.roast_at === '2026-10-05T20:59:00.000Z');
T('B (no photo) has no lane; cfg carries hemen_inv 10 (seeded) / hemen_inv_h 24', !ob.hemen && r.json.offer_cfg.hemen_inv === 10 && r.json.offer_cfg.hemen_inv_h === 24);

// ---- kapora on A → 2 invitations minted, private
r = await hook({ offer: A, dev: 'DEV1AAAAAA', terms: '1' }, { id: 9001, name: 'Ömer', email: 'omer@x.tr' });
T('kapora webhook: counted + 10 invitations minted (v3.65)', r.text === 'ok (kapora · davetiye ×10)');
const invKeys = px.DB.grupal_settings.filter(s => s.key.startsWith('inv_'));
T('ten inv_ records for A, private, exp +7d, holder name Ömer', invKeys.length === 10 && invKeys.every(s => { const j = JSON.parse(s.value); return j.o === A && j.dev === 'DEV1AAAAAA' && j.st === 'p' && j.n === 'Ömer' && j.exp === new Date(NOW + 7 * 86400000).toISOString(); }));
const code1 = invKeys[0].key.slice(4), code2 = invKeys[1].key.slice(4);
r = await px.call('GET', '/offer-mine?dev=DEV1AAAAAA');
T('offer-mine: 1 kapora vote, 10 invitations (st p), no hemen boxes', r.json.votes.length === 1 && r.json.votes[0].paid && r.json.inv.length === 10 && r.json.inv.every(i => i.st === 'p' && i.id === A) && r.json.hemen.length === 0);
r = await px.call('GET', '/meydan'); oa = r.json.offers.find(o => o.id === A);
T('meydan: A dep 1, table still empty (private)', oa.dep === 1 && oa.hemen.table.length === 0 && oa.hemen.left === 2);

// ---- kapora on B (no lane) → no invitations
r = await hook({ offer: B, dev: 'DEV2BBBBBB' }, { id: 9002 });
T('kapora on a coffee without the lane mints nothing', r.text === 'ok (kapora)' && px.DB.grupal_settings.filter(s => s.key.startsWith('inv_')).length === 10);

// ---- /inv validation for a friend
r = await px.call('GET', '/inv?c=' + code1 + '&dev=FRIEND0001');
T('/inv valid: name, coffee, price, url, st p', r.json.ok && r.json.name === 'Ömer' && r.json.coffee === 'El Recreo' && r.json.price === 1280 && r.json.url.includes('/cart/222:1') && r.json.st === 'p' && r.json.id === A);
r = await px.call('GET', '/inv?c=NOPE&dev=FRIEND0001'); T('/inv unknown code → nocode', r.json.ok === false && r.json.reason === 'nocode');

// ---- masaya bırak (owner only)
r = await px.call('POST', '/inv-table', { c: code1, dev: 'FRIEND0001' }); T('inv-table by a stranger → 403', r.status === 403);
r = await px.call('POST', '/inv-table', { c: code1, dev: 'DEV1AAAAAA' }); T('inv-table by owner → ok, st t', r.json.ok && r.json.st === 't');
r = await px.call('GET', '/meydan'); oa = r.json.offers.find(o => o.id === A);
T('meydan: table shows the invitation with the holder name', oa.hemen.table.length === 1 && oa.hemen.table[0].c === code1 && oa.hemen.table[0].n === 'Ömer');
// ---- v3.44: geri al (untable) — owner only, back to private with a fresh 24 h; table order = oldest first
r = await px.call('POST', '/inv-untable', { c: code1, dev: 'FRIEND0001' }); T('inv-untable by a stranger → 403', r.status === 403);
r = await px.call('POST', '/inv-untable', { c: code1, dev: 'DEV1AAAAAA' }); T('inv-untable by owner → st p again', r.json.ok && r.json.st === 'p');
r = await px.call('GET', '/offer-mine?dev=DEV1AAAAAA'); T('offer-mine: the ticket is private again, tat cleared, exp renewed', r.json.inv.find(i => i.c === code1).st === 'p' && !r.json.inv.find(i => i.c === code1).tat && new Date(r.json.inv.find(i => i.c === code1).exp).getTime() > NOW + 6 * 86400000);
r = await px.call('POST', '/inv-untable', { c: code1, dev: 'DEV1AAAAAA' }); T('inv-untable when not on the table → 409', r.status === 409);
NOW += 60000; r = await px.call('POST', '/inv-table', { c: code2, dev: 'DEV1AAAAAA' }); NOW += 60000; r = await px.call('POST', '/inv-table', { c: code1, dev: 'DEV1AAAAAA' });
r = await px.call('GET', '/meydan'); oa = r.json.offers.find(o => o.id === A);
T('table order: the one put on the table first comes first (code2 before code1), with tat', oa.hemen.table.length === 2 && oa.hemen.table[0].c === code2 && oa.hemen.table[1].c === code1 && !!oa.hemen.table[0].tat);
r = await px.call('POST', '/inv-untable', { c: code2, dev: 'DEV1AAAAAA' }); r = await px.call('GET', '/meydan'); oa = r.json.offers.find(o => o.id === A);
T('after taking code2 back only code1 stays on the table', oa.hemen.table.length === 1 && oa.hemen.table[0].c === code1);

// ---- friend buys via the table invitation → I row, counted, invitation used, pool untouched
r = await hook({ hemen: '1', offer: A, dev: 'FRIEND0001', inv: code1 }, { id: 9003, name: 'Ayşe', email: 'ayse@x.tr' });
T('hemen webhook via invitation', r.text === 'ok (hemen · davetiye)');
let row = px.DB.grupal_offer_votes.find(v => v.dev === 'FRIEND0001I1');
T('I-row: paid, qty 1, done_order = order id, order_id kept', row && row.paid && row.qty === 1 && row.done_order === '9003' && row.order_id === '9003' && row.offer_id === A);
const rec1 = JSON.parse(px.DB.grupal_settings.find(s => s.key === 'inv_' + code1).value);
T('invitation marked used with taker name', rec1.st === 'u' && rec1.tk === 'Ayşe' && rec1.oid === '9003');
r = await px.call('GET', '/meydan'); oa = r.json.offers.find(o => o.id === A);
T('meydan: dep 2 (her kutu bir oy), pool sold 0 / left 2, table empty again', oa.dep === 2 && oa.hemen.sold === 0 && oa.hemen.left === 2 && oa.hemen.table.length === 0 && oa.hemen.inv === 1);
r = await px.call('GET', '/inv?c=' + code1 + '&dev=OTHER00001'); T('/inv on a used code → used + taker', r.json.ok === false && r.json.reason === 'used' && r.json.taker === 'Ayşe');
r = await px.call('GET', '/offer-mine?dev=FRIEND0001');
T('friend offer-mine: no kapora votes, one hemen box via inv', r.json.votes.length === 0 && r.json.hemen.length === 1 && r.json.hemen[0].via === 'inv' && r.json.hemen[0].id === A);
r = await hook({ hemen: '1', offer: A, dev: 'FRIEND0001', inv: code1 }, { id: 9003 }); T('same order again → already counted', r.text === 'ok (already counted)');

// ---- public pool purchase → H row, pool decrements
r = await hook({ hemen: '1', offer: A, dev: 'PUBLIC0001' }, { id: 9004, name: 'Can' });
T('pool purchase accepted', r.text === 'ok (hemen)');
row = px.DB.grupal_offer_votes.find(v => v.dev === 'PUBLIC0001H1'); T('H-row exists, done_order set', row && row.done_order === '9004');
r = await px.call('GET', '/meydan'); oa = r.json.offers.find(o => o.id === A);
T('meydan: sold 1, left 1, dep 3, green_left 2 (4 − 1 inv − 1 pool)', oa.hemen.sold === 1 && oa.hemen.left === 1 && oa.dep === 3 && oa.hemen.green_left === 2);
r = await hook({ hemen: '1', offer: A, dev: 'PUBLIC0001' }, { id: 9005 }); row = px.DB.grupal_offer_votes.find(v => v.dev === 'PUBLIC0001H2');
T('second pool purchase by same device → H2 row', r.text === 'ok (hemen)' && !!row);
r = await px.call('GET', '/meydan'); oa = r.json.offers.find(o => o.id === A); T('pool now 0 left (doldu)', oa.hemen.left === 0 && oa.hemen.sold === 2);

// ---- second invitation goes to the table automatically after 24 h; limit: one table take per device per coffee per week
NOW += 25 * 3600000;
r = await px.call('GET', '/meydan'); oa = r.json.offers.find(o => o.id === A);
T('after 25 h the unsent invitations sit on the table by themselves (9 of 10; code1 was used)', oa.hemen.table.length === 9 && oa.hemen.table.some(x => x.c === code2));
r = await px.call('GET', '/inv?c=' + code2 + '&dev=FRIEND0001'); T('friend who already took one from A this week → limit', r.json.ok === false && r.json.reason === 'limit');
r = await px.call('GET', '/inv?c=' + code2 + '&dev=DEV1AAAAAA'); T('owner may use it herself (no limit for own code)', r.json.ok === true && r.json.st === 't');
r = await px.call('GET', '/inv?c=' + code2 + '&dev=NEWBIE0001'); T('a new device may take it', r.json.ok === true);
// green cap: green_boxes 4, used 3 → one left; after it, invitations refuse with reason green
r = await hook({ hemen: '1', offer: A, dev: 'NEWBIE0001', inv: code2 }, { id: 9006, name: 'Deniz' }); T('newbie buys via table invitation', r.text === 'ok (hemen · davetiye)');
r = await px.call('GET', '/meydan'); oa = r.json.offers.find(o => o.id === A); T('green_left 0 → pool left 0, dep 5', oa.hemen.green_left === 0 && oa.hemen.left === 0 && oa.dep === 5);
// mint again and check the green refusal
r = await hook({ offer: A, dev: 'DEV3CCCCCC' }, { id: 9007, name: 'Ali' }); const code3 = px.DB.grupal_settings.filter(s => s.key.startsWith('inv_')).map(s => s.key.slice(4)).find(c => c !== code1 && c !== code2);
r = await px.call('GET', '/inv?c=' + code3 + '&dev=X000000001'); T('with green exhausted the invitation says green', r.json.ok === false && r.json.reason === 'green');

// ---- v3.39 /hemen-link: single-use Shopify discount code + attributes; rules enforced before Shopify is touched
{ // fresh pool coffee B2 with lane, green 3
  const B2 = '10000000-0000-4000-8000-0000000000cc';
  px.DB.grupal_offers.push({ id: B2, name: 'Kello Bensa', origin: 'Etiyopya', process: 'washed', active: true, sort: 3, pub: { name: 'Kello Bensa', origin: 'Etiyopya', process: 'washed' }, meta: { list_tl: 1600, img_url: 'https://db.test/x.jpg', hemen_url: 'https://coffeenutz.net/cart/333:1', green_boxes: 3 }, created_at: '2026-09-01T00:00:00Z' });
  const nGql = () => px.log.filter(l => l.startsWith('GQL')).length;
  // v3.53: quantity — pool: up to the seats left (base 2 here, green 3), invitation: always 1; the cart link carries the quantity
  r = await px.call('POST', '/hemen-link', { id: B2, dev: 'QTYBUYER01', qty: 2 }); T('pool: qty 2 → /cart/333:2 and qty 2 in the reply', r.json.ok && r.json.qty === 2 && /\/cart\/333:2\?/.test(r.json.url) && r.json.via === 'pool');
  r = await px.call('POST', '/hemen-link', { id: B2, dev: 'QTYBUYER02', qty: 9 }); T('pool: qty above the seats left is capped (2 left → 2)', r.json.ok && r.json.qty === 2 && /\/cart\/333:2\?/.test(r.json.url));
  r = await px.call('POST', '/hemen-link', { id: B2, dev: 'BUYER00001' });
  T('hemen-link (pool): ok, url = variant permalink + discount code + attributes, off = 1600 − 1280 = 320, via pool', r.json.ok && r.json.via === 'pool' && r.json.off === 320 && /^https:\/\/coffeenutz\.net\/cart\/333:1\?discount=HA[A-Z0-9]{6}&attributes\[offer\]=/.test(r.json.url) && r.json.url.includes('attributes[dev]=BUYER00001') && r.json.url.includes('attributes[hemen]=1') && !r.json.url.includes('attributes[inv]'));
  const d = px.DB.__discounts[px.DB.__discounts.length - 1];
  T('discount created single-use, 2 h, product-restricted, fixed TOTAL amount (v3.58: off × qty on the order, not per item)', d.usageLimit === 1 && d.appliesOncePerCustomer === true && d.customerGets.value.discountAmount.amount === '320.00' && d.customerGets.value.discountAmount.appliesOnEachItem === false && d.customerGets.items.products.productsToAdd[0] === 'gid://shopify/Product/777' && (new Date(d.endsAt) - new Date(d.startsAt)) <= 2 * 3600000 + 60000);
  T('hl_ record stored', px.DB.grupal_settings.some(s => s.key === 'hl_' + r.json.code));
  const before = nGql();
  // exhaust the pool (base 2): two pool purchases → full
  await hook({ hemen: '1', offer: B2, dev: 'P1ZZZZZZZZ' }, { id: 9101 }); await hook({ hemen: '1', offer: B2, dev: 'P2ZZZZZZZZ' }, { id: 9102 });
  r = await px.call('POST', '/hemen-link', { id: B2, dev: 'BUYER00002' });
  T('pool full → reason full, Shopify not called', r.json.ok === false && r.json.reason === 'full' && nGql() === before);
  // invitation bypasses the pool: mint via a kapora on B2 and use the code
  await hook({ offer: B2, dev: 'DEV9ZZZZZZ' }, { id: 9103, name: 'Zeynep' });
  const codeB = px.DB.grupal_settings.filter(s => s.key.startsWith('inv_')).map(s => [s.key.slice(4), JSON.parse(s.value)]).find(([c, j]) => j.o === B2)[0];
  r = await px.call('POST', '/hemen-link', { id: B2, dev: 'BUYER00002', inv: codeB, qty: 4 }); T('invitation: qty is always 1 (one seat per invitation)', !r.json.ok || (r.json.qty === 1 && /\/cart\/333:1\?/.test(r.json.url)));
  r = await px.call('POST', '/hemen-link', { id: B2, dev: 'BUYER00002', inv: codeB });
  T('with an invitation the link is issued despite the full pool, carries attributes[inv]', r.json.ok && r.json.via === 'inv' && r.json.url.includes('attributes[inv]=' + codeB) && r.json.url.includes('discount=HA'));
  // green cap: green 3, sold 2 pool → 1 left; use it via invitation purchase, then refuse
  await hook({ hemen: '1', offer: B2, dev: 'BUYER00002', inv: codeB }, { id: 9104, name: 'Ali' });
  r = await px.call('POST', '/hemen-link', { id: B2, dev: 'BUYER00003' }); T('green exhausted → reason green (pool full anyway checked after) ', r.json.ok === false && (r.json.reason === 'full' || r.json.reason === 'green'));
  r = await px.call('POST', '/hemen-link', { id: B, dev: 'BUYER00003' }); T('coffee without a lane → nolane', r.json.ok === false && r.json.reason === 'nolane');
  r = await px.call('POST', '/hemen-link', { id: B2, dev: 'BUYER00003', inv: 'NOPE' }); T('bad invitation code → nocode', r.json.ok === false && r.json.reason === 'nocode');
}
// ---- offer-move ignores H/I rows; kapora move still works
r = await px.call('POST', '/offer-move', { dev: 'FRIEND0001', from: A, to: B }); T('a hemen box cannot be moved (no deposit)', r.status === 404);
r = await px.call('POST', '/offer-move', { dev: 'DEV2BBBBBB', from: B, to: A }); T('a kapora moves as before', r.json && r.json.ok === true);

// ---- expiry: after 7 days the record is expired
NOW += 7 * 86400000 + 60000;
r = await px.call('GET', '/inv?c=' + code3 + '&dev=X000000001'); T('after 7 days → expired', r.json.ok === false && r.json.reason === 'expired');

// ---- counting toward the lock: goal 5 → A has kapora(1) + inv(1) + pool(2) + inv(1) + moved kapora(1) = 6 ≥ 5 → lock
px.DB.grupal_settings.find(s => s.key === 'offer_goal').value = '5';
r = await px.call('GET', '/meydan'); oa = r.json.offers.find(o => o.id === A);
T('Hemen-Al boxes count toward the lock (lock record present, dep ≥ 5)', !!oa.lock && oa.lock.dep >= 5);

// ---- admin settings allowlist accepts the three new keys
r = await px.call('POST', '/admin/settings', { offer_hemen_base: '3', offer_hemen_inv: '2', offer_hemen_inv_h: '24' }, { 'x-cc-key': 'adminkey' });
T('admin settings: hemen_base still saved (dormant); hemen_inv saved (2 here, restored below); _h is fixed and not stored', r.json.ok && r.json.cfg.hemen_base === 3 && r.json.settings.offer_hemen_inv_h === undefined && r.json.cfg.hemen_inv === 2);
// v3.40 (BA): Ayarlar saved with the Hemen-Al fields left blank must NOT zero the pool / invitations (live bug: "doldu" on every lane)
r = await px.call('POST', '/admin/settings', { offer_hemen_base: '', offer_hemen_inv: '', offer_hemen_inv_h: '', offer_ban_cycles: '' }, { 'x-cc-key': 'adminkey' });
T('blank Hemen-Al settings fall back to defaults 0 (tickets only) / 5 per kapora (v3.66) / 24 h / ban 0 (v3.71: no suspension)', r.json.ok && r.json.cfg.hemen_base === 0 && r.json.cfg.hemen_inv === 5 && r.json.cfg.hemen_inv_h === 24 && r.json.cfg.ban_cycles === 0);
r = await px.call('POST', '/admin/settings', { offer_hemen_inv: '0' }, { 'x-cc-key': 'adminkey' }); T('a stored 0 also means the default 5', r.json.cfg.hemen_inv === 5);
r = await px.call('POST', '/admin/settings', { offer_hemen_inv: '10' }, { 'x-cc-key': 'adminkey' }); T('back to 10 for the rest of the suite', r.json.cfg.hemen_inv === 10);
r = await px.call('POST', '/admin/settings', { offer_hemen_base: '0' }, { 'x-cc-key': 'adminkey' }); T('an explicit "0" is still zero', r.json.ok && r.json.cfg.hemen_base === 0);
r = await px.call('POST', '/admin/settings', { offer_hemen_base: '3' }, { 'x-cc-key': 'adminkey' });

// ---- v3.40 /admin/variants: product page link → variant list from the public storefront .js endpoint
r = await px.call('POST', '/admin/variants', { url: 'https://www.coffeenutz.net/products/kolombiya-jose-espinoza-recreo-1' });
T('admin/variants needs the admin key', r.status === 401);
r = await px.call('POST', '/admin/variants', { url: 'https://www.coffeenutz.net/products/kolombiya-jose-espinoza-recreo-1?variant=1' }, { 'x-cc-key': 'adminkey' });
T('admin/variants returns id / title / price in TL / available', r.json.ok && r.json.handle === 'kolombiya-jose-espinoza-recreo-1' && r.json.variants.length === 2 && r.json.variants[0].id === 67856174350640 && r.json.variants[0].price === 1240 && r.json.variants[0].available === true && r.json.variants[1].available === false && /Sonraki/.test(r.json.variants[0].title));
r = await px.call('POST', '/admin/variants', { url: 'https://evil.example/products/x' }, { 'x-cc-key': 'adminkey' }); T('admin/variants refuses other hosts', r.status === 400 && r.json.ok === false);
r = await px.call('POST', '/admin/variants', { url: 'https://coffeenutz.net/products/yok' }, { 'x-cc-key': 'adminkey' }); T('admin/variants: unknown handle → shop 404 surfaced', r.status === 502 && /shop 404/.test(r.json.error));

// ---- v3.42: a Shopify call that never answers is cut at SHOPIFY_TIMEOUT_MS → error JSON, no hang
{ process.env.SHOPIFY_TIMEOUT_MS = '250'; px.DB.__hang = true; const t0 = Date.now(); const keep = setTimeout(() => {}, 3000);   // Node unrefs AbortSignal.timeout timers; keep the loop alive
  r = await px.call('POST', '/hemen-link', { id: A, dev: 'TIMEOUT001' }); clearTimeout(keep);
  T('hanging Shopify token call → 502 {reason:shopify, error: …timeout…} within ~1 s', r.status === 502 && r.json.ok === false && r.json.reason === 'shopify' && /timeout/.test(r.json.error) && (Date.now() - t0) < 1500);
  px.DB.__hang = false; delete process.env.SHOPIFY_TIMEOUT_MS; }
// ---- v3.41 /admin/inv-backfill: kapora rows paid before v3.38 (no inv_ records) get their invitations once
px.DB.grupal_offer_votes.push(
  { offer_id: A, dev: 'OLDDEV0001', seated: false, paid: true, qty: 2, order_id: 555, email: 'ayse.kaya@example.com', created_at: '2026-09-20T10:00:00.000Z' },
  { offer_id: A, dev: 'OLDDEV00012', seated: false, paid: true, qty: 1, order_id: 556, email: 'ayse.kaya@example.com', created_at: '2026-09-21T10:00:00.000Z' },   // v3.33 derived key of the same device
  { offer_id: A, dev: 'GONEDEV001', seated: false, paid: true, qty: 1, order_id: 557, email: 'x@example.com', done_order: 'FORFEIT', created_at: '2026-09-20T10:00:00.000Z' },
  { offer_id: B, dev: 'NOLANE0001', seated: false, paid: true, qty: 1, order_id: 558, email: 'y@example.com', created_at: '2026-09-20T10:00:00.000Z' });
r = await px.call('POST', '/admin/inv-backfill', {}); T('inv-backfill needs the admin key', r.status === 401);
const invBefore = px.DB.grupal_settings.filter(x => x.key.startsWith('inv_')).length;
r = await px.call('POST', '/admin/inv-backfill', {}, { 'x-cc-key': 'adminkey' });
// expected: OLDDEV0001 ×2 boxes → 4, plus DEV2BBBBBB (kapora paid on lane-less B, later moved to A, never minted) → 2; derived key folded, forfeited / no-lane / already-minted rows skipped
T('backfill mints 10×qty for old kapora rows without invitations (30 = 20 + 10), skips forfeited, no-lane and already-minted', r.json.ok && r.json.minted === 30 && r.json.devs === 2 && r.json.skipped.done === 1 && r.json.skipped.nolane === 1 && r.json.skipped.had >= 3 && r.json.skipped.hemen === 7);
const mine = px.DB.grupal_settings.filter(x => x.key.startsWith('inv_')).map(x => JSON.parse(x.value)).filter(j => j.dev === 'OLDDEV0001');
T('20 private invitations for OLDDEV0001 on A, named from the e-mail, flagged bf', mine.length === 20 && mine.every(j => j.o === A && j.st === 'p' && j.n === 'Ayse' && j.bf === 1));
r = await px.call('GET', '/offer-mine?dev=OLDDEV0001'); T('/offer-mine shows the backfilled tickets to that device — v3.67: dated from the kapora, so already on the table (t), 7 days from now', r.json && Array.isArray(r.json.inv) && r.json.inv.filter(i => i.id === A && i.st === 't').length === 20 && r.json.inv.filter(i => i.id === A).every(i => new Date(i.exp).getTime() === NOW + 7 * 86400000));
r = await px.call('POST', '/admin/inv-backfill', {}, { 'x-cc-key': 'adminkey' }); T('second run mints nothing', r.json.ok && r.json.minted === 0 && px.DB.grupal_settings.filter(x => x.key.startsWith('inv_')).length === invBefore + 30);

// ---- v3.43: the lane opens later (photo + link via Düzenle, then UYGULA) → the kapora paid on that coffee gets its invitations at UYGULA
{ const ob = px.DB.grupal_offers.find(o => o.id === B); const meta = { ...(ob.meta || {}), img_url: 'https://x.test/o/b.jpg', hemen_url: 'https://coffeenutz.net/cart/333:1', list_tl: 1200 };
  r = await px.call('POST', '/admin/offer-upsert', { id: B, name: ob.name, active: true, sort: ob.sort || 0, meta }, { 'x-cc-key': 'adminkey' }); T('admin sets B\'s photo + Hemen-Al link', r.json.ok);
  r = await px.call('POST', '/admin/offers-apply', {}, { 'x-cc-key': 'adminkey' });
  T('UYGULA mints the missing invitations for the newly opened lane (NOLANE0001 ×1 box → 10)', r.json.ok && r.json.backfill && r.json.backfill.ok && r.json.backfill.minted === 10 && r.json.backfill.devs === 1);
  r = await px.call('GET', '/offer-mine?dev=NOLANE0001'); T('the kapora payer on B now sees 10 tickets on B (private or table depending on the kapora age)', r.json && r.json.inv.filter(i => i.id === B && (i.st === 'p' || i.st === 't')).length === 10);
  r = await px.call('POST', '/admin/offers-apply', {}, { 'x-cc-key': 'adminkey' }); T('a second UYGULA mints nothing more', r.json.ok && r.json.backfill.minted === 0); }

// ---- v3.45 auth proxy (dormant, still answers) — a quick smoke only
r = await px.call('POST', '/auth/otp', { email: 'not-an-email' }); T('auth/otp rejects a bad e-mail', r.status === 400);
r = await px.call('POST', '/auth/verify', { email: 'ayse.kaya@example.com', token: '123 456' }); T('auth/verify still works (dormant OTP path)', r.json.ok && r.json.access_token === 'tok-ayse');
r = await px.call('POST', '/me', { dev: 'PHONE00001' }); T('/me without a token → 401', r.status === 401);
// ---- v3.46 JÜRİ KAPISI: Shopify order = registration · first-kapora WhatsApp tick · dev-bind by order no + e-mail · admin list
const hookP = (attrs, order) => px.call('POST', '/shopify-hook', { id: order.id, order_number: order.no, name: '#' + order.no, financial_status: 'paid', email: order.email, phone: order.phone || null, customer: { first_name: order.first || 'Ayşe', last_name: order.last || 'Kaya', phone: order.cphone || null }, billing_address: { phone: order.bphone || null }, line_items: [{ quantity: order.qty || 1 }], note_attributes: Object.entries(attrs).map(([name, value]) => ({ name, value: String(value) })) });
r = await px.call('GET', '/offer-mine?dev=PHONE00001'); T('offer-mine: unknown device → me.member false, wa false', r.json.me && r.json.me.member === false && r.json.me.wa === false && r.json.me.ok === true);
r = await px.call('POST', '/wa-ok', { dev: 'PHONE00001' }); T('wa-ok: device declares it joined the group', r.json.ok && r.json.wa === true && !!px.DB.grupal_settings.find(x => x.key === 'waok_PHONE00001'));
r = await px.call('GET', '/offer-mine?dev=PHONE00001'); T('offer-mine: wa true for that device even before any order', r.json.me.wa === true && r.json.me.member === false);
r = await hookP({ offer: A, dev: 'PHONE00001' }, { id: 9301, no: 1201, email: 'Ayse.Kaya@example.com', bphone: '0532 123 45 67' });
{ const m = JSON.parse(px.DB.grupal_settings.find(x => x.key === 'mem_ayse.kaya@example.com').value);
  T('webhook: member record from the order — name, phone (billing, E.164), primary dev, order no, wa from the device flag', m.email === 'ayse.kaya@example.com' && m.name === 'Ayşe Kaya' && m.phone === '+905321234567' && m.dev === 'PHONE00001' && m.orders.includes('1201') && m.wa === true && !!m.wa_at && !!px.DB.grupal_settings.find(x => x.key === 'ord_1201')); }
r = await px.call('GET', '/offer-mine?dev=PHONE00001'); T('offer-mine: me is now a member with name and phone tail, wa, ok', r.json.me.member === true && r.json.me.name === 'Ayşe Kaya' && r.json.me.phone_tail === '4567' && r.json.me.wa === true && r.json.me.ok === true);
// her laptop pays a kapora on B without any tick → rows merge into the phone (primary), member phone kept, wa unchanged
px.DB.grupal_settings.push({ key: 'inv_LAPINV02', value: JSON.stringify({ o: A, dev: 'LAPTOP0002', n: 'Ayşe', at: new Date(NOW).toISOString(), exp: new Date(NOW + 7 * 86400000).toISOString(), st: 'p', oid: 1 }) });
r = await hookP({ offer: B, dev: 'LAPTOP0002' }, { id: 9302, no: 1202, email: 'ayse.kaya@example.com', phone: '+90 532 123 45 67' });
T('webhook from another device with the same e-mail → merged into the primary device (B row on PHONE00001, invitation moved), orders 2, devs 1', px.DB.grupal_offer_votes.some(v => v.offer_id === B && v.dev === 'PHONE00001') && !px.DB.grupal_offer_votes.some(v => v.dev === 'LAPTOP0002') && JSON.parse(px.DB.grupal_settings.find(x => x.key === 'inv_LAPINV02').value).dev === 'PHONE00001' && JSON.parse(px.DB.grupal_settings.find(x => x.key === 'mem_ayse.kaya@example.com').value).orders.length === 2 && JSON.parse(px.DB.grupal_settings.find(x => x.key === 'mem_ayse.kaya@example.com').value).devs.includes('LAPTOP0002'));
// dev-bind: a third device with order no + e-mail
const B2c = '10000000-0000-4000-8000-0000000000cc'; px.DB.grupal_offer_votes.push({ offer_id: B2c, dev: 'TABLET0003', seated: false, paid: true, qty: 1, order_id: 9303, email: 'ayse.kaya@example.com', created_at: '2026-09-25T10:00:00.000Z' });
r = await px.call('POST', '/dev-bind', { order: '#1201', email: 'x@example.com', dev: 'TABLET0003' }); T('dev-bind: wrong e-mail → nomatch, nothing merged', r.status === 404 && px.DB.grupal_offer_votes.some(v => v.dev === 'TABLET0003'));
r = await px.call('POST', '/dev-bind', { order: '#1201', email: 'AYSE.kaya@example.com', dev: 'TABLET0003' }); T('dev-bind: order no + e-mail → returns the primary dev, tablet rows merged', r.json.ok && r.json.dev === 'PHONE00001' && !px.DB.grupal_offer_votes.some(v => v.dev === 'TABLET0003') && px.DB.grupal_offer_votes.some(v => v.offer_id === B2c && v.dev === 'PHONE00001'));
// v3.54: people per coffee (current run): first names from member records, package counts, arrival order, no e-mails; me.k matches
{ r = await px.call('GET', '/meydan'); const oa = r.json.offers.find(o => (o.people || []).some(p => p.n === 'Ayşe'));
  T('/meydan offers carry people[] with first names, q and k, never an e-mail (Ayşe found by first name)', !!oa && oa.people.every(p => typeof p.k === 'string' && p.q >= 1 && !/@/.test(String(p.n || ''))) && !JSON.stringify(r.json.offers).includes('@'));
  const mine = await px.call('GET', '/offer-mine?dev=PHONE00001'); const ka = oa && oa.people.find(p => p.n === 'Ayşe');
  T('offer-mine me.k equals the people entry k of the same member (page marks "sen")', typeof mine.json.me.k === 'string' && !!ka && ka.k === mine.json.me.k);
  T('people sum (q) equals the live counter dep for that coffee', !!oa && oa.people.reduce((x, p) => x + p.q, 0) === oa.dep); }
r = await px.call('GET', '/offer-mine?dev=PHONE00001'); T('offer-mine on the primary sees A, B and B2', r.json.votes.some(v => v.id === A) && r.json.votes.some(v => v.id === B) && r.json.votes.some(v => v.id === B2c));
r = await px.call('GET', '/admin/users'); T('admin/users needs the key', r.status === 401);
r = await px.call('GET', '/admin/users', null, { 'x-cc-key': 'adminkey' }); { const a = r.json.users.find(u => u.email === 'ayse.kaya@example.com');
  T('admin/users: Ayşe Kaya, phone, wa with time, boxes 3 (A + B + B2), orders 2, devs 3, ok', r.json.ok && !!a && a.name === 'Ayşe Kaya' && a.phone === '+905321234567' && a.wa === true && !!a.wa_at && a.boxes === 3 && a.orders === 2 && a.devs === 3 && a.ok === true);
  T('v3.51: coffees breakdown — 3 coffees × 1 package, names from the offers, no hemen', Array.isArray(a.coffees) && a.coffees.length === 3 && a.coffees.every(c => c.q === 1 && c.hemen === 0 && typeof c.name === 'string' && c.name.length > 0) && a.coffees.reduce((x, c) => x + c.q, 0) === a.boxes); }
r = await px.call('POST', '/admin/user-flag', { email: 'ayse.kaya@example.com', ok: false }, { 'x-cc-key': 'adminkey' }); T('admin flags Ayşe (not in the group) → ok false', r.json.ok && r.json.me.ok === false);
r = await px.call('GET', '/offer-mine?dev=PHONE00001'); T('offer-mine reports ok:false after the flag (page blocks kapora)', r.json.me.ok === false);
r = await px.call('POST', '/admin/user-flag', { email: 'ayse.kaya@example.com', ok: true }, { 'x-cc-key': 'adminkey' }); T('admin un-flags', r.json.me.ok === true);
// v3.48: admin marks a member as seen in the group → wa true by admin; page will not ask; wa:false clears it (and the device flag)
r = await px.call('POST', '/admin/user-flag', { email: 'ayse.kaya@example.com', wa: false }, { 'x-cc-key': 'adminkey' }); T('admin clears wa → member wa false, device flag removed', r.json.ok && r.json.me.wa === false && !px.DB.grupal_settings.find(x => x.key === 'waok_PHONE00001'));
r = await px.call('GET', '/offer-mine?dev=PHONE00001'); T('offer-mine after clearing → wa false (page would ask again)', r.json.me.wa === false);
r = await px.call('POST', '/admin/user-flag', { email: 'ayse.kaya@example.com', wa: true }, { 'x-cc-key': 'adminkey' }); T('admin marks Grupta ✓ → wa true', r.json.ok && r.json.me.wa === true);
r = await px.call('GET', '/admin/users', null, { 'x-cc-key': 'adminkey' }); T('admin/users shows wa_by admin', r.json.users.find(u => u.email === 'ayse.kaya@example.com').wa_by === 'admin');
// v3.52: e-mail + phone binds too (old kaporas have no ord_ record → the order-no path alone failed for the whole jury)
px.DB.grupal_offer_votes.push({ offer_id: B2c, dev: 'WATCH00004', seated: false, paid: true, qty: 1, order_id: 9304, email: 'ayse.kaya@example.com', created_at: '2026-09-25T11:00:00.000Z' });
r = await px.call('POST', '/dev-bind', { email: 'ayse.kaya@example.com', dev: 'WATCH00004' }); T('dev-bind: e-mail alone → input (400)', r.status === 400);
r = await px.call('POST', '/dev-bind', { email: 'ayse.kaya@example.com', phone: '0532 999 99 99', dev: 'WATCH00004' }); T('dev-bind: wrong phone → nomatch', r.status === 404 && px.DB.grupal_offer_votes.some(v => v.dev === 'WATCH00004'));
r = await px.call('POST', '/dev-bind', { email: 'Ayse.Kaya@example.com', phone: '0532 123 45 67', dev: 'WATCH00004' }); T('dev-bind: e-mail + phone on the order (any format) → primary dev, rows merged', r.json.ok && r.json.dev === 'PHONE00001' && !px.DB.grupal_offer_votes.some(v => v.dev === 'WATCH00004'));
r = await px.call('GET', '/offer-mine?dev=PHONE00001'); T('offer-mine: wa true again without any device flag (admin approval counts)', r.json.me.wa === true);
r = await px.call('POST', '/admin/settings', { login_required: '1', wa_group_url: 'https://chat.whatsapp.com/ABCdef123456' }, { 'x-cc-key': 'adminkey' });
T('settings: login_required + wa_group_url accepted and published in cfg', r.json.ok && r.json.cfg.login_required === true && r.json.cfg.wa_group_url === 'https://chat.whatsapp.com/ABCdef123456');
r = await px.call('POST', '/admin/settings', { wa_group_url: 'https://evil.example/x' }, { 'x-cc-key': 'adminkey' }); T('settings: a non-WhatsApp link is dropped from cfg', r.json.cfg.wa_group_url === '');
r = await px.call('GET', '/meydan'); T('/meydan offer_cfg carries login_required + wa_group_url', r.json.offer_cfg.login_required === true && 'wa_group_url' in r.json.offer_cfg);

// ---- v3.47: forced lock (Recreo without 40) → done-link with a single-use fixed-amount code → webhook marks derived keys done
{ const C = '10000000-0000-4000-8000-0000000000dd';   // a fresh published coffee with a Hemen-Al link (normal variant 1600) and a few kaporas, nowhere near 40
  px.DB.grupal_offers.push({ id: C, name: 'Kello Bensa', origin: 'Etiyopya', process: 'natural', active: true, sort: 9, pub: { name: 'Kello Bensa', origin: 'Etiyopya', process: 'natural' }, meta: { list_tl: 1600, jury_tl: 960, basket_tl: 1280, img_url: 'https://db.test/storage/v1/object/public/grupal/o/c.jpg', hemen_url: 'https://coffeenutz.net/cart/555:1' }, created_at: '2026-09-01T00:00:00Z' });
  px.DB.grupal_settings.find(s => s.key === 'offer_goal').value = '40';
  await hook({ offer: C, dev: 'JURY000001' }, { id: 9401, qty: 2, email: 'jury1@example.com' });
  await hook({ offer: C, dev: 'JURY000002' }, { id: 9402, email: 'jury2@example.com' });
  r = await px.call('POST', '/done-link', { id: C, dev: 'JURY000001' }); T('done-link before the lock → notlocked', r.json.ok === false && r.json.reason === 'notlocked');
  r = await px.call('POST', '/admin/offer-lock', { id: C }); T('offer-lock needs the admin key', r.status === 401);
  r = await px.call('POST', '/admin/offer-lock', { id: C }, { 'x-cc-key': 'adminkey' });
  T('offer-lock: locks now with dep 3, forced flag, session n, won_ + lock_ written', r.json.ok && r.json.lock.dep === 3 && r.json.lock.forced === true && typeof r.json.lock.n === 'number' && !!px.DB.grupal_settings.find(x => x.key === 'won_' + C) && !!px.DB.grupal_settings.find(x => x.key === 'lock_' + C));
  r = await px.call('POST', '/admin/offer-lock', { id: C }, { 'x-cc-key': 'adminkey' }); T('offer-lock twice → 409', r.status === 409);
  r = await px.call('GET', '/meydan'); { const oc = r.json.offers.find(o => o.id === C); T('/meydan shows the coffee locked (lock record, dep 3)', !!oc.lock && oc.lock.dep === 3); }
  r = await px.call('GET', '/offer-mine?dev=JURY000001'); T('offer-mine: the kapora is converted (conv) and not done', r.json.votes.find(v => v.id === C).conv === true && r.json.votes.find(v => v.id === C).done === false);
  NOW += 1000; r = await px.call('POST', '/done-link', { id: C, dev: 'JURY000001' });
  T('done-link: 2 boxes · due 860 each (960 − 100) · fixed code (1600−860)×2 = 1480 off · cart link /cart/555:2 with attributes[done]=1', r.json.ok && r.json.boxes === 2 && r.json.due === 860 && r.json.total === 1720 && r.json.off === 1480 && /^GA[A-Z0-9]{6}$/.test(r.json.code) && r.json.url.startsWith('https://coffeenutz.net/cart/555:2?discount=' + r.json.code) && r.json.url.includes('attributes[done]=1') && r.json.url.includes('attributes[dev]=JURY000001'));
  { const d = px.DB.__discounts[px.DB.__discounts.length - 1]; T('Shopify code: single use, fixed amount (not per item), only that product, 24 h', d.usageLimit === 1 && d.customerGets.value.discountAmount.appliesOnEachItem === false && d.customerGets.value.discountAmount.amount === '1480.00' && d.customerGets.items.products.productsToAdd[0] === 'gid://shopify/Product/777' && (new Date(d.endsAt).getTime() - new Date(d.startsAt).getTime()) > 23 * 3600000); }
  r = await px.call('POST', '/done-link', { id: C, dev: 'JURY000003' }); T('done-link for a device without a kapora → none', r.json.ok === false && r.json.reason === 'none');
  // completion order → webhook marks the row (and derived keys) done; a second done-link then says none
  px.DB.grupal_offer_votes.push({ offer_id: C, dev: 'JURY0000012', seated: false, paid: true, qty: 1, order_id: 9403, email: 'jury1@example.com', created_at: '2026-09-27T21:30:00.000Z' });   // a derived-key kapora of the same device before the lock
  r = await hook({ offer: C, dev: 'JURY000001', done: '1' }, { id: 9500, email: 'jury1@example.com' });
  T('webhook done → both the base row and the derived row carry done_order', /done/.test(r.text) && px.DB.grupal_offer_votes.filter(v => v.offer_id === C && v.dev.startsWith('JURY000001')).every(v => String(v.done_order) === '9500'));
  r = await px.call('POST', '/done-link', { id: C, dev: 'JURY000001' }); T('after completion → none', r.json.ok === false && r.json.reason === 'none');
  // ---- v3.49: the lock freezes its own deposit TL; "Kilitle şimdi" can override it (Recreo case: setting is 200 now, most payers paid 100)
  { const D = '10000000-0000-4000-8000-0000000000ee';
    px.DB.grupal_offers.push({ id: D, name: 'El Recreo', origin: 'Nikaragua', process: 'washed', active: true, sort: 10, pub: { name: 'El Recreo', origin: 'Nikaragua', process: 'washed' }, meta: { list_tl: 1600, jury_tl: 960, basket_tl: 1280, img_url: 'https://db.test/storage/v1/object/public/grupal/o/d.jpg', hemen_url: 'https://coffeenutz.net/cart/555:1' }, created_at: '2026-09-01T00:00:00Z' });
    await hook({ offer: D, dev: 'RECREO0001' }, { id: 9601, qty: 2, email: 'recreo1@example.com' });
    px.DB.grupal_settings.find(s => s.key === 'offer_dep_amt').value = '200';   // deposit raised after they paid
    r = await px.call('POST', '/admin/offer-lock', { id: D, dep_tl: 'abc' }, { 'x-cc-key': 'adminkey' }); T('offer-lock: dep_tl must be a number 0–5000', r.status === 400 && !px.DB.grupal_settings.find(x => x.key === 'won_' + D));
    r = await px.call('POST', '/admin/offer-lock', { id: D, dep_tl: 100 }, { 'x-cc-key': 'adminkey' });
    T('offer-lock with dep_tl 100 → lock record carries dep_tl 100 (setting says 200)', r.json.ok && r.json.lock.dep_tl === 100 && JSON.parse(px.DB.grupal_settings.find(x => x.key === 'lock_' + D).value).dep_tl === 100);
    r = await px.call('GET', '/meydan'); { const od = r.json.offers.find(o => o.id === D); T('/meydan lock.dep_tl = 100 for that coffee (page shows Tamamla with the right deposit)', !!od.lock && od.lock.dep_tl === 100 && r.json.offer_cfg.dep_amt === 200); }
    NOW += 1000; r = await px.call('POST', '/done-link', { id: D, dev: 'RECREO0001' });
    T('done-link uses the lock deposit: due 860 = 960 − 100 (not 760), 2 boxes → off (1600−860)×2', r.json.ok && r.json.due === 860 && r.json.dep_tl === 100 && r.json.total === 1720 && r.json.off === 1480);
    px.DB.grupal_settings.find(s => s.key === 'offer_dep_amt').value = '300';   // changing the setting later never moves a locked lot
    NOW += 1000; r = await px.call('POST', '/done-link', { id: D, dev: 'RECREO0001' }); T('deposit setting changed after the lock → due unchanged', r.json.ok && r.json.due === 860);
    px.DB.grupal_settings.find(s => s.key === 'offer_dep_amt').value = '100';
    r = await px.call('POST', '/admin/offer-lock', { id: C }, { 'x-cc-key': 'adminkey' }); T('(sanity) already-locked coffee still 409', r.status === 409);
  }
  // members backfill: old payers (no mem_ record) become members with name/phone from Shopify customers
  px.DB.grupal_settings = px.DB.grupal_settings.filter(x => x.key !== 'mem_jury1@example.com' && x.key !== 'mem_jury2@example.com');
  px.DB.grupal_offer_votes.push({ offer_id: A, dev: 'OLDJURY001', seated: false, paid: true, qty: 1, order_id: 600, email: 'old.jury@example.com', created_at: '2026-09-20T10:00:00.000Z' });
  r = await px.call('POST', '/admin/members-backfill', {}, { 'x-cc-key': 'adminkey' });
  T('members-backfill: creates members for old payers, skips existing, looks up Shopify customers', r.json.ok && r.json.created >= 3 && r.json.skipped >= 1 && r.json.shopify === 'ok');
  { const m = JSON.parse(px.DB.grupal_settings.find(x => x.key === 'mem_old.jury@example.com').value); T('backfilled member: name + phone from Shopify, primary dev, first/last, bf flag', m.name === 'Deniz Kaçak' && m.phone === '+905331112233' && m.dev === 'OLDJURY001' && !!m.first && m.bf === 1 && m.ok === true); }
  r = await px.call('POST', '/admin/members-backfill', {}, { 'x-cc-key': 'adminkey' }); T('second backfill creates nothing', r.json.ok && r.json.created === 0); }

Date.now = realNow;
// v3.50: CoffeeNutz'ın 5'i from settings (offer_top5) → /meydan offer_cfg.top5 (max 5, trimmed); empty → []
{ r = await px.call('POST', '/admin/settings', { offer_top5: ' Baho , El Recreo,AA Inoi\nFrinsa, Kelloo, Sixth, Seventh ' }, { 'x-cc-key': 'adminkey' }); T('admin settings accept offer_top5', r.json && r.json.ok !== false);
  r = await px.call('GET', '/meydan'); T('/meydan offer_cfg.top5 = first 5 trimmed names', JSON.stringify(r.json.offer_cfg.top5) === JSON.stringify(['Baho','El Recreo','AA Inoi','Frinsa','Kelloo']));
  await px.call('POST', '/admin/settings', { offer_top5: '' }, { 'x-cc-key': 'adminkey' }); r = await px.call('GET', '/meydan'); T('empty offer_top5 → [] (page falls back to its default list)', Array.isArray(r.json.offer_cfg.top5) && r.json.offer_cfg.top5.length === 0); }
{ const locks = px.DB.grupal_settings.filter(x => x.key.startsWith('lock_')).map(x => JSON.parse(x.value)); T('v3.49: every lock record written in this run carries a numeric dep_tl (auto locks freeze the setting)', locks.length >= 2 && locks.every(l => Number.isFinite(l.dep_tl) && l.dep_tl >= 0)); }
// ---- v3.55: PayTR charged, Shopify never formed the order (Burçin, 2026-10-02) → admin marks the hand-made order; open links list
{ Date.now = () => NOW; const D = '10000000-0000-4000-8000-0000000000ee', A2 = A; const KEYH = { 'x-cc-key': 'adminkey' };
  r = await px.call('GET', '/admin/links-open'); T('links-open needs the admin key', r.status === 401);
  r = await px.call('GET', '/admin/links-open', null, KEYH);
  const L = r.json.links; const rec = L.find(l => l.kind === 'done' && l.dev === 'RECREO0001');
  T('links-open: the RECREO0001 done-link is listed with coffee, 2 packages, total 1720, state wait (24 h not over), member e-mail resolved', r.json.ok && rec && rec.coffee === 'El Recreo' && rec.qty === 2 && rec.total === 1720 && rec.state === 'wait' && /^GA/.test(rec.code) && rec.email === 'recreo1@example.com');
  T('links-open: JURY000001 completed by webhook 9500 → its done-link reads ok', L.some(l => l.kind === 'done' && l.dev === 'JURY000001' && l.state === 'ok'));
  T('links-open: the B2 hemen-links of a week ago are outside the 7-day window', !L.some(l => l.dev === 'BUYER00002' || l.dev === 'QTYBUYER01'));
  T('links-open: offers list for the admin select carries El Recreo (D) as locked', r.json.offers.some(o => o.id === D && o.locked === true && o.name === 'El Recreo'));
  // fresh lane coffee E: two Hemen-Al links, one gets its order (ok), the other never does (wait → missing after 2 h)
  const E = '10000000-0000-4000-8000-0000000000e5';
  px.DB.grupal_offers.push({ id: E, name: 'Sidamo Bensa', origin: 'Etiyopya', process: 'natural', active: true, sort: 12, pub: { name: 'Sidamo Bensa', origin: 'Etiyopya', process: 'natural' }, meta: { list_tl: 1600, img_url: 'https://db.test/e.jpg', hemen_url: 'https://coffeenutz.net/cart/444:1', green_boxes: 5 }, created_at: '2026-09-01T00:00:00Z' });
  r = await px.call('POST', '/hemen-link', { id: E, dev: 'HLTEST0001', qty: 2 }); T('(setup) hemen-link E for HLTEST0001 qty 2', r.json.ok && r.json.qty === 2);
  { const hl = JSON.parse(px.DB.grupal_settings.find(s => s.key === 'hl_' + r.json.code).value); T('v3.55 hl_ record carries qty and total (2 × 1280)', hl.qty === 2 && hl.total === 2560); }
  NOW += 1000; r = await px.call('POST', '/hemen-link', { id: E, dev: 'HLTEST0002' }); T('(setup) hemen-link E for HLTEST0002', r.json.ok);
  NOW += 60000; await hook({ hemen: '1', offer: E, dev: 'HLTEST0001' }, { id: 9701, qty: 2, name: 'Mert' });
  r = await px.call('GET', '/admin/links-open', null, KEYH);
  T('hemen-link with its order → ok; the other → wait (2 h not over), qty 1, total 1280', r.json.links.find(l => l.dev === 'HLTEST0001').state === 'ok' && r.json.links.find(l => l.dev === 'HLTEST0002').state === 'wait' && r.json.links.find(l => l.dev === 'HLTEST0002').total === 1280 && r.json.links.find(l => l.dev === 'HLTEST0002').qty === 1);
  NOW += 3 * 3600000; r = await px.call('GET', '/admin/links-open', null, KEYH); T('3 h later the unordered Hemen-Al link is missing', r.json.links.find(l => l.dev === 'HLTEST0002').state === 'missing');
  NOW += 22 * 3600000; r = await px.call('GET', '/admin/links-open', null, KEYH); const rec2 = r.json.links.find(l => l.kind === 'done' && l.dev === 'RECREO0001');
  T('25 h later without an order the done-link turns missing; n_missing counts it; missing rows come first', rec2.state === 'missing' && r.json.n_missing >= 2 && r.json.links[0].state === 'missing');
  // dismiss / undo
  r = await px.call('POST', '/admin/link-dismiss', { code: rec2.code }, KEYH); T('link-dismiss → x', r.json.ok && !!r.json.x);
  r = await px.call('GET', '/admin/links-open', null, KEYH); T('dismissed link reads state x and sorts last', r.json.links.find(l => l.code === rec2.code).state === 'x' && r.json.links[r.json.links.length - 1].code === rec2.code);
  r = await px.call('POST', '/admin/link-dismiss', { code: rec2.code, undo: true }, KEYH); r = await px.call('GET', '/admin/links-open', null, KEYH); T('undo → missing again', r.json.links.find(l => l.code === rec2.code).state === 'missing');
  r = await px.call('POST', '/admin/link-dismiss', { code: 'NOPE' }, KEYH); T('dismiss unknown code → 404', r.status === 404);
  // order-mark guards
  r = await px.call('POST', '/admin/order-mark', { kind: 'done', offer: D, order_id: '19090156192048', email: 'recreo1@example.com' }); T('order-mark needs the admin key', r.status === 401);
  r = await px.call('POST', '/admin/order-mark', { kind: 'refund', offer: D, order_id: '1' }, KEYH); T('order-mark: unknown kind → 400', r.status === 400);
  r = await px.call('POST', '/admin/order-mark', { kind: 'done', offer: D, order_id: 'abc', email: 'recreo1@example.com' }, KEYH); T('order-mark: order_id must be digits', r.status === 400 && /order_id/.test(r.json.error));
  r = await px.call('POST', '/admin/order-mark', { kind: 'done', offer: D, order_id: '19090156192048', email: 'nobody@example.com' }, KEYH); T('order-mark done: unknown e-mail, no dev → 404', r.status === 404);
  r = await px.call('POST', '/admin/order-mark', { kind: 'done', offer: '10000000-0000-4000-8000-0000000000ff', order_id: '19090156192048', dev: 'RECREO0001' }, KEYH); T('order-mark done on an unlocked coffee → 409 notlocked', r.status === 409 && r.json.reason === 'notlocked');
  r = await px.call('POST', '/admin/order-mark', { kind: 'done', offer: D, order_id: '19090156192048', dev: 'NOBODY0001' }, KEYH); T('order-mark done for a device without a locked kapora → 409 nomatch', r.status === 409 && r.json.reason === 'nomatch');
  // the Burçin case: Shopify order made by hand (id from the URL) → proxy marks her converted row(s) done exactly like the webhook
  const before = px.DB.grupal_offer_votes.filter(v => v.offer_id === D && v.dev.startsWith('RECREO0001') && v.done_order).length;
  r = await px.call('POST', '/admin/order-mark', { kind: 'done', offer: D, order_id: '19090156192048', email: 'recreo1@example.com' }, KEYH);
  T('order-mark done → ok (done), dev resolved from the member record', r.json.ok === true && r.json.result === 'ok (done)' && r.json.dev === 'RECREO0001' && before === 0);
  T('her kapora row carries done_order = the Shopify order id', px.DB.grupal_offer_votes.filter(v => v.offer_id === D && v.dev.startsWith('RECREO0001')).every(v => String(v.done_order) === '19090156192048'));
  r = await px.call('POST', '/done-link', { id: D, dev: 'RECREO0001' }); T('after the mark the page would say none (nothing left to complete)', r.json.ok === false && r.json.reason === 'none');
  r = await px.call('POST', '/admin/order-mark', { kind: 'done', offer: D, order_id: '19090156192049', email: 'recreo1@example.com' }, KEYH); T('marking again → 409 already (rows are not overwritten)', r.status === 409 && r.json.reason === 'already' && /19090156192048/.test(r.json.error));
  r = await px.call('GET', '/admin/links-open', null, KEYH); T('links-open: her done-link now reads ok', r.json.links.find(l => l.code === rec2.code).state === 'ok');
  // Hemen-Al by hand: non-member buyer → ORD<id> device, H row, buyer first name stored, duplicate refused
  r = await px.call('POST', '/admin/order-mark', { kind: 'hemen', offer: A2, order_id: '777001', email: 'new.buyer@example.com', name: 'Zeynep Ak' }, KEYH);
  const hrow = px.DB.grupal_offer_votes.find(v => v.offer_id === A2 && v.dev === 'ORD777001H1');
  T('order-mark hemen → ok (hemen), H row with order_id, counted', r.json.ok === true && /^ok \(hemen/.test(r.json.result) && hrow && hrow.paid && hrow.order_id === '777001' && hrow.done_order === '777001');
  T('Hemen-Al buyer name stored for the walk (hn_)', px.DB.grupal_settings.some(s => s.key === 'hn_ORD777001H1' && s.value === 'Zeynep'));
  r = await px.call('POST', '/admin/order-mark', { kind: 'hemen', offer: A2, order_id: '777001', email: 'new.buyer@example.com' }, KEYH); T('same order again → ok:false reason dup', r.json.ok === false && r.json.reason === 'dup');
  // kapora by hand: row + member record + invitations exactly as the webhook would
  r = await px.call('POST', '/admin/order-mark', { kind: 'kapora', offer: A2, order_id: '777002', email: 'kap.buyer@example.com', name: 'Ali Veli', qty: 2 }, KEYH);
  const krow = px.DB.grupal_offer_votes.find(v => v.offer_id === A2 && v.dev === 'ORD777002');
  T('order-mark kapora → ok (kapora…), row qty 2 with e-mail, member record created with the name', r.json.ok === true && /^ok \(kapora/.test(r.json.result) && krow && krow.paid && krow.qty === 2 && krow.email === 'kap.buyer@example.com' && px.DB.grupal_settings.some(s => s.key === 'mem_kap.buyer@example.com' && JSON.parse(s.value).name === 'Ali Veli'));
  r = await px.call('GET', '/meydan'); T('/meydan is unaffected in shape (no e-mails, people names only)', !JSON.stringify(r.json).includes('@') && r.json.v === '3.71');
  // v3.56: the locked coffee carries the lot's people (converted kaporas) in lock.people; the run's people stay separate
  { const od = r.json.offers.find(o => o.id === D); T('locked El Recreo: lock.people = the lot (RECREO0001 ×2, completed rows included), people (next lot) empty, dep 0', !!od.lock && Array.isArray(od.lock.people) && od.lock.people.length === 1 && od.lock.people[0].q === 2 && typeof od.lock.people[0].k === 'string' && od.lock.people[0].k.length > 0 && Array.isArray(od.people) && od.people.length === 0 && od.dep === 0);
    const oa = r.json.offers.find(o => o.id === A2); T('coffee A (locked earlier in this run): lock.people = that lot (Ayşe ×3 first), people = the next lot (hand-marked kapora Ali ×2 + Hemen-Al buyer Zeynep)', !!oa.lock && oa.lock.people[0].n === 'Ayşe' && oa.lock.people[0].q === 3 && oa.people.some(p => p.n === 'Zeynep' && p.h === true) && oa.people.some(p => p.n === 'Ali' && p.q === 2) && !oa.people.some(p => p.q === 3)); }
  // v3.57: the live table has no `early` column → the old select chain dropped done_order AND email → names null, completed kaporas invisible.
  // With the real column list enforced, /meydan must still carry names (member found by e-mail, or by device when the row has no e-mail) and done_order.
  px.DB.__cols = { grupal_offer_votes: ['offer_id', 'dev', 'seated', 'paid', 'qty', 'created_at', 'done_order', 'email', 'order_id'] };
  px.DB.grupal_offer_votes.push({ offer_id: A2, dev: 'OLDJURY001', seated: false, paid: true, qty: 2, order_id: 601, created_at: '2026-10-05T10:00:00.000Z' });   // no e-mail on the row (old webhook) — member known by device (Deniz Kaçak)
  r = await px.call('GET', '/meydan'); { const oa = r.json.offers.find(o => o.id === A2);
    T('no early column: people still named — member matched by device when the row carries no e-mail (Deniz ×2 in the next lot)', oa.people.some(p => p.n === 'Deniz' && p.q === 2) && oa.people.every(p => p.n !== null));
    T('no early column: lock.people of the earlier lot still named', oa.lock && oa.lock.people.length > 0 && oa.lock.people.every(p => typeof p.n === 'string' && p.n.length > 0));
    const od = r.json.offers.find(o => o.id === D); T('no early column: her completed row stays completed (done-link says none, lock.people lists her once)', od.lock.people.length === 1); }
  r = await px.call('POST', '/done-link', { id: D, dev: 'RECREO0001' }); T('no early column: /done-link still sees done_order → none', r.json.ok === false && r.json.reason === 'none');
  { const mine = await px.call('GET', '/offer-mine?dev=OLDJURY001'); const k = mine.json.me && mine.json.me.k; r = await px.call('GET', '/meydan'); const oa = r.json.offers.find(o => o.id === A2);
    T('the figure key equals /offer-mine me.k for the member (page marks "sen")', !!k && oa.people.some(p => p.n === 'Deniz' && p.k === k)); }
  delete px.DB.__cols;
  Date.now = realNow; }
// ---- v3.58: Hemen-Al basket — several coffees in one cart, one code, one order counted per coffee
{ Date.now = () => NOW; const KEYH = { 'x-cc-key': 'adminkey' };
  const E1 = '10000000-0000-4000-8000-00000000e001', E2 = '10000000-0000-4000-8000-00000000e002';
  px.DB.grupal_offers.push({ id: E1, name: 'Kibo Peak', origin: 'Tanzanya', process: 'washed', active: true, sort: 20, pub: { name: 'Kibo Peak', origin: 'Tanzanya', process: 'washed' }, meta: { list_tl: 1600, img_url: 'https://db.test/e1.jpg', hemen_url: 'https://coffeenutz.net/cart/501:1', green_boxes: 9 }, created_at: '2026-09-01T00:00:00Z' },
    { id: E2, name: 'Guji Natural', origin: 'Etiyopya', process: 'natural', active: true, sort: 21, pub: { name: 'Guji Natural', origin: 'Etiyopya', process: 'natural' }, meta: { list_tl: 1600, img_url: 'https://db.test/e2.jpg', hemen_url: 'https://coffeenutz.net/cart/502:1', green_boxes: 9 }, created_at: '2026-09-01T00:00:00Z' });
  const nD = () => (px.DB.__discounts || []).length;
  r = await px.call('POST', '/hemen-link', { dev: 'BASKET0001', items: [{ id: E1, qty: 2 }, { id: E2, qty: 1 }] });
  T('multi hemen-link: ok, one cart link with both variants, attributes[offers]=E1:2,E2:1, hemen=1, dev', r.json.ok && /^https:\/\/coffeenutz\.net\/cart\/501:2,502:1\?discount=HA[A-Z0-9]{6}&attributes\[offers\]=/.test(r.json.url) && decodeURIComponent(r.json.url).includes('attributes[offers]=' + E1 + ':2,' + E2 + ':1') && r.json.url.includes('attributes[hemen]=1') && r.json.url.includes('attributes[dev]=BASKET0001'));
  T('multi hemen-link: items echoed (qty, via pool, price 1280, off 320 each), total 3 × 1280, off 960', r.json.items.length === 2 && r.json.items[0].qty === 2 && r.json.items[1].qty === 1 && r.json.items.every(i => i.via === 'pool' && i.price === 1280 && i.off === 320) && r.json.total === 3840 && r.json.off === 960);
  { const d = px.DB.__discounts[nD() - 1]; T('one Shopify code for both products, fixed total 960.00 on the order, 2 h, single use', d.customerGets.items.products.productsToAdd.length === 2 && d.customerGets.value.discountAmount.amount === '960.00' && d.customerGets.value.discountAmount.appliesOnEachItem === false && d.usageLimit === 1 && /Hemen-Al · 2 kahve/.test(d.title)); }
  const codeM = r.json.code;
  T('hl_ record lists both items and the total', (() => { const h = JSON.parse(px.DB.grupal_settings.find(x => x.key === 'hl_' + codeM).value); return h.items.length === 2 && h.qty === 3 && h.total === 3840; })());
  r = await px.call('POST', '/hemen-link', { dev: 'BASKET0001', items: [{ id: E1, qty: 1 }, { id: '10000000-0000-4000-8000-0000000000ff', qty: 1 }] }); T('multi: a coffee without a lane fails the whole link with its id', r.json.ok === false && r.json.reason === 'nolane' && r.json.id === '10000000-0000-4000-8000-0000000000ff');
  { const m0 = await px.call('GET', '/meydan'); const leftE1 = m0.json.offers.find(o => o.id === E1).hemen.left; r = await px.call('POST', '/hemen-link', { dev: 'BASKET0001', items: [{ id: E1, qty: 9 }, { id: E1, qty: 1 }] }); T('multi: duplicates collapse, qty capped at the seats left', r.json.ok && r.json.items.length === 1 && r.json.items[0].qty === leftE1 && leftE1 < 9); }
  // the order arrives with both coffees → one H row per coffee, both counted, one response
  r = await hook({ hemen: '1', offers: E1 + ':2,' + E2 + ':1', dev: 'BASKET0001' }, { id: 9801, qty: 3, name: 'Mert Kaya', email: 'mert@example.com' });
  T('webhook hemen with offers list → "ok (hemen ×2)"', r.text === 'ok (hemen ×2)');
  const r1 = px.DB.grupal_offer_votes.find(v => v.offer_id === E1 && v.dev === 'BASKET0001H1'), r2 = px.DB.grupal_offer_votes.find(v => v.offer_id === E2 && v.dev === 'BASKET0001H1');
  T('H rows: Kibo ×2 and Guji ×1, both paid with the order id, buyer name stored for the walk', r1 && r1.qty === 2 && r1.order_id === '9801' && r2 && r2.qty === 1 && r2.order_id === '9801' && px.DB.grupal_settings.some(x => x.key === 'hn_BASKET0001H1' && x.value === 'Mert'));
  r = await hook({ hemen: '1', offers: E1 + ':2,' + E2 + ':1', dev: 'BASKET0001' }, { id: 9801, qty: 3 }); T('same order again → already counted', r.text === 'ok (already counted)');
  r = await px.call('GET', '/meydan'); { const e1 = r.json.offers.find(o => o.id === E1), e2 = r.json.offers.find(o => o.id === E2); T('/meydan: both coffees count the packages (dep 2 and 1), pool sold 2 / 1', e1.dep === 2 && e2.dep === 1 && e1.hemen.sold === 2 && e2.hemen.sold === 1); }
  // invitation inside a basket: one coffee via invitation (qty forced to 1), the other from the pool; attributes[inv] carries the code
  await hook({ offer: E2, dev: 'HOST000001' }, { id: 9802, name: 'Ece', email: 'ece@example.com' });
  const invE2 = px.DB.grupal_settings.filter(x => x.key.startsWith('inv_')).map(x => [x.key.slice(4), JSON.parse(x.value)]).find(([c, j]) => j.o === E2 && j.st === 'p')[0];
  r = await px.call('POST', '/hemen-link', { dev: 'GUEST00001', items: [{ id: E2, qty: 3, inv: invE2 }, { id: E1, qty: 1 }] });
  T('basket with an invitation: that coffee is 1 package via inv, the other from the pool; link carries attributes[inv]', r.json.ok && r.json.items[0].via === 'inv' && r.json.items[0].qty === 1 && r.json.items[1].via === 'pool' && r.json.url.includes('attributes[inv]=' + invE2));
  r = await hook({ hemen: '1', offers: E2 + ':1,' + E1 + ':1', dev: 'GUEST00001', inv: invE2 }, { id: 9803, qty: 2, name: 'Deniz Ak' });
  T('webhook: I row for the invited coffee, H row for the pool coffee, invitation used', r.text === 'ok (hemen ×2 · davetiye)' && !!px.DB.grupal_offer_votes.find(v => v.offer_id === E2 && v.dev === 'GUEST00001I1') && !!px.DB.grupal_offer_votes.find(v => v.offer_id === E1 && v.dev === 'GUEST00001H1') && JSON.parse(px.DB.grupal_settings.find(x => x.key === 'inv_' + invE2).value).st === 'u');
  r = await px.call('GET', '/admin/links-open', null, KEYH); T('admin links-open: the basket link shows 3 packages, total 3.840, matched', (() => { const l = r.json.links.find(x => x.code === codeM); return l && l.qty === 3 && l.total === 3840 && l.state === 'ok'; })());
  Date.now = realNow; }
// ---- v3.59: "seçilmezse kaydır" — flag on the order, close-time move to the most popular coffee (join the race → lock in the closed session; join a selected lot → converted)
{ Date.now = () => NOW; const KEYH = { 'x-cc-key': 'adminkey' };
  const R2 = '10000000-0000-4000-8000-00000000f002', R3 = '10000000-0000-4000-8000-00000000f003';
  px.DB.grupal_offers.push({ id: R2, name: 'Roll Two', origin: 'Peru', process: 'washed', active: true, sort: 30, pub: { name: 'Roll Two', origin: 'Peru', process: 'washed' }, meta: { list_tl: 1600 }, created_at: '2026-09-01T00:00:00Z' },
    { id: R3, name: 'Roll Three', origin: 'Kenya', process: 'washed', active: true, sort: 31, pub: { name: 'Roll Three', origin: 'Kenya', process: 'washed' }, meta: { list_tl: 1600 }, created_at: '2026-09-01T00:00:00Z' });
  const rk = (id, dev) => px.DB.grupal_settings.find(x => x.key === 'roll_' + id + '_' + dev);
  // 38 deposits on R3 (most popular, unlocked), 2 roll-flagged deposits on R2
  for (let i = 1; i <= 38; i++) await hook({ offer: R3, dev: 'RZ' + String(i).padStart(8, '0') }, { id: 97000 + i, name: 'Z' + i });
  r = await hook({ offers: R2 + ':1', dev: 'RX00000001', roll: '1', terms: '1' }, { id: 97101, name: 'Rol Bir', email: 'rol1@example.com' });
  T('kapora with attributes[roll]=1 → roll_ key for the row', r.text.startsWith('ok (kapora') && !!rk(R2, 'RX00000001') && JSON.parse(rk(R2, 'RX00000001').value).oid === '97101');
  await hook({ offers: R2 + ':1', dev: 'RX00000004', roll: '1' }, { id: 97104, name: 'Rol Dört' });
  await hook({ offers: R2 + ':1', dev: 'RX00000007' }, { id: 97107, name: 'Rol Yedi' });   // no flag → stays
  r = await px.call('GET', '/offer-mine?dev=RX00000001'); T('/offer-mine marks the flagged vote roll:true', r.json.votes.find(v => v.id === R2).roll === true && Array.isArray(r.json.moved) && r.json.moved.length === 0);
  r = await px.call('POST', '/offer-roll', { dev: 'RX00000004', id: R2, on: false }); T('/offer-roll off removes the key', r.json.ok && !rk(R2, 'RX00000004'));
  r = await px.call('POST', '/offer-roll', { dev: 'RX00000004', id: R2, on: true }); T('/offer-roll on puts it back', r.json.ok && !!rk(R2, 'RX00000004'));
  r = await px.call('POST', '/offer-roll', { dev: 'RX00000007', id: R3, on: true }); T('/offer-roll without a deposit on that coffee → 404', r.status === 404);
  r = await px.call('GET', '/admin/offers', null, KEYH); T('admin row carries roll count (2 on Roll Two)', r.json.find(o => o.id === R2).roll === 2);
  r = await px.call('GET', '/meydan'); { const top = r.json.offers.slice().sort((a, b) => (b.dep + (b.conv || 0)) - (a.dep + (a.conv || 0)))[0]; T('before close: Roll Three (38) is the most popular and not locked', top.id === R3 && !r.json.offers.find(o => o.id === R3).lock); }
  // close: the two flagged votes move to Roll Three one second before close → 40 → lock in this close
  // (closes 0 and 1 were already recorded by earlier admin tests → use close 2, Sun 2026-10-11 20:59Z)
  const C1 = Date.UTC(2026, 9, 11, 20, 59, 0); Date.now = () => Date.UTC(2026, 9, 12, 9, 0, 0);
  r = await px.call('GET', '/meydan');
  const mv1 = px.DB.grupal_offer_votes.find(v => v.offer_id === R3 && v.dev === 'RX00000001'), mv4 = px.DB.grupal_offer_votes.find(v => v.offer_id === R3 && v.dev === 'RX00000004');
  T('both flagged votes moved to Roll Three with created_at = close − 1 s; source rows gone; unflagged vote stayed', mv1 && mv4 && new Date(mv1.created_at).getTime() === C1 - 1000 && !px.DB.grupal_offer_votes.find(v => v.offer_id === R2 && v.dev === 'RX00000001') && !!px.DB.grupal_offer_votes.find(v => v.offer_id === R2 && v.dev === 'RX00000007'));
  { const lk = px.DB.grupal_settings.find(x => x.key === 'lock_' + R3); const lj = lk && JSON.parse(lk.value); T('Roll Three locked by the consolidation: 40 packages, lock time = close − 1 s', !!lj && lj.dep === 40 && new Date(lj.at).getTime() === C1 - 1000); }
  T('roll keys consumed', !rk(R2, 'RX00000001') && !rk(R2, 'RX00000004'));
  r = await px.call('GET', '/offer-mine?dev=RX00000001'); T('/offer-mine: vote now on Roll Three, converted (Tamamla), moved[] says from Roll Two to Roll Three, race (lot:false)', r.json.votes.length === 1 && r.json.votes[0].id === R3 && r.json.votes[0].conv === true && r.json.moved.length === 1 && r.json.moved[0].from === R2 && r.json.moved[0].to === R3 && r.json.moved[0].fn === 'Roll Two' && r.json.moved[0].tn === 'Roll Three' && r.json.moved[0].lot === false);
  r = await px.call('GET', '/meydan'); T('/meydan: Roll Two keeps 1 deposit, Roll Three is selected with 40', r.json.offers.find(o => o.id === R2).dep === 1 && r.json.offers.find(o => o.id === R3).conv === 40 && !!r.json.offers.find(o => o.id === R3).lock);
  // session 2: a new flagged deposit on Roll Two; Roll Three (selected, lot in this/later session) is the most popular → the vote joins the lot
  await hook({ offers: R2 + ':2', dev: 'RX00000005', roll: '1' }, { id: 97205, qty: 2, name: 'Rol Beş', email: 'rol5@example.com' });
  await hook({ offers: R2 + ':1', dev: 'RZ00000003', roll: '1' }, { id: 97203, name: 'Z3' });   // already in Roll Three's lot → must not be touched
  const C2 = Date.UTC(2026, 9, 18, 20, 59, 0); Date.now = () => Date.UTC(2026, 9, 19, 9, 0, 0);
  r = await px.call('GET', '/meydan');
  { const m5 = px.DB.grupal_offer_votes.find(v => v.offer_id === R3 && v.dev === 'RX00000005'); const lj = JSON.parse(px.DB.grupal_settings.find(x => x.key === 'lock_' + R3).value);
    T('close 2: the flagged ×2 vote joined Roll Three\'s lot (created_at = lock time, converted), lot 40 → 42', m5 && m5.qty === 2 && new Date(m5.created_at).getTime() === C1 - 1000 && lj.dep === 42);
    const z3 = px.DB.grupal_offer_votes.find(v => v.offer_id === R2 && v.dev === 'RZ00000003'); T('a voter already in the lot keeps the Roll Two vote and the flag', !!z3 && !!rk(R2, 'RZ00000003')); }
  r = await px.call('GET', '/offer-mine?dev=RX00000005'); T('/offer-mine for the lot-joiner: converted on Roll Three, moved[] lot:true', r.json.votes.find(v => v.id === R3).conv === true && r.json.moved[0].lot === true && r.json.moved[0].q === 2);
  Date.now = () => NOW; }
// ---- v3.60: "jüri açar" — the Hemen-Al quota opens only on a coffee with jury votes (offer_hemen_open, default 1); tickets and table seats ignore it; meta.hemen_open overrides
{ Date.now = () => NOW; const KEYH = { 'x-cc-key': 'adminkey' };
  const G1 = '10000000-0000-4000-8000-00000000a001', G2 = '10000000-0000-4000-8000-00000000a002';
  px.DB.grupal_offers.push({ id: G1, name: 'Gate One', origin: 'Peru', process: 'washed', active: true, sort: 40, pub: { name: 'Gate One', origin: 'Peru', process: 'washed' }, meta: { list_tl: 1600, img_url: 'https://db.test/g1.jpg', hemen_url: 'https://coffeenutz.net/cart/601:1' }, created_at: '2026-09-01T00:00:00Z' },
    { id: G2, name: 'Gate Two', origin: 'Peru', process: 'washed', active: true, sort: 41, pub: { name: 'Gate Two', origin: 'Peru', process: 'washed' }, meta: { list_tl: 1600, img_url: 'https://db.test/g2.jpg', hemen_url: 'https://coffeenutz.net/cart/602:1', hemen_open: true }, created_at: '2026-09-01T00:00:00Z' });
  px.DB.grupal_settings.find(x => x.key === 'offer_hemen_open').value = '1';
  r = await px.call('GET', '/meydan'); let g1 = r.json.offers.find(o => o.id === G1), g2 = r.json.offers.find(o => o.id === G2);
  T('no votes → lane exists but quota closed: base 0, left 0, gate jury, need 1; cfg carries hemen_open 1', g1.hemen && g1.hemen.base === 0 && g1.hemen.left === 0 && g1.hemen.gate === 'jury' && g1.hemen.need === 1 && r.json.offer_cfg.hemen_open === 1);
  const BASE = parseInt(px.DB.grupal_settings.find(x => x.key === 'offer_hemen_base').value);   // an earlier block set it to 3
  T('meta.hemen_open → open without votes (admin override)', g2.hemen && g2.hemen.base === BASE && g2.hemen.left === BASE && !g2.hemen.gate);
  r = await px.call('POST', '/hemen-link', { dev: 'GATEDEV001', items: [{ id: G1, qty: 1 }] }); T('pool link on a gated coffee → full', r.json.ok === false && r.json.reason === 'full');
  // the first kapora opens the door and mints tickets; a ticket works even while the door is shut
  r = await hook({ offer: G1, dev: 'GATEHOST01' }, { id: 98001, name: 'Gate Host', email: 'gatehost@example.com' }); T('v3.65: the kapora that opens the door mints 10 (no opener bonus any more), reply still says kapı açıldı', r.text === 'ok (kapora · davetiye ×10 · kapı açıldı)' && px.DB.grupal_settings.filter(x => x.key.startsWith('inv_') && JSON.parse(x.value).o === G1).length === 10 && !px.DB.grupal_settings.some(x => x.key.startsWith('inv_') && JSON.parse(x.value).ob === true));
  r = await hook({ offer: G1, dev: 'GATEHOST02' }, { id: 98002, name: 'Second', email: 'second@example.com' }); T('the second kapora on an open door mints 10 as well', r.text === 'ok (kapora · davetiye ×10)');
  r = await px.call('GET', '/meydan'); g1 = r.json.offers.find(o => o.id === G1);
  T('one vote → quota open: base = setting, left = setting, no gate', g1.hemen.base === BASE && g1.hemen.left === BASE && !g1.hemen.gate);
  px.DB.grupal_settings.find(x => x.key === 'offer_hemen_open').value = '3';
  r = await px.call('GET', '/meydan'); g1 = r.json.offers.find(o => o.id === G1);
  T('threshold 3 → shut again with need 1 (two kaporas so far)', g1.hemen.gate === 'jury' && g1.hemen.need === 1 && g1.hemen.left === 0);
  const invG = px.DB.grupal_settings.filter(x => x.key.startsWith('inv_')).map(x => [x.key.slice(4), JSON.parse(x.value)]).find(([c, j]) => j.o === G1 && j.st === 'p')[0];
  r = await px.call('POST', '/hemen-link', { dev: 'GATEGUEST1', items: [{ id: G1, qty: 1, inv: invG }] }); T('a ticket opens the shut door (via inv)', r.json.ok === true && r.json.items[0].via === 'inv');
  px.DB.grupal_settings.find(x => x.key === 'offer_hemen_open').value = '0';
  r = await px.call('GET', '/meydan'); g1 = r.json.offers.find(o => o.id === G1); T('setting 0 → old behaviour, always open', !g1.hemen.gate && g1.hemen.left === BASE);
  Date.now = () => NOW; }
// ---- v3.62: silent ask — a device leaves "Hemen-Al istiyorum" on a shut door; the count never reaches the page; admin grants private tickets
{ Date.now = () => NOW; const KEYH = { 'x-cc-key': 'adminkey' };
  const G3 = '10000000-0000-4000-8000-00000000a003';
  px.DB.grupal_offers.push({ id: G3, name: 'Gate Three', origin: 'Peru', process: 'natural', active: true, sort: 42, pub: { name: 'Gate Three', origin: 'Peru', process: 'natural' }, meta: { list_tl: 1600, img_url: 'https://db.test/g3.jpg', hemen_url: 'https://coffeenutz.net/cart/603:1' }, created_at: '2026-09-01T00:00:00Z' });
  px.DB.grupal_settings.find(x => x.key === 'offer_hemen_open').value = '1';
  r = await px.call('POST', '/offer-ask', { dev: 'ASKDEV0001', id: G3 }); T('ask on a shut door → ok, hask_ row written', r.json.ok === true && r.json.asked === true && px.DB.grupal_settings.some(x => x.key === 'hask_' + G3 + '_ASKDEV0001'));
  r = await px.call('POST', '/offer-ask', { dev: 'ASKDEV0001', id: G3 }); T('asking twice is one row (dup)', r.json.ok === true && r.json.dup === true && px.DB.grupal_settings.filter(x => x.key.startsWith('hask_' + G3 + '_')).length === 1);
  r = await px.call('POST', '/offer-ask', { dev: 'ASKDEV0002', id: G3 }); r = await px.call('POST', '/offer-ask', { dev: 'GATEHOST02', id: G3 });
  r = await px.call('POST', '/offer-ask', { dev: 'ASKDEV0009', id: '10000000-0000-4000-8000-00000000a002' }); T('ask on an open door is refused (reason open)', r.json.ok === false && r.json.reason === 'open');
  r = await px.call('GET', '/meydan'); let g3 = r.json.offers.find(o => o.id === G3); T('/meydan carries no ask count and no hask keys', !('ask' in g3) && !JSON.stringify(r.json).includes('hask_') && !JSON.stringify(r.json).includes('ASKDEV'));
  r = await px.call('GET', '/offer-mine?dev=ASKDEV0001'); T('/offer-mine asked[] lists only my own asks', Array.isArray(r.json.asked) && r.json.asked.length === 1 && r.json.asked[0] === G3);
  r = await px.call('GET', '/offer-mine?dev=ASKDEV0009'); T('another device sees no asks', Array.isArray(r.json.asked) && r.json.asked.length === 0);
  r = await px.call('GET', '/admin/offers', null, KEYH); g3 = r.json.find(o => o.id === G3); T('admin row carries ask = 3', g3.ask === 3);
  r = await px.call('POST', '/admin/settings', { offer_hemen_ask_inv: '2' }, KEYH); T('v3.65: offer_hemen_ask_inv is ignored — 1 per ask, fixed', r.json.ok === true && r.json.cfg.hemen_ask_inv === 1);
  r = await px.call('POST', '/admin/ask-grant', { id: G3 }, KEYH);
  T('grant → 1 ticket per asking device, GATEHOST02 (has a kapora elsewhere, none here) included: 3 devices, 3 tickets, asks cleared', r.json.ok === true && r.json.devs === 3 && r.json.minted === 3 && r.json.per === 1 && px.DB.grupal_settings.filter(x => x.key.startsWith('hask_' + G3 + '_')).length === 0);
  const tk = px.DB.grupal_settings.filter(x => x.key.startsWith('inv_')).map(x => JSON.parse(x.value)).filter(j => j.o === G3);
  T('tickets are private (p), ask:true, 7 days, no order id', tk.length === 3 && tk.every(j => j.st === 'p' && j.ask === true && j.oid === null && new Date(j.exp).getTime() - NOW === 7 * 86400000));
  r = await px.call('GET', '/offer-mine?dev=ASKDEV0001'); T('the asker now holds 1 private ticket for the coffee and the ask is gone', r.json.inv.filter(i => i.id === G3 && i.st === 'p').length === 1 && r.json.asked.length === 0);
  const code = r.json.inv.find(i => i.id === G3).c;
  r = await px.call('POST', '/hemen-link', { dev: 'ASKDEV0001', items: [{ id: G3, qty: 1, inv: code }] }); T('the granted ticket opens the shut door', r.json.ok === true && r.json.items[0].via === 'inv');
  r = await px.call('POST', '/offer-ask', { dev: 'ASKDEV0001', id: G3 }); r = await px.call('POST', '/admin/ask-grant', { id: G3 }, KEYH); T('a device that already holds tickets is skipped on a second grant', r.json.ok === true && r.json.devs === 0 && r.json.skipped === 1);
  r = await px.call('POST', '/admin/ask-grant', { id: G3 }, KEYH); T('nothing to grant → 0/0', r.json.ok === true && r.json.devs === 0 && r.json.minted === 0);
  px.DB.grupal_settings.find(x => x.key === 'offer_hemen_open').value = '0';
  Date.now = () => NOW; }
// ---- v3.63: tickets only — quota default 0; up to 20 tickets per kapora; priv / table_n; paged reads past the 1000-row cap; Shopify throttle retry
{ Date.now = () => NOW; const KEYH = { 'x-cc-key': 'adminkey' };
  const G4 = '10000000-0000-4000-8000-00000000a004';
  px.DB.grupal_offers.push({ id: G4, name: 'Gate Four', origin: 'Kenya', process: 'washed', active: true, sort: 43, pub: { name: 'Gate Four', origin: 'Kenya', process: 'washed' }, meta: { list_tl: 1600, img_url: 'https://db.test/g4.jpg', hemen_url: 'https://coffeenutz.net/cart/604:1' }, created_at: '2026-09-01T00:00:00Z' });
  px.DB.grupal_settings.find(x => x.key === 'offer_hemen_open').value = '1';
  r = await px.call('POST', '/admin/settings', { offer_hemen_inv: '10', offer_hemen_base: '' }, KEYH); T('Ayarlar: kapora başına bilet 10 accepted (cap 20), blank quota = 0', r.json.ok === true && r.json.cfg.hemen_inv === 10 && r.json.cfg.hemen_base === 0);
  r = await px.call('POST', '/admin/settings', { offer_hemen_inv: '99' }, KEYH); T('offer_hemen_inv is capped at 20', r.json.cfg.hemen_inv === 20);
  r = await px.call('POST', '/admin/settings', { offer_hemen_inv: '10' }, KEYH);
  r = await hook({ offer: G4, dev: 'TKONLY0001' }, { id: 98101, name: 'Ten Tickets', email: 'ten@example.com' }); T('one kapora → 10 tickets (old cap was 6)', r.text === 'ok (kapora · davetiye ×10 · kapı açıldı)');
  r = await px.call('GET', '/meydan'); let g4 = r.json.offers.find(o => o.id === G4);
  T('tickets only: base 0, left 0, no gate (door open by the vote), priv 10, table_n 0', g4.hemen.base === 0 && g4.hemen.left === 0 && !g4.hemen.gate && g4.hemen.priv === 10 && g4.hemen.table_n === 0 && g4.hemen.table.length === 0);
  r = await px.call('POST', '/hemen-link', { dev: 'WALKIN0001', items: [{ id: G4, qty: 1 }] }); T('a walk-in without a ticket cannot buy (full)', r.json.ok === false && r.json.reason === 'full');
  NOW += 25 * 3600000; r = await px.call('GET', '/meydan'); g4 = r.json.offers.find(o => o.id === G4);
  T('25 h later: all 10 on the table — table_n 10, priv 0', g4.hemen.table_n === 10 && g4.hemen.table.length === 10 && g4.hemen.priv === 0);
  // paging: 1300 table tickets on G4 → the proxy must read every settings row (PostgREST stops at 1000 per request)
  for (let i = 0; i < 1300; i++) px.DB.grupal_settings.push({ key: 'inv_PG' + String(i).padStart(6, '0'), value: JSON.stringify({ o: G4, dev: 'PGDEV' + String(i).padStart(5, '0'), n: 'P' + i, at: new Date(NOW - 2 * 3600000).toISOString(), exp: new Date(NOW + 5 * 86400000).toISOString(), st: 't', tat: new Date(NOW - 3600000).toISOString() }) });
  T('fixture: settings table is over the 1000-row cap', px.DB.grupal_settings.length > 1000);
  r = await px.call('GET', '/meydan'); g4 = r.json.offers.find(o => o.id === G4);
  T('/meydan sees all 1310 table tickets (paged getSettings), list still 12', g4.hemen.table_n === 1310 && g4.hemen.table.length === 12);
  for (let i = 0; i < 1100; i++) px.DB.grupal_offer_votes.push({ offer_id: G4, dev: 'PV' + String(i).padStart(8, '0') + 'H1', seated: false, paid: true, qty: 1, created_at: new Date(NOW - 60000).toISOString(), done_order: 'HEMEN' });
  r = await px.call('GET', '/meydan'); g4 = r.json.offers.find(o => o.id === G4);
  T('/meydan counts all 1100 Hemen-Al rows (paged votes)', g4.hemen.sold === 1100 && px.log.some(l => /grupal_offer_votes\?select=.*offset=1000/.test(l)));
  px.DB.grupal_settings = px.DB.grupal_settings.filter(x => !x.key.startsWith('inv_PG')); px.DB.grupal_offer_votes = px.DB.grupal_offer_votes.filter(v => !String(v.dev).startsWith('PV'));
  // Shopify throttle: the first two discount mutations are throttled, the third succeeds → the basket link still comes back
  const G2 = '10000000-0000-4000-8000-00000000a002'; r = await px.call('POST', '/admin/settings', { offer_hemen_base: '3' }, KEYH); px.DB.__throttle = 2; px.DB.__throttled = 0;   // a quota again, so the walk-in link path (discount mutation) runs
  r = await px.call('POST', '/hemen-link', { dev: 'THROTTLE01', items: [{ id: G2, qty: 1 }] }); T('THROTTLED twice → retried, link created', r.json.ok === true && px.DB.__throttled === 2 && /discount=/.test(r.json.url));
  NOW -= 25 * 3600000; Date.now = () => NOW; r = await px.call('POST', '/admin/settings', { offer_hemen_inv: '2', offer_hemen_base: '3' }, KEYH); px.DB.grupal_settings.find(x => x.key === 'offer_hemen_open').value = '0'; }
// ---- v3.64: ticket = Hemen-Al — one ticket is one package: a juror buys N packages with N of her own tickets; a stranger's table ticket stays 1; ask allowed whenever the table is empty
{ Date.now = () => NOW; const KEYH = { 'x-cc-key': 'adminkey' };
  const G4 = '10000000-0000-4000-8000-00000000a004'; px.DB.grupal_settings.find(x => x.key === 'offer_hemen_open').value = '1';
  r = await px.call('POST', '/admin/settings', { offer_hemen_base: '' }, KEYH);   // no quota (default)
  r = await px.call('GET', '/offer-mine?dev=TKONLY0001'); const mine = r.json.inv.filter(i => i.id === G4 && i.st === 'p'); T('fixture: the juror holds 10 private tickets on G4', mine.length === 10);
  r = await px.call('POST', '/hemen-link', { dev: 'TKONLY0001', items: [{ id: G4, qty: 3, inv: mine[0].c }] });
  T('own tickets: qty 3 with one code → 3 tickets taken, /cart/604:3, attributes[inv] carries 3 codes, via inv', r.json.ok === true && r.json.qty === 3 && /\/cart\/604:3\?/.test(r.json.url) && decodeURIComponent((/attributes\[inv\]=([^&]+)/.exec(r.json.url) || [])[1] || '').split(',').length === 3 && r.json.via === 'inv');
  const codes3 = decodeURIComponent((/attributes\[inv\]=([^&]+)/.exec(r.json.url) || [])[1]).split(',');
  r = await hook({ hemen: '1', offer: G4, dev: 'TKONLY0001', inv: codes3.join(',') }, { id: 98301, name: 'Ten', email: 'ten@example.com', qty: 3 });
  T('webhook: 3 packages → the 3 tickets are marked used', /^ok/.test(r.text) && codes3.every(c => JSON.parse(px.DB.grupal_settings.find(x => x.key === 'inv_' + c).value).st === 'u'));
  r = await px.call('GET', '/offer-mine?dev=TKONLY0001'); T('the juror has 7 private tickets left', r.json.inv.filter(i => i.id === G4 && i.st === 'p').length === 7);
  r = await px.call('POST', '/hemen-link', { dev: 'TKONLY0001', items: [{ id: G4, qty: 20, inv: r.json.inv.find(i => i.id === G4 && i.st === 'p').c }] }); T('qty above the tickets held is capped (7 left, asked 20 → capped by the request cap 6)', r.json.ok === true && r.json.qty === 6);
  // a stranger on the table: still one ticket per coffee per cycle
  NOW += 25 * 3600000; r = await px.call('GET', '/meydan'); let g4 = r.json.offers.find(o => o.id === G4); T('25 h later the 7 are on the table', g4.hemen.table_n === 7);
  r = await px.call('POST', '/hemen-link', { dev: 'STRANGER01', items: [{ id: G4, qty: 3, inv: g4.hemen.table[0].c }] }); T('a stranger asking 3 from the table gets 1 (kişi başı kural)', r.json.ok === true && r.json.qty === 1);
  r = await px.call('POST', '/offer-ask', { dev: 'STRANGER02', id: G4 }); T('ask refused while tickets sit on the table (reason open)', r.json.ok === false && r.json.reason === 'open');
  const G2 = '10000000-0000-4000-8000-00000000a002'; r = await px.call('GET', '/meydan'); const g2 = r.json.offers.find(o => o.id === G2);
  r = await px.call('POST', '/offer-ask', { dev: 'STRANGER03', id: G2 }); T('ask allowed on an open coffee whose table is empty (no gate condition any more)', g2.hemen.table_n === 0 && g2.hemen.left === 0 && r.json.ok === true);
  NOW -= 25 * 3600000; Date.now = () => NOW; px.DB.grupal_settings.find(x => x.key === 'offer_hemen_open').value = '0'; }
// ---- v3.65: top-up backfill {top:1} — this session's kaporas are completed to packages × 10 (counting every ticket ever minted for that device+coffee); older sessions untouched
{ Date.now = () => NOW; const KEYH = { 'x-cc-key': 'adminkey' }; const G4 = '10000000-0000-4000-8000-00000000a004'; r = await px.call('POST', '/admin/settings', { offer_hemen_inv: '10' }, KEYH);
  const mineK = px.DB.grupal_settings.filter(x => x.key.startsWith('inv_') && JSON.parse(x.value).o === G4 && JSON.parse(x.value).dev === 'TKONLY0001'); T('fixture: TKONLY0001 has 10 tickets on G4 (3 used)', mineK.length === 10);
  for (const k of mineK.slice(0, 4)) px.DB.grupal_settings = px.DB.grupal_settings.filter(x => x !== k);   // pretend 4 were never minted (2-per-kapora era)
  px.DB.grupal_offer_votes.push({ offer_id: G4, dev: 'OLDSESS001', seated: false, paid: true, qty: 1, created_at: '2026-09-20T10:00:00Z', email: 'meric.k@example.com' });   // previous session, no tickets
  px.DB.grupal_settings.push({ key: 'mem_meric.k@example.com', value: JSON.stringify({ email: 'meric.k@example.com', dev: 'OLDSESS001', name: 'Meriç Kaya', ok: true }) });
  r = await px.call('POST', '/admin/inv-backfill', { top: 1 }, KEYH);
  const oldTk = px.DB.grupal_settings.filter(x => x.key.startsWith('inv_') && JSON.parse(x.value).dev === 'OLDSESS001').map(x => JSON.parse(x.value));
  T('v3.66 top-up: TKONLY0001 back to 10; the previous-session kapora gets its 10 too, ticket name = member first name (Meriç), top flag echoed', r.json.ok === true && r.json.top === true && r.json.minted >= 14 && px.DB.grupal_settings.filter(x => x.key.startsWith('inv_') && JSON.parse(x.value).o === G4 && JSON.parse(x.value).dev === 'TKONLY0001').length === 10 && oldTk.length === 10 && oldTk.every(j => j.n === 'Meriç'));
  T('v3.67: tickets for a kapora paid on 20 Sep carry at = 2026-09-20 (24 h long gone → on the table now), exp = now + 7 days', oldTk.every(j => j.at === '2026-09-20T10:00:00.000Z' && new Date(j.exp).getTime() === NOW + 7 * 86400000));
  r = await px.call('GET', '/meydan'); T('… so /meydan shows them on G4\'s table immediately', r.json.offers.find(o => o.id === G4).hemen.table_n >= 10);
  // a ticket minted earlier by the button (bf, private, at = today) for an old kapora is re-dated by the top-up
  px.DB.grupal_settings.push({ key: 'inv_REDATE01', value: JSON.stringify({ o: G4, dev: 'OLDSESS001', n: 'Meriç', at: new Date(NOW).toISOString(), exp: new Date(NOW + 7 * 86400000).toISOString(), st: 'p', oid: null, bf: 1 }) });
  r = await px.call('POST', '/admin/inv-backfill', { top: 1 }, KEYH); const rd = JSON.parse(px.DB.grupal_settings.find(x => x.key === 'inv_REDATE01').value);
  T('re-dated: at pulled back to the kapora date, redated counted, nothing extra minted for that kapora', r.json.redated >= 1 && rd.at === '2026-09-20T10:00:00.000Z' && px.DB.grupal_settings.filter(x => x.key.startsWith('inv_') && JSON.parse(x.value).dev === 'OLDSESS001').length === 11);
  px.DB.grupal_settings = px.DB.grupal_settings.filter(x => x.key !== 'inv_REDATE01');
  r = await px.call('POST', '/admin/inv-backfill', { top: 1 }, KEYH); T('second top-up mints nothing', r.json.ok === true && r.json.minted === 0);
  px.DB.grupal_offer_votes = px.DB.grupal_offer_votes.filter(v => v.dev !== 'OLDSESS001'); px.DB.grupal_settings = px.DB.grupal_settings.filter(x => x.key !== 'mem_meric.k@example.com'); }
// ---- v3.68: "kapora yanmaz, indirim yanar" — late completion window (7 days at Hemen-Al price − deposit), then forfeit = burn + ban + the package goes to the table as a house ticket
{ Date.now = () => NOW; const KEYH = { 'x-cc-key': 'adminkey' }; const L = '10000000-0000-4000-8000-00000000c001';
  px.DB.grupal_offers.push({ id: L, name: 'Late Lot', origin: 'Peru', process: 'washed', active: true, sort: 60, pub: { name: 'Late Lot', origin: 'Peru', process: 'washed' }, meta: { list_tl: 1600, jury_tl: 960, basket_tl: 1280, img_url: 'https://db.test/l.jpg', hemen_url: 'https://coffeenutz.net/cart/901:1' }, created_at: '2026-09-01T00:00:00Z' });
  px.DB.grupal_settings.find(x => x.key === 'offer_hemen_open').value = '1'; px.DB.grupal_settings = px.DB.grupal_settings.filter(x => !x.key.startsWith('ban_'));
  r = await px.call('POST', '/admin/settings', { offer_ban_cycles: '1' }, KEYH); T('fixture: suspension switched on for this block (default is 0 since v3.71)', r.json.cfg.ban_cycles === 1);
  r = await hook({ offer: L, dev: 'LATEDEV001' }, { id: 99801, qty: 2, email: 'late1@example.com' }); r = await hook({ offer: L, dev: 'LATEDEV002' }, { id: 99802, email: 'late2@example.com' });
  r = await px.call('POST', '/admin/offer-lock', { id: L }, KEYH); T('fixture: Late Lot locked (dep 3)', r.json.ok && r.json.lock.dep === 3); const lockN = r.json.lock.n;
  r = await px.call('GET', '/meydan'); T('pubCfg carries late_days 7', r.json.offer_cfg.late_days === 7);
  // close cycles until the lock's batch has closed
  let batch = null; for (let i = 0; i < 4 && !batch; i++) { NOW += 7 * 86400000; r = await px.call('GET', '/meydan'); batch = (r.json.cycle.batches || []).find(bb => bb.n === lockN) || null; }
  T('after the close: batch carries done_by and late_by = done_by + 7 days', !!batch && new Date(batch.late_by).getTime() === new Date(batch.done_by).getTime() + 7 * 86400000);
  NOW = new Date(batch.closed_at).getTime() + 3600000; r = await px.call('POST', '/done-link', { id: L, dev: 'LATEDEV001' }); T('inside the completion window: due 860 (960 − 100), late false', r.json.ok === true && r.json.due === 860 && r.json.late === false);
  NOW = new Date(batch.done_by).getTime() + 3600000; r = await px.call('POST', '/done-link', { id: L, dev: 'LATEDEV001' }); T('after done_by: late completion — due 1180 (1280 − 100), late true, 2 boxes → total 2360', r.json.ok === true && r.json.due === 1180 && r.json.late === true && r.json.total === 2360);
  r = await px.call('POST', '/admin/cycle-forfeit', { n: lockN }, KEYH); T('forfeit before late_by → 409 with late_by', r.status === 409 && !!r.json.late_by);
  NOW = new Date(batch.late_by).getTime() + 3600000; r = await px.call('POST', '/done-link', { id: L, dev: 'LATEDEV001' }); T('after late_by: done-link refused (late_over)', r.json.ok === false && r.json.reason === 'late_over');
  // v3.69: kademe 2 runs by itself on the first /meydan after late_by — no button
  r = await px.call('GET', '/meydan'); const recA = JSON.parse(px.DB.grupal_settings.find(x => x.key === 'meydan_cycle_' + lockN).value);
  T('auto-forfeit on /meydan: 2 rows FORFEIT, forfeited_at written, burned 2, 3 house tickets, forfeit_run guard set', px.DB.grupal_offer_votes.filter(v => v.offer_id === L && v.done_order === 'FORFEIT').length === 2 && !!recA.forfeited_at && recA.burned === 2 && !!px.DB.grupal_settings.find(x => x.key === 'forfeit_run_' + lockN));
  r = await px.call('GET', '/meydan'); T('second /meydan does not forfeit again (forfeited_at set)', px.DB.grupal_settings.filter(x => x.key.startsWith('inv_')).map(x => JSON.parse(x.value)).filter(j => j.o === L && j.dev === 'HOUSE').length === 3);
  r = await px.call('POST', '/admin/cycle-forfeit', { n: lockN }, KEYH);
  T('the admin button afterwards finds nothing left to mark (idempotent)', r.json.ok === true && r.json.marked === 0 && r.json.tabled === 0);
  const house = px.DB.grupal_settings.filter(x => x.key.startsWith('inv_')).map(x => JSON.parse(x.value)).filter(j => j.o === L && j.dev === 'HOUSE');
  T('house tickets: n CoffeeNutz, st t, ff flag, 7 days', house.length === 3 && house.every(j => j.n === 'CoffeeNutz' && j.st === 't' && j.ff === 1 && new Date(j.exp).getTime() === NOW + 7 * 86400000));
  r = await px.call('GET', '/meydan'); T('/meydan: the 3 sit on Late Lot\'s table for anyone', r.json.offers.find(o => o.id === L).hemen.table_n >= 3);
  r = await px.call('GET', '/offer-mine?dev=LATEDEV001'); T('/offer-mine: forfeited + banned_until set', r.json.votes.find(v => v.id === L).forfeited === true && !!r.json.banned_until);
  r = await px.call('POST', '/admin/settings', { offer_ban_cycles: '' }, KEYH); T('suspension back to the default: 0', r.json.cfg.ban_cycles === 0);
  NOW = Date.UTC(2026, 8, 29, 12, 0, 0); Date.now = () => NOW; px.DB.grupal_settings.find(x => x.key === 'offer_hemen_open').value = '0'; }
console.log(pass + ' pass, ' + fail + ' fail'); process.exit(fail ? 1 : 0);
