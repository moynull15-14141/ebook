const words = ['cherry', 'Banana', 'apple'];

console.log([...words].sort());
console.log([...words].sort((a, b) => a.localeCompare(b)));
