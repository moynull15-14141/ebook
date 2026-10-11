const fruits = ['আম', 'কলা', 'লিচু'];

console.log(fruits[0]);
console.log(fruits[fruits.length - 1]);
console.log(fruits.at(-1));
console.log(fruits[5]);

fruits[1] = 'কাঁঠাল';
console.log(fruits);

console.log(fruits.includes('লিচু'));
console.log(fruits.indexOf('লিচু'));
console.log(fruits.indexOf('জাম'));
