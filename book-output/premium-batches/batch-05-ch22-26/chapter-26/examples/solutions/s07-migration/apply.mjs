import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase } from '../../../project/travel-data/src/db.mjs';
import { migrate } from '../../../project/travel-data/src/migrate.mjs';

const dir = mkdtempSync(join(tmpdir(), 'mig-'));
const project = new URL('../../../project/travel-data/migrations/',
  import.meta.url);
cpSync(fileURLToPath(project), dir, { recursive: true });
cpSync(fileURLToPath(new URL('./004-referral.sql', import.meta.url)),
  join(dir, '004-referral.sql'));

const db = openDatabase();
console.log(migrate(db, dir).join(', '));
const columns = db.prepare('PRAGMA table_info(customers)').all()
  .map((c) => c.name);
console.log(columns.includes('referred_by'));
rmSync(dir, { recursive: true, force: true });
