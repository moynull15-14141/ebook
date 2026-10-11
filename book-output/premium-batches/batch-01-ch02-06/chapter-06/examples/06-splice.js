const letters = ['a', 'b', 'c', 'd', 'e'];

const removed = letters.splice(1, 2);
console.log(removed);
console.log(letters);

letters.splice(1, 0, 'x');
console.log(letters);

letters.splice(0, 1, 'z');
console.log(letters);
