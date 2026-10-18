import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { attachGateway } from './gateway.mjs';
import { streamBooking } from './sse.mjs';

const STATUS = { UNAUTHORIZED: 401, FORBIDDEN: 403, INVALID_TRANSITION: 409,
  BAD_REQUEST: 400, TOO_LARGE: 413, NOT_FOUND: 404 };
const STATIC = {
  '/': ['../public/index.html', 'text/html'],
  '/app.mjs': ['../public/app.mjs', 'text/javascript'],
  '/client-state.mjs': ['./client-state.mjs', 'text/javascript'],
  '/backoff.mjs': ['./backoff.mjs', 'text/javascript'],
};

class HttpError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

async function readJson(req, limit = 1024) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new HttpError('TOO_LARGE', 'Body খুব বড়');
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    throw new HttpError('BAD_REQUEST', 'অবৈধ JSON');
  }
}

export function createLiveServer({ hub, users, allowedOrigins,
  heartbeatMs, authTimeoutMs }) {
  const authenticate = (req) => {
    const token = /^Bearer (.+)$/.exec(req.headers.authorization ?? '')?.[1];
    const user = users.get(token);
    if (!user) throw new HttpError('UNAUTHORIZED', 'Token প্রয়োজন');
    return user;
  };

  const server = http.createServer(async (req, res) => {
    try {
      await route(req, res);
    } catch (error) {
      const status = STATUS[error.code];
      if (!status) console.error(error);
      json(res, status ?? 500, { error: { code: error.code ?? 'INTERNAL',
        message: status ? error.message : 'Server-এ সমস্যা' } });
    }
  });

  async function route(req, res) {
    const { pathname } = new URL(req.url, 'http://localhost');
    const [, api, resource, id, action] = pathname.split('/');
    if (req.method === 'GET' && STATIC[pathname]) {
      const [file, type] = STATIC[pathname];
      const body = await readFile(new URL(file, import.meta.url));
      res.writeHead(200, { 'Content-Type': `${type}; charset=utf-8` });
      return res.end(body);
    }
    if (req.method === 'GET' && pathname === '/health') {
      return json(res, 200, { data: { status: 'ok' } });
    }
    if (api !== 'api' || resource !== 'bookings') {
      throw new HttpError('NOT_FOUND', 'Route পাওয়া যায়নি');
    }
    const user = authenticate(req);
    if (req.method === 'POST' && !id) {
      const { title } = await readJson(req);
      if (typeof title !== 'string' || !title.trim()) {
        throw new HttpError('BAD_REQUEST', 'title প্রয়োজন');
      }
      const event = hub.createBooking(user.id, title.trim());
      return json(res, 201, { data: hub.snapshot(user.id, event.bookingId) });
    }
    if (req.method === 'POST' && action === 'status') {
      const { status } = await readJson(req);
      const event = hub.changeStatus(user.id, id, status);
      return json(res, 200, { data: event });
    }
    if (req.method === 'GET' && id && action === 'stream') {
      if (!hub.canView(user.id, id)) {
        throw new HttpError('FORBIDDEN', 'এই Booking দেখার অনুমতি নেই');
      }
      return streamBooking(req, res, { hub, user, bookingId: id });
    }
    if (req.method === 'GET' && id && !action) {
      return json(res, 200, { data: hub.snapshot(user.id, id) });
    }
    throw new HttpError('NOT_FOUND', 'Route পাওয়া যায়নি');
  }

  const gateway = attachGateway(server, { hub, users, allowedOrigins,
    heartbeatMs, authTimeoutMs });
  return { server, gateway };
}
