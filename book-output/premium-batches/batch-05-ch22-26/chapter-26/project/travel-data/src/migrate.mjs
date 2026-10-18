import { readdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withTransaction } from './db.mjs';

const DEFAULT_DIR = fileURLToPath(new URL('../migrations/', import.meta.url));

// সংস্করণভিত্তিক Migration: প্রতিটি File একবারই, ক্রমে, নিজস্ব Transaction-এ।
// চলে যাওয়া File পরে বদলালে (Checksum আলাদা) থেমে যায়।
export function migrate(db, dir = DEFAULT_DIR) {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY, checksum TEXT NOT NULL,
    applied_at TEXT NOT NULL)`);
  const rows = db.prepare(
    'SELECT version, checksum FROM schema_migrations').all();
  const applied = new Map(rows.map((row) => [row.version, row.checksum]));
  const files = readdirSync(dir)
    .filter((f) => /^\d{3}-.+\.sql$/.test(f)).sort();
  const ran = [];
  for (const file of files) {
    const sql = readFileSync(join(dir, file), 'utf8');
    const checksum = createHash('sha256').update(sql).digest('hex');
    const version = file.slice(0, 3);
    if (applied.has(version)) {
      if (applied.get(version) !== checksum) {
        throw new Error(`Migration ${file} চলার পরে বদলানো হয়েছে`);
      }
      continue;
    }
    withTransaction(db, () => {
      db.exec(sql);
      db.prepare('INSERT INTO schema_migrations VALUES (?, ?, ?)')
        .run(version, checksum, new Date().toISOString());
    });
    ran.push(file);
  }
  return ran;
}
