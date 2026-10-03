const assert = require('node:assert/strict');
const Module = require('node:module');
const originalFetch = global.fetch, originalLoad = Module._load, originalKey = process.env.TWELVEDATA_API_KEY, originalStore = process.env.BLOB_STORE_ID;
process.env.TWELVEDATA_API_KEY = 'history-test'; process.env.BLOB_STORE_ID = 'test-store';
const blobs = new Map(); let requests = 0;
Module._load = function(name,...args) {
  if(name === '@vercel/blob') return { get: async path => blobs.has(path) ? {statusCode:200,stream:new Response(blobs.get(path)).body,blob:{etag:'r1'}} : null, put:async(path,body) => blobs.set(path,body) };
  return originalLoad.call(this,name,...args);
};
global.fetch = async url => {
  requests++; const u = new URL(url);
  assert.equal(u.searchParams.get('mic_code'),'XNGS'); assert.equal(u.searchParams.get('adjust'),'splits'); assert.equal(u.searchParams.get('interval'),'1day');
  if(u.searchParams.get('symbol') === 'LIMIT') return {ok:false,status:429,json:async()=>({status:'error',code:429})};
  if(u.searchParams.get('symbol') === 'DENIED') return {ok:false,status:403,json:async()=>({status:'error',code:403})};
  return {ok:true,json:async()=>({meta:{currency:'USD',exchange:'NASDAQ'},values:[
    {datetime:'2026-10-02',open:'42',high:'44',low:'40',close:'43',volume:'12345'},
    {datetime:'2026-10-01',open:'41',high:'43',low:'40',close:'42'},
    {datetime:'2026-10-02',open:'42',high:'45',low:'40',close:'44',volume:'12000'},
    {datetime:'2026-09-30',open:'41',high:'40',low:'38',close:'42'},
    {datetime:'invalid',open:'41',high:'43',low:'40',close:'42'},
    {datetime:'2026-09-29',open:null,high:'43',low:'40',close:'42'}
  ]})};
};
const handler = require('../api/history.js'); Module._load = originalLoad;
async function request(key) { const result={}; await handler({method:'GET',query:{key}},{setHeader(){},status(n){result.code=n;return{json(body){result.body=body;}};}});return result; }
async function main() {
  assert.equal((await request('AAPL:::XNGS')).code,400); assert.equal(requests,0);
  const first = await request('AAPL::XNGS'); assert.equal(first.code,200);
  assert.equal(first.body.bars.length,2); assert.equal(first.body.bars[0].time,'2026-10-01'); assert.equal(first.body.bars[0].volume,null); assert.equal(first.body.bars[1].close,44);
  assert.equal(first.body.currency,'USD'); assert.equal(first.body.adjusted,'splits'); assert.equal(blobs.size,1);
  await request('AAPL::XNGS'); assert.equal(requests,1,'History must be cached across period changes');
  assert.equal((await request('LIMIT::XNGS')).code,429); assert.equal((await request('DENIED::XNGS')).code,403);
  console.log('History API checks passed: venue, split adjustment, OHLC validation, ascending unique dates, missing volumes, cache, quota and plan errors.');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{
  global.fetch=originalFetch;Module._load=originalLoad;
  if(originalKey===undefined)delete process.env.TWELVEDATA_API_KEY;else process.env.TWELVEDATA_API_KEY=originalKey;
  if(originalStore===undefined)delete process.env.BLOB_STORE_ID;else process.env.BLOB_STORE_ID=originalStore;
});
