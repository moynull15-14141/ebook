const subtotal = 4800;
const code = 'SAVE20';

console.log('code মিলেছে:', code === 'SAVE20');
console.log('ন্যূনতম পূরণ:', subtotal >= 5000);
console.log('পুরো শর্ত:', code === 'SAVE20' && subtotal >= 5000);
