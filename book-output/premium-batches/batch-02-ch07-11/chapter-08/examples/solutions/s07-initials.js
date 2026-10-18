function initials(fullName) {
  return fullName
    .trim()
    .split(/\s+/)
    .map((part) => part[0].toUpperCase())
    .join('');
}

console.log(initials('sara ahmed khan'));
console.log(initials('  mina    das '));
