const input = document.createElement('input');
const list = document.createElement('ul');
input.id = 'item';
document.body.append(input, list);

input.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') {
    return;
  }

  const text = input.value.trim();

  if (text === '') {
    console.log('ফাঁকা; যোগ হলো না');
    return;
  }

  const item = document.createElement('li');
  item.textContent = text;
  list.append(item);
  input.value = '';
  console.log(`যোগ হলো: ${text}; মোট ${list.children.length}`);
});
