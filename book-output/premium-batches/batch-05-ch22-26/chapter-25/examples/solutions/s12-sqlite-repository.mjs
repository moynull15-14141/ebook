import { DatabaseSync } from 'node:sqlite';

export function createSqliteLeadRepository(file = ':memory:') {
  const db = new DatabaseSync(file);
  db.exec(`CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY, version INTEGER NOT NULL, data TEXT NOT NULL)`);
  const sql = {
    count: db.prepare('SELECT COUNT(*) AS n FROM leads'),
    insert: db.prepare('INSERT INTO leads (id, version, data) VALUES (?, ?, ?)'),
    get: db.prepare('SELECT data FROM leads WHERE id = ?'),
    replace: db.prepare(
      'UPDATE leads SET version = ?, data = ? WHERE id = ? AND version = ?'),
    remove: db.prepare('DELETE FROM leads WHERE id = ?'),
    after: db.prepare('SELECT data FROM leads WHERE id > ? ORDER BY id'),
  };
  return {
    async nextId() {
      return `L-${String(sql.count.get().n + 1).padStart(5, '0')}`;
    },
    async insert(lead) {
      sql.insert.run(lead.id, lead.version, JSON.stringify(lead));
    },
    async get(id) {
      const row = sql.get.get(id);
      return row ? JSON.parse(row.data) : null;
    },
    async replace(lead, expected) {
      const data = JSON.stringify(lead);
      const { changes } = sql.replace.run(lead.version, data, lead.id, expected);
      return changes === 1;
    },
    async remove(id) {
      return sql.remove.run(id).changes === 1;
    },
    async list({ where = () => true, after = '', limit = 20 }) {
      const rows = sql.after.all(after)
        .map((r) => JSON.parse(r.data)).filter(where);
      return { items: rows.slice(0, limit), hasMore: rows.length > limit };
    },
  };
}

const repo = createSqliteLeadRepository();
const lead = { id: await repo.nextId(), name: 'Mina', status: 'new', version: 1 };
await repo.insert(lead);
const first = await repo.replace({ ...lead, status: 'contacted', version: 2 }, 1);
const stale = await repo.replace({ ...lead, status: 'lost', version: 2 }, 1);
console.log(first, stale, (await repo.get('L-00001')).status);
