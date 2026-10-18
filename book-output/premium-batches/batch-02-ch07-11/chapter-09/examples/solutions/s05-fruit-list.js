const fruits = ['আম', 'কাঁঠাল', 'লিচু'];
const list = document.createElement('ul');

const items = fruits.map((fruit) => {
  const item = document.createElement('li');
  item.textContent = fruit;
  return item;
});

list.append(...items);
document.body.append(list);

console.log(list.children.length);
console.log(list.lastElementChild.textContent);
