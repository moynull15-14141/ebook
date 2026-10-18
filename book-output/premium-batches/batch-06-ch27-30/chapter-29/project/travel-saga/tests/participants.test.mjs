// প্রতিটি Service আলাদাভাবে: Idempotency-ই পুরো Saga-র নিরাপত্তার ভিত্তি।
import test from 'node:test';
import assert from 'node:assert/strict';
import { startInventory } from '../src/services/inventory.mjs';
import { startPayment } from '../src/services/payment.mjs';

const send = (url, method, body) => fetch(url, { method,
  headers: { 'Content-Type': 'application/json' },
  body: body && JSON.stringify(body) })
  .then(async (res) => [res.status, await res.json()]);

test('Inventory: একই reservationId দুবার, আসন একবারই কমে', async (t) => {
  const inv = await startInventory({ seats: 3 });
  t.after(inv.close);
  const reserve = (id, seats) => send(`${inv.url}/reservations`, 'POST',
    { reservationId: id, seats });
  assert.equal((await reserve('a', 2))[0], 201);
  assert.equal((await reserve('a', 2))[0], 200);
  assert.equal(inv.state.available, 1);
  assert.deepEqual(await reserve('b', 2), [409, { error: 'SOLD_OUT' }]);
  const release = () => send(`${inv.url}/reservations/a`, 'DELETE');
  assert.deepEqual(await release(), [200, { released: true }]);
  assert.deepEqual(await release(), [200, { released: false }]);
  assert.equal(inv.state.available, 3);
});

test('Payment: Idempotent Charge, ভিন্ন Amount-এ 409, প্রত্যাখ্যান ও Refund',
  async (t) => {
    const pay = await startPayment();
    t.after(pay.close);
    const charge = (id, amount, customer = 'Rahim') => send(
      `${pay.url}/charges`, 'POST', { chargeId: id, amount, customer });
    assert.equal((await charge('c1', 500))[0], 201);
    assert.equal((await charge('c1', 500))[0], 200);
    assert.deepEqual(await charge('c1', 999),
      [409, { error: 'IDEMPOTENCY_CONFLICT' }]);
    pay.faults.decline.add('Karim');
    assert.equal((await charge('c2', 700, 'Karim'))[0], 402);
    const refund = (id) => send(`${pay.url}/charges/${id}/refund`, 'POST');
    assert.deepEqual(await refund('c1'), [200, { refunded: true }]);
    assert.deepEqual(await refund('c1'), [200, { refunded: false }]);
    assert.deepEqual(await refund('nope'), [200, { refunded: false }]);
    const [, ledger] = await send(`${pay.url}/ledger`, 'GET');
    assert.deepEqual(ledger, { captured: 0, refunded: 500, attempts: 2 });
  });
