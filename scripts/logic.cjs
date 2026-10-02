const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');
const trImporter = require('../tr-import.js');

const elements = new Map();
const element = key => {
  if (!elements.has(key)) elements.set(key, { innerHTML: '', textContent: '', classList: { add() {}, remove() {} }, setAttribute() {}, addEventListener() {} });
  return elements.get(key);
};
const storage = new Map();
const context = vm.createContext({
  console, Intl, Date, Number, String, Map, JSON, Math, crypto: require('crypto').webcrypto,
  setTimeout, clearTimeout,
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  document: { querySelector: element, addEventListener() {} },
  window: { scrollTo() {} }
});
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8'), context);
const run = code => vm.runInContext(code, context);

assert.strictEqual(run('portfolio().rows.length'), 3);
assert.strictEqual(run('portfolio().rows[0].ticker'), 'ASML');
assert.ok(element('#main-content').innerHTML.includes('Anteprima'));
run('resetDemo()');
assert.strictEqual(run('portfolio().rows.length'), 0);
assert.ok(!element('#main-content').innerHTML.includes('class="sparkline"') || !element('#main-content').innerHTML.includes('demo-hero'));
run('state.transactions.push({ id:"a", date:"2026-01-01", side:"buy", ticker:"IREN", name:"IREN Limited", quantity:10, price:20, fees:1 }); state.prices.IREN=25;');
assert.strictEqual(run('portfolio().value'), 250);
assert.strictEqual(run('portfolio().invested'), 201);
assert.strictEqual(run('portfolio().pnl'), 49);
assert.strictEqual(run('normalizeDate("02/10/2026")'), '2026-10-02');
assert.strictEqual(run('normalizeSide("Acquisto")'), 'buy');
assert.strictEqual(run('num("1.234,56")'), 1234.56);
assert.strictEqual(run('csvRows')('data;tipo;ticker\n01/01/2026;Acquisto;IREN').length, 2);
assert.strictEqual(run('esc("<script>")'), '&lt;script&gt;');
const trHeaders = ['datetime', 'date', 'category', 'type', 'asset_class', 'name', 'symbol', 'shares', 'price', 'fee', 'currency', 'transaction_id'];
const trRows = [trHeaders,
  ['2026-01-01T10:00:00Z', '2026-01-01', 'CASH', 'TRANSFER_INBOUND', '', '', '', '', '', '', 'EUR', 'cash-1'],
  ['2026-01-02T10:00:00Z', '2026-01-02', 'TRADING', 'BUY', 'STOCK', 'Example', 'US0000000001', '2.5', '10', '-1', 'EUR', 'buy-1'],
  ['2026-01-03T10:00:00Z', '2026-01-03', 'TRADING', 'SELL', 'STOCK', 'Example', 'US0000000001', '-1', '12', '-1', 'EUR', 'sell-1']];
const parsedTr = trImporter.parseTradeRepublicRows(trRows);
assert.strictEqual(parsedTr.skippedCash, 1);
assert.strictEqual(parsedTr.transactions.length, 2);
assert.strictEqual(parsedTr.transactions[1].quantity, 1);
assert.strictEqual(parsedTr.transactions[1].fees, 1);
assert.strictEqual(parsedTr.errors.length, 0);
assert.strictEqual(trImporter.parseTradeRepublicRows([trHeaders, [...trRows[2].slice(0, 7), '-2.5', ...trRows[2].slice(8)]]).errors.length, 1);
console.log('Logic checks passed: rendering, holdings, CSV parsing, escaping.');
