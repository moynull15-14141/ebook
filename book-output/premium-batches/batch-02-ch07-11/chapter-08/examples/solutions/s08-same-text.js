function sameText(a, b) {
  const clean = (text) => text.normalize('NFC').trim().toLowerCase();
  return clean(a) === clean(b);
}

console.log('\u09DF' === '\u09AF\u09BC');
console.log(sameText('\u09DF', '\u09AF\u09BC'));
console.log(sameText(' Dhaka ', 'DHAKA'));
