const products = [
  { name: 'Notebook', price: 120, stock: 40 },
  { name: 'Pen', price: 15, stock: 3 },
  { name: 'School Bag', price: 950, stock: 5 },
];

const valuable = products
  .filter((product) => product.price * product.stock >= 4000)
  .map((product) => product.name)
  .join(', ');

console.log(valuable);
