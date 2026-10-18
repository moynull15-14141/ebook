import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { HttpError, readJson, send, sendJson, parseCookies } from './http.mjs';
import { verifyPassword } from './passwords.mjs';
import { safeEqual } from './sessions.mjs';
import { validateTripRequest } from './validate.mjs';

// শুধু এই তিনটি File; URL থেকে File-এর পথ তৈরি হয় না (Path Traversal নেই)।
const STATIC = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/app.mjs': ['app.mjs', 'text/javascript; charset=utf-8'],
  '/style.css': ['style.css', 'text/css; charset=utf-8'],
};
const PUBLIC = new URL('../public/', import.meta.url);

export function createApp(deps) {
  const { db, sessions, limiter, log, dummyHash, secureCookie = false } = deps;
  const secure = secureCookie ? '; Secure' : '';
  const flags = `HttpOnly; SameSite=Strict; Path=/${secure}`;

  function requireUser(req, { csrf = false } = {}) {
    const sid = parseCookies(req.headers.cookie).sid;
    const session = sid ? sessions.get(sid) : null;
    if (!session) {
      throw new HttpError(401, 'Login প্রয়োজন');
    }
    if (csrf) {
      const origin = req.headers.origin;
      if (origin && origin !== `http://${req.headers.host}`) {
        throw new HttpError(403, 'এই Origin থেকে অনুরোধ গ্রহণযোগ্য নয়');
      }
      if (!safeEqual(req.headers['x-csrf-token'] ?? '', session.csrf)) {
        throw new HttpError(403, 'CSRF Token মেলেনি');
      }
    }
    return { sid, session, user: { id: session.userId, role: session.role } };
  }

  async function login(req, res) {
    const { email, password } = await readJson(req);
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new HttpError(400, 'email ও password লেখা হতে হবে');
    }
    const key = email.trim().toLowerCase();
    if (limiter.blocked(key)) {
      throw new HttpError(429, 'অনেকবার ব্যর্থ; কিছুক্ষণ পরে চেষ্টা করুন');
    }
    const user = db.userByEmail(key);
    // ব্যবহারকারী না থাকলেও একই হিসাব, যাতে সময় দেখে Email অনুমান করা না যায়।
    const valid = await verifyPassword(password, user?.hash ?? dummyHash);
    if (!user || !valid) {
      limiter.fail(key);
      log('login.failed', { email: key });
      throw new HttpError(401, 'Email বা Password ভুল');
    }
    limiter.reset(key);
    const { id, csrf } = sessions.create(user);
    log('login.ok', { userId: user.id });
    sendJson(res, 200, { email: user.email, role: user.role, csrf },
      { 'set-cookie': `sid=${id}; ${flags}` });
  }

  async function createTrip(req, res) {
    const { user } = requireUser(req, { csrf: true });
    const result = validateTripRequest(await readJson(req));
    if (!result.ok) {
      sendJson(res, 422, { errors: result.errors });
      return;
    }
    // মালিক আসে Session থেকে; Body-র ownerId বা total গ্রহণ করা হয় না।
    const trip = { id: randomUUID(), ownerId: user.id, ...result.value };
    db.addTrip(trip);
    log('trip.created', { tripId: trip.id, userId: user.id });
    sendJson(res, 201, { trip });
  }

  function readTrip(req, res, id) {
    const { user } = requireUser(req);
    const trip = db.tripById(id);
    // অন্যের Trip-এর জন্যও 404, 403 নয়: অস্তিত্বও প্রকাশ করা হয় না।
    if (!trip || (trip.ownerId !== user.id && user.role !== 'admin')) {
      throw new HttpError(404, 'পাওয়া যায়নি');
    }
    sendJson(res, 200, { trip });
  }

  async function route(req, res, pathname) {
    const key = `${req.method} ${pathname}`;
    const tripId = /^\/api\/trips\/([\w-]{1,64})$/.exec(pathname)?.[1];
    if (req.method === 'GET' && Object.hasOwn(STATIC, pathname)) {
      const [file, type] = STATIC[pathname];
      const body = await readFile(new URL(file, PUBLIC));
      send(res, 200, body, { 'content-type': type });
    } else if (key === 'POST /api/login') {
      await login(req, res);
    } else if (key === 'GET /api/session') {
      const { email, role, csrf } = requireUser(req).session;
      sendJson(res, 200, { email, role, csrf });
    } else if (key === 'POST /api/logout') {
      sessions.destroy(requireUser(req, { csrf: true }).sid);
      sendJson(res, 200, { ok: true },
        { 'set-cookie': `sid=; Max-Age=0; ${flags}` });
    } else if (key === 'GET /api/trips') {
      sendJson(res, 200, { trips: db.tripsFor(requireUser(req).user) });
    } else if (key === 'POST /api/trips') {
      await createTrip(req, res);
    } else if (req.method === 'GET' && tripId) {
      readTrip(req, res, tripId);
    } else {
      throw new HttpError(404, 'পাওয়া যায়নি');
    }
  }

  return async function handle(req, res) {
    const { pathname } = new URL(req.url, 'http://localhost');
    try {
      await route(req, res, pathname);
    } catch (error) {
      if (error instanceof HttpError) {
        sendJson(res, error.status, { error: error.message });
        return;
      }
      // বিস্তারিত শুধু Server-এর Log-এ; ব্যবহারকারী পান সাধারণ বার্তা।
      log('server.error', { message: error.message, path: pathname });
      sendJson(res, 500, { error: 'Server-এ একটি সমস্যা হয়েছে' });
    }
  };
}
