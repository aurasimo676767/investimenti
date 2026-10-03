function tone(value) { return value > 0 ? 'gain' : value < 0 ? 'loss' : 'neutral'; }
function marketChange(value) { return Number.isFinite(value) ? percentage(value) : '—'; }
function marketPrice(row) { return row ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: /^[A-Z]{3}$/.test(row.currency) ? row.currency : 'USD', maximumFractionDigits: 2 }).format(row.price) : '—'; }
function marketStamp(row) { return row?.date ? day(row.date) : 'Prezzo non disponibile'; }
function radarSymbols() { return [...new Set([...(state.radarSymbols || DEFAULT_RADAR), ...state.watchlist, ...holdings().map(h => state.symbols?.[h.ticker] || (/^[A-Z]{2}[A-Z0-9]{10}$/.test(h.ticker) ? '' : h.ticker))].filter(Boolean))].slice(0, 40); }
function radarRows() { const symbols = radarSymbols(); return marketData.rows.filter(r => symbols.includes(r.symbol)); }
function sortedMovers() { return radarRows().filter(r => Number.isFinite(r[marketTimeframe]) && (marketDirection === 'gainers' ? r[marketTimeframe] > 0 : r[marketTimeframe] < 0)).sort((a, b) => marketDirection === 'gainers' ? b[marketTimeframe] - a[marketTimeframe] : a[marketTimeframe] - b[marketTimeframe]); }
function marketPanel(compact = false) {
  const rows = sortedMovers().slice(0, compact ? 5 : 12), available = radarRows();
  const labels = { day: 'Giorno', week: 'Settimana', month: 'Mese' }, sessions = { day: 1, week: 5, month: 21 };
  const mostRecent = available.map(r => r.date).sort().at(-1);
  const stale = available.some(r => Date.now() - r.fetchedAt > 2 * 60 * 60_000);
  return `<div class="panel market-panel"><div class="market-command"><div class="segmented" role="group" aria-label="Periodo tendenze">${Object.entries(labels).map(([key, label]) => `<button type="button" data-timeframe="${key}" aria-pressed="${marketTimeframe === key}" class="${marketTimeframe === key ? 'active' : ''}">${label}</button>`).join('')}</div><div class="direction-switch" role="group" aria-label="Direzione tendenze"><button data-direction="gainers" aria-pressed="${marketDirection === 'gainers'}" class="${marketDirection === 'gainers' ? 'active gain' : ''}">${icon('arrow')}In salita</button><button data-direction="losers" aria-pressed="${marketDirection === 'losers'}" class="${marketDirection === 'losers' ? 'active loss' : ''}">${icon('down')}In discesa</button></div></div>
    ${rows.length ? `<div class="movers-grid ${compact ? 'compact' : ''}">${rows.map((r, i) => { const c = company(r.symbol), change = r[marketTimeframe]; return `<article class="mover ${i === 0 ? 'mover-lead' : ''} ${tone(change)}"><div class="mover-top"><button class="ticker-logo ${c.hue}" data-asset="${esc(r.symbol)}" aria-label="Dettagli di ${esc(c.name)}">${esc(r.symbol.slice(0, 4))}</button><span class="mover-rank">${i === 0 ? icon('spark') : `${i + 1}° nel radar`}</span></div><button class="mover-name" data-asset="${esc(r.symbol)}"><strong>${esc(c.name)}</strong><span>${esc(r.symbol)} <i>${esc(r.exchange)}</i></span></button><div class="mover-change">${marketChange(change)}${icon(change < 0 ? 'down' : 'arrow')}</div><div class="mover-footer"><span>${marketPrice(r)}</span><button class="bookmark-button ${state.watchlist.includes(r.symbol) ? 'saved' : ''}" data-bookmark="${esc(r.symbol)}" aria-pressed="${state.watchlist.includes(r.symbol)}" aria-label="${state.watchlist.includes(r.symbol) ? 'Rimuovi dalla' : 'Aggiungi alla'} watchlist ${esc(c.name)}">${icon('bookmark')}</button></div><small class="mover-date">${marketStamp(r)}</small></article>`; }).join('')}</div>` : `<div class="market-empty"><div class="scan-icon">${icon(marketBusy ? 'refresh' : 'compass')}</div><div><h3>${available.length ? `Nessun titolo ${marketDirection === 'gainers' ? 'in salita' : 'in discesa'} nel periodo` : 'Il radar sta prendendo forma.'}</h3><p>${available.length ? 'Prova l’altra direzione o cambia il periodo.' : 'Le serie reali vengono caricate in piccoli gruppi per rispettare la quota Twelve Data.'}</p></div>${!marketBusy ? '<button class="button-secondary" data-action="market-refresh">Carica dati</button>' : '<span class="loading-dots" aria-label="Caricamento"><i></i><i></i><i></i></span>'}</div>`}
    <div class="market-foot"><span class="data-status ${stale ? 'is-stale' : ''}"><i></i>${available.length}/${radarSymbols().length} aziende${marketBusy ? ' · aggiornamento' : stale ? ' · dati da aggiornare' : ''}</span><span>Ultimo / ${sessions[marketTimeframe]} ${sessions[marketTimeframe] === 1 ? 'seduta' : 'sedute'} prima${mostRecent ? ` · ${day(mostRecent)}` : ''}</span><button class="text-button" data-action="market-method">Come funziona ${icon('info')}</button></div>
    ${marketError || marketData.error ? `<p class="inline-warning" role="status">${esc(marketError || marketData.error)}</p>` : ''}${!compact && marketData.errors?.length ? `<p class="inline-warning">Non disponibili: ${marketData.errors.map(e => esc(e.symbol)).join(', ')}. Controlla i ticker o il piano Twelve Data.</p>` : ''}
  </div>`;
}
function ideasMarkup() {
  const owned = holdings().map(h => state.symbols?.[h.ticker] || h.ticker);
  const candidates = FormaResearch.signals(radarRows(), owned);
  const list = candidates.length ? candidates : ['MSFT','TSM','LLY'].filter(s => !owned.includes(s)).map(symbol => ({ symbol, reason: 'Ricerca fondamentale', caution: 'Apri le fonti ufficiali e costruisci la tua tesi.' }));
  return list.map((r, i) => { const c = company(r.symbol); return `<article class="panel idea-card"><div class="idea-top"><span class="idea-label">${icon(i === 0 ? 'spark' : 'compass')}${esc(r.reason)}</span><button class="bookmark-button ${state.watchlist.includes(r.symbol) ? 'saved' : ''}" data-bookmark="${esc(r.symbol)}" aria-pressed="${state.watchlist.includes(r.symbol)}" aria-label="Salva o rimuovi ${esc(c.name)}">${icon('bookmark')}</button></div><div class="idea-company"><span class="ticker-logo ${c.hue}">${esc(c.ticker.slice(0, 4))}</span><div><h3>${esc(c.name)}</h3><span>${esc(c.symbol || c.ticker)} · ${esc(c.sector)}</span></div></div><p>${esc(c.description)}</p>${Number.isFinite(r.week) ? `<div class="idea-evidence"><span>5 sedute <strong class="${tone(r.week)}">${marketChange(r.week)}</strong></span><span>21 sedute <strong class="${tone(r.month)}">${marketChange(r.month)}</strong></span></div>` : '<div class="idea-evidence"><span>Selezione editoriale · senza previsione di rendimento</span></div>'}<div class="idea-caution">${icon('info')}<span>${esc(r.caution)}</span></div><button class="idea-link" data-asset="${esc(r.symbol)}">Approfondisci ${icon('arrow')}</button></article>`; }).join('');
}
function updateMarketViews() {
  if ($('#dashboard-market')) $('#dashboard-market').innerHTML = marketPanel(true);
  if ($('#dashboard-ideas')) $('#dashboard-ideas').innerHTML = ideasMarkup();
  if ($('#radar-market')) $('#radar-market').innerHTML = marketPanel(false);
  if ($('#alert-results')) $('#alert-results').innerHTML = alertsMarkup(false);
}
async function fetchMarket(force = false) {
  if (marketBusy || (currentPage === 'discover' && catalogueBusy) || document.hidden || !window.location?.protocol?.startsWith('http')) return;
  const now = Date.now();
  if (now - marketLastAttempt < 65_000 || (!force && now < marketNext)) return;
  marketBusy = true; marketLastAttempt = now; marketError = ''; updateMarketViews();
  try {
    const response = await fetch(`/api/market?symbols=${encodeURIComponent(radarSymbols().join(','))}`, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw Error(data.error || 'Radar non disponibile.');
    marketData = data; localStorage.setItem('forma-market-v1', JSON.stringify(data));
    marketNext = Date.now() + (data.retryAfter || 600) * 1000;
  } catch (error) { marketError = error.message || 'Connessione al radar non riuscita.'; marketNext = Date.now() + 5 * 60_000; }
  finally { marketBusy = false; updateMarketViews(); }
}
function marketMethodModal() {
  modal('Le tendenze, spiegate.', 'Dati reali. Un perimetro preciso.', `<div class="method-copy"><p>Il radar confronta <strong>le ${radarSymbols().length} aziende monitorate</strong>, comprese watchlist e posizioni associate a un ticker. La classifica riguarda questo insieme: non l’intero mercato.</p><div class="method-periods"><div><strong>Giorno</strong><span>Ultimo prezzo / chiusura della seduta precedente</span></div><div><strong>Settimana</strong><span>Ultimo prezzo / chiusura di 5 sedute prima</span></div><div><strong>Mese</strong><span>Ultimo prezzo / chiusura di 21 sedute prima</span></div></div><p>Fonte: <strong>Twelve Data</strong>, serie giornaliere corrette per gli split. L’ultima seduta può essere ancora in corso; a mercato chiuso viene mostrata l’ultima disponibile. I rendimenti sono di prezzo, nella valuta del titolo, senza dividendi.</p><p>Le serie vengono richieste in gruppi di massimo 6, distanziati di almeno 65 secondi, e conservate per un’ora. Il completamento iniziale può richiedere qualche minuto. Il cambio di periodo riusa gli stessi dati.</p><p>Un rialzo passato non è una previsione. Le idee escludono i titoli che possiedi e sono ordinate per il movimento a 5 sedute, con contesto a 21 sedute; senza dati, compare una selezione editoriale esplicitamente indicata.</p><a class="button-secondary" href="https://twelvedata.com/docs#time-series" target="_blank" rel="noopener noreferrer">Documentazione della fonte ${icon('arrow')}</a></div>`);
}
function radarModal() {
  modal('Disegna il tuo radar.', 'Scegli quali aziende confrontare.', `<form id="radar-form"><div class="form-field"><label for="radar-symbols">Ticker separati da virgola</label><textarea id="radar-symbols" name="symbols" maxlength="2600" required>${esc((state.radarSymbols || DEFAULT_RADAR).join(', '))}</textarea></div><p class="form-hint">Massimo 40 ticker in totale. Watchlist e posizioni con ticker vengono incluse automaticamente. I mercati disponibili dipendono dal piano Twelve Data.</p><div class="form-actions"><button type="button" class="button-secondary" data-close>Annulla</button><button class="button-primary" type="submit">Salva radar ${icon('arrow')}</button></div></form>`);
}
function assetModal(symbol) {
  const c = company(symbol), row = radarRows().find(r => r.symbol === symbol);
  modal(esc(c.name), `${esc(symbol)} · ${esc(c.sector)}`, `<div class="asset-quote"><span>${row ? marketPrice(row) : 'Prezzo non disponibile'}</span><small>${row ? `${marketStamp(row)} · Twelve Data · ${esc(row.exchange)}` : 'Aggiungi il titolo al radar per ottenere dati di mercato.'}</small></div><div class="asset-metrics">${[['day','1 seduta'],['week','5 sedute'],['month','21 sedute']].map(([key, label]) => `<div><span>${label}</span><strong class="${tone(row?.[key])}">${marketChange(row?.[key])}</strong></div>`).join('')}</div><p class="asset-description">${esc(c.description)}</p>${row ? `<div class="research-fact"><span>Dal massimo delle ${row.sessions} sedute disponibili</span><strong class="${tone(row.drawdown)}">${marketChange(row.drawdown)}</strong></div>` : ''}<div class="research-checklist"><h3>Prima di investire</h3><p>Bilancio e flusso di cassa · Valutazione rispetto alla crescita · Debito e diluizione · Prossimi risultati · Quanto potresti perdere</p></div><div class="form-actions asset-actions"><button class="button-secondary" data-open-chart="${esc(symbol)}">Apri grafico</button><button class="button-primary" data-bookmark="${esc(symbol)}">${state.watchlist.includes(symbol) ? 'Rimuovi dalla watchlist' : 'Segui azienda'} ${icon('bookmark')}</button><button class="button-secondary" data-alert-symbol="${esc(symbol)}">Obiettivo ${icon('bell')}</button>${c.url ? `<a class="button-subtle" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">Investor relations ${icon('arrow')}</a>` : ''}</div>`);
}
function alertStatus(a) {
  const row = radarRows().find(r => r.symbol === a.symbol);
  if (!row) return { reached: false, row, label: 'In attesa di un prezzo' };
  const reached = a.direction === 'above' ? row.price >= a.price : row.price <= a.price;
  return { reached, row, label: reached ? 'Livello raggiunto' : 'In osservazione' };
}
function alertsMarkup(compact = false) {
  const alerts = state.alerts || [];
  const shown = compact ? alerts.filter(a => alertStatus(a).reached).slice(0, 3) : alerts;
  if (!shown.length && compact) return '';
  return `<section class="panel alerts-panel"><div class="mini-title"><h3>${compact ? 'Livelli raggiunti' : 'I tuoi obiettivi di prezzo'}</h3><button class="button-subtle" data-action="alert-add">Nuovo ${icon('bell')}</button></div>${shown.length ? shown.map(a => { const status = alertStatus(a), currency = status.row?.currency || a.currency || 'USD'; return `<div class="alert-row"><span class="alert-icon ${status.reached ? 'reached' : ''}">${icon('bell')}</span><div><strong>${esc(a.symbol)} ${a.direction === 'above' ? '≥' : '≤'} ${new Intl.NumberFormat('it-IT', { style: 'currency', currency }).format(a.price)}</strong><small>${esc(a.note || 'Obiettivo personale')} · ${status.label}${status.row ? ` · ${marketStamp(status.row)}` : ''}</small></div><button class="delete-button" data-alert-delete="${esc(a.id)}" aria-label="Elimina obiettivo ${esc(a.symbol)}">${icon('trash')}</button></div>`; }).join('') : '<div class="small-empty">Dai un prezzo alla tua idea. Gli obiettivi vengono controllati quando apri Forma e arrivano i dati del radar.</div>'}<p class="form-hint">Valuta del titolo. Controllo nel sito sui dati disponibili, senza notifiche in background.</p></section>`;
}
function alertModal(symbol = '') {
  modal('Un livello da tenere d’occhio.', 'Scegli un prezzo e scrivi perché conta.', `<form id="alert-form"><div class="form-grid"><div class="form-field"><label for="alert-symbol">Ticker</label><input id="alert-symbol" name="symbol" required maxlength="64" value="${esc(symbol)}" placeholder="IREN" autocomplete="off"></div><div class="form-field"><label for="alert-direction">Quando il prezzo è</label><select id="alert-direction" name="direction"><option value="below">Uguale o inferiore a</option><option value="above">Uguale o superiore a</option></select></div><div class="form-field"><label for="alert-price">Prezzo nella valuta del titolo</label><input id="alert-price" name="price" type="number" min="0.000001" step="any" required placeholder="0,00"></div><div class="form-field"><label for="alert-reason">Il motivo</label><input id="alert-reason" name="note" maxlength="250" placeholder="Il livello a cui rileggere la mia tesi"></div></div><p class="form-hint">L’obiettivo viene sincronizzato. Lo verifichiamo sui prezzi del radar mentre usi il sito.</p><div class="form-actions"><button type="button" class="button-secondary" data-close>Annulla</button><button class="button-primary" type="submit">Crea obiettivo ${icon('bell')}</button></div></form>`);
}
function scenarioOutput() {
  const p = portfolio(), result = FormaResearch.scenario(p.rows, scenarioTicker, scenarioChange);
  const recovery = result.delta < 0 && result.value > 0 ? `<div class="recovery-fact"><span>Per tornare al valore di oggi</span><strong>${percentage(-result.delta / result.value * 100)}</strong><small>di recupero sul portafoglio dopo lo scenario</small></div>` : '';
  return `<span class="scenario-caption">Il portafoglio passerebbe a</span><strong class="scenario-total">${money(result.value)}</strong><div class="scenario-impact ${tone(result.delta)}">${money(result.delta)} <span>${percentage(result.portfolioChange)} sul totale</span></div>${recovery}<div class="scenario-foot">Esposizione coinvolta: ${money(result.affected)}. Stima istantanea, con le altre posizioni ferme.</div>`;
}
function renderLab() {
  const p = portfolio(), stats = FormaResearch.ledger(state.transactions);
  const top = p.rows[0], concentration = top && p.value ? top.value / p.value * 100 : 0;
  const priced = p.rows.filter(h => h.hasPrice).length;
  return `${pageHeading('Uno spazio per pensare meglio', 'Metti alla prova le tue idee.', 'Scenari, concentrazione e memoria delle tue decisioni.')}
    <section class="lab-grid"><article class="panel scenario-panel"><div class="mini-title"><h2>E se il prezzo cambiasse?</h2><span class="tool-symbol">${icon('lab')}</span></div><p>Una variazione sul titolo. L’effetto sul tuo capitale.</p><label class="scenario-select" for="scenario-ticker">Applica lo scenario a<select id="scenario-ticker"><option value="all">Tutto il portafoglio</option>${p.rows.map(h => `<option value="${esc(h.ticker)}" ${scenarioTicker === h.ticker ? 'selected' : ''}>${esc(company(h.ticker, h.name).name)}</option>`).join('')}</select></label><div class="scenario-slider-head"><span>Variazione ipotizzata</span><output id="scenario-change" class="${tone(scenarioChange)}">${percentage(scenarioChange)}</output></div><input id="scenario-range" aria-label="Variazione percentuale ipotizzata" type="range" min="-80" max="100" step="1" value="${scenarioChange}"><div class="scenario-presets">${[-30,-10,10,30].map(v => `<button data-scenario="${v}" class="${scenarioChange === v ? 'active' : ''}">${v > 0 ? '+' : ''}${v}%</button>`).join('')}</div><div id="scenario-result" aria-live="polite">${scenarioOutput()}</div><p class="form-hint">Scenario ipotetico, senza imposte o commissioni. ${priced < p.rows.length ? 'Alcune posizioni sono al costo: aggiorna i prezzi per migliorare la stima.' : 'Usa gli ultimi prezzi disponibili, non una previsione.'}</p></article>
    <article class="panel exposure-panel"><span class="section-kicker">La tua esposizione</span><h2>Il peso delle scelte.</h2><div class="exposure-number">${Math.round(concentration)}<span>%</span></div><p>${top ? `del portafoglio è in ${esc(company(top.ticker, top.name).name)}.` : 'Importa i movimenti per analizzare la concentrazione.'}</p><div class="exposure-fact"><span>Se la posizione maggiore perde il 20%</span><strong class="loss">${money(top ? -top.value * .2 : 0)}</strong></div><div class="exposure-fact"><span>Prezzi disponibili</span><strong>${priced}/${p.rows.length}</strong></div><div class="exposure-fact"><span>Commissioni nello storico</span><strong>${money(stats.fees)}</strong></div><p class="form-hint">Una sola azienda può cambiare il risultato complessivo. Lo scenario mantiene ferme le altre posizioni.</p></article></section>
    <section class="panel purchase-panel"><div class="mini-title"><div><h2>Prima del prossimo acquisto.</h2><p>Quanto pesa un nuovo investimento? A che prezzo cambia il pareggio?</p></div>${icon('wallet')}</div><form id="purchase-form"><div class="purchase-fields"><div class="form-field"><label for="purchase-position">Posizione</label><select id="purchase-position" name="ticker">${p.rows.map(h => `<option value="${esc(h.ticker)}">${esc(company(h.ticker, h.name).name)}</option>`).join('')}</select></div><div class="form-field"><label for="purchase-budget">Importo (€)</label><input id="purchase-budget" name="budget" type="number" min="1" step="any" placeholder="500" required></div><div class="form-field"><label for="purchase-price">Prezzo per azione (€)</label><input id="purchase-price" name="price" type="number" min="0.000001" step="any" placeholder="Prezzo ipotizzato" required></div><div class="form-field"><label for="purchase-fees">Commissioni (€)</label><input id="purchase-fees" name="fees" type="number" min="0" step="any" value="1"></div><button class="button-primary" type="submit" ${!p.rows.length ? 'disabled' : ''}>Simula ${icon('arrow')}</button></div><div id="purchase-result" class="purchase-result" aria-live="polite"><p>${p.rows.length ? 'La simulazione non registra un movimento.' : 'Aggiungi una posizione per simulare un acquisto.'}</p></div></form></section>
    <div id="alert-results">${alertsMarkup()}</div><div class="section-head"><div><span class="section-kicker">La memoria del tuo portafoglio</span><h2>Diario delle decisioni.</h2><p>Scrivi cosa pensi oggi. Rileggilo quando cambia il prezzo.</p></div><button class="button-primary" data-action="journal-add">Scrivi una decisione ${icon('arrow')}</button></div><section class="journal-grid">${journalMarkup()}</section>`;
}
function journalMarkup() {
  const entries = [...(state.journal || [])].sort((a, b) => b.createdAt - a.createdAt);
  return entries.length ? entries.map(e => `<article class="panel journal-entry"><div class="journal-meta"><span>${esc(e.symbol || 'Portafoglio')} · ${day(new Date(e.createdAt).toISOString().slice(0, 10))}</span><button class="delete-button" data-journal-delete="${esc(e.id)}" aria-label="Elimina decisione">${icon('trash')}</button></div><h3>${esc(e.title)}</h3><p>${esc(e.thesis)}</p>${e.invalidate ? `<div class="journal-invalidate"><span>Cambierei idea se</span><p>${esc(e.invalidate)}</p></div>` : ''}${e.review ? `<span class="review-date">${icon('bell')}Da rileggere il ${day(e.review)}</span>` : ''}</article>`).join('') : '<article class="panel journal-empty"><span class="tool-symbol">' + icon('bookmark') + '</span><h3>Il prezzo si muove. La tua tesi resta scritta.</h3><p>Conserva il motivo di una scelta, cosa potrebbe smentirla e quando vuoi rivederla. Si ritrova anche sul telefono.</p></article>';
}
function journalModal() {
  modal('Scrivi prima di decidere.', 'Lascia una traccia che potrai rileggere.', `<form id="journal-form"><div class="form-grid"><div class="form-field"><label for="journal-symbol">Ticker (facoltativo)</label><input id="journal-symbol" name="symbol" maxlength="64" placeholder="IREN"></div><div class="form-field"><label for="journal-review">Quando rileggere (facoltativo)</label><input id="journal-review" name="review" type="date"></div><div class="form-field full"><label for="journal-title">La decisione</label><input id="journal-title" name="title" maxlength="120" required placeholder="Perché sto valutando questa azienda"></div><div class="form-field full"><label for="journal-thesis">La tua tesi</label><textarea id="journal-thesis" name="thesis" maxlength="2500" required placeholder="Cosa mi aspetto? Su quali fatti si basa la mia idea?"></textarea></div><div class="form-field full"><label for="journal-invalidate">Cosa ti farebbe cambiare idea?</label><textarea id="journal-invalidate" name="invalidate" maxlength="1500" placeholder="Il fatto che smentirebbe la mia tesi"></textarea></div></div><div class="form-actions"><button type="button" class="button-secondary" data-close>Annulla</button><button class="button-primary" type="submit">Salva decisione ${icon('arrow')}</button></div></form>`, true);
}
function updateScenario() {
  $('#scenario-change').textContent = percentage(scenarioChange);
  $('#scenario-change').className = tone(scenarioChange);
  $('#scenario-result').innerHTML = scenarioOutput();
  document.querySelectorAll('[data-scenario]').forEach(el => el.classList.toggle('active', Number(el.dataset.scenario) === scenarioChange));
}
let experienceObserver = null;
function animatePage() {
  experienceObserver?.disconnect();
  if (!document.querySelectorAll || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }); }, { threshold: .08 });
  document.querySelectorAll('.section-head, .overview-lower, .ideas-grid, .dashboard-bottom-grid, .lab-grid, .journal-grid').forEach(el => { el.classList.add('reveal'); observer.observe(el); });
  experienceObserver = observer;
}
document.addEventListener('click', event => {
  const period = event.target.closest('[data-timeframe]'); if (period) { marketTimeframe = period.dataset.timeframe; updateMarketViews(); return; }
  const direction = event.target.closest('[data-direction]'); if (direction) { marketDirection = direction.dataset.direction; updateMarketViews(); return; }
  const asset = event.target.closest('[data-asset]'); if (asset) { catalogueAsset(asset.dataset.asset) ? openCatalogueAsset(asset.dataset.asset) : assetModal(asset.dataset.asset); return; }
  const alert = event.target.closest('[data-alert-symbol]'); if (alert) { alertModal(alert.dataset.alertSymbol); return; }
  const preset = event.target.closest('[data-scenario]'); if (preset) { scenarioChange = Number(preset.dataset.scenario); $('#scenario-range').value = scenarioChange; updateScenario(); return; }
  const alertDelete = event.target.closest('[data-alert-delete]'); if (alertDelete) { state.alerts = (state.alerts || []).filter(a => a.id !== alertDelete.dataset.alertDelete); save(); render(); toast('Obiettivo eliminato.'); return; }
  const journalDelete = event.target.closest('[data-journal-delete]'); if (journalDelete) { if (confirm('Eliminare questa decisione dal diario?')) { state.journal = (state.journal || []).filter(e => e.id !== journalDelete.dataset.journalDelete); save(); render(); } return; }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'market-refresh') { if (Date.now() - marketLastAttempt < 65_000) toast('Il radar riprova al prossimo minuto per rispettare la quota API.'); else fetchMarket(true); }
  else if (action === 'market-method') marketMethodModal();
  else if (action === 'radar-edit') radarModal();
  else if (action === 'alert-add') alertModal();
  else if (action === 'journal-add') journalModal();
  else if (action === 'refresh-portfolio') { const entries = holdings().map(h => [h.ticker, state.symbols?.[h.ticker]]).filter(([, symbol]) => symbol); if (entries.length) refreshQuotes(entries); else go('settings'); }
  const side = event.target.closest('[data-trade-side]'); if (side) { transactionSide = side.dataset.tradeSide; render(); }
});
document.addEventListener('input', event => {
  if (event.target.id === 'scenario-range') { scenarioChange = Number(event.target.value); updateScenario(); }
  if (event.target.id === 'transaction-search') { transactionSearch = event.target.value; $('#transaction-results').innerHTML = transactionsTable(); }
});
document.addEventListener('change', event => { if (event.target.id === 'scenario-ticker') { scenarioTicker = event.target.value; updateScenario(); } });
document.addEventListener('submit', event => {
  const id = event.target.id;
  if (!['radar-form','alert-form','journal-form','purchase-form'].includes(id)) return;
  event.preventDefault(); const f = new FormData(event.target);
  if (id === 'radar-form') {
    const symbols = [...new Set(String(f.get('symbols')).toUpperCase().split(/[\s,;]+/).filter(Boolean))];
    const extras = [...state.watchlist, ...holdings().map(h => state.symbols?.[h.ticker]).filter(Boolean)];
    if (!symbols.length || new Set([...symbols, ...extras]).size > 40 || symbols.some(s => !/^[A-Z0-9][A-Z0-9._:-]{0,63}$/.test(s))) { toast('Inserisci ticker validi, massimo 40 compresi watchlist e portafoglio.'); return; }
    state.radarSymbols = symbols; save(); closeModal(); render(); marketNext = 0; fetchMarket(true); toast('Radar salvato.');
  } else if (id === 'alert-form') {
    const symbol = String(f.get('symbol')).trim().toUpperCase(), price = Number(f.get('price'));
    if (!/^[A-Z0-9][A-Z0-9._:-]{0,63}$/.test(symbol) || !(price > 0) || !Number.isFinite(price)) { toast('Controlla ticker e prezzo.'); return; }
    if (!radarSymbols().includes(symbol) && radarSymbols().length >= 40) { toast('Il radar è pieno. Rimuovi un ticker prima di aggiungere questo obiettivo.'); return; }
    rememberCatalogueAsset(symbol);
    state.alerts ||= []; state.alerts.push({ id: crypto.randomUUID(), symbol, price, direction: String(f.get('direction')), note: String(f.get('note') || '').trim(), currency: radarRows().find(r => r.symbol === symbol)?.currency || catalogueAsset(symbol)?.currency || null });
    if (!radarSymbols().includes(symbol)) state.radarSymbols = [...(state.radarSymbols || DEFAULT_RADAR), symbol];
    save(); closeModal(); go('lab'); fetchMarket(); toast('Obiettivo creato.');
  } else if (id === 'journal-form') {
    const title = String(f.get('title') || '').trim(), thesis = String(f.get('thesis') || '').trim();
    if (!title || !thesis) { toast('Scrivi la decisione e la tua tesi.'); return; }
    state.journal ||= []; state.journal.push({ id: crypto.randomUUID(), symbol: String(f.get('symbol') || '').trim().toUpperCase(), title, thesis, invalidate: String(f.get('invalidate') || '').trim(), review: String(f.get('review') || ''), createdAt: Date.now() });
    save(); closeModal(); render(); toast('Decisione salvata nel diario.');
  } else if (id === 'purchase-form') {
    const row = holdings().find(h => h.ticker === f.get('ticker')), budget = Number(f.get('budget')), price = Number(f.get('price')), fee = Number(f.get('fees'));
    if (!row || !Number.isFinite(budget) || !Number.isFinite(price) || !Number.isFinite(fee) || budget <= fee || price <= 0 || fee < 0) { toast('Controlla importo, prezzo e commissioni.'); return; }
    const shares = (budget - fee) / price, average = (row.cost + budget) / (row.quantity + shares), valueAtPrice = (row.quantity + shares) * price;
    const rest = portfolio().value - row.value, weight = valueAtPrice / (rest + valueAtPrice) * 100;
    $('#purchase-result').innerHTML = `<div><span>Azioni aggiuntive</span><strong>${amount(shares)}</strong></div><div><span>Nuovo prezzo medio (€)</span><strong>${money(average, 3)}</strong></div><div><span>Peso dopo l’acquisto</span><strong>${amount(weight)}%</strong></div><p>Prezzo ipotizzato usato anche per rivalutare la posizione esistente. Include le commissioni indicate. Nessun movimento registrato.</p>`;
  }
});
