// User Directory API Explorer-এর Automated Test।  চালানোর Command (Project Folder থেকে):  node --test
// কৃত্রিম fetch দিয়ে Unit Test, এবং tests/mock-server.js-এর Local Server দিয়ে আসল fetch-এর Integration Test।
// কোনো Public API ব্যবহার করা হয় না।
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const loadScript = require('./load-script.js');
const { startServer } = require('./mock-server.js');

const { fn, get } = loadScript(path.join(__dirname, '..', 'directory.js'), {
  setTimeout, clearTimeout, AbortController, AbortSignal, Response, DOMException, fetch,
});
const { normalizeUser, filterUsers, sortUsers, wait, fetchJson, fetchWithRetry, loadUsers, errorMessage } = fn;
const isTemporary = get('isTemporary');
const json = v => JSON.stringify(v);

const users = [
  { id: 1, name: 'Sara Ahmed', email: 'sara@example.com', city: 'Dhaka' },
  { id: 2, name: 'rafi khan', email: 'rafi@example.com', city: 'Bogura' },
  { id: 3, name: 'Mina Das', email: 'mina@mail.test', city: 'Sylhet' },
];

// কৃত্রিম fetch: প্রতিটি Call-এ তালিকার পরের সাড়া (শেষটি বারবার)। সাড়া হতে পারে { status, body }, একটি Error, বা একটি Function।
function fakeFetch(...replies) {
  const calls = [];
  const impl = async (url, init) => {
    calls.push({ url, init });
    const reply = replies[Math.min(calls.length - 1, replies.length - 1)];
    if (reply instanceof Error) throw reply;
    if (typeof reply === 'function') return reply(init);
    const body = typeof reply.body === 'string' ? reply.body : JSON.stringify(reply.body ?? []);
    return new Response(body, { status: reply.status ?? 200 });
  };
  return { impl, calls };
}
const neverAnswers = (init) => new Promise((_, reject) => {
  init.signal.addEventListener('abort', () => reject(init.signal.reason));
});
const fast = { backoffMs: 1, timeoutMs: 1000 };

test('normalizeUser: প্রয়োজনীয় অংশ, trim করা নাম ও Email', () => {
  const raw = { id: 1, name: ' Sara ', email: ' s@x.com ', phone: '017', address: { city: 'Dhaka' } };
  assert.equal(json(normalizeUser(raw)), json({ id: 1, name: 'Sara', email: 's@x.com', city: 'Dhaka' }));
});

test('normalizeUser: ভুল গঠনে null; Email বা শহর না থাকলে নিরাপদ মান', () => {
  for (const bad of [null, undefined, {}, { id: '1', name: 'A' }, { id: 1.5, name: 'A' }, { id: 1 }, { id: 1, name: 5 }]) {
    assert.equal(normalizeUser(bad), null, json(bad));
  }
  assert.equal(json(normalizeUser({ id: 2, name: 'B', address: { city: 7 } })), json({ id: 2, name: 'B', email: '', city: 'অজানা' }));
});

test('filterUsers: নাম, Email ও শহরে, বড়-ছোট হাতের অক্ষর নির্বিশেষে', () => {
  const ids = (q) => filterUsers(users, q).map(u => u.id).join(',');
  assert.equal(ids('RAFI'), '2');
  assert.equal(ids('mail.test'), '3');
  assert.equal(ids(' dhaka '), '1');
  assert.equal(ids(''), '1,2,3');
  assert.equal(ids('কেউ নেই'), '');
});

test('sortUsers: নাম, শহর; অচেনা Key-তে নাম; মূল তালিকা অপরিবর্তিত', () => {
  assert.equal(sortUsers(users, 'name').map(u => u.id).join(','), '3,2,1');
  assert.equal(sortUsers(users, 'city').map(u => u.city).join(','), 'Bogura,Dhaka,Sylhet');
  assert.equal(sortUsers(users, 'password').map(u => u.id).join(','), '3,2,1');
  assert.equal(users.map(u => u.id).join(','), '1,2,3');
});

