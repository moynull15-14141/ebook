const wait = (ms, value) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const getProduct = (id, price) => wait(100, { id, price });

async function main() {
  const products = await Promise.all([
    getProduct('P1', 250),
    getProduct('P2', 120),
    getProduct('P3', 80),
  ]);
  const total = products.reduce((sum, product) => sum + product.price, 0);
  console.log(`${products.length}টি পণ্য, মোট ${total} টাকা`);
}

main();
