const marks = [72, 88, 45, 91, 60];

let sum = 0;
let passed = 0;
let highest = marks[0];
let lowest = marks[0];

for (let i = 0; i < marks.length; i++) {
  const mark = marks[i];

  sum += mark;

  if (mark >= 60) {
    passed++;
  }

  if (mark > highest) {
    highest = mark;
  }

  if (mark < lowest) {
    lowest = mark;
  }
}

console.log(`যোগফল: ${sum}`);
console.log(`গড়: ${sum / marks.length}`);
console.log(`৬০ বা বেশি: ${passed} জন`);
console.log(`সর্বোচ্চ: ${highest}, সর্বনিম্ন: ${lowest}`);
