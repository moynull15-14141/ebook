const list = document.createElement('ul');
document.body.append(list);
const names = Array.from({ length: 500 }, (_, i) => `সারি ${i + 1}`);

// ধীর ধরন: প্রতিটি সারি যোগ, তারপর সঙ্গে সঙ্গে উচ্চতা পড়া (500টি Layout)।
for (const name of names) {
  const item = document.createElement('li');
  item.textContent = name;
  list.append(item);
  void list.offsetHeight;
}
const slowCount = list.children.length;

// দ্রুত ধরন: সব তৈরি, একবারে যোগ, শেষে একবার পড়া (1টি Layout)।
list.replaceChildren(...names.map((name) => {
  const item = document.createElement('li');
  item.textContent = name;
  return item;
}));
const height = list.offsetHeight;

console.log(slowCount, list.children.length, height > 0);
console.log(list.lastElementChild.textContent);
