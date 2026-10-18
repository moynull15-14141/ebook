import { parseStored } from './bookmarks.mjs';

export const STORAGE_KEY = 'jsm-ch15-bookmarks';

export function createStore(
  storage = globalThis.localStorage,
  key = STORAGE_KEY,
) {
  return {
    load() {
      try {
        return parseStored(storage.getItem(key));
      } catch {
        return [];
      }
    },
    save(list) {
      try {
        storage.setItem(key, JSON.stringify(list));
        return true;
      } catch {
        return false;
      }
    },
  };
}
