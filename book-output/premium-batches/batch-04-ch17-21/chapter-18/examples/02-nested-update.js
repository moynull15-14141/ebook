const store = {
  name: 'Boi Ghar',
  address: { city: 'Bogura', zip: '5800' },
  orders: [
    { id: 'O1', items: [{ sku: 'B1', qty: 2 }, { sku: 'B2', qty: 1 }] },
    { id: 'O2', items: [{ sku: 'B3', qty: 5 }] },
  ],
};

const updated = {
  ...store,
  orders: store.orders.map((order) =>
    (order.id !== 'O1' ? order : {
      ...order,
      items: order.items.map((item) =>
        (item.sku === 'B2' ? { ...item, qty: 3 } : item)),
    })),
};

console.log(store.orders[0].items[1].qty, updated.orders[0].items[1].qty);
console.log(updated.address === store.address);
console.log(updated.orders[1] === store.orders[1]);
console.log(updated.orders[0].items[0] === store.orders[0].items[0]);
console.log(updated.orders[0] === store.orders[0]);
