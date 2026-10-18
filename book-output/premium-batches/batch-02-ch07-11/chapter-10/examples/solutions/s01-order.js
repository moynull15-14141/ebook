console.log('ক');
setTimeout(() => console.log('খ'), 0);
Promise.resolve().then(() => console.log('গ'));
console.log('ঘ');
