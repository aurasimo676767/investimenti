(function (root) {
  'use strict';
  function performance(values) {
    const rows = (values || []).filter(v => Number(v.close) > 0 && Number.isFinite(Number(v.close)) && /^\d{4}-\d{2}-\d{2}/.test(v.datetime || '') && Number.isFinite(Date.parse(v.datetime.slice(0,10))))
      .sort((a, b) => b.datetime.localeCompare(a.datetime));
    if (!rows.length) return null;
    const latest = rows[0], price = Number(latest.close);
    const change = n => rows[n] ? (price / Number(rows[n].close) - 1) * 100 : null;
    const rowHigh = v => Math.max(Number.isFinite(Number(v.high)) ? Number(v.high) : 0,Number(v.close));
    const high = Math.max(...rows.map(rowHigh));
    const windows = {};
    for (const [key,months] of [['quarter',3],['year',12]]) {
      const start = new Date(`${latest.datetime.slice(0,10)}T12:00:00Z`); start.setUTCMonth(start.getUTCMonth() - months);
      const subset = rows.filter(r => r.datetime.slice(0,10) >= start.toISOString().slice(0,10));
      const peak = Math.max(...subset.map(rowHigh));
      windows[key] = { high:peak, drawdown:(price / peak - 1)*100, from:subset.at(-1).datetime.slice(0,10), to:latest.datetime.slice(0,10), sessions:subset.length };
    }
    const recent = rows.slice(0,21), returns = recent.slice(0,-1).map((r,i) => (Number(r.close) / Number(recent[i+1].close) - 1)*100);
    const mean = returns.reduce((s,r) => s+r,0) / (returns.length || 1);
    const volatility = returns.length >= 5 ? Math.sqrt(returns.reduce((s,r) => s+(r-mean)**2,0) / returns.length) : null;
    const volumes = recent.filter(r => r.volume !== null && r.volume !== undefined && r.volume !== '' && Number.isFinite(Number(r.volume)) && Number(r.volume) >= 0);
    const dollarVolume = volumes.length >= 5 ? volumes.reduce((s,r) => s+Number(r.volume)*Number(r.close),0)/volumes.length : null;
    return { price, date: latest.datetime.slice(0, 10), day: change(1), week: change(5), month: change(21),
      baseline: { day: rows[1]?.datetime.slice(0, 10) || null, week: rows[5]?.datetime.slice(0, 10) || null, month: rows[21]?.datetime.slice(0, 10) || null },
      sessions: rows.length, volume: Number(latest.volume) || null, drawdown: (price / high - 1) * 100, windows, volatility, dollarVolume };
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
  const identity = symbol => String(symbol || '').split(':')[0].toUpperCase().replace(/^GOOGL$/,'GOOG');
  function screenIdeas(rows, options = {}) {
    const owned = new Set((options.owned || []).map(identity)), seen = new Set();
    const mode = options.mode || 'drops', window = options.window || 'year', minimum = Number(options.minimum) || 20, ceiling = Number(options.ceiling) || 25;
    const matches = rows.filter(r => r.currency === 'USD' && /^(NASDAQ|NYSE|NYSE American|NYSE ARCA|NYSEArca|CBOE|BATS)$/i.test(r.exchange || '') && r.kind !== 'etfs')
      .filter(r => { const id = identity(r.symbol); if (seen.has(id)) return false; seen.add(id); return options.includeOwned || !owned.has(id); })
      .filter(r => r.price > 0 && Number.isFinite(r.price) && r.windows?.[window]?.sessions >= 21 && Number.isFinite(r.windows[window].drawdown))
      .filter(r => mode === 'cheap' ? r.price <= ceiling : r.windows[window].drawdown <= -minimum && (mode !== 'recovery' || r.week > 0 && r.month < 0))
      .map(r => {
        const stats = r.windows[window], risks = [];
        if (stats.drawdown <= -50) risks.push('Ha perso almeno metà del valore rispetto al massimo osservato.');
        if (r.price < 5) risks.push('Prezzo sotto 5 USD: verifica liquidità, eventuali aumenti di capitale e rischio di delisting.');
        if (r.volatility >= 5) risks.push('Oscillazioni giornaliere elevate nelle ultime 20 variazioni disponibili.');
        if (r.dollarVolume === null || r.dollarVolume === undefined) risks.push('Volumi insufficienti per valutare la facilità di acquisto e vendita.');
        else if (r.dollarVolume < 1_000_000) risks.push('Scambi medi contenuti: verifica spread e liquidità nel broker.');
        if (r.week < 0 && r.month < 0) risks.push('Il prezzo continua a scendere sia sulla settimana sia sul mese.');
        if (!risks.length) risks.push('I prezzi da soli non permettono di valutare bilanci, debiti e prospettive.');
        return {...r,stats,risks,owned:owned.has(identity(r.symbol)),recoveryToHigh:(stats.high/r.price-1)*100,otherSector:!!options.dominant && !!r.group && r.group !== 'Altro' && r.group !== options.dominant};
      });
    return matches.sort((a,b) => (options.diversify ? Number(b.otherSector)-Number(a.otherSector) : 0) || (mode === 'cheap' ? a.price-b.price : mode === 'recovery' ? b.week-a.week : a.stats.drawdown-b.stats.drawdown) || a.symbol.localeCompare(b.symbol));
  }
  const api = { performance, ledger, scenario, signals, screenIdeas };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FormaResearch = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
