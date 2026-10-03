const assert = require('node:assert/strict');
const Module = require('node:module');
const { normalizeInstrument, parseInstrument } = require('../lib/instruments.cjs');
const originalFetch = global.fetch, originalLoad = Module._load;
const oldKey = process.env.TWELVEDATA_API_KEY, oldStore = process.env.BLOB_STORE_ID;
process.env.TWELVEDATA_API_KEY = 'test-only-key'; process.env.BLOB_STORE_ID = 'test-store';
const blobs = new Map(), calls = [];
Module._load = function(name, ...args) {
  if (name === '@vercel/blob') return {
    get: async path => blobs.has(path) ? { statusCode: 200, stream: new Response(blobs.get(path)).body, blob: { etag: 'r1' } } : null,
    put: async (path, body) => { blobs.set(path, body); return { etag: 'r2' }; }
  };
  return originalLoad.call(this, name, ...args);
};
const apple = { symbol: 'AAPL', name: 'Apple Inc', exchange: 'NASDAQ', mic_code: 'XNGS', country: 'United States', currency: 'USD', type: 'Common Stock', access: { plan: 'Basic' } };
const german = { ...apple, exchange: 'XETRA', mic_code: 'XETR', country: 'Germany', currency: 'EUR', access: { plan: 'Grow' } };
const etf = { symbol: 'SPY', name: 'SPDR ETF', exchange: 'NYSE', mic_code: 'ARCX', country: 'United States', currency: 'USD', type: 'ETF' };
global.fetch = async (url, options) => {
  const u = new URL(url); calls.push(u);
  assert.equal(options.headers.Authorization, 'apikey test-only-key');
  let data;
  if (u.pathname === '/stocks') data = { data: u.searchParams.get('page') === '1' ? [{ ...apple, symbol: 'MSFT', name: 'Microsoft' }] : [apple], count: 61 };
  else if (u.pathname === '/etfs') data = { result: { list: [etf], count: 1 } };
  else if (u.pathname === '/exchanges') data = { data: [{ name: 'NASDAQ', country: 'United States' }, { name: 'XETRA', country: 'Germany' }] };
  else if (u.pathname === '/symbol_search') data = { data: u.searchParams.get('symbol') === 'broad' ? Array.from({ length: 120 }, (_, i) => ({ ...apple, symbol: `A${i}` })) : u.searchParams.get('symbol') === 'Space Exploration Technologies' ? [{ ...apple, symbol: 'SPCX', name: 'Space Exploration Technologies Corp.' }, { ...apple, symbol: 'SPCX', mic_code: 'IEXG', exchange: 'IEX' }] : [apple, { ...apple, mic_code: 'IEXG', exchange: 'IEX' }, german, etf] };
  else if (u.pathname === '/exchange_rate') data = { rate: '0.9' };
  else if (u.pathname === '/quote') {
    const symbol = u.searchParams.get('symbol');
    if (symbol === 'DENIED') data = { status: 'error', code: 403 };
    else if (symbol === 'LIMIT') data = { status: 'error', code: 429 };
    else data = { symbol, name: 'Apple Inc', exchange: u.searchParams.get('mic_code') === 'XETR' ? 'XETRA' : 'NASDAQ', currency: u.searchParams.get('mic_code') === 'XETR' ? 'EUR' : 'USD', close: '100', percent_change: '-2.5', timestamp: 1790956800 };
  } else throw Error(`Unexpected provider path ${u.pathname}`);
  return { ok: true, status: 200, json: async () => data };
};
const catalogue = require('../api/catalogue.js'), instrument = require('../api/instrument.js'), quotes = require('../api/quotes.js');
Module._load = originalLoad;
async function request(handler, query = {}, method = 'GET') {
  const result = { headers: {} };
  await handler({ method, query }, { setHeader: (k,v) => result.headers[k] = v, status: status => { result.status = status; return { json: body => result.body = body }; } });
  assert.ok(!JSON.stringify(result.body).includes('test-only-key'));
  return result;
}
async function main() {
  assert.deepEqual(parseInstrument('AAPL::XNGS'), { symbol: 'AAPL', mic_code: 'XNGS' });
  assert.deepEqual(parseInstrument('AAPL:XETRA'), { symbol: 'AAPL', exchange: 'XETRA' });
  assert.throws(() => parseInstrument('AAPL:::XNGS'));
  assert.notEqual(normalizeInstrument(apple).key, normalizeInstrument(german).key);
  assert.equal((await request(catalogue, { page: '-1' })).status, 400);
  assert.equal((await request(catalogue, {}, 'POST')).status, 405);
  const first = await request(catalogue);
  assert.equal(first.body.total, 61); assert.equal(first.body.rows[0].key, 'AAPL::XNGS'); assert.equal(first.body.hasMore, true);
  assert.equal(calls.some(u => u.pathname === '/quote'), false, 'Browsing must never request quotes');
  const before = calls.length; await request(catalogue); assert.equal(calls.length, before, 'Repeated pages use cache');
  assert.ok(blobs.size);
  delete require.cache[require.resolve('../api/catalogue.js')];
  Module._load = function(name, ...args) { if (name === '@vercel/blob') return { get: async path => ({ statusCode: 200, stream: new Response(blobs.get(path)).body, blob: { etag: 'r1' } }), put: async () => ({}) }; return originalLoad.call(this, name, ...args); };
  const coldCatalogue = require('../api/catalogue.js'); Module._load = originalLoad;
  await request(coldCatalogue); assert.equal(calls.length, before, 'Private storage reuses pages across cold starts');
  assert.equal((await request(catalogue, { page: '2' })).body.rows[0].symbol, 'MSFT');
  assert.equal((await request(catalogue, { kind: 'etfs' })).body.rows[0].kind, 'etfs');
  const search = await request(catalogue, { q: 'Apple', country: 'Germany' });
  assert.equal(search.body.total, 1); assert.equal(search.body.rows[0].key, 'AAPL::XNGS'); assert.equal(search.body.rows[0].currency, 'USD');
  assert.equal((await request(catalogue, { q: 'SpaceX' })).body.rows[0].symbol, 'SPCX');
  assert.equal(calls.at(-1).searchParams.get('symbol'), 'Space Exploration Technologies');
  assert.equal((await request(catalogue, { q: 'Apple', kind: 'etfs' })).body.rows[0].symbol, 'SPY');
  assert.equal((await request(catalogue, { q: 'broad' })).body.capped, true);
  assert.equal((await request(catalogue, { mode: 'filters' })).body.countries.length, 2);
  const price = await request(instrument, { key: 'AAPL::XETR' });
  assert.equal(price.body.price, 100); assert.equal(price.body.currency, 'EUR'); assert.equal(price.body.day, -2.5);
  assert.equal(calls.at(-1).searchParams.get('mic_code'), 'XETR');
  const quoteBefore = calls.length; await request(instrument, { key: 'AAPL::XETR' }); assert.equal(calls.length, quoteBefore);
  assert.equal((await request(instrument, { key: 'DENIED::XNGS' })).status, 403);
  assert.equal((await request(instrument, { key: 'LIMIT::XNGS' })).status, 429);
  const portfolio = await request(quotes, { symbols: 'AAPL::XNGS,AAPL::XETR' });
  assert.deepEqual(portfolio.body.quotes.map(q => [q.symbol, q.priceEur]), [['AAPL::XNGS', 90], ['AAPL::XETR', 100]]);
  console.log('Catalogue API checks passed: pagination, stock/ETF search, filters, search cap, memory/private cache, exact venue, on-demand quotes, plan/quota errors, currency conversion.');
}
main().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => {
  global.fetch = originalFetch; Module._load = originalLoad;
  if (oldKey === undefined) delete process.env.TWELVEDATA_API_KEY; else process.env.TWELVEDATA_API_KEY = oldKey;
  if (oldStore === undefined) delete process.env.BLOB_STORE_ID; else process.env.BLOB_STORE_ID = oldStore;
});
