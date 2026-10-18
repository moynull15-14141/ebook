const titleCase = (text) =>
  text.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());

console.log(titleCase('modern JAVASCRIPT for bangla readers'));
