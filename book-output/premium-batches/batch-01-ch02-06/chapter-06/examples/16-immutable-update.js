const stock = [
  { id: 'P1', count: 40 },
  { id: 'P2', count: 3 },
];

const afterSale = stock.map((item) =>
  item.id === 'P1' ? { ...item, count: item.count - 1 } : item,
);

console.log(afterSale[0].count);
console.log(stock[0].count);
