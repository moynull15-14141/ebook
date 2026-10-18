function countVowelSigns(text) {
  return [...text.normalize('NFC')].filter((c) => c === 'া').length;
}

console.log(countVowelSigns('আমার নাম সারা'));
