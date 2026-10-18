import express from 'express';

const app = express();
app.use(express.json());
const tours = [
  { id: 1, title: 'Sajek', days: 2 },
  { id: 2, title: 'Kuakata', days: 3 },
];

app.get('/tours', (req, res) => {
  const maxDays = Number(req.query.maxDays ?? Infinity);
  res.json(tours.filter((tour) => tour.days <= maxDays));
});
app.get('/tours/:id', (req, res) => {
  const tour = tours.find((t) => t.id === Number(req.params.id));
  if (!tour) {
    res.status(404).json({ error: 'Tour নেই' });
    return;
  }
  res.json(tour);
});
app.post('/tours', (req, res) => res.status(201).json({ received: req.body }));

const server = app.listen(0, '127.0.0.1');
await new Promise((resolve) => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
for (const path of ['/tours?maxDays=2', '/tours/2', '/tours/9']) {
  const response = await fetch(base + path);
  console.log(response.status, JSON.stringify(await response.json()));
}
const posted = await fetch(`${base}/tours`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ title: 'Ratargul' }),
});
console.log(posted.status, JSON.stringify(await posted.json()));
server.close();
