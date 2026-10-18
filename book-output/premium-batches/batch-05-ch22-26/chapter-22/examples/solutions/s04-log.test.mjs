import test, { mock } from 'node:test';
import assert from 'node:assert/strict';

function processOrder(order, log) {
  const total = order.items.reduce((sum, item) => sum + item.price, 0);
  log('done');
  return total;
}

test('processOrder শেষে একবার "done" Log করে', () => {
  const log = mock.fn();
  const order = { items: [{ price: 50 }, { price: 25 }] };
  assert.equal(processOrder(order, log), 75);
  assert.equal(log.mock.callCount(), 1);
  assert.deepEqual(log.mock.calls[0].arguments, ['done']);
});
