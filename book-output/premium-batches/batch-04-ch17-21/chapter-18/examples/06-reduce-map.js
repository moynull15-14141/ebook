const lines = [
  { sku: 'B1', qty: 2 }, { sku: 'B2', qty: 1 }, { sku: 'B1', qty: 1 },
];

const qtyBySku = lines.reduce(
  (totals, line) => totals.set(line.sku, (totals.get(line.sku) ?? 0) + line.qty),
  new Map(),
);

console.log(qtyBySku);
console.log([...qtyBySku].toSorted((a, b) => b[1] - a[1])[0]);
