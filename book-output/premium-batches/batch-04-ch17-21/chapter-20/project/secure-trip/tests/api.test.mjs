// HTTP Integration Test: আসল Server, শুধু 127.0.0.1, এলোমেলো Port।
// কোনো বাইরের Service নেই। চালানোর Command (Project Folder থেকে):  node --test
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from '../src/start.mjs';

const PASSWORD = 'test-only-pass-2026';
const logs = [];
let server;
let base;

before(async () => {
  const users = [
    { email: 'rafi@example.com', role: 'customer' },
    { email: 'mina@example.com', role: 'customer' },
    { email: 'admin@example.com', role: 'admin' },
  ].map((user) => ({ ...user, password: PASSWORD }));
  ({ server, url: base } = await startServer({ users, log: (...a) => logs.push(a) }));
});

after(() => server.close());

async function call(path, { method = 'GET', body, cookie, csrf, headers } = {}) {
  const response = await fetch(base + path, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(cookie && { cookie }),
      ...(csrf && { 'x-csrf-token': csrf }),
      ...headers,
    },
    body: typeof body === 'string' ? body : body && JSON.stringify(body),
  });
  const text = await response.text();
  const json = response.headers.get('content-type')?.includes('json')
    ? JSON.parse(text) : null;
  return { status: response.status, headers: response.headers, json, text };
}

async function login(email) {
  const result = await call('/api/login', {
    method: 'POST', body: { email, password: PASSWORD },
  });
  assert.equal(result.status, 200);
  const cookie = result.headers.get('set-cookie').split(';')[0];
  return { cookie, csrf: result.json.csrf, header: result.headers.get('set-cookie') };
}

// আজ থেকে ৩০ দিন পরের তারিখ, যাতে Test কোনো দিন মেয়াদোত্তীর্ণ না হয়।
const inThirtyDays = new Date(Date.now() + 30 * 86_400_000).toISOString();
const trip = {
  packageId: 'sylhet-2d', travelers: 3, startDate: inThirtyDays.slice(0, 10),
};

test('প্রতিটি Response-এ Security Header; API-তে no-store', async () => {
  for (const path of ['/', '/api/trips']) {
    const { headers } = await call(path);
    assert.match(headers.get('content-security-policy'), /script-src 'self'/);
    assert.equal(headers.get('x-content-type-options'), 'nosniff');
    assert.equal(headers.get('referrer-policy'), 'no-referrer');
  }
  assert.equal((await call('/api/trips')).headers.get('cache-control'), 'no-store');
});

test('ভুল Password ও অজানা Email: একই 401 ও একই বার্তা', async () => {
  const wrong = await call('/api/login', {
    method: 'POST', body: { email: 'mina@example.com', password: 'nope' },
  });
  const unknown = await call('/api/login', {
    method: 'POST', body: { email: 'ghost@example.com', password: 'nope' },
  });
  assert.equal(wrong.status, 401);
  assert.deepEqual(unknown.json, wrong.json);
});

