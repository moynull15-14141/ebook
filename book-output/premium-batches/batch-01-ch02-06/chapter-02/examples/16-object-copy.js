const original = { name: 'Arif', city: 'Dhaka' };
const copy = { ...original };

copy.city = 'Khulna';

console.log(original.city);
console.log(copy.city);
console.log(original === copy);
