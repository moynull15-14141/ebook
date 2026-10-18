const showCodes = (text) =>
  [...text].map((c) => c.codePointAt(0).toString(16).padStart(4, '0')).join(' ');

console.log(showCodes('\u09DF'));
console.log(showCodes('\u09AF\u09BC'));
const typed = 'Sara\u00A0Ahmed ';

console.log(JSON.stringify('Sara '));
console.log(typed.split(' ').length);
console.log(showCodes(typed.slice(4, 5)));
