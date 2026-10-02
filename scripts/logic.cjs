const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

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
console.log('Logic checks passed: rendering, holdings, CSV parsing, escaping.');
