import {
  emptyCart, addItem, applyCoupon, cartTotals, setQuantity,
} from './src/cart.mjs';
import { formatTaka } from './src/money.mjs';

let cart = emptyCart();
cart = addItem(cart, 'notebook', 2);
cart = addItem(cart, 'backpack');
console.log(cartTotals(cart));

cart = applyCoupon(cart, ' student10 ');
console.log(cartTotals(cart));

try {
  setQuantity(cart, 'notebook', 11);
} catch (error) {
  console.log(`${error.name}: ${error.message}`);
}
console.log(`পরিশোধ: ${formatTaka(cartTotals(cart).total)}`);
