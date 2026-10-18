// Seed-যুক্ত ছোট PRNG (mulberry32): একই Seed-এ সব সময় একই ক্রম।
export function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const randomInts = (random, count, max) =>
  Array.from({ length: count }, () => Math.floor(random() * max));
