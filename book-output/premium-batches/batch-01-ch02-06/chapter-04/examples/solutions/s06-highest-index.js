const values = [40, 75, 12, 98, 63];
let highest = values[0];
let highestIndex = 0;

for (let i = 1; i < values.length; i++) {
  if (values[i] > highest) {
    highest = values[i];
    highestIndex = i;
  }
}

console.log(`সর্বোচ্চ ${highest}, Index ${highestIndex}`);
