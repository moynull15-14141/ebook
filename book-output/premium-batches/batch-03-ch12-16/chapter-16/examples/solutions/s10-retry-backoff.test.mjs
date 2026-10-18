import { test, mock } from 'node:test';
import assert from 'node:assert/strict';

async function withRetry(task, { retries = 3, sleep }) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      if (attempt >= retries) {
        throw error;
      }
      await sleep(100 * 2 ** attempt);
    }
  }
}

test('তিনবার ব্যর্থতার পর সফল: বিরতি 100, 200, 400', async () => {
  const sleep = mock.fn(async () => {});
  let calls = 0;
  const task = async () => {
    calls += 1;
    if (calls <= 3) {
      throw new Error('busy');
    }
    return 'ok';
  };

  assert.equal(await withRetry(task, { sleep }), 'ok');
  const waits = sleep.mock.calls.map((call) => call.arguments[0]);
  assert.deepEqual(waits, [100, 200, 400]);
});

test('সব চেষ্টা ব্যর্থ: শেষ ত্রুটি ছোড়ে, বিরতি তিনবার', async () => {
  const sleep = mock.fn(async () => {});
  const alwaysDown = async () => {
    throw new Error('down');
  };
  await assert.rejects(withRetry(alwaysDown, { sleep }), /down/);
  assert.equal(sleep.mock.callCount(), 3);
});
