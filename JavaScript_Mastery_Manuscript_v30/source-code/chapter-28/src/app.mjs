import { randomUUID } from 'node:crypto';

export function createApp({ clock = () => Date.now(), maxItems = 100 } = {}) {
  const jobs = new Map();
  let accepting = true;
  const stats = { requests: 0, errors: 0 };
  const started = clock();
  function json(res, status, data, extra = {}) {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra });
    res.end(JSON.stringify(data));
  }
  async function handler(req, res) {
    stats.requests++;
    const requestId = randomUUID();
    res.setHeader('x-request-id', requestId);
    const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
    if (req.method === 'GET' && pathname === '/health/live') return json(res, 200, { status: 'alive' });
    if (req.method === 'GET' && pathname === '/health/ready') return json(res, accepting ? 200 : 503, { status: accepting ? 'ready' : 'draining' });
    if (req.method === 'GET' && pathname === '/metrics') return json(res, 200, { ...stats, uptimeMs: clock() - started, jobs: jobs.size });
    if (!accepting) return json(res, 503, { error: 'SERVICE_UNAVAILABLE' });
    if (req.method === 'GET' && pathname === '/api/jobs') return json(res, 200, { jobs: [...jobs.values()] });
    if (req.method === 'POST' && pathname === '/api/jobs') {
      const chunks = []; let size = 0;
      try {
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 4096) { stats.errors++; return json(res, 413, { error: 'PAYLOAD_TOO_LARGE' }); }
          chunks.push(chunk);
        }
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (typeof body.title !== 'string' || body.title.trim().length < 3 || body.title.length > 120) {
          stats.errors++; return json(res, 422, { error: 'INVALID_TITLE' });
        }
        if (jobs.size >= maxItems) { stats.errors++; return json(res, 429, { error: 'CAPACITY_REACHED' }); }
        const job = { id: randomUUID(), title: body.title.trim(), status: 'queued', createdAt: new Date(clock()).toISOString() };
        jobs.set(job.id, job);
        return json(res, 201, { job }, { location: `/api/jobs/${job.id}` });
      } catch { stats.errors++; return json(res, 400, { error: 'INVALID_JSON' }); }
    }
    stats.errors++; return json(res, 404, { error: 'NOT_FOUND' });
  }
  return { handler, drain: () => { accepting = false; }, stats };
}
