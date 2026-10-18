import test from 'node:test';
import assert from 'node:assert/strict';
import { domain, PASSWORD } from './helpers.mjs';

const order = (key, extra = {}) => ({ packageId: 'BT-4D', travelers: 2,
  idempotencyKey: key, ...extra });

test('দাম Server-এর Catalog থেকে; Client-এর price উপেক্ষিত', () => {
  const { service, user } = domain();
  const { user: rafi } = user('Rafi');
  const { booking } = service.createBooking(rafi.id,
    order('key-price-01', { price: 1, totalBdt: 1 }));
  assert.equal(booking.totalBdt, 25_000);
});

test('Idempotency: একই Key ও অনুরোধে একই Booking, আসন একবার কমে', () => {
  const { service, user, seats } = domain();
  const { user: rafi } = user('Rafi');
  const first = service.createBooking(rafi.id, order('key-retry-01'));
  const retry = service.createBooking(rafi.id, order('key-retry-01'));
  assert.equal(retry.booking.id, first.booking.id);
  assert.deepEqual([first.replayed, retry.replayed], [false, true]);
  assert.equal(seats('BT-4D'), 10);
  assert.throws(() => service.createBooking(rafi.id,
    order('key-retry-01', { travelers: 3 })), { code: 'KEY_CONFLICT' });
  // অন্য ব্যবহারকারীর একই Key আলাদা অনুরোধ
  const { user: mina } = user('Mina');
  assert.notEqual(service.createBooking(mina.id, order('key-retry-01'))
    .booking.id, first.booking.id);
});

test('আসন শেষ বা অজানা Package: কিছুই বদলায় না', () => {
  const { service, user, seats, db } = domain();
  const { user: rafi } = user('Rafi');
  assert.throws(() => service.createBooking(rafi.id, order('key-sold-01',
    { packageId: 'SYL-2D', travelers: 3 })), { code: 'SOLD_OUT' });
  assert.equal(seats('SYL-2D'), 2);
  assert.throws(() => service.createBooking(rafi.id,
    order('key-none-01', { packageId: 'NOPE-1' })), { code: 'NOT_FOUND' });
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM bookings').get().n, 0);
});

test('মালিকানা: অন্যের Booking দেখা বা বাতিল নয় (404)', () => {
  const { service, user } = domain();
  const { user: rafi } = user('Rafi');
  const { user: mina } = user('Mina');
  const { booking } = service.createBooking(rafi.id, order('key-owner-01'));
  assert.throws(() => service.cancelBooking(mina.id, booking.id),
    { code: 'NOT_FOUND' });
  assert.deepEqual(service.listBookings(mina.id), []);
});

test('বাতিল একবারই আসন ফেরত দেয়', () => {
  const { service, user, seats } = domain();
  const { user: rafi } = user('Rafi');
  const { booking } = service.createBooking(rafi.id, order('key-cancel-01'));
  assert.equal(seats('BT-4D'), 10);
  service.cancelBooking(rafi.id, booking.id);
  service.cancelBooking(rafi.id, booking.id);
  assert.equal(seats('BT-4D'), 12);
  assert.equal(service.listBookings(rafi.id)[0].status, 'CANCELLED');
});
