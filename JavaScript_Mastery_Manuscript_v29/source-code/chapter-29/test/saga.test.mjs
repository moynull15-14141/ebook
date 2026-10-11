import test from 'node:test';
import assert from 'node:assert/strict';
import { createInventory, createPaymentGateway, createBookingRepository, createTravelSaga, SagaError } from '../saga.mjs';
const setup = ({ seats = 2, shouldFail } = {}) => {
  const inventory = createInventory({ seats });
  const payments = createPaymentGateway({ shouldFail });
  const bookings = createBookingRepository();
  return { inventory, payments, bookings, saga: createTravelSaga({ inventory, payments, bookings }) };
};
const input = { id: 'trip-101', customer: 'Rahim', amount: 12500000 };
test('successful saga confirms booking and reserves seat', async () => {
  const x=setup(); const b=await x.saga.book(input);
  assert.equal(b.status,'CONFIRMED'); assert.equal(x.inventory.snapshot().available,1);
  assert.equal(x.payments.snapshot().length,1);
});
test('payment failure compensates inventory reservation', async () => {
  const x=setup({ shouldFail: () => true });
  await assert.rejects(x.saga.book(input), e => e.code === 'PAYMENT_FAILED');
  assert.equal(x.inventory.snapshot().available,2); assert.equal(x.bookings.all().length,0);
});
test('sold out does not charge customer', async () => {
  const x=setup({ seats:0 });
  await assert.rejects(x.saga.book(input), e => e.code === 'SOLD_OUT');
  assert.equal(x.payments.snapshot().length,0);
});
test('repeated same booking is idempotent', async () => {
  const x=setup(); const a=await x.saga.book(input); const b=await x.saga.book(input);
  assert.deepEqual(a,b); assert.equal(x.inventory.snapshot().available,1);
  assert.equal(x.payments.snapshot().length,1);
});
test('same id with different payload rejected', async () => {
  const x=setup(); await x.saga.book(input);
  await assert.rejects(x.saga.book({...input,amount:900}), e => e.code === 'IDEMPOTENCY_CONFLICT');
});
test('concurrent requests with same id single-flight', async () => {
  const x=setup(); const [a,b]=await Promise.all([x.saga.book(input),x.saga.book(input)]);
  assert.deepEqual(a,b); assert.equal(x.inventory.snapshot().available,1);
});
test('different bookings respect limited inventory', async () => {
  const x=setup({seats:1}); await x.saga.book(input);
  await assert.rejects(x.saga.book({...input,id:'trip-102'}), e => e.code === 'SOLD_OUT');
});
test('invalid inputs do not change state', async () => {
  const x=setup();
  await assert.rejects(x.saga.book({...input,amount:-1}), e => e.code === 'INVALID_AMOUNT');
  await assert.rejects(x.saga.book({...input,id:'!'}), e => e.code === 'INVALID_ID');
  assert.equal(x.inventory.snapshot().available,2);
});
test('repository returns copies', () => {
  const x=setup(); x.bookings.save({id:'b1',status:'CONFIRMED'});
  const b=x.bookings.get('b1');b.status='CANCELLED';
  assert.equal(x.bookings.get('b1').status,'CONFIRMED');
});
test('inventory release is idempotent', () => {
  const x=setup();x.inventory.reserve('a');
  assert.equal(x.inventory.release('a'),true);assert.equal(x.inventory.release('a'),false);
  assert.equal(x.inventory.snapshot().available,2);
});
