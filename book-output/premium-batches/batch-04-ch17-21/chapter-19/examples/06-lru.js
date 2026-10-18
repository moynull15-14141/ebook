class LruCache {
  #limit;
  #map = new Map();

  constructor(limit) {
    this.#limit = limit;
  }

  get(key) {
    if (!this.#map.has(key)) {
      return undefined;
    }
    const value = this.#map.get(key);
    this.#map.delete(key);
    this.#map.set(key, value);
    return value;
  }

  set(key, value) {
    this.#map.delete(key);
    this.#map.set(key, value);
    if (this.#map.size > this.#limit) {
      this.#map.delete(this.#map.keys().next().value);
    }
  }

  get keys() {
    return [...this.#map.keys()];
  }
}

const cache = new LruCache(3);
['a', 'b', 'c'].forEach((key) => cache.set(key, key.toUpperCase()));
cache.get('a');
cache.set('d', 'D');
console.log(cache.keys, cache.get('b'));
