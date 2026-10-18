const order = { id: 7, items: [{ name: 'Pen', qty: 2 }] };

const shallow = { ...order };
const deep = structuredClone(order);
deep.items[0].qty = 5;
shallow.items[0].name = 'Pencil';

console.log(order.items[0]);
console.log(deep.items[0]);

const products = [
  { name: 'Pen', type: 'stationery' },
  { name: 'Mouse', type: 'electronics' },
  { name: 'Notebook', type: 'stationery' },
];
const byType = Object.groupBy(products, (product) => product.type);

console.log(Object.keys(byType));
console.log(byType.stationery.map((product) => product.name));
