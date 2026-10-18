const student = { id: 'S1', name: 'Sara', marks: 88 };

const { name, marks } = student;
console.log(name, marks);

const { marks: score, grade = 'জানা নেই' } = student;
console.log(score, grade);

function describe({ name, marks }) {
  return `${name} পেয়েছেন ${marks}`;
}

console.log(describe(student));
