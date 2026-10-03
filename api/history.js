const { get, put } = require('@vercel/blob');
const { createHash } = require('node:crypto');
const { parseInstrument, instrumentPath } = require('../lib/instruments.cjs');
const cache = new Map(), pending = new Map(), TTL = 60 * 60_000;
function normalize(values) {
  const rows = new Map();
  for (const r of values || []) {
    const time = String(r.datetime || '').slice(0, 10);
    const open = Number(r.open), high = Number(r.high), low = Number(r.low), close = Number(r.close);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(time) || ![open,high,low,close].every(n => Number.isFinite(n) && n > 0) || high < Math.max(open,close) || low > Math.min(open,close) || low > high) continue;
    const volume = r.volume === undefined || r.volume === null || r.volume === '' ? null : Number(r.volume);
    rows.set(time, { time, open, high, low, close, volume: Number.isFinite(volume) && volume >= 0 ? volume : null });
  }
  return [...rows.values()].sort((a,b) => a.time.localeCompare(b.time));
}
async function history(key, apiKey) {
  const previous = cache.get(key);
  if (previous && Date.now() - Date.parse(previous.fetchedAt) < TTL) return previous;
  if (pending.has(key)) return pending.get(key);
  const job = (async () => {
    const path = `forma/charts-v1/${createHash('sha256').update(key).digest('hex').slice(0,24)}.json`;
    const storage = process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN;
    let etag;
    if (storage) try {
      const blob = await get(path, { access: 'private', useCache: false });
      if (blob?.statusCode === 200) {
        etag = blob.blob.etag;
        const data = JSON.parse(await new Response(blob.stream).text());
        if (data.bars?.length && Date.now() - Date.parse(data.fetchedAt) < TTL) { cache.set(key, data); return data; }
      }
    } catch (_) {}
    const response = await fetch(`https://api.twelvedata.com${instrumentPath('time_series', key, { interval: '1day', outputsize: '300', adjust: 'splits' })}`, { headers: { Authorization: `apikey ${apiKey}` }, signal: AbortSignal.timeout(15000) });
    const source = await response.json();
    if (!response.ok || source.status === 'error') {
      const code = Number(source.code) || response.status;
      const error = Error(code === 429 ? 'Quota dei dati raggiunta. Riprova tra un minuto.' : code === 403 ? 'Lo storico di questa borsa non è incluso nel tuo piano Twelve Data.' : 'Storico non disponibile per questo titolo. Prova un altro titolo.'); error.code = code; throw error;
    }
    const bars = normalize(source.values);
    if (!bars.length) throw Error('Il provider non ha restituito sedute valide.');
    const data = { key, bars, currency: String(source.meta?.currency || ''), exchange: String(source.meta?.exchange || ''), fetchedAt: new Date().toISOString(), source: 'Twelve Data', interval: '1day', adjusted: 'splits' };
    if (cache.size >= 50) cache.delete(cache.keys().next().value);
    cache.set(key, data);
    if (storage) try { await put(path, JSON.stringify(data), { access: 'private', addRandomSuffix: false, contentType: 'application/json', ...(etag ? { allowOverwrite: true, ifMatch: etag } : {}) }); } catch (_) {}
    return data;
  })().finally(() => pending.delete(key));
  pending.set(key, job); return job;
}
module.exports = async (req,res) => {
  res.setHeader('Cache-Control','private, no-store'); res.setHeader('X-Content-Type-Options','nosniff');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Metodo non supportato.' });
  const key = String(req.query.key || '').toUpperCase();
  try { parseInstrument(key); } catch (_) { return res.status(400).json({ error: 'Seleziona un titolo valido.' }); }
  if (!process.env.TWELVEDATA_API_KEY) return res.status(503).json({ error: 'Collega Twelve Data nelle impostazioni del progetto per caricare il grafico.' });
  try { return res.status(200).json(await history(key,process.env.TWELVEDATA_API_KEY)); }
  catch (error) { return res.status(error.code === 429 ? 429 : error.code === 403 ? 403 : 502).json({ error: error.code || error.message?.startsWith('Il provider') ? error.message : 'Connessione allo storico non riuscita. Riprova.' }); }
};
