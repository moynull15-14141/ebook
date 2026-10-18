import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { startServer } from './src/server.mjs';

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  console.error('PORT হতে হবে 0 থেকে 65535-এর পূর্ণসংখ্যা');
  process.exit(1);
}
const dbPath = process.env.DB_PATH ?? 'data/travelmaster.db';
if (dbPath !== ':memory:') mkdirSync(dirname(dbPath), { recursive: true });

const log = (event, fields) => console.error(JSON.stringify({
  time: new Date().toISOString(), event, ...fields }));
const app = await startServer({ port, dbPath, log,
  host: process.env.HOST ?? '127.0.0.1' });
console.log(`TravelMaster Pro: ${app.url}  (Database: ${dbPath})`);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    await app.close();
    process.exit(0);
  });
}
