const marks = { bangla: 80, english: 72, math: 91 };

console.log(Object.keys(marks));
console.log(Object.values(marks));

for (const [subject, mark] of Object.entries(marks)) {
  console.log(`${subject}: ${mark}`);
}

const total = Object.values(marks).reduce((sum, mark) => sum + mark, 0);
console.log(total);
