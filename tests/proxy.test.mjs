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
    { key: 'offer_dep_url', value: 'https://coffeenutz.net/cart/111:1' }, { key: 'offer_hemen_base', value: '2' } ],
  grupal_offers: [
    { id: A, name: 'El Recreo', origin: 'Kolombiya', process: 'washed', active: true, sort: 1, pub: { name: 'El Recreo', origin: 'Kolombiya', process: 'washed' }, meta: { list_tl: 1600, img_url: 'https://db.test/storage/v1/object/public/grupal/o/a.jpg', hemen_url: 'https://coffeenutz.net/cart/222:1', green_boxes: 4 }, created_at: '2026-09-01T00:00:00Z' },
    { id: B, name: 'Nuwa Senchi', origin: 'Peru', process: 'washed', active: true, sort: 2, pub: { name: 'Nuwa Senchi', origin: 'Peru', process: 'washed' }, meta: { list_tl: 1500 }, created_at: '2026-09-01T00:00:00Z' } ] });
const hook = (attrs, order) => px.call('POST', '/shopify-hook', { id: order.id, financial_status: 'paid', email: order.email || 'x@y.z', customer: { first_name: order.name || 'Ömer' }, line_items: [{ quantity: order.qty || 1 }], note_attributes: Object.entries(attrs).map(([name, value]) => ({ name, value: String(value) })) });

let r = await px.call('GET', '/meydan');
T('v3.38 tag', r.json && r.json.v === '3.38');
let oa = r.json.offers.find(o => o.id === A), ob = r.json.offers.find(o => o.id === B);
T('A (photo + hemen_url) carries the lane: url, price 1280, base 2, left 2, sold 0, empty table, roast_at = next close + 1 day', oa.hemen && oa.hemen.url === 'https://coffeenutz.net/cart/222:1' && oa.hemen.price === 1280 && oa.hemen.base === 2 && oa.hemen.left === 2 && oa.hemen.sold === 0 && oa.hemen.table.length === 0 && oa.hemen.roast_at === '2026-10-05T20:59:00.000Z');
T('B (no photo) has no lane; cfg carries hemen_inv 2 / hemen_inv_h 24', !ob.hemen && r.json.offer_cfg.hemen_inv === 2 && r.json.offer_cfg.hemen_inv_h === 24);

// ---- kapora on A → 2 invitations minted, private
r = await hook({ offer: A, dev: 'DEV1AAAAAA', terms: '1' }, { id: 9001, name: 'Ömer', email: 'omer@x.tr' });
T('kapora webhook: counted + 2 invitations minted', r.text === 'ok (kapora · davetiye ×2)');
const invKeys = px.DB.grupal_settings.filter(s => s.key.startsWith('inv_'));
T('two inv_ records for A, private, exp +7d, holder name Ömer', invKeys.length === 2 && invKeys.every(s => { const j = JSON.parse(s.value); return j.o === A && j.dev === 'DEV1AAAAAA' && j.st === 'p' && j.n === 'Ömer' && j.exp === new Date(NOW + 7 * 86400000).toISOString(); }));
const code1 = invKeys[0].key.slice(4), code2 = invKeys[1].key.slice(4);
r = await px.call('GET', '/offer-mine?dev=DEV1AAAAAA');
T('offer-mine: 1 kapora vote, 2 invitations (st p), no hemen boxes', r.json.votes.length === 1 && r.json.votes[0].paid && r.json.inv.length === 2 && r.json.inv.every(i => i.st === 'p' && i.id === A) && r.json.hemen.length === 0);
r = await px.call('GET', '/meydan'); oa = r.json.offers.find(o => o.id === A);
T('meydan: A dep 1, table still empty (private)', oa.dep === 1 && oa.hemen.table.length === 0 && oa.hemen.left === 2);

// ---- kapora on B (no lane) → no invitations
r = await hook({ offer: B, dev: 'DEV2BBBBBB' }, { id: 9002 });
T('kapora on a coffee without the lane mints nothing', r.text === 'ok (kapora)' && px.DB.grupal_settings.filter(s => s.key.startsWith('inv_')).length === 2);

// ---- /inv validation for a friend
r = await px.call('GET', '/inv?c=' + code1 + '&dev=FRIEND0001');
T('/inv valid: name, coffee, price, url, st p', r.json.ok && r.json.name === 'Ömer' && r.json.coffee === 'El Recreo' && r.json.price === 1280 && r.json.url.includes('/cart/222:1') && r.json.st === 'p' && r.json.id === A);
r = await px.call('GET', '/inv?c=NOPE&dev=FRIEND0001'); T('/inv unknown code → nocode', r.json.ok === false && r.json.reason === 'nocode');

// ---- masaya bırak (owner only)
r = await px.call('POST', '/inv-table', { c: code1, dev: 'FRIEND0001' }); T('inv-table by a stranger → 403', r.status === 403);
r = await px.call('POST', '/inv-table', { c: code1, dev: 'DEV1AAAAAA' }); T('inv-table by owner → ok, st t', r.json.ok && r.json.st === 't');
r = await px.call('GET', '/meydan'); oa = r.json.offers.find(o => o.id === A);
T('meydan: table shows the invitation with the holder name', oa.hemen.table.length === 1 && oa.hemen.table[0].c === code1 && oa.hemen.table[0].n === 'Ömer');

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
T('after 25 h the unsent invitation sits on the table by itself', oa.hemen.table.length === 1 && oa.hemen.table[0].c === code2);
r = await px.call('GET', '/inv?c=' + code2 + '&dev=FRIEND0001'); T('friend who already took one from A this week → limit', r.json.ok === false && r.json.reason === 'limit');
r = await px.call('GET', '/inv?c=' + code2 + '&dev=DEV1AAAAAA'); T('owner may use it herself (no limit for own code)', r.json.ok === true && r.json.st === 't');
r = await px.call('GET', '/inv?c=' + code2 + '&dev=NEWBIE0001'); T('a new device may take it', r.json.ok === true);
// green cap: green_boxes 4, used 3 → one left; after it, invitations refuse with reason green
r = await hook({ hemen: '1', offer: A, dev: 'NEWBIE0001', inv: code2 }, { id: 9006, name: 'Deniz' }); T('newbie buys via table invitation', r.text === 'ok (hemen · davetiye)');
r = await px.call('GET', '/meydan'); oa = r.json.offers.find(o => o.id === A); T('green_left 0 → pool left 0, dep 5', oa.hemen.green_left === 0 && oa.hemen.left === 0 && oa.dep === 5);
// mint again and check the green refusal
r = await hook({ offer: A, dev: 'DEV3CCCCCC' }, { id: 9007, name: 'Ali' }); const code3 = px.DB.grupal_settings.filter(s => s.key.startsWith('inv_')).map(s => s.key.slice(4)).find(c => c !== code1 && c !== code2);
r = await px.call('GET', '/inv?c=' + code3 + '&dev=X000000001'); T('with green exhausted the invitation says green', r.json.ok === false && r.json.reason === 'green');

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
T('admin settings: hemen keys saved and reflected in cfg', r.json.ok && r.json.cfg.hemen_base === 3 && r.json.settings.offer_hemen_inv_h === '24');

Date.now = realNow;
console.log(pass + ' pass, ' + fail + ' fail'); process.exit(fail ? 1 : 0);
