const orders = [
  { id: 'O1', customer: 'C1', items: [
    { sku: 'B1', qty: 2 }, { sku: 'B2', qty: 1 },
  ] },
  { id: 'O2', customer: 'C2', items: [] },
  { id: 'O3', customer: 'C1', items: [{ sku: 'B1', qty: 1 }] },
];

const lines = orders.flatMap((order) =>
  order.items.map((item) =>
    ({ order: order.id, customer: order.customer, ...item })));

console.log(lines.length);
const labels = lines.map((line) => `${line.order}:${line.sku}x${line.qty}`);
console.log(labels.join(' '));

const words = ['আম কলা', 'লিচু'].flatMap((text) => text.split(' '));
console.log(words);
