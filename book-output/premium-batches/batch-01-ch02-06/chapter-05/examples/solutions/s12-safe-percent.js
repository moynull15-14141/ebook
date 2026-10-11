const isValidPercent = (value) =>
  typeof value === 'number' && value >= 0 && value <= 100;

function safePercentOf(amount, percent) {
  if (!isValidPercent(percent)) {
    return null;
  }

  return Math.round(amount * percent / 100);
}

console.log(safePercentOf(1000, 10));
console.log(safePercentOf(1000, 150));
console.log(safePercentOf(1000, '10'));
