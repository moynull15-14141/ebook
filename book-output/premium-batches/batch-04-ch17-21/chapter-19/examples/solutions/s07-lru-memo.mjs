import { LruCache } from '../../project/perf-lab/src/lru.mjs';

const cache = new LruCache({ limit: 3 });
const slowSquare = (n) => n * n;

function cachedSquare(n) {
  const hit = cache.get(n);
  if (hit !== undefined) {
    return hit;
  }
  const value = slowSquare(n);
  cache.set(n, value);
  return value;
}

[1, 2, 1, 3, 1, 4, 2, 1, 5, 1].forEach(cachedSquare);
console.log(cache.stats, cache.size);