test('wait: সময় পরে fulfilled; আগে থেকে বা মাঝপথে বাতিলে AbortError', async () => {
  const start = Date.now();
  await wait(40);
  assert.ok(Date.now() - start >= 35);

  const done = new AbortController();
  done.abort();
  await assert.rejects(wait(1000, done.signal), { name: 'AbortError' });

  const later = new AbortController();
  setTimeout(() => later.abort(), 20);
  const t0 = Date.now();
  await assert.rejects(wait(5000, later.signal), { name: 'AbortError' });
  assert.ok(Date.now() - t0 < 1000);
});

test('fetchJson: JSON ফেরত, Accept Header এবং signal পাঠায়', async () => {
  const { impl, calls } = fakeFetch({ body: [{ id: 1 }] });
  const data = await fetchJson('/api/users', { fetchImpl: impl });
  assert.equal(json(data), json([{ id: 1 }]));
  assert.equal(calls[0].url, '/api/users');
  assert.equal(calls[0].init.headers.Accept, 'application/json');
  assert.equal(typeof calls[0].init.signal.aborted, 'boolean');
});

test('fetchJson: HTTP 404-এ status-সহ ত্রুটি', async () => {
  const { impl } = fakeFetch({ status: 404, body: 'Not found' });
  await assert.rejects(fetchJson('/x', { fetchImpl: impl }), (error) => error.message === 'HTTP 404' && error.status === 404);
});

test('fetchJson: সাড়া না এলে সময়সীমা শেষে TimeoutError', async () => {
  // Node.js-এ AbortSignal.timeout-এর Timer একা Process জাগিয়ে রাখে না; আসল fetch-এ খোলা Socket সেই কাজ করে।
  // কৃত্রিম fetch-এ Socket নেই, তাই Test চলাকালীন একটি Timer Process জাগিয়ে রাখে।
  const keepAlive = setInterval(() => {}, 1000);
  try {
    const { impl } = fakeFetch(neverAnswers);
    const t0 = Date.now();
    await assert.rejects(fetchJson('/slow', { fetchImpl: impl, timeoutMs: 60 }), { name: 'TimeoutError' });
    assert.ok(Date.now() - t0 < 1000);
  } finally {
    clearInterval(keepAlive);
  }
});

test('fetchWithRetry: 503, 500, তারপর 200; মোট তিনবার চেষ্টা', async () => {
  const { impl, calls } = fakeFetch({ status: 503 }, { status: 500 }, { body: ['ok'] });
  const data = await fetchWithRetry('/u', { fetchImpl: impl, ...fast });
  assert.equal(json(data), '["ok"]');
  assert.equal(calls.length, 3);
});

test('fetchWithRetry: 404-এ আবার চেষ্টা নয়', async () => {
  const { impl, calls } = fakeFetch({ status: 404 }, { body: ['ok'] });
  await assert.rejects(fetchWithRetry('/u', { fetchImpl: impl, ...fast }), { message: 'HTTP 404' });
  assert.equal(calls.length, 1);
});

test('fetchWithRetry: সব চেষ্টা ব্যর্থ হলে retries + 1 বার পরে শেষ ত্রুটি', async () => {
  const { impl, calls } = fakeFetch({ status: 503 });
  await assert.rejects(fetchWithRetry('/u', { fetchImpl: impl, ...fast, retries: 2 }), (e) => e.status === 503);
  assert.equal(calls.length, 3);
});

test('fetchWithRetry: Network ত্রুটি (TypeError) সাময়িক; Backoff দ্বিগুণ হয়', async () => {
  const { impl, calls } = fakeFetch(new TypeError('fetch failed'), new TypeError('fetch failed'), { body: [1] });
  const t0 = Date.now();
  await fetchWithRetry('/u', { fetchImpl: impl, backoffMs: 40 });
  const elapsed = Date.now() - t0;
  assert.equal(calls.length, 3);
  assert.ok(elapsed >= 110, `40 + 80 ms অপেক্ষার কথা, হয়েছে ${elapsed}`);
});

