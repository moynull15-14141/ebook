const students = [
  { name: 'Sara', mark: 80 },
  { name: 'Rafi', mark: 28 },
  { name: 'Mina', mark: 65 },
];

for (let i = 0; i < students.length; i++) {
  const student = students[i];
  const status = student.mark >= 33 ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ';

  console.log(`${i + 1}. ${student.name}: ${status}`);
}
