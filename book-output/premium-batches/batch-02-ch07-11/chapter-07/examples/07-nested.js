const student = {
  name: 'Rafi',
  contact: {
    phone: '01700-000002',
    address: { city: 'Bogura' },
  },
};

const newcomer = { name: 'Nila' };

console.log(student.contact.address.city);
console.log(newcomer.contact?.address?.city);
console.log(newcomer.contact?.address?.city ?? 'অজানা');
