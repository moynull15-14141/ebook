function isValidQuantity(text) {
  const clean = text.trim();

  if (clean === '') {
    return false;
  }

  const quantity = Number(clean);

  return Number.isInteger(quantity) && quantity >= 1 && quantity <= 100;
}

console.log(isValidQuantity('5'));
console.log(isValidQuantity(''));
console.log(isValidQuantity('0'));
console.log(isValidQuantity('2.5'));
console.log(isValidQuantity('abc'));
console.log(isValidQuantity('101'));
