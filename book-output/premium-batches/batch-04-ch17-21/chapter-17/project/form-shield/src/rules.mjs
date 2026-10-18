import { PATTERNS } from './patterns.mjs';

// প্রতিটি নিয়ম: (value) => বার্তা, অথবা ঠিক থাকলে null।
export const required = (message = 'ঘরটি পূরণ করুন।') => (value) =>
  (value === '' ? message : null);

export const length = (min, max) => (value) =>
  ([...value].length < min || [...value].length > max
    ? `দৈর্ঘ্য ${min} থেকে ${max} অক্ষরের মধ্যে হতে হবে।`
    : null);

export const matches = (regex, message) => (value) =>
  (regex.test(value) ? null : message);

export const notIn = (blocked, message) => (value) =>
  (blocked.includes(value.toLowerCase()) ? message : null);

export function realDate(value) {
  const match = PATTERNS.ISO_DATE.exec(value);
  if (!match) {
    return 'তারিখ YYYY-MM-DD আকারে লিখুন।';
  }
  const [y, m, d] = Object.values(match.groups).map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const real = date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
  return real ? null : 'এমন কোনো তারিখ নেই।';
}

export const passwordPolicy = [
  length(12, 64),
  matches(/\p{Lu}/u, 'একটি বড় হাতের অক্ষর দিন।'),
  matches(/\d/, 'একটি সংখ্যা দিন।'),
  (value) => (/(.)\1\1/.test(value) ? 'একই অক্ষর পরপর তিনবার নয়।' : null),
];
