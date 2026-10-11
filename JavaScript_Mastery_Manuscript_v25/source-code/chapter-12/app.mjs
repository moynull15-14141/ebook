import {CATALOG, addItem, updateQuantity, removeItem, summarizeCart, money} from './cart.mjs';
import {loadCart, saveCart} from './storage.mjs';

let cart = loadCart();
const products = document.querySelector('#products');
const lines = document.querySelector('#cart-lines');
const summary = document.querySelector('#summary');
const status = document.querySelector('#status');

function node(tag, text, className = '') {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}
function button(label, handler) {
  const element = node('button', label);
  element.type = 'button'; element.addEventListener('click', handler);
  return element;
}
function commit(next) {
  cart = next;
  status.textContent = saveCart(cart) ? 'Saved in this browser' : 'Storage unavailable; changes remain in this tab';
  render();
}
function render() {
  products.replaceChildren(); lines.replaceChildren();
  for (const product of CATALOG) {
    const card = node('article', '', 'product');
    card.append(node('h3', product.name), node('p', money(product.price)), button('Add to cart', () => commit(addItem(cart, product.id))));
    products.append(card);
  }
  const totals = summarizeCart(cart);
  if (!totals.lines.length) lines.append(node('p', 'Your cart is empty.'));
  for (const item of totals.lines) {
    const row = node('div', '', 'cart-row');
    const input = document.createElement('input'); input.type = 'number'; input.min = '0'; input.max = '999'; input.step = '1'; input.value = String(item.quantity);
    input.setAttribute('aria-label', `Quantity for ${item.name}`);
    input.addEventListener('change', () => {
      const value = Number(input.value);
      if (!Number.isSafeInteger(value) || value < 0 || value > 999) { status.textContent = 'Enter a whole quantity from 0 to 999'; render(); return; }
      commit(updateQuantity(cart, item.id, value));
    });
    row.append(node('strong', item.name), input, node('span', money(item.lineTotal)), button('Remove', () => commit(removeItem(cart, item.id))));
    lines.append(row);
  }
  summary.textContent = `Items: ${totals.count} | Subtotal: ${money(totals.subtotal)} | Total: ${money(totals.total)}`;
}
render();
