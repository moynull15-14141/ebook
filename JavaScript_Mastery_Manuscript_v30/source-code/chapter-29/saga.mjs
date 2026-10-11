/** TravelSaga: educational in-memory orchestration with compensating actions. */
export class SagaError extends Error {
  constructor(code, message) { super(message); this.name = 'SagaError'; this.code = code; }
}
export function createInventory({ seats = 2 } = {}) {
  if (!Number.isInteger(seats) || seats < 0) throw new SagaError('INVALID_STOCK','Invalid seats');
  let available = seats;
  const held = new Set();
  return {
    reserve(id) {
      if (held.has(id)) return { id, alreadyReserved: true };
      if (available <= 0) throw new SagaError('SOLD_OUT','No seats available');
      available--; held.add(id); return { id, alreadyReserved: false };
    },
    release(id) { if (!held.delete(id)) return false; available++; return true; },
    snapshot() { return { available, held: [...held] }; }
  };
}
export function createPaymentGateway({ shouldFail = () => false } = {}) {
  const charges = new Map();
  return {
    charge(id, amount) {
      if (!Number.isSafeInteger(amount) || amount <= 0) throw new SagaError('INVALID_AMOUNT','Amount must be positive integer minor units');
      if (charges.has(id)) return { id, amount: charges.get(id), repeated: true };
      if (shouldFail(id)) throw new SagaError('PAYMENT_FAILED','Payment declined');
      charges.set(id, amount); return { id, amount, repeated: false };
    },
    refund(id) { return charges.delete(id); },
    snapshot() { return [...charges.entries()]; }
  };
}
export function createBookingRepository() {
  const records = new Map();
  return {
    get(id) { return records.get(id) ? structuredClone(records.get(id)) : null; },
    save(record) { records.set(record.id, structuredClone(record)); return this.get(record.id); },
    all() { return [...records.values()].map(x => structuredClone(x)); }
  };
}
export function createTravelSaga({ inventory, payments, bookings }) {
  if (!inventory || !payments || !bookings) throw new Error('Missing dependencies');
  // Per-key single-flight avoids duplicate concurrent processing inside one process.
  const inFlight = new Map();
  async function execute({ id, customer, amount }) {
    if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{3,64}$/.test(id)) throw new SagaError('INVALID_ID','Invalid booking ID');
    if (typeof customer !== 'string' || customer.trim().length < 2) throw new SagaError('INVALID_CUSTOMER','Invalid customer');
    if (!Number.isSafeInteger(amount) || amount <= 0) throw new SagaError('INVALID_AMOUNT','Invalid amount');
    const previous = bookings.get(id);
    if (previous) {
      if (previous.customer !== customer.trim() || previous.amount !== amount) throw new SagaError('IDEMPOTENCY_CONFLICT','Same ID, different payload');
      return previous;
    }
    const compensation = [];
    try {
      inventory.reserve(id);
      compensation.push(() => inventory.release(id));
      payments.charge(id, amount);
      compensation.push(() => payments.refund(id));
      return bookings.save({ id, customer: customer.trim(), amount, status: 'CONFIRMED' });
    } catch (error) {
      const failed = [];
      for (const undo of compensation.reverse()) {
        try { await undo(); } catch (e) { failed.push(e.message); }
      }
      if (failed.length) throw new SagaError('COMPENSATION_FAILED', `Manual recovery required: ${failed.join('; ')}`);
      throw error;
    }
  }
  return {
    book(input) {
      const key = input?.id;
      if (inFlight.has(key)) return inFlight.get(key);
      const task = Promise.resolve().then(() => execute(input));
      inFlight.set(key, task);
      task.finally(() => { if (inFlight.get(key) === task) inFlight.delete(key); }).catch(() => {});
      return task;
    }
  };
}
