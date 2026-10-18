// BookingManager-এর Test।  চালানোর Command (Project Folder থেকে):  node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { BookingError, FlightBooking, HotelBooking } from '../src/booking.mjs';
import { BookingManager } from '../src/manager.mjs';

const flight = (id, price = 5000, baggageFee = 0) => new FlightBooking({ id, customer: 'Sara', price, baggageFee });
const hotel = (id, price = 3000, nights = 2) => new HotelBooking({ id, customer: 'Rafi', price, nights });

function sample(notify) {
  const manager = new BookingManager({ notify });
  manager.add(flight('F-1', 5200, 800));
  manager.add(hotel('H-1', 3500, 3));
  manager.add(flight('F-2', 4800));
  return manager;
}

test('add ও find: যোগ হয়, ID দিয়ে পাওয়া যায়; না থাকলে null', () => {
  const manager = sample();
  assert.equal(manager.count, 3);
  assert.equal(manager.find('H-1').nights, 3);
  assert.equal(manager.find('X'), null);
});

test('add: একই ID দুবার নয়; সাধারণ Object নয়', () => {
  const manager = sample();
  assert.throws(() => manager.add(hotel('F-1')), (e) => e instanceof BookingError && e.message === 'F-1 আগে থেকেই আছে।');
  assert.throws(() => manager.add({ id: 'Z', total: 1 }), TypeError);
  assert.equal(manager.count, 3);
});

test('confirmedRevenue ও revenueByType: বাতিল বাদ, Polymorphic মোট', () => {
  const manager = sample();
  assert.equal(manager.confirmedRevenue, 6000 + 10500 + 4800);
  manager.cancel('F-2');
  assert.equal(manager.confirmedRevenue, 16500);
  assert.deepEqual(manager.revenueByType(), { flight: 6000, hotel: 10500 });
});

test('cancel: অচেনা ID ও দ্বিতীয়বার বাতিলে BookingError', () => {
  const manager = sample();
  assert.throws(() => manager.cancel('X'), (e) => e.message === 'X পাওয়া যায়নি।');
  manager.cancel('H-1');
  assert.throws(() => manager.cancel('H-1'), (e) => e.message === 'H-1 আগেই বাতিল হয়েছে।');
});

test('list: Copy ফেরত দেয়; বাইরে বদলালে Manager অপরিবর্তিত; ভেতরের তালিকা Private', () => {
  const manager = sample();
  const list = manager.list();
  list.pop();
  list.push({ id: 'fake' });
  assert.equal(manager.count, 3);
  assert.deepEqual(Object.keys(manager), []);
});

test('Composition: Notifier প্রতিটি নতুন ও বাতিল Booking-এর খবর পায়', () => {
  const messages = [];
  const manager = sample((text) => messages.push(text));
  manager.cancel('F-1');
  assert.deepEqual(messages, [
    'নতুন: F-1 (flight) Sara: 6000 টাকা, confirmed',
    'নতুন: H-1 (hotel) Rafi: 10500 টাকা, confirmed',
    'নতুন: F-2 (flight) Sara: 4800 টাকা, confirmed',
    'বাতিল: F-1',
  ]);
});

test('Notifier না দিলেও কাজ করে', () => {
  assert.doesNotThrow(() => sample().cancel('F-1'));
});

test('JSON-এর মধ্য দিয়ে: Class, অবস্থা, আয় অক্ষত; পুনরুদ্ধারে খবর যায় না, পরে যায়', () => {
  const original = sample();
  original.cancel('F-2');
  const messages = [];
  const restored = BookingManager.fromJSON(JSON.parse(JSON.stringify(original)), { notify: (t) => messages.push(t) });
  assert.equal(restored.count, 3);
  assert.equal(restored.confirmedRevenue, 16500);
  assert.ok(restored.find('H-1') instanceof HotelBooking);
  assert.equal(restored.find('F-2').status, 'cancelled');
  assert.equal(messages.length, 0);
  restored.cancel('H-1');
  assert.deepEqual(messages, ['বাতিল: H-1']);
});
