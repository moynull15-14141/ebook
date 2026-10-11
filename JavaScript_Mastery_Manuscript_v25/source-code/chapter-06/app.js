const STORAGE_KEY = 'js-mastery-ch06-inventory-v1';
const defaults = [
  { id: 'P101', name: 'Wireless Mouse', category: 'Accessories', price: 850, stock: 12 },
  { id: 'P102', name: 'USB-C Cable', category: 'Accessories', price: 350, stock: 3 },
  { id: 'P103', name: 'Notebook', category: 'Stationery', price: 120, stock: 25 },
  { id: 'P104', name: 'Desk Lamp', category: 'Electronics', price: 1750, stock: 2 }
];
function loadInventory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return defaults.map(item => ({ ...item }));
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) throw new Error('Invalid saved inventory');
    const validated = data.map(Inventory.validateProduct);
    if (new Set(validated.map(item => item.id)).size !== validated.length) throw new Error('Duplicate IDs');
    return validated;
  } catch (error) {
    document.querySelector('#status').textContent = 'Saved data could not be loaded. Showing sample inventory.';
    return defaults.map(item => ({ ...item }));
  }
}
let products = loadInventory();
const $ = selector => document.querySelector(selector);
const money = amount => `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); }
function render() {
  const summary = Inventory.summarize(products);
  $('#total-products').textContent = summary.productCount;
  $('#total-units').textContent = summary.totalUnits;
  $('#inventory-value').textContent = money(summary.totalValueCents / 100);
  $('#low-stock').textContent = summary.lowStockCount;
  const categories = [...new Set(products.map(p => p.category))].sort();
  const selected = $('#category').value;
  $('#category').replaceChildren(new Option('All categories', 'all'), ...categories.map(c => new Option(c, c)));
  $('#category').value = categories.includes(selected) ? selected : 'all';
  const visible = Inventory.sortProducts(Inventory.filterProducts(products, {
    query: $('#search').value, category: $('#category').value, lowStockOnly: $('#low-only').checked
  }), $('#sort-by').value, $('#direction').value);
  const tbody = $('#inventory-rows');
  tbody.replaceChildren();
  for (const product of visible) {
    const row = document.createElement('tr');
    for (const value of [product.id, product.name, product.category, money(product.price), product.stock, money(product.price * product.stock)]) {
      const cell = document.createElement('td'); cell.textContent = value; row.append(cell);
    }
    const actions = document.createElement('td');
    for (const [label, action] of [['+1', 'increase'], ['−1', 'decrease'], ['Delete', 'delete']]) {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = label; button.dataset.id = product.id; button.dataset.action = action;
      actions.append(button);
    }
    row.append(actions); tbody.append(row);
  }
  $('#visible-count').textContent = `${visible.length} matching products`;
}
$('#product-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  try {
    const data = new FormData(form);
    products = Inventory.addProduct(products, Object.fromEntries(data));
    save(); form.reset(); $('#status').textContent = 'Product added.'; render();
  } catch (error) { $('#status').textContent = error.message; }
});
$('#inventory-rows').addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const { id, action } = button.dataset;
  try {
    if (action === 'delete') {
      if (!confirm(`Delete ${id}?`)) return;
      products = Inventory.removeProduct(products, id);
    } else products = Inventory.updateStock(products, id, action === 'increase' ? 1 : -1);
    save(); $('#status').textContent = 'Inventory updated.'; render();
  } catch (error) { $('#status').textContent = error.message; }
});
for (const selector of ['#search', '#category', '#low-only', '#sort-by', '#direction']) {
  $(selector).addEventListener('input', render);
}
$('#reset').addEventListener('click', () => {
  if (!confirm('Restore sample products? This replaces saved data.')) return;
  products = defaults.map(item => ({ ...item })); save(); render(); $('#status').textContent = 'Sample inventory restored.';
});
render();
