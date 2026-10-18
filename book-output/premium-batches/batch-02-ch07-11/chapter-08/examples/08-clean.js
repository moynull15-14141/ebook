const raw = '   Sara    Ahmed   ';

console.log(`[${raw.trim()}]`);
console.log(`[${raw.trimStart()}]`);

const price = '1,250,000';
console.log(price.replace(',', ''));
console.log(price.replaceAll(',', ''));

console.log('7'.padStart(3, '0'));
console.log('-'.repeat(10));
