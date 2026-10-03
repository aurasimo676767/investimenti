const STORE_KEY = 'forma-invest-v1';
const SYNC_KEY = 'forma-invest-cloud-revision';
const DEMO = {
  demo: false,
  hidden: false,
  prices: {},
  watchlist: [],
  notes: {},
  transactions: [],
  alerts: [],
  journal: [],
  assets: {}
};
const COMPANIES = [
  { ticker: 'IREN', name: 'IREN Limited', exchange: 'NASDAQ', sector: 'Infrastruttura AI', group: 'Tecnologia', hue: 'rose', description: 'Data center, capacità di calcolo AI e attività legate al Bitcoin. Un caso da leggere insieme al suo fabbisogno di capitale.', url: 'https://iren.com/investor/annual-reports' },
  { ticker: 'ASML', name: 'ASML Holding', exchange: 'NASDAQ / AMS', sector: 'Semiconduttori', group: 'Tecnologia', hue: 'blue', description: 'Tecnologie di litografia per la produzione di chip. Studia ordini, capacità produttiva e dipendenza dal ciclo dei semiconduttori.', url: 'https://www.asml.com/en/investors' },
  { ticker: 'MSFT', name: 'Microsoft', exchange: 'NASDAQ', sector: 'Software e cloud', group: 'Tecnologia', hue: 'blue', description: 'Software, cloud e servizi AI. Guarda crescita dei segmenti, spese in infrastruttura e flussi di cassa.', url: 'https://www.microsoft.com/en-us/Investor/' },
  { ticker: 'TSM', name: 'TSMC', exchange: 'NYSE', sector: 'Semiconduttori', group: 'Tecnologia', hue: 'gold', description: 'Produzione avanzata di semiconduttori. Segui capacità, clienti, margini e investimenti.', url: 'https://investor.tsmc.com/english' },
  { ticker: 'MELI', name: 'MercadoLibre', exchange: 'NASDAQ', sector: 'Commerce e fintech', group: 'Consumi', hue: 'gold', description: 'Marketplace e servizi finanziari in America Latina. Studia crescita, qualità del credito e margini.', url: 'https://investor.mercadolibre.com/' },
  { ticker: 'MC', name: 'LVMH', exchange: 'EPA', sector: 'Lusso', group: 'Consumi', hue: 'rose', description: 'Marchi globali nel lusso. Osserva domanda geografica, margini e forza dei brand.', url: 'https://www.lvmh.com/investors/' },
  { ticker: 'NVDA', name: 'NVIDIA', exchange: 'NASDAQ', sector: 'Semiconduttori', group: 'Tecnologia', hue: 'mint', description: 'GPU e infrastruttura di calcolo. Da verificare: domanda, margini e concentrazione dei clienti.', url: 'https://investor.nvidia.com/' },
  { ticker: 'PLTR', name: 'Palantir', exchange: 'NASDAQ', sector: 'Software e AI', group: 'Tecnologia', hue: 'blue', description: 'Piattaforme dati e AI. Confronta crescita, valutazione, contratti e remunerazione in azioni.', url: 'https://investors.palantir.com/' },
  { ticker: 'AMD', name: 'AMD', exchange: 'NASDAQ', sector: 'Semiconduttori', group: 'Tecnologia', hue: 'rose', description: 'Processori e acceleratori. Studia concorrenza, quote di mercato e flussi di cassa.', url: 'https://ir.amd.com/' },
  { ticker: 'TSLA', name: 'Tesla', exchange: 'NASDAQ', sector: 'Mobilità ed energia', group: 'Consumi', hue: 'rose', description: 'Auto elettriche ed energia. Separa i risultati operativi dalle aspettative sulle nuove attività.', url: 'https://ir.tesla.com/' },
  { ticker: 'COIN', name: 'Coinbase', exchange: 'NASDAQ', sector: 'Infrastruttura crypto', group: 'Finanza', hue: 'blue', description: 'Servizi per asset digitali. Verifica dipendenza dai volumi, regolazione e costi.', url: 'https://investor.coinbase.com/' },
  { ticker: 'MSTR', name: 'Strategy', exchange: 'NASDAQ', sector: 'Bitcoin e software', group: 'Finanza', hue: 'gold', description: 'Esposizione al Bitcoin e software. Studia leva, diluizione e premio rispetto agli asset detenuti.', url: 'https://www.strategy.com/investor-relations' },
  { ticker: 'HOOD', name: 'Robinhood', exchange: 'NASDAQ', sector: 'Brokerage', group: 'Finanza', hue: 'mint', description: 'Servizi finanziari digitali. Guarda ricavi, attività dei clienti e rischio normativo.', url: 'https://investors.robinhood.com/' },
  { ticker: 'SOFI', name: 'SoFi', exchange: 'NASDAQ', sector: 'Finanza digitale', group: 'Finanza', hue: 'blue', description: 'Credito e servizi finanziari. Esamina qualità del credito, raccolta e redditività.', url: 'https://investors.sofi.com/' },
  { ticker: 'RKLB', name: 'Rocket Lab', exchange: 'NASDAQ', sector: 'Spazio', group: 'Industria', hue: 'gold', description: 'Lanci e sistemi spaziali. Da leggere: ordini, cassa, investimenti e rischio di esecuzione.', url: 'https://investors.rocketlabcorp.com/' },
  { ticker: 'RDDT', name: 'Reddit', exchange: 'NYSE', sector: 'Media digitali', group: 'Tecnologia', hue: 'rose', description: 'Community e pubblicità. Valuta monetizzazione, crescita utenti e dipendenza dalle piattaforme.', url: 'https://investor.redditinc.com/' },
  { ticker: 'AAPL', name: 'Apple', exchange: 'NASDAQ', sector: 'Hardware e servizi', group: 'Tecnologia', hue: 'blue', description: 'Dispositivi e servizi. Esamina mix dei ricavi, margini e ciclo di sostituzione dei prodotti.', url: 'https://investor.apple.com/' },
  { ticker: 'AMZN', name: 'Amazon', exchange: 'NASDAQ', sector: 'Commerce e cloud', group: 'Consumi', hue: 'gold', description: 'Ecommerce, cloud e pubblicità. Confronta redditività dei segmenti e spese di investimento.', url: 'https://ir.aboutamazon.com/' },
  { ticker: 'GOOGL', name: 'Alphabet', exchange: 'NASDAQ', sector: 'Ricerca e cloud', group: 'Tecnologia', hue: 'blue', description: 'Ricerca, pubblicità e cloud. Studia il cambiamento delle abitudini di ricerca e i margini.', url: 'https://abc.xyz/investor/' },
  { ticker: 'META', name: 'Meta', exchange: 'NASDAQ', sector: 'Media digitali', group: 'Tecnologia', hue: 'blue', description: 'Piattaforme social e pubblicità. Segui ricavi, spesa AI e ritorno sugli investimenti.', url: 'https://investor.atmeta.com/' },
  { ticker: 'AVGO', name: 'Broadcom', exchange: 'NASDAQ', sector: 'Chip e software', group: 'Tecnologia', hue: 'rose', description: 'Semiconduttori e software infrastrutturale. Verifica debito, integrazione e generazione di cassa.', url: 'https://investors.broadcom.com/' },
  { ticker: 'CRWD', name: 'CrowdStrike', exchange: 'NASDAQ', sector: 'Cybersecurity', group: 'Tecnologia', hue: 'rose', description: 'Sicurezza cloud. Osserva ricavi ricorrenti, fidelizzazione e rischio operativo.', url: 'https://ir.crowdstrike.com/' },
  { ticker: 'UBER', name: 'Uber', exchange: 'NYSE', sector: 'Mobilità', group: 'Consumi', hue: 'blue', description: 'Mobilità e consegne. Controlla flussi di cassa, incentivi e concorrenza.', url: 'https://investor.uber.com/' },
  { ticker: 'LLY', name: 'Eli Lilly', exchange: 'NYSE', sector: 'Farmaceutica', group: 'Salute', hue: 'rose', description: 'Farmaci e ricerca. Verifica pipeline, brevetti, capacità produttiva e valutazione.', url: 'https://investor.lilly.com/' },
  { ticker: 'JPM', name: 'JPMorgan Chase', exchange: 'NYSE', sector: 'Banche', group: 'Finanza', hue: 'gold', description: 'Banca e servizi finanziari. Segui margine di interesse, perdite su crediti e capitale.', url: 'https://www.jpmorganchase.com/ir' },
  { ticker: 'XOM', name: 'ExxonMobil', exchange: 'NYSE', sector: 'Energia', group: 'Energia', hue: 'rose', description: 'Energia e petrolchimica. Studia ciclo delle materie prime, costi e disciplina del capitale.', url: 'https://investor.exxonmobil.com/' },
  { ticker: 'COST', name: 'Costco', exchange: 'NASDAQ', sector: 'Distribuzione', group: 'Consumi', hue: 'mint', description: 'Distribuzione con abbonamento. Verifica rinnovi, vendite comparabili e valutazione.', url: 'https://investor.costco.com/' }
];
const DEFAULT_RADAR = ['IREN','NVDA','PLTR','AMD','TSLA','COIN','MSTR','HOOD','SOFI','RKLB','RDDT','AAPL','MSFT','AMZN','GOOGL','META','AVGO','TSM','ASML','MELI','CRWD','LLY','JPM','XOM'];
const NAV = [
  { id: 'overview', label: 'Portafoglio', icon: 'overview' },
  { id: 'discover', label: 'Mercato', icon: 'compass' },
  { id: 'ideas', label: 'Idee per te', icon: 'spark' },
  { id: 'watchlist', label: 'Da seguire', icon: 'bookmark' },
  { id: 'lab', label: 'Simulazioni', icon: 'lab' },
  { id: 'transactions', label: 'Operazioni', icon: 'activity' },
  { id: 'settings', label: 'Impostazioni', icon: 'settings' }
];
const PATHS = {
  lab: '<path d="M9 3h6M10 3v6L4 19a1.3 1.3 0 0 0 1.2 2h13.6a1.3 1.3 0 0 0 1.2-2L14 9V3M8 14h8"/><path d="M10 17h.01M14 18h.01"/>',
  arrow: '<path d="M5 19 19 5M5 5h14v14"/>',
  down: '<path d="m5 5 14 14M5 19h14V5"/>',
  refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.5 7a7.5 7.5 0 0 1 12.4-2L20 8M4 16l2.1 3a7.5 7.5 0 0 0 12.4-2"/>',
  spark: '<path d="m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6z"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
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
function loadState() { try { const raw = JSON.parse(localStorage.getItem(STORE_KEY)); if (raw && Array.isArray(raw.transactions)) return raw.demo ? { ...clone(DEMO), hidden: !!raw.hidden } : { ...clone(DEMO), ...raw }; } catch (_) {} return clone(DEMO); }
let state = loadState();
let currentPage = 'overview';
let discoverFilter = 'Tutte';
let discoverSearch = '';
let importData = null;
let toastTimer;
let marketData = { rows: [], total: DEFAULT_RADAR.length, complete: false };
try { const cached = JSON.parse(localStorage.getItem('forma-market-v1')); if (Array.isArray(cached?.rows)) marketData = cached; } catch (_) {}
let marketBusy = false, marketError = '', marketLastAttempt = 0, marketNext = 0;
let marketTimeframe = 'day', marketDirection = 'gainers';
let transactionSearch = '', transactionSide = 'all';
let scenarioTicker = 'all', scenarioChange = -10;
let modalReturnFocus = null;
let cloudRevision = localStorage.getItem(SYNC_KEY) || null;
let cloudReady = false;
let cloudDirty = false;
let cloudBusy = false;
let cloudConflict = null;
let cloudTimer;
let changeSerial = 0;
let cloudMessage = 'Connessione all’archivio privato in corso…';
function setCloudMessage(message) { cloudMessage = message; const el = $('#cloud-status'); if (el) el.textContent = message; const status = $('#sync-state'); if (status) { status.textContent = message.startsWith('Portafoglio sincronizzato') ? 'Sincronizzato' : cloudReady ? 'Cloud collegato' : 'Copia locale'; status.setAttribute('title', message); } }
function hasLocalData() { return !!(state.transactions.length || state.watchlist.length || Object.keys(state.notes).length || state.alerts?.length || state.journal?.length || state.radarSymbols?.length); }
function save(sync = true) { if (sync) { state.updatedAt = Date.now(); changeSerial++; cloudDirty = true; } localStorage.setItem(STORE_KEY, JSON.stringify(state)); if (sync && cloudReady) { clearTimeout(cloudTimer); cloudTimer = setTimeout(cloudWrite, 800); } }
function adoptCloud(remote, revision) {
  state = { ...clone(DEMO), ...remote, demo: false };
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
  cloudRevision = revision;
  if (revision) localStorage.setItem(SYNC_KEY, revision); else localStorage.removeItem(SYNC_KEY);
  cloudDirty = false;
  cloudConflict = null;
  setCloudMessage('Portafoglio sincronizzato su PC e telefono.');
  render();
  autoRefreshQuotes();
}
async function cloudPull() {
  if (cloudBusy || cloudConflict || !window.location?.protocol?.startsWith('http')) return;
  cloudBusy = true;
  try {
    const response = await fetch('/api/state', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) { cloudReady = false; setCloudMessage(data.error || 'Sincronizzazione non disponibile.'); return; }
    cloudReady = true;
    if (!data.state) {
      cloudRevision = null;
      if (hasLocalData()) {
        cloudDirty = true;
        setCloudMessage('Caricamento del portafoglio nel cloud…');
        setTimeout(cloudWrite, 0);
      } else setCloudMessage('Archivio privato pronto. Importa i tuoi movimenti.');
      return;
    }
    if (data.revision === cloudRevision) {
      if ((Number(state.updatedAt) || 0) > (Number(data.state.updatedAt) || 0)) cloudDirty = true;
      if (cloudDirty) setTimeout(cloudWrite, 0);
      else if ((Number(state.updatedAt) || 0) < (Number(data.state.updatedAt) || 0)) adoptCloud(data.state, data.revision);
      else setCloudMessage('Portafoglio sincronizzato su PC e telefono.');
      return;
    }
    const localEmpty = !hasLocalData();
    const base = localStorage.getItem(SYNC_KEY);
    if (localEmpty || (base && !cloudDirty && (Number(state.updatedAt) || 0) <= (Number(data.state.updatedAt) || 0))) {
      adoptCloud(data.state, data.revision);
      return;
    }
    cloudConflict = data;
    cloudRevision = data.revision;
    setCloudMessage('Ci sono dati diversi su questo dispositivo e nel cloud. Scegli quale copia usare.');
    if (currentPage === 'settings') render();
  } catch (_) {
    cloudReady = false;
    setCloudMessage('Connessione cloud non disponibile; i dati restano salvati su questo dispositivo.');
  } finally { cloudBusy = false; }
}
async function cloudWrite() {
  if (!cloudReady || cloudBusy || !cloudDirty || cloudConflict) return;
  cloudBusy = true;
  const sentSerial = changeSerial;
  try {
    const response = await fetch('/api/state', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state, revision: cloudRevision }) });
    const data = await response.json();
    if (response.status === 409) { cloudReady = false; setCloudMessage('Modifiche presenti su un altro dispositivo. Apri Impostazioni per risolvere.'); setTimeout(cloudPull, 0); return; }
    if (!response.ok) { setCloudMessage(data.error || 'Salvataggio cloud non riuscito.'); return; }
    cloudRevision = data.revision;
    if (cloudRevision) localStorage.setItem(SYNC_KEY, cloudRevision);
    cloudDirty = sentSerial !== changeSerial;
    if (cloudDirty) setTimeout(cloudWrite, 0);
    else setCloudMessage('Portafoglio sincronizzato su PC e telefono.');
  } catch (_) { setCloudMessage('Salvataggio cloud non riuscito; la copia locale è conservata.'); }
  finally { cloudBusy = false; }
}
function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3600); }
function company(ticker, fallback = '') {
  const key = state.symbols?.[ticker] || ticker, asset = catalogueAsset(key), symbol = asset?.symbol || key.split(':')[0];
  const known = COMPANIES.find(c => c.ticker === symbol);
  return { ...(known || { sector: asset?.kind === 'etfs' ? 'ETF' : 'Altro', group: 'Altro', hue: asset?.kind === 'etfs' ? 'mint' : 'blue',
    description: asset?.kind === 'etfs' ? 'Fondo quotato. Studia indice seguito, costi, replica, domicilio e politica dei dividendi nel KID e nei documenti del gestore.' : 'Strumento nel tuo catalogo personale. Verifica attività, bilanci e valutazione prima di investire.', url: '' }),
    ticker: key, symbol, name: asset?.name || known?.name || fallback || marketData.rows.find(r => r.symbol === key)?.name || symbol,
    exchange: asset?.exchange || known?.exchange || 'Titolo personale', country: asset?.country || '', currency: asset?.currency || '', plan: asset?.plan || '' };
}
function holdings() {
  const result = new Map();
  for (const t of [...state.transactions].sort((a, b) => (a.executedAt || a.date).localeCompare(b.executedAt || b.date))) {
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
    const hasPrice = Number(state.prices[h.ticker]) > 0;
    const current = hasPrice ? Number(state.prices[h.ticker]) : h.cost / h.quantity;
    const value = current * h.quantity;
    return { ...h, current, hasPrice, value, pnl: value - h.cost, change: h.cost ? ((value - h.cost) / h.cost) * 100 : 0 };
  }).sort((a, b) => b.value - a.value);
}
function portfolio() { const rows = holdings(); return { rows, invested: rows.reduce((n, h) => n + h.cost, 0), value: rows.reduce((n, h) => n + h.value, 0), pnl: rows.reduce((n, h) => n + h.pnl, 0) }; }
function renderNav() {
  const items = NAV.map(n => `<button type="button" class="nav-button ${currentPage === n.id ? 'active' : ''}" data-nav="${n.id}" ${currentPage === n.id ? 'aria-current="page"' : ''}>${icon(n.icon)}<span>${n.label}</span></button>`).join('');
  $('#desktop-nav').innerHTML = items;
  const mobilePrimary = ['overview','discover','ideas','watchlist'];
  $('#mobile-nav').innerHTML = NAV.filter(n=>mobilePrimary.includes(n.id)).map(n=>`<button type="button" class="nav-button ${currentPage===n.id?'active':''}" data-nav="${n.id}" ${currentPage===n.id?'aria-current="page"':''}>${icon(n.icon)}<span>${n.id==='ideas'?'Idee':n.label}</span></button>`).join('') + `<button type="button" class="nav-button ${mobilePrimary.includes(currentPage)?'':'active'}" data-action="more-nav" aria-label="Altre pagine" aria-haspopup="dialog">${icon('overview')}<span>Altro</span></button>`;
  $('#breadcrumb').textContent = NAV.find(n => n.id === currentPage)?.label || '';
  $('#privacy-toggle').innerHTML = icon(state.hidden ? 'eyeoff' : 'eye');
  $('#privacy-toggle').setAttribute('aria-label', state.hidden ? 'Mostra importi' : 'Nascondi importi');
  $('#today-label').textContent = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  setCloudMessage(cloudMessage);
}
function demoBanner() { return state.demo ? `<div class="demo-banner"><span><strong>Anteprima</strong> · I numeri qui sotto sono illustrativi, non quotazioni aggiornate.</span><button type="button" data-action="clear-demo">Usa i miei dati</button></div>` : ''; }
function pageHeading(kicker, title, subtitle, action = '') { return `<div class="page-heading"><div class="heading-copy"><p class="eyebrow">${kicker}</p><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`; }
function holdingRow(h) {
  const c = company(h.ticker, h.name), meta = state.quoteMeta?.[h.ticker];
  const stamp = meta?.asOf ? new Date(meta.asOf * 1000).toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
  const source = meta ? `Twelve Data${stamp ? ` · ${stamp}` : ' · orario non disponibile'}` : 'Prezzo salvato manualmente';
  return `<div class="holding-row"><div class="company-cell"><button class="ticker-logo ${c.hue}" data-asset="${esc(c.ticker)}" aria-label="Apri ${esc(h.name)}">${esc(c.ticker.slice(0, 4))}</button><span class="company-text"><strong>${esc(h.name)}</strong><small>${esc(c.ticker)} · ${amount(h.quantity)} azioni</small></span></div><span class="table-value">${money(h.value)}<small class="table-sub">${h.hasPrice ? `${money(h.current)} / azione · ${esc(source)}` : 'Al costo · prezzo mancante'}</small></span><span class="table-value">${money(h.cost)}</span><span class="table-value ${h.hasPrice ? tone(h.pnl) : 'muted'}">${h.hasPrice ? money(h.pnl) : '—'}<small class="table-sub">${h.hasPrice ? percentage(h.change) : 'Da aggiornare'}</small></span></div>`;
}
function donutMarkup(rows, total) {
  if (!rows.length || !total) return `<div class="empty-state"><div class="empty-icon">${icon('chart')}</div><h3>Nessun titolo ancora</h3><p>Aggiungi il primo acquisto per vedere la composizione del portafoglio.</p></div>`;
  const colors = ['#a79aff', '#4fbcff', '#4ce5ad', '#ffc774', '#ff7f9b', '#677cff'];
  let from = 0;
  const stops = rows.map((h, i) => { const to = from + h.value / total * 100; const stop = `${colors[i % colors.length]} ${from}% ${to}%`; from = to; return stop; }).join(',');
  return `<div class="donut-layout"><div class="donut" style="background:conic-gradient(${stops})"><div class="donut-center"><strong>${rows.length}</strong><small>${rows.length === 1 ? 'titolo' : 'titoli'}</small></div></div><div class="allocation-list">${rows.slice(0, 5).map((h, i) => `<div class="allocation-item"><span><i class="legend-dot" style="background:${colors[i % colors.length]}"></i>${esc(h.ticker)}</span><strong>${Math.round(h.value / total * 100)}%</strong></div>`).join('')}</div></div>`;
}
function renderOverview() {
  const p = portfolio();
  const pct = p.invested ? p.pnl / p.invested * 100 : 0;
  const top = p.rows[0];
  const topShare = top && p.value ? top.value / p.value * 100 : 0;
  const stats = FormaResearch.ledger(state.transactions), priced = p.rows.filter(h => h.hasPrice).length;
  return `${pageHeading('Il tuo osservatorio personale', 'Il tuo capitale. Le possibilità.', 'Una prospettiva sul tuo portafoglio e su quello che si muove.', `<button class="button-secondary" data-action="market-refresh">${icon('refresh')} Aggiorna radar</button>`)}
    <section class="dashboard-grid" aria-label="Riepilogo del portafoglio">
      <div class="hero-shell"><div class="hero-card"><div class="hero-top"><span class="status-pill"><i></i>Portafoglio personale</span><span class="hero-position-count">${p.rows.length} ${p.rows.length === 1 ? 'posizione' : 'posizioni'}</span></div><div class="hero-overline">${priced === p.rows.length && p.rows.length ? 'Valore del portafoglio' : 'Valore stimato del portafoglio'}</div><div class="hero-value">${money(p.value)}</div><div class="hero-sub"><strong class="change-pill ${tone(p.pnl)}">${icon(p.pnl < 0 ? 'down' : 'arrow')}${percentage(pct)}</strong><span>${money(p.pnl)} <small>guadagno o perdita sulle posizioni aperte</small></span></div><div class="hero-art" aria-hidden="true"><div class="orbital orbital-one"></div><div class="orbital orbital-two"></div><div class="orbital orbital-three"></div><div class="orbit-core">f<span>.</span></div></div><div class="hero-bottom"><span>${icon('shield')}${priced}/${p.rows.length} posizioni con prezzo</span><button class="hero-link" data-nav="settings">Gestisci dati ${icon('arrow')}</button></div></div></div>
      <div class="metric-stack"><article class="panel metric-card"><div class="metric-title"><span>Quanto hai speso</span><span class="metric-icon">${icon('wallet')}</span></div><div class="metric-number">${money(p.invested)}</div><div class="metric-detail">Costo degli acquisti ancora in portafoglio</div></article><article class="panel metric-card"><div class="metric-title"><span>Risultato delle vendite</span><span class="metric-icon violet">${icon('activity')}</span></div><div class="metric-number ${tone(stats.realized)}">${money(stats.realized)}</div><div class="metric-detail">${stats.sales} vendite abbinate · al netto delle commissioni${stats.unmatched ? ' · storico incompleto' : ''}</div></article></div>
    </section>
    ${dashboardCharts()}<details class="panel portfolio-explainer"><summary>Valore, spesa e risultato: cosa cambia?</summary><p><strong>Valore attuale:</strong> quanto valgono oggi i titoli che possiedi, con gli ultimi prezzi disponibili.</p><p><strong>Quanto hai speso:</strong> il costo delle posizioni ancora aperte, incluse le commissioni degli acquisti.</p><p><strong>Risultato delle posizioni aperte:</strong> valore attuale meno costo. Diventa realizzato solo quando vendi.</p><p><strong>Risultato delle vendite:</strong> differenza tra ricavi delle vendite e costo medio delle azioni vendute, con commissioni e senza imposte. Non include dividendi o movimenti di cassa.</p></details>
    <div class="dashboard-pulse"><span>${icon('spark')}Il tuo focus</span><p>${top ? `${esc(company(top.ticker, top.name).ticker)} rappresenta il <strong>${Math.round(topShare)}%</strong> del portafoglio. ${topShare > 45 ? 'Prova uno scenario per vedere quanto pesa un suo movimento.' : 'Esplora il radar per confrontare nuove idee.'}` : 'Importa i movimenti per attivare gli strumenti sul tuo portafoglio.'}</p><button class="text-button" data-nav="lab">Apri laboratorio ${icon('arrow')}</button></div>
    <div class="section-head"><div><span class="section-kicker">Il mercato in movimento</span><h2>Tendenze, senza rumore.</h2><p>Chi accelera e chi rallenta tra le aziende del tuo radar.</p></div><button class="text-button" data-nav="discover">Radar completo ${icon('arrow')}</button></div>
    <section id="dashboard-market" aria-label="Tendenze di mercato">${marketPanel(true)}</section>
    <div class="section-head"><div><span class="section-kicker">La tua prossima ricerca</span><h2>Idee per te.</h2><p>Segnali spiegabili, aziende da conoscere e domande da farti.</p></div><button class="text-button" data-nav="ideas">Esplora le idee ${icon('arrow')}</button></div>
    <section id="dashboard-ideas" class="ideas-grid" aria-label="Idee di investimento">${ideasMarkup()}</section>
    <div class="section-head"><div><span class="section-kicker">Quello che possiedi</span><h2>Le tue posizioni.</h2><p>Valore, costo e risultato delle posizioni aperte.</p></div><button class="text-button" data-action="refresh-portfolio">${icon('refresh')} Aggiorna prezzi</button></div>
    <section class="overview-lower"><div class="panel holdings-panel">${p.rows.length ? `<div class="table-header"><span>Azienda</span><span>Valore</span><span>Investito</span><span>Risultato</span></div>${p.rows.map(holdingRow).join('')}` : `<div class="empty-state"><div class="empty-icon">${icon('wallet')}</div><h3>Il tuo spazio, i tuoi investimenti.</h3><p>Importa il CSV di Trade Republic per cominciare.</p><button class="button-primary" data-action="import">Importa movimenti ${icon('upload')}</button></div>`}</div><div class="panel allocation-panel"><div class="mini-title"><h3>La tua distribuzione</h3>${icon('overview')}</div><p>Il peso di ogni posizione</p>${donutMarkup(p.rows, p.value)}</div></section>
    <section class="dashboard-bottom-grid"><article class="panel tool-preview"><span class="tool-symbol">${icon('lab')}</span><h3>Prima di decidere, simula.</h3><p>Un titolo scende del 20%. Quanto cambia davvero il tuo portafoglio? Provalo nel laboratorio.</p><button class="button-secondary" data-nav="lab">Esplora gli scenari ${icon('arrow')}</button></article><article class="panel tool-preview"><span class="tool-symbol emerald">${icon('bell')}</span><h3>Un prezzo. Un motivo.</h3><p>Definisci gli obiettivi delle aziende che segui e annota perché quel livello conta per te.</p><button class="button-secondary" data-action="alert-add">Crea un obiettivo ${icon('arrow')}</button></article></section>
    ${alertsMarkup(true)}<p class="footnote">I risultati si basano sui tuoi movimenti. Prezzi in EUR per il portafoglio, valuta di mercato per il radar. Le idee sono spunti di ricerca basati su criteri visibili; il momentum non prevede i rendimenti futuri.</p>`;
}
function companyCard(c) { const saved = state.watchlist.includes(c.ticker), row = radarRows().find(r => r.symbol === c.ticker); return `<article class="panel company-card"><div class="company-top"><span class="ticker-logo ${c.hue}">${esc(c.ticker.slice(0, 4))}</span><button type="button" class="bookmark-button ${saved ? 'saved' : ''}" data-bookmark="${esc(c.ticker)}" aria-label="${saved ? 'Rimuovi dalla' : 'Aggiungi alla'} watchlist: ${esc(c.name)}" aria-pressed="${saved}">${icon('bookmark')}</button></div><button class="company-title" data-asset="${esc(c.ticker)}"><h3>${esc(c.name)}</h3></button><p class="ticker-meta">${esc(c.ticker)} · ${esc(c.exchange)}</p><p class="description">${esc(c.description)}</p>${row ? `<div class="company-price"><strong>${marketPrice(row)}</strong><span class="${tone(row.day)}">${marketChange(row.day)} <small>1 seduta</small></span></div>` : ''}<div class="company-card-bottom"><span class="sector-tag">${esc(c.sector)}</span><button class="text-button" data-asset="${esc(c.ticker)}">Studia ${icon('arrow')}</button></div></article>`; }
function renderDiscover() {
  const filters = ['Tutte', ...new Set(COMPANIES.map(c => c.group))];
  const found = COMPANIES.filter(c => (discoverFilter === 'Tutte' || c.group === discoverFilter) && (`${c.ticker} ${c.name} ${c.sector}`.toLowerCase().includes(discoverSearch.toLowerCase())));
  return `${pageHeading('Dalla ricerca al tuo radar', 'Esplora le possibilità.', 'Sfoglia il catalogo mondiale e scegli quali strumenti seguire.', `<button class="button-secondary" data-action="radar-edit">Personalizza radar ${icon('compass')}</button>`)}${cataloguePanel()}<div class="section-head"><div><span class="section-kicker">Le aziende che monitori</span><h2>Le tendenze del tuo radar.</h2><p>Confronta i movimenti tra gli strumenti che hai scelto.</p></div></div><section id="radar-market">${marketPanel(false)}</section><div class="section-head"><div><span class="section-kicker">Percorsi di ricerca</span><h2>Conosci le aziende.</h2><p>Schede editoriali con domande utili e fonti ufficiali.</p></div></div><div class="toolbar"><label class="search-field">${icon('search')}<input id="company-search" type="search" placeholder="Cerca nelle schede editoriali" value="${esc(discoverSearch)}" aria-label="Cerca nelle schede editoriali"></label><div class="filter-row">${filters.map(f => `<button type="button" class="chip ${f === discoverFilter ? 'active' : ''}" data-filter="${f}" aria-pressed="${f === discoverFilter}">${f}</button>`).join('')}</div></div><div id="company-results" class="company-grid">${found.length ? found.map(companyCard).join('') : `<div class="panel empty-state"><h3>Nessun risultato</h3><p>Usa il catalogo in alto per cercare in tutti gli strumenti del provider.</p></div>`}</div><div class="feature-note">Le descrizioni sono schede di ricerca. Apri i dettagli per consultare le fonti ufficiali e scrivi la tua tesi prima di decidere.</div>`;
}
function watchCard(c) { const row = radarRows().find(r => r.symbol === c.ticker); return `<article class="panel watch-card"><span class="ticker-logo ${c.hue}">${esc(c.ticker.slice(0, 4))}</span><div class="watch-card-content"><div class="watch-card-header"><div><button class="company-title" data-asset="${esc(c.ticker)}"><h3>${esc(c.name)}</h3></button><small>${esc(c.ticker)} · ${esc(c.sector)}</small></div><button class="bookmark-button saved" data-bookmark="${esc(c.ticker)}" aria-label="Rimuovi ${esc(c.name)} dalla watchlist">${icon('bookmark')}</button></div>${row ? `<div class="watch-price"><strong>${marketPrice(row)}</strong><span class="${tone(row.day)}">${marketChange(row.day)}</span><small>${marketStamp(row)}</small></div>` : '<div class="watch-price muted">In attesa dei dati del radar</div>'}<p class="watch-note">${esc(state.notes[c.ticker] || 'Perché la segui? Scrivi la tua tesi e il fatto che potrebbe cambiarla.')}</p><div class="watch-actions"><button class="button-subtle" data-note="${esc(c.ticker)}">${state.notes[c.ticker] ? 'Modifica tesi' : 'Scrivi una tesi'}</button><button class="button-subtle" data-alert-symbol="${esc(c.ticker)}">Obiettivo ${icon('bell')}</button></div></div></article>`; }
function renderWatchlist() { const rows = state.watchlist.map(t => company(t)); return `${pageHeading('Le idee che vuoi tenere vicine', 'Osserva. Studia. Decidi.', 'Prezzi, tesi personali e obiettivi. Un posto per ogni idea.', `<button class="button-secondary" data-nav="discover">Trova aziende ${icon('compass')}</button>`)}${rows.length ? `<div class="watchlist-grid">${rows.map(watchCard).join('')}</div>` : `<div class="panel empty-state"><div class="empty-icon">${icon('bookmark')}</div><h3>La prossima idea parte da qui.</h3><p>Esplora il radar e salva le aziende che vuoi conoscere.</p><button class="button-primary" data-nav="discover">Apri il radar ${icon('arrow')}</button></div>`}<div id="alert-results">${alertsMarkup()}</div>`; }
function transactionRow(t) { const c = company(t.ticker, t.name); return `<div class="transaction-row"><div class="company-cell"><span class="ticker-logo ${c.hue}">${esc(c.ticker.slice(0, 4))}</span><span class="company-text"><strong>${esc(t.name || t.ticker)}</strong><small>${esc(c.ticker)} · ${day(t.date)}</small></span></div><span><span class="type-pill ${t.side === 'sell' ? 'sell' : ''}">${t.side === 'sell' ? 'Vendita' : 'Acquisto'}</span></span><span>${amount(t.quantity)}<small>azioni</small></span><span>${money(t.price)}<small>per azione</small></span><button type="button" class="delete-button" data-delete="${esc(t.id)}" aria-label="Elimina movimento ${esc(t.ticker)} del ${day(t.date)}">${icon('trash')}</button></div>`; }
function filteredTransactions() { return [...state.transactions].filter(t => (transactionSide === 'all' || t.side === transactionSide) && `${t.ticker} ${t.name} ${company(t.ticker).ticker}`.toLowerCase().includes(transactionSearch.toLowerCase())).sort((a, b) => (b.executedAt || b.date).localeCompare(a.executedAt || a.date)); }
function transactionsTable() { const rows = filteredTransactions(); return rows.length ? `<div class="transactions-heading"><span>Titolo</span><span>Operazione</span><span>Quantità</span><span>Prezzo</span><span></span></div>${rows.map(transactionRow).join('')}` : '<div class="empty-state"><h3>Nessun movimento trovato</h3><p>Importa il CSV o cambia i filtri.</p></div>'; }
function renderTransactions() { const stats = FormaResearch.ledger(state.transactions); return `${pageHeading('Il percorso del tuo capitale', 'Ogni scelta lascia una traccia.', 'Acquisti, vendite e risultati dello storico importato.', `<button class="button-secondary" data-action="import">Importa CSV ${icon('upload')}</button>`)}<div class="trade-metrics"><div class="panel"><span>Movimenti</span><strong>${state.transactions.length}</strong></div><div class="panel"><span>Risultato realizzato</span><strong class="${tone(stats.realized)}">${money(stats.realized)}</strong></div><div class="panel"><span>Commissioni totali</span><strong>${money(stats.fees)}</strong></div><div class="panel"><span>Vendite in profitto</span><strong>${stats.hitRate === null ? '—' : `${Math.round(stats.hitRate)}%`}</strong><small>${stats.wins}/${stats.sales} vendite abbinate</small></div></div><div class="toolbar"><label class="search-field">${icon('search')}<input id="transaction-search" type="search" placeholder="Cerca nei movimenti" value="${esc(transactionSearch)}" aria-label="Cerca nei movimenti"></label><div class="segmented" role="group" aria-label="Filtra operazione">${[['all','Tutti'],['buy','Acquisti'],['sell','Vendite']].map(([id, label]) => `<button data-trade-side="${id}" aria-pressed="${transactionSide === id}" class="${transactionSide === id ? 'active' : ''}">${label}</button>`).join('')}</div></div><div id="transaction-results" class="panel transactions-panel">${transactionsTable()}</div><p class="footnote">Risultato realizzato calcolato al costo medio ponderato, con commissioni di acquisto e vendita; senza imposte. ${stats.unmatched ? `${stats.unmatched} vendite eccedono gli acquisti disponibili: il loro risultato non abbinato è escluso. Importa lo storico completo.` : 'Per i dati fiscali usa i documenti del broker.'}</p>`; }
function quoteSettings() {
  const rows = holdings();
  const fields = rows.map(h => {
    const key = state.symbols?.[h.ticker] || (/^[A-Z]{2}[A-Z0-9]{10}$/.test(h.ticker) ? '' : h.ticker);
    const asset = catalogueAsset(key), symbol = asset?.symbol || key;
    const stamp = state.quoteMeta?.[h.ticker];
    const quoteTime = stamp?.asOf ? new Date(stamp.asOf * 1000).toLocaleString('it-IT') : '';
    return `<div class="quote-field"><label for="symbol-${esc(h.ticker)}"><strong>${esc(h.name)}</strong><small>${esc(h.ticker)}${asset ? ` · ${esc(asset.exchange)} / ${esc(asset.mic)}` : ''}${quoteTime ? ` · quotazione ${esc(quoteTime)}` : ''}</small></label><input id="symbol-${esc(h.ticker)}" name="${esc(h.ticker)}" value="${esc(symbol)}" placeholder="Simbolo, es. IREN" maxlength="64" autocomplete="off" spellcheck="false"></div>`;
  }).join('');
  return `<section class="panel settings-card quote-card"><h2>Quotazioni Twelve Data</h2><p>Associa ogni ISIN al simbolo usato da Twelve Data. I prezzi in USD vengono convertiti in EUR con il cambio del momento.</p>${rows.length && !state.demo ? `<form id="quote-form"><div class="quote-fields">${fields}</div><p class="form-hint">Puoi lasciare vuoti gli strumenti che vuoi aggiornare manualmente. Massimo 7 simboli per aggiornamento; il piano gratuito può avere limiti di mercato.</p><div id="quote-status" class="form-hint" role="status"></div><div class="form-actions"><button type="submit" class="button-primary">Salva e aggiorna prezzi</button></div></form>` : '<p class="form-hint">Importa prima i movimenti per collegare le tue posizioni.</p>'}<p class="form-hint">Fonte: Twelve Data. Verifica sempre prezzo, valuta, sede di negoziazione e orario prima di usarli.</p></section>`;
}
function cloudCard() {
  const conflictActions = cloudConflict ? `<div class="form-actions"><button type="button" class="button-secondary" data-action="cloud-use-remote">Usa copia cloud</button><button type="button" class="button-primary" data-action="cloud-use-local">Usa copia di questo dispositivo</button></div>` : '';
  return `<section class="panel settings-card quote-card"><div class="mini-title"><h2>Il tuo spazio, ovunque.</h2>${icon('shield')}</div><p>Movimenti, prezzi, watchlist, obiettivi e diario si ritrovano su PC e telefono. Una copia resta disponibile su questo dispositivo.</p><p id="cloud-status" class="form-hint" role="status">${esc(cloudMessage)}</p><button type="button" class="button-subtle" data-action="cloud-check">Controlla sincronizzazione ${icon('refresh')}</button>${conflictActions}</section>`;
}
function renderSettings() { return `${pageHeading('I tuoi dati', 'Tieni tutto aggiornato.', 'Importa le operazioni, collega i prezzi e ritrova i tuoi dati su PC e telefono.')}
    <section class="panel update-guide"><h2>Come aggiorno il portafoglio?</h2><div class="guide-steps"><div><strong>Hai comprato o venduto?</strong><p>Importa il nuovo CSV di Trade Republic. Le operazioni già importate vengono saltate: lascia disattivato “Sostituisci i movimenti”.</p><button class="button-secondary" data-action="import">Importa CSV</button></div><div><strong>Vuoi aggiornare i prezzi?</strong><p>Una volta associati i titoli a Twelve Data, li controlliamo all’apertura e ogni 20 minuti mentre usi il sito. Il CSV non serve per aggiornare le quotazioni.</p><button class="button-secondary" data-action="refresh-portfolio">Aggiorna prezzi ora</button></div><div><strong>Hai un nuovo titolo?</strong><p>Cercalo in Mercato e aprilo. Puoi associare la sua quotazione alla posizione importata; controlla che strumento e sede corrispondano.</p><button class="button-secondary" data-nav="discover">Cerca un titolo</button></div></div></section>
    ${cloudCard()}${quoteSettings()}<div class="settings-layout"><section class="panel settings-card"><h2>Importa movimenti</h2><p>Carica un CSV dei tuoi acquisti e vendite. Potrai scegliere a quali colonne corrispondono ticker, quantità, prezzo e data prima di importare.</p><div class="upload-box">${icon('upload')}<strong>Scegli un file CSV</strong><p>Il file viene letto sul tuo dispositivo.</p><label class="button-primary" for="csv-file">Seleziona file</label><input id="csv-file" type="file" accept=".csv,text/csv,text/plain"></div><div class="source-note">Trade Republic: Profilo, Estratti conto, Esportazione transazioni. Il file viene riconosciuto automaticamente; vengono importati solo acquisti e vendite di azioni e fondi. In alternativa puoi creare un CSV semplice: data, tipo, ticker, nome, quantità, prezzo, commissioni.</div></section>
    <section class="panel settings-card"><h2>I tuoi dati</h2><p>Scarica una copia per conservarla o spostarla su un altro dispositivo.</p><div class="setting-row"><div><strong>Esporta backup</strong><span>Movimenti, prezzi e watchlist in un file JSON</span></div><button class="button-subtle" data-action="export">Scarica</button></div><div class="setting-row"><div><strong>Ripristina backup</strong><span>Importa un file JSON esportato da Forma</span></div><div><label class="button-subtle" for="json-file" style="cursor:pointer">Scegli file</label><input id="json-file" type="file" accept=".json,application/json" hidden></div></div><div class="setting-row"><div><strong>Cancella tutti i dati</strong><span>Rimuove i dati salvati su questo browser</span></div><button class="danger-button" data-action="reset">Cancella</button></div><div class="feature-note">Il sito non chiede password Trade Republic. Un backup JSON può contenere informazioni finanziarie personali: conservalo con cura.</div></section></div>`; }
