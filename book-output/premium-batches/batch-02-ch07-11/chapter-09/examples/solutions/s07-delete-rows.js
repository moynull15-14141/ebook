const list = document.createElement('ul');

for (const name of ['ক', 'খ', 'গ']) {
  const row = document.createElement('li');
  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.dataset.name = name;
  removeButton.textContent = `মুছুন ${name}`;
  row.append(removeButton);
  list.append(row);
}
document.body.append(list);

list.addEventListener('click', (event) => {
  const button = event.target.closest('button');

  if (!button) {
    return;
  }

  button.closest('li').remove();
  console.log(`${button.dataset.name} মুছে গেছে; বাকি ${list.children.length}`);
});
