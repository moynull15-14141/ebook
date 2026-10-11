const numbers = [5, 10, 0, 20];
let sum = 0;

for (let i = 0; i < numbers.length; i++) {
  if (numbers[i] === 0) {
    break;
  }

  sum += numbers[i];
}

console.log(sum);
