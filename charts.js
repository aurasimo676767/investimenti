const historyCache = new Map(), historyPending = new Map(), activeCharts = new Map();
let dashboardChartKey = '', chartPeriod = '3m', chartStyle = 'line', chartAverage = false;
function disposeCharts(root) {
  for (const [element, item] of activeCharts) if (!root || root.contains?.(element) || !element.isConnected) { item.observer?.disconnect(); item.chart.remove(); activeCharts.delete(element); }
}
function chartSymbols() {
  return [...new Set([...holdings().map(h => state.symbols?.[h.ticker] || h.ticker), ...state.watchlist, 'IREN','NVDA','MSFT','AAPL'])].filter(s => !/^[A-Z]{2}[A-Z0-9]{10}$/.test(s));
}
function chartPanel(key, modalChart = false) {
  const c = company(key);
  return `<section class="panel price-chart-panel" data-chart-key="${esc(key)}"><div class="chart-heading"><div><h2>${modalChart ? 'Storico del prezzo' : 'Il prezzo, nel tempo'}</h2><p>Ogni punto è una seduta di borsa. Prezzi nella valuta del titolo.</p></div>${!modalChart ? `<label class="chart-selector" for="chart-symbol">Titolo<select id="chart-symbol">${chartSymbols().map(s => `<option value="${esc(s)}" ${s === key ? 'selected' : ''}>${esc(company(s).name)} · ${esc(company(s).symbol)}</option>`).join('')}</select></label>` : `<span class="sector-tag">${esc(c.symbol)} · ${esc(c.exchange)}</span>`}</div><div class="chart-toolbar"><div class="segmented" aria-label="Periodo del grafico">${[['1m','1 mese'],['3m','3 mesi'],['6m','6 mesi'],['1y','1 anno']].map(([id,label]) => `<button data-chart-period="${id}" class="${chartPeriod === id ? 'active' : ''}" aria-pressed="${chartPeriod === id}">${label}</button>`).join('')}</div><div class="chart-controls"><button class="chip ${chartStyle === 'candles' ? 'active' : ''}" data-chart-style="${chartStyle === 'line' ? 'candles' : 'line'}">${chartStyle === 'line' ? 'Mostra candele' : 'Mostra linea'}</button><button class="chip ${chartAverage ? 'active' : ''}" data-chart-average aria-pressed="${chartAverage}">Media 20 sedute</button><button class="text-button" data-chart-reset>Reimposta zoom</button></div></div><div class="chart-summary" aria-live="polite"></div><div class="chart-canvas" role="img" aria-label="Grafico storico del prezzo di ${esc(c.name)}"></div><div class="chart-status" role="status">Caricamento dello storico reale…</div><div class="chart-explanation"><details><summary>Come si legge questo grafico?</summary><p>La linea segue il prezzo di chiusura. Ogni candela mostra apertura, massimo, minimo e chiusura di una seduta: verde se chiude sopra l’apertura, rosso se chiude sotto. Le barre in basso mostrano quante azioni sono state scambiate, se il provider fornisce i volumi.</p><p>La media di 20 sedute rende più leggibile la tendenza: non è una previsione. Puoi trascinare il grafico e usare la rotella o due dita per lo zoom. Il pulsante “Reimposta zoom” torna al periodo selezionato.</p><p>I dati giornalieri sono corretti per gli split, senza dividendi. Il prezzo dell’ultima seduta può ancora cambiare; ritardi e disponibilità dipendono dal piano Twelve Data. Non è il rendimento del tuo portafoglio.</p></details><details class="chart-table"><summary>Leggi i dati delle ultime sedute</summary><div class="chart-table-content"></div></details></div><div class="chart-credit">Grafici con <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer">TradingView Lightweight Charts™</a> · Dati Twelve Data</div></section>`;
}
function dashboardCharts() {
  const choices = chartSymbols(); if (!choices.includes(dashboardChartKey)) dashboardChartKey = choices[0];
  return `${chartPanel(dashboardChartKey)}${monthlyPanel()}`;
}
function friendlyHelp() {
  const guides = {
    discover: ['Come uso questa pagina?', 'Cerca il nome di un’azienda o il suo ticker, cioè il codice con cui è quotata (per esempio IREN). Mostriamo le sedi principali negli USA. Apri un risultato per leggere il prezzo, vedere il grafico e salvarlo tra i titoli da seguire.', 'Il piano indicato riguarda Twelve Data, il servizio dei dati: non è il prezzo dell’azione. La disponibilità su Trade Republic va controllata nel broker.', 'Il radar confronta solo i titoli monitorati. Giorno, settimana e mese significano 1, 5 e 21 sedute di borsa. Le idee sono spunti da studiare, senza previsioni di rendimento.'],
    watchlist: ['Cosa significa “Da seguire”?', 'È la tua lista personale delle aziende che vuoi tenere d’occhio. Salvare un titolo qui non esegue un acquisto e non modifica il conto Trade Republic.', 'Scrivi perché ti interessa e cosa ti farebbe cambiare idea. Un obiettivo è una soglia di prezzo: viene controllata mentre usi il sito, senza notifiche a sito chiuso.'],
    lab: ['Come uso le simulazioni?', 'Muovi la percentuale per vedere quanto cambierebbe il valore delle tue posizioni. È un’ipotesi, non una previsione: non compra né vende nulla.', 'Il peso indica quanta parte del portafoglio dipende da un titolo. Il prezzo medio è quanto hai pagato in media per azione, incluse le commissioni degli acquisti.', 'La simulazione di acquisto usa il budget, il prezzo e le commissioni che inserisci; non registra operazioni. Nel diario puoi annotare la decisione prima di prenderla.'],
    transactions: ['Cosa trovo nelle operazioni?', 'Questa pagina contiene gli acquisti e le vendite importati dal CSV, o inseriti a mano. Puoi cercare un titolo e filtrare il tipo di operazione.', 'Il risultato delle vendite confronta il ricavo con il costo medio delle azioni vendute, incluse le commissioni ed escluse le imposte. Se mancano acquisti precedenti, il calcolo viene segnalato come incompleto.', 'Per aggiornare le operazioni importa il nuovo CSV nativo di Trade Republic senza selezionare “Sostituisci i movimenti”: gli identificativi delle operazioni evitano i duplicati.']
  };
  const guide = guides[currentPage];
  return guide ? `<details class="panel portfolio-explainer"><summary>${guide[0]}</summary>${guide.slice(1).map(text => `<p>${text}</p>`).join('')}</details>` : '';
}
function monthlyFlows() {
  const months = new Map();
  for (const t of state.transactions) {
    if (!/^\d{4}-\d{2}/.test(t.date)) continue;
    const month = t.date.slice(0,7), value = Number(t.quantity) * Number(t.price), fees = Number(t.fees) || 0;
    if (!Number.isFinite(value) || value <= 0) continue;
    if (!months.has(month)) months.set(month, { time: `${month}-01`, buys: 0, sells: 0 });
    const row = months.get(month);
    if (t.side === 'buy') row.buys += value + fees; else if (t.side === 'sell') row.sells += value - fees;
  }
  return [...months.values()].sort((a,b) => a.time.localeCompare(b.time)).slice(-12);
}
function monthlyPanel() {
  const rows = monthlyFlows();
  return `<section class="panel monthly-panel"><div class="chart-heading"><div><h2>I tuoi acquisti e vendite</h2><p>Ultimi 12 mesi con operazioni nel CSV, in euro e con commissioni.</p></div><button class="button-secondary" data-action="import">Aggiorna CSV ${icon('upload')}</button></div><div class="flow-legend"><span><i></i>Acquisti: denaro impiegato</span><span><i></i>Vendite: denaro ricavato</span></div>${state.hidden ? '<div class="chart-status">Importi nascosti. Premi l’occhio in alto per vedere questo grafico.</div>' : rows.length ? '<div id="monthly-chart" class="flow-canvas" role="img" aria-label="Acquisti e vendite mensili in euro"></div>' : '<div class="chart-status">Importa il CSV per vedere in quali mesi hai acquistato o venduto.</div>'}<p class="form-hint">Acquisti sopra lo zero, vendite sotto. Sono movimenti di denaro: le vendite non rappresentano perdite e questo grafico non misura il rendimento.</p>${rows.length ? `<details class="chart-table"><summary>Vedi gli importi per mese</summary><table><thead><tr><th>Mese</th><th>Acquisti</th><th>Vendite</th></tr></thead><tbody>${rows.map(r => `<tr><th>${new Date(r.time + 'T12:00:00').toLocaleDateString('it-IT',{month:'short',year:'numeric'})}</th><td>${money(r.buys)}</td><td>${money(r.sells)}</td></tr>`).join('')}</tbody></table></details>` : ''}</section>`;
}
async function getHistory(key) {
  const previous = historyCache.get(key);
  if (previous && Date.now() - Date.parse(previous.fetchedAt) < 60*60_000) return previous;
  if (historyPending.has(key)) return historyPending.get(key);
  const promise = (async () => {
    const response = await fetch(`/api/history?key=${encodeURIComponent(key)}`, { cache: 'no-store' }), data = await response.json();
    if (!response.ok) throw Error(data.error || 'Storico non disponibile.');
    if (!data.bars?.length) throw Error('Nessuna seduta disponibile per questo titolo.');
    if (historyCache.size >= 30) historyCache.delete(historyCache.keys().next().value);
    historyCache.set(key,data); return data;
  })().finally(() => historyPending.delete(key));
  historyPending.set(key,promise); return promise;
}
function visibleBars(data) {
  const months = { '1m':1,'3m':3,'6m':6,'1y':12 }[chartPeriod];
  const end = new Date(`${data.bars.at(-1).time}T12:00:00Z`), start = new Date(end); start.setUTCMonth(start.getUTCMonth() - months);
  return data.bars.filter(b => b.time >= start.toISOString().slice(0,10));
}
function newChart(element,height) {
  const lib = window.LightweightCharts;
  if (!lib) throw Error('Il motore dei grafici non è caricato. Ricarica la pagina.');
  const chart = lib.createChart(element, { width: element.clientWidth || 600, height, layout: { background: { color: 'transparent' }, textColor: '#a9b9d3', fontFamily: 'Plus Jakarta Sans', fontSize: 12, attributionLogo: true }, grid: { vertLines: { color: 'rgba(155,180,230,.04)' }, horzLines: { color: 'rgba(155,180,230,.07)' } }, rightPriceScale: { borderColor: 'rgba(155,180,230,.12)' }, timeScale: { borderColor: 'rgba(155,180,230,.12)', rightOffset: 3 }, localization: { locale: 'it-IT' }, handleScroll: { mouseWheel: false, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false } });
  let observer;
  if (typeof ResizeObserver !== 'undefined') { observer = new ResizeObserver(entries => { const width = entries[0].contentRect.width; if (width > 0) chart.applyOptions({width}); }); observer.observe(element); }
  activeCharts.set(element,{chart,observer}); return chart;
}
function drawPrice(panel,data) {
  disposeCharts(panel);
  const bars = visibleBars(data), first = bars[0], last = bars.at(-1), currency = data.currency;
  const format = value => new Intl.NumberFormat('it-IT',{ ...(/^[A-Z]{3}$/.test(currency) ? { style:'currency',currency } : {}), maximumFractionDigits:2 }).format(value);
  const pct = (last.close / first.close - 1) * 100;
  const summary = panel.querySelector('.chart-summary');
  const show = bar => { const change = (bar.close / first.close - 1) * 100; summary.innerHTML = `<strong>${format(bar.close)}</strong><span class="${tone(change)}">${percentage(change)} dal ${day(first.time)}</span><small>${day(bar.time)} · Apertura ${format(bar.open)} · Max ${format(bar.high)} · Min ${format(bar.low)}${bar.volume !== null ? ` · Volume ${amount(bar.volume)}` : ''}</small>`; };
  show(last);
  panel.querySelector('.chart-status').textContent = `${bars.length} sedute · ${data.exchange || company(data.key).exchange} · ${currency || 'Valuta non fornita'} · Storico aggiornato ${new Date(data.fetchedAt).toLocaleString('it-IT')}`;
  panel.querySelector('.chart-table-content').innerHTML = `<table><thead><tr><th>Data</th><th>Apertura</th><th>Max</th><th>Min</th><th>Chiusura</th></tr></thead><tbody>${bars.slice(-20).reverse().map(b => `<tr><th>${day(b.time)}</th>${[b.open,b.high,b.low,b.close].map(n => `<td>${format(n)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const chart = newChart(panel.querySelector('.chart-canvas'), window.innerWidth < 640 ? 310 : 390), lib = window.LightweightCharts;
  const options = { priceFormat:{ type:'custom',formatter:format,minMove:.01 }, priceLineVisible:true };
  const series = chart.addSeries(chartStyle === 'candles' ? lib.CandlestickSeries : lib.AreaSeries, chartStyle === 'candles' ? { ...options, upColor:'#41d6a5',downColor:'#ff7085',borderVisible:false,wickUpColor:'#41d6a5',wickDownColor:'#ff7085' } : { ...options,lineColor:pct >= 0 ? '#41d6a5':'#ff7085',topColor:pct >= 0 ? 'rgba(65,214,165,.22)':'rgba(255,112,133,.22)',bottomColor:'rgba(30,44,74,0)',lineWidth:2 });
  series.setData(chartStyle === 'candles' ? bars.map(({time,open,high,low,close}) => ({time,open,high,low,close})) : bars.map(b => ({time:b.time,value:b.close})));
  series.priceScale().applyOptions({scaleMargins:{top:.1,bottom:.25}});
  const volumes = bars.filter(b => b.volume !== null);
  if (volumes.length) { const volume = chart.addSeries(lib.HistogramSeries,{priceScaleId:'volume',priceFormat:{type:'volume'},lastValueVisible:false,priceLineVisible:false}); volume.setData(volumes.map(b => ({time:b.time,value:b.volume,color:b.close >= b.open?'rgba(65,214,165,.3)':'rgba(255,112,133,.3)'}))); volume.priceScale().applyOptions({scaleMargins:{top:.82,bottom:0}}); }
  if (chartAverage) { const average = chart.addSeries(lib.LineSeries,{color:'#aca0ff',lineWidth:2,priceLineVisible:false,lastValueVisible:false}); const rows = data.bars.map((b,i) => i < 19 ? null : {time:b.time,value:data.bars.slice(i-19,i+1).reduce((sum,r) => sum+r.close,0)/20}).filter(b => b && b.time >= first.time); average.setData(rows); }
  chart.subscribeCrosshairMove(event => { const value = event.seriesData.get(series); const bar = value && bars.find(b => b.time === event.time); show(bar || last); });
  chart.timeScale().fitContent();
}
async function mountPrice(panel) {
  const key = panel.dataset.chartKey;
  try { const data = await getHistory(key); if (panel.isConnected && panel.dataset.chartKey === key) drawPrice(panel,data); }
  catch(error) { if (panel.isConnected) panel.querySelector('.chart-status').innerHTML = `<span>${esc(error.message)}</span><button class="button-secondary" data-chart-retry>Riprova</button>`; }
}
function mountCharts() {
  if (!window.location?.protocol?.startsWith('http')) return;
  document.querySelectorAll('.price-chart-panel').forEach(mountPrice);
  const element = $('#monthly-chart'); if (!element || !window.LightweightCharts) return;
  disposeCharts(element.parentElement);
  const chart = newChart(element,260), lib = window.LightweightCharts, rows = monthlyFlows();
  const buys = chart.addSeries(lib.HistogramSeries,{color:'#82aaff',priceFormat:{type:'custom',formatter:value => `${amount(value)} €`},priceLineVisible:false,lastValueVisible:false});
  const sells = chart.addSeries(lib.HistogramSeries,{color:'#c5a2ff',priceLineVisible:false,lastValueVisible:false});
  buys.setData(rows.map(r => ({time:r.time,value:r.buys}))); sells.setData(rows.map(r => ({time:r.time,value:-r.sells}))); chart.timeScale().fitContent();
}
function openChart(key) { modal(`Il prezzo di ${esc(company(key).name)}`, 'Storico reale, nella valuta della sede selezionata.',chartPanel(key,true),true); mountPrice($('.modal .price-chart-panel')); }
document.addEventListener('change',event => {
  if (event.target.id !== 'chart-symbol') return;
  dashboardChartKey = event.target.value; const panel = event.target.closest('.price-chart-panel'); disposeCharts(panel); panel.outerHTML = chartPanel(dashboardChartKey); mountPrice($('.price-chart-panel'));
});
document.addEventListener('click',event => {
  const open = event.target.closest('[data-open-chart]'); if (open) { openChart(open.dataset.openChart); return; }
  const panel = event.target.closest('.price-chart-panel'); if (!panel) return;
  const period = event.target.closest('[data-chart-period]'), style = event.target.closest('[data-chart-style]'), average = event.target.closest('[data-chart-average]');
  if (period || style || average) {
    if (period) chartPeriod = period.dataset.chartPeriod; if (style) chartStyle = style.dataset.chartStyle; if (average) chartAverage = !chartAverage;
    const key = panel.dataset.chartKey, inModal = !!panel.closest('.modal'); disposeCharts(panel); panel.outerHTML = chartPanel(key,inModal); mountPrice(inModal ? $('.modal .price-chart-panel') : $('.price-chart-panel')); return;
  }
  if (event.target.closest('[data-chart-reset]')) activeCharts.get(panel.querySelector('.chart-canvas'))?.chart.timeScale().fitContent();
  if (event.target.closest('[data-chart-retry]')) mountPrice(panel);
});
setInterval(() => { if (!document.hidden && window.location?.protocol?.startsWith('http')) document.querySelectorAll('.price-chart-panel').forEach(mountPrice); },60*60_000);
document.addEventListener('visibilitychange',() => { if (!document.hidden && window.location?.protocol?.startsWith('http')) document.querySelectorAll('.price-chart-panel').forEach(mountPrice); });
