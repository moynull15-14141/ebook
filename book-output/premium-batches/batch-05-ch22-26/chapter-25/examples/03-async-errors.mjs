import express from 'express';

process.on('unhandledRejection', (error) => {
  console.log(`unhandledRejection: ${error.message}`);
});

const app = express();
const wrap = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

app.get('/unsafe', async () => {
  throw new Error('Database বন্ধ');
});
app.get('/safe', wrap(async () => {
  throw new Error('Database বন্ধ');
}));
app.use((err, req, res, next) => res.status(500).json({ error: 'Server-এ সমস্যা' }));

const server = app.listen(0, '127.0.0.1');
await new Promise((resolve) => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
try {
  await fetch(`${base}/unsafe`, { signal: AbortSignal.timeout(500) });
} catch {
  console.log('/unsafe: ৫০০ ms-এ কোনো উত্তর আসেনি');
}
const safe = await fetch(`${base}/safe`);
console.log(`/safe: ${safe.status} ${JSON.stringify(await safe.json())}`);
server.closeAllConnections();
server.close();
