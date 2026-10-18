import { createHash } from 'node:crypto';
import { callJson, createBreaker, HttpError } from './http-client.mjs';
import { TERMINAL } from './saga-store.mjs';

export class SagaError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function validate(input) {
  const { bookingId, customer, seats, amount } = input ?? {};
  const problems = [];
  if (!/^[\w-]{3,64}$/.test(bookingId ?? '')) problems.push('bookingId');
  if (typeof customer !== 'string' || !customer.trim()) problems.push('customer');
  if (!Number.isInteger(seats) || seats < 1 || seats > 9) problems.push('seats');
  // টাকা পয়সায় (Integer): ১২,৫০০ টাকা = 1250000
  if (!Number.isInteger(amount) || amount <= 0) problems.push('amount');
  if (problems.length) {
    throw new SagaError('VALIDATION', `ভুল Field: ${problems.join(', ')}`);
  }
  return { bookingId, customer: customer.trim(), seats, amount };
}

// একই অনুরোধ চেনার আঙুলের ছাপ: Field-এর ক্রম যা-ই হোক, একই Hash।
export const fingerprintOf = (request) => createHash('sha256')
  .update(JSON.stringify(Object.keys(request).sort()
    .map((key) => [key, request[key]])))
  .digest('hex');

export function createOrchestrator({ store, inventoryUrl, paymentUrl,
  call = callJson, hooks = {}, callOptions = {} }) {
  const breakers = { inventory: createBreaker(), payment: createBreaker() };
  const inFlight = new Map();
  const inventory = (path, opts) => call(`${inventoryUrl}${path}`,
    { breaker: breakers.inventory, ...callOptions, ...opts });
  const payment = (path, opts) => call(`${paymentUrl}${path}`,
    { breaker: breakers.payment, ...callOptions, ...opts });

  const view = (id) => {
    const saga = store.get(id);
    return { bookingId: id, status: saga.status, reason: saga.reason };
  };

  function finish(id, status, reason, request) {
    const type = { CONFIRMED: 'booking.confirmed', REJECTED: 'booking.rejected',
      MANUAL_REVIEW: 'booking.needs_review' }[status];
    store.transition(id, status, reason, { type, payload: { bookingId: id,
      customer: request.customer, seats: request.seats, reason } });
    return view(id);
  }

  async function book(input) {
    const request = validate(input);
    const id = request.bookingId;
    const { saga } = store.start(id, fingerprintOf(request), request);
    if (saga.fingerprint !== fingerprintOf(request)) {
      throw new SagaError('IDEMPOTENCY_CONFLICT',
        'একই bookingId, কিন্তু ভিন্ন অনুরোধ');
    }
    if (TERMINAL.has(saga.status)) return view(id);
    return singleFlight(id, () => run(id, request));
  }

  // একই Process-এ একই Booking-এর একাধিক ডাক একটিই কাজ ভাগ করে নেয়।
  function singleFlight(id, work) {
    if (!inFlight.has(id)) {
      inFlight.set(id, work().finally(() => inFlight.delete(id)));
    }
    return inFlight.get(id);
  }

  // সামনের প্রতিটি ধাপ Idempotent (একই reservationId ও chargeId), তাই
  // Crash-এর পরে শুরু থেকে আবার চালানো নিরাপদ।
  async function run(id, request) {
    store.transition(id, 'RESERVING');
    try {
      await inventory('/reservations', { method: 'POST',
        body: { reservationId: id, seats: request.seats } });
    } catch (error) {
      if (error instanceof HttpError && error.status === 409) {
        return finish(id, 'REJECTED', 'SOLD_OUT', request);
      }
      // জানা নেই আসন ধরা হয়েছে কি না: ছেড়ে দেওয়ার চেষ্টা (Idempotent)।
      return compensate(id, 'INVENTORY_UNAVAILABLE', request, false);
    }
    await hooks.after?.('reserved', id);
    store.transition(id, 'CHARGING');
    try {
      await payment('/charges', { method: 'POST', body: { chargeId: id,
        amount: request.amount, customer: request.customer } });
    } catch (error) {
      const declined = error instanceof HttpError && error.status === 402;
      // Timeout মানে ব্যর্থতা নয়: টাকা কাটা হয়ে থাকতে পারে, তাই Refund-ও।
      return compensate(id, declined ? 'PAYMENT_DECLINED'
        : 'PAYMENT_UNCERTAIN', request, !declined);
    }
    await hooks.after?.('charged', id);
    return finish(id, 'CONFIRMED', null, request);
  }

  // Compensation উল্টো ক্রমে: আগে Refund, তারপর আসন ছাড়া।
  async function compensate(id, reason, request, mayBeCharged) {
    store.transition(id, 'COMPENSATING', reason);
    try {
      if (mayBeCharged) {
        await payment(`/charges/${id}/refund`, { method: 'POST' });
      }
      await inventory(`/reservations/${id}`, { method: 'DELETE' });
      return finish(id, 'REJECTED', reason, request);
    } catch (error) {
      // ক্ষতিপূরণও ব্যর্থ: লুকানো নয়, মানুষের হাতে।
      return finish(id, 'MANUAL_REVIEW', `${reason}; ${error.message}`, request);
    }
  }

  // Restart-এর পরে: অসমাপ্ত প্রতিটি Saga শেষ করা।
  async function resume() {
    const results = [];
    for (const saga of store.unfinished()) {
      const work = saga.status === 'COMPENSATING'
        ? () => compensate(saga.id, saga.reason, saga.request, true)
        : () => run(saga.id, saga.request);
      results.push(await singleFlight(saga.id, work));
    }
    return results;
  }

  return { book, resume, breakers, status: view };
}
