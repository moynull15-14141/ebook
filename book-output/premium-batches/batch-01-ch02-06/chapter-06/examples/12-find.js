const products = [
  { id: 'P1', name: 'Notebook', price: 120 },
  { id: 'P2', name: 'Pen', price: 15 },
  { id: 'P3', name: 'Bag', price: 950 },
];

const pen = products.find((product) => product.id === 'P2');
const missing = products.find((product) => product.id === 'P9');

console.log(pen.name);
console.log(missing);
console.log(products.findIndex((product) => product.id === 'P3'));
