'use strict';

const PASS_MARK = 33;

// Text থেকে নম্বর তৈরি করে। নম্বর গ্রহণযোগ্য না হলে null ফেরত দেয়।
function toMark(text) {
  const clean = text.trim();

  if (clean === '') {
    return null;
  }

  const mark = Number(clean);

  if (Number.isInteger(mark) === false) {
    return null;
  }

  if (mark < 0) {
    return null;
  }

  if (mark > 100) {
    return null;
  }

  return mark;
}

// গড় নম্বর থেকে Grade ঠিক করে।
function getGrade(average) {
  if (average >= 80) {
    return 'A+';
  }

  if (average >= 70) {
    return 'A';
  }

  if (average >= 60) {
    return 'A-';
  }

  if (average >= 50) {
    return 'B';
  }

  if (average >= 40) {
    return 'C';
  }

  if (average >= PASS_MARK) {
    return 'D';
  }

  return 'F';
}

// নাম ও তিনটি নম্বর (Text) থেকে ফলাফলের একটি বাক্য তৈরি করে।
function calculateResult(name, banglaText, englishText, mathText) {
  const bangla = toMark(banglaText);
  const english = toMark(englishText);
  const math = toMark(mathText);

  if (bangla === null) {
    return 'বাংলার নম্বর সঠিক নয়।';
  }

  if (english === null) {
    return 'ইংরেজির নম্বর সঠিক নয়।';
  }

  if (math === null) {
    return 'গণিতের নম্বর সঠিক নয়।';
  }

  const total = bangla + english + math;
  const average = total / 3;
  let grade = getGrade(average);
  let status = 'উত্তীর্ণ';

  if (bangla < PASS_MARK) {
    grade = 'F';
    status = 'অনুত্তীর্ণ';
  }

  if (english < PASS_MARK) {
    grade = 'F';
    status = 'অনুত্তীর্ণ';
  }

  if (math < PASS_MARK) {
    grade = 'F';
    status = 'অনুত্তীর্ণ';
  }

  const shown = average.toFixed(2);

  return `${name.trim()}: মোট ${total}, গড় ${shown}, Grade ${grade}, ${status}`;
}

console.log(calculateResult('Sara', '80', '90', '70'));
console.log(calculateResult('Rafi', '100', '100', '20'));
console.log(calculateResult('Mina', '75', '', '60'));
