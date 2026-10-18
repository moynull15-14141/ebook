const pipe = (...fns) => (input) => fns.reduce((value, fn) => fn(value), input);

const trimAll = (names) => names.map((name) => name.trim());
const capitalize = (names) =>
  names.map((name) => name[0].toUpperCase() + name.slice(1));
const joinWithComma = (names) => names.join(', ');

const cleanNames = pipe(trimAll, capitalize, joinWithComma);
console.log(cleanNames(['  sara ', 'rafi', ' mina']));
