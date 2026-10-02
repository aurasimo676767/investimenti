const { get, put, head, BlobPreconditionFailedError } = require('@vercel/blob');

const PATH = 'forma/private-portfolio.json';
const MAX_BYTES = 750_000;

function validPortfolio(data) {
  return data && typeof data === 'object' && !Array.isArray(data) &&
    Array.isArray(data.transactions) && Array.isArray(data.watchlist) &&
    data.prices && typeof data.prices === 'object' &&
    data.notes && typeof data.notes === 'object';
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: 'Archivio privato non collegato a Vercel.' });
  }
  if (req.method === 'GET') {
    try {
      const result = await get(PATH, { access: 'private', useCache: false });
      if (!result || result.statusCode === 404) return res.status(200).json({ state: null, revision: null });
      if (result.statusCode !== 200) return res.status(503).json({ error: 'Archivio non disponibile.' });
      const state = JSON.parse(await new Response(result.stream).text());
      if (!validPortfolio(state)) return res.status(503).json({ error: 'Dati archiviati non validi.' });
      return res.status(200).json({ state, revision: result.blob.etag });
    } catch (_) {
      return res.status(503).json({ error: 'Impossibile leggere l’archivio privato.' });
    }
  }
  if (req.method === 'PUT') {
    let body;
    try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
    catch (_) { return res.status(400).json({ error: 'JSON non valido.' }); }
    if (!body || !validPortfolio(body.state) || (body.revision !== null && typeof body.revision !== 'string')) {
      return res.status(400).json({ error: 'Dati di sincronizzazione non validi.' });
    }
    const content = JSON.stringify(body.state);
    if (Buffer.byteLength(content) > MAX_BYTES) return res.status(413).json({ error: 'Portafoglio troppo grande per la sincronizzazione.' });
    try {
      const options = { access: 'private', contentType: 'application/json', cacheControlMaxAge: 60 };
      if (body.revision) { options.allowOverwrite = true; options.ifMatch = body.revision; }
      const blob = await put(PATH, content, options);
      const revision = blob.etag || (await head(PATH)).etag;
      return res.status(200).json({ revision });
    } catch (error) {
      if (error instanceof BlobPreconditionFailedError || !body.revision) {
        return res.status(409).json({ error: 'Il portafoglio è stato modificato su un altro dispositivo.' });
      }
      return res.status(503).json({ error: 'Impossibile salvare nell’archivio privato.' });
    }
  }
  return res.status(405).json({ error: 'Metodo non supportato.' });
};
