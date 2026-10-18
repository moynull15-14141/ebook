const products = [
  { sku: 'B1', name: 'Notebook', price: 120 },
  { sku: 'B2', name: 'Pen Set', price: 250 },
];
const lines = [
  { order: 'O1', sku: 'B1', qty: 2 },
  { order: 'O1', sku: 'B9', qty: 1 },
  { order: 'O2', sku: 'B2', qty: 1 },
];

const indexBy = (rows, key) => new Map(rows.map((row) => [row[key], row]));
const productIndex = indexBy(products, 'sku');

const joined = lines.flatMap((line) => {
  const product = productIndex.get(line.sku);
  if (!product) {
    return [];
  }
  return [{ ...line, name: product.name, total: product.price * line.qty }];
});
const missing = lines
  .filter((line) => !productIndex.has(line.sku))
  .map((line) => line.sku);

console.log(joined.map((row) => `${row.order} ${row.name} ${row.total}`));
console.log(missing);
