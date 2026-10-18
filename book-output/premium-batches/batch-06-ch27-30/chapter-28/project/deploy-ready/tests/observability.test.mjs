import test from 'node:test';
import assert from 'node:assert/strict';
import { createLogger } from '../src/logger.mjs';
import { createMetrics } from '../src/metrics.mjs';

test('Logger: JSON Line, Level Filter ও গোপন মান লুকানো', () => {
  const lines = [];
  const logger = createLogger({ level: 'info', base: { service: 'x' },
    write: (line) => lines.push(line),
    now: () => new Date('2026-10-18T00:00:00Z') });
  logger.debug('hidden');
  logger.child({ requestId: 'r-1' }).info('login', {
    user: 'rafi', password: 'p', headers: { Authorization: 'Bearer t' } });
  assert.equal(lines.length, 1);
  assert.deepEqual(JSON.parse(lines[0]), { time: '2026-10-18T00:00:00.000Z',
    level: 'info', event: 'login', service: 'x', requestId: 'r-1',
    user: 'rafi', password: '[REDACTED]',
    headers: { Authorization: '[REDACTED]' } });
});

test('Metrics: Prometheus Format-এ Counter ও Histogram', () => {
  const metrics = createMetrics();
  const req = { method: 'GET', route: '/api/jobs', status: 200 };
  metrics.observeRequest({ ...req, seconds: 0.004 });
  metrics.observeRequest({ ...req, seconds: 0.2 });
  metrics.observeRequest({ ...req, status: 500, seconds: 2 });
  const text = metrics.render();
  assert.match(text, /^# TYPE http_requests_total counter$/m);
  assert.match(text,
    /^http_requests_total\{method="GET",route="\/api\/jobs",status="200"\} 2$/m);
  const bucket = (le) => new RegExp(`route="/api/jobs",le="${le}"\\} (\\d+)`);
  assert.equal(text.match(bucket('0.005'))[1], '1');
  assert.equal(text.match(bucket('0.5'))[1], '2');
  assert.equal(text.match(bucket('\\+Inf'))[1], '3');
  assert.match(text, /_count\{method="GET",route="\/api\/jobs"\} 3$/m);
});
