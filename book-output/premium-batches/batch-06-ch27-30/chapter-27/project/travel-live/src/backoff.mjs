// Exponential Backoff + Jitter: প্রতিবার অপেক্ষা দ্বিগুণ, সর্বোচ্চ ৩০ সেকেন্ড,
// আর ±২৫% এলোমেলো, যাতে হাজার Client একসঙ্গে ফিরে না আসে।
export function reconnectDelay(attempt, random = Math.random) {
  const capped = Math.min(30_000, 500 * 2 ** Math.min(attempt, 6));
  return Math.floor(capped * (0.75 + random() * 0.5));
}
