const MAX_MONTHS = 1000;
const start = 10000;
let amount = start;
let months = 0;

while (amount < start * 2 && months < MAX_MONTHS) {
  amount = Math.round(amount * 105 / 100);
  months++;
}

console.log(`${months} মাসে ${amount}`);
