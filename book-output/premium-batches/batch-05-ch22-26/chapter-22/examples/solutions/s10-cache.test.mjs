import test from 'node:test';
import assert from 'node:assert/strict';
import { startDesk } from '../../project/currency-desk/src/start.mjs';

test('একই জোড়ার দুটি Quote, Provider-এ একটি অনুরোধ', async (t) => {
  const desk = await startDesk();
  t.after(() => desk.close());
  const body = JSON.stringify({ from: 'USD', to: 'BDT', amount: '10' });
  for (let i = 0; i < 2; i += 1) {
    const url = `${desk.url}/api/quotes`;
    const response = await fetch(url, { method: 'POST', body });
    assert.equal(response.status, 201);
    await response.json();
  }
  assert.equal(desk.provider.controls.requests, 1);
});
