// Test-এর সাধারণ প্রস্তুতি: নির্দিষ্ট Test Token, এলোমেলো Port, শুধু 127.0.0.1।
import { loadConfig } from '../src/config.mjs';
import { startServer } from '../src/server.mjs';

export const TOKENS = {
  manager: 'manager-token-for-tests-only-0001',
  rafi: 'rafi-agent-token-for-tests-only-02',
  mina: 'mina-agent-token-for-tests-only-03',
};

export async function startTestServer(t, options = {}) {
  const config = loadConfig({
    PORT: '0',
    RATE_LIMIT: String(options.rateLimit ?? 1_000),
    SHUTDOWN_GRACE_MS: String(options.graceMs ?? 2_000),
    API_TOKENS: `manager:manager:${TOKENS.manager},`
      + `rafi:agent:${TOKENS.rafi},mina:agent:${TOKENS.mina}`,
  });
  const logs = [];
  const log = (entry) => logs.push(entry);
  const server = await startServer(config, { log, ...options });
  t.after(() => server.shutdown());

  async function call(method, path, { as, body, headers = {} } = {}) {
    const response = await fetch(server.url + path, {
      method,
      headers: {
        ...(as && { authorization: `Bearer ${TOKENS[as]}` }),
        ...(body !== undefined && { 'content-type': 'application/json' }),
        ...headers,
      },
      body: typeof body === 'string' ? body : body && JSON.stringify(body),
    });
    const text = await response.text();
    return { status: response.status, headers: response.headers,
      body: text ? JSON.parse(text) : null };
  }
  return { server, call, logs };
}

export const newLead = (overrides = {}) => ({
  name: 'Karim Uddin', phone: '01712345678', destination: "Cox's Bazar",
  travelers: 4, ...overrides,
});
