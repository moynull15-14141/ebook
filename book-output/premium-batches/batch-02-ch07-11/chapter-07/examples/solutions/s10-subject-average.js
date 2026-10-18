const students = [
  { name: 'Sara', marks: { bangla: 80, english: 90 } },
  { name: 'Rafi', marks: { bangla: 60, english: 70 } },
];

const totals = {};

for (const { marks } of students) {
  for (const [subject, mark] of Object.entries(marks)) {
    totals[subject] = (totals[subject] ?? 0) + mark;
  }
}

for (const [subject, sum] of Object.entries(totals)) {
  console.log(`${subject}: ${sum / students.length}`);
}
