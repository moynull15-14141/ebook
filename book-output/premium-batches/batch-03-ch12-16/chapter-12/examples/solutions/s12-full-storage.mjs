const PROJECT = '../../project/modular-shopping-cart/src';
const { createCartStore } = await import(`${PROJECT}/storage.mjs`);
const { addItem, emptyCart } = await import(`${PROJECT}/cart.mjs`);

const fullStorage = {
  getItem: () => null,
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
};

const store = createCartStore(fullStorage);

console.log(store.load().items.length);
console.log(store.save(addItem(emptyCart(), 'pen-set')));
