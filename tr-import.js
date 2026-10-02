// Trade Republic's transaction export is processed entirely in the browser.
(function (root) {
  const required = ['datetime', 'date', 'category', 'type', 'asset_class', 'name', 'symbol', 'shares', 'price', 'fee', 'currency', 'transaction_id'];
  const number = value => {
    const raw = String(value ?? '').trim();
    if (!raw) return NaN;
    const normalized = raw.replace(/\s/g, '').replace(/,/g, '.');
    return /^[-+]?\d+(?:\.\d+)?$/.test(normalized) ? Number(normalized) : NaN;
  };

  function isTradeRepublicExport(headers) {
    const present = new Set(headers.map(h => h.trim().toLowerCase()));
    return required.every(h => present.has(h));
  }

  function parseTradeRepublicRows(rows) {
    if (!rows.length || !isTradeRepublicExport(rows[0])) throw Error('Il file non ha le colonne richieste dall’esportazione Trade Republic.');
    const header = rows[0].map(h => h.trim().toLowerCase());
    const at = (row, key) => String(row[header.indexOf(key)] ?? '').trim();
    const transactions = [], errors = [];
    let skippedCash = 0;
    const ids = new Set();
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const category = at(row, 'category').toUpperCase();
      if (category === 'CASH') { skippedCash++; continue; }
      if (category !== 'TRADING') { errors.push(`Riga ${i + 1}: categoria non riconosciuta`); continue; }
      const side = at(row, 'type').toUpperCase();
      const asset = at(row, 'asset_class').toUpperCase();
      const date = at(row, 'date');
      const executedAt = at(row, 'datetime');
      const symbol = at(row, 'symbol').toUpperCase();
      const shares = number(at(row, 'shares'));
      const price = number(at(row, 'price'));
      const rawFee = at(row, 'fee');
      const fee = rawFee ? number(rawFee) : 0;
      const currency = at(row, 'currency').toUpperCase();
      const sourceId = at(row, 'transaction_id');
      if (!['BUY', 'SELL'].includes(side) || !['STOCK', 'FUND'].includes(asset) ||
          !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{4}-\d{2}-\d{2}T/.test(executedAt) ||
          !/^[A-Z]{2}[A-Z0-9]{10}$/.test(symbol) || !Number.isFinite(shares) || !shares ||
          (side === 'BUY' && shares <= 0) || (side === 'SELL' && shares >= 0) ||
          !Number.isFinite(price) || price <= 0 || !Number.isFinite(fee) || currency !== 'EUR' || !sourceId) {
        errors.push(`Riga ${i + 1}: operazione non valida o non supportata`);
        continue;
      }
      if (ids.has(sourceId)) { errors.push(`Riga ${i + 1}: ID operazione duplicato`); continue; }
      ids.add(sourceId);
      transactions.push({ id: `tr:${sourceId}`, source: 'trade-republic', date, executedAt,
        side: side.toLowerCase(), ticker: symbol, name: at(row, 'name') || symbol,
        quantity: Math.abs(shares), price, fees: Math.abs(fee) });
    }
    transactions.sort((a, b) => a.executedAt.localeCompare(b.executedAt));
    return { transactions, skippedCash, errors };
  }

  root.TradeRepublicImport = { isTradeRepublicExport, parseTradeRepublicRows };
  if (typeof module !== 'undefined') module.exports = root.TradeRepublicImport;
})(typeof window === 'undefined' ? globalThis : window);
