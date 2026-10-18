import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadConfig, describeConfig } from '../src/config.mjs';

test('Default মান ও Object freeze', () => {
  const config = loadConfig({});
  assert.equal(config.port, 3000);
  assert.equal(config.nodeEnv, 'development');
  assert.equal(config.shutdownTimeoutMs, 10_000);
  assert.ok(Object.isFrozen(config));
});

test('সব ভুল একসঙ্গে জানায়', () => {
  assert.throws(() => loadConfig({ PORT: 'abc', LOG_LEVEL: 'loud',
    NODE_ENV: 'prod' }), (error) => {
    assert.match(error.message, /PORT হতে হবে 0 থেকে 65535/);
    assert.match(error.message, /LOG_LEVEL/);
    assert.match(error.message, /NODE_ENV/);
    return true;
  });
  assert.throws(() => loadConfig({ PORT: '70000' }), /PORT/);
  assert.throws(() => loadConfig({ PORT: '-1' }), /PORT/);
});

test('Production-এ দুর্বল বা অনুপস্থিত OPS_TOKEN গ্রহণযোগ্য নয়', () => {
  assert.throws(() => loadConfig({ NODE_ENV: 'production' }), /OPS_TOKEN/);
  assert.throws(() => loadConfig({ NODE_ENV: 'production',
    OPS_TOKEN: 'short' }), /OPS_TOKEN/);
  const config = loadConfig({ NODE_ENV: 'production',
    OPS_TOKEN: 'x'.repeat(24) });
  assert.equal(describeConfig(config).opsToken, '[REDACTED]');
});

test('ভুল Config-এ Process চালুই হয় না (exit 1)', () => {
  const main = fileURLToPath(new URL('../main.mjs', import.meta.url));
  const result = spawnSync(process.execPath, [main], { encoding: 'utf8',
    env: { ...process.env, PORT: 'abc', NODE_ENV: 'production' },
    timeout: 10_000 });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Configuration ভুল/);
  assert.match(result.stderr, /OPS_TOKEN/);
  assert.equal(result.stdout, '');
});
