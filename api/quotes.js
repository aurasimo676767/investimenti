const SYMBOL = /^[A-Z0-9][A-Z0-9.:-]{0,19}$/;
const positive = value => { const n = Number(value); return Number.isFinite(n) && n > 0 ? n : null; };

async function provider(path, key) {
  const response = await fetch(`https://api.twelvedata.com${path}`, {
    headers: { Authorization: `apikey ${key}` },
    signal: AbortSignal.timeout(10000)
  });
  const data = await response.json();
  if (!response.ok || data.status === 'error') throw Error(data.message || `Twelve Data HTTP ${response.status}`);
  return data;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Metodo non supportato.' });
  const key = process.env.TWELVEDATA_API_KEY;
  if (!key) return res.status(503).json({ error: 'Chiave Twelve Data non configurata su Vercel.' });
  const raw = String(req.query.symbols || '').toUpperCase();
  const symbols = [...new Set(raw.split(',').map(s => s.trim()).filter(Boolean))];
  if (!symbols.length || symbols.length > 7 || symbols.some(s => !SYMBOL.test(s))) {
    return res.status(400).json({ error: 'Inserisci da 1 a 7 simboli di mercato validi.' });
  }
  try {
    const data = await provider(`/quote?symbol=${encodeURIComponent(symbols.join(','))}`, key);
    const rows = symbols.length === 1 ? { [symbols[0]]: data } : data;
    const valid = [], errors = [];
    for (const symbol of symbols) {
      const quote = rows[symbol];
      const price = positive(quote?.close);
      const currency = String(quote?.currency || '').toUpperCase();
      if (!price || !['EUR', 'USD'].includes(currency)) {
        errors.push(`${symbol}: quotazione non disponibile o valuta non supportata`);
        continue;
      }
      valid.push({ symbol, price, currency, exchange: String(quote.exchange || ''),
        asOf: Number(quote.last_quote_at || quote.timestamp) || null });
    }
    let fxRate = null;
    if (valid.some(q => q.currency === 'USD')) {
      const fx = await provider('/exchange_rate?symbol=USD%2FEUR', key);
      fxRate = positive(fx.rate);
      if (!fxRate) throw Error('Cambio USD/EUR non disponibile.');
    }
    const quotes = valid.map(q => ({ ...q, priceEur: q.currency === 'USD' ? q.price * fxRate : q.price,
      fxRate: q.currency === 'USD' ? fxRate : null }));
    return res.status(200).json({ quotes, errors, fetchedAt: new Date().toISOString() });
  } catch (error) {
    const message = String(error.message || 'Servizio quotazioni non disponibile');
    return res.status(502).json({ error: message.slice(0, 180) });
  }
};
