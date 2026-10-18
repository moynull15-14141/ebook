// SLO: ৩০ দিনে ৯৯.৯% অনুরোধ সফল। Error Budget = বাকি ০.১%।
const slo = 0.999;
const month = { total: 4_200_000, failed: 2_900 };
const lastHour = { total: 6_000, failed: 90 };

const sli = (w) => (w.total - w.failed) / w.total;
const budget = month.total * (1 - slo);
const pct = (x) => `${(x * 100).toFixed(3)}%`;

console.log('৩০ দিনের SLI:', pct(sli(month)));
console.log('Error Budget:', Math.round(budget), 'টি ব্যর্থ অনুরোধ');
console.log('খরচ হয়েছে:', pct(month.failed / budget));

// Burn Rate: এই হারে চললে Budget কত গুণ দ্রুত শেষ হবে।
const burnRate = (1 - sli(lastHour)) / (1 - slo);
console.log('শেষ ১ ঘণ্টার Error Rate:', pct(1 - sli(lastHour)));
console.log('Burn Rate:', burnRate.toFixed(1));
console.log('Budget শেষ হবে প্রায়', Math.round(30 / burnRate * 24), 'ঘণ্টায়');
console.log(burnRate >= 14.4 ? 'Page: এখনই কাউকে জাগান'
  : burnRate >= 1 ? 'Ticket: কাজের সময়ে দেখুন' : 'ঠিক আছে');
