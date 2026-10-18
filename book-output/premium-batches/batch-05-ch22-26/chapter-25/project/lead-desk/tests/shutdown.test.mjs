// Graceful Shutdown: চলমান অনুরোধ শেষ হয়, নতুন সংযোগ নেওয়া হয় না, ready বন্ধ।
import test from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, TOKENS } from './helpers.mjs';
import { loadConfig } from '../src/config.mjs';

test('shutdown(): চলমান অনুরোধ সম্পূর্ণ, তারপর বন্ধ', async (t) => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  // নকল Service: list ধীর, যতক্ষণ না Test "release" করে।
  const service = { list: async () => {
    await gate;
    return { items: [], hasMore: false };
  } };
  const { server } = await startTestServer(t, { service });
  const auth = { authorization: `Bearer ${TOKENS.rafi}` };

  const inFlight = fetch(`${server.url}/v1/leads`, { headers: auth });
  await new Promise((resolve) => setTimeout(resolve, 100));
  const closed = server.shutdown();
  assert.equal(server.state.ready, false);

  const fresh = { headers: { connection: 'close' } };
  await assert.rejects(fetch(`${server.url}/health`, fresh));
  release();
  const response = await inFlight;
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(),
    { items: [], hasMore: false, next: null });
  await closed;
});

test('Config: ভুল Token-এর তালিকায় শুরুতেই স্পষ্ট Error', () => {
  assert.throws(() => loadConfig({ API_TOKENS: 'a:admin:x'.padEnd(40, 'x') }),
    /অবৈধ Entry/);
  assert.throws(() => loadConfig({ API_TOKENS: 'a:agent:short' }), /অবৈধ Entry/);
  assert.throws(() => loadConfig({ PORT: 'abc' }), /PORT অবৈধ/);
  const config = loadConfig({ API_TOKENS: `a:agent:${'t'.repeat(24)}` });
  assert.equal(config.users.size, 1);
  assert.equal(config.host, '127.0.0.1');
  assert.ok(![...config.users.keys()][0].includes('tttt'));
});
