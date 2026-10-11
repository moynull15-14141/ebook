const prices = [120, 15, 950, 280];

console.log(prices.filter((price) => price >= 200));
console.log(prices.filter((price) => price > 5000));

const products = [
  { name: 'Notebook', stock: 40 },
  { name: 'Pen', stock: 0 },
  { name: 'Bag', stock: 5 },
];

const available = products.filter((product) => product.stock > 0);

console.log(available.length);
console.log(available.map((product) => product.name));
