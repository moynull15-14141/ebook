const students = [
  { name: 'Sara', marks: 88 },
  { name: 'Rafi', marks: 72 },
];

const lines = ['name,marks', ...students.map((s) => `${s.name},${s.marks}`)];
const blob = new Blob([lines.join('\n')], { type: 'text/csv' });

console.log(blob.size, (await blob.text()).split('\n')[1]);
