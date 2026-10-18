// Integration Test: Booking Service + Fake Repository, Stub Payment, Mock Notifier, Spy Sleep, Fake Clock।
// চালানোর Command (Project Folder থেকে):  node --test
import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { createBookingService } from '../src/booking-service.mjs';
import { createMemoryRepository } from '../src/memory-repository.mjs';
import { PaymentError } from '../src/errors.mjs';

const request = { customer: 'Sara', email: 'sara@example.com', seats: 2 };

// প্রতিটি Test-এর জন্য নতুন, পরিষ্কার নির্ভরতা (beforeEach)।
let repository;
let payment;
let notifier;
let sleep;
let logs;

function service(options = {}) {
  return createBookingService({
    repository,
    payment,
    notifier,
    sleep,
    clock: () => new Date('2026-12-01T10:00:00Z'),
    log: (level, event, data) => logs.push({ level, event, ...data }),
    ...options,
  });
}

// Payment Stub: উত্তরের তালিকা থেকে একটি একটি করে; Error হলে ছোড়ে।
function scriptedPayment(...outcomes) {
  let index = 0;
  return {
    charge: mock.fn(async () => {
      const outcome = outcomes[Math.min(index, outcomes.length - 1)];
      index += 1;
      if (outcome instanceof Error) {
        throw outcome;
      }
      return outcome;
    }),
    refund: mock.fn(async () => {}),
  };
}

beforeEach(() => {
  repository = createMemoryRepository(10);
  payment = scriptedPayment('PAY-1');
  notifier = { send: mock.fn(async () => {}) };
  sleep = mock.fn(async () => {});
  logs = [];
});

