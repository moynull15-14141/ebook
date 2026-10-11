import { validateOrder, ValidationError, formatBDT } from './order-core.mjs';
const catalog = Object.freeze({ notebook: { name: 'Notebook', price: 180 }, keyboard: { name: 'Keyboard', price: 1250 }, mouse: { name: 'Mouse', price: 650 } });
const form = document.querySelector('#order-form');
const feedback = document.querySelector('#feedback');
const history = document.querySelector('#history');
const submit = document.querySelector('#submit');
let orders = [];
function render() {
  history.replaceChildren();
  for (const order of orders) {
    const li = document.createElement('li');
    li.textContent = `${order.customer} — ${order.quantity} × ${order.productName} = ${formatBDT(order.total)}`;
    history.append(li);
  }
}
function show(message, error = false) { feedback.textContent = message; feedback.className = error ? 'error' : 'success'; }
form.addEventListener('submit', async event => {
  event.preventDefault();
  submit.disabled = true;
  try {
    const data = new FormData(form);
    const order = validateOrder(Object.fromEntries(data.entries()), catalog);
    await Promise.resolve(); // demo of async boundary; no server persistence
    orders = [order, ...orders];
    render();
    show(`Order accepted: ${formatBDT(order.total)} (demo only)`);
    form.reset();
  } catch (error) {
    if (error instanceof ValidationError) show(error.issues.join(' • '), true);
    else { console.error('Unexpected error', error); show('Unexpected error. Please retry.', true); }
  } finally { submit.disabled = false; }
});
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection', event.reason);
  event.preventDefault();
  show('An unexpected async error occurred.', true);
});
