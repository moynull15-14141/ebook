const amounts = [50, -10, 30, 0, 20];
let total = 0;
let skipped = 0;

for (let i = 0; i < amounts.length; i++) {
  if (amounts[i] <= 0) {
    skipped++;
    continue;
  }

  total += amounts[i];
}

console.log(`মোট: ${total}, বাদ পড়েছে: ${skipped}`);
