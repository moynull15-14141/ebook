// Generic Repository: যেকোনো Type T, যার একটি id আছে, এবং id-র Type K।
export interface Repository<T extends { readonly id: K }, K> {
  get(id: K): T | undefined;
  save(item: T): void;
  list(): readonly T[];
}

export class MemoryRepository<T extends { readonly id: K }, K>
implements Repository<T, K> {
  readonly #items = new Map<K, T>();

  get(id: K): T | undefined {
    return this.#items.get(id);
  }

  save(item: T): void {
    this.#items.set(item.id, item);
  }

  list(): readonly T[] {
    return [...this.#items.values()];
  }
}
