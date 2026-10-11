function addBonusBad(marks) {
  marks.push(5);
  return marks;
}

const original = [70, 80];
const updated = addBonusBad(original);

console.log(original);
console.log(original === updated);

function addBonusGood(marks) {
  return [...marks, 5];
}

const safe = [70, 80];
const result = addBonusGood(safe);

console.log(safe);
console.log(result);
