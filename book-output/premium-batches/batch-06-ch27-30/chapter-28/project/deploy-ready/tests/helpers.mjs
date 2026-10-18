import { loadConfig } from '../src/config.mjs';
import { createLogger } from '../src/logger.mjs';
import { createMetrics } from '../src/metrics.mjs';
import { createMemoryJobStore } from '../src/jobs.mjs';
import { startServer } from '../src/server.mjs';

export const TOKEN = 'test-ops-token-0123456789abcdef';

// Port 0: Operating System একটি খালি Port দেয়; Log জমা হয় Array-তে।
export async function start({ env = {}, store } = {}) {
  const config = loadConfig({ NODE_ENV: 'test', PORT: '0',
    OPS_TOKEN: TOKEN, APP_VERSION: '1.2.3', GIT_SHA: 'abc1234', ...env });
  const lines = [];
  const logger = createLogger({ level: 'debug',
    write: (line) => lines.push(JSON.parse(line)) });
  const running = await startServer({ config, logger,
    metrics: createMetrics(), store: store ?? createMemoryJobStore() });
  const base = `http://127.0.0.1:${running.port}`;
  return { ...running, base, lines, config };
}

export async function call(base, path, { method = 'GET', body, headers,
  token } = {}) {
  const res = await fetch(`${base}${path}`, { method, body,
    headers: { ...(token && { Authorization: `Bearer ${token}` }),
      ...headers } });
  const text = await res.text();
  const type = res.headers.get('content-type') ?? '';
  return { status: res.status, headers: res.headers,
    body: type.startsWith('application/json') ? JSON.parse(text) : text };
}

export const json = (value) => ({ body: JSON.stringify(value),
  headers: { 'Content-Type': 'application/json' } });
