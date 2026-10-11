const products = [
  { name: 'Notebook', price: 120 },
  { name: 'Pen', price: 15 },
];

const names = products.map((product) => product.name);

console.log(names);
console.log(names.join(', '));
