const item = { name: 'Pen' };

console.log('name' in item, Object.hasOwn(item, 'name'));
console.log('toString' in item, Object.hasOwn(item, 'toString'));
