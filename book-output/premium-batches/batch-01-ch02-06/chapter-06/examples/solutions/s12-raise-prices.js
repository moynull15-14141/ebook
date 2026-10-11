function raisePrices(products, percent) {
  return products.map((product) => ({
    ...product,
    price: product.price + Math.round(product.price * percent / 100),
  }));
}

const products = [
  { name: 'Notebook', price: 120 },
  { name: 'Pen', price: 15 },
];
const raised = raisePrices(products, 10);

console.log(raised[0].price);
console.log(raised[1].price);
console.log(products[0].price);
