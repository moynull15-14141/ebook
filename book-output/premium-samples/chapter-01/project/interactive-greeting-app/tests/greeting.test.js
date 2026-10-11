// createGreeting() Function-এর Automated Test।
// চালানোর Command (Project Folder থেকে):  node --test
//
// app.js একটি সাধারণ Browser Script, তাই এখানে সেটিকে একটি নকল `document` দিয়ে
// আলাদা Context-এ চালানো হয়। এতে Browser ছাড়াই আসল app.js-এর Function পরীক্ষা করা যায়।
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadApp() {
  const fakeElement = { addEventListener() {}, focus() {}, value: '', textContent: '', className: '' };
  const context = vm.createContext({ document: { querySelector: () => fakeElement } });
  const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  vm.runInContext(source, context, { filename: 'app.js' });
  return context;
}

const { createGreeting } = loadApp();

test('নাম দিলে সেই নামসহ শুভেচ্ছা-বার্তা তৈরি হয়', () => {
  assert.equal(createGreeting('Rahim'), 'স্বাগতম, Rahim! JavaScript শেখার যাত্রা শুরু হোক।');
});

test('বাংলা নামও ঠিকভাবে কাজ করে', () => {
  assert.equal(createGreeting('নুসরাত'), 'স্বাগতম, নুসরাত! JavaScript শেখার যাত্রা শুরু হোক।');
});

test('নামের আগে-পরের ফাঁকা জায়গা বাদ যায়', () => {
  assert.equal(createGreeting('   Karim   '), 'স্বাগতম, Karim! JavaScript শেখার যাত্রা শুরু হোক।');
});

test('নামের মাঝখানের ফাঁকা জায়গা থেকে যায়', () => {
  assert.equal(createGreeting('Abdul Karim'), 'স্বাগতম, Abdul Karim! JavaScript শেখার যাত্রা শুরু হোক।');
});

test('ফাঁকা String দিলে ফাঁকা String ফেরত আসে', () => {
  assert.equal(createGreeting(''), '');
});

test('শুধু Space দিলে ফাঁকা String ফেরত আসে', () => {
  assert.equal(createGreeting('     '), '');
});

test('শুধু Tab ও নতুন লাইন দিলেও ফাঁকা String ফেরত আসে', () => {
  assert.equal(createGreeting('\t\n  '), '');
});

test('HTML-এর মতো লেখা বদলানো হয় না; সাধারণ Text হিসেবেই ফেরত আসে', () => {
  assert.equal(createGreeting('<b>Test</b>'), 'স্বাগতম, <b>Test</b>! JavaScript শেখার যাত্রা শুরু হোক।');
});
