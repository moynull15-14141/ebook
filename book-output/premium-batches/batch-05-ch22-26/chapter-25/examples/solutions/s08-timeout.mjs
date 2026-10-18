import express from 'express';

const timeout = (ms) => (req, res, next) => {
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      res.status(503).json({ error: { code: 'TIMEOUT' } });
    }
  }, ms);
  res.on('finish', () => clearTimeout(timer));
  res.on('close', () => clearTimeout(timer));
  next();
};

const app = express();
app.use(timeout(400));
app.get('/fast', (req, res) => res.json({ ok: true }));
app.get('/slow', (req, res) => {
  setTimeout(() => {
    if (!res.headersSent) {
      res.json({ ok: true });
    }
  }, 1_000);
});

const server = app.listen(0, '127.0.0.1');
await new Promise((resolve) => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
for (const path of ['/fast', '/slow']) {
  console.log(path, (await fetch(base + path)).status);
}
server.closeAllConnections();
server.close();
