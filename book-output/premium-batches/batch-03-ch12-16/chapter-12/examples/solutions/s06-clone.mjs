const order = { id: 1, customer: { name: 'Mina', city: 'Sylhet' } };
const copy = structuredClone(order);

copy.customer.city = 'Dhaka';

console.log(order.customer.city, copy.customer.city);
