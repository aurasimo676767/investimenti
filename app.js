const STORE_KEY = 'forma-invest-v1';
const DEMO = {
  demo: true,
  hidden: false,
  prices: { IREN: 40.8, MSFT: 430, ASML: 790 },
  watchlist: ['IREN', 'TSM'],
  notes: { IREN: 'Seguo la crescita della capacità AI e il fabbisogno di capitale. Da rivedere dopo i prossimi risultati.', TSM: 'Osservare domanda di chip avanzati, investimenti e margini.' },
  transactions: [
    { id: 'demo-1', date: '2026-02-18', side: 'buy', ticker: 'IREN', name: 'IREN Limited', quantity: 46, price: 29.3, fees: 1 },
    { id: 'demo-2', date: '2026-01-13', side: 'buy', ticker: 'MSFT', name: 'Microsoft', quantity: 6, price: 390, fees: 1 },
    { id: 'demo-3', date: '2026-03-09', side: 'buy', ticker: 'ASML', name: 'ASML Holding', quantity: 4, price: 720, fees: 1 }
  ]
};
const COMPANIES = [
  { ticker: 'IREN', name: 'IREN Limited', exchange: 'NASDAQ', sector: 'Infrastruttura AI', group: 'Tecnologia', hue: 'rose', description: 'Data center, capacità di calcolo AI e attività legate al Bitcoin. Un caso da leggere insieme al suo fabbisogno di capitale.', url: 'https://iren.com/investor/annual-reports' },
  { ticker: 'ASML', name: 'ASML Holding', exchange: 'NASDAQ / AMS', sector: 'Semiconduttori', group: 'Tecnologia', hue: 'blue', description: 'Tecnologie di litografia per la produzione di chip. Studia ordini, capacità produttiva e dipendenza dal ciclo dei semiconduttori.', url: 'https://www.asml.com/en/investors' },
  { ticker: 'MSFT', name: 'Microsoft', exchange: 'NASDAQ', sector: 'Software e cloud', group: 'Tecnologia', hue: 'blue', description: 'Software, cloud e servizi AI. Guarda crescita dei segmenti, spese in infrastruttura e flussi di cassa.', url: 'https://www.microsoft.com/en-us/Investor/' },
  { ticker: 'TSM', name: 'TSMC', exchange: 'NYSE', sector: 'Semiconduttori', group: 'Tecnologia', hue: 'gold', description: 'Produzione avanzata di semiconduttori. Segui capacità, clienti, margini e investimenti.', url: 'https://investor.tsmc.com/english' },
  { ticker: 'MELI', name: 'MercadoLibre', exchange: 'NASDAQ', sector: 'Commerce e fintech', group: 'Consumi', hue: 'gold', description: 'Marketplace e servizi finanziari in America Latina. Studia crescita, qualità del credito e margini.', url: 'https://investor.mercadolibre.com/' },
  { ticker: 'MC', name: 'LVMH', exchange: 'EPA', sector: 'Lusso', group: 'Consumi', hue: 'rose', description: 'Marchi globali nel lusso. Osserva domanda geografica, margini e forza dei brand.', url: 'https://www.lvmh.com/investors/' }
];
const NAV = [
  { id: 'overview', label: 'Panoramica', icon: 'overview' },
  { id: 'discover', label: 'Scopri', icon: 'compass' },
  { id: 'watchlist', label: 'Watchlist', icon: 'bookmark' },
  { id: 'transactions', label: 'Movimenti', icon: 'activity' },
  { id: 'settings', label: 'Impostazioni', icon: 'settings' }
];
const PATHS = {
  overview: '<rect x="3" y="3" width="7" height="7" rx="1.3"/><rect x="14" y="3" width="7" height="7" rx="1.3"/><rect x="3" y="14" width="7" height="7" rx="1.3"/><rect x="14" y="14" width="7" height="7" rx="1.3"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8z"/>',
  bookmark: '<path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4z"/>',
  activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.5 12a7.5 7.5 0 0 0-.1-1.2l1.6-1.3-1.6-2.8-1.9.7a7.7 7.7 0 0 0-2.1-1.2L15 4h-3.2l-.4 2.2a7.7 7.7 0 0 0-2.1 1.2l-1.9-.7-1.6 2.8 1.6 1.3a7.5 7.5 0 0 0 0 2.4l-1.6 1.3 1.6 2.8 1.9-.7a7.7 7.7 0 0 0 2.1 1.2l.4 2.2H15l.4-2.2a7.7 7.7 0 0 0 2.1-1.2l1.9.7 1.6-2.8-1.6-1.3c.1-.4.1-.8.1-1.2z"/>',
  eye: '<path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.6"/>',
  eyeoff: '<path d="m3 3 18 18M10.7 6.1c.4-.1.8-.1 1.3-.1 6.1 0 9.5 6 9.5 6a15.8 15.8 0 0 1-3 3.4M6.2 6.9C3.8 8.6 2.5 12 2.5 12s3.4 6 9.5 6c1 0 2-.2 2.9-.5"/>',
  trend: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  wallet: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M16 14h2"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7M14 10v7"/>',
  upload: '<path d="M12 16V3m0 0-4 4m4-4 4 4M4 17v3h16v-3"/>',
  chart: '<path d="M4 19V5M4 19h16M7 15l4-5 3 3 5-7"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'
};
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name] || ''}</svg>`;
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const num = (value) => { const s = String(value ?? '').trim().replace(/[^\d,.-]/g, ''); if (!s) return NaN; const i = s.lastIndexOf(','), j = s.lastIndexOf('.'); return Number(i > j ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '')); };
const euro = (value, digits = 2) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value || 0);
const amount = (value) => new Intl.NumberFormat('it-IT', { maximumFractionDigits: 6 }).format(value || 0);
const percentage = (value) => `${value >= 0 ? '+' : ''}${new Intl.NumberFormat('it-IT', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(value || 0)}%`;
const money = (value, digits) => `<span class="${state.hidden ? 'hidden-value' : ''}">${euro(value, digits)}</span>`;
const day = (date) => { const d = new Date(`${date}T12:00:00`); return Number.isNaN(d.getTime()) ? date : new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }).format(d); };
const clone = value => JSON.parse(JSON.stringify(value));
function loadState() { try { const raw = JSON.parse(localStorage.getItem(STORE_KEY)); if (raw && Array.isArray(raw.transactions)) return { ...clone(DEMO), ...raw }; } catch (_) {} return clone(DEMO); }
let state = loadState();
let currentPage = 'overview';
let discoverFilter = 'Tutte';
let discoverSearch = '';
let importData = null;
let toastTimer;
function save() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3600); }
function company(ticker, fallback = '') { return COMPANIES.find(c => c.ticker === ticker) || { ticker, name: fallback || ticker, exchange: 'Titolo personale', sector: 'Altro', group: 'Altro', hue: '', description: '', url: '' }; }
function holdings() {
  const result = new Map();
  for (const t of [...state.transactions].sort((a, b) => a.date.localeCompare(b.date))) {
    const key = t.ticker.toUpperCase();
    const row = result.get(key) || { ticker: key, name: t.name || key, quantity: 0, cost: 0 };
    const q = Number(t.quantity), p = Number(t.price), fee = Number(t.fees) || 0;
    if (t.side === 'sell') { const avg = row.quantity > 0 ? row.cost / row.quantity : 0; const removed = Math.min(q, row.quantity); row.quantity -= removed; row.cost -= avg * removed; }
    else { row.quantity += q; row.cost += q * p + fee; }
    if (row.quantity < 1e-9) { row.quantity = 0; row.cost = 0; }
    if (t.name) row.name = t.name;
    result.set(key, row);
  }
  return [...result.values()].filter(h => h.quantity > 0).map(h => {
    const current = Number(state.prices[h.ticker]) || h.cost / h.quantity;
    const value = current * h.quantity;
    return { ...h, current, value, pnl: value - h.cost, change: h.cost ? ((value - h.cost) / h.cost) * 100 : 0 };
  }).sort((a, b) => b.value - a.value);
}
function portfolio() { const rows = holdings(); return { rows, invested: rows.reduce((n, h) => n + h.cost, 0), value: rows.reduce((n, h) => n + h.value, 0), pnl: rows.reduce((n, h) => n + h.pnl, 0) }; }
function renderNav() {
  const items = NAV.map(n => `<button type="button" class="nav-button ${currentPage === n.id ? 'active' : ''}" data-nav="${n.id}" ${currentPage === n.id ? 'aria-current="page"' : ''}>${icon(n.icon)}<span>${n.label}</span></button>`).join('');
  $('#desktop-nav').innerHTML = items;
  $('#mobile-nav').innerHTML = items;
  $('#breadcrumb').textContent = NAV.find(n => n.id === currentPage)?.label || '';
  $('#privacy-toggle').innerHTML = icon(state.hidden ? 'eyeoff' : 'eye');
  $('#privacy-toggle').setAttribute('aria-label', state.hidden ? 'Mostra importi' : 'Nascondi importi');
  $('#today-label').textContent = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
}
function demoBanner() { return state.demo ? `<div class="demo-banner"><span><strong>Anteprima</strong> · I numeri qui sotto sono illustrativi, non quotazioni aggiornate.</span><button type="button" data-action="clear-demo">Usa i miei dati</button></div>` : ''; }
function pageHeading(kicker, title, subtitle, action = '') { return `<div class="page-heading"><div class="heading-copy"><p class="eyebrow">${kicker}</p><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`; }
function holdingRow(h) { const c = company(h.ticker, h.name); return `<div class="holding-row"><div class="company-cell"><span class="ticker-logo ${c.hue}">${esc(h.ticker.slice(0, 3))}</span><span class="company-text"><strong>${esc(h.name)}</strong><small>${esc(h.ticker)} · ${amount(h.quantity)} azioni</small></span></div><span class="table-value">${money(h.value)}<small class="table-sub">${money(h.current)} / azione</small></span><span class="table-value">${money(h.cost)}</span><span class="table-value ${h.pnl >= 0 ? 'gain' : 'loss'}">${money(h.pnl)}<small class="table-sub">${percentage(h.change)}</small></span></div>`; }
function donutMarkup(rows, total) {
  if (!rows.length || !total) return `<div class="empty-state"><div class="empty-icon">${icon('chart')}</div><h3>Nessun titolo ancora</h3><p>Aggiungi il primo acquisto per vedere la composizione del portafoglio.</p></div>`;
  const colors = ['#2d695a', '#9fbea4', '#d1dcb0', '#e3eae0', '#b8cfbd', '#849f8c'];
  let from = 0;
  const stops = rows.map((h, i) => { const to = from + h.value / total * 100; const stop = `${colors[i % colors.length]} ${from}% ${to}%`; from = to; return stop; }).join(',');
  return `<div class="donut-layout"><div class="donut" style="background:conic-gradient(${stops})"><div class="donut-center"><strong>${rows.length}</strong><small>${rows.length === 1 ? 'titolo' : 'titoli'}</small></div></div><div class="allocation-list">${rows.slice(0, 5).map((h, i) => `<div class="allocation-item"><span><i class="legend-dot" style="background:${colors[i % colors.length]}"></i>${esc(h.ticker)}</span><strong>${Math.round(h.value / total * 100)}%</strong></div>`).join('')}</div></div>`;
}
function renderOverview() {
  const p = portfolio();
  const pct = p.invested ? p.pnl / p.invested * 100 : 0;
  const top = p.rows[0];
  const topShare = top && p.value ? top.value / p.value * 100 : 0;
  return `${pageHeading('Il tuo spazio investimenti', 'Una visione più chiara.', 'Segui quello che possiedi. Scopri quello che vale la pena studiare.', `<button class="text-button" data-nav="discover">Esplora aziende <span aria-hidden="true">↗</span></button>`)}${demoBanner()}
    <section class="dashboard-grid" aria-label="Riepilogo del portafoglio">
      <div class="hero-card ${state.demo ? 'demo-hero' : ''}"><div class="hero-overline">Valore attuale del portafoglio</div><div class="hero-value">${money(p.value)}</div><div class="hero-sub"><strong>${percentage(pct)}</strong><span>${p.pnl >= 0 ? 'Guadagno' : 'Perdita'} non realizzato · ${money(Math.abs(p.pnl))}</span></div><div class="hero-bottom"><p>I valori si basano sui prezzi che inserisci. Controllali prima di prendere decisioni.</p><svg class="sparkline" viewBox="0 0 280 83" aria-hidden="true"><defs><linearGradient id="sparkFade" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#b8dbb0" stop-opacity=".2"/><stop offset="1" stop-color="#b8dbb0" stop-opacity="0"/></linearGradient></defs><path class="fill" d="M0 65 C25 58 37 69 58 51 S88 58 108 39 S143 48 161 37 S190 46 207 25 S248 34 280 8 L280 83 L0 83Z"/><path class="line" d="M0 65 C25 58 37 69 58 51 S88 58 108 39 S143 48 161 37 S190 46 207 25 S248 34 280 8"/></svg></div></div>
      <div class="metric-stack"><div class="panel metric-card"><div class="metric-title"><span>Capitale investito</span><span class="metric-icon">${icon('wallet')}</span></div><div><div class="metric-number">${money(p.invested)}</div><div class="metric-detail">Costo delle posizioni aperte</div></div></div><div class="panel metric-card"><div class="metric-title"><span>Titoli in portafoglio</span><span class="metric-icon">${icon('trend')}</span></div><div><div class="metric-number">${p.rows.length}</div><div class="metric-detail">${p.rows.length ? `${esc(top.ticker)} è la posizione maggiore` : 'Aggiungi il primo movimento'}</div></div></div></div>
    </section>
    <div class="section-head"><div><h2>Le tue posizioni</h2><p>Prezzi aggiornati manualmente</p></div><button class="text-button" data-action="update-prices">Aggiorna prezzi <span aria-hidden="true">↗</span></button></div>
    <section class="overview-lower"><div class="panel holdings-panel">${p.rows.length ? `<div class="table-header"><span>Azienda</span><span>Valore</span><span>Investito</span><span>Risultato</span></div>${p.rows.map(holdingRow).join('')}` : `<div class="empty-state"><div class="empty-icon">${icon('wallet')}</div><h3>Il portafoglio parte da qui</h3><p>Inserisci un acquisto o importa un CSV per iniziare.</p><button class="button-primary" data-action="add">Aggiungi movimento</button></div>`}</div><div class="panel allocation-panel"><h3>Composizione</h3><p>Il peso di ogni titolo nel tuo portafoglio</p>${donutMarkup(p.rows, p.value)}</div></section>
    ${topShare > 45 ? `<div class="insight-strip">${icon('info')}<div><strong>${esc(top.ticker)} pesa il ${Math.round(topShare)}% del portafoglio</strong><p>Una posizione concentrata può influenzare molto il risultato complessivo. Tienila presente quando valuti nuove aziende.</p></div></div>` : ''}
    <p class="footnote">Forma è uno strumento personale di organizzazione e ricerca. I prezzi sono inseriti da te; i calcoli non includono imposte, cambio valuta e risultati già realizzati.</p>`;
}
function companyCard(c) { const saved = state.watchlist.includes(c.ticker); return `<article class="panel company-card"><div class="company-top"><span class="ticker-logo ${c.hue}">${esc(c.ticker.slice(0, 3))}</span><button type="button" class="bookmark-button ${saved ? 'saved' : ''}" data-bookmark="${esc(c.ticker)}" aria-label="${saved ? 'Rimuovi dalla' : 'Aggiungi alla'} watchlist: ${esc(c.name)}" aria-pressed="${saved}">${icon('bookmark')}</button></div><h3>${esc(c.name)}</h3><p class="ticker-meta">${esc(c.ticker)} · ${esc(c.exchange)}</p><p class="description">${esc(c.description)}</p><div class="company-card-bottom"><span class="sector-tag">${esc(c.sector)}</span><a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer" aria-label="Fonti ufficiali di ${esc(c.name)}">Fonti ufficiali ↗</a></div></article>`; }
function renderDiscover() {
  const filters = ['Tutte', 'Tecnologia', 'Consumi'];
  const found = COMPANIES.filter(c => (discoverFilter === 'Tutte' || c.group === discoverFilter) && (`${c.ticker} ${c.name} ${c.sector}`.toLowerCase().includes(discoverSearch.toLowerCase())));
  return `${pageHeading('Idee da approfondire', 'Scopri nuove aziende.', 'Una selezione per iniziare la ricerca, con domande da farsi e fonti ufficiali da leggere.')}<div class="toolbar"><label class="search-field">${icon('search')}<input id="company-search" type="search" placeholder="Cerca azienda o settore" value="${esc(discoverSearch)}" aria-label="Cerca azienda o settore"></label><div class="filter-row">${filters.map(f => `<button type="button" class="chip ${f === discoverFilter ? 'active' : ''}" data-filter="${f}">${f}</button>`).join('')}</div></div><div id="company-results" class="company-grid">${found.length ? found.map(companyCard).join('') : `<div class="panel empty-state"><h3>Nessun risultato</h3><p>Prova un nome o un settore diverso.</p></div>`}</div><div class="feature-note">Queste schede sono spunti di ricerca, non indicazioni di acquisto. Le descrizioni non sono dati di mercato in tempo reale: apri sempre le fonti ufficiali e valuta i rischi.</div>`;
}
function watchCard(c) { return `<article class="panel watch-card"><span class="ticker-logo ${c.hue}">${esc(c.ticker.slice(0, 3))}</span><div class="watch-card-content"><div class="watch-card-header"><div><h3>${esc(c.name)}</h3><small>${esc(c.ticker)} · ${esc(c.sector)}</small></div><button class="bookmark-button saved" data-bookmark="${esc(c.ticker)}" aria-label="Rimuovi ${esc(c.name)} dalla watchlist">${icon('bookmark')}</button></div><p>${esc(state.notes[c.ticker] || 'Aggiungi una nota: perché segui questa azienda? Quali dati cambierebbero la tua idea?')}</p><div class="watch-actions"><button class="button-subtle" data-note="${esc(c.ticker)}">${state.notes[c.ticker] ? 'Modifica nota' : 'Aggiungi nota'}</button>${c.url ? `<a class="button-subtle" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">Fonti ufficiali ↗</a>` : ''}</div></div></article>`; }
function renderWatchlist() { const rows = state.watchlist.map(t => company(t)); return `${pageHeading('La tua lista', 'Aziende da seguire.', 'Salva le idee, scrivi la tua tesi e torna a leggerla quando cambiano i fatti.', `<button class="text-button" data-nav="discover">Trova aziende <span aria-hidden="true">↗</span></button>`)}${rows.length ? `<div class="watchlist-grid">${rows.map(watchCard).join('')}</div>` : `<div class="panel empty-state"><div class="empty-icon">${icon('bookmark')}</div><h3>La watchlist è vuota</h3><p>Esplora le aziende e salva quelle che vuoi studiare.</p><button class="button-primary" data-nav="discover">Scopri aziende</button></div>`}`; }
function transactionRow(t) { return `<div class="transaction-row"><div class="company-cell"><span class="ticker-logo ${company(t.ticker).hue}">${esc(t.ticker.slice(0, 3))}</span><span class="company-text"><strong>${esc(t.name || t.ticker)}</strong><small>${esc(t.ticker)} · ${day(t.date)}</small></span></div><span><span class="type-pill ${t.side === 'sell' ? 'sell' : ''}">${t.side === 'sell' ? 'Vendita' : 'Acquisto'}</span></span><span>${amount(t.quantity)}<small>azioni</small></span><span>${money(t.price)}<small>per azione</small></span><button type="button" class="delete-button" data-delete="${esc(t.id)}" aria-label="Elimina movimento ${esc(t.ticker)} del ${day(t.date)}">${icon('trash')}</button></div>`; }
function renderTransactions() { const rows = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date)); return `${pageHeading('Registro personale', 'Ogni movimento, in ordine.', 'Acquisti e vendite che compongono il tuo portafoglio.', `<button class="text-button" data-action="import">Importa CSV <span aria-hidden="true">↗</span></button>`)}${demoBanner()}<div class="panel transactions-panel">${rows.length ? `<div class="transactions-heading"><span>Titolo</span><span>Operazione</span><span>Quantità</span><span>Prezzo</span><span></span></div>${rows.map(transactionRow).join('')}` : `<div class="empty-state"><div class="empty-icon">${icon('activity')}</div><h3>Nessun movimento</h3><p>Aggiungi una transazione oppure importa un file CSV.</p><button class="button-primary" data-action="add">Aggiungi movimento</button></div>`}</div><p class="footnote">Il rendimento mostrato nell'app riguarda solo le posizioni ancora aperte. Per un rendiconto fiscale o contabile usa i documenti ufficiali del broker.</p>`; }
function renderSettings() { return `${pageHeading('Gestione dei dati', 'Tutto sotto controllo.', 'I dati del portafoglio vengono salvati in questo browser. Esportali quando vuoi.')}
    <div class="settings-layout"><section class="panel settings-card"><h2>Importa movimenti</h2><p>Carica un CSV dei tuoi acquisti e vendite. Potrai scegliere a quali colonne corrispondono ticker, quantità, prezzo e data prima di importare.</p><div class="upload-box">${icon('upload')}<strong>Scegli un file CSV</strong><p>Il file viene letto sul tuo dispositivo.</p><label class="button-primary" for="csv-file">Seleziona file</label><input id="csv-file" type="file" accept=".csv,text/csv,text/plain"></div><div class="source-note">Se Trade Republic offre l'esportazione dei movimenti nel tuo account, puoi usarla qui. In alternativa puoi creare un CSV semplice: data, tipo, ticker, nome, quantità, prezzo, commissioni.</div></section>
    <section class="panel settings-card"><h2>I tuoi dati</h2><p>Scarica una copia per conservarla o spostarla su un altro dispositivo.</p><div class="setting-row"><div><strong>Esporta backup</strong><span>Movimenti, prezzi e watchlist in un file JSON</span></div><button class="button-subtle" data-action="export">Scarica</button></div><div class="setting-row"><div><strong>Ripristina backup</strong><span>Importa un file JSON esportato da Forma</span></div><div><label class="button-subtle" for="json-file" style="cursor:pointer">Scegli file</label><input id="json-file" type="file" accept=".json,application/json" hidden></div></div><div class="setting-row"><div><strong>Cancella tutti i dati</strong><span>Rimuove i dati salvati su questo browser</span></div><button class="danger-button" data-action="reset">Cancella</button></div><div class="feature-note">Il sito non chiede password Trade Republic. Un backup JSON può contenere informazioni finanziarie personali: conservalo con cura.</div></section></div>`; }
