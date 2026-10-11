const first = { name: 'Nila' };
const second = first;

second.name = 'Nila Islam';

console.log(first.name);
console.log(first === second);

const third = { name: 'Nila Islam' };
console.log(first === third);
