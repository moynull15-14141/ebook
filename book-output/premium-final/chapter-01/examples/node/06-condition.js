function checkName(name) {
  const cleanName = name.trim();

  if (cleanName === '') {
    return 'নাম লেখা হয়নি।';
  }

  return `নাম পাওয়া গেছে: ${cleanName}`;
}

console.log(checkName('  Karim  '));
console.log(checkName('     '));
