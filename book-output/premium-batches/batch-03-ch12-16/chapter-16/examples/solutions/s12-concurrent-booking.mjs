const SRC = '../../project/booking-guard/src';
const { createBookingService } = await import(`${SRC}/booking-service.mjs`);
const { createMemoryRepository } = await import(`${SRC}/memory-repository.mjs`);

const repository = createMemoryRepository(10);
const service = createBookingService({
  repository,
  payment: { charge: async () => 'PAY', refund: async () => {} },
  notifier: { send: async () => {} },
});

const requests = Array.from({ length: 20 }, (_, i) =>
  service.book({ customer: `User ${i}`, email: `u${i}@x.co`, seats: 1 }, i));
const results = await Promise.allSettled(requests);

const ok = results.filter((result) => result.status === 'fulfilled').length;
const soldOut = results.filter((r) => r.reason?.code === 'SOLD_OUT').length;
console.log(ok, soldOut, repository.available);
