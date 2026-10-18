const original = { name: 'Mina', contact: { city: 'Khulna' } };
const deep = structuredClone(original);

deep.contact.city = 'Sylhet';

console.log(original.contact.city);
console.log(deep.contact.city);
