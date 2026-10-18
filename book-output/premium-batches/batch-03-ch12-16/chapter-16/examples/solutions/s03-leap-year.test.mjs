import { test } from 'node:test';
import assert from 'node:assert/strict';

const isLeapYear = (year) =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

test('৪ দিয়ে বিভাজ্য: অধিবর্ষ', () => assert.equal(isLeapYear(2024), true));
test('৪ দিয়ে অবিভাজ্য: নয়', () => assert.equal(isLeapYear(2023), false));
test('১০০ দিয়ে বিভাজ্য, ৪০০ দিয়ে নয়: নয়', () =>
  assert.equal(isLeapYear(1900), false));
test('৪০০ দিয়ে বিভাজ্য: অধিবর্ষ', () => assert.equal(isLeapYear(2000), true));
