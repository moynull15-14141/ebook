import express from 'express';

const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    res.status(403).json({ error: { code: 'FORBIDDEN' } });
    return;
  }
  next();
};

const app = express();
app.use((req, res, next) => {
  req.user = { id: 'x', role: req.get('x-demo-role') };
  next();
});
app.delete('/v1/leads/:id', requireRole('manager'),
  (req, res) => res.status(204).end());

const server = app.listen(0, '127.0.0.1');
await new Promise((resolve) => server.once('listening', resolve));
const url = `http://127.0.0.1:${server.address().port}/v1/leads/L-1`;
for (const role of ['agent', 'manager']) {
  const headers = { 'x-demo-role': role };
  const response = await fetch(url, { method: 'DELETE', headers });
  console.log(role, response.status);
}
server.close();
