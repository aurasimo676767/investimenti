const catalogueAssets = new Map(), catalogueQuotes = new Map();
let catalogueData = null, catalogueBusy = false, catalogueError = '', catalogueFacets = { countries: [], exchanges: [] };
let catalogueQuery = '', catalogueKind = 'stocks', catalogueCountry = '', catalogueExchange = '', cataloguePage = 1;
let catalogueTimer, catalogueController, catalogueSerial = 0, catalogueLoaded = false, catalogueFiltersLoaded = false;
const catalogueCountryNames = { 'United States': 'Stati Uniti', 'United Kingdom': 'Regno Unito', Germany: 'Germania', France: 'Francia', Italy: 'Italia', Japan: 'Giappone', Canada: 'Canada', Australia: 'Australia', Switzerland: 'Svizzera', Spain: 'Spagna', Netherlands: 'Paesi Bassi', China: 'Cina', India: 'India', 'Hong Kong': 'Hong Kong' };
function catalogueAsset(key) { return catalogueAssets.get(key) || state.assets?.[key]; }
function rememberCatalogueAsset(key) { const asset = catalogueAsset(key); if (asset) { state.assets ||= {}; state.assets[key] = { ...asset }; } }
function catalogueOptions() {
  const countries = catalogueFacets.countries.length ? catalogueFacets.countries : Object.keys(catalogueCountryNames);
  const exchanges = catalogueFacets.exchanges.filter(e => !catalogueCountry || e.country === catalogueCountry);
  return { country: `<option value="">Tutti i paesi</option>${countries.map(c => `<option value="${esc(c)}" ${c === catalogueCountry ? 'selected' : ''}>${esc(catalogueCountryNames[c] || c)}</option>`).join('')}`,
    exchange: `<option value="">Tutte le borse</option>${exchanges.map(e => `<option value="${esc(e.name)}" ${e.name === catalogueExchange ? 'selected' : ''}>${esc(e.name)} · ${esc(catalogueCountryNames[e.country] || e.country)}</option>`).join('')}` };
}
function cataloguePanel() {
  const options = catalogueOptions();
  return `<section class="panel catalogue-panel" aria-label="Catalogo mondiale"><div class="catalogue-heading"><div><span class="section-kicker">Il catalogo del provider</span><h2>Il mondo, a portata di ricerca.</h2><p>Azioni ed ETF censiti da Twelve Data, con la loro sede di negoziazione.</p></div><span class="catalogue-globe">${icon('compass')}</span></div><div class="catalogue-controls"><label class="search-field catalogue-search">${icon('search')}<input id="catalogue-search" type="search" maxlength="80" value="${esc(catalogueQuery)}" placeholder="Cerca per nome o ticker, es. Apple, VWCE…" aria-label="Cerca nel catalogo mondiale" autocomplete="off"></label><div class="segmented" role="group" aria-label="Tipo di strumento"><button data-catalogue-kind="stocks" class="${catalogueKind === 'stocks' ? 'active' : ''}" aria-pressed="${catalogueKind === 'stocks'}">Azioni</button><button data-catalogue-kind="etfs" class="${catalogueKind === 'etfs' ? 'active' : ''}" aria-pressed="${catalogueKind === 'etfs'}">ETF</button></div></div><div class="catalogue-filters"><label for="catalogue-country">Paese<select id="catalogue-country">${options.country}</select></label><label for="catalogue-exchange">Borsa<select id="catalogue-exchange">${options.exchange}</select></label><button class="text-button" data-catalogue-reset>Ripristina filtri ${icon('refresh')}</button></div><div id="catalogue-results" aria-live="polite">${catalogueResults()}</div><p class="catalogue-note">La presenza nel catalogo non garantisce una quotazione nel tuo piano né la disponibilità su Trade Republic. Apri un titolo per richiedere il prezzo della sede selezionata.</p></section>`;
}
function catalogueResults() {
  if (catalogueBusy) return `<div class="catalogue-loading"><span class="scan-icon">${icon('compass')}</span><div><h3>Esplorando il catalogo…</h3><p>Carichiamo soltanto la pagina che stai cercando.</p></div><span class="loading-dots" aria-label="Caricamento"><i></i><i></i><i></i></span></div>`;
  if (catalogueError) return `<div class="catalogue-loading"><div><h3>Catalogo non disponibile</h3><p role="status">${esc(catalogueError)}</p></div><button class="button-secondary" data-catalogue-retry>Riprova ${icon('refresh')}</button></div>`;
  if (!catalogueData) return '<div class="catalogue-loading"><p>Apri il catalogo online per cercare azioni ed ETF.</p></div>';
  const rows = catalogueData.rows || [], total = catalogueData.total;
  const from = rows.length ? (cataloguePage - 1) * catalogueData.pageSize + 1 : 0, to = from ? from + rows.length - 1 : 0;
  return `<div class="catalogue-summary"><span>${Number.isFinite(total) ? `${amount(total)} ${catalogueData.search ? 'risultati della ricerca' : 'strumenti nel catalogo'}` : 'Catalogo Twelve Data'}${catalogueCountry ? ` · ${esc(catalogueCountryNames[catalogueCountry] || catalogueCountry)}` : ''}</span><span>${from}–${to}${Number.isFinite(total) ? ` di ${amount(total)}` : ''}</span></div>${rows.length ? `<div class="catalogue-table"><div class="catalogue-table-head"><span>Strumento e sede</span><span>Paese / valuta</span><span>Piano indicato</span><span></span></div>${rows.map(a => `<article class="catalogue-row"><button class="catalogue-instrument" data-catalogue-open="${esc(a.key)}" ${!a.trackable ? 'disabled' : ''}><span class="ticker-logo ${a.kind === 'etfs' ? 'mint' : 'blue'}">${esc(a.symbol.slice(0, 4))}</span><span><strong>${esc(a.name)}</strong><small>${esc(a.symbol)} · ${esc(a.exchange)}${a.mic ? ` / ${esc(a.mic)}` : ''}</small></span></button><div class="catalogue-location"><span>${esc(catalogueCountryNames[a.country] || a.country || '—')}</span><small>${esc(a.currency)} · ${a.kind === 'etfs' ? 'ETF' : 'Azione'}</small></div><span class="catalogue-plan ${a.plan === 'Basic' ? 'basic' : ''}">${esc(a.plan || 'Da verificare')}</span><button class="bookmark-button ${state.watchlist.includes(a.key) ? 'saved' : ''}" data-bookmark="${esc(a.key)}" aria-pressed="${state.watchlist.includes(a.key)}" aria-label="${state.watchlist.includes(a.key) ? 'Rimuovi dalla' : 'Aggiungi alla'} watchlist ${esc(a.name)} su ${esc(a.exchange)}" ${!a.trackable ? 'disabled' : ''}>${icon('bookmark')}</button></article>`).join('')}</div>` : '<div class="empty-state"><h3>Nessuno strumento trovato.</h3><p>Prova un altro nome, passa tra azioni ed ETF o rimuovi i filtri.</p></div>'}${catalogueData.capped ? '<p class="inline-warning">La ricerca del provider restituisce al massimo 120 corrispondenze. Usa un nome più preciso; per sfogliare tutto il catalogo cancella il testo e usa i filtri.</p>' : ''}<div class="catalogue-pagination"><button class="button-secondary" data-catalogue-page="${cataloguePage - 1}" ${cataloguePage <= 1 ? 'disabled' : ''}>Precedente</button><span>Pagina ${cataloguePage}</span><button class="button-secondary" data-catalogue-page="${cataloguePage + 1}" ${!catalogueData.hasMore ? 'disabled' : ''}>Successiva</button></div><div class="catalogue-source">Twelve Data · Elenco ${catalogueData.search ? 'cercato' : 'aggiornato'} il ${new Date(catalogueData.fetchedAt).toLocaleDateString('it-IT')} · Prezzi richiesti aprendo i dettagli</div>`;
}
function updateCatalogueResults() { if ($('#catalogue-results')) $('#catalogue-results').innerHTML = catalogueResults(); }
function updateCatalogueFilters() { const options = catalogueOptions(); if ($('#catalogue-country')) $('#catalogue-country').innerHTML = options.country; if ($('#catalogue-exchange')) $('#catalogue-exchange').innerHTML = options.exchange; }
async function loadCatalogueFilters() {
  if (catalogueFiltersLoaded || !window.location?.protocol?.startsWith('http')) return;
  catalogueFiltersLoaded = true;
  try {
    const response = await fetch('/api/catalogue?mode=filters'), data = await response.json();
    if (!response.ok) { catalogueFiltersLoaded = false; return; }
    catalogueFacets = data; updateCatalogueFilters();
  } catch (_) { catalogueFiltersLoaded = false; }
}
async function loadCatalogue() {
  if (!window.location?.protocol?.startsWith('http')) return;
  const serial = ++catalogueSerial;
  catalogueController?.abort(); catalogueController = new AbortController();
  catalogueBusy = true; catalogueError = ''; updateCatalogueResults();
  try {
    const params = new URLSearchParams({ q: catalogueQuery, kind: catalogueKind, country: catalogueCountry, exchange: catalogueExchange, page: String(cataloguePage) });
    const response = await fetch(`/api/catalogue?${params}`, { signal: catalogueController.signal, cache: 'no-store' });
    const data = await response.json();
    if (serial !== catalogueSerial) return;
    if (!response.ok) throw Error(data.error || 'Catalogo non disponibile.');
    catalogueData = data; catalogueLoaded = true;
    for (const asset of data.rows || []) catalogueAssets.set(asset.key, asset);
    if (catalogueAssets.size > 1000) { for (const key of catalogueAssets.keys()) { if (catalogueAssets.size <= 500) break; if (!state.assets?.[key]) catalogueAssets.delete(key); } }
  } catch (error) { if (serial === catalogueSerial && error.name !== 'AbortError') catalogueError = error.message || 'Connessione al catalogo non riuscita.'; }
  finally { if (serial === catalogueSerial) { catalogueBusy = false; updateCatalogueResults(); } }
}
function ensureCatalogue() { if (!catalogueLoaded && !catalogueBusy) loadCatalogue().then(loadCatalogueFilters); else loadCatalogueFilters(); }
function catalogueQuoteMarkup(quote) {
  const stamp = quote.asOf ? new Date(quote.asOf * 1000).toLocaleString('it-IT') : quote.datetime || 'Orario della quotazione non fornito';
  return `<div class="asset-quote"><span>${marketPrice(quote)}</span><small>${esc(stamp)} · ${esc(quote.currency)} · ${esc(quote.exchange)} · Twelve Data</small></div><div class="catalogue-day-change"><span>Variazione rispetto alla chiusura precedente</span><strong class="${tone(quote.day)}">${marketChange(quote.day)}</strong></div>`;
}
async function loadCatalogueQuote(key, force = false) {
  const el = $('#instrument-quote'); if (!el || $('.modal')?.dataset.instrumentKey !== key) return;
  const previous = catalogueQuotes.get(key);
  if (!force && previous && Date.now() - Date.parse(previous.fetchedAt) < 60_000) { el.innerHTML = catalogueQuoteMarkup(previous); return; }
  el.innerHTML = '<div class="instrument-price-loading">Richiesta della quotazione alla sede selezionata…</div>';
  try {
    const response = await fetch(`/api/instrument?key=${encodeURIComponent(key)}`, { cache: 'no-store' }), data = await response.json();
    if (!response.ok) throw Error(data.error || 'Quotazione non disponibile.');
    catalogueQuotes.set(key, data);
    if ($('.modal')?.dataset.instrumentKey === key && $('#instrument-quote')) $('#instrument-quote').innerHTML = catalogueQuoteMarkup(data);
  } catch (error) { if ($('.modal')?.dataset.instrumentKey === key && $('#instrument-quote')) $('#instrument-quote').innerHTML = `<div class="instrument-price-error" role="status">${esc(error.message)}<p>Il titolo resta consultabile nel catalogo. La disponibilità dei prezzi dipende dal piano e dalla borsa.</p><button class="button-secondary" data-catalogue-quote="${esc(key)}">Riprova</button></div>`; }
}
function openCatalogueAsset(key) {
  const asset = catalogueAsset(key); if (!asset) { assetModal(key); return; }
  const c = company(key), tracked = radarSymbols().includes(key), owned = holdings();
  modal(esc(asset.name), `${esc(asset.symbol)} · ${esc(asset.exchange)}${asset.mic ? ` / ${esc(asset.mic)}` : ''}`, `<div class="instrument-facts"><span>${esc(catalogueCountryNames[asset.country] || asset.country)}</span><span>${esc(asset.currency)}</span><span>${asset.kind === 'etfs' ? 'ETF' : esc(asset.type)}</span>${asset.plan ? `<span>Piano indicato: ${esc(asset.plan)}</span>` : ''}</div><div id="instrument-quote"></div><p class="asset-description">${esc(c.description)}</p><div class="research-checklist"><h3>La sede fa la differenza.</h3><p>Controlla valuta, borsa, orario e disponibilità nel tuo broker. Per gli ETF leggi anche KID, costi, replica e politica dei dividendi.</p></div><div class="form-actions asset-actions"><button class="button-primary" data-bookmark="${esc(key)}">${state.watchlist.includes(key) ? 'Rimuovi dalla watchlist' : 'Segui strumento'} ${icon('bookmark')}</button><button class="button-secondary" data-catalogue-radar="${esc(key)}" ${tracked ? 'disabled' : ''}>${tracked ? 'Nel radar' : 'Aggiungi al radar'} ${icon('compass')}</button><button class="button-subtle" data-alert-symbol="${esc(key)}">Obiettivo ${icon('bell')}</button>${c.url ? `<a class="button-subtle" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">Fonti ufficiali ${icon('arrow')}</a>` : ''}</div>${owned.length ? `<form id="catalogue-link-form" data-key="${esc(key)}" class="catalogue-link-form"><div class="form-field"><label for="catalogue-position">Collega questa quotazione a una posizione importata</label><select id="catalogue-position" name="isin">${owned.map(h => `<option value="${esc(h.ticker)}">${esc(h.name)} · ${esc(h.ticker)}</option>`).join('')}</select></div><button class="button-secondary" type="submit">Associa alla posizione</button><p class="form-hint">Seleziona solo la posizione che corrisponde a questo strumento. I prezzi del portafoglio supportano EUR e USD; altre valute richiedono un prezzo manuale in EUR.</p></form>` : ''}<p class="form-hint">Catalogo Twelve Data. La disponibilità su Trade Republic va verificata nel broker. Il prezzo viene richiesto all’apertura, non per tutte le righe del catalogo.</p>`);
  $('.modal').dataset.instrumentKey = key; loadCatalogueQuote(key);
}
document.addEventListener('input', event => {
  if (event.target.id !== 'catalogue-search') return;
  catalogueQuery = event.target.value.trim(); cataloguePage = 1;
  clearTimeout(catalogueTimer); catalogueController?.abort(); catalogueSerial++;
  catalogueTimer = setTimeout(loadCatalogue, 350);
});
document.addEventListener('change', event => {
  if (event.target.id === 'catalogue-country') { catalogueCountry = event.target.value; catalogueExchange = ''; cataloguePage = 1; updateCatalogueFilters(); loadCatalogue(); }
  if (event.target.id === 'catalogue-exchange') { catalogueExchange = event.target.value; cataloguePage = 1; loadCatalogue(); }
});
document.addEventListener('click', event => {
  const open = event.target.closest('[data-catalogue-open]'); if (open) { openCatalogueAsset(open.dataset.catalogueOpen); return; }
  const kind = event.target.closest('[data-catalogue-kind]'); if (kind) { catalogueKind = kind.dataset.catalogueKind; cataloguePage = 1; document.querySelectorAll('[data-catalogue-kind]').forEach(b => { const active = b.dataset.catalogueKind === catalogueKind; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); }); loadCatalogue(); return; }
  const page = event.target.closest('[data-catalogue-page]'); if (page && !page.disabled) { cataloguePage = Number(page.dataset.cataloguePage); loadCatalogue(); $('#catalogue-results')?.scrollIntoView?.({ block: 'start', behavior: 'smooth' }); return; }
  const quote = event.target.closest('[data-catalogue-quote]'); if (quote) { loadCatalogueQuote(quote.dataset.catalogueQuote, true); return; }
  const radar = event.target.closest('[data-catalogue-radar]'); if (radar) {
    const key = radar.dataset.catalogueRadar;
    if (radarSymbols().length >= 40) { toast('Il radar è pieno. Rimuovi un ticker prima di aggiungerne un altro.'); return; }
    rememberCatalogueAsset(key); state.radarSymbols = [...new Set([...(state.radarSymbols || DEFAULT_RADAR), key])]; save(); radar.disabled = true; radar.textContent = 'Nel radar'; marketNext = 0; fetchMarket(); toast('Strumento aggiunto al radar.'); return;
  }
  if (event.target.closest('[data-catalogue-retry]')) loadCatalogue().then(loadCatalogueFilters);
  if (event.target.closest('[data-catalogue-reset]')) { catalogueQuery = ''; catalogueCountry = ''; catalogueExchange = ''; cataloguePage = 1; $('#catalogue-search').value = ''; updateCatalogueFilters(); loadCatalogue(); }
});
document.addEventListener('submit', event => {
  if (event.target.id !== 'catalogue-link-form') return;
  event.preventDefault();
  const key = event.target.dataset.key, isin = String(new FormData(event.target).get('isin') || '');
  if (!holdings().some(h => h.ticker === isin)) return;
  if (!confirm('Associare questa sede di negoziazione alla posizione selezionata? Controlla che lo strumento corrisponda.')) return;
  rememberCatalogueAsset(key); state.symbols ||= {}; state.symbols[isin] = key;
  if (state.quoteMeta) delete state.quoteMeta[isin]; if (state.prices) delete state.prices[isin];
  save(); closeModal(); go('settings'); refreshQuotes([[isin, key]]);
});
