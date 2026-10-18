import test, { mock } from 'node:test';
import assert from 'node:assert/strict';

async function retry(fn, { retries = 2, sleep = async () => {} } = {}) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await fn(attempt);
    } catch (error) {
      if (attempt >= retries) {
        throw error;
      }
      await sleep(100 * 2 ** attempt);
    }
  }
}

test('প্রথমবারেই সফল', async () => {
  assert.equal(await retry(async () => 'ok'), 'ok');
});

test('দুবার ব্যর্থ, তৃতীয়বার সফল; অপেক্ষা 100, 200', async () => {
  const sleep = mock.fn(async () => {});
  const fn = async (attempt) => {
    if (attempt < 2) {
      throw new Error('fail');
    }
    return 'ok';
  };
  assert.equal(await retry(fn, { sleep }), 'ok');
  assert.deepEqual(sleep.mock.calls.map((c) => c.arguments[0]), [100, 200]);
});

test('সব ব্যর্থ: শেষ Error', async () => {
  const fn = mock.fn(async (attempt) => {
    throw new Error(`fail ${attempt}`);
  });
  await assert.rejects(retry(fn), /fail 2/);
  assert.equal(fn.mock.callCount(), 3);
});
