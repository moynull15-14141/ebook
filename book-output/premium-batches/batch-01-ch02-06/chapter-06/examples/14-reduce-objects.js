const products = [
  { name: 'Notebook', price: 120, stock: 40 },
  { name: 'Bag', price: 950, stock: 5 },
];

const stockValue = products.reduce(
  (sum, product) => sum + product.price * product.stock,
  0,
);

console.log(stockValue);
console.log([].reduce((sum, value) => sum + value, 0));
