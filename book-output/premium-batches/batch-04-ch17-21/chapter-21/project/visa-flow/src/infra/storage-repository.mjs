// একই চুক্তি, কিন্তু Web Storage-এ (localStorage বা Test-এর নকল Storage)।
// Adapter: Storage-এর getItem/setItem-কে Repository-র ভাষায় রূপান্তর।
export function createStorageRepository(storage, prefix = 'visaflow:') {
  const keys = () =>
    Array.from({ length: storage.length }, (_, i) => storage.key(i))
      .filter((key) => key.startsWith(prefix));

  function read(key) {
    try {
      return JSON.parse(storage.getItem(key));
    } catch {
      return null;
    }
  }

  return {
    save(application) {
      storage.setItem(prefix + application.id, JSON.stringify(application));
    },
    get(id) {
      return read(prefix + id);
    },
    list() {
      return keys()
        .map(read)
        .filter((item) => item !== null)
        .toSorted((a, b) => a.id.localeCompare(b.id));
    },
  };
}
