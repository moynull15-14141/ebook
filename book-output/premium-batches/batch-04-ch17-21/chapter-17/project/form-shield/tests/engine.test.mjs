// Engine ও Schema-র Test: Mass Assignment, __proto__, Optional ঘর, ReDoS-এর দৈর্ঘ্য-সীমা।
// চালানোর Command (Project Folder থেকে):  node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { validate, MAX_INPUT } from '../src/engine.mjs';
import { required, matches } from '../src/rules.mjs';
import { signupSchema } from '../signup-schema.mjs';

const goodInput = () => ({
  name: '  মোঃ  রফিক ',
  username: 'Rafiq_88',
  email: ' Rafiq@Example.COM ',
  phone: '+৮৮০ ১৭১২-৩৪৫৬৭৮',
  birthDate: '2000-02-29',
  password: 'Bogura-River-2026',
});

test('বৈধ Signup: আদর্শ রূপে মান, কোনো ভুল নয়', () => {
  const result = validate(signupSchema, goodInput());
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, {});
  assert.deepEqual(result.values, {
    name: 'মোঃ রফিক', username: 'rafiq_88', email: 'rafiq@example.com',
    phone: '01712345678', birthDate: '2000-02-29', password: 'Bogura-River-2026',
  });
});

test('সব ভুল একসঙ্গে, প্রতিটি ঘরে প্রথম ভাঙা নিয়মের বার্তা', () => {
  const result = validate(signupSchema, {});
  assert.equal(result.ok, false);
  assert.deepEqual(Object.keys(result.errors), ['name', 'username', 'email', 'phone', 'password']);
  assert.ok(Object.values(result.errors).every((message) => message === 'ঘরটি পূরণ করুন।'));
});

test('Optional ঘর: ফাঁকা হলে নিয়ম চলে না, ফলেও আসে না; পূরণ করলে যাচাই হয়', () => {
  const { birthDate, ...withoutDate } = goodInput();
  const empty = validate(signupSchema, withoutDate);
  assert.equal(empty.ok, true);
  assert.equal('birthDate' in empty.values, false);
  assert.equal(validate(signupSchema, { ...goodInput(), birthDate: '2001-02-29' }).errors.birthDate, 'এমন কোনো তারিখ নেই।');
  assert.equal(birthDate, '2000-02-29');
});

test('Mass Assignment: Schema-র বাইরের ঘর ফলে যায় না', () => {
  const result = validate(signupSchema, { ...goodInput(), isAdmin: true, role: 'admin' });
  assert.equal(result.ok, true);
  assert.equal('isAdmin' in result.values, false);
  assert.equal('role' in result.values, false);
});

test('__proto__ ও উত্তরাধিকারসূত্রে পাওয়া Key: ফল দূষিত হয় না', () => {
  const evil = JSON.parse('{"__proto__": {"polluted": true}, "name": "Sara"}');
  const schema = { name: { rules: [required()] }, toString: { optional: true, rules: [] } };
  const result = validate(schema, evil);
  assert.equal(result.values.name, 'Sara');
  assert.equal({}.polluted, undefined);
  assert.equal(result.values.polluted, undefined);
  // ইনপুটের উত্তরাধিকারসূত্রে পাওয়া toString পড়া হয়নি: ঘরটি ফাঁকা ধরে Optional হিসেবে বাদ।
  assert.equal(Object.hasOwn(result.values, 'toString'), false);
});

test('ReDoS প্রতিরোধ: সীমার বেশি লেখা Regex-এর আগেই প্রত্যাখ্যাত, তাৎক্ষণিকভাবে', () => {
  const evilRule = matches(/^(a+)+$/, 'ভুল');
  const schema = { field: { rules: [evilRule] } };
  const start = performance.now();
  const result = validate(schema, { field: `${'a'.repeat(1_000_000)}b` });
  assert.equal(result.errors.field, `লেখা অনেক বড় (সর্বোচ্চ ${MAX_INPUT} অক্ষর)।`);
  assert.ok(performance.now() - start < 1000);
});

test('সীমার ঠিক সমান দৈর্ঘ্য গৃহীত, এক বেশি নয় (Boundary)', () => {
  const schema = { note: { rules: [] } };
  assert.equal(validate(schema, { note: 'x'.repeat(MAX_INPUT) }).ok, true);
  assert.equal(validate(schema, { note: 'x'.repeat(MAX_INPUT + 1) }).ok, false);
});

test('null বা অদ্ভুত ইনপুটে Engine ভেঙে পড়ে না', () => {
  assert.equal(validate(signupSchema, null).ok, false);
  assert.equal(validate({ age: { rules: [matches(/^\d+$/, 'সংখ্যা')] } }, { age: 42 }).values.age, '42');
});

test('ফলের Object সাধারণ Object (Prototype-সহ), JSON-এ পাঠানো যায়', () => {
  const result = validate(signupSchema, goodInput());
  assert.equal(Object.getPrototypeOf(result.values), Object.prototype);
  assert.doesNotThrow(() => JSON.stringify(result));
});
