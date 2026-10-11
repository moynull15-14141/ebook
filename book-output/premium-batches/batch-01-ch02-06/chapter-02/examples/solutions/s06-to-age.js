function toAge(text) {
  const clean = text.trim();

  if (clean === '') {
    return null;
  }

  const age = Number(clean);

  if (Number.isInteger(age) === false) {
    return null;
  }

  if (age < 0) {
    return null;
  }

  if (age > 120) {
    return null;
  }

  return age;
}

console.log(toAge(' 25 '));
console.log(toAge('২৫ বছর'));
console.log(toAge('150'));
console.log(toAge(''));
