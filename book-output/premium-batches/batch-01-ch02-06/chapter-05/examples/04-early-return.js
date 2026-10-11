function describeStock(quantity) {
  if (quantity <= 0) {
    return 'শেষ হয়ে গেছে';
  }

  if (quantity < 5) {
    return 'অল্প বাকি';
  }

  return 'মজুত আছে';
}

console.log(describeStock(0));
console.log(describeStock(3));
console.log(describeStock(40));
