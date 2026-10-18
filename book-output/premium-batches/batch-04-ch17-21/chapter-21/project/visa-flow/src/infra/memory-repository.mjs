// Repository-র চুক্তি: save(application), get(id) বা null, list() id-র ক্রমে।
// প্রতিটি Method Copy দেয়-নেয়, যাতে বাইরের পরিবর্তন ভেতরে না পৌঁছায়।
export function createMemoryRepository() {
  const items = new Map();
  return {
    save(application) {
      items.set(application.id, structuredClone(application));
    },
    get(id) {
      return items.has(id) ? structuredClone(items.get(id)) : null;
    },
    list() {
      return [...items.values()]
        .map((item) => structuredClone(item))
        .toSorted((a, b) => a.id.localeCompare(b.id));
    },
  };
}