function render() { disposeCharts(); renderNav(); const pages = { overview: renderOverview, discover: renderDiscover, ideas: renderIdeas, watchlist: renderWatchlist, lab: renderLab, transactions: renderTransactions, settings: renderSettings }; const missing = !state.demo && currentPage === 'overview' ? holdings().filter(h => !h.hasPrice).length : 0; const warning = missing ? `<div class="demo-banner"><span><strong>Prezzi mancanti</strong> · ${missing} ${missing === 1 ? 'posizione è mostrata' : 'posizioni sono mostrate'} al costo. Il rendimento è incompleto.</span><button type="button" data-nav="settings">Collega prezzi</button></div>` : ''; $('#main-content').innerHTML = `<div class="page-enter">${warning}${friendlyHelp()}${pages[currentPage]()}</div>`; document.title = `${NAV.find(n => n.id === currentPage)?.label} — Forma`; animatePage(); mountCharts(); }
function go(page) { if (!NAV.some(n => n.id === page)) return; currentPage = page; window.scrollTo({ top: 0, behavior: 'smooth' }); render(); if (page === 'discover') ensureCatalogue(); if (page === 'ideas') fetchDiscovery(true); }
function modal(title, subtitle, body, wide = false) { disposeCharts($('#modal-root')); if (!$('#modal-root').innerHTML) modalReturnFocus = document.activeElement; document.body?.classList.add('modal-open'); $('#modal-root').innerHTML = `<div class="modal-backdrop"><div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-head"><div><h2>${title}</h2><p>${subtitle}</p></div><button type="button" class="close-button" data-close aria-label="Chiudi">×</button></div>${body}</div></div>`; $('.modal input, .modal textarea, .modal button:not(.close-button)')?.focus(); }
function closeModal() { disposeCharts($('#modal-root')); $('#modal-root').innerHTML = ''; document.body?.classList.remove('modal-open'); importData = null; modalReturnFocus?.focus?.(); modalReturnFocus = null; }
function resetDemo() { state = { ...clone(DEMO), demo: false, transactions: [], prices: {}, watchlist: [], notes: {}, hidden: state.hidden }; save(); render(); toast('Ora puoi inserire i tuoi dati.'); }
function ensureRealData() { if (state.demo) { state.demo = false; state.transactions = []; state.prices = {}; state.watchlist = []; state.notes = {}; } }
function addModal() { modal('Aggiungi un movimento', 'Registra un acquisto o una vendita.', `<form id="trade-form"><div class="form-grid"><div class="form-field"><label for="trade-side">Operazione</label><select id="trade-side" name="side"><option value="buy">Acquisto</option><option value="sell">Vendita</option></select></div><div class="form-field"><label for="trade-date">Data</label><input id="trade-date" name="date" type="date" required value="${new Date().toISOString().slice(0, 10)}"></div><div class="form-field"><label for="trade-ticker">Ticker</label><input id="trade-ticker" name="ticker" placeholder="es. IREN" maxlength="16" required autocomplete="off"></div><div class="form-field"><label for="trade-name">Nome azienda</label><input id="trade-name" name="name" placeholder="es. IREN Limited" maxlength="100" autocomplete="off"></div><div class="form-field"><label for="trade-quantity">Quantità</label><input id="trade-quantity" name="quantity" type="number" min="0.000001" step="any" required placeholder="0"></div><div class="form-field"><label for="trade-price">Prezzo per azione (€)</label><input id="trade-price" name="price" type="number" min="0.000001" step="any" required placeholder="0,00"></div><div class="form-field full"><label for="trade-fees">Commissioni (€)</label><input id="trade-fees" name="fees" type="number" min="0" step="any" value="0"></div></div><p class="form-hint">Inserisci i prezzi in euro, come nei movimenti del broker. Il valore corrente potrà essere aggiornato separatamente.</p><div class="form-actions"><button type="button" class="button-secondary" data-close>Annulla</button><button type="submit" class="button-primary">Salva movimento</button></div></form>`); }
function priceModal() { const rows = holdings(); if (!rows.length) { toast('Aggiungi prima un movimento.'); return; } modal('Aggiorna prezzi', 'Inserisci l’ultimo prezzo che vuoi usare per ciascun titolo.', `<form id="price-form"><div class="form-grid">${rows.map(h => `<div class="form-field"><label for="price-${esc(h.ticker)}">${esc(h.ticker)} · prezzo in €</label><input id="price-${esc(h.ticker)}" name="${esc(h.ticker)}" type="number" min="0.000001" step="any" required value="${h.current}"></div>`).join('')}</div><p class="form-hint">I prezzi collegati a Twelve Data si aggiornano automaticamente. Data e fonte della quotazione vanno controllate nel tuo broker.</p><div class="form-actions"><button type="button" class="button-secondary" data-close>Annulla</button><button type="submit" class="button-primary">Salva prezzi</button></div></form>`); }
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
function showTradeRepublicImport(rows, filename) {
  const parsed = window.TradeRepublicImport.parseTradeRepublicRows(rows);
  importData = { kind: 'trade-republic', ...parsed };
  const errorText = parsed.errors.length ? `<div class="import-result" role="alert">${parsed.errors.length} righe da controllare: ${esc(parsed.errors.slice(0, 4).join('; '))}. Non importerò dati parziali.</div>` : '';
  modal('Importa Trade Republic', `${esc(filename)} · file riconosciuto`, `<form id="tr-import-form"><div class="import-summary"><strong>${parsed.transactions.length} operazioni su titoli e fondi</strong><span>${parsed.skippedCash} movimenti di cassa esclusi</span></div><p class="form-hint">Il file viene letto solo nel browser. Gli strumenti sono identificati con il loro ISIN. Dopo l’importazione puoi collegare Twelve Data o inserire i prezzi; finché mancano, le posizioni sono mostrate al costo.</p>${errorText}<label class="import-replace"><input type="checkbox" name="replace"> Sostituisci i movimenti già presenti in Forma</label><div class="form-actions"><button type="button" class="button-secondary" data-close>Annulla</button><button type="submit" class="button-primary" ${parsed.errors.length || !parsed.transactions.length ? 'disabled' : ''}>Importa ${parsed.transactions.length} operazioni</button></div></form>`, true);
}
function showImportMapping(rows, filename) {
  if (rows.length < 2) { toast('Il CSV non contiene righe di dati.'); return; }
  if (window.TradeRepublicImport.isTradeRepublicExport(rows[0])) { showTradeRepublicImport(rows, filename); return; }
  importData = rows;
  const headers = rows[0]; const fields = [ ['date','Data'],['side','Operazione'],['ticker','Ticker o ISIN'],['name','Nome azienda'],['quantity','Quantità'],['price','Prezzo per azione'],['fees','Commissioni'] ];
  const opts = (selected) => `<option value="">— Scegli colonna —</option>${headers.map((h, i) => `<option value="${i}" ${String(i) === selected ? 'selected' : ''}>${esc(h || `Colonna ${i + 1}`)}</option>`).join('')}`;
  modal('Controlla le colonne', `${esc(filename)} · ${rows.length - 1} righe`, `<form id="import-form"><div class="form-grid">${fields.map(([key,label]) => `<div class="form-field"><label for="map-${key}">${label}</label><select id="map-${key}" name="${key}">${opts(guessColumn(headers, key))}</select></div>`).join('')}</div><p class="form-hint">Servono data, operazione, ticker, quantità e prezzo. I valori dell'operazione devono indicare acquisto o vendita. Controlla la prima riga prima di importare.</p><div class="import-preview"><table><thead><tr>${headers.slice(0, 8).map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1, 4).map(r => `<tr>${r.slice(0, 8).map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div id="import-error" class="import-result" role="alert"></div><div class="form-actions"><button type="button" class="button-secondary" data-close>Annulla</button><button type="submit" class="button-primary">Importa movimenti</button></div></form>`, true);
}
function normalizeDate(raw) { const value = String(raw || '').trim(); if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10); const m = value.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/); return m ? `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}` : ''; }
function normalizeSide(raw) { const value = String(raw || '').toLowerCase(); if (/buy|acquist|kauf|purchase|sparplan|investment/.test(value)) return 'buy'; if (/sell|vendit|verkauf|sale/.test(value)) return 'sell'; return ''; }
async function refreshQuotes(entries, quiet = false) {
  const status = $('#quote-status');
  const button = $('#quote-form button[type="submit"]');
  if (status) status.textContent = 'Aggiornamento in corso…';
  if (button) button.disabled = true;
  try {
    const symbols = [...new Set(entries.map(([, symbol]) => symbol))];
    const response = await fetch(`/api/quotes?symbols=${encodeURIComponent(symbols.join(','))}`);
    const data = await response.json();
    if (!response.ok) throw Error(data.error || 'Quotazioni non disponibili.');
    const quotes = new Map((data.quotes || []).map(q => [q.symbol, q]));
    let updated = 0;
    state.quoteMeta ||= {};
    for (const [isin, symbol] of entries) {
      const quote = quotes.get(symbol);
      if (!quote || !Number.isFinite(quote.priceEur) || quote.priceEur <= 0) continue;
      state.prices[isin] = quote.priceEur;
      state.quoteMeta[isin] = { symbol, originalPrice: quote.price, currency: quote.currency,
        exchange: quote.exchange, fxRate: quote.fxRate, asOf: quote.asOf, fetchedAt: data.fetchedAt };
      updated++;
    }
    save(!quiet); render();
    const message = `${updated} ${updated === 1 ? 'prezzo aggiornato' : 'prezzi aggiornati'}${data.errors?.length ? `. ${data.errors.join('; ')}` : '.'}`;
    if ($('#quote-status')) $('#quote-status').textContent = message;
    if (!quiet) toast(message);
    return true;
  } catch (error) {
    if (status) status.textContent = error.message || 'Impossibile aggiornare le quotazioni.';
    return false;
  } finally {
    if (button && button.isConnected) button.disabled = false;
  }
}
let autoQuoteBusy = false;
let lastAutoQuoteAttempt = 0;
async function autoRefreshQuotes() {
  if (document.hidden || autoQuoteBusy || state.demo) return;
  const entries = holdings().map(h => [h.ticker, state.symbols?.[h.ticker]]).filter(([, symbol]) => symbol);
  if (!entries.length || new Set(entries.map(([, symbol]) => symbol)).size > 7) return;
  const now = Date.now();
  if (now - lastAutoQuoteAttempt < 60_000) return;
  const stale = entries.some(([isin]) => now - Date.parse(state.quoteMeta?.[isin]?.fetchedAt || '') > 20 * 60_000 || !state.quoteMeta?.[isin]?.fetchedAt);
  if (!stale) return;
  autoQuoteBusy = true;
  lastAutoQuoteAttempt = now;
  try { await refreshQuotes(entries, true); } finally { autoQuoteBusy = false; }
}
function download(name, data, type) { const blob = new Blob([data], { type }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
document.addEventListener('click', event => {
  const nav = event.target.closest('[data-nav]'); if (nav) { event.preventDefault(); if ($('.modal')) closeModal(); go(nav.dataset.nav); return; }
  if (event.target.closest('[data-close]') || event.target.classList.contains('modal-backdrop')) { closeModal(); return; }
  const saved = event.target.closest('[data-bookmark]'); if (saved) { const ticker = saved.dataset.bookmark; const index = state.watchlist.indexOf(ticker); if (index < 0 && !radarSymbols().includes(ticker) && radarSymbols().length >= 40) { toast('Il radar è pieno. Rimuovi un ticker per seguire una nuova azienda.'); return; } if (index < 0) { rememberCatalogueAsset(ticker); state.watchlist.push(ticker); } else state.watchlist.splice(index, 1); if ($('.modal')) closeModal(); save(); render(); fetchMarket(); toast(index < 0 ? 'Aggiunta alla watchlist.' : 'Rimossa dalla watchlist.'); return; }
  const note = event.target.closest('[data-note]'); if (note) { noteModal(note.dataset.note); return; }
  const del = event.target.closest('[data-delete]'); if (del) { if (confirm('Eliminare questo movimento?')) { state.transactions = state.transactions.filter(t => t.id !== del.dataset.delete); save(); render(); toast('Movimento eliminato.'); } return; }
  const filter = event.target.closest('[data-filter]'); if (filter) { discoverFilter = filter.dataset.filter; render(); $('#company-search')?.focus(); return; }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'clear-demo') resetDemo();
  else if (action === 'add') addModal();
  else if (action === 'more-nav') modal('Il tuo spazio','Simulazioni, operazioni e gestione dei dati.',`<div class="more-navigation">${NAV.filter(n=>['lab','transactions','settings'].includes(n.id)).map(n=>`<button class="button-secondary" data-nav="${n.id}">${icon(n.icon)}${n.label}${icon('arrow')}</button>`).join('')}</div>`);
  else if (action === 'update-prices') priceModal();
  else if (action === 'import') importModal();
  else if (action === 'cloud-check') cloudPull();
  else if (action === 'cloud-use-remote' && cloudConflict) {
    if (!confirm('Sostituire i dati su questo dispositivo con la copia cloud?')) return;
    localStorage.setItem('forma-invest-conflict-backup', JSON.stringify(state));
    adoptCloud(cloudConflict.state, cloudConflict.revision);
  }
  else if (action === 'cloud-use-local' && cloudConflict) {
    if (!confirm('Sostituire la copia cloud con i dati di questo dispositivo?')) return;
    localStorage.setItem('forma-invest-conflict-backup', JSON.stringify(cloudConflict.state));
    cloudConflict = null; cloudReady = true; cloudDirty = true;
    cloudWrite();
    render();
  }
  else if (action === 'export') { download(`forma-backup-${new Date().toISOString().slice(0,10)}.json`, JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2), 'application/json'); toast('Backup scaricato.'); }
  else if (action === 'reset') { if (confirm('Cancellare tutti i dati di Forma su questo browser e nel cloud, se collegato?')) { state = { ...clone(DEMO), demo: false, transactions: [], prices: {}, watchlist: [], notes: {} }; save(); go('overview'); toast('Dati cancellati.'); } }
});
$('#open-add').addEventListener('click', addModal);
$('#privacy-toggle').addEventListener('click', () => { state.hidden = !state.hidden; save(); render(); });
document.addEventListener('input', event => { if (event.target.id === 'company-search') { discoverSearch = event.target.value; const found = COMPANIES.filter(c => (discoverFilter === 'Tutte' || c.group === discoverFilter) && (`${c.ticker} ${c.name} ${c.sector}`.toLowerCase().includes(discoverSearch.toLowerCase()))); $('#company-results').innerHTML = found.length ? found.map(companyCard).join('') : `<div class="panel empty-state"><h3>Nessun risultato</h3><p>Prova un nome o un settore diverso.</p></div>`; } });
document.addEventListener('submit', event => {
  if (event.target.id === 'quote-form') {
    event.preventDefault();
    const entries = [...new FormData(event.target)].map(([isin, value]) => { const entered = String(value).trim().toUpperCase(), old = state.symbols?.[isin], asset = catalogueAsset(old); return [isin, asset && entered === asset.symbol ? old : entered]; }).filter(([, symbol]) => symbol);
    if (entries.some(([, symbol]) => !/^[A-Z0-9][A-Z0-9._:-]{0,63}$/.test(symbol))) { $('#quote-status').textContent = 'Controlla i simboli inseriti.'; return; }
    if (new Set(entries.map(([, symbol]) => symbol)).size > 7) { $('#quote-status').textContent = 'Aggiorna al massimo 7 simboli per volta.'; return; }
    const nextSymbols = Object.fromEntries(entries);
    for (const isin of Object.keys(state.quoteMeta || {})) {
      if (state.quoteMeta[isin].symbol !== nextSymbols[isin]) {
        delete state.quoteMeta[isin];
        delete state.prices[isin];
      }
    }
    state.symbols = nextSymbols;
    save();
    if (!entries.length) { $('#quote-status').textContent = 'Inserisci almeno un simbolo da aggiornare.'; return; }
    refreshQuotes(entries);
    return;
  }
  if (event.target.id === 'trade-form') { event.preventDefault(); const f = new FormData(event.target); const ticker = String(f.get('ticker') || '').trim().toUpperCase(); const quantity = Number(f.get('quantity')), price = Number(f.get('price')), fees = Number(f.get('fees') || 0); if (!ticker || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price <= 0 || fees < 0) { toast('Controlla ticker, quantità e prezzo.'); return; } const side = String(f.get('side')); if (side === 'sell') { const owned = state.demo ? 0 : holdings().find(h => h.ticker === ticker)?.quantity || 0; if (quantity > owned + 1e-9) { toast('La vendita supera la quantità in portafoglio.'); return; } } ensureRealData(); state.transactions.push({ id: crypto.randomUUID(), date: String(f.get('date')), side, ticker, name: String(f.get('name') || company(ticker).name).trim(), quantity, price, fees }); save(); closeModal(); go('transactions'); toast('Movimento salvato.'); }
  else if (event.target.id === 'price-form') { event.preventDefault(); const f = new FormData(event.target); for (const [key, value] of f) { const price = Number(value); if (!Number.isFinite(price) || price <= 0) { toast(`Controlla il prezzo di ${key}.`); return; } state.prices[key] = price; if (state.quoteMeta) delete state.quoteMeta[key]; } save(); closeModal(); render(); toast('Prezzi aggiornati.'); }
  else if (event.target.id === 'note-form') { event.preventDefault(); const ticker = event.target.dataset.ticker; state.notes[ticker] = String(new FormData(event.target).get('note') || '').trim(); save(); closeModal(); render(); toast('Nota salvata.'); }
  else if (event.target.id === 'tr-import-form') {
    event.preventDefault();
    if (importData?.kind !== 'trade-republic' || importData.errors.length || !importData.transactions.length) return;
    const replace = new FormData(event.target).has('replace');
    if (replace && !confirm('Sostituire tutti i movimenti e i prezzi già salvati in questo browser?')) return;
    const skippedCash = importData.skippedCash;
    ensureRealData();
    if (replace) { state.transactions = []; state.prices = {}; state.symbols = {}; state.quoteMeta = {}; }
    const existing = new Set(state.transactions.map(t => t.id));
    let added = 0;
    for (const trade of importData.transactions) {
      if (existing.has(trade.id)) continue;
      state.transactions.push(trade);
      existing.add(trade.id);
      added++;
    }
    save(); closeModal(); go('transactions');
    toast(`${added} operazioni importate. ${skippedCash} movimenti di cassa esclusi.`);
  }
  else if (event.target.id === 'import-form') { event.preventDefault(); if (!importData) return; const f = new FormData(event.target); const map = Object.fromEntries([...f].map(([k,v]) => [k, v === '' ? -1 : Number(v)])); const required = ['date','side','ticker','quantity','price']; if (required.some(k => map[k] < 0)) { $('#import-error').textContent = 'Abbina tutte le colonne obbligatorie.'; return; } const imported = [], errors = []; for (let i = 1; i < importData.length; i++) { const r = importData[i], date = normalizeDate(r[map.date]), side = normalizeSide(r[map.side]), ticker = String(r[map.ticker] || '').trim().toUpperCase(), quantity = num(r[map.quantity]), price = num(r[map.price]), fees = map.fees >= 0 ? num(r[map.fees]) || 0 : 0; if (!date || !side || !ticker || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price <= 0) { errors.push(i + 1); continue; } imported.push({ id: crypto.randomUUID(), date, side, ticker, name: map.name >= 0 ? String(r[map.name] || ticker).trim() : company(ticker).name, quantity, price, fees }); } if (errors.length) { $('#import-error').textContent = `${errors.length} righe non riconosciute (${errors.slice(0, 5).join(', ')}${errors.length > 5 ? '…' : ''}). Correggi il CSV o le colonne: non è stato importato nulla.`; return; } if (!imported.length) { $('#import-error').textContent = 'Nessun movimento valido trovato.'; return; } ensureRealData(); const signatures = new Set(state.transactions.map(t => `${t.date}|${t.side}|${t.ticker}|${t.quantity}|${t.price}|${t.fees}`)); let added = 0; for (const t of imported) { const sig = `${t.date}|${t.side}|${t.ticker}|${t.quantity}|${t.price}|${t.fees}`; if (!signatures.has(sig)) { state.transactions.push(t); signatures.add(sig); added++; } } save(); closeModal(); go('transactions'); toast(`${added} movimenti importati. ${imported.length - added} duplicati ignorati.`); }
});
document.addEventListener('change', async event => {
  if (['csv-file','modal-csv-file'].includes(event.target.id)) { const file = event.target.files?.[0]; if (!file) return; if (file.size > 5_000_000) { toast('Il CSV supera 5 MB.'); return; } try { const text = await file.text(); showImportMapping(csvRows(text.replace(/^\uFEFF/, '')), file.name); } catch (_) { toast('Non riesco a leggere il CSV.'); } }
  if (event.target.id === 'json-file') { const file = event.target.files?.[0]; if (!file) return; try { const data = JSON.parse(await file.text()); if (!Array.isArray(data.transactions) || !Array.isArray(data.watchlist) || typeof data.prices !== 'object') throw Error('invalid'); if (!confirm('Sostituire i dati attuali con il backup selezionato?')) return; state = { ...clone(DEMO), ...data, demo: false }; save(); go('overview'); toast('Backup ripristinato.'); } catch (_) { toast('Il file non è un backup valido di Forma.'); } }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeModal();
  if (event.key === 'Tab' && $('.modal')) {
    const items = [...$('.modal').querySelectorAll('button, input, select, textarea, a[href]')].filter(el => !el.disabled && !el.hidden);
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
});
render();
cloudPull().then(async () => { await autoRefreshQuotes(); fetchMarket(); });
setInterval(autoRefreshQuotes, 60_000);
setInterval(() => { if (!document.hidden) cloudPull(); }, 5 * 60_000);
setInterval(fetchMarket, 15_000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { cloudPull().then(async () => { await autoRefreshQuotes(); fetchMarket(); }); } });
