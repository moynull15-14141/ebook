// Student Result Calculator-এর Automated Test।  চালানোর Command (Project Folder থেকে):  node --test
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const loadScript = require('./load-script.js');

const { fn, printed } = loadScript(path.join(__dirname, '..', 'result.js'));
const { toMark, getGrade, calculateResult } = fn;

test('toMark: সঠিক পূর্ণসংখ্যা গ্রহণ করে', () => {
  assert.equal(toMark('80'), 80);
  assert.equal(toMark('0'), 0);
  assert.equal(toMark('100'), 100);
});
test('toMark: আগে-পরের ফাঁকা জায়গা উপেক্ষা করে', () => assert.equal(toMark('  80  '), 80));
test('toMark: ফাঁকা Text শূন্য নয়, null', () => {
  assert.equal(toMark(''), null);
  assert.equal(toMark('    '), null);
});
test('toMark: সংখ্যা নয় এমন Text বাতিল করে', () => {
  assert.equal(toMark('abc'), null);
  assert.equal(toMark('80px'), null);
});
test('toMark: দশমিক সংখ্যা বাতিল করে', () => assert.equal(toMark('80.5'), null));
test('toMark: সীমার বাইরের সংখ্যা বাতিল করে', () => {
  assert.equal(toMark('-1'), null);
  assert.equal(toMark('101'), null);
});
test('getGrade: প্রতিটি সীমায় সঠিক Grade', () => {
  assert.equal(getGrade(80), 'A+');
  assert.equal(getGrade(79.99), 'A');
  assert.equal(getGrade(70), 'A');
  assert.equal(getGrade(60), 'A-');
  assert.equal(getGrade(50), 'B');
  assert.equal(getGrade(40), 'C');
  assert.equal(getGrade(33), 'D');
  assert.equal(getGrade(32.99), 'F');
});
test('calculateResult: সব বিষয়ে উত্তীর্ণ', () => {
  assert.equal(calculateResult('Sara', '80', '90', '70'), 'Sara: মোট 240, গড় 80.00, Grade A+, উত্তীর্ণ');
});
test('calculateResult: এক বিষয়ে অনুত্তীর্ণ হলে গড় ভালো হলেও F', () => {
  assert.equal(calculateResult('Rafi', '100', '100', '20'), 'Rafi: মোট 220, গড় 73.33, Grade F, অনুত্তীর্ণ');
});
test('calculateResult: ঠিক পাস নম্বরে উত্তীর্ণ', () => {
  assert.equal(calculateResult('Nila', '33', '33', '33'), 'Nila: মোট 99, গড় 33.00, Grade D, উত্তীর্ণ');
});
test('calculateResult: String নম্বর জোড়া লাগে না, যোগ হয়', () => {
  assert.match(calculateResult('A', '10', '20', '30'), /মোট 60,/);
});
test('calculateResult: কোন বিষয়ের নম্বর ভুল, তা জানায়', () => {
  assert.equal(calculateResult('Mina', 'x', '50', '60'), 'বাংলার নম্বর সঠিক নয়।');
  assert.equal(calculateResult('Mina', '75', '', '60'), 'ইংরেজির নম্বর সঠিক নয়।');
  assert.equal(calculateResult('Mina', '75', '50', '101'), 'গণিতের নম্বর সঠিক নয়।');
});
test('calculateResult: নামের আগে-পরের ফাঁকা জায়গা বাদ দেয়', () => {
  assert.match(calculateResult('  Sara  ', '80', '90', '70'), /^Sara: /);
});
test('File চালালে তিনটি উদাহরণের ফল দেখায়', () => {
  assert.deepEqual(printed, [
    'Sara: মোট 240, গড় 80.00, Grade A+, উত্তীর্ণ',
    'Rafi: মোট 220, গড় 73.33, Grade F, অনুত্তীর্ণ',
    'ইংরেজির নম্বর সঠিক নয়।',
  ]);
});
