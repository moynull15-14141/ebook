// Token Bucket: প্রতি Connection-এ সীমিত হারে Message।
export function createBucket({ capacity, refillPerSecond, now = Date.now }) {
  let tokens = capacity;
  let last = now();
  return function take() {
    const current = now();
    tokens = Math.min(capacity,
      tokens + ((current - last) / 1000) * refillPerSecond);
    last = current;
    if (tokens < 1) return false;
    tokens -= 1;
    return true;
  };
}
