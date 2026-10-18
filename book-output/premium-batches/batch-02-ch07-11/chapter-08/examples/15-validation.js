const isBdMobile = (text) => /^01[3-9]\d{8}$/.test(text.trim());
const looksLikeEmail = (text) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim());

console.log(isBdMobile('01712345678'));
console.log(isBdMobile('0171234567'));
console.log(isBdMobile('02712345678'));
console.log(looksLikeEmail('sara@example.com'));
console.log(looksLikeEmail('sara@example'));
console.log(looksLikeEmail('sara @example.com'));
