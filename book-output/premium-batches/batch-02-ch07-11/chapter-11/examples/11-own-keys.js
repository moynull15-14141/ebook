const catalog = { keyboard: { name: 'Keyboard', price: 1250 } };

const unsafeFind = (id) => catalog[id];
const safeFind = (id) => (Object.hasOwn(catalog, id) ? catalog[id] : null);

console.log(typeof unsafeFind('toString'));
console.log(safeFind('toString'));
console.log(safeFind('keyboard').price);
