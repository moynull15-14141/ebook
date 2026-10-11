function isValidAge(text) {
  const clean = text.trim();

  if (clean === '') {
    return false;
  }

  const age = Number(clean);

  return Number.isInteger(age) && age >= 0 && age <= 120;
}

console.log(isValidAge('25'));
console.log(isValidAge('0'));
console.log(isValidAge('121'));
console.log(isValidAge(''));
