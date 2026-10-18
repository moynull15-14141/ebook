// Pattern ও নিয়মের Test।  চালানোর Command (Project Folder থেকে):  node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { PATTERNS, escapeRegExp } from '../src/patterns.mjs';
import { required, length, matches, notIn, realDate, passwordPolicy } from '../src/rules.mjs';

const firstProblem = (rules, value) => rules.map((rule) => rule(value)).find(Boolean) ?? null;

test('সব Pattern Anchor-যুক্ত এবং g/y Flag-মুক্ত (lastIndex-এর ফাঁদ নেই)', () => {
  for (const [name, regex] of Object.entries(PATTERNS)) {
    assert.ok(regex.source.startsWith('^') && regex.source.endsWith('$'), name);
    assert.ok(!regex.global && !regex.sticky, name);
  }
  assert.ok(Object.isFrozen(PATTERNS));
});

test('BD_MOBILE: Boundary—013 থেকে 019 গৃহীত, 012 নয়, 10 বা 12 অঙ্ক নয়', () => {
  for (const ok of ['01312345678', '01912345678']) assert.ok(PATTERNS.BD_MOBILE.test(ok), ok);
  for (const bad of ['01212345678', '0171234567', '017123456789', ' 01712345678']) assert.ok(!PATTERNS.BD_MOBILE.test(bad), bad);
});

test('একই Pattern বারবার test করলে একই ফল', () => {
  const results = [1, 2, 3, 4].map(() => PATTERNS.EMAIL.test('a@b.co'));
  assert.deepEqual(results, [true, true, true, true]);
});

test('EMAIL: উদার গঠন—+ চিহ্নসহ ঠিকানা গৃহীত; ফাঁকা জায়গা বা ডট-হীন Domain নয়', () => {
  assert.ok(PATTERNS.EMAIL.test('sara+bills@example.com'));
  for (const bad of ['sara@', 'sara@example', 'sa ra@example.com', '@example.com']) assert.ok(!PATTERNS.EMAIL.test(bad), bad);
});

test('USERNAME ও PERSON_NAME', () => {
  assert.ok(PATTERNS.USERNAME.test('rafiq_88'));
  for (const bad of ['ra', '8rafiq', 'Rafiq', 'r'.repeat(21)]) assert.ok(!PATTERNS.USERNAME.test(bad), bad);
  for (const name of ['মোঃ রফিক', "O'Brien", 'Jean-Luc', 'সারা']) assert.ok(PATTERNS.PERSON_NAME.test(name), name);
  for (const bad of ['R2D2', '.Sara', '<b>']) assert.ok(!PATTERNS.PERSON_NAME.test(bad), bad);
});

test('escapeRegExp: বিশেষ অক্ষর আক্ষরিক হয়', () => {
  const pattern = new RegExp(`^${escapeRegExp('c++ (1.0) [x]?')}$`);
  assert.ok(pattern.test('c++ (1.0) [x]?'));
  assert.ok(!pattern.test('cc (1x0) x'));
});

test('required ও length: Code Point গোনে (Emoji একটি অক্ষর)', () => {
  assert.equal(required()(''), 'ঘরটি পূরণ করুন।');
  assert.equal(required()('x'), null);
  assert.equal(length(2, 3)('😀😀'), null);
  assert.equal(length(2, 3)('a'), 'দৈর্ঘ্য 2 থেকে 3 অক্ষরের মধ্যে হতে হবে।');
  assert.equal(length(2, 3)('abcd'), 'দৈর্ঘ্য 2 থেকে 3 অক্ষরের মধ্যে হতে হবে।');
});

test('matches ও notIn (বড়-ছোট হাতের অক্ষর নির্বিশেষে)', () => {
  assert.equal(matches(/^\d+$/, 'সংখ্যা দিন')('12a'), 'সংখ্যা দিন');
  assert.equal(notIn(['admin'], 'সংরক্ষিত')('ADMIN'), 'সংরক্ষিত');
  assert.equal(notIn(['admin'], 'সংরক্ষিত')('administrator'), null);
});

test('realDate: অধিবর্ষ, ৩০ ফেব্রুয়ারি, ১৩তম মাস, ভুল গঠন', () => {
  assert.equal(realDate('2024-02-29'), null);
  assert.equal(realDate('2000-02-29'), null);
  assert.equal(realDate('1900-02-29'), 'এমন কোনো তারিখ নেই।');
  assert.equal(realDate('2026-02-30'), 'এমন কোনো তারিখ নেই।');
  assert.equal(realDate('2026-13-01'), 'এমন কোনো তারিখ নেই।');
  assert.equal(realDate('15/10/2026'), 'তারিখ YYYY-MM-DD আকারে লিখুন।');
});

test('passwordPolicy: প্রতিটি নিয়মের নিজস্ব বার্তা, ক্রমে প্রথমটি', () => {
  assert.equal(firstProblem(passwordPolicy, 'Short1'), 'দৈর্ঘ্য 12 থেকে 64 অক্ষরের মধ্যে হতে হবে।');
  assert.equal(firstProblem(passwordPolicy, 'alllowercase2026'), 'একটি বড় হাতের অক্ষর দিন।');
  assert.equal(firstProblem(passwordPolicy, 'NoDigitsAtAllHere'), 'একটি সংখ্যা দিন।');
  assert.equal(firstProblem(passwordPolicy, 'Boguraaa-2026x'), 'একই অক্ষর পরপর তিনবার নয়।');
  assert.equal(firstProblem(passwordPolicy, 'Bogura-River-2026'), null);
});
