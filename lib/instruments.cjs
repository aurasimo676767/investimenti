const VALID_KEY = /^[A-Z0-9][A-Z0-9._:-]{0,63}$/;
function parseInstrument(key) {
  if (!VALID_KEY.test(key)) throw Error('Identificativo strumento non valido.');
  const mic = key.match(/^([^:]+)::([A-Z0-9]{4})$/);
  if (mic) return { symbol: mic[1], mic_code: mic[2] };
  const venue = key.match(/^([^:]+):([^:]+)$/);
  if (venue) return { symbol: venue[1], exchange: venue[2] };
  if (key.includes(':')) throw Error('Sede di negoziazione non valida.');
  return { symbol: key };
}
function instrumentPath(endpoint, key, params = {}) {
  return `/${endpoint}?${new URLSearchParams({ ...parseInstrument(key), ...params })}`;
}
function normalizeInstrument(row, fallbackKind = 'stocks') {
  const symbol = String(row.symbol || '').trim().toUpperCase();
  const exchange = String(row.exchange || '').trim();
  const mic = String(row.mic_code || '').trim().toUpperCase();
  const type = String(row.instrument_type || row.type || (fallbackKind === 'etfs' ? 'ETF' : 'Common Stock'));
  const kind = /ETF|Exchange.Traded Fund/i.test(type) ? 'etfs' : /stock|receipt|REIT|warrant|right|unit|limited partnership/i.test(type) ? 'stocks' : 'other';
  const key = /^[A-Z0-9]{4}$/.test(mic) ? `${symbol}::${mic}` : /^[A-Z0-9._-]+$/i.test(exchange) ? `${symbol}:${exchange.toUpperCase()}` : symbol;
  return { key, symbol, name: String(row.instrument_name || row.name || symbol), exchange, mic, country: String(row.country || ''),
    currency: String(row.currency || ''), type, kind, plan: String(row.access?.plan || ''), trackable: VALID_KEY.test(key) };
}
module.exports = { VALID_KEY, parseInstrument, instrumentPath, normalizeInstrument };
