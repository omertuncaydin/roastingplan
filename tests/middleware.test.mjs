// Cloudflare Pages Function simulation — run from the repo root: node tests/middleware.test.mjs
import { onRequest } from '../functions/_middleware.js';
const mkAssets=()=>({ fetch: async (req)=>{ const u=new URL(req.url); if(u.pathname==='/grupal') return new Response('<html>GRUPAL '+u.search+'</html>',{status:200}); if(u.pathname==='/grupal.html') return new Response('',{status:308,headers:{location:'/grupal'}}); return new Response('nf',{status:404}); } });
let pass=0,fail=0; const T=(n,c)=>{ c?pass++:(fail++,console.log('FAIL',n)); };
async function run(u){ let nexted=false; const ctx={request:new Request(u),env:{ASSETS:mkAssets()},next:async()=>{ nexted=true; return new Response('NEXT',{status:200}); }}; const res=await onRequest(ctx); return {res,body:await res.text(),nexted,loc:res.headers.get('location')}; }
let r;
r=await run('https://grup-al.com/'); T('root serves the page (no redirect), query kept empty', r.res.status===200 && r.body.includes('GRUPAL') && !r.nexted);
r=await run('https://grup-al.com/?utm=ig'); T('root with utm serves the page, query passed through', r.res.status===200 && r.body.includes('?utm=ig'));
r=await run('https://grup-al.com/?k=wanrich&ref=ABCD'); T('root with ?k= (campaign link) serves the page', r.res.status===200 && r.body.includes('k=wanrich'));
r=await run('https://grup-al.com/index.html'); T('/index.html serves the page', r.res.status===200 && r.body.includes('GRUPAL'));
r=await run('https://grup-al.com/juri'); T('/juri serves the page', r.res.status===200 && r.body.includes('GRUPAL'));
r=await run('https://grup-al.com/misafir'); T('/misafir serves the page (lobby)', r.res.status===200 && r.body.includes('GRUPAL'));
r=await run('https://grup-al.com/meydan?x=1'); T('/meydan → 301 /juri, query kept', r.res.status===301 && r.loc==='https://grup-al.com/juri?x=1');
r=await run('https://www.grup-al.com/juri'); T('www → apex 301', r.res.status===301 && r.loc==='https://grup-al.com/juri');
r=await run('https://grup-al.com/roast-guide'); T('other paths pass through', r.nexted && r.body==='NEXT');
r=await run('https://guide.coffeenutz.net/'); T('guide host untouched', r.nexted);
console.log(pass+' pass, '+fail+' fail'); process.exit(fail?1:0);
