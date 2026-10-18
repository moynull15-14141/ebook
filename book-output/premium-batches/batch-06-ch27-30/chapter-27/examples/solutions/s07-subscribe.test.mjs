import test from 'node:test';
import assert from 'node:assert/strict';
import { LiveHub } from '../../project/travel-live/src/live-hub.mjs';

function hubWithBooking() {
  const hub = new LiveHub();
  hub.addUser({ id: 'rafi', role: 'customer' });
  hub.addUser({ id: 'mina', role: 'customer' });
  hub.addUser({ id: 'nadia', role: 'agent' });
  const { bookingId } = hub.createBooking('rafi', 'Kuakata');
  return { hub, bookingId };
}

test('অন্য গ্রাহক Subscribe করতে পারেন না', () => {
  const { hub, bookingId } = hubWithBooking();
  assert.throws(() => hub.subscribe('mina', bookingId, () => {}),
    { code: 'FORBIDDEN' });
  assert.equal(hub.subscriberCount(bookingId), 0);
});

test('মালিক ও Agent পারেন', () => {
  const { hub, bookingId } = hubWithBooking();
  hub.subscribe('rafi', bookingId, () => {});
  hub.subscribe('nadia', bookingId, () => {});
  assert.equal(hub.subscriberCount(bookingId), 2);
});

test('অজানা Booking-ও FORBIDDEN: অস্তিত্ব ফাঁস হয় না', () => {
  const { hub } = hubWithBooking();
  assert.throws(() => hub.subscribe('rafi', 'bk-999', () => {}),
    { code: 'FORBIDDEN' });
});
