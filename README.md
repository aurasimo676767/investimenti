# Forma

Un sito responsive per organizzare un portafoglio di azioni, seguire aziende e importare movimenti da un CSV. I dati personali restano nel browser in cui vengono inseriti.

## Avvio locale

Apri `index.html` in un browser moderno. Non servono dipendenze o un server per l'interfaccia.

## Dati

- La prima apertura mostra dati illustrativi, segnalati con un banner.
- **Usa i miei dati** svuota la demo.
- Movimenti, prezzi, watchlist e note sono salvati in `localStorage` nel browser corrente.
- In **Impostazioni** puoi esportare e ripristinare un backup JSON. Questo permette anche di portare i dati su un altro dispositivo.
- Il CSV viene letto localmente. L'esportazione nativa di Trade Republic è riconosciuta automaticamente: vengono importati acquisti e vendite di azioni e fondi, mentre i movimenti di cassa vengono esclusi. Gli ID delle operazioni impediscono i duplicati nei successivi import. Per altri CSV resta disponibile l'abbinamento manuale delle colonne.
- Trade Republic identifica gli strumenti con l'ISIN. Finché manca un prezzo, la posizione è mostrata al costo e il rendimento è incompleto. Forma non fornisce raccomandazioni di investimento.
- Per aggiornare i prezzi con Twelve Data, configura `TWELVEDATA_API_KEY` nelle variabili d'ambiente del progetto Vercel e distribuisci una nuova versione. In **Impostazioni → Quotazioni Twelve Data**, associa gli ISIN ai simboli di mercato e premi **Salva e aggiorna prezzi**. La chiave resta nella funzione server `api/quotes.js`, non nel browser o nel repository. Le quotazioni in USD vengono convertite in EUR; controlla sempre sede di negoziazione, valuta e orario. Il piano Twelve Data potrebbe non coprire tutti i mercati.

## Sviluppo

`node --check app.js` controlla la sintassi. `node scripts/logic.cjs` verifica calcoli e importazione. `npm run build` prepara il pacchetto statico per Vercel (cartella `dist`). `node scripts/smoke.cjs` esegue una verifica browser su desktop e telefono usando il Playwright già presente nel workspace.

## Pubblicazione

Vercel pubblica automaticamente i commit inviati a `main` dal repository GitHub collegato. Il sito distribuito contiene dati dimostrativi; movimenti, prezzi e note reali restano nel `localStorage` del dispositivo. Per limitare anche l'accesso alla pagina occorre attivare la protezione del deployment nelle impostazioni del progetto Vercel.
