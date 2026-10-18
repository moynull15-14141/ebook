export class LruCache {
  #limit;
  #ttl;
  #now;
  #map = new Map();
  stats = { hits: 0, misses: 0, evictions: 0 };

  constructor({ limit, ttlMs = Infinity, now = () => Date.now() }) {
    if (!Number.isInteger(limit) || limit < 1) {
      throw new RangeError('limit একটি ধনাত্মক পূর্ণসংখ্যা হতে হবে');
    }
    this.#limit = limit;
    this.#ttl = ttlMs;
    this.#now = now;
  }

  get(key) {
    const entry = this.#map.get(key);
    if (!entry || this.#now() - entry.at >= this.#ttl) {
      this.#map.delete(key);
      this.stats.misses += 1;
      return undefined;
    }
    this.#map.delete(key);
    this.#map.set(key, entry);
    this.stats.hits += 1;
    return entry.value;
  }

  set(key, value) {
    this.#map.delete(key);
    this.#map.set(key, { value, at: this.#now() });
    if (this.#map.size > this.#limit) {
      this.#map.delete(this.#map.keys().next().value);
      this.stats.evictions += 1;
    }
  }

  get size() {
    return this.#map.size;
  }
}
