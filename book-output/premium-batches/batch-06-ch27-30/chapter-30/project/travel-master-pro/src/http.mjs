// @ts-check
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { AppError } from './errors.mjs';

/**
 * @typedef {ReturnType<typeof import('./service.mjs').createTravelService>}
 *   Service
 */
/** @typedef {[number, unknown]} Result */

const STATIC = {
  '/': ['index.html', 'text/html'],
  '/app.mjs': ['app.mjs', 'text/javascript'],
  '/styles.css': ['styles.css', 'text/css'],
};

// Browser-কে কঠোর নিয়ম: শুধু নিজের Script ও Style, অন্য Site-এ Frame নয়।
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; "
    + "style-src 'self'; connect-src 'self'; img-src 'self' data:; "
    + "frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
};

/** @param {http.IncomingMessage} req @param {number} limit */
async function readJson(req, limit) {
  if (!/^application\/json\b/.test(req.headers['content-type'] ?? '')) {
    throw new AppError('UNSUPPORTED_MEDIA_TYPE', 'JSON পাঠান');
  }
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new AppError('TOO_LARGE', 'Body খুব বড়');
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new AppError('BAD_JSON', 'অবৈধ JSON');
  }
}

/** @param {http.IncomingMessage} req */
const bearer = (req) => /^Bearer ([\w-]+)$/
  .exec(req.headers.authorization ?? '')?.[1];

/**
 * Transport স্তর: Route, JSON, Status ও Header। ব্যবসার নিয়ম Service-এ।
 * @param {{ service: Service, bodyLimit?: number,
 *   log?: (event: string, fields: object) => void }} options
 */
export function createHttpServer({ service, bodyLimit = 4096,
  log = () => {} }) {
  const user = (/** @type {http.IncomingMessage} */ req) =>
    service.authenticate(bearer(req));
  const body = (/** @type {http.IncomingMessage} */ req) =>
    readJson(req, bodyLimit);

  /** @type {[string, RegExp, (req: http.IncomingMessage,
   *   params: string[]) => Promise<Result>][]} */
  const routes = [
    ['GET', /^\/health$/, async () => [200, { status: 'ok' }]],
    ['GET', /^\/api\/packages$/, async () => [200, service.listPackages()]],
    ['POST', /^\/api\/register$/,
      async (req) => [201, service.register(await body(req))]],
    ['POST', /^\/api\/login$/,
      async (req) => [200, service.login(await body(req))]],
    ['POST', /^\/api\/logout$/, async (req) => {
      service.logout(bearer(req));
      return [200, { loggedOut: true }];
    }],
    ['GET', /^\/api\/bookings$/,
      async (req) => [200, service.listBookings(user(req).id)]],
    // আগে Authentication, তারপর Body: পরিচয় ছাড়া কোনো Input পড়া নয়।
    ['POST', /^\/api\/bookings$/, async (req) => {
      const { id } = user(req);
      const { booking, replayed } = service.createBooking(id, await body(req));
      return [replayed ? 200 : 201, booking];
    }],
    ['PATCH', /^\/api\/bookings\/(\d+)\/cancel$/, async (req, [bookingId]) =>
      [200, service.cancelBooking(user(req).id, Number(bookingId))]],
  ];

  return http.createServer(async (req, res) => {
    const { pathname } = new URL(req.url ?? '/', 'http://localhost');
    try {
      const file = req.method === 'GET'
        && STATIC[/** @type {keyof typeof STATIC} */ (pathname)];
      if (file) {
        const content = await readFile(
          new URL(`../public/${file[0]}`, import.meta.url));
        res.writeHead(200, { ...SECURITY_HEADERS,
          'Content-Type': `${file[1]}; charset=utf-8` });
        return void res.end(content);
      }
      for (const [method, pattern, handler] of routes) {
        const match = pattern.exec(pathname);
        if (match && req.method === method) {
          const [status, data] = await handler(req, match.slice(1));
          return send(res, status, { data });
        }
      }
      throw new AppError('NOT_FOUND', 'Route পাওয়া যায়নি');
    } catch (error) {
      if (error instanceof AppError) {
        const { code, message, details } = error;
        return send(res, error.status, { error: { code, message,
          ...(details.length ? { details } : {}) } });
      }
      // অপ্রত্যাশিত: পুরো বিবরণ Log-এ, Client পায় শুধু সাধারণ বার্তা।
      log('http.unhandled', { path: pathname, error: String(error),
        stack: error instanceof Error ? error.stack : undefined });
      return send(res, 500, { error: { code: 'INTERNAL',
        message: 'Server-এ সমস্যা' } });
    }
  });
}

/**
 * @param {http.ServerResponse} res
 * @param {number} status
 * @param {object} body
 */
function send(res, status, body) {
  res.writeHead(status, { ...SECURITY_HEADERS,
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}
