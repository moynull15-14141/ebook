'use strict';

const LOW_STOCK_LIMIT = 5;

// নতুন পণ্যসহ একটি নতুন Array ফেরত দেয়।
const addProduct = (products, product) => [...products, product];

// নির্দিষ্ট id-র পণ্য বাদ দিয়ে একটি নতুন Array ফেরত দেয়।
const removeProduct = (products, id) =>
  products.filter((product) => product.id !== id);

// id দিয়ে একটি পণ্য খোঁজে; না পেলে undefined।
const findProduct = (products, id) =>
  products.find((product) => product.id === id);

// একটি পণ্যের মজুত বদলে নতুন Array ফেরত দেয়। মজুত শূন্যের নিচে নামে না।
function changeStock(products, id, change) {
  return products.map((product) => {
    if (product.id !== id) {
      return product;
    }

    const next = product.stock + change;

    return { ...product, stock: next < 0 ? 0 : next };
  });
}

// মজুত সীমার সমান বা কম, এমন পণ্যের Array।
const lowStock = (products, limit = LOW_STOCK_LIMIT) =>
  products.filter((product) => product.stock <= limit);

// পুরো মজুতের মোট মূল্য (টাকায়)।
const totalValue = (products) =>
  products.reduce((sum, product) => sum + product.price * product.stock, 0);

// প্রতিটি পণ্যের এক লাইনের বিবরণ।
const describe = (products) =>
  products.map((p) => `${p.id} ${p.name}: ${p.stock} x ${p.price}`);

// পণ্যের তালিকা এবং সারসংক্ষেপ দেখায়।
function printDashboard(products) {
  for (const line of describe(products)) {
    console.log(line);
  }

  const lowNames = lowStock(products).map((product) => product.name);

  console.log(`পণ্য: ${products.length}টি`);
  console.log(`মোট মূল্য: ${totalValue(products)} টাকা`);
  console.log(`মজুত কম: ${lowNames.join(', ')}`);
}

const initial = [
  { id: 'P1', name: 'Notebook', price: 120, stock: 40 },
  { id: 'P2', name: 'Pen', price: 15, stock: 3 },
  { id: 'P3', name: 'School Bag', price: 950, stock: 5 },
];
const calculator = { id: 'P4', name: 'Calculator', price: 650, stock: 12 };

let products = addProduct(initial, calculator);
products = changeStock(products, 'P1', -38);
products = removeProduct(products, 'P2');

printDashboard(products);
console.log(`শুরুর তালিকায় এখনো ${initial.length}টি পণ্য`);
console.log(`শুরুর তালিকায় Notebook-এর মজুত: ${initial[0].stock}`);
