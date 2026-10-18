import test from 'node:test';
import assert from 'node:assert/strict';
import { start, call, json, TOKEN }
  from '../../project/deploy-ready/tests/helpers.mjs';

test('ফাঁকা বা শুধু Space-এর title: 422 এবং কারণ', async (t) => {
  const app = await start();
  t.after(() => app.shutdown('test'));
  for (const title of ['', '   ', 'ab']) {
    const res = await call(app.base, '/api/jobs', { method: 'POST',
      token: TOKEN, ...json({ title }) });
    assert.equal(res.status, 422);
    assert.deepEqual(res.body.error.details, ['title: ৩ থেকে ১২০ অক্ষর']);
  }
  const list = await call(app.base, '/api/jobs');
  assert.deepEqual(list.body.data, []);
});

test('title না দিলেও 422, Server ভাঙে না', async (t) => {
  const app = await start();
  t.after(() => app.shutdown('test'));
  const res = await call(app.base, '/api/jobs', { method: 'POST',
    token: TOKEN, ...json({ priority: 'low' }) });
  assert.equal(res.status, 422);
});
