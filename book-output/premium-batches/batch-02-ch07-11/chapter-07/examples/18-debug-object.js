const student = { id: 'S1', name: 'Sara', contact: null };

console.log(Object.keys(student));
console.log(JSON.stringify(student, null, 2));
console.log(Object.hasOwn(student, 'marks'));
