# Forma

Un sito responsive per organizzare un portafoglio di azioni, seguire aziende e importare movimenti da un CSV. I dati personali restano nel browser in cui vengono inseriti.

## Avvio locale

Apri `index.html` in un browser moderno. Non servono dipendenze o un server per l'interfaccia.

## Dati

- La prima apertura mostra dati illustrativi, segnalati con un banner.
- **Usa i miei dati** svuota la demo.
- Movimenti, prezzi, watchlist e note sono salvati in `localStorage` nel browser corrente.
- In **Impostazioni** puoi esportare e ripristinare un backup JSON. Questo permette anche di portare i dati su un altro dispositivo.
- Il CSV viene letto localmente; prima dell'importazione l'utente associa le colonne e vede un'anteprima. Le righe non riconosciute bloccano l'importazione.
- I prezzi dei titoli sono inseriti manualmente. Non sono disponibili quotazioni in tempo reale né raccomandazioni di investimento.

## Sviluppo

`node --check app.js` controlla la sintassi. `node scripts/logic.cjs` verifica calcoli e importazione. `npm run build` prepara il pacchetto statico per Vercel (cartella `dist`). `node scripts/smoke.cjs` esegue una verifica browser su desktop e telefono usando il Playwright già presente nel workspace.

## Pubblicazione

Vercel pubblica automaticamente i commit inviati a `main` dal repository GitHub collegato. Il sito distribuito contiene dati dimostrativi; movimenti, prezzi e note reali restano nel `localStorage` del dispositivo. Per limitare anche l'accesso alla pagina occorre attivare la protezione del deployment nelle impostazioni del progetto Vercel.
