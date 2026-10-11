function addBonus(mark) {
  mark = mark + 5;
  return mark;
}

const mark = 70;
const updated = addBonus(mark);
console.log(mark);
console.log(updated);

function promote(student) {
  student.level = 2;
}

const student = { name: 'Mina', level: 1 };
promote(student);
console.log(student.level);
