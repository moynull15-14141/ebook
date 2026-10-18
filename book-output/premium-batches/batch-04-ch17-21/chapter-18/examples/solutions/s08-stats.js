const amounts = [1200, 800, 500, 300];

const stats = amounts.reduce(
  (s, amount) => ({
    count: s.count + 1,
    total: s.total + amount,
    min: Math.min(s.min, amount),
  }),
  { count: 0, total: 0, min: Infinity },
);

console.log({ ...stats, average: stats.count ? stats.total / stats.count : 0 });
