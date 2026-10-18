const marks = { bangla: 80, english: 72, math: 91 };

for (const [subject, mark] of Object.entries(marks)) {
  console.log(`${subject}: ${mark}`);
}
