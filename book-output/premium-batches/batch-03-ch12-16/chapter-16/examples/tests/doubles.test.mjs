import { test, mock } from 'node:test';
import assert from 'node:assert/strict';

async function placeOrder(order, { payment, mailer }) {
  const receipt = await payment.charge(order.amount);
  await mailer.send(order.email, `রসিদ ${receipt}`);
  return receipt;
}

test('Stub ও Mock: Payment-এর নির্দিষ্ট উত্তর, Email ঠিক একবার', async () => {
  const payment = { charge: async () => 'PAY-1' };
  const mailer = { send: mock.fn(async () => {}) };

  const order = { amount: 700, email: 'a@b.co' };
  const receipt = await placeOrder(order, { payment, mailer });

  assert.equal(receipt, 'PAY-1');
  assert.equal(mailer.send.mock.callCount(), 1);
  assert.deepEqual(mailer.send.mock.calls[0].arguments, ['a@b.co', 'রসিদ PAY-1']);
});

test('Stub-এর ব্যর্থতা: Payment ব্যর্থ হলে Email যায় না', async () => {
  const payment = { charge: async () => { throw new Error('declined'); } };
  const mailer = { send: mock.fn() };

  const order = { amount: 700, email: 'a@b.co' };
  await assert.rejects(placeOrder(order, { payment, mailer }), /declined/);
  assert.equal(mailer.send.mock.callCount(), 0);
});

test('Spy: একটি বিদ্যমান Object-এর Method-এর ডাক গোনা', () => {
  const calculator = { add: (a, b) => a + b };
  const spy = mock.method(calculator, 'add');

  assert.equal(calculator.add(2, 3), 5);
  assert.equal(spy.mock.callCount(), 1);
  spy.mock.restore();
});
