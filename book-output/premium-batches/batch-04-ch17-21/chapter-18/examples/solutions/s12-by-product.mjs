const P = '../../project/ledger-flow';
const sample = await import(`${P}/data/sample.mjs`);
const { PRODUCTS, CUSTOMERS, sampleLoader } = sample;
const { loadInBatches } = await import(`${P}/src/load.mjs`);
const { validateOrder } = await import(`${P}/src/validate.mjs`);
const { flattenOrders, joinLines } = await import(`${P}/src/transform.mjs`);

const months = ['2026-01', '2026-02', '2026-03'];
const { records } = await loadInBatches(months, sampleLoader);
const orders = records.map(validateOrder).filter((r) => r.ok).map((r) => r.value);
const { joined } = joinLines(flattenOrders(orders), PRODUCTS, CUSTOMERS);
const names = new Map(PRODUCTS.map((p) => [p.sku, p.name]));

const bySku = [...Map.groupBy(joined, (row) => row.sku)]
  .map(([sku, rows]) => ({
    name: names.get(sku),
    qty: rows.reduce((a, r) => a + r.qty, 0),
  }))
  .toSorted((a, b) => b.qty - a.qty);

console.log(bySku.map((p) => `${p.name} ${p.qty}`).join(', '));
console.log(`সবচেয়ে বেশি: ${bySku[0].name}`);
