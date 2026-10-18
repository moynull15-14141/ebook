'use strict';

const WORD = /[\p{L}\p{M}\p{N}]+/gu;

// তুলনার জন্য একই রূপ: NFC, ছোট হাতের অক্ষর, একটিমাত্র ফাঁকা জায়গা।
function normalizeText(text) {
  return String(text ?? '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// লেখার শব্দগুলোর Array (বাংলা ও ইংরেজি)।
const toWords = (text) => normalizeText(text).match(WORD) ?? [];

// অক্ষর গণনা: Code Point এবং চোখে দেখা অক্ষর।
function countCharacters(text) {
  const clean = String(text ?? '').normalize('NFC');
  const segmenter = new Intl.Segmenter('bn', { granularity: 'grapheme' });

  return {
    codePoints: [...clean].length,
    graphemes: [...segmenter.segment(clean)].length,
  };
}

// URL-এর উপযোগী Slug: শব্দগুলো হাইফেন দিয়ে জোড়া।
const makeSlug = (title) => toWords(title).join('-');

// শব্দ না কেটে নির্দিষ্ট দৈর্ঘ্যের সারাংশ।
function makeExcerpt(text, maxLength = 60) {
  const clean = String(text ?? '').normalize('NFC').replace(/\s+/g, ' ').trim();

  if (clean.length <= maxLength) {
    return clean;
  }

  const cut = clean.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  const base = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;

  return `${base}...`;
}

// সবচেয়ে বেশি ব্যবহৃত শব্দ, কমপক্ষে minLength অক্ষরের।
function topWords(text, limit = 5, minLength = 3) {
  const counts = {};

  for (const word of toWords(text)) {
    if ([...word].length >= minLength) {
      counts[word] = (counts[word] ?? 0) + 1;
    }
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word, count]) => `${word} (${count})`);
}

// খোঁজার শব্দের সব অবস্থান (NFC লেখায় Index), বড়-ছোট হাতের অক্ষর নির্বিশেষে।
function findAll(text, query) {
  const haystack = String(text).normalize('NFC').toLowerCase();
  const needle = normalizeText(query);
  const positions = [];

  if (needle === '') {
    return positions;
  }

  let index = haystack.indexOf(needle);

  while (index !== -1) {
    positions.push(index);
    index = haystack.indexOf(needle, index + needle.length);
  }

  return positions;
}

// প্রতিটি মিল [ ] দিয়ে চিহ্নিত করে; HTML তৈরি করে না।
function highlight(text, query) {
  const clean = String(text).normalize('NFC');
  const size = normalizeText(query).length;
  let result = '';
  let last = 0;

  for (const index of findAll(clean, query)) {
    result += `${clean.slice(last, index)}[${clean.slice(index, index + size)}]`;
    last = index + size;
  }

  return result + clean.slice(last);
}

const article = `JavaScript শেখা শুরু করুন। JavaScript দিয়ে Browser ও Server
দুই জায়গাতেই কাজ করা যায়। প্রতিদিন একটু করে JavaScript অনুশীলন করুন।`;

const { codePoints, graphemes } = countCharacters('ক্ষমা');

console.log(`শব্দ: ${toWords(article).length}`);
console.log(`ক্ষমা: ${codePoints} Code Point, ${graphemes} অক্ষর`);
console.log(makeSlug('JavaScript শেখার প্রথম ধাপ!'));
console.log(makeExcerpt(article, 40));
console.log(topWords(article, 3).join(', '));
console.log(findAll(article, 'JAVASCRIPT').join(', '));
console.log(highlight('প্রতিদিন অনুশীলন করুন, নিয়মিত অনুশীলন করুন।', 'অনুশীলন'));
