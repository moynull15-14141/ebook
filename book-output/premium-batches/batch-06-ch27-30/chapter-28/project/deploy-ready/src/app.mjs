import { randomUUID } from 'node:crypto';
import { ValidationError } from './jobs.mjs';

class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const ROUTES = {
  'GET /health/live': 'live',
  'GET /health/ready': 'ready',
  'GET /version': 'version',
  'GET /metrics': 'metrics',
  'GET /api/jobs': 'listJobs',
  'POST /api/jobs': 'createJob',
};

async function readJson(req, limit = 8 * 1024) {
  if (!/^application\/json\b/.test(req.headers['content-type'] ?? '')) {
    throw new HttpError(415, 'UNSUPPORTED_MEDIA_TYPE', 'JSON পাঠান');
  }
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new HttpError(413, 'TOO_LARGE', 'Body খুব বড়');
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'BAD_JSON', 'অবৈধ JSON');
  }
}

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((resolve, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export function createApp({ config, logger, metrics, store,
  readyTimeoutMs = 1000 }) {
  const state = { draining: false, inFlight: 0 };

  const requireOps = (req) => {
    if (!config.opsToken) return; // শুধু development-এ Token ছাড়া
    if (req.headers.authorization !== `Bearer ${config.opsToken}`) {
      throw new HttpError(401, 'UNAUTHORIZED', 'Token প্রয়োজন');
    }
  };

  const handlers = {
    live: async () => [200, { status: 'live' }],
    ready: async () => {
      if (state.draining) return [503, { status: 'draining' }];
      try {
        await withTimeout(store.ping(), readyTimeoutMs);
        return [200, { status: 'ready' }];
      } catch {
        return [503, { status: 'dependency-unavailable' }];
      }
    },
    version: async () => [200, { version: config.version,
      commit: config.commit }],
    metrics: async (req) => {
      requireOps(req);
      metrics.setGauge('http_in_flight_requests', state.inFlight);
      return [200, metrics.render(), 'text/plain; version=0.0.4'];
    },
    listJobs: async () => [200, { data: await store.list() }],
    createJob: async (req) => {
      requireOps(req);
      return [201, { data: await store.create(await readJson(req)) }];
    },
  };

  async function handle(req, res) {
    const started = process.hrtime.bigint();
    const incoming = req.headers['x-request-id'];
    const requestId = /^[\w-]{8,64}$/.test(incoming ?? '')
      ? incoming : randomUUID();
    const { pathname } = new URL(req.url, 'http://localhost');
    const name = ROUTES[`${req.method} ${pathname}`];
    // Metrics-এর Label-এ আসল Path নয়, Route-এর নাম: সীমিত সংখ্যক মান।
    const route = name ? pathname : 'unmatched';
    state.inFlight += 1;
    res.setHeader('x-request-id', requestId);
    res.on('finish', () => {
      state.inFlight -= 1;
      const seconds = Number(process.hrtime.bigint() - started) / 1e9;
      metrics.observeRequest({ method: req.method, route,
        status: res.statusCode, seconds });
      logger.info('http.request', { requestId, method: req.method, route,
        status: res.statusCode, durationMs: Math.round(seconds * 1000) });
    });
    try {
      if (!name) throw new HttpError(404, 'NOT_FOUND', 'Route পাওয়া যায়নি');
      const [status, body, type] = await handlers[name](req);
      send(res, status, body, type);
    } catch (error) {
      sendError(res, error, requestId);
    }
  }

  function sendError(res, error, requestId) {
    if (error instanceof ValidationError) {
      return send(res, 422, { error: { code: 'VALIDATION',
        message: error.message, details: error.details } });
    }
    if (error instanceof HttpError) {
      return send(res, error.status, { error: { code: error.code,
        message: error.message } });
    }
    logger.error('http.unhandled', { requestId, message: error.message,
      stack: error.stack });
    return send(res, 500, { error: { code: 'INTERNAL',
      message: 'Server-এ সমস্যা', requestId } });
  }

  return { handle, state };
}

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}
