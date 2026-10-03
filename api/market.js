const { get, put } = require('@vercel/blob');
const { performance } = require('../research.js');
const SYMBOL = /^[A-Z0-9][A-Z0-9.:-]{0,19}$/;
const PATH = 'forma/market-radar-v1.json';
const TTL = 60 * 60 * 1000;
let memory = { rows: {}, attempted: {} }, lastRequest = 0, pending = null;

async function readCache() {
  if (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN) return memory;
  try {
    const result = await get(PATH, { access: 'private', useCache: false });
    if (result?.statusCode === 200) {
      const data = JSON.parse(await new Response(result.stream).text());
      if (data.rows && data.attempted) return { ...data, revision: result.blob.etag };
    }
  } catch (_) { /* Local cache still works if storage is unavailable. */ }
  return memory;
}
async function writeCache(cache) {
  memory = cache;
  if (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN) return;
  const { revision, ...data } = cache;
  try {
    const options = { access: 'private', addRandomSuffix: false, contentType: 'application/json', cacheControlMaxAge: 60 };
    if (revision) { options.allowOverwrite = true; options.ifMatch = revision; }
    await put(PATH, JSON.stringify(data), options);
  } catch (_) { /* A simultaneous refresh must not overwrite newer data. */ }
}
async function update(cache, symbols, key) {
  const now = Date.now();
  const due = symbols.filter(s => now - (cache.rows[s]?.fetchedAt || 0) >= TTL && now - (cache.attempted[s] || 0) >= 65_000).slice(0, 6);
  if (!due.length || now - Math.max(lastRequest, cache.lastRequest || 0) < 65_000) return cache;
  lastRequest = now; cache.lastRequest = now;
  due.forEach(s => { cache.attempted[s] = now; });
  try {
    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(due.join(','))}&interval=1day&outputsize=32&adjust=splits`;
    const response = await fetch(url, { headers: { Authorization: `apikey ${key}` }, signal: AbortSignal.timeout(15000) });
    const data = await response.json();
    if (!response.ok || data.status === 'error') {
      const rateLimited = response.status === 429 || Number(data.code) === 429;
      cache.error = rateLimited ? 'Quota Twelve Data raggiunta. Il radar riprova tra un minuto.' : 'Twelve Data non ha restituito le serie storiche. Controlla il piano e la chiave.';
      if (!rateLimited) due.forEach(s => { cache.attempted[s] = now + 15 * 60_000; });
    } else {
      delete cache.error;
      for (const symbol of due) {
        const source = due.length === 1 ? data : data[symbol];
        const result = performance(source?.values);
        if (result) cache.rows[symbol] = { symbol, name: String(source.meta?.symbol || symbol), currency: String(source.meta?.currency || ''),
          exchange: String(source.meta?.exchange || ''), ...result, fetchedAt: now };
        else {
          const rateLimited = Number(source?.code) === 429;
          cache.attempted[symbol] = rateLimited ? now : now + 15 * 60_000;
          cache.errors ||= {}; cache.errors[symbol] = rateLimited ? 'Quota raggiunta; nuovo tentativo tra un minuto.' : 'Serie non disponibile con il piano attuale o simbolo non valido.';
          if (rateLimited) cache.error = 'Quota Twelve Data raggiunta. Il radar riprova tra un minuto.';
        }
        if (result && cache.errors) delete cache.errors[symbol];
      }
    }
  } catch (_) { cache.error = 'Connessione a Twelve Data non riuscita. Gli ultimi dati disponibili sono conservati.'; }
  await writeCache(cache);
  return cache;
}
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Metodo non supportato.' });
  const symbols = [...new Set(String(req.query.symbols || '').toUpperCase().split(',').map(s => s.trim()).filter(Boolean))];
  if (!symbols.length || symbols.length > 40 || symbols.some(s => !SYMBOL.test(s))) return res.status(400).json({ error: 'Il radar accetta da 1 a 40 ticker validi.' });
  const key = process.env.TWELVEDATA_API_KEY;
  if (!key) return res.status(503).json({ error: 'Chiave Twelve Data non configurata.' });
  let cache = await readCache();
  if (!pending) pending = update(cache, symbols, key).finally(() => { pending = null; });
  cache = await pending;
  const rows = symbols.map(s => cache.rows[s]).filter(Boolean);
  const complete = rows.length === symbols.length && rows.every(r => Date.now() - r.fetchedAt < TTL);
  const now = Date.now();
  const nextDue = Math.min(...symbols.map(s => Math.max((cache.rows[s]?.fetchedAt || 0) + TTL, (cache.attempted[s] || 0) + 65_000)));
  const retryAfter = Math.min(600, Math.max(65, Math.ceil((Math.max(nextDue, (cache.lastRequest || 0) + 65_000) - now) / 1000)));
  return res.status(200).json({ rows, total: symbols.length, complete, error: cache.error || null,
    errors: symbols.filter(s => cache.errors?.[s]).map(s => ({ symbol: s, message: cache.errors[s] })),
    retryAfter, source: 'Twelve Data', scope: 'tracked', fetchedAt: new Date().toISOString() });
};
