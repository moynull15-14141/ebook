import express from 'express';

const responseTime = (req, res, next) => {
  const started = process.hrtime.bigint();
  const original = res.writeHead;
  res.writeHead = function writeHead(...args) {
    const ms = Number(process.hrtime.bigint() - started) / 1e6;
    res.setHeader('x-response-time', `${ms.toFixed(1)}ms`);
    return original.apply(this, args);
  };
  next();
};

const app = express();
app.use(responseTime);
app.get('/', (req, res) => res.json({ ok: true }));

const server = app.listen(0, '127.0.0.1');
await new Promise((resolve) => server.once('listening', resolve));
const response = await fetch(`http://127.0.0.1:${server.address().port}/`);
console.log(/^\d+\.\dms$/.test(response.headers.get('x-response-time')));
server.close();
