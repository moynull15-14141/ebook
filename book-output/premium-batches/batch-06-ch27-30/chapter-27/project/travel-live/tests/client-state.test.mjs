import test from 'node:test';
import assert from 'node:assert/strict';
import { BookingView } from '../src/client-state.mjs';
import { reconnectDelay } from '../src/backoff.mjs';
import { createBucket } from '../src/rate-limit.mjs';

const ev = (sequence, status, eventId = `e${sequence}`) => ({ eventId,
  bookingId: 'bk-1', sequence, payload: { status } });

test('Duplicate, পুরোনো ও ফাঁক আলাদা করে চেনা', () => {
  const view = new BookingView();
  assert.equal(view.apply(ev(1, 'PENDING')), 'applied');
  assert.equal(view.apply(ev(1, 'PENDING')), 'duplicate');
  assert.equal(view.apply(ev(1, 'PENDING', 'other')), 'stale');
  assert.equal(view.apply(ev(3, 'CANCELLED')), 'gap');
  assert.equal(view.get('bk-1').status, 'PENDING');
  view.loadSnapshot({ bookingId: 'bk-1', title: 'x', status: 'CONFIRMED',
    sequence: 2 });
  assert.equal(view.apply(ev(3, 'CANCELLED')), 'applied');
  assert.equal(view.lastSequence('bk-1'), 3);
});

test('reconnectDelay: Jitter সীমার মধ্যে, ভিত্তি ৩০ সেকেন্ডে থামে', () => {
  assert.equal(reconnectDelay(0, () => 0), 375);
  assert.equal(reconnectDelay(0, () => 0.5), 500);
  assert.equal(reconnectDelay(3, () => 0.5), 4000);
  assert.equal(reconnectDelay(50, () => 0.999_999), 37_499);
  assert.equal(reconnectDelay(50, () => 0), 22_500);
});

test('Token Bucket: সীমা ছাড়ালে false, সময়ে আবার ভরে', () => {
  let now = 0;
  const take = createBucket({ capacity: 2, refillPerSecond: 1,
    now: () => now });
  assert.deepEqual([take(), take(), take()], [true, true, false]);
  now = 1000;
  assert.equal(take(), true);
});
