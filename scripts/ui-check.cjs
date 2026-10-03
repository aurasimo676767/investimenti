const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..');
const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', e => errors.push(e.message));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const fixtureRows = ['IREN','NVDA','MSFT','PLTR','TSLA','SOFI'].map((symbol, i) => ({ symbol, currency: 'USD', exchange: 'NASDAQ',
  price: 40 + i, day: [12,8,-4,3,-2,1][i], week: [15,22,-5,8,-12,5][i], month: [30,40,-10,11,-18,8][i],
  date: '2026-10-02', baseline: { day: '2026-10-01', week: '2026-09-25', month: '2026-09-03' }, sessions: 32, drawdown: -3, fetchedAt: Date.now() }));
fixtureRows.forEach(r=>{r.windows={year:{high:r.price*2,drawdown:-50,sessions:250,from:'2025-10-02',to:'2026-10-02'},quarter:{high:r.price*1.2,drawdown:-100/6,sessions:63,from:'2026-07-02',to:'2026-10-02'}};r.volatility=3;r.dollarVolume=5000000;});
const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://forma.test', pretendToBeVisual: true, virtualConsole });
const w = dom.window;
const chartInstances = [], chartSets = []; let historyRequests = 0;
w.LightweightCharts = {
  AreaSeries:'area',CandlestickSeries:'candles',HistogramSeries:'volume',LineSeries:'line',
  createChart(element,options) { const chart = { removed:false, addSeries(type) { const series = { setData(data){chartSets.push({type,data});},priceScale(){return{applyOptions(){}};} };return series; },timeScale(){return{fitContent(){}};},subscribeCrosshairMove(){},applyOptions(){},remove(){chart.removed=true;} }; chartInstances.push(chart); return chart; }
};
const style = w.document.createElement('style'); style.textContent = fs.readFileSync(path.join(root, 'styles.css'), 'utf8') + '\n' + fs.readFileSync(path.join(root, 'polish.css'), 'utf8') + fs.readFileSync(path.join(root, 'ideas.css'), 'utf8'); w.document.head.appendChild(style);
assert.ok(style.sheet?.cssRules.length > 100, 'Stylesheet must parse successfully');
w.scrollTo = () => {}; w.confirm = () => true; w.setInterval = () => 0;
w.IntersectionObserver = class { observe(el) { el.classList.add('is-visible'); } disconnect() {} unobserve() {} };
let cloudSnapshot, catalogueRequests = [], instrumentRequests = 0;
const catalogAssets = [
  { key: 'AAPL::XNGS', symbol: 'AAPL', name: 'Apple Inc', kind: 'stocks', exchange: 'NASDAQ', mic: 'XNGS', country: 'United States', currency: 'USD', plan: 'Basic', trackable: true },
  { key: 'MSFT::XNYS', symbol: 'MSFT', name: 'Microsoft', kind: 'stocks', exchange: 'NYSE', mic: 'XNYS', country: 'United States', currency: 'USD', plan: 'Grow', trackable: true }
];
w.fetch = async (url, options) => {
  if (String(url).includes('/api/history')) {
    historyRequests++;
    return {ok:true,json:async()=>({key:new URL(url,'https://forma.test').searchParams.get('key'),currency:'USD',exchange:'NASDAQ',fetchedAt:new Date().toISOString(),bars:Array.from({length:180},(_,i)=>({time:new Date(Date.UTC(2026,3,1+i)).toISOString().slice(0,10),open:40+i/10,high:42+i/10,low:39+i/10,close:41+i/10,volume:1000+i}))})};
  }
  if (String(url).includes('/api/catalogue')) {
    const params = new URL(url, 'https://forma.test').searchParams; catalogueRequests.push(params);
    if (params.get('mode') === 'filters') return { ok: true, json: async () => ({ countries: ['Germany','United States'], exchanges: [{ name: 'NASDAQ', country: 'United States' }, { name: 'XETRA', country: 'Germany' }] }) };
    const rows = params.get('kind') === 'etfs' ? [{ ...catalogAssets[0], key: 'SPY::ARCX', symbol: 'SPY', name: 'SPDR ETF', kind: 'etfs' }] : params.get('page') === '2' ? [catalogAssets[1]] : catalogAssets;
    return { ok: true, json: async () => ({ rows, page: Number(params.get('page')), total: 61, pageSize: 30, hasMore: params.get('page') !== '2', search: !!params.get('q'), fetchedAt: new Date().toISOString() }) };
  }
  if (String(url).includes('/api/instrument')) { instrumentRequests++; return { ok: true, json: async () => ({ key: 'MSFT::XNYS', price: 100, currency: 'EUR', exchange: 'XETRA', day: -2.5, fetchedAt: new Date().toISOString() }) }; }
  if (String(url).includes('/api/quotes')) return { ok: true, json: async () => ({ quotes: [{ symbol: 'MSFT::XNYS', priceEur: 100, currency: 'EUR', price: 100 }], errors: [], fetchedAt: new Date().toISOString() }) };
  if (String(url).includes('/api/state')) {
    if (options?.method === 'PUT') { cloudSnapshot = JSON.parse(options.body).state; return { ok: true, status: 200, json: async () => ({ revision: 'test-r1' }) }; }
    return { ok: true, status: 200, json: async () => ({ state: null, revision: null }) };
  }
  if (String(url).includes('/api/market')) return { ok: true, json: async () => ({ rows: fixtureRows, total: 6, complete: true, retryAfter: 600 }) };
  throw Error('Unexpected test URL');
};
const seeded = { demo: false, hidden: false, transactions: [{ id: 'a', ticker: 'IREN', name: 'IREN Limited', date: '2026-01-01', side: 'buy', quantity: 10, price: 20, fees: 1 }],
  prices: { IREN: 40 }, quoteMeta: { IREN: { fetchedAt: new Date().toISOString() } }, symbols: {}, watchlist: [], notes: {}, journal: [], alerts: [] };
