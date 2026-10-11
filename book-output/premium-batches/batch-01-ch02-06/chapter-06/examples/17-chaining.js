const products = [
  { name: 'Notebook', price: 120, stock: 40 },
  { name: 'Pen', price: 15, stock: 0 },
  { name: 'School Bag', price: 950, stock: 5 },
  { name: 'Calculator', price: 650, stock: 0 },
];

const availableNames = products
  .filter((product) => product.stock > 0)
  .map((product) => product.name)
  .join(', ');

const availableValue = products
  .filter((product) => product.stock > 0)
  .reduce((sum, product) => sum + product.price * product.stock, 0);

console.log(availableNames);
console.log(availableValue);
