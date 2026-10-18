import { openDatabase } from '../src/db.mjs';
import { createTravelService } from '../src/service.mjs';
import { startServer } from '../src/server.mjs';

export const PASSWORD = 'correct-horse-battery';

// Domain Test: আসল SQLite (Memory-তে) ও নিয়ন্ত্রিত ঘড়ি।
export function domain({ tokenTtlMs } = {}) {
  const clock = { now: Date.UTC(2026, 9, 18, 9, 0, 0) };
  const db = openDatabase();
  const service = createTravelService({ db, now: () => clock.now,
    tokenTtlMs });
  const user = (name, email = `${name.toLowerCase()}@example.com`) => {
    service.register({ name, email, password: PASSWORD });
    return service.login({ email, password: PASSWORD });
  };
  const seats = (id) => db.prepare('SELECT seats FROM packages WHERE id = ?')
    .get(id).seats;
  return { db, service, clock, user, seats };
}

// HTTP Test: আসল Server, Port 0।
export async function http() {
  const logs = [];
  const app = await startServer({ log: (event, fields) =>
    logs.push({ event, ...fields }) });
  const call = async (path, { method = 'GET', token, body, raw,
    type = 'application/json' } = {}) => {
    const res = await fetch(`${app.url}${path}`, { method,
      headers: { ...(token && { Authorization: `Bearer ${token}` }),
        ...((body !== undefined || raw) && { 'Content-Type': type }) },
      body: raw ?? (body === undefined ? undefined : JSON.stringify(body)) });
    const text = await res.text();
    return { status: res.status, headers: res.headers, text,
      json: res.headers.get('content-type')?.startsWith('application/json')
        ? JSON.parse(text) : null };
  };
  const signUp = async (name) => {
    const email = `${name.toLowerCase()}@example.com`;
    await call('/api/register', { method: 'POST',
      body: { name, email, password: PASSWORD } });
    const { json } = await call('/api/login', { method: 'POST',
      body: { email, password: PASSWORD } });
    return json.data.token;
  };
  return { ...app, call, signUp, logs };
}
