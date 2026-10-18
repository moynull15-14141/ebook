const a = { id: 1 };
const b = { id: 1 };
const c = a;

console.log(a === b);
console.log(a === c);
console.log(JSON.stringify(a) === JSON.stringify(b));
