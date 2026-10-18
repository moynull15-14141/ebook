import { createHash, randomBytes } from 'node:crypto';

export const hashToken = (token) =>
  createHash('sha256').update(token).digest('hex');

// Configuration আসে Environment থেকে; ভুল হলে শুরুতেই স্পষ্ট বার্তায় থামে।
// API_TOKENS-এর রূপ: "id:role:token,id:role:token" (role = agent বা manager)।
export function loadConfig(env = process.env) {
  const port = Number(env.PORT ?? 3025);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`PORT অবৈধ: ${env.PORT}`);
  }
  const users = new Map();
  for (const entry of (env.API_TOKENS ?? '').split(',').filter(Boolean)) {
    const [id, role, token] = entry.split(':');
    const validRole = ['agent', 'manager'].includes(role);
    if (!id || !validRole || !token || token.length < 24) {
      throw new Error(`API_TOKENS-এ অবৈধ Entry (id "${id}")`);
    }
    // Token নিজে Memory-তে নয়; শুধু তার Hash।
    users.set(hashToken(token), { id, role });
  }
  return {
    port,
    host: '127.0.0.1',
    users,
    rateLimit: { max: Number(env.RATE_LIMIT ?? 60), windowMs: 60_000 },
    shutdownGraceMs: Number(env.SHUTDOWN_GRACE_MS ?? 5_000),
  };
}

// Demo-র জন্য প্রতি চালানোয় নতুন এলোমেলো Token (Code-এ লেখা Token নয়)।
export function demoTokens() {
  const token = () => randomBytes(24).toString('base64url');
  return { manager: token(), rafi: token(), mina: token() };
}
