const students = [
  { id: 'S1', name: 'Sara', marks: 88 },
  { id: 'S2', name: 'Rafi', marks: 35 },
];

const saved = JSON.stringify(students);
const restored = JSON.parse(saved);

console.log(restored.length, restored[1].name);
console.log(JSON.stringify(restored) === saved);
console.log(restored === students);
