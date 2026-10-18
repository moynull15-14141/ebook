import { PRODUCTS } from './src/catalog.mjs';
import { formatTaka } from './src/money.mjs';
import { createCartStore } from './src/storage.mjs';
import {
  addItem, applyCoupon, cartLines, cartTotals, CartError, setQuantity,
} from './src/cart.mjs';

const store = createCartStore();
let cart = store.load();

const productList = document.querySelector('#products');
const cartList = document.querySelector('#cart-lines');
const emptyView = document.querySelector('#empty');
const totalsView = document.querySelector('#totals');
const message = document.querySelector('#message');
const couponForm = document.querySelector('#coupon-form');

// প্রত্যাশিত ত্রুটি (CartError) বার্তা হয়; অন্য সব ত্রুটি ওপরে যায়।
function change(makeNextCart, successText) {
  try {
    cart = makeNextCart();
  } catch (error) {
    if (!(error instanceof CartError)) {
      throw error;
    }
    message.textContent = error.message;
    renderCart();
    return;
  }
  store.save(cart);
  message.textContent = successText;
  renderCart();
}

function textRow(tag, text) {
  const element = document.createElement(tag);
  element.textContent = text;
  return element;
}

function productRow(product) {
  const button = textRow('button', 'কার্টে যোগ');
  button.type = 'button';
  button.dataset.add = product.id;

  const row = textRow('li', `${product.name}: ${formatTaka(product.price)}`);
  row.append(button);
  return row;
}

function cartRow(line) {
  const quantity = document.createElement('input');
  quantity.type = 'number';
  quantity.className = 'quantity';
  quantity.value = line.quantity;
  quantity.dataset.id = line.id;
  quantity.setAttribute('aria-label', `${line.name}-এর পরিমাণ`);

  const row = textRow('li', line.name);
  row.append(quantity, ` = ${formatTaka(line.lineTotal)}`);
  return row;
}

function renderCart() {
  const lines = cartLines(cart);
  const { subtotal, discount, delivery, total } = cartTotals(cart);

  cartList.replaceChildren(...lines.map(cartRow));
  emptyView.hidden = lines.length > 0;
  totalsView.replaceChildren(
    textRow('p', `মোট দাম: ${formatTaka(subtotal)}`),
    textRow('p', `ছাড় (${cart.coupon ?? 'নেই'}): ${formatTaka(discount)}`),
    textRow('p', `Delivery: ${formatTaka(delivery)}`),
    textRow('p', `পরিশোধ: ${formatTaka(total)}`),
  );
}

productList.addEventListener('click', (event) => {
  const id = event.target.closest('[data-add]')?.dataset.add;
  if (id) {
    change(() => addItem(cart, id), 'কার্টে যোগ হয়েছে।');
  }
});

cartList.addEventListener('change', (event) => {
  const { id } = event.target.dataset;
  change(() => setQuantity(cart, id, Number(event.target.value)), 'পরিমাণ বদলেছে।');
});

couponForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const code = couponForm.elements.coupon.value;
  change(() => applyCoupon(cart, code), 'Coupon প্রয়োগ হয়েছে।');
});

productList.replaceChildren(...PRODUCTS.map(productRow));
renderCart();
