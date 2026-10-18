import { randomBytes, timingSafeEqual } from 'node:crypto';

const token = () => randomBytes(32).toString('base64url');

// দৈর্ঘ্য আলাদা হলে সঙ্গে সঙ্গে false; সমান হলে ধ্রুব-সময়ের তুলনা।
export function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}

export function createSessions(options = {}) {
  const { ttlMs = 30 * 60 * 1000, now = Date.now } = options;
  const sessions = new Map();
  return {
    create(user) {
      const id = token();
      const csrf = token();
      const expires = now() + ttlMs;
      const { id: userId, email, role } = user;
      sessions.set(id, { userId, email, role, csrf, expires });
      return { id, csrf };
    },
    get(id) {
      const session = sessions.get(id);
      if (!session) {
        return null;
      }
      if (now() >= session.expires) {
        sessions.delete(id);
        return null;
      }
      return session;
    },
    destroy(id) {
      sessions.delete(id);
    },
  };
}
