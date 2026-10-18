import test from 'node:test';
import assert from 'node:assert/strict';
import { startSystem } from '../src/system.mjs';

const FAST = { timeoutMs: 100, retries: 1, random: () => 0 };
const trip = (id, extra = {}) => ({ bookingId: id, customer: 'Rahim',
  seats: 2, amount: 1_250_000, ...extra });

test('সফল পথ: আসন ধরা, টাকা কাটা, নিশ্চিত, Outbox-এ Event', async (t) => {
  const sys = await startSystem({ seats: 5, callOptions: FAST });
  t.after(sys.close);
  assert.deepEqual(await sys.orchestrator.book(trip('tr-1')),
    { bookingId: 'tr-1', status: 'CONFIRMED', reason: null });
  assert.deepEqual(await sys.stock(), { available: 3, reserved: 2 });
  assert.equal((await sys.ledger()).captured, 1_250_000);
  assert.deepEqual(sys.store.history('tr-1').map((h) => h.status),
    ['STARTED', 'RESERVING', 'CHARGING', 'CONFIRMED']);
  assert.deepEqual(sys.store.pendingEvents().map((e) => e.type),
    ['booking.confirmed']);
});

test('Payment প্রত্যাখ্যাত: আসন ফেরত, কোনো টাকা নেই', async (t) => {
  const sys = await startSystem({ seats: 5, callOptions: FAST });
  t.after(sys.close);
  sys.payment.faults.decline.add('Karim');
  const karim = trip('tr-2', { customer: 'Karim' });
  const result = await sys.orchestrator.book(karim);
  assert.deepEqual([result.status, result.reason],
    ['REJECTED', 'PAYMENT_DECLINED']);
  assert.deepEqual(await sys.stock(), { available: 5, reserved: 0 });
  assert.equal((await sys.ledger()).captured, 0);
});

test('আসন শেষ: Payment ডাকাই হয় না', async (t) => {
  const sys = await startSystem({ seats: 1, callOptions: FAST });
  t.after(sys.close);
  const result = await sys.orchestrator.book(trip('tr-3'));
  assert.equal(result.reason, 'SOLD_OUT');
  assert.equal((await sys.ledger()).attempts, 0);
});

test('Duplicate, একসঙ্গে Duplicate ও Conflict', async (t) => {
  const sys = await startSystem({ seats: 5, callOptions: FAST });
  t.after(sys.close);
  const results = await Promise.all([1, 2, 3, 4, 5]
    .map(() => sys.orchestrator.book(trip('tr-4'))));
  assert.ok(results.every((r) => r.status === 'CONFIRMED'));
  assert.equal((await sys.ledger()).attempts, 1);
  assert.deepEqual(await sys.stock(), { available: 3, reserved: 2 });
  await assert.rejects(sys.orchestrator.book(trip('tr-4', { seats: 3 })),
    { code: 'IDEMPOTENCY_CONFLICT' });
  const fractional = trip('tr-x', { amount: 12.5 }); // পয়সার ভগ্নাংশ নয়
  await assert.rejects(sys.orchestrator.book(fractional),
    { code: 'VALIDATION' });
});

test('উত্তর অনিশ্চিত (Timeout): Refund ও আসন ফেরত', async (t) => {
  const sys = await startSystem({ seats: 5, callOptions: FAST });
  t.after(sys.close);
  sys.payment.faults.delayMs = 250;
  const result = await sys.orchestrator.book(trip('tr-5'));
  assert.equal(result.reason, 'PAYMENT_UNCERTAIN');
  sys.payment.faults.delayMs = 0;
  const ledger = await sys.ledger();
  assert.deepEqual([ledger.captured, ledger.refunded], [0, 1_250_000]);
  assert.deepEqual(await sys.stock(), { available: 5, reserved: 0 });
});

test('Compensation-ও ব্যর্থ: MANUAL_REVIEW, লুকানো নয়', async (t) => {
  const sys = await startSystem({ seats: 5, callOptions: FAST,
    hooks: { after: async (step) => {
      if (step === 'reserved') await sys.inventory.close();
    } } });
  t.after(sys.close);
  sys.payment.faults.decline.add('Karim');
  const karim = trip('tr-6', { customer: 'Karim' });
  const result = await sys.orchestrator.book(karim);
  assert.equal(result.status, 'MANUAL_REVIEW');
  assert.match(result.reason, /^PAYMENT_DECLINED; /);
  assert.deepEqual(sys.store.pendingEvents().map((e) => e.type),
    ['booking.needs_review']);
});