w.localStorage.setItem('forma-invest-v1', JSON.stringify(seeded));
w.localStorage.setItem('forma-market-v1', JSON.stringify({ rows: fixtureRows, total: 6, complete: true }));
for (const file of ['tr-import.js','research.js','experience.js','catalogue.js','charts.js','ideas.js','app.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), dom.getInternalVMContext(), { filename: file });
const q = selector => w.document.querySelector(selector);
const click = selector => { assert.ok(q(selector), `Missing ${selector}`); q(selector).click(); };
const input = (selector, value) => { assert.ok(q(selector)); q(selector).value = value; q(selector).dispatchEvent(new w.Event('input', { bubbles: true })); };
const submit = selector => q(selector).dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
async function main() {
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.ok(q('h1').textContent.includes('capitale'));
  assert.ok(chartSets.some(s=>s.type==='area' && s.data.length>1));
  assert.equal(chartSets.find(s=>s.type==='volume' && s.data[0]?.value===201).data[0].value,201,'Monthly buys include commissions');
  const originalHistoryRequests = historyRequests;
  click('[data-chart-period="1m"]'); await new Promise(resolve=>setTimeout(resolve,10));
  assert.equal(historyRequests,originalHistoryRequests,'Period change reuses provider data');
  click('[data-chart-style="candles"]'); await new Promise(resolve=>setTimeout(resolve,10));
  assert.ok(chartSets.some(s=>s.type==='candles' && s.data[0].high));
  click('[data-chart-average]'); await new Promise(resolve=>setTimeout(resolve,10));
  assert.ok(chartSets.some(s=>s.type==='line' && s.data.length));
  assert.ok(chartInstances.some(c=>c.removed),'Replaced charts must be disposed');
  assert.equal(q('.mover-name span').textContent.trim().split(' ')[0], 'IREN');
  click('[data-timeframe="week"]'); assert.equal(q('.mover-name span').textContent.trim().split(' ')[0], 'NVDA');
  click('[data-direction="losers"]'); assert.ok(q('.mover-lead').classList.contains('loss'));
  click('[data-asset="TSLA"]'); assert.ok(q('.modal').textContent.includes('Tesla'));
  click('.modal [data-open-chart="TSLA"]'); await new Promise(resolve=>setTimeout(resolve,10));
  assert.ok(q('.modal .chart-canvas')); assert.ok(q('.chart-table-content table'));
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); assert.equal(q('.modal'), null);
  click('#desktop-nav [data-nav="discover"]'); input('#company-search', 'iren'); assert.equal(w.document.querySelectorAll('.company-card').length, 1);
  click('[data-bookmark="IREN"]'); click('#desktop-nav [data-nav="watchlist"]'); assert.equal(w.document.querySelectorAll('.watch-card').length, 1);
  click('[data-note="IREN"]'); input('#note-text', '<img src=x onerror=alert(1)> thesis'); submit('#note-form');
  assert.equal(q('.watch-note').querySelector('img'), null); assert.ok(q('.watch-note').textContent.includes('<img'));
  click('[data-alert-symbol="IREN"]'); input('#alert-price', '50'); submit('#alert-form');
  assert.equal(JSON.parse(w.localStorage.getItem('forma-invest-v1')).alerts.length, 1);
  assert.ok(q('.alert-row').textContent.includes('IREN'));
  input('#scenario-range', '-20'); assert.ok(q('#scenario-change').textContent.includes('-20'));
  assert.ok(q('#scenario-result').textContent.includes('320'));
  input('#purchase-budget', '201'); input('#purchase-price', '20'); submit('#purchase-form');
  assert.ok(q('#purchase-result').textContent.includes('Azioni aggiuntive'));
  assert.equal(JSON.parse(w.localStorage.getItem('forma-invest-v1')).transactions.length, 1);
  click('[data-action="journal-add"]'); input('#journal-title', 'Test decision'); input('#journal-thesis', 'Test thesis'); submit('#journal-form');
  assert.equal(w.document.querySelectorAll('.journal-entry').length, 1);
  click('#desktop-nav [data-nav="transactions"]'); input('#transaction-search', 'nothing'); assert.equal(w.document.querySelectorAll('.transaction-row').length, 0);
  input('#transaction-search', 'iren'); assert.equal(w.document.querySelectorAll('.transaction-row').length, 1);
  click('[data-trade-side="sell"]'); assert.equal(w.document.querySelectorAll('.transaction-row').length, 0);
  for (const page of ['overview','discover','ideas','watchlist','lab','transactions','settings']) {
    if (['lab','transactions','settings'].includes(page)) {click('#mobile-nav [data-action="more-nav"]');click(`.modal [data-nav="${page}"]`);assert.equal(q('.modal'),null);}
    else click(`#mobile-nav [data-nav="${page}"]`);
    assert.ok(q('h1'));
  }
  assert.ok(q('.update-guide').textContent.includes('ogni 20 minuti'));
  click('#desktop-nav [data-nav="ideas"]');
  assert.equal(w.document.querySelectorAll('.research-idea').length,5,'Held IREN excluded');
  assert.equal(q('.research-idea [data-bookmark="IREN"]'),null);
  click('[data-idea-mode="cheap"]');
  assert.equal(w.document.querySelectorAll('.research-idea').length,0,'No fictitious cheap stocks when criteria fail');
  const ceiling=q('[data-idea-pref="ceiling"]');ceiling.value='50';ceiling.dispatchEvent(new w.Event('change',{bubbles:true}));
  assert.equal(w.document.querySelectorAll('.research-idea').length,5);
  assert.ok(q('.research-thesis').textContent.includes('non è un obiettivo'));
  click('#desktop-nav [data-nav="discover"]');
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(w.document.querySelectorAll('.catalogue-row').length, 2);
  assert.equal(q('#catalogue-country'), null, 'Country choice removed: USA only');
  assert.equal(instrumentRequests, 0, 'Browsing must not fetch every price');
  click('[data-catalogue-page="2"]'); await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(w.document.querySelectorAll('.catalogue-row').length, 1);
  input('#catalogue-search', 'Apple'); await new Promise(resolve => setTimeout(resolve, 380));
  assert.equal(catalogueRequests.at(-1).get('q'), 'Apple');
  assert.equal(catalogueRequests.at(-1).get('page'), '1');
  click('[data-catalogue-open="MSFT::XNYS"]'); await new Promise(resolve => setTimeout(resolve, 20));
  assert.ok(q('#instrument-quote .loss')); assert.ok(q('.modal-head p').textContent.includes('NYSE'));
  click('.modal [data-bookmark="MSFT::XNYS"]');
  let saved = JSON.parse(w.localStorage.getItem('forma-invest-v1'));
  assert.ok(saved.watchlist.includes('MSFT::XNYS')); assert.equal(saved.assets['MSFT::XNYS'].currency, 'USD');
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  click('[data-catalogue-open="MSFT::XNYS"]'); submit('#catalogue-link-form');
  await new Promise(resolve => setTimeout(resolve, 20));
  saved = JSON.parse(w.localStorage.getItem('forma-invest-v1'));
  assert.equal(saved.symbols.IREN, 'MSFT::XNYS');
  assert.equal(q('#quote-form input[name="IREN"]').value, 'MSFT');
  submit('#quote-form'); await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(JSON.parse(w.localStorage.getItem('forma-invest-v1')).symbols.IREN, 'MSFT::XNYS', 'Saving the raw display ticker preserves its venue');
  click('#desktop-nav [data-nav="discover"]'); click('[data-catalogue-kind="etfs"]'); await new Promise(resolve => setTimeout(resolve, 20));
  assert.ok(q('[data-catalogue-open="SPY::ARCX"]'));
  await new Promise(resolve => setTimeout(resolve, 850));
  assert.equal(cloudSnapshot.journal.length, 1); assert.equal(cloudSnapshot.alerts.length, 1);
  assert.equal(cloudSnapshot.assets['MSFT::XNYS'].mic, 'XNYS');
  assert.equal(cloudSnapshot.ideaPreferences.ceiling,50);assert.equal(cloudSnapshot.ideaPreferences.mode,'cheap');
  assert.ok(!errors.length, errors.join('\n'));
  console.log('UI checks passed: all pages, timeframe ranking, losers, asset details, notes escaping, watchlist, alerts, scenarios, purchase isolation, journal, filters, cloud payload.');
}
main().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => w.close());