test('fetchWithRetry: Backoff-এর অপেক্ষার মাঝে বাতিল করলে সঙ্গে সঙ্গে থামে', async () => {
  const { impl, calls } = fakeFetch({ status: 503 });
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 30);
  const t0 = Date.now();
  await assert.rejects(fetchWithRetry('/u', { fetchImpl: impl, signal: controller.signal, backoffMs: 5000 }), { name: 'AbortError' });
  assert.equal(calls.length, 1);
  assert.ok(Date.now() - t0 < 1000);
});

test('isTemporary: শুধু Network, সময়সীমা ও 5xx', () => {
  const withStatus = (status) => Object.assign(new Error('x'), { status });
  assert.equal(isTemporary(new TypeError('fetch failed')), true);
  assert.equal(isTemporary(new DOMException('t', 'TimeoutError')), true);
  assert.equal(isTemporary(withStatus(502)), true);
  assert.equal(isTemporary(withStatus(404)), false);
  assert.equal(isTemporary(new DOMException('a', 'AbortError')), false);
  assert.equal(isTemporary(new SyntaxError('bad json')), false);
});

test('loadUsers: ভুল গঠনের User বাদ; Array না এলে ত্রুটি', async () => {
  const good = fakeFetch({ body: [{ id: 1, name: 'A' }, { id: 'x' }, null, { id: 2, name: 'B' }] });
  assert.equal((await loadUsers({ fetchImpl: good.impl, ...fast })).map(u => u.name).join(','), 'A,B');
  const wrong = fakeFetch({ body: { users: [] } });
  await assert.rejects(loadUsers({ fetchImpl: wrong.impl, ...fast }), { message: 'Server থেকে অপ্রত্যাশিত তথ্য এসেছে।' });
});

test('errorMessage: প্রতিটি ধরনের জন্য ব্যবহারকারীর ভাষায় বার্তা', () => {
  const withStatus = (status) => Object.assign(new Error('x'), { status });
  assert.equal(errorMessage(new DOMException('t', 'TimeoutError')), 'Server সাড়া দিতে দেরি করছে। একটু পরে আবার চেষ্টা করুন।');
  assert.equal(errorMessage(withStatus(503)), 'Server-এ সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।');
  assert.equal(errorMessage(withStatus(404)), 'তথ্যের ঠিকানা পাওয়া যায়নি।');
  assert.equal(errorMessage(new TypeError('fetch failed')), 'Network-এ সংযোগ নেই। সংযোগ দেখে আবার চেষ্টা করুন।');
  assert.equal(errorMessage(new SyntaxError('bad')), 'তথ্য আনা যায়নি। আবার চেষ্টা করুন।');
});

test('Integration (Local Server, আসল fetch): সফল সাড়া, এবং 503-এর পর আবার চেষ্টায় সফল', async () => {
  const server = await startServer();
  try {
    const first = await loadUsers({ url: `${server.url}/api/users`, ...fast });
    assert.equal(first.map(u => u.city).join(','), 'Dhaka,Bogura,Sylhet');

    server.reply({ status: 503 });
    const before = server.state.hits;
    const second = await loadUsers({ url: `${server.url}/api/users`, ...fast });
    assert.equal(second.length, 3);
    assert.equal(server.state.hits - before, 2);
  } finally {
    await server.close();
  }
});

test('Integration (Local Server, আসল fetch): ধীর Server-এ TimeoutError, ব্যবহারকারীর বাতিলে AbortError', async () => {
  const server = await startServer();
  try {
    server.reply({ delayMs: 2000 });
    await assert.rejects(loadUsers({ url: `${server.url}/api/users`, timeoutMs: 100, retries: 0 }), { name: 'TimeoutError' });

    server.reply({ delayMs: 2000 });
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 50);
    await assert.rejects(loadUsers({ url: `${server.url}/api/users`, signal: controller.signal }), { name: 'AbortError' });
  } finally {
    await server.close();
  }
});
