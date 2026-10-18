// Modular Monolith: একটি Deploy, কিন্তু প্রতিটি Module শুধু তার Public
// Interface দেয়; অন্য Module-এর Data সরাসরি ছোঁয়া যায় না।
function createInventoryModule(seats) {
  let available = seats; // Private: বাইরে থেকে দেখা বা বদলানো যায় না
  return Object.freeze({
    reserve(count) {
      if (count > available) return { ok: false, reason: 'SOLD_OUT' };
      available -= count;
      return { ok: true };
    },
    release(count) {
      available += count;
    },
    available: () => available,
  });
}

function createBookingModule({ inventory }) {
  const bookings = [];
  return Object.freeze({
    book(customer, seats) {
      const result = inventory.reserve(seats); // শুধু Interface দিয়ে
      if (!result.ok) return result;
      bookings.push({ customer, seats });
      return { ok: true, bookingNo: bookings.length };
    },
  });
}

const inventory = createInventoryModule(3);
const booking = createBookingModule({ inventory });
console.log(booking.book('Rahim', 2));
console.log(booking.book('Mina', 2));
console.log('বাকি আসন:', inventory.available());
try {
  inventory.available = () => 99; // অন্য Module-এর ভেতরে হাত দেওয়ার চেষ্টা
} catch (error) {
  console.log('আটকানো হলো:', error.constructor.name);
}
