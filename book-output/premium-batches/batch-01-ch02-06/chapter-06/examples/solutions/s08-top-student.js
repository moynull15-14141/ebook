const students = [
  { name: 'Sara', mark: 80 },
  { name: 'Mina', mark: 93 },
  { name: 'Rafi', mark: 95 },
];

const top = students.find((student) => student.mark >= 90);

console.log(top === undefined ? 'কেউ নেই' : top.name);
