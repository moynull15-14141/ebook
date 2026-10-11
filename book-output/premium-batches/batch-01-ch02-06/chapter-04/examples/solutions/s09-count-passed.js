function countPassed(marks, passMark) {
  let passed = 0;

  for (let i = 0; i < marks.length; i++) {
    if (marks[i] >= passMark) {
      passed++;
    }
  }

  return passed;
}

console.log(countPassed([72, 28, 45, 33], 33));
console.log(countPassed([], 33));
