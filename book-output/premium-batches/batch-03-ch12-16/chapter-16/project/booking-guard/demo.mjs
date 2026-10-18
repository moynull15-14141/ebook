import { createBookingService } from './src/booking-service.mjs';
import { createMemoryRepository } from './src/memory-repository.mjs';
import { PaymentError } from './src/errors.mjs';

let charges = 0;
const payment = {
  async charge() {
    charges += 1;
    if (charges === 1) {
      throw new PaymentError('Gateway সাময়িক ব্যস্ত', { retryable: true });
    }
    return `PAY-${charges}`;
  },
  async refund() {},
};

const repository = createMemoryRepository(10);
const service = createBookingService({
  repository,
  payment,
  notifier: { send: async () => { throw new Error('SMTP বন্ধ'); } },
  clock: () => new Date('2026-12-01T10:00:00Z'),
  sleep: async () => {},
  log: (level, event, data) =>
    console.log(JSON.stringify({ level, event, ...data })),
});

const request = { customer: 'Sara', email: 'Sara@Example.com', seats: 5 };
const first = await service.book(request, 'REQ-1');
const again = await service.book(request, 'REQ-1');
const { available } = repository;
console.log(first.amount, first.receipt, again.receipt, charges, available);

const failing = [[{ ...request, seats: 6 }, 'REQ-2'], [{ seats: 0 }, 'REQ-3']];
for (const [raw, id] of failing) {
  try {
    await service.book(raw, id);
  } catch (error) {
    const detail = error.left ?? Object.keys(error.fields).join(',');
    console.log(error.name, error.code, detail);
  }
}
