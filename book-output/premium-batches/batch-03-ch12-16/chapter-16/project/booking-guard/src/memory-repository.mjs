import { SoldOutError } from './errors.mjs';

// Database-এর Fake: একই আচরণ, Memory-তে।
// আসল Database-এর Adapter-কেও এই চারটি Method দিতে হবে।
export function createMemoryRepository(capacity) {
  let available = capacity;
  const bookings = new Map();

  return {
    async reserve(seats) {
      if (seats > available) {
        throw new SoldOutError(available);
      }
      available -= seats;
    },
    async release(seats) {
      available += seats;
    },
    async save(booking) {
      bookings.set(booking.id, structuredClone(booking));
    },
    async find(id) {
      return bookings.has(id) ? structuredClone(bookings.get(id)) : null;
    },
    get available() {
      return available;
    },
  };
}
