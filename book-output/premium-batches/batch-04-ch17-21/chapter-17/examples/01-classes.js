const text = 'Order A-102, B-7 এবং C-3051; মোট 3টি';

console.log(text.match(/[A-Z]-\d{3,4}/g));
console.log(text.match(/[^\s,;]+/g).length);
console.log('cat category scat'.match(/\bcat\b/g));
console.log('price_2026 মূল্য'.match(/\w+/g));
