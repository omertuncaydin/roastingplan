// Minimal in-memory PostgREST + Deno shim to exercise grupal-proxy logic in Node (no network).
// Usage: import { boot } from './proxy-harness.mjs'; const px = await boot('/path/to/proxy.ts'); await px.call('GET','/meydan');
import fs from 'fs'; import ts from 'typescript';
export async function boot(tsPath, seed = {}) {
  const src = fs.readFileSync(tsPath, 'utf8');
  const js = ts.transpileModule(src, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
  const DB = { grupal_settings: [], grupal_offers: [], grupal_offer_votes: [], grupal_campaigns: [], grupal_pledges: [], grupal_wishes: [], ...seed };
  const PK = { grupal_settings: ['key'], grupal_offers: ['id'], grupal_offer_votes: ['offer_id', 'dev'], grupal_campaigns: ['id'], grupal_pledges: ['id'] };
  let handler = null; const log = [];
  const parse = (u) => { const url = new URL(u); const path = url.pathname.replace(/^.*\/rest\/v1\//, ''); const table = path.split('?')[0]; const flt = [], sel = url.searchParams.get('select'); let onConflict = url.searchParams.get('on_conflict');
    for (const [k, v] of url.searchParams) { if (['select', 'order', 'limit', 'on_conflict'].includes(k)) continue; const m = /^(eq|like|cs)\.(.*)$/.exec(v); if (m) flt.push({ col: k, op: m[1], val: m[2] }); }
    return { table, flt, sel, onConflict }; };
  const match = (row, f) => { const v = row[f.col]; if (f.op === 'eq') return String(v) === f.val; if (f.op === 'like') { const re = new RegExp('^' + f.val.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$'); return re.test(String(v ?? '')); } if (f.op === 'cs') return Array.isArray(v) && v.includes(f.val.replace(/[{}]/g, '')); return false; };
  const project = (row, sel) => { if (!sel || sel === '*') return row; const o = {}; for (const c of sel.split(',')) o[c.trim()] = row[c.trim()]; return o; };
  const fakeFetch = async (u, init = {}) => {
    const s = String(u); log.push((init.method || 'GET') + ' ' + s.replace(/^https?:\/\/[^/]+/, ''));
    if (!s.includes('/rest/v1/')) return { ok: false, status: 404, text: async () => 'no', json: async () => ({}) };
    const { table, flt, sel, onConflict } = parse(s); if (!(table in DB)) return { ok: false, status: 404, text: async () => 'relation "' + table + '" does not exist', json: async () => ({}) };
    const rows = DB[table]; const method = init.method || 'GET';
    if (method === 'GET') { const out = rows.filter(r => flt.every(f => match(r, f))).map(r => project(r, sel)); return { ok: true, status: 200, json: async () => out, text: async () => JSON.stringify(out) }; }
    if (method === 'POST') { const body = JSON.parse(init.body || '{}'); const list = Array.isArray(body) ? body : [body]; for (const b of list) {
        const keys = (onConflict ? onConflict.split(',') : PK[table] || []); const ex = keys.length ? rows.find(r => keys.every(k => String(r[k]) === String(b[k]))) : null;
        if (ex) { if (!onConflict) return { ok: false, status: 409, text: async () => 'duplicate', json: async () => ({}) }; Object.assign(ex, b); }
        else rows.push({ created_at: new Date(Date.now()).toISOString(), ...(table === 'grupal_offers' && !b.id ? { id: crypto.randomUUID() } : {}), ...b }); }
      return { ok: true, status: 201, json: async () => list, text: async () => '' }; }
    if (method === 'PATCH') { const body = JSON.parse(init.body || '{}'); let n = 0; for (const r of rows) if (flt.every(f => match(r, f))) { Object.assign(r, body); n++; } return { ok: true, status: 200, json: async () => [], text: async () => String(n) }; }
    if (method === 'DELETE') { const keep = rows.filter(r => !flt.every(f => match(r, f))); DB[table] = keep; return { ok: true, status: 204, json: async () => [], text: async () => '' }; }
    return { ok: false, status: 405, text: async () => 'method', json: async () => ({}) };
  };
  globalThis.Deno = { serve: (h) => { handler = h; }, env: { get: (k) => ({ SUPABASE_URL: 'https://db.test', SUPABASE_SERVICE_ROLE_KEY: 'k', CC_KEY: 'adminkey' })[k] || '' } };
  globalThis.fetch = fakeFetch;
  await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
  const call = async (method, path, body, headers = {}) => {
    const req = new Request('https://fn.test/grupal-proxy' + path, { method, headers: { 'content-type': 'application/json', ...headers }, body: body == null ? undefined : (typeof body === 'string' ? body : JSON.stringify(body)) });
    const res = await handler(req); const txt = await res.text(); let j = null; try { j = JSON.parse(txt); } catch {} return { status: res.status, text: txt, json: j }; };
  return { DB, call, log };
}
