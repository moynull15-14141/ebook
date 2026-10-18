import { createStore } from '../../project/bookmark-vault/src/storage.mjs';

const fakeStorage = {
  getItem: () => '{this is not json',
  setItem: () => {},
};

const store = createStore(fakeStorage);
console.log(store.load().length, store.save([]));
