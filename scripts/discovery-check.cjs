const assert=require('node:assert/strict'),Module=require('node:module');
const originalLoad=Module._load,originalFetch=global.fetch,originalNow=Date.now,oldKey=process.env.TWELVEDATA_API_KEY,oldStore=process.env.BLOB_STORE_ID;
process.env.TWELVEDATA_API_KEY='test';process.env.BLOB_STORE_ID='test';
let state,etag=0,calls=[],now=originalNow(),rateLimit=false;Date.now=()=>now;
Module._load=function(name,...args){if(name==='@vercel/blob')return{
  get:async()=>state?{statusCode:200,stream:new Response(state).body,blob:{etag:String(etag)}}:null,
  put:async(path,body,options)=>{if(state)assert.equal(options.ifMatch,String(etag),'Updates must use an ETag lease');state=body;return{etag:String(++etag)};}
};return originalLoad.call(this,name,...args);};
const symbols=Array.from({length:14},(_,i)=>'NEW'+i);
global.fetch=async(url)=>{const u=new URL(url);calls.push(u);
  if(u.pathname==='/stocks')return{ok:true,json:async()=>({count:400,data:symbols.map(symbol=>({symbol,name:'New Company '+symbol,type:'Common Stock',exchange:'NASDAQ',mic_code:'XNGS',country:'United States',currency:'USD'})).concat([{symbol:'FUND',type:'ETF',mic_code:'XNGS',country:'United States',currency:'USD'},{symbol:'SECONDARY',type:'Common Stock',mic_code:'IEXG',country:'United States',currency:'USD'}])})};
  assert.equal(u.pathname,'/time_series');assert.equal(u.searchParams.get('mic_code'),'XNGS');
  if(rateLimit)return{ok:false,status:429,json:async()=>({status:'error',code:429,message:'Minute quota exceeded'})};
  return{ok:true,json:async()=>({meta:{currency:'USD',exchange:'NASDAQ'},values:Array.from({length:40},(_,i)=>({datetime:new Date(Date.UTC(2026,7,1+i)).toISOString().slice(0,10),close:String(10-i/10),high:'20',volume:'1000000'}))})};
};
const handler=require('../api/discovery.js');Module._load=originalLoad;
async function request(query={}){const result={};await handler({method:'GET',query},{setHeader(){},status(code){result.code=code;return{json(body){result.body=body;}};}});return result;}
async function main(){
  assert.equal((await request({mode:'invalid'})).code,400);assert.equal(calls.length,0);
  const first=await request();assert.equal(first.code,200);assert.equal(first.body.analyzed,6);assert.equal(first.body.rows.length,6);
  assert.ok(first.body.rows.every(r=>r.symbol.startsWith('NEW')),'Candidates come from the provider catalogue, without a radar list');
  assert.equal(first.body.rows[0].asset.name.startsWith('New Company'),true);assert.equal(calls.filter(c=>c.pathname==='/stocks').length,1);
  await request({mode:'cheap',ceiling:'25'});assert.equal(calls.length,7,'Changing filters must not bypass the shared cooldown');
  now+=66000;const second=await request();assert.equal(second.body.analyzed,12);assert.equal(calls.length,13,'Continue with previously queued companies');
  now+=66000;rateLimit=true;const limited=await request();assert.equal(limited.body.analyzed,12);assert.equal(limited.body.queued,2,'Rate-limited companies stay queued');assert.ok(limited.body.error.includes('Quota'));
  const beforeBudget=calls.length;
  const saved=JSON.parse(state);saved.credits=599;saved.lastScan=0;state=JSON.stringify(saved);now+=66000;
  const capped=await request();assert.equal(capped.body.budgetReached,true);assert.equal(calls.length,beforeBudget,'Respect daily scan budget');
  assert.ok(!calls.some(u=>u.searchParams.get('symbol')==='FUND'||u.searchParams.get('symbol')==='SECONDARY'));
  console.log('Discovery checks passed: catalogue source independent of radar, exact venues, queue persistence, cross-device lease, cooldown, filters, daily budget, ETF/secondary exclusions.');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{global.fetch=originalFetch;Module._load=originalLoad;Date.now=originalNow;if(oldKey===undefined)delete process.env.TWELVEDATA_API_KEY;else process.env.TWELVEDATA_API_KEY=oldKey;if(oldStore===undefined)delete process.env.BLOB_STORE_ID;else process.env.BLOB_STORE_ID=oldStore;});
