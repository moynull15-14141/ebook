import { LruCache } from '../../project/perf-lab/src/lru.mjs';

class PeekableCache extends LruCache {
  #shadow = new Map();

  set(key, value) {
    super.set(key, value);
    this.#shadow.set(key, value);
  }

  peek(key) {
    return this.#shadow.get(key);
  }
}

const cache = new PeekableCache({ limit: 2 });
cache.set('a', 1);
cache.set('b', 2);
console.log(cache.peek('a'));
cache.set('c', 3);
console.log(cache.get('a'), cache.get('b'));
