const { get, put, head } = require('@vercel/blob');
const { normalizeInstrument, instrumentPath } = require('../lib/instruments.cjs');
const { performance, screenIdeas } = require('../research.js');
const PATH = 'forma/discovery-v1.json', DAY = 86400000, BUDGET = 600, GROUP = 6;
let memory, pending;
const fresh = () => ({ rows:{},queue:[],page:1,catalogRead:0,catalogTotal:null,catalogComplete:false,examined:0,failed:0,lastScan:0,leaseUntil:0,usageDate:'',credits:0 });
async function read() {
  if (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN) return {...(memory || fresh())};
  const blob = await get(PATH,{access:'private',useCache:false});
  if (!blob || blob.statusCode === 404) return fresh();
  if (blob.statusCode !== 200) throw Error('Archivio della ricerca non disponibile. Riprova.');
  return {...JSON.parse(await new Response(blob.stream).text()),revision:blob.blob.etag};
}
async function write(state) {
  const {revision,...data}=state;
  if (process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(PATH,JSON.stringify(data),{access:'private',addRandomSuffix:false,contentType:'application/json',...(revision?{allowOverwrite:true,ifMatch:revision}:{})});
    state.revision=blob.etag || (await head(PATH)).etag;
  }
  memory=state;return state;
}
async function provider(path,key) {
  const response=await fetch(`https://api.twelvedata.com${path}`,{headers:{Authorization:`apikey ${key}`},signal:AbortSignal.timeout(12000)}),data=await response.json();
  if(!response.ok||data.status==='error'){const e=Error('Dati non disponibili');e.code=Number(data.code)||response.status;e.daily=/daily|per day|a day|for the day|today/i.test(data.message||'');throw e;}return data;
}
async function scan(key) {
  let state=await read(),now=Date.now(),date=new Date(now).toISOString().slice(0,10);
  if(state.usageDate!==date){state.usageDate=date;state.credits=0;}
  if(now<state.leaseUntil||now-state.lastScan<65000||state.credits+GROUP+1>BUDGET)return state;
  // Persist a conditional lease before spending credits, also across devices.
  state.leaseUntil=now+65000;state.lastScan=now;state.credits+=GROUP+1;
  try {await write(state);}catch(_){return await read();}
  try {
    state.error=null;
    for(const [symbol,row] of Object.entries(state.rows))if(now-row.fetchedAt>7*DAY)delete state.rows[symbol];
    if(state.queue.length<GROUP){
      if(state.catalogComplete){state.page=1;state.catalogRead=0;state.catalogComplete=false;}
      const source=await provider(`/stocks?${new URLSearchParams({country:'United States',page:String(state.page),outputsize:'200',include_delisted:'false',show_plan:'true'})}`,key);
      const list=source.result?.list||source.data||[],total=Number(source.result?.count??source.count);
      state.catalogTotal=Number.isFinite(total)?total:null;state.catalogRead+=list.length;state.page++;
      state.catalogComplete=Number.isFinite(total)?state.catalogRead>=total:list.length<200;
      const queued=new Set(state.queue.map(r=>r.symbol));
      for(const asset of list.map(r=>normalizeInstrument(r))){
        if(asset.country!=='United States'||asset.currency!=='USD'||!asset.trackable||!['XNGS','XNMS','XNCM','XNAS','XNYS','XASE'].includes(asset.mic)||!/common stock|depositary receipt|REIT/i.test(asset.type)||queued.has(asset.symbol)||now-(state.rows[asset.symbol]?.fetchedAt||0)<DAY)continue;
        state.queue.push(asset);queued.add(asset.symbol);
      }
    }
    const batch=state.queue.splice(0,GROUP);
    const results=await Promise.all(batch.map(async asset=>{
      try {
        const source=await provider(instrumentPath('time_series',asset.key,{interval:'1day',outputsize:'260',adjust:'splits'}),key);
        const data=performance(source.values);
        if(!data)throw Error('Storico vuoto');
        return {asset,row:{...data,symbol:asset.key,currency:String(source.meta?.currency||asset.currency),exchange:String(source.meta?.exchange||asset.exchange),name:asset.name,asset,fetchedAt:now}};
      }catch(error){return{asset,error};}
    }));
    for(const result of results){
      if(result.row){state.rows[result.asset.symbol]=result.row;state.examined++;}
      else if(result.error.code===429){state.queue.push(result.asset);state.error='Quota Twelve Data raggiunta. La ricerca riprenderà appena disponibile.';if(result.error.daily)state.credits=BUDGET;}
      else{state.failed++;}
    }
  }catch(error){state.error=error.code===429?'Quota Twelve Data raggiunta. Riproveremo automaticamente.':'La scansione non è riuscita. I risultati precedenti sono conservati.';if(error.daily)state.credits=BUDGET;}
  state.leaseUntil=0;await write(state);return state;
}
module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='GET')return res.status(405).json({error:'Metodo non supportato.'});
  const key=process.env.TWELVEDATA_API_KEY;if(!key)return res.status(503).json({error:'Chiave Twelve Data non configurata.'});
  const mode=String(req.query.mode||'drops'),window=String(req.query.window||'year'),minimum=Number(req.query.minimum||20),ceiling=Number(req.query.ceiling||25);
  if(!['drops','cheap','recovery'].includes(mode)||!['year','quarter'].includes(window)||![10,20,40,60].includes(minimum)||![5,10,25,50,100].includes(ceiling))return res.status(400).json({error:'Filtri non validi.'});
  try {
    if(!pending)pending=scan(key).finally(()=>{pending=null;});
    const state=await pending,all=Object.values(state.rows).filter(r=>Date.now()-r.fetchedAt<=7*DAY);
    const matches=screenIdeas(all,{mode,window,minimum,ceiling,includeOwned:true});
    const budgetReached=state.credits+GROUP+1>BUDGET;
    return res.status(200).json({rows:matches.slice(0,240),matches:matches.length,limited:matches.length>240,analyzed:all.length,catalogRead:state.catalogRead,catalogTotal:state.catalogTotal,failed:state.failed,queued:state.queue.length,budgetReached,creditsUsed:state.credits,scanBudget:BUDGET,error:state.error||null,retryAfter:budgetReached?Math.ceil((new Date(new Date().toISOString().slice(0,10)+'T00:00:00Z').getTime()+DAY-Date.now())/1000):Math.max(65,Math.ceil((state.leaseUntil-Date.now())/1000)),fetchedAt:new Date().toISOString(),scope:'us-catalogue'});
  }catch(_){return res.status(503).json({error:'Archivio della ricerca non disponibile. Riprova: nessun dato personale è stato modificato.'});}
};
