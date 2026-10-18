import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRegistration, validateBooking } from '../src/validation.mjs';

test('Registration: Email স্বাভাবিক করা, দুর্বল Input-এ সব কারণ', () => {
  assert.deepEqual(validateRegistration({ name: '  Rafi ',
    email: ' RAFI@Example.COM ', password: 'twelve-chars!' }),
  { name: 'Rafi', email: 'rafi@example.com', password: 'twelve-chars!' });
  assert.throws(() => validateRegistration({ name: 'R', email: 'no-at',
    password: 'short' }), (error) => {
    assert.equal(error.code, 'VALIDATION');
    assert.equal(error.details.length, 3);
    return true;
  });
});

test('travelers: NaN, Infinity, ভগ্নাংশ, ঋণাত্মক, String, ১০-এর বেশি', () => {
  const base = { packageId: 'BT-4D', idempotencyKey: 'key-12345678' };
  for (const travelers of [Number.NaN, Infinity, 1.5, -1, 0, '2', 11, null]) {
    assert.throws(() => validateBooking({ ...base, travelers }),
      { code: 'VALIDATION' }, `travelers = ${String(travelers)}`);
  }
  assert.equal(validateBooking({ ...base, travelers: 10 }).travelers, 10);
});

test('idempotencyKey ও packageId-এর Format', () => {
  const ok = { packageId: 'BT-4D', travelers: 1, idempotencyKey: 'a'.repeat(8) };
  assert.doesNotThrow(() => validateBooking(ok));
  for (const idempotencyKey of ['short', 'has space 123', 'x'.repeat(65)]) {
    assert.throws(() => validateBooking({ ...ok, idempotencyKey }));
  }
  assert.throws(() => validateBooking({ ...ok, packageId: "x'; DROP" }));
});
