import express from 'express';

const app = express();
const started = Date.now();
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: Math.floor((Date.now() - started) / 1000) });
});

const server = app.listen(0, '127.0.0.1');
await new Promise((resolve) => server.once('listening', resolve));
const response = await fetch(`http://127.0.0.1:${server.address().port}/health`);
const body = await response.json();
console.log(response.status, body.status, Number.isInteger(body.uptime));
server.close();
