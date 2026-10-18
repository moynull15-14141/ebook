const composed = '\u00E9';
const decomposed = 'e\u0301';

console.log(composed.length, decomposed.length);
console.log(composed === decomposed);
console.log(composed.normalize('NFC') === decomposed.normalize('NFC'));

const ya1 = '\u09DF';
const ya2 = '\u09AF\u09BC';

console.log(ya1 === ya2, ya1.length, ya2.length);
console.log(ya1.normalize('NFC') === ya2.normalize('NFC'));
