"use strict";
/** Pure, testable result logic. Grade policy is illustrative, not an official board standard. */
function calculateResult(name, marks) {
  if (typeof name !== "string" || name.trim().length === 0 || name.trim().length > 80) {
    throw new TypeError("শিক্ষার্থীর নাম ১–৮০ অক্ষরের হতে হবে।");
  }
  if (!Array.isArray(marks) || marks.length !== 3 || marks.some(
    (mark) => typeof mark !== "number" || !Number.isInteger(mark) || mark < 0 || mark > 100
  )) {
    throw new RangeError("প্রতিটি বিষয়ে ০–১০০-এর মধ্যে পূর্ণসংখ্যা দাও।");
  }
  const total = marks.reduce((sum, mark) => sum + mark, 0);
  const average = total / marks.length;
  const passed = marks.every((mark) => mark >= 33);
  let grade;
  if (!passed) grade = "F";
  else if (average >= 80) grade = "A+";
  else if (average >= 70) grade = "A";
  else if (average >= 60) grade = "A-";
  else if (average >= 50) grade = "B";
  else if (average >= 40) grade = "C";
  else if (average >= 33) grade = "D";
  else grade = "F";
  return {name: name.trim(), marks: [...marks], total, average, passed, grade};
}
if (typeof module !== "undefined" && module.exports) module.exports = {calculateResult};
