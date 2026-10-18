const students = [
  { name: 'Sara', marks: 88 },
  { name: 'Rafi', marks: 35 },
  { name: 'Mina', marks: 80 },
];

const toppers = students
  .filter(({ marks }) => marks >= 80)
  .map(({ name }) => name);

console.log(toppers.join(', '));
