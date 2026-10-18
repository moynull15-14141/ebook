const student = { name: 'Sara', marks: 88 };

localStorage.setItem('student', JSON.stringify(student));

const saved = JSON.parse(localStorage.getItem('student'));
console.log(saved.name, saved.marks);
console.log(localStorage.getItem('missing'));

localStorage.removeItem('student');
