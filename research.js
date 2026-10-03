(function (root) {
  'use strict';
  function performance(values) {
    const rows = (values || []).filter(v => Number(v.close) > 0 && /^\d{4}-\d{2}-\d{2}/.test(v.datetime || ''))
      .sort((a, b) => b.datetime.localeCompare(a.datetime));
    if (!rows.length) return null;
    const latest = rows[0], price = Number(latest.close);
    const change = n => rows[n] ? (price / Number(rows[n].close) - 1) * 100 : null;
    const high = Math.max(...rows.map(v => Number(v.high) || Number(v.close)));
    return { price, date: latest.datetime.slice(0, 10), day: change(1), week: change(5), month: change(21),
      baseline: { day: rows[1]?.datetime.slice(0, 10) || null, week: rows[5]?.datetime.slice(0, 10) || null, month: rows[21]?.datetime.slice(0, 10) || null },
      sessions: rows.length, volume: Number(latest.volume) || null, drawdown: (price / high - 1) * 100 };
  }
  function ledger(transactions) {
    const positions = new Map();
    let realized = 0, fees = 0, sales = 0, wins = 0, unmatched = 0, turnover = 0;
    const results = [];
    for (const t of [...transactions].sort((a, b) => (a.executedAt || a.date).localeCompare(b.executedAt || b.date))) {
      const q = Number(t.quantity), price = Number(t.price), fee = Number(t.fees) || 0;
      if (!(q > 0 && price > 0)) continue;
      const row = positions.get(t.ticker) || { quantity: 0, cost: 0 };
      fees += fee; turnover += q * price;
      if (t.side === 'sell') {
        const matched = Math.min(row.quantity, q), avg = row.quantity > 0 ? row.cost / row.quantity : 0;
        if (matched < q - 1e-8) unmatched++;
        if (matched > 0) {
          const pnl = matched * (price - avg) - fee * (matched / q);
          realized += pnl; sales++; if (pnl > 0) wins++;
          results.push({ id: t.id, ticker: t.ticker, date: t.date, pnl, partial: matched < q - 1e-8 });
          row.quantity -= matched; row.cost -= matched * avg;
        }
      } else { row.quantity += q; row.cost += q * price + fee; }
      if (row.quantity < 1e-8) { row.quantity = 0; row.cost = 0; }
      positions.set(t.ticker, row);
    }
    return { realized, fees, sales, wins, unmatched, turnover, results, hitRate: sales ? wins / sales * 100 : null };
  }
  function scenario(rows, ticker, change) {
    const value = rows.reduce((sum, h) => sum + h.value, 0);
    const affected = rows.filter(h => ticker === 'all' || h.ticker === ticker).reduce((sum, h) => sum + h.value, 0);
    const delta = affected * change / 100;
    return { value: value + delta, delta, portfolioChange: value ? delta / value * 100 : 0, affected };
  }
  function signals(rows, owned = []) {
    return rows.filter(r => Number.isFinite(r.week) && Number.isFinite(r.month) && !owned.includes(r.symbol))
      .sort((a, b) => b.week - a.week).slice(0, 3)
      .map(r => ({ ...r, reason: r.week > 0 && r.month > 0 ? 'Trend positivo su 5 e 21 sedute' : r.week > 0 ? 'Recupero nelle ultime 5 sedute' : 'Da osservare durante la debolezza',
        caution: r.week > 15 ? 'Movimento rapido: valuta il rischio di inseguire il prezzo.' : r.drawdown < -20 ? 'Oltre il 20% sotto il massimo delle sedute disponibili.' : 'Verifica bilanci, valutazione e prossimi risultati.' }));
  }
  const api = { performance, ledger, scenario, signals };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FormaResearch = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
