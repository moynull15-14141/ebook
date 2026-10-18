const state = { items: [{ name: 'বই', price: 250 }] };

const cartView = document.querySelector('#cart');
const totalView = document.querySelector('#total');

function render() {
  const rows = state.items.map((item) => {
    const row = document.createElement('li');
    row.textContent = `${item.name}: ${item.price} টাকা`;
    return row;
  });
  const total = state.items.reduce((sum, item) => sum + item.price, 0);

  cartView.replaceChildren(...rows);
  totalView.textContent = `মোট ${total} টাকা`;
  console.log(`${rows.length}টি জিনিস, ${totalView.textContent}`);
}

document.querySelector('#add-tea').addEventListener('click', () => {
  state.items = [...state.items, { name: 'চা', price: 20 }];
  render();
});

render();
