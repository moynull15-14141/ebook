const text = 'Order 12 এবং Order 345';

console.log(/\d+/.test(text));
console.log(text.match(/\d+/g));
console.log(text.replace(/\d+/g, '#'));
console.log('Sara    Ahmed'.replace(/\s+/g, ' '));
console.log(/^order/i.test(text));
