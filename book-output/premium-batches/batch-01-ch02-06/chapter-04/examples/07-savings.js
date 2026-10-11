const target = 5000;
const monthlySaving = 1200;
let balance = 0;
let months = 0;

while (balance < target) {
  balance += monthlySaving;
  months++;
}

console.log(`${months} মাসে জমা হবে ${balance} টাকা`);
