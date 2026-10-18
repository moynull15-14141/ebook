import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { createRateClient } from '../../project/currency-desk/src/rates.mjs';

test('বর্তমান আচরণ: 429 Retry হয় না', async () => {
  const fetchFn = mock.fn(async () => new Response('', { status: 429 }));
  const rates = createRateClient({ baseUrl: 'http://x', fetchFn });
  await assert.rejects(rates.getRate('USD', 'BDT'),
    { code: 'UPSTREAM', retryable: false });
  assert.equal(fetchFn.mock.callCount(), 1);
});
