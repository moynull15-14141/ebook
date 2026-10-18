// Orchestrator ঠিক ভুল মুহূর্তে মারা গেলে: টেকসই Log থেকে Restart-এর পরে শেষ করা।
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startSystem } from '../src/system.mjs';
import { openSagaStore } from '../src/saga-store.mjs';
import { createOrchestrator } from '../src/orchestrator.mjs';

class Crash extends Error {}

for (const crashPoint of ['reserved', 'charged']) {
  test(`'${crashPoint}'-এর পরে Crash, Restart-এ resume: একবারই কাটা`,
    async (t) => {
      const dir = mkdtempSync(join(tmpdir(), 'saga-'));
      const dbPath = join(dir, 'saga.db');
      const sys = await startSystem({ seats: 5, dbPath,
        hooks: { after: (step) => {
          if (step === crashPoint) throw new Crash(step);
        } } });
      t.after(async () => {
        await sys.close();
        rmSync(dir, { recursive: true, force: true });
      });
      const request = { bookingId: 'trip-9', customer: 'Rahim', seats: 2,
        amount: 800_000 };
      await assert.rejects(sys.orchestrator.book(request), Crash);
      const before = sys.store.get('trip-9').status;
      assert.equal(before, crashPoint === 'reserved' ? 'RESERVING'
        : 'CHARGING');

      // "নতুন Process": একই Database File, নতুন Orchestrator, কোনো Hook নেই।
      const store = openSagaStore(dbPath);
      const restarted = createOrchestrator({ store,
        inventoryUrl: sys.inventory.url, paymentUrl: sys.payment.url });
      const [result] = await restarted.resume();
      assert.equal(result.status, 'CONFIRMED');
      assert.deepEqual(await sys.ledger(),
        { captured: 800_000, refunded: 0, attempts: 1 });
      assert.deepEqual(await sys.stock(), { available: 3, reserved: 2 });
      assert.deepEqual(await restarted.resume(), []); // আর কিছু বাকি নেই
      store.close();
    });
}
