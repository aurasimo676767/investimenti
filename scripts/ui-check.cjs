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
const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://forma.test', pretendToBeVisual: true, virtualConsole });
const w = dom.window;
const style = w.document.createElement('style'); style.textContent = fs.readFileSync(path.join(root, 'styles.css'), 'utf8'); w.document.head.appendChild(style);
assert.ok(style.sheet?.cssRules.length > 100, 'Stylesheet must parse successfully');
w.scrollTo = () => {}; w.confirm = () => true; w.setInterval = () => 0;
w.IntersectionObserver = class { observe(el) { el.classList.add('is-visible'); } disconnect() {} unobserve() {} };
let cloudSnapshot, catalogueRequests = [], instrumentRequests = 0;
const catalogAssets = [
  { key: 'AAPL::XNGS', symbol: 'AAPL', name: 'Apple Inc', kind: 'stocks', exchange: 'NASDAQ', mic: 'XNGS', country: 'United States', currency: 'USD', plan: 'Basic', trackable: true },
  { key: 'AAPL::XETR', symbol: 'AAPL', name: 'Apple Inc', kind: 'stocks', exchange: 'XETRA', mic: 'XETR', country: 'Germany', currency: 'EUR', plan: 'Grow', trackable: true }
];
w.fetch = async (url, options) => {
  if (String(url).includes('/api/catalogue')) {
    const params = new URL(url, 'https://forma.test').searchParams; catalogueRequests.push(params);
    if (params.get('mode') === 'filters') return { ok: true, json: async () => ({ countries: ['Germany','United States'], exchanges: [{ name: 'NASDAQ', country: 'United States' }, { name: 'XETRA', country: 'Germany' }] }) };
    const rows = params.get('kind') === 'etfs' ? [{ ...catalogAssets[0], key: 'SPY::ARCX', symbol: 'SPY', name: 'SPDR ETF', kind: 'etfs' }] : params.get('page') === '2' ? [catalogAssets[1]] : catalogAssets;
    return { ok: true, json: async () => ({ rows, page: Number(params.get('page')), total: 61, pageSize: 30, hasMore: params.get('page') !== '2', search: !!params.get('q'), fetchedAt: new Date().toISOString() }) };
  }
  if (String(url).includes('/api/instrument')) { instrumentRequests++; return { ok: true, json: async () => ({ key: 'AAPL::XETR', price: 100, currency: 'EUR', exchange: 'XETRA', day: -2.5, fetchedAt: new Date().toISOString() }) }; }
  if (String(url).includes('/api/quotes')) return { ok: true, json: async () => ({ quotes: [{ symbol: 'AAPL::XETR', priceEur: 100, currency: 'EUR', price: 100 }], errors: [], fetchedAt: new Date().toISOString() }) };
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
for (const file of ['tr-import.js','research.js','experience.js','catalogue.js','app.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), dom.getInternalVMContext(), { filename: file });
const q = selector => w.document.querySelector(selector);
const click = selector => { assert.ok(q(selector), `Missing ${selector}`); q(selector).click(); };
const input = (selector, value) => { assert.ok(q(selector)); q(selector).value = value; q(selector).dispatchEvent(new w.Event('input', { bubbles: true })); };
const submit = selector => q(selector).dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
async function main() {
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.ok(q('h1').textContent.includes('capitale'));
  assert.equal(q('.mover-name span').textContent.trim().split(' ')[0], 'IREN');
  click('[data-timeframe="week"]'); assert.equal(q('.mover-name span').textContent.trim().split(' ')[0], 'NVDA');
  click('[data-direction="losers"]'); assert.ok(q('.mover-lead').classList.contains('loss'));
  click('[data-asset="TSLA"]'); assert.ok(q('.modal').textContent.includes('Tesla'));
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
  for (const page of ['overview','discover','watchlist','lab','transactions','settings']) { click(`#mobile-nav [data-nav="${page}"]`); assert.ok(q('h1')); }
  click('#desktop-nav [data-nav="discover"]');
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(w.document.querySelectorAll('.catalogue-row').length, 2);
  assert.equal(instrumentRequests, 0, 'Browsing must not fetch every price');
  click('[data-catalogue-page="2"]'); await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(w.document.querySelectorAll('.catalogue-row').length, 1);
  input('#catalogue-search', 'Apple'); await new Promise(resolve => setTimeout(resolve, 380));
  assert.equal(catalogueRequests.at(-1).get('q'), 'Apple');
  assert.equal(catalogueRequests.at(-1).get('page'), '1');
  click('[data-catalogue-open="AAPL::XETR"]'); await new Promise(resolve => setTimeout(resolve, 20));
  assert.ok(q('#instrument-quote .loss')); assert.ok(q('.modal-head p').textContent.includes('XETRA'));
  click('.modal [data-bookmark="AAPL::XETR"]');
  let saved = JSON.parse(w.localStorage.getItem('forma-invest-v1'));
  assert.ok(saved.watchlist.includes('AAPL::XETR')); assert.equal(saved.assets['AAPL::XETR'].currency, 'EUR');
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  click('[data-catalogue-open="AAPL::XETR"]'); submit('#catalogue-link-form');
  await new Promise(resolve => setTimeout(resolve, 20));
  saved = JSON.parse(w.localStorage.getItem('forma-invest-v1'));
  assert.equal(saved.symbols.IREN, 'AAPL::XETR');
  assert.equal(q('#quote-form input[name="IREN"]').value, 'AAPL');
  submit('#quote-form'); await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(JSON.parse(w.localStorage.getItem('forma-invest-v1')).symbols.IREN, 'AAPL::XETR', 'Saving the raw display ticker preserves its venue');
  click('#desktop-nav [data-nav="discover"]'); click('[data-catalogue-kind="etfs"]'); await new Promise(resolve => setTimeout(resolve, 20));
  assert.ok(q('[data-catalogue-open="SPY::ARCX"]'));
  await new Promise(resolve => setTimeout(resolve, 850));
  assert.equal(cloudSnapshot.journal.length, 1); assert.equal(cloudSnapshot.alerts.length, 1);
  assert.equal(cloudSnapshot.assets['AAPL::XETR'].mic, 'XETR');
  assert.ok(!errors.length, errors.join('\n'));
  console.log('UI checks passed: all pages, timeframe ranking, losers, asset details, notes escaping, watchlist, alerts, scenarios, purchase isolation, journal, filters, cloud payload.');
}
main().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => w.close());
