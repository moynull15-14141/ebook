// চারটি Thread, প্রত্যেকের নিজস্ব সংযোগ, একই SQLite File: ৪০টি চেষ্টা,
// আসন মাত্র ২০। ঠিক ২০টি Booking হতে হবে, একটিও বেশি নয়।
import test from 'node:test';
import assert from 'node:assert/strict';
import { Worker } from 'node:worker_threads';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabase } from '../src/db.mjs';
import { PASSWORD } from './helpers.mjs';

test('একসঙ্গে Booking-এ Overbooking হয় না', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'tmp-'));
  const dbPath = join(dir, 'race.db');
  openDatabase(dbPath).close(); // Schema ও Seed: CXB-3D-তে ২০ আসন
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  const workers = [0, 1, 2, 3].map((index) => new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./fixtures/booking-worker.mjs',
      import.meta.url), { workerData: { dbPath, index, attempts: 10,
      password: PASSWORD } });
    worker.once('message', resolve);
    worker.once('error', reject);
  }));
  const results = await Promise.all(workers);
  const booked = results.reduce((sum, r) => sum + r.booked, 0);
  const soldOut = results.reduce((sum, r) => sum + r.soldOut, 0);
  assert.deepEqual([booked, soldOut], [20, 20]);

  const db = openDatabase(dbPath);
  const { seats } = db.prepare(
    "SELECT seats FROM packages WHERE id = 'CXB-3D'").get();
  const { sold } = db.prepare(`SELECT SUM(travelers) AS sold FROM bookings
    WHERE package_id = 'CXB-3D' AND status = 'CONFIRMED'`).get();
  db.close();
  assert.deepEqual([seats, sold], [0, 20]);
});
