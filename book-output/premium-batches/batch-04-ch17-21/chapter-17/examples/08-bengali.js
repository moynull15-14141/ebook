const toAsciiDigits = (text) =>
  text.replace(/[০-৯]/g, (digit) => String(digit.charCodeAt(0) - 0x09e6));

console.log(toAsciiDigits('০১৭১২-৩৪৫৬৭৮'));

const banglaName = /^[\p{Script=Bengali}\s.]+$/u;
console.log(banglaName.test('মোঃ রফিক'), banglaName.test('Rafiq'), banglaName.test('রফিক১'));

const words = 'আমি JavaScript শিখি'.match(/[\p{L}\p{M}]+/gu);
console.log(words);
const smile = '\u{1F600}';
console.log('বই'.match(/\bবই\b/u), smile.match(/^.$/u)?.[0].length);
