function sameStudent(a, b) {
  return a.id === b.id && a.name === b.name && a.marks === b.marks;
}

const first = { id: 'S1', name: 'Sara', marks: 88 };
const copy = { ...first };
const changed = { ...first, marks: 90 };

console.log(first === copy);
console.log(sameStudent(first, copy));
console.log(sameStudent(first, changed));
