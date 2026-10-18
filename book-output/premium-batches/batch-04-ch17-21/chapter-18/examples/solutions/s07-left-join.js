const students = [
  { id: 1, name: 'Sara' }, { id: 2, name: 'Rafi' }, { id: 3, name: 'Mina' },
];
const results = [{ studentId: 1, marks: 88 }, { studentId: 3, marks: 72 }];

const marksById = new Map(results.map((r) => [r.studentId, r.marks]));
const report = students.map((s) =>
  ({ ...s, marks: marksById.get(s.id) ?? null }));

console.log(report.map((r) => `${r.name}:${r.marks}`).join(' '));
