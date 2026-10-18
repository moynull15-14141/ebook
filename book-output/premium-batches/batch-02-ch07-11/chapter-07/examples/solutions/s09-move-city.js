function moveToCity(student, city) {
  return { ...student, contact: { ...student.contact, city } };
}

const student = {
  name: 'Mina',
  contact: { phone: '01700-000003', city: 'Khulna' },
};
const moved = moveToCity(student, 'Sylhet');

console.log(moved.contact.city, moved.contact.phone);
console.log(student.contact.city);
