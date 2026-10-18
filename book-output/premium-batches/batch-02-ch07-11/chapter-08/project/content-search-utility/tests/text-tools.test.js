// Content Search Utility-এর Automated Test।  চালানোর Command (Project Folder থেকে):  node --test
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const loadScript = require('./load-script.js');

const { fn, get, printed } = loadScript(path.join(__dirname, '..', 'text-tools.js'));
const { normalizeText, countCharacters, makeExcerpt, topWords, findAll, highlight } = fn;
const toWords = get('toWords');
const makeSlug = get('makeSlug');
const json = v => JSON.stringify(v);

test('normalizeText: NFC, ছোট হাতের অক্ষর, একটিমাত্র ফাঁকা জায়গা', () => {
  assert.equal(normalizeText('  Hello   WORLD \n '), 'hello world');
  assert.equal(normalizeText('য়'), 'য়'.normalize('NFC'));
  assert.equal(normalizeText(null), '');
  assert.equal(normalizeText(42), '42');
});

test('toWords: বাংলা, ইংরেজি ও সংখ্যা; বিরামচিহ্ন বাদ', () => {
  assert.equal(json(toWords('JavaScript শিখুন, প্রতিদিন ১০ মিনিট!')), json(['javascript', 'শিখুন', 'প্রতিদিন', '১০', 'মিনিট']));
});

test('toWords: কার-চিহ্ন ও হসন্তে শব্দ ভাঙে না', () => {
  assert.equal(json(toWords('ক্ষমা কিশোর')), json(['ক্ষমা', 'কিশোর']));
});

test('toWords: ফাঁকা বা শুধু বিরামচিহ্নের লেখায় ফাঁকা Array', () => {
  assert.equal(json(toWords('')), '[]');
  assert.equal(json(toWords(' ।,!? ')), '[]');
});

test('countCharacters: Code Point ও Grapheme আলাদা', () => {
  assert.equal(json(countCharacters('ক্ষমা')), json({ codePoints: 5, graphemes: 2 }));
  assert.equal(json(countCharacters('Dhaka')), json({ codePoints: 5, graphemes: 5 }));
  assert.equal(json(countCharacters('😀')), json({ codePoints: 1, graphemes: 1 }));
});

test('countCharacters: দুই রূপের য় Normalization-এর পর একই গণনা', () => {
  assert.equal(json(countCharacters('য়')), json(countCharacters('য়')));
  assert.equal(countCharacters('য়').graphemes, 1);
});

test('makeSlug: বিরামচিহ্ন বাদ, হাইফেন দিয়ে জোড়া, বাংলা থাকে', () => {
  assert.equal(makeSlug('JavaScript শেখার প্রথম ধাপ!'), 'javascript-শেখার-প্রথম-ধাপ');
  assert.equal(makeSlug('  Hello,   World  '), 'hello-world');
  assert.equal(makeSlug('!!!'), '');
});

test('makeExcerpt: ছোট লেখা অপরিবর্তিত, ... ছাড়া', () => {
  assert.equal(makeExcerpt('ছোট লেখা', 60), 'ছোট লেখা');
  assert.equal(makeExcerpt('  a   b  ', 60), 'a b');
});

test('makeExcerpt: শব্দের মাঝে কাটে না', () => {
  const text = 'JavaScript শেখা শুরু করুন। JavaScript দিয়ে Browser';
  const result = makeExcerpt(text, 40);
  assert.equal(result, 'JavaScript শেখা শুরু করুন। JavaScript...');
  assert.ok(result.length <= 43);
});

test('makeExcerpt: ফাঁকা জায়গা ছাড়া লম্বা শব্দ সীমায় কাটে', () => {
  assert.equal(makeExcerpt('abcdefghij', 4), 'abcd...');
});

test('topWords: সংখ্যা অনুযায়ী, সমান হলে বর্ণানুক্রমে, ছোট শব্দ বাদ', () => {
  const text = 'beta alpha beta ও ও ও gamma alpha beta';
  assert.equal(json(topWords(text, 3)), json(['beta (3)', 'alpha (2)', 'gamma (1)']));
});

test('topWords: minLength চোখে-দেখা নয়, Code Point ধরে; limit মানে', () => {
  assert.equal(json(topWords('এক দুই তিন চার', 2, 1)), json(['এক (1)', 'চার (1)']));
  assert.equal(json(topWords('', 5)), '[]');
});

test('findAll: বড়-ছোট হাতের অক্ষর নির্বিশেষে সব অবস্থান', () => {
  assert.equal(json(findAll('Node node NODE', 'node')), json([0, 5, 10]));
  assert.equal(json(findAll('aaaa', 'aa')), json([0, 2]));
  assert.equal(json(findAll('abc', 'x')), '[]');
});

test('findAll: ফাঁকা খোঁজার শব্দে ফাঁকা তালিকা; Loop চলে না', () => {
  assert.equal(json(findAll('কিছু লেখা', '')), '[]');
  assert.equal(json(findAll('কিছু লেখা', '   ')), '[]');
});

test('findAll ও highlight: দুই রূপের য় মেলে', () => {
  assert.equal(json(findAll('য়', 'য়')), json([0]));
  assert.equal(highlight('বিদ্যালয়', 'লয়'), 'বিদ্যা[লয়]'.normalize('NFC'));
});

test('highlight: মূল লেখার রূপ রাখে, HTML তৈরি করে না; demo Output ঠিক', () => {
  assert.equal(highlight('Learn JavaScript, love javascript', 'JAVASCRIPT'), 'Learn [JavaScript], love [javascript]');
  assert.equal(highlight('Hello <b>', 'b'), 'Hello <[b]>');
  assert.equal(highlight('কিছু নেই', 'xyz'), 'কিছু নেই');
  assert.equal(printed[0], 'শব্দ: 20');
  assert.equal(printed[5], '0, 27, 107');
});
