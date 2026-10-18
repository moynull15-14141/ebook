import test from 'node:test';
import assert from 'node:assert/strict';
import { domain } from '../../project/travel-master-pro/tests/helpers.mjs';

test('মেয়াদের এক মুহূর্ত আগে বৈধ, ঠিক মেয়াদে অবৈধ', () => {
  const { service, user, clock } = domain({ tokenTtlMs: 30 * 60_000 });
  const { token } = user('Rafi');
  clock.now += 30 * 60_000 - 1;
  assert.equal(service.authenticate(token).name, 'Rafi');
  clock.now += 1;
  assert.throws(() => service.authenticate(token), { code: 'UNAUTHORIZED' });
});

test('মেয়াদ শেষে Booking-এর চেষ্টাও 401-এর পথে', () => {
  const { service, user, clock } = domain({ tokenTtlMs: 1000 });
  const { token } = user('Mina');
  clock.now += 5000;
  assert.throws(() => {
    const me = service.authenticate(token); // HTTP স্তর আগে এটিই ডাকে
    service.createBooking(me.id, { packageId: 'BT-4D', travelers: 1,
      idempotencyKey: 'late-key-0001' });
  }, { code: 'UNAUTHORIZED' });
});