describe('book', () => {
  it('সফল: সংরক্ষিত, আসন কমে, Email ঠিক একবার, সময় Inject করা', async () => {
    const booking = await service().book(request, 'R-1');
    assert.deepEqual(booking, {
      id: 'R-1', customer: 'Sara', email: 'sara@example.com', seats: 2, amount: 700,
      receipt: 'PAY-1', status: 'confirmed', createdAt: '2026-12-01T10:00:00.000Z',
    });
    assert.deepEqual(await repository.find('R-1'), booking);
    assert.equal(repository.available, 8);
    assert.equal(notifier.send.mock.callCount(), 1);
    assert.deepEqual(notifier.send.mock.calls[0].arguments, ['sara@example.com', 'Booking R-1 নিশ্চিত']);
    assert.deepEqual(payment.charge.mock.calls[0].arguments[0], { amount: 700, email: 'sara@example.com', key: 'R-1' });
  });

  it('সাময়িক Payment ত্রুটিতে Retry: বিরতি 100, 200; তৃতীয় চেষ্টায় সফল; প্রতিটি Retry Log', async () => {
    const busy = new PaymentError('busy', { retryable: true });
    payment = scriptedPayment(busy, busy, 'PAY-3');
    const booking = await service().book(request, 'R-2');
    assert.equal(booking.receipt, 'PAY-3');
    assert.deepEqual(sleep.mock.calls.map((call) => call.arguments[0]), [100, 200]);
    assert.deepEqual(logs.filter((l) => l.event === 'payment-retry').map((l) => l.attempt), [1, 2]);
  });

  it('Retry শেষ: ত্রুটি ছোড়ে, আসন ফেরত (Compensation), কিছু সংরক্ষিত নয়, error Log', async () => {
    payment = scriptedPayment(new PaymentError('busy', { retryable: true }));
    await assert.rejects(service().book(request, 'R-3'), { name: 'PaymentError' });
    assert.equal(payment.charge.mock.callCount(), 3);
    assert.equal(repository.available, 10);
    assert.equal(await repository.find('R-3'), null);
    assert.deepEqual(logs.at(-1), { level: 'error', event: 'payment-failed', requestId: 'R-3', code: 'PAYMENT' });
  });

  it('স্থায়ী Payment ত্রুটিতে (retryable নয়) Retry নয়, কিন্তু আসন ফেরত', async () => {
    payment = scriptedPayment(new PaymentError('card declined'));
    await assert.rejects(service().book(request, 'R-4'), /card declined/);
    assert.equal(payment.charge.mock.callCount(), 1);
    assert.equal(sleep.mock.callCount(), 0);
    assert.equal(repository.available, 10);
  });

  it('অপ্রত্যাশিত ত্রুটিতে (PaymentError নয়) Retry নয়; আসন ফেরত; code UNKNOWN', async () => {
    payment = scriptedPayment(new TypeError('bug'));
    await assert.rejects(service().book(request, 'R-5'), TypeError);
    assert.equal(payment.charge.mock.callCount(), 1);
    assert.equal(repository.available, 10);
    assert.equal(logs.at(-1).code, 'UNKNOWN');
  });

  it('আসন না থাকলে SoldOutError; Payment-এর চেষ্টাই নয়', async () => {
    repository = createMemoryRepository(1);
    await assert.rejects(service().book(request, 'R-6'), (e) => e.code === 'SOLD_OUT' && e.left === 1);
    assert.equal(payment.charge.mock.callCount(), 0);
    assert.equal(repository.available, 1);
  });

  it('অবৈধ অনুরোধে ValidationError; আসন বা Payment-এ হাত নেই', async () => {
    await assert.rejects(service().book({ ...request, seats: 0 }, 'R-7'), { name: 'ValidationError' });
    assert.equal(repository.available, 10);
    assert.equal(payment.charge.mock.callCount(), 0);
  });

  it('Regression (Idempotency): একই অনুরোধ-ID দুবার; Payment একবার, আসন একবার', async () => {
    const svc = service();
    const first = await svc.book(request, 'R-8');
    const second = await svc.book(request, 'R-8');
    assert.deepEqual(second, first);
    assert.equal(payment.charge.mock.callCount(), 1);
    assert.equal(repository.available, 8);
  });

  it('Email ব্যর্থ হলেও Booking সফল; warn Log', async () => {
    notifier = { send: mock.fn(async () => { throw new Error('SMTP বন্ধ'); }) };
    const booking = await service().book(request, 'R-9');
    assert.equal(booking.status, 'confirmed');
    assert.deepEqual(logs.at(-1), { level: 'warn', event: 'notify-failed', id: 'R-9', reason: 'SMTP বন্ধ' });
  });

  it('একসঙ্গে 20টি অনুরোধ, 10 আসন: ঠিক 10টি সফল, বাকি SOLD_OUT, আসন 0', async () => {
    const svc = service();
    const results = await Promise.allSettled(Array.from({ length: 20 }, (_, i) =>
      svc.book({ ...request, seats: 1 }, `C-${i}`)));
    assert.equal(results.filter((r) => r.status === 'fulfilled').length, 10);
    assert.equal(results.filter((r) => r.reason?.code === 'SOLD_OUT').length, 10);
    assert.equal(repository.available, 0);
  });
});

describe('cancel', () => {
  it('Refund রসিদ দিয়ে, আসন ফেরত, অবস্থা cancelled', async () => {
    const svc = service();
    await svc.book(request, 'R-10');
    const cancelled = await svc.cancel('R-10');
    assert.equal(cancelled.status, 'cancelled');
    assert.deepEqual(payment.refund.mock.calls[0].arguments, ['PAY-1']);
    assert.equal(repository.available, 10);
    assert.equal((await repository.find('R-10')).status, 'cancelled');
  });

  it('দুবার বাতিল ALREADY_CANCELLED; অচেনা ID NOT_FOUND; Refund একবারই', async () => {
    const svc = service();
    await svc.book(request, 'R-11');
    await svc.cancel('R-11');
    await assert.rejects(svc.cancel('R-11'), (e) => e.code === 'ALREADY_CANCELLED');
    await assert.rejects(svc.cancel('X'), (e) => e.code === 'NOT_FOUND' && e.message === 'X পাওয়া যায়নি।');
    assert.equal(payment.refund.mock.callCount(), 1);
  });
});

describe('Fake Repository-ও আসলের মতো আচরণ করে', () => {
  it('ফেরত পাওয়া Booking বদলালে সংরক্ষিতটি অক্ষত', async () => {
    await service().book(request, 'R-12');
    const found = await repository.find('R-12');
    found.status = 'হ্যাক';
    assert.equal((await repository.find('R-12')).status, 'confirmed');
  });
});
