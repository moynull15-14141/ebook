import test from 'node:test';
import assert from 'node:assert/strict';
import { LiveHub } from '../src/live-hub.mjs';
import { isValidEvent } from '../src/events.mjs';

function setup(options) {
  const hub = new LiveHub({ now: () => new Date('2026-10-18T00:00:00Z'),
    ...options });
  hub.addUser({ id: 'agent', role: 'agent' });
  hub.addUser({ id: 'rafi', role: 'customer' });
  hub.addUser({ id: 'mina', role: 'customer' });
  const { bookingId } = hub.createBooking('rafi', 'Bandarban');
  return { hub, bookingId };
}

test('বৈধ অবস্থা-বদল: Sequence প্রতি Booking-এ ক্রমিক', () => {
  const { hub, bookingId } = setup();
  const event = hub.changeStatus('agent', bookingId, 'CONFIRMED');
  assert.ok(isValidEvent(event));
  assert.equal(event.sequence, 2);
  assert.deepEqual(event.payload, { from: 'PENDING', status: 'CONFIRMED' });
  assert.equal(hub.changeStatus('rafi', bookingId, 'CANCELLED').sequence, 3);
});

test('অবৈধ বদল ও অনুমতি', () => {
  const { hub, bookingId } = setup();
  assert.throws(() => hub.changeStatus('rafi', bookingId, 'CONFIRMED'),
    { code: 'FORBIDDEN' });
  assert.throws(() => hub.changeStatus('mina', bookingId, 'CANCELLED'),
    { code: 'FORBIDDEN' });
  hub.changeStatus('rafi', bookingId, 'CANCELLED');
  assert.throws(() => hub.changeStatus('agent', bookingId, 'CONFIRMED'),
    { code: 'INVALID_TRANSITION' });
  assert.throws(() => hub.subscribe('mina', bookingId, () => {}),
    { code: 'FORBIDDEN' });
});

test('Replay: afterSequence-এর পরের Event; History-র বাইরে হলে Snapshot', () => {
  const { hub, bookingId } = setup({ historyLimit: 2 });
  hub.changeStatus('agent', bookingId, 'CONFIRMED');
  hub.changeStatus('agent', bookingId, 'CANCELLED');
  const replay = hub.subscribe('rafi', bookingId, () => {},
    { afterSequence: 1 });
  assert.equal(replay.mode, 'replay');
  assert.deepEqual(replay.events.map((e) => e.sequence), [2, 3]);
  const snap = hub.subscribe('rafi', bookingId, () => {});
  assert.equal(snap.mode, 'snapshot');
  assert.deepEqual(snap.snapshot, { bookingId, title: 'Bandarban',
    status: 'CANCELLED', sequence: 3 });
});

test('Dispatch-এর সময় অনুমতি: বাতিল ব্যবহারকারী আর Event পান না', () => {
  const { hub, bookingId } = setup();
  const got = [];
  const closed = [];
  hub.subscribe('rafi', bookingId, (e) => got.push(e.sequence),
    { onClose: (reason) => closed.push(reason) });
  hub.changeStatus('agent', bookingId, 'CONFIRMED');
  hub.revokeUser('rafi');
  hub.changeStatus('agent', bookingId, 'CANCELLED');
  assert.deepEqual(got, [2]);
  assert.deepEqual(closed, ['FORBIDDEN']);
  assert.equal(hub.subscriberCount(bookingId), 0);
});
