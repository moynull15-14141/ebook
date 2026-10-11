function describeLesson(title) {
  const cleanTitle = title.trim();

  if (cleanTitle === '') {
    return 'শিরোনাম দেওয়া হয়নি।';
  }

  return `আজকের পাঠ: ${cleanTitle}`;
}

console.log(describeLesson('  console.log()  '));
console.log(describeLesson('   '));
