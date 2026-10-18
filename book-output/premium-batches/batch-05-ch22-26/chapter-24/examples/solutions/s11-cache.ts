class LookupCache<K, V> {
  readonly #entries = new Map<K, V>();

  set(key: K, value: V): this {
    this.#entries.set(key, value);
    return this;
  }

  get(key: K): V | undefined {
    return this.#entries.get(key);
  }

  getOr(key: K, fallback: V): V {
    return this.#entries.get(key) ?? fallback;
  }
}

const rates = new LookupCache<string, number>().set('USD-BDT', 121.45);
const rate: number = rates.getOr('EUR-BDT', 0);
console.log(rates.get('USD-BDT'), rate, rates.get('JPY-BDT'));
