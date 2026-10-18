// Password, Validation, Session, Limiter ও Log Redaction-এর Unit Test।
// চালানোর Command (Project Folder থেকে):  node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../src/passwords.mjs';
import { validateTripRequest, CATALOG } from '../src/validate.mjs';
import { createSessions, safeEqual } from '../src/sessions.mjs';
import { createLimiter } from '../src/limiter.mjs';
import { redact } from '../src/log.mjs';

const TODAY = new Date('2026-10-15T09:00:00Z');
const good = { packageId: 'cox-3d', travelers: 2, startDate: '2026-11-20' };

test('Password: একই Password, ভিন্ন Salt; সঠিকটি মেলে, ভুলটি নয়', async () => {
  const first = await hashPassword('নিরাপদ-পাস-১২৩');
  const second = await hashPassword('নিরাপদ-পাস-১২৩');
  assert.match(first, /^scrypt\$[0-9a-f]{32}\$[0-9a-f]{64}$/);
  assert.notEqual(first, second);
  assert.equal(await verifyPassword('নিরাপদ-পাস-১২৩', first), true);
  assert.equal(await verifyPassword('নিরাপদ-পাস-১২৪', first), false);
});

test('Password: বিকৃত সংরক্ষিত মানে false, Exception নয়', async () => {
  for (const stored of ['', 'md5$aa$bb', 'scrypt$aa$zz', null, 'scrypt$$']) {
    assert.equal(await verifyPassword('x', stored), false);
  }
});

test('Validation: দাম Catalog থেকে; Client-এর total ও ownerId উপেক্ষিত', () => {
  const body = { ...good, total: 1, ownerId: 99, isAdmin: true };
  const result = validateTripRequest(body, TODAY);
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, { ...good, note: '', total: 25000 });
});

test('Validation: অজানা ও Prototype-এর নামের Package বাতিল', () => {
  for (const packageId of ['goa-5d', '__proto__', 'toString', 'constructor']) {
    const result = validateTripRequest({ ...good, packageId }, TODAY);
    assert.equal(result.errors.packageId, 'অজানা Package', packageId);
  }
  assert.equal(Object.isFrozen(CATALOG['cox-3d']), true);
});

test('Validation: যাত্রী ১-৮ পূর্ণসংখ্যা, Number হিসেবে', () => {
  for (const travelers of [0, 9, 2.5, '2', null]) {
    const result = validateTripRequest({ ...good, travelers }, TODAY);
    assert.equal(result.ok, false, String(travelers));
  }
});

test('Validation: তারিখের আকার, ক্যালেন্ডার ও সীমা', () => {
  const check = (startDate) =>
    validateTripRequest({ ...good, startDate }, TODAY).errors?.startDate;
  assert.equal(check('20-11-2026'), 'তারিখ YYYY-MM-DD আকারে দিন');
  assert.equal(check('2027-02-30'), 'তারিখটি ক্যালেন্ডারে নেই');
  assert.equal(check('2026-10-15'), 'আগামীকাল থেকে এক বছরের মধ্যে');
  assert.equal(check('2028-01-01'), 'আগামীকাল থেকে এক বছরের মধ্যে');
  assert.equal(check('2026-10-16'), undefined);
});

test('Validation: নোট ও Body-র ধরন', () => {
  const long = validateTripRequest({ ...good, note: 'ক'.repeat(201) }, TODAY);
  assert.equal(long.ok, false);
  for (const body of [null, [], 'text', 5]) {
    assert.equal(validateTripRequest(body, TODAY).ok, false);
  }
});

test('Session: মেয়াদ শেষে অবৈধ; destroy-এর পর অবৈধ', () => {
  let time = 0;
  const sessions = createSessions({ ttlMs: 1000, now: () => time });
  const user = { id: 1, email: 'a@example.com', role: 'customer' };
  const { id, csrf } = sessions.create(user);
  assert.equal(sessions.get(id).csrf, csrf);
  assert.notEqual(id, csrf);
  time = 1000;
  assert.equal(sessions.get(id), null);
  const second = sessions.create(user);
  sessions.destroy(second.id);
  assert.equal(sessions.get(second.id), null);
});

test('safeEqual: সমান, অসমান ও ভিন্ন দৈর্ঘ্য', () => {
  assert.equal(safeEqual('abc', 'abc'), true);
  assert.equal(safeEqual('abc', 'abd'), false);
  assert.equal(safeEqual('abc', 'abcd'), false);
  assert.equal(safeEqual('', 'x'), false);
});

test('Limiter: সীমার পরে আটকায়; সময়-জানালা শেষে ছাড়ে', () => {
  let time = 0;
  const limiter = createLimiter({ max: 2, windowMs: 100, now: () => time });
  limiter.fail('k');
  assert.equal(limiter.blocked('k'), false);
  limiter.fail('k');
  assert.equal(limiter.blocked('k'), true);
  assert.equal(limiter.blocked('other'), false);
  time = 100;
  assert.equal(limiter.blocked('k'), false);
});

test('redact: Nested ও Array-র ভেতরেও সংবেদনশীল মান মোছে', () => {
  const input = {
    email: 'a@example.com',
    password: 'x',
    headers: { Cookie: 'sid=1', 'x-csrf-token': 't' },
    list: [{ apiSecret: 's', ok: 1 }],
  };
  assert.deepEqual(redact(input), {
    email: 'a@example.com',
    password: '[REDACTED]',
    headers: { Cookie: '[REDACTED]', 'x-csrf-token': '[REDACTED]' },
    list: [{ apiSecret: '[REDACTED]', ok: 1 }],
  });
});
