const menu = document.querySelector('#menu');

menu.addEventListener('click', (event) => {
  const button = event.target.closest('button');

  if (!button) {
    return;
  }

  console.log(`অর্ডার: ${button.dataset.item}`);
});

const row = document.createElement('li');
const juice = document.createElement('button');
juice.type = 'button';
juice.dataset.item = 'জুস';
juice.textContent = 'জুস';
row.append(juice);
menu.append(row);
