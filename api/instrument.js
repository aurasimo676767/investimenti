const { VALID_KEY, instrumentPath } = require('../lib/instruments.cjs');
const cache = new Map();
const number = value => value === null || value === undefined || value === '' || !Number.isFinite(Number(value)) ? null : Number(value);
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'private, no-store'); res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Metodo non supportato.' });
  const key = String(req.query.key || '').toUpperCase();
  if (!VALID_KEY.test(key)) return res.status(400).json({ error: 'Strumento non valido.' });
  const apiKey = process.env.TWELVEDATA_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Chiave Twelve Data non configurata.' });
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < 60_000) return res.status(200).json(cached.data);
  try {
    const response = await fetch(`https://api.twelvedata.com${instrumentPath('quote', key)}`, { headers: { Authorization: `apikey ${apiKey}` }, signal: AbortSignal.timeout(10000) });
    const data = await response.json();
    if (!response.ok || data.status === 'error') {
      const code = Number(data.code) || response.status;
      return res.status(code === 429 ? 429 : code === 403 ? 403 : 502).json({ error: code === 429 ? 'Quota raggiunta. Riprova tra un minuto.' : code === 403 ? 'Quotazione non inclusa nel tuo piano Twelve Data per questa sede.' : 'Quotazione non disponibile per questo strumento e questa sede.' });
    }
    const price = number(data.close);
    if (!(price > 0)) return res.status(502).json({ error: 'Il provider non ha restituito un prezzo valido.' });
    const result = { key, symbol: String(data.symbol || ''), name: String(data.name || ''), exchange: String(data.exchange || ''), currency: String(data.currency || ''), price,
      day: number(data.percent_change), asOf: number(data.timestamp || data.last_quote_at), datetime: String(data.datetime || ''), source: 'Twelve Data', fetchedAt: new Date().toISOString() };
    if (cache.size >= 100) cache.delete(cache.keys().next().value);
    cache.set(key, { at: Date.now(), data: result }); return res.status(200).json(result);
  } catch (_) { return res.status(502).json({ error: 'Connessione alle quotazioni non riuscita. Riprova.' }); }
};
