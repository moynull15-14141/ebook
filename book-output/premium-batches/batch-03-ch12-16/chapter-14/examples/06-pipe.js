const pipe = (...fns) => (input) => fns.reduce((value, fn) => fn(value), input);

const trim = (text) => text.trim();
const lower = (text) => text.toLowerCase();
const words = (text) => text.split(/\s+/);
const count = (list) => list.length;

const wordCount = pipe(trim, lower, words, count);
const slug = pipe(trim, lower, words, (list) => list.join('-'));

console.log(wordCount('  JavaScript শিখুন প্রতিদিন  '));
console.log(slug(' Modern JavaScript Guide '));
