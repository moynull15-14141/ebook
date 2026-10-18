const original = { name: 'Mina', marks: 74, contact: { city: 'Khulna' } };

const updated = { ...original, marks: 80 };
console.log(original.marks, updated.marks);

updated.contact.city = 'Dhaka';
console.log(original.contact.city);

const { contact, ...withoutContact } = original;
console.log(withoutContact);
