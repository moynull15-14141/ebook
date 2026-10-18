function updateIn(target, [key, ...rest], change) {
  const current = target?.[key];
  const next = rest.length === 0
    ? change(current)
    : updateIn(current, rest, change);
  if (Array.isArray(target)) {
    return target.with(key, next);
  }
  return { ...target, [key]: next };
}

const setIn = (target, path, value) => updateIn(target, path, () => value);

const store = { address: { city: 'Bogura' }, orders: [{ items: [{ qty: 2 }] }] };
const a = setIn(store, ['address', 'city'], 'Dhaka');
const b = updateIn(store, ['orders', 0, 'items', 0, 'qty'], (qty) => qty + 1);

console.log(a.address.city, store.address.city, a.orders === store.orders);
console.log(b.orders[0].items[0].qty, b.address === store.address);
