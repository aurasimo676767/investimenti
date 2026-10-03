const assert = require('node:assert/strict');
const { performance, ledger, scenario, signals } = require('../research.js');
const values = Array.from({ length: 32 }, (_, i) => ({ datetime: new Date(Date.UTC(2026, 8, 1 + i)).toISOString().slice(0, 10), close: String(100 + i), high: String(102 + i) }));
const perf = performance(values);
assert.equal(perf.price, 131);
assert.ok(Math.abs(perf.day - (131 / 130 - 1) * 100) < 1e-8);
assert.ok(Math.abs(perf.week - (131 / 126 - 1) * 100) < 1e-8);
assert.ok(Math.abs(perf.month - (131 / 110 - 1) * 100) < 1e-8);
assert.equal(performance(values.slice(0, 5)).week, null);
assert.equal(performance([]), null);
assert.equal(performance([{ datetime: 'bad', close: '100' }]), null);
const trades = [
  { id: 'a', date: '2026-01-01', ticker: 'A', side: 'buy', quantity: 10, price: 20, fees: 2 },
  { id: 'b', date: '2026-01-02', ticker: 'A', side: 'sell', quantity: 4, price: 25, fees: 1 },
  { id: 'c', date: '2026-01-03', ticker: 'A', side: 'sell', quantity: 6, price: 18, fees: 1 }
];
const stats = ledger(trades);
assert.ok(Math.abs(stats.realized - 4) < 1e-8);
assert.equal(stats.fees, 4); assert.equal(stats.wins, 1); assert.equal(stats.hitRate, 50);
assert.equal(ledger([{ ...trades[1], quantity: 8 }]).unmatched, 1);
assert.equal(ledger([]).hitRate, null);
const unmatched = ledger([trades[0], { ...trades[1], quantity: 20 }]);
assert.ok(Math.abs(unmatched.realized - 47.5) < 1e-8);
assert.equal(unmatched.unmatched, 1);
assert.deepEqual(scenario([{ ticker: 'A', value: 200 }, { ticker: 'B', value: 300 }], 'A', -20), { value: 460, delta: -40, portfolioChange: -8, affected: 200 });
assert.equal(signals([{ symbol: 'A', week: 20, month: 30 }, { symbol: 'B', week: 10, month: 10 }], ['A'])[0].symbol, 'B');
console.log('Research checks passed: timeframe baselines, partial history, realized P/L, concentration scenarios, selection criteria.');

async function apiChecks() {
  const Module = require('node:module'), originalLoad = Module._load;
  const originalFetch = global.fetch, originalKey = process.env.TWELVEDATA_API_KEY;
  const originalStore = process.env.BLOB_STORE_ID;
  let stored, requests = 0, requestedSymbols;
  Module._load = function (name, parent, isMain) {
    if (name === '@vercel/blob') return {
      get: async () => stored ? { statusCode: 200, stream: new Blob([stored]).stream(), blob: { etag: 'r1' } } : null,
      put: async (_path, data) => { stored = data; return { etag: 'r1' }; }
    };
    return originalLoad.apply(this, arguments);
  };
  process.env.TWELVEDATA_API_KEY = 'test-only'; process.env.BLOB_STORE_ID = 'test-only';
  global.fetch = async url => {
    requests++; requestedSymbols = new URL(url).searchParams.get('symbol').split(',');
    const body = Object.fromEntries(requestedSymbols.map(s => [s, { meta: { symbol: s, currency: 'USD', exchange: 'NASDAQ' }, values }]));
    return { ok: true, json: async () => body };
  };
  try {
    const handler = require('../api/market.js');
    const request = async symbols => { let code, body; await handler({ method: 'GET', query: { symbols } }, { setHeader() {}, status(n) { code = n; return this; }, json(data) { body = data; } }); return { code, body }; };
    assert.equal((await request('INVALID!')).code, 400);
    const first = await request('AAPL,MSFT,NVDA,AMD,IREN,TSLA,HOOD');
    assert.equal(first.code, 200); assert.equal(first.body.rows.length, 6); assert.equal(first.body.complete, false);
    assert.equal(requestedSymbols.length, 6); assert.equal(requests, 1);
    const second = await request('AAPL,MSFT,NVDA,AMD,IREN,TSLA');
    assert.equal(second.body.complete, true); assert.equal(requests, 1);
    assert.equal((await request('AAPL,MSFT,NVDA,AMD,IREN,TSLA,HOOD')).body.rows.length, 6);
    assert.equal(requests, 1);
    console.log('Market API checks passed: validation, six-symbol quota, persisted cache, shared refresh cooldown.');
  } finally {
    Module._load = originalLoad; global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.TWELVEDATA_API_KEY; else process.env.TWELVEDATA_API_KEY = originalKey;
    if (originalStore === undefined) delete process.env.BLOB_STORE_ID; else process.env.BLOB_STORE_ID = originalStore;
  }
}
apiChecks().catch(error => { console.error(error); process.exitCode = 1; });
