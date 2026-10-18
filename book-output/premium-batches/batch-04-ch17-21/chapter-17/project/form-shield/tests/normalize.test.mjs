// Normalization-এর Test।  চালানোর Command (Project Folder থেকে):  node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { toAsciiDigits, cleanText, normalizePhone, normalizeEmail } from '../src/normalize.mjs';

test('toAsciiDigits: সব বাংলা অঙ্ক, বাকি লেখা অপরিবর্তিত', () => {
  assert.equal(toAsciiDigits('০১২৩৪৫৬৭৮৯'), '0123456789');
  assert.equal(toAsciiDigits('ক১খ2'), 'ক1খ2');
});

test('cleanText: NFC, আগে-পরে ও মাঝের বাড়তি ফাঁকা জায়গা, Tab ও নতুন লাইন', () => {
  assert.equal(cleanText('  মোঃ \t রফিক\n '), 'মোঃ রফিক');
  assert.equal(cleanText('য়'), 'য়'.normalize('NFC'));
  assert.equal(cleanText(null), '');
  assert.equal(cleanText(42), '42');
});

test('normalizePhone: +880, 880, বাংলা অঙ্ক, ফাঁকা জায়গা, হাইফেন, বন্ধনী', () => {
  for (const raw of ['01712345678', '+8801712345678', '8801712345678', '+৮৮০ ১৭১২-৩৪৫৬৭৮', '(017) 1234-5678']) {
    assert.equal(normalizePhone(raw), '01712345678', raw);
  }
});

test('normalizePhone: অবৈধ নম্বর বদলায় না, যাতে যাচাই তাকে ধরতে পারে', () => {
  assert.equal(normalizePhone('12345'), '12345');
  assert.equal(normalizePhone('abc'), 'abc');
});

test('normalizeEmail: ছোট হাতের অক্ষর ও trim', () => {
  assert.equal(normalizeEmail(' Rafiq@Example.COM '), 'rafiq@example.com');
});
