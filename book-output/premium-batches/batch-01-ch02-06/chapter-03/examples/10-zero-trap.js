function describeMark(mark) {
  if (mark) {
    return `নম্বর: ${mark}`;
  }

  return 'নম্বর দেওয়া হয়নি';
}

console.log(describeMark(75));
console.log(describeMark(0));
