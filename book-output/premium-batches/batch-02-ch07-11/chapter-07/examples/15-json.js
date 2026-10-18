const student = { name: 'Sara', marks: 88, passed: true, contact: null };

const text = JSON.stringify(student);
console.log(text);
console.log(typeof text);

const back = JSON.parse(text);
console.log(back.name, back.marks);
console.log(back === student);
