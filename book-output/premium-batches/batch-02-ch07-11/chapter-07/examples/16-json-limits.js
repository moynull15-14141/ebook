const record = {
  name: 'Rafi',
  note: undefined,
  greet() {
    return 'hi';
  },
  joined: new Date(0),
};

console.log(JSON.stringify(record));
console.log(JSON.stringify({ name: 'Rafi', marks: 70 }, null, 2));
