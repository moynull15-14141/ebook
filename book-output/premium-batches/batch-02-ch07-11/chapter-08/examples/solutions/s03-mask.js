const phone = '01712345678';
const visible = phone.slice(-3);

console.log('*'.repeat(phone.length - 3) + visible);
console.log(visible.padStart(phone.length, '*'));
