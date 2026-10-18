// Integration Test: আসল HTTP, আসল দুই Server (শুধু 127.0.0.1, এলোমেলো Port)।
import test from 'node:test';
import assert from 'node:assert/strict';
import { startDesk } from '../src/start.mjs';

async function post(desk, body) {
  const response = await fetch(`${desk.url}/api/quotes`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  return { status: response.status, data: await response.json() };
}

test('Quote API', async (t) => {
  const desk = await startDesk();
  t.after(() => desk.close());

  await t.test('201: সম্পূর্ণ Quote, সব টাকা পয়সায়', async () => {
    const { status, data } = await post(desk,
      { from: 'USD', to: 'BDT', amount: '1,000' });
    assert.equal(status, 201);
    assert.equal(data.id, 'Q-0001');
    assert.equal(data.fee, 5_000);
    assert.equal(data.payable, 105_000);
    assert.equal(data.receives, 12_145_000);
    assert.ok(data.expiresAt > Date.now());
  });

  await t.test('400: অবৈধ পরিমাণ, সীমার বাইরে, অবৈধ মুদ্রা, ভাঙা JSON', async () => {
    const bad = [
      { from: 'USD', to: 'BDT', amount: 'বারো' },
      { from: 'USD', to: 'BDT', amount: '600,000' },
      { from: 'usd', to: 'BDT', amount: '5' },
      '{"from":',
    ];
    for (const body of bad) {
      assert.equal((await post(desk, body)).status, 400, JSON.stringify(body));
    }
  });

  await t.test('404: অজানা মুদ্রা-জোড়া', async () => {
    const { status, data } = await post(desk,
      { from: 'USD', to: 'JPY', amount: '5' });
    assert.equal(status, 404);
    assert.equal(data.code, 'UNKNOWN_PAIR');
  });

  await t.test('Provider সাময়িক ব্যর্থ: Retry-তে সফল', async () => {
    desk.provider.controls.failNext = 2;
    const { status } = await post(desk,
      { from: 'SAR', to: 'BDT', amount: '5' });
    assert.equal(status, 201);
  });

  await t.test('502: Provider বারবার ব্যর্থ', async () => {
    desk.provider.controls.failNext = 3;
    const { status, data } = await post(desk,
      { from: 'EUR', to: 'BDT', amount: '5' });
    assert.equal(status, 502);
    assert.equal(data.code, 'UPSTREAM');
  });

  await t.test('অজানা পথ 404', async () => {
    const response = await fetch(`${desk.url}/api/nothing`);
    assert.equal(response.status, 404);
    await response.body?.cancel();
  });
});
