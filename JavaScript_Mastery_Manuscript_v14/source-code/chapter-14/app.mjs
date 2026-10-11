import { analyzeSales } from './analytics.mjs';
const sample = [
  { id: 'S01', category: 'Books', quantity: 3, unitPrice: 450 },
  { id: 'S02', category: 'Software', quantity: 2, unitPrice: 2200 },
  { id: 'S03', category: 'Books', quantity: 5, unitPrice: 250 },
  { id: 'S04', category: 'Accessories', quantity: 4, unitPrice: 650 }
];
const filter = document.querySelector('#category');
const table = document.querySelector('#sales-body');
const revenue = document.querySelector('#revenue');
const units = document.querySelector('#units');
const ranking = document.querySelector('#ranking');
const error = document.querySelector('#error');
const categories = ['All', ...new Set(sample.map(row => row.category))];
for (const category of categories) {
  const option = document.createElement('option');
  option.value = category; option.textContent = category; filter.append(option);
}
function render() {
  try {
    const result = analyzeSales(sample, filter.value);
    error.textContent = ''; table.replaceChildren(); ranking.replaceChildren();
    for (const sale of result.rows) {
      const tr = document.createElement('tr');
      for (const value of [sale.id, sale.category, sale.quantity, sale.unitPrice, sale.total]) {
        const td = document.createElement('td'); td.textContent = String(value); tr.append(td);
      }
      table.append(tr);
    }
    revenue.textContent = result.revenue.toLocaleString('en-BD');
    units.textContent = String(result.units);
    for (const [category, amount] of Object.entries(result.byCategory).sort((a,b) => b[1]-a[1])) {
      const li = document.createElement('li'); li.textContent = `${category}: ${amount.toLocaleString('en-BD')}`; ranking.append(li);
    }
  } catch (err) { error.textContent = err.message; }
}
filter.addEventListener('change', render);
render();
