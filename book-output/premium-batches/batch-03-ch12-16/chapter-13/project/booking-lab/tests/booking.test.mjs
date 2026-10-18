// Booking Class-গুলোর Test।  চালানোর Command (Project Folder থেকে):  node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { Booking, BookingError, FlightBooking, HotelBooking, restoreBooking } from '../src/booking.mjs';

const base = { id: ' F-1 ', customer: ' Sara ', price: 5000 };
const isBookingError = (message) => (error) => error instanceof BookingError && error.name === 'BookingError' && (!message || error.message === message);

test('Booking: ID ও নাম trim হয়; প্রাথমিক অবস্থা confirmed', () => {
  const booking = new Booking(base);
  assert.equal(booking.id, 'F-1');
  assert.equal(booking.customer, 'Sara');
  assert.equal(booking.status, 'confirmed');
  assert.equal(booking.isActive, true);
});

test('Booking: খালি ID, খালি নাম, অবৈধ দাম বাতিল', () => {
  assert.throws(() => new Booking({ ...base, id: '  ' }), isBookingError('Booking ID খালি হতে পারবে না।'));
  assert.throws(() => new Booking({ ...base, customer: undefined }), isBookingError('গ্রাহকের নাম খালি হতে পারবে না।'));
  for (const price of [0, -5, NaN, Infinity, '5000']) {
    assert.throws(() => new Booking({ ...base, price }), isBookingError('দাম একটি ধনাত্মক সংখ্যা হতে হবে।'), String(price));
  }
});

test('FlightBooking: মোট = ভাড়া + Baggage; Baggage না দিলে 0; ঋণাত্মক বাতিল', () => {
  assert.equal(new FlightBooking({ ...base, baggageFee: 800 }).total, 5800);
  assert.equal(new FlightBooking(base).total, 5000);
  assert.throws(() => new FlightBooking({ ...base, baggageFee: -1 }), isBookingError('Baggage Fee ঋণাত্মক হতে পারবে না।'));
});

test('FlightBooking: Parent-এর যাচাইও প্রযোজ্য', () => {
  assert.throws(() => new FlightBooking({ ...base, price: 0 }), isBookingError());
});

test('HotelBooking: মোট = রাতপ্রতি × রাত; রাত পূর্ণসংখ্যা, কমপক্ষে 1', () => {
  assert.equal(new HotelBooking({ ...base, price: 3500, nights: 3 }).total, 10500);
  for (const nights of [0, 1.5, undefined, '2']) {
    assert.throws(() => new HotelBooking({ ...base, nights }), isBookingError('রাতের সংখ্যা 1 বা বেশি পূর্ণসংখ্যা হতে হবে।'), String(nights));
  }
});

test('Prototype Chain: Method-গুলো Prototype-এ, Instance-এ নয়; Child-এর শিকলে Parent', () => {
  const flight = new FlightBooking(base);
  assert.equal(Object.hasOwn(flight, 'cancel'), false);
  assert.equal(Object.getPrototypeOf(flight), FlightBooking.prototype);
  assert.equal(Object.getPrototypeOf(FlightBooking.prototype), Booking.prototype);
  assert.ok(flight instanceof Booking && !(flight instanceof HotelBooking));
  assert.deepEqual(Object.keys(flight), ['id', 'customer', 'price', 'baggageFee']);
});

test('cancel: একবারই সম্ভব; দ্বিতীয়বার BookingError', () => {
  const booking = new HotelBooking({ ...base, nights: 2 });
  booking.cancel();
  assert.equal(booking.status, 'cancelled');
  assert.equal(booking.isActive, false);
  assert.throws(() => booking.cancel(), isBookingError('F-1 আগেই বাতিল হয়েছে।'));
});

test('Encapsulation: status বাইরে থেকে বদলানো যায় না (Module-এ TypeError)', () => {
  const booking = new Booking(base);
  booking.cancel();
  assert.throws(() => { booking.status = 'confirmed'; }, TypeError);
  assert.equal(booking.status, 'cancelled');
  assert.equal('#status' in booking, false);
});

test('describe: Polymorphism; প্রতিটি Class-এর নিজের type ও total', () => {
  assert.equal(new FlightBooking({ ...base, baggageFee: 800 }).describe(), 'F-1 (flight) Sara: 5800 টাকা, confirmed');
  assert.equal(new HotelBooking({ ...base, price: 3500, nights: 3 }).describe(), 'F-1 (hotel) Sara: 10500 টাকা, confirmed');
});

test('toJSON: Private অবস্থা এবং Child-এর Field সংরক্ষিত', () => {
  const hotel = new HotelBooking({ ...base, nights: 2 });
  hotel.cancel();
  assert.deepEqual(JSON.parse(JSON.stringify(hotel)), { type: 'hotel', id: 'F-1', customer: 'Sara', price: 5000, status: 'cancelled', nights: 2 });
});

test('restoreBooking: সঠিক Class, অবস্থা ও মোট ফিরে আসে', () => {
  const flight = new FlightBooking({ ...base, baggageFee: 300 });
  flight.cancel();
  const copy = restoreBooking(JSON.parse(JSON.stringify(flight)));
  assert.ok(copy instanceof FlightBooking);
  assert.equal(copy.total, 5300);
  assert.equal(copy.status, 'cancelled');
});

test('restoreBooking: অচেনা বা উত্তরাধিকারসূত্রে পাওয়া ধরন বাতিল', () => {
  for (const data of [{ type: 'bus' }, { type: 'toString' }, { type: '__proto__' }, null]) {
    assert.throws(() => restoreBooking(data), isBookingError(), JSON.stringify(data));
  }
});
