const PASSWORD_RULES = [
  { test: (p) => p.length >= 12, message: 'কমপক্ষে 12 অক্ষর' },
  { test: (p) => /\p{Lu}/u.test(p), message: 'একটি বড় হাতের অক্ষর' },
  { test: (p) => /\d/.test(p), message: 'একটি সংখ্যা' },
  { test: (p) => !/(.)\1\1/.test(p), message: 'একই অক্ষর পরপর তিনবার নয়' },
];

const problems = (password) =>
  PASSWORD_RULES
    .filter((rule) => !rule.test(password))
    .map((rule) => rule.message);

console.log(problems('aaab'));
console.log(problems('Bangladesh2026!'));
