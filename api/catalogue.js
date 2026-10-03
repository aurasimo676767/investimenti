const { get, put } = require('@vercel/blob');
const { createHash } = require('node:crypto');
const { normalizeInstrument } = require('../lib/instruments.cjs');
const memory = new Map(), pending = new Map();
const PAGE_SIZE = 30;
const US = 'United States';
const primaryMics = new Set(['XNGS','XNMS','XNCM','XNAS','XNYS','XASE','ARCX','BATS','XCBO']);
const aliases = { spacex: 'Space Exploration Technologies', google: 'Alphabet', facebook: 'Meta Platforms' };
const compact = value => String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
function principalRows(raw, kind, query = '') {
  const term = compact(query), expanded = compact(aliases[term] || query);
  const score = row => (compact(row.symbol) === term ? 1000 : 0) + (compact(row.name) === expanded ? 900 : compact(row.name).startsWith(expanded) ? 700 : compact(row.name).includes(expanded) ? 500 : 0);
  const selected = new Map();
  for (const row of raw.map(r => normalizeInstrument(r, kind))) {
    if (row.kind !== kind || row.country !== US || !(primaryMics.has(row.mic) || !row.mic && /^(NASDAQ|NYSE|NYSE American|NYSE ARCA|CBOE|BATS)$/i.test(row.exchange))) continue;
    const previous = selected.get(row.symbol);
    if (!previous || row.mic !== 'BATS' && previous.mic === 'BATS') selected.set(row.symbol, row);
  }
  return [...selected.values()].sort((a,b) => query ? score(b) - score(a) || a.name.localeCompare(b.name) : a.symbol.localeCompare(b.symbol));
}
async function cached(id, loader, ttl) {
  const previous = memory.get(id);
  if (previous && Date.now() - previous.at < ttl) return previous.data;
  if (pending.has(id)) return pending.get(id);
  const job = (async () => {
    const pathname = `forma/catalogue-v1/${createHash('sha256').update(id).digest('hex').slice(0, 24)}.json`;
    let revision = null;
    const storage = process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN;
    if (storage) {
      try {
        const blob = await get(pathname, { access: 'private', useCache: false });
        if (blob?.statusCode === 200) {
          const cache = JSON.parse(await new Response(blob.stream).text());
          revision = blob.blob.etag;
          if (cache?.data && Date.now() - cache.at < ttl) { memory.set(id, cache); return cache.data; }
        }
      } catch (_) {}
    }
    const data = await loader(), record = { at: Date.now(), data };
    if (memory.size >= 100) memory.delete(memory.keys().next().value);
    memory.set(id, record);
    if (storage) {
      try {
        const options = { access: 'private', addRandomSuffix: false, contentType: 'application/json', cacheControlMaxAge: 60 };
        if (revision) { options.allowOverwrite = true; options.ifMatch = revision; }
        await put(pathname, JSON.stringify(record), options);
      } catch (_) {}
    }
    return data;
  })().finally(() => pending.delete(id));
  pending.set(id, job); return job;
}
async function provider(path, key) {
  const response = await fetch(`https://api.twelvedata.com${path}`, { headers: { Authorization: `apikey ${key}` }, signal: AbortSignal.timeout(15000) });
  const data = await response.json();
  if (!response.ok || data.status === 'error') { const error = Error(Number(data.code) === 429 || response.status === 429 ? 'Quota raggiunta. Riprova tra un minuto.' : 'Il catalogo Twelve Data non è disponibile. Controlla la chiave e riprova.'); error.code = Number(data.code) || response.status; throw error; }
  return data;
}
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'private, no-store'); res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Metodo non supportato.' });
  const key = process.env.TWELVEDATA_API_KEY;
  if (!key) return res.status(503).json({ error: 'Chiave Twelve Data non configurata.' });
  const query = String(req.query.q || '').trim(), kind = String(req.query.kind || 'stocks');
  const country = US, exchange = String(req.query.exchange || '').trim();
  const page = Number(req.query.page || 1);
  if (!['stocks','etfs'].includes(kind) || !Number.isInteger(page) || page < 1 || page > 100000 || query.length > 80 || country.length > 60 || exchange.length > 40 || /[\u0000-\u001f]/.test(query + country + exchange)) return res.status(400).json({ error: 'Filtri del catalogo non validi.' });
  try {
    if (req.query.mode === 'filters') {
      const data = await cached('exchanges', async () => {
        const source = await provider('/exchanges', key);
        const exchanges = (source.data || []).map(e => ({ name: String(e.name || ''), title: String(e.title || e.name || ''), country: String(e.country || '') })).filter(e => e.name);
        return { exchanges, countries: [...new Set(exchanges.map(e => e.country).filter(Boolean))].sort(), fetchedAt: new Date().toISOString() };
      }, 24 * 60 * 60_000);
      return res.status(200).json(data);
    }
    const id = JSON.stringify({ version: 'us-primary-v2', query: query.toLowerCase(), kind, country, exchange, page });
    const data = await cached(id, async () => {
      if (query) {
        const search = aliases[compact(query)] || query;
        const source = await provider(`/symbol_search?${new URLSearchParams({ symbol: search, outputsize: '120', show_plan: 'true' })}`, key);
        const raw = source.data || source.result?.list || [];
        const matches = principalRows(raw, kind, query).filter(r => !exchange || r.exchange.toLowerCase() === exchange.toLowerCase());
        return { rows: matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total: matches.length, page, pageSize: PAGE_SIZE, hasMore: matches.length > page * PAGE_SIZE,
          capped: raw.length >= 120, search: true, fetchedAt: new Date().toISOString(), source: 'Twelve Data' };
      }
      const params = new URLSearchParams({ page: String(page), outputsize: String(PAGE_SIZE), show_plan: 'true', include_delisted: 'false' });
      if (country) params.set('country', country); if (exchange) params.set('exchange', exchange);
      const source = await provider(`/${kind === 'etfs' ? 'etfs' : 'stocks'}?${params}`, key);
      const raw = source.result?.list || source.data || [];
      const count = Number(source.result?.count ?? source.count);
      const total = Number.isFinite(count) && count >= 0 ? count : null;
      return { rows: principalRows(raw, kind), total, countIsListings: true, page, pageSize: PAGE_SIZE,
        hasMore: total === null ? raw.length === PAGE_SIZE : page * PAGE_SIZE < total, capped: false, search: false, fetchedAt: new Date().toISOString(), source: 'Twelve Data' };
    }, query ? 10 * 60_000 : 24 * 60 * 60_000);
    return res.status(200).json(data);
  } catch (error) { return res.status(error.code === 429 ? 429 : 502).json({ error: error.message || 'Catalogo non disponibile.' }); }
};
