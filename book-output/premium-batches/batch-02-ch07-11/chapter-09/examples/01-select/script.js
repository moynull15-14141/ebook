const title = document.querySelector('#title');
const items = document.querySelectorAll('.tasks li');

console.log(title.textContent);
console.log(items.length);
console.log(items[0].dataset.priority);
console.log(document.querySelector('.done').textContent);
console.log(document.querySelector('#missing'));
console.log([...items].map((item) => item.textContent).join(', '));