test('সফল Login: HttpOnly ও SameSite Cookie; Hash ফেরত আসে না', async () => {
  const { header } = await login('rafi@example.com');
  assert.match(header, /^sid=[\w-]{43}; HttpOnly; SameSite=Strict; Path=\//);
  const session = await call('/api/login', {
    method: 'POST', body: { email: 'rafi@example.com', password: PASSWORD },
  });
  assert.deepEqual(Object.keys(session.json).sort(), ['csrf', 'email', 'role']);
  assert.doesNotMatch(session.text, /scrypt/);
});

test('Cookie ছাড়া 401; CSRF Token বা Origin ভুল হলে 403', async () => {
  assert.equal((await call('/api/trips')).status, 401);
  const { cookie, csrf } = await login('rafi@example.com');
  const post = (options) => call('/api/trips', { method: 'POST', body: trip, cookie, ...options });
  assert.equal((await post({})).status, 403);
  assert.equal((await post({ csrf: 'x'.repeat(43) })).status, 403);
  const evil = await post({ csrf, headers: { origin: 'http://evil.example' } });
  assert.equal(evil.status, 403);
  assert.equal((await post({ csrf })).status, 201);
});

test('দাম ও মালিক Server ঠিক করে; Client-এর total ও ownerId উপেক্ষিত', async () => {
  const { cookie, csrf } = await login('rafi@example.com');
  const created = await call('/api/trips', {
    method: 'POST', cookie, csrf, body: { ...trip, total: 1, ownerId: 3 },
  });
  assert.equal(created.status, 201);
  assert.equal(created.json.trip.total, 8900 * 3);
  assert.equal(created.json.trip.ownerId, 1);
});

test('Object-level Authorization: অন্যের Trip-এ 404; Admin সব দেখে', async () => {
  const rafi = await login('rafi@example.com');
  const { json } = await call('/api/trips', {
    method: 'POST', body: trip, cookie: rafi.cookie, csrf: rafi.csrf,
  });
  const path = `/api/trips/${json.trip.id}`;
  const mina = await login('mina@example.com');
  const admin = await login('admin@example.com');
  assert.equal((await call(path, { cookie: rafi.cookie })).status, 200);
  assert.equal((await call(path, { cookie: mina.cookie })).status, 404);
  assert.equal((await call('/api/trips/no-such-id', { cookie: mina.cookie })).status, 404);
  assert.equal((await call(path, { cookie: admin.cookie })).status, 200);
  const minaList = await call('/api/trips', { cookie: mina.cookie });
  assert.deepEqual(minaList.json.trips, []);
  const adminList = await call('/api/trips', { cookie: admin.cookie });
  assert.ok(adminList.json.trips.length >= 1);
});

test('অবৈধ ইনপুটে 422, এবং কারণসহ', async () => {
  const { cookie, csrf } = await login('mina@example.com');
  const result = await call('/api/trips', {
    method: 'POST', cookie, csrf, body: { ...trip, travelers: 20 },
  });
  assert.equal(result.status, 422);
  assert.equal(result.json.errors.travelers, 'যাত্রী ১ থেকে ৮ জন');
});

test('Body: বড় হলে 413, ভুল ধরন 415, ভাঙা JSON 400', async () => {
  const big = JSON.stringify({ email: 'x'.repeat(20_000), password: 'p' });
  assert.equal((await call('/api/login', { method: 'POST', body: big })).status, 413);
  const plain = await call('/api/login', {
    method: 'POST', body: 'a=b', headers: { 'content-type': 'text/plain' },
  });
  assert.equal(plain.status, 415);
  const broken = await call('/api/login', { method: 'POST', body: '{"email":' });
  assert.equal(broken.status, 400);
});

test('SQL Injection-এর চেষ্টা: Parameterized Query-তে শুধু একটি অজানা Email', async () => {
  const result = await call('/api/login', {
    method: 'POST', body: { email: "' OR '1'='1' --", password: 'x' },
  });
  assert.equal(result.status, 401);
});

test('পাঁচবার ব্যর্থতার পর সঠিক Password-এও 429', async () => {
  const body = { email: 'admin@example.com', password: 'wrong' };
  for (let i = 0; i < 5; i += 1) {
    assert.equal((await call('/api/login', { method: 'POST', body })).status, 401);
  }
  const blocked = await call('/api/login', {
    method: 'POST', body: { ...body, password: PASSWORD },
  });
  assert.equal(blocked.status, 429);
});

test('Logout-এর পর পুরোনো Cookie অবৈধ', async () => {
  const { cookie, csrf } = await login('mina@example.com');
  const out = await call('/api/logout', { method: 'POST', cookie, csrf });
  assert.equal(out.status, 200);
  assert.match(out.headers.get('set-cookie'), /Max-Age=0/);
  assert.equal((await call('/api/trips', { cookie })).status, 401);
});

test('Static: শুধু তালিকাভুক্ত File; অন্য পথ 404', async () => {
  assert.equal((await call('/')).status, 200);
  for (const path of ['/server.mjs', '/../server.mjs', '/%2e%2e/server.mjs',
    '/src/app.mjs', '/public/index.html']) {
    assert.equal((await call(path)).status, 404, path);
  }
});

test('Log-এ Password বা Token নেই', () => {
  const text = JSON.stringify(logs);
  assert.ok(logs.length > 0);
  assert.doesNotMatch(text, new RegExp(PASSWORD));
  assert.doesNotMatch(text, /"csrf"|sid=/);
});
