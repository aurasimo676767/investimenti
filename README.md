# Forma

Un osservatorio personale per organizzare un portafoglio, confrontare tendenze reali e documentare le proprie decisioni. Interfaccia responsive scura, gradienti indaco/blu, verde e rosso per i movimenti, animazioni con supporto a `prefers-reduced-motion`. I dati personali si sincronizzano tramite Vercel Blob privato e restano disponibili anche in una copia locale.

## Avvio locale

Apri `index.html` in un browser moderno. Non servono dipendenze o un server per l'interfaccia.

## Dati

- La prima apertura mostra un portafoglio vuoto; non vengono inseriti dati dimostrativi.
- Movimenti, prezzi, watchlist, note, obiettivi, diario e impostazioni del radar sono salvati in `localStorage` e sincronizzati tra dispositivi tramite lo store privato. Il nuovo design conserva la chiave e il formato dei dati precedenti.
- In **Impostazioni** puoi esportare e ripristinare un backup JSON. Questo permette anche di portare i dati su un altro dispositivo.
- Il CSV viene letto localmente. L'esportazione nativa di Trade Republic è riconosciuta automaticamente: vengono importati acquisti e vendite di azioni e fondi, mentre i movimenti di cassa vengono esclusi. Gli ID delle operazioni impediscono i duplicati nei successivi import. Per altri CSV resta disponibile l'abbinamento manuale delle colonne.
- Trade Republic identifica gli strumenti con l'ISIN. Finché manca un prezzo, la posizione è mostrata al costo e il rendimento è incompleto. Forma non fornisce raccomandazioni di investimento.
- Per aggiornare i prezzi con Twelve Data, configura `TWELVEDATA_API_KEY` nelle variabili d'ambiente del progetto Vercel e distribuisci una nuova versione. In **Impostazioni → Quotazioni Twelve Data**, associa gli ISIN ai simboli di mercato e premi **Salva e aggiorna prezzi**. La chiave resta nella funzione server `api/quotes.js`, non nel browser o nel repository. Le quotazioni in USD vengono convertite in EUR; controlla sempre sede di negoziazione, valuta e orario. Il piano Twelve Data potrebbe non coprire tutti i mercati.
- Dopo la prima associazione, le quotazioni vengono ricontrollate all'apertura e ogni 20 minuti mentre il sito è visibile. Le operazioni su Trade Republic richiedono comunque una nuova esportazione/importazione CSV: non esiste un collegamento diretto al conto.

## Sincronizzazione privata

Nel progetto Vercel, apri **Storage → Create Storage → Blob** e crea uno store **Private**, collegato al progetto. Vercel configura automaticamente `BLOB_STORE_ID` e l'autenticazione OIDC per la funzione. Distribuisci nuovamente il progetto dopo aver collegato lo store. Attiva **Vercel Authentication** per **All Deployments**: l'API del portafoglio legge e scrive dati finanziari, quindi il sito e le sue funzioni devono richiedere accesso. Forma conserva una copia locale e segnala eventuali conflitti senza sovrascrivere in silenzio.

## Sviluppo

`npm run check` verifica sintassi, importazione, rendimento, scenari, API del radar e interazioni dell’interfaccia con un DOM di test. `npm run build` prepara i file statici per Vercel in `dist`. `node scripts/smoke.cjs` esegue un controllo visivo e di overflow su desktop e telefono quando Playwright e Chrome possono essere avviati nell’ambiente. I dati di test restano nei test e non vengono distribuiti.

## Radar e strumenti

- **Radar → Catalogo USA**: ricerca per nome/ticker sulle sedi principali USA, senza doppioni per ticker nei risultati di ricerca e senza sedi IEX/OTC. Nomi comuni come SpaceX, Google e Facebook cercano il nome societario nel provider. La paginazione mostra le sedi principali della pagina; il conteggio indica registrazioni USA del provider prima del filtro sulle sedi. Non coincide necessariamente con l'offerta di Trade Republic.
- La ricerca testuale del provider restituisce fino a 120 corrispondenze: l'interfaccia segnala quando raggiunge questo limite. Per sfogliare l'elenco completo cancella il testo e usa i filtri. Cache delle pagine e delle borse per 24 ore, delle ricerche per 10 minuti, conservata anche nello store Blob privato.
- Aprendo uno strumento viene richiesta la quotazione della sede selezionata, in valuta originale. Piano, paese, borsa e orario sono visibili; i prezzi non disponibili nel piano vengono segnalati. Non vengono richieste quotazioni per tutte le righe del catalogo. I dettagli del provider possono avere ritardi secondo mercato e piano.
- Puoi salvare strumenti in watchlist/radar e associare una quotazione a una posizione importata. L'identificativo MIC della sede viene conservato nelle richieste dei prezzi e delle serie, e nei dati sincronizzati: lo stesso ticker su borse diverse resta distinto. I prezzi del portafoglio supportano EUR e USD; altre valute richiedono un prezzo manuale in EUR.
- `api/market.js` richiede serie giornaliere a Twelve Data, corrette per gli split. Giorno, settimana e mese confrontano l’ultimo dato con 1, 5 e 21 sedute prima. Prezzi e rendimenti restano nella valuta del titolo; le date sono visibili.
- La classifica riguarda le aziende monitorate, inizialmente 24, più watchlist e posizioni associate, fino a 40 ticker. Non rappresenta i maggiori rialzi dell’intero mercato. L’endpoint Twelve Data per l’intero mercato richiede Pro e non viene chiamato.
- Massimo 6 serie per gruppo di aggiornamento e almeno 65 secondi tra gruppi; ogni serie richiede la propria sede. Cache condivisa privata `forma/market-radar-v1.json`, aggiornata per ogni gruppo e conservata un’ora; la quota è applicata anche dal provider. Errori e copertura parziale sono visibili. La scansione iniziale richiede qualche minuto. Il client si ferma quando il sito non è visibile.
- Le idee escludono i titoli già posseduti e usano una selezione spiegata per momentum a 5 sedute con contesto a 21; senza serie viene mostrata una selezione editoriale dichiarata. Nessuna stima di rendimento futuro o punteggio sintetico.
- Laboratorio: scenari istantanei su una posizione o sull’intero portafoglio, concentrazione, simulazione di acquisto con commissioni e nuovo costo medio. La simulazione non scrive movimenti.
- Obiettivi di prezzo verificati sui dati del radar mentre il sito è aperto, senza notifiche push. Diario con tesi, condizione che la smentirebbe e data di revisione.
- Movimenti: ricerca, filtri acquisto/vendita, commissioni, profitto realizzato al costo medio ponderato e quota di vendite abbinate in profitto. Le vendite senza acquisti sufficienti vengono segnalate; il loro risultato non abbinato è escluso. Calcoli senza imposte, non fiscali.

## Pubblicazione

Vercel pubblica automaticamente i commit inviati a `main` dal repository GitHub collegato. Usa sempre l’indirizzo stabile `https://investimenti-aurasimo676767s-projects.vercel.app`. Il sito parte vuoto e carica i dati personali dallo store privato. Mantieni la protezione Vercel sulle pagine e sulle API.
