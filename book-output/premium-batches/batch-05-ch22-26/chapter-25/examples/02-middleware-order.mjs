import express from 'express';

const app = express();
let order = [];
const step = (name) => (req, res, next) => {
  order.push(name);
  next();
};

app.use(step('requestId'), step('logger'));
app.use('/v1', (req, res, next) => {
  order.push('auth');
  if (!req.get('authorization')) {
    res.status(401).json({ error: 'Token নেই' });
    return;
  }
  next();
});
app.get('/v1/leads', (req, res) => {
  order.push('route');
  res.json([]);
});

const server = app.listen(0, '127.0.0.1');
await new Promise((resolve) => server.once('listening', resolve));
const url = `http://127.0.0.1:${server.address().port}/v1/leads`;
for (const headers of [{}, { authorization: 'Bearer demo' }]) {
  order = [];
  const response = await fetch(url, { headers });
  console.log(response.status, order.join(' > '));
}
server.close();