function render() { renderNav(); const pages = { overview: renderOverview, discover: renderDiscover, watchlist: renderWatchlist, transactions: renderTransactions, settings: renderSettings }; $('#main-content').innerHTML = `<div class="page-enter">${pages[currentPage]()}</div>`; document.title = `${NAV.find(n => n.id === currentPage)?.label} — Forma`; }
function go(page) { if (!NAV.some(n => n.id === page)) return; currentPage = page; window.scrollTo({ top: 0, behavior: 'smooth' }); render(); }
function modal(title, subtitle, body, wide = false) { $('#modal-root').innerHTML = `<div class="modal-backdrop"><div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-head"><div><h2>${title}</h2><p>${subtitle}</p></div><button type="button" class="close-button" data-close aria-label="Chiudi">×</button></div>${body}</div></div>`; $('.modal button:not(.close-button)')?.focus(); }
function closeModal() { $('#modal-root').innerHTML = ''; importData = null; }
function resetDemo() { state = { ...clone(DEMO), demo: false, transactions: [], prices: {}, watchlist: [], notes: {}, hidden: state.hidden }; save(); render(); toast('Ora puoi inserire i tuoi dati.'); }
function ensureRealData() { if (state.demo) { state.demo = false; state.transactions = []; state.prices = {}; state.watchlist = []; state.notes = {}; } }
function addModal() { modal('Aggiungi un movimento', 'Registra un acquisto o una vendita.', `<form id="trade-form"><div class="form-grid"><div class="form-field"><label for="trade-side">Operazione</label><select id="trade-side" name="side"><option value="buy">Acquisto</option><option value="sell">Vendita</option></select></div><div class="form-field"><label for="trade-date">Data</label><input id="trade-date" name="date" type="date" required value="${new Date().toISOString().slice(0, 10)}"></div><div class="form-field"><label for="trade-ticker">Ticker</label><input id="trade-ticker" name="ticker" placeholder="es. IREN" maxlength="16" required autocomplete="off"></div><div class="form-field"><label for="trade-name">Nome azienda</label><input id="trade-name" name="name" placeholder="es. IREN Limited" maxlength="100" autocomplete="off"></div><div class="form-field"><label for="trade-quantity">Quantità</label><input id="trade-quantity" name="quantity" type="number" min="0.000001" step="any" required placeholder="0"></div><div class="form-field"><label for="trade-price">Prezzo per azione (€)</label><input id="trade-price" name="price" type="number" min="0.000001" step="any" required placeholder="0,00"></div><div class="form-field full"><label for="trade-fees">Commissioni (€)</label><input id="trade-fees" name="fees" type="number" min="0" step="any" value="0"></div></div><p class="form-hint">Inserisci i prezzi in euro, come nei movimenti del broker. Il valore corrente potrà essere aggiornato separatamente.</p><div class="form-actions"><button type="button" class="button-secondary" data-close>Annulla</button><button type="submit" class="button-primary">Salva movimento</button></div></form>`); }
function priceModal() { const rows = holdings(); if (!rows.length) { toast('Aggiungi prima un movimento.'); return; } modal('Aggiorna prezzi', 'Inserisci l’ultimo prezzo che vuoi usare per ciascun titolo.', `<form id="price-form"><div class="form-grid">${rows.map(h => `<div class="form-field"><label for="price-${esc(h.ticker)}">${esc(h.ticker)} · prezzo in €</label><input id="price-${esc(h.ticker)}" name="${esc(h.ticker)}" type="number" min="0.000001" step="any" required value="${h.current}"></div>`).join('')}</div><p class="form-hint">I prezzi non si aggiornano automaticamente. Data e fonte della quotazione vanno controllate nel tuo broker.</p><div class="form-actions"><button type="button" class="button-secondary" data-close>Annulla</button><button type="submit" class="button-primary">Salva prezzi</button></div></form>`); }
function noteModal(ticker) { const c = company(ticker); modal(`Nota su ${esc(c.name)}`, 'Scrivi la tua tesi e cosa potrebbe cambiarla.', `<form id="note-form" data-ticker="${esc(ticker)}"><div class="form-field"><label for="note-text">La tua nota</label><textarea id="note-text" name="note" maxlength="1500" placeholder="Perché la seguo? Cosa devo verificare?">${esc(state.notes[ticker] || '')}</textarea></div><div class="form-actions"><button type="button" class="button-secondary" data-close>Annulla</button><button type="submit" class="button-primary">Salva nota</button></div></form>`); }
function csvRows(text) {
  const first = text.split(/\r?\n/).find(x => x.trim()) || '';
  const delimiter = [';', ',', '\t'].map(c => ({ c, n: (first.match(new RegExp(c === '\t' ? '\t' : `\\${c}`, 'g')) || []).length })).sort((a, b) => b.n - a.n)[0].c;
  const rows = []; let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) { const c = text[i]; if (c === '"') { if (quoted && text[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted; } else if (c === delimiter && !quoted) { row.push(cell.trim()); cell = ''; } else if ((c === '\n' || c === '\r') && !quoted) { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = ''; } else cell += c; }
  row.push(cell.trim()); if (row.some(Boolean)) rows.push(row);
  return rows;
}
const FIELD_ALIASES = { date: ['date', 'data', 'datum'], side: ['type', 'tipo', 'side', 'operazione', 'transaction type', 'transaktionstyp'], ticker: ['ticker', 'symbol', 'isin', 'instrument'], name: ['name', 'nome', 'asset name', 'instrument name', 'description', 'descrizione'], quantity: ['quantity', 'quantità', 'quantita', 'shares', 'pieces', 'stück', 'anzahl'], price: ['price', 'prezzo', 'unit price', 'share price', 'preis'], fees: ['fees', 'fee', 'commissioni', 'commission', 'gebühren'] };
function guessColumn(headers, field) { const aliases = FIELD_ALIASES[field] || []; const index = headers.findIndex(h => aliases.includes(h.trim().toLowerCase())); return index < 0 ? '' : String(index); }
function importModal() { modal('Importa un CSV', 'Abbina le colonne del file ai campi del portafoglio.', `<div class="upload-box">${icon('upload')}<strong>Scegli il file da importare</strong><p>Il contenuto rimane su questo dispositivo.</p><label class="button-primary" for="modal-csv-file">Seleziona CSV</label><input id="modal-csv-file" type="file" accept=".csv,text/csv,text/plain"></div>`, true); }
function showImportMapping(rows, filename) {
  if (rows.length < 2) { toast('Il CSV non contiene righe di dati.'); return; }
  importData = rows;
  const headers = rows[0]; const fields = [ ['date','Data'],['side','Operazione'],['ticker','Ticker o ISIN'],['name','Nome azienda'],['quantity','Quantità'],['price','Prezzo per azione'],['fees','Commissioni'] ];
  const opts = (selected) => `<option value="">— Scegli colonna —</option>${headers.map((h, i) => `<option value="${i}" ${String(i) === selected ? 'selected' : ''}>${esc(h || `Colonna ${i + 1}`)}</option>`).join('')}`;
  modal('Controlla le colonne', `${esc(filename)} · ${rows.length - 1} righe`, `<form id="import-form"><div class="form-grid">${fields.map(([key,label]) => `<div class="form-field"><label for="map-${key}">${label}</label><select id="map-${key}" name="${key}">${opts(guessColumn(headers, key))}</select></div>`).join('')}</div><p class="form-hint">Servono data, operazione, ticker, quantità e prezzo. I valori dell'operazione devono indicare acquisto o vendita. Controlla la prima riga prima di importare.</p><div class="import-preview"><table><thead><tr>${headers.slice(0, 8).map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1, 4).map(r => `<tr>${r.slice(0, 8).map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div id="import-error" class="import-result" role="alert"></div><div class="form-actions"><button type="button" class="button-secondary" data-close>Annulla</button><button type="submit" class="button-primary">Importa movimenti</button></div></form>`, true);
}
function normalizeDate(raw) { const value = String(raw || '').trim(); if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10); const m = value.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/); return m ? `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}` : ''; }
function normalizeSide(raw) { const value = String(raw || '').toLowerCase(); if (/buy|acquist|kauf|purchase|sparplan|investment/.test(value)) return 'buy'; if (/sell|vendit|verkauf|sale/.test(value)) return 'sell'; return ''; }
function download(name, data, type) { const blob = new Blob([data], { type }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
document.addEventListener('click', event => {
  const nav = event.target.closest('[data-nav]'); if (nav) { go(nav.dataset.nav); return; }
  if (event.target.closest('[data-close]') || event.target.classList.contains('modal-backdrop')) { closeModal(); return; }
  const saved = event.target.closest('[data-bookmark]'); if (saved) { const ticker = saved.dataset.bookmark; const index = state.watchlist.indexOf(ticker); if (index < 0) state.watchlist.push(ticker); else state.watchlist.splice(index, 1); save(); render(); toast(index < 0 ? 'Aggiunta alla watchlist.' : 'Rimossa dalla watchlist.'); return; }
  const note = event.target.closest('[data-note]'); if (note) { noteModal(note.dataset.note); return; }
  const del = event.target.closest('[data-delete]'); if (del) { if (confirm('Eliminare questo movimento?')) { state.transactions = state.transactions.filter(t => t.id !== del.dataset.delete); save(); render(); toast('Movimento eliminato.'); } return; }
  const filter = event.target.closest('[data-filter]'); if (filter) { discoverFilter = filter.dataset.filter; render(); $('#company-search')?.focus(); return; }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'clear-demo') resetDemo();
  else if (action === 'add') addModal();
  else if (action === 'update-prices') priceModal();
  else if (action === 'import') importModal();
  else if (action === 'export') { download(`forma-backup-${new Date().toISOString().slice(0,10)}.json`, JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2), 'application/json'); toast('Backup scaricato.'); }
  else if (action === 'reset') { if (confirm('Cancellare tutti i dati di Forma su questo browser?')) { state = { ...clone(DEMO), demo: false, transactions: [], prices: {}, watchlist: [], notes: {} }; save(); go('overview'); toast('Dati cancellati.'); } }
});
$('#open-add').addEventListener('click', addModal);
$('#privacy-toggle').addEventListener('click', () => { state.hidden = !state.hidden; save(); render(); });
document.addEventListener('input', event => { if (event.target.id === 'company-search') { discoverSearch = event.target.value; const found = COMPANIES.filter(c => (discoverFilter === 'Tutte' || c.group === discoverFilter) && (`${c.ticker} ${c.name} ${c.sector}`.toLowerCase().includes(discoverSearch.toLowerCase()))); $('#company-results').innerHTML = found.length ? found.map(companyCard).join('') : `<div class="panel empty-state"><h3>Nessun risultato</h3><p>Prova un nome o un settore diverso.</p></div>`; } });
document.addEventListener('submit', event => {
  if (event.target.id === 'trade-form') { event.preventDefault(); const f = new FormData(event.target); const ticker = String(f.get('ticker') || '').trim().toUpperCase(); const quantity = Number(f.get('quantity')), price = Number(f.get('price')), fees = Number(f.get('fees') || 0); if (!ticker || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price <= 0 || fees < 0) { toast('Controlla ticker, quantità e prezzo.'); return; } const side = String(f.get('side')); if (side === 'sell') { const owned = state.demo ? 0 : holdings().find(h => h.ticker === ticker)?.quantity || 0; if (quantity > owned + 1e-9) { toast('La vendita supera la quantità in portafoglio.'); return; } } ensureRealData(); state.transactions.push({ id: crypto.randomUUID(), date: String(f.get('date')), side, ticker, name: String(f.get('name') || company(ticker).name).trim(), quantity, price, fees }); if (!state.prices[ticker]) state.prices[ticker] = price; save(); closeModal(); go('transactions'); toast('Movimento salvato.'); }
  else if (event.target.id === 'price-form') { event.preventDefault(); const f = new FormData(event.target); for (const [key, value] of f) { const price = Number(value); if (!Number.isFinite(price) || price <= 0) { toast(`Controlla il prezzo di ${key}.`); return; } state.prices[key] = price; } save(); closeModal(); render(); toast('Prezzi aggiornati.'); }
  else if (event.target.id === 'note-form') { event.preventDefault(); const ticker = event.target.dataset.ticker; state.notes[ticker] = String(new FormData(event.target).get('note') || '').trim(); save(); closeModal(); render(); toast('Nota salvata.'); }
  else if (event.target.id === 'import-form') { event.preventDefault(); if (!importData) return; const f = new FormData(event.target); const map = Object.fromEntries([...f].map(([k,v]) => [k, v === '' ? -1 : Number(v)])); const required = ['date','side','ticker','quantity','price']; if (required.some(k => map[k] < 0)) { $('#import-error').textContent = 'Abbina tutte le colonne obbligatorie.'; return; } const imported = [], errors = []; for (let i = 1; i < importData.length; i++) { const r = importData[i], date = normalizeDate(r[map.date]), side = normalizeSide(r[map.side]), ticker = String(r[map.ticker] || '').trim().toUpperCase(), quantity = num(r[map.quantity]), price = num(r[map.price]), fees = map.fees >= 0 ? num(r[map.fees]) || 0 : 0; if (!date || !side || !ticker || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price <= 0) { errors.push(i + 1); continue; } imported.push({ id: crypto.randomUUID(), date, side, ticker, name: map.name >= 0 ? String(r[map.name] || ticker).trim() : company(ticker).name, quantity, price, fees }); } if (errors.length) { $('#import-error').textContent = `${errors.length} righe non riconosciute (${errors.slice(0, 5).join(', ')}${errors.length > 5 ? '…' : ''}). Correggi il CSV o le colonne: non è stato importato nulla.`; return; } if (!imported.length) { $('#import-error').textContent = 'Nessun movimento valido trovato.'; return; } ensureRealData(); const signatures = new Set(state.transactions.map(t => `${t.date}|${t.side}|${t.ticker}|${t.quantity}|${t.price}|${t.fees}`)); let added = 0; for (const t of imported) { const sig = `${t.date}|${t.side}|${t.ticker}|${t.quantity}|${t.price}|${t.fees}`; if (!signatures.has(sig)) { state.transactions.push(t); signatures.add(sig); if (!state.prices[t.ticker]) state.prices[t.ticker] = t.price; added++; } } save(); closeModal(); go('transactions'); toast(`${added} movimenti importati. ${imported.length - added} duplicati ignorati.`); }
});
document.addEventListener('change', async event => {
  if (['csv-file','modal-csv-file'].includes(event.target.id)) { const file = event.target.files?.[0]; if (!file) return; if (file.size > 5_000_000) { toast('Il CSV supera 5 MB.'); return; } try { const text = await file.text(); showImportMapping(csvRows(text.replace(/^\uFEFF/, '')), file.name); } catch (_) { toast('Non riesco a leggere il CSV.'); } }
  if (event.target.id === 'json-file') { const file = event.target.files?.[0]; if (!file) return; try { const data = JSON.parse(await file.text()); if (!Array.isArray(data.transactions) || !Array.isArray(data.watchlist) || typeof data.prices !== 'object') throw Error('invalid'); if (!confirm('Sostituire i dati attuali con il backup selezionato?')) return; state = { ...clone(DEMO), ...data, demo: false }; save(); go('overview'); toast('Backup ripristinato.'); } catch (_) { toast('Il file non è un backup valido di Forma.'); } }
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });
render();
