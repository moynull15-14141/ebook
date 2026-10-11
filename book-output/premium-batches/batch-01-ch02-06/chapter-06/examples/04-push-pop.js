const queue = ['Sara', 'Rafi'];

const newLength = queue.push('Mina');
console.log(newLength);
console.log(queue);

const last = queue.pop();
console.log(last);

queue.unshift('Nila');
console.log(queue);

const first = queue.shift();
console.log(first);
console.log(queue);
