function getGrade(mark) {
  if (mark >= 80) {
    return 'A+';
  } else if (mark >= 60) {
    return 'A';
  } else if (mark >= 33) {
    return 'B';
  } else {
    return 'F';
  }
}

console.log(getGrade(80));
console.log(getGrade(79));
console.log(getGrade(33));
console.log(getGrade(32));
