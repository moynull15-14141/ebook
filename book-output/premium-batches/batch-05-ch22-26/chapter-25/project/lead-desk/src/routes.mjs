import express from 'express';

// Express 4 async Function-এর Rejected Promise নিজে ধরে না; এই Wrapper ধরে
// next(error)-এ পাঠায় (Express 5-এ এটি অন্তর্নির্মিত)।
const wrap = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

const etag = (lead) => `"v${lead.version}"`;
const versionFrom = (header) => {
  const match = /^"v(\d+)"$/.exec(header ?? '');
  return match ? Number(match[1]) : undefined;
};

export function leadRoutes(service) {
  const router = express.Router();

  router.post('/', wrap(async (req, res) => {
    const key = req.get('idempotency-key');
    const { lead, replayed } = await service.create(req.user, req.body, key);
    res.status(replayed ? 200 : 201)
      .location(`/v1/leads/${lead.id}`).set('etag', etag(lead)).json(lead);
  }));

  router.get('/', wrap(async (req, res) => {
    const page = await service.list(req.user, req.query);
    const last = page.items.at(-1);
    res.json({ ...page, next: page.hasMore && last ? last.id : null });
  }));

  router.get('/:id', wrap(async (req, res) => {
    const lead = await service.get(req.user, req.params.id);
    res.set('etag', etag(lead)).json(lead);
  }));

  router.patch('/:id', wrap(async (req, res) => {
    const expected = versionFrom(req.get('if-match'));
    const { user, params, body } = req;
    const lead = await service.update(user, params.id, body, expected);
    res.set('etag', etag(lead)).json(lead);
  }));

  router.delete('/:id', wrap(async (req, res) => {
    await service.remove(req.user, req.params.id);
    res.status(204).end();
  }));

  return router;
}
