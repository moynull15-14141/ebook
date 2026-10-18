// @ts-check
import { openDatabase } from './db.mjs';
import { createTravelService } from './service.mjs';
import { createHttpServer } from './http.mjs';

/**
 * Database, Service ও HTTP একসঙ্গে জোড়া লাগানো (Composition Root)।
 * @param {{ port?: number, host?: string, dbPath?: string,
 *   now?: () => number, tokenTtlMs?: number,
 *   log?: (event: string, fields: object) => void }} [options]
 */
export async function startServer({ port = 0, host = '127.0.0.1',
  dbPath = ':memory:', now, tokenTtlMs, log } = {}) {
  const db = openDatabase(dbPath);
  const service = createTravelService({ db, now, tokenTtlMs });
  const server = createHttpServer({ service, log });
  await new Promise((resolve) => server.listen(port, host, () => resolve(0)));
  const address = /** @type {import('node:net').AddressInfo} */ (
    server.address());
  return {
    url: `http://${host}:${address.port}`,
    server, service, db,
    close: () => new Promise((resolve) => {
      server.closeAllConnections();
      server.close(() => {
        db.close();
        resolve(0);
      });
    }),
  };
}
