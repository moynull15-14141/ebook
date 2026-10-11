const products = [
  { name: 'Notebook', stock: 40 },
  { name: 'Pen', stock: 0 },
];

const available = products.filter((product) => product.stock > 0);
console.log('filter-এর পর:', available.length);

const names = available.map((product) => product.name);
console.log('map-এর পর:', names);

console.log(JSON.stringify(available));
