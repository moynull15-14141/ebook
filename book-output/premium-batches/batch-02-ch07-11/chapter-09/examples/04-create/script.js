const list = document.querySelector('#list');

const second = document.createElement('li');
second.textContent = 'দ্বিতীয়';
list.append(second);

const first = document.createElement('li');
first.textContent = 'শুরুতে';
list.prepend(first);

console.log(list.children.length);

list.firstElementChild.remove();
console.log(list.children.length);
console.log(list.lastElementChild.textContent);

list.replaceChildren();
console.log(list.children.length);
