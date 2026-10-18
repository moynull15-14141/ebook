const by = (key, direction = 1) => (a, b) =>
  (a[key] < b[key] ? -direction : a[key] > b[key] ? direction : 0);
const thenBy = (...comparators) => (a, b) => {
  for (const compare of comparators) {
    const result = compare(a, b);
    if (result !== 0) {
      return result;
    }
  }
  return 0;
};

const students = [
  { name: 'Sara', class: 9, marks: 88 },
  { name: 'Rafi', class: 10, marks: 88 },
  { name: 'Mina', class: 9, marks: 92 },
  { name: 'Nila', class: 9, marks: 88 },
];

const order = thenBy(by('class'), by('marks', -1), by('name'));
const ranked = students.toSorted(order);
console.log(ranked.map((s) => `${s.class}-${s.name}`).join(' '));

const collator = new Intl.Collator('bn');
console.log(['সুমন', 'আরিফ', 'ঋতু', 'কবির'].toSorted(collator.compare));
const natural = new Intl.Collator('en', { numeric: true });
console.log(['item10', 'item2', 'item1'].toSorted(natural.compare));
