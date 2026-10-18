import { reconnectDelay } from '../project/travel-live/src/backoff.mjs';

// Test-যোগ্য করতে random বাইরে থেকে দেওয়া: 0.5 মানে Jitter শূন্য।
const middle = () => 0.5;
for (const attempt of [0, 1, 2, 3, 4, 5, 6, 10]) {
  console.log(`চেষ্টা ${attempt}: ${reconnectDelay(attempt, middle)} ms`);
}

// আসল Jitter: ১০০০ Client একসঙ্গে বিচ্ছিন্ন হলে ৩য় চেষ্টা কতটা ছড়ায়?
let seed = 27;
const random = () => {
  seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648;
  return seed / 2_147_483_648;
};
const delays = Array.from({ length: 1000 }, () => reconnectDelay(3, random));
console.log('৩য় চেষ্টা: সর্বনিম্ন', Math.min(...delays), 'ms, সর্বোচ্চ',
  Math.max(...delays), 'ms');
