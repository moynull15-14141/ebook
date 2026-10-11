import test from 'node:test';
import assert from 'node:assert/strict';
import { Booking, BookingError, FlightBooking, HotelBooking, BookingManager } from './booking.mjs';

test('base booking validation', () => {
  assert.throws(() => new Booking({ id:'', customer:'A', price:10 }), BookingError);
  assert.throws(() => new Booking({ id:'x', customer:'', price:10 }), BookingError);
  assert.throws(() => new Booking({ id:'x', customer:'A', price:0 }), BookingError);
  assert.throws(() => new Booking({ id:'x', customer:'A', price:NaN }), BookingError);
});
test('base getters and JSON', () => {
  const b = new Booking({ id:' B1 ', customer:' Ada ', price:100 });
  assert.equal(b.id,'B1'); assert.equal(b.customer,'Ada'); assert.equal(b.total,100);
  assert.equal(b.toJSON().status,'confirmed');
});
test('flight adds baggage fee', () => {
  const b = new FlightBooking({ id:'F1', customer:'Ada', price:100, baggageFee:25 });
  assert.equal(b.total,125); assert.equal(b.type,'Flight');
  assert.equal(b.toJSON().baggageFee,25);
  assert.throws(() => new FlightBooking({ id:'F2',customer:'Ada',price:100,baggageFee:-1 }),BookingError);
});
test('hotel calculates nights', () => {
  const b = new HotelBooking({ id:'H1', customer:'Ada', price:200, nights:3 });
  assert.equal(b.total,600); assert.equal(b.type,'Hotel');
  assert.throws(() => new HotelBooking({ id:'H2',customer:'Ada',price:100,nights:1.5 }),BookingError);
});
test('manager polymorphism, cancellation, and revenue', () => {
  const m = new BookingManager();
  m.add(new FlightBooking({ id:'F1', customer:'Ada', price:100, baggageFee:25 }));
  m.add(new HotelBooking({ id:'H1', customer:'Bob', price:200, nights:3 }));
  assert.equal(m.confirmedRevenue,725);
  assert.equal(m.list().length,2);
  assert.throws(() => m.add(new Booking({ id:'F1',customer:'C',price:10 })),BookingError);
  m.cancel('F1'); assert.equal(m.confirmedRevenue,600);
  assert.equal(m.list({status:'cancelled'}).length,1);
  assert.throws(() => m.cancel('F1'),BookingError);
  assert.throws(() => m.cancel('missing'),BookingError);
});
test('rejects non-booking', () => {
  const m = new BookingManager(); assert.throws(() => m.add({id:'x'}),TypeError);
});
