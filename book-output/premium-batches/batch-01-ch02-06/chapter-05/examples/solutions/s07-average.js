function average(numbers) {
  if (numbers.length === 0) {
    return 0;
  }

  let sum = 0;

  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i];
  }

  return sum / numbers.length;
}

console.log(average([80, 90, 70]));
console.log(average([]));
