const digits = /\d+/g;

console.log(digits.test('abc 42'), digits.lastIndex);
console.log(digits.test('abc 42'), digits.lastIndex);
console.log(digits.test('abc 42'));

const safe = /\d+/;
console.log(safe.test('abc 42'), safe.test('abc 42'), safe.test('abc 42'));
