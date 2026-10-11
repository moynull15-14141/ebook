const double = (number) => number * 2;

const isAdult = (age) => age >= 18;

const describe = (name, mark) => {
  const status = mark >= 33 ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ';
  return `${name}: ${status}`;
};

const greeting = () => 'স্বাগতম!';

console.log(double(21));
console.log(isAdult(15));
console.log(describe('Sara', 80));
console.log(greeting());
