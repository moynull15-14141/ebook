import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabase, withTransaction }
  from '../../project/travel-data/src/db.mjs';

function withRetry(fn, { attempts = 3, onRetry = () => {} } = {}) {
  for (let i = 1; ; i += 1) {
    try {
      return fn();
    } catch (error) {
      if (!/database is locked/.test(error.message) || i >= attempts) {
        throw error;
      }
      onRetry(i);
    }
  }
}

const dir = mkdtempSync(join(tmpdir(), 'retry-'));
const a = openDatabase(join(dir, 'x.db'), { busyTimeoutMs: 0 });
const b = openDatabase(join(dir, 'x.db'), { busyTimeoutMs: 0 });
a.exec('CREATE TABLE t (n INTEGER)');

a.exec('BEGIN IMMEDIATE');
const retries = [];
const result = withRetry(() => withTransaction(b, () => {
  b.exec('INSERT INTO t VALUES (1)');
  return 'লেখা হয়েছে';
}), { onRetry: (i) => {
  retries.push(i);
  if (i === 2) {
    a.exec('COMMIT');
  }
} });
console.log(result, retries);
a.close();
b.close();
rmSync(dir, { recursive: true, force: true });
