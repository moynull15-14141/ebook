const students = [
  { name: 'Sara', marks: 88 },
  { name: 'Rafi', marks: 28 },
  { name: 'Mina', marks: 61 },
];
const PASS_MARK = 33;

const groups = Object.groupBy(students, ({ marks }) =>
  (marks >= PASS_MARK ? 'pass' : 'fail'));

console.log(groups.pass.map((student) => student.name));
console.log(groups.fail.map((student) => student.name));
