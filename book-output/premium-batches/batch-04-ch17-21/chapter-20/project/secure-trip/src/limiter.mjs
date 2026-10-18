// নির্দিষ্ট সময়-জানালায় একটি Key-এর ব্যর্থ চেষ্টা গোনে (Login-এর জন্য)।
export function createLimiter(options = {}) {
  const { max = 5, windowMs = 15 * 60 * 1000, now = Date.now } = options;
  const failures = new Map();
  const current = (key) => {
    const entry = failures.get(key);
    if (!entry || now() - entry.start >= windowMs) {
      return { count: 0, start: now() };
    }
    return entry;
  };
  return {
    blocked: (key) => current(key).count >= max,
    fail(key) {
      const entry = current(key);
      failures.set(key, { count: entry.count + 1, start: entry.start });
    },
    reset: (key) => failures.delete(key),
  };
}
