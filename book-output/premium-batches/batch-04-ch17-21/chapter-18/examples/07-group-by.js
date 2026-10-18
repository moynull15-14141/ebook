const sales = [
  { region: 'Dhaka', month: '2026-01', amount: 1200 },
  { region: 'Sylhet', month: '2026-01', amount: 800 },
  { region: 'Dhaka', month: '2026-02', amount: 500 },
  { region: 'Dhaka', month: '2026-01', amount: 300 },
];

const band = (sale) => (sale.amount >= 1000 ? 1000 : 0);
const byAmountBand = Map.groupBy(sales, band);
console.log([...byAmountBand.keys()], typeof [...byAmountBand.keys()][0]);

function aggregate(rows) {
  return rows.reduce(
    (stats, row) => ({
      count: stats.count + 1,
      total: stats.total + row.amount,
      max: Math.max(stats.max, row.amount),
    }),
    { count: 0, total: 0, max: -Infinity },
  );
}

const pivot = {};
const byRegion = Object.groupBy(sales, (s) => s.region);
for (const [region, rows] of Object.entries(byRegion)) {
  pivot[region] = Object.fromEntries(
    Object.entries(Object.groupBy(rows, (s) => s.month))
      .map(([month, monthRows]) => [month, aggregate(monthRows).total]),
  );
}
console.log(pivot);
console.log(aggregate(sales));
