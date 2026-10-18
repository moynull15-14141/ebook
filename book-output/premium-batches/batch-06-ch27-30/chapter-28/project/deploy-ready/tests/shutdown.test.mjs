// Graceful Shutdown: চলমান অনুরোধ শেষ হয়, নতুনকে Readiness 503 জানায়,
// আর আটকে থাকা সংযোগ Timeout-এর পর জোর করে বন্ধ।
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { start, call, TOKEN } from './helpers.mjs';

// Header ও Body-র অর্ধেক পাঠিয়ে থেমে থাকা একটি ধীর Upload।
function slowUpload(port) {
  const body = JSON.stringify({ title: 'ধীর Upload' });
  const req = http.request({ port, path: '/api/jobs', method: 'POST',
    headers: { 'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      Authorization: `Bearer ${TOKEN}` } });
  const response = new Promise((resolve, reject) => {
    req.on('response', (res) => {
      res.resume();
      res.on('end', () => resolve(res.statusCode));
    });
    req.on('error', reject);
  });
  req.write(body.slice(0, 5));
  return { finish: () => req.end(body.slice(5)), response };
}

test('Drain: Readiness 503, চলমান অনুরোধ সফলভাবে শেষ', async () => {
  const app = await start({ env: { DRAIN_DELAY_MS: '200' } });
  const upload = slowUpload(app.port);
  await new Promise((resolve) => setTimeout(resolve, 50));
  const done = app.shutdown('SIGTERM');
  const ready = await call(app.base, '/health/ready');
  assert.deepEqual([ready.status, ready.body], [503, { status: 'draining' }]);
  upload.finish();
  assert.equal(await upload.response, 201);
  assert.deepEqual(await done, { forced: false });
  assert.equal(app.shutdown('again'), done); // দ্বিতীয় Signal-এ একই কাজ
  const events = app.lines.map((l) => l.event);
  assert.ok(events.indexOf('shutdown.started')
    < events.indexOf('shutdown.complete'));
});

test('Timeout: শেষ না হওয়া অনুরোধ জোর করে বন্ধ', async () => {
  const app = await start({ env: { SHUTDOWN_TIMEOUT_MS: '150' } });
  const upload = slowUpload(app.port);
  upload.response.catch(() => {}); // সংযোগ কাটা প্রত্যাশিত
  await new Promise((resolve) => setTimeout(resolve, 50));
  const started = Date.now();
  assert.deepEqual(await app.shutdown('SIGTERM'), { forced: true });
  assert.ok(Date.now() - started >= 140);
  await assert.rejects(upload.response);
});

test('healthcheck.mjs: চলমান Server-এ 0, বন্ধ Port-এ 1', async () => {
  const script = fileURLToPath(new URL('../healthcheck.mjs', import.meta.url));
  // spawnSync নয়: তা এই Process-এর Server-কেই আটকে দিত।
  const run = (port) => new Promise((resolve) => spawn(process.execPath,
    [script], { env: { ...process.env, PORT: String(port) } })
    .on('exit', resolve));
  const app = await start();
  assert.equal(await run(app.port), 0);
  await app.shutdown('test');
  assert.equal(await run(app.port), 1);
});
