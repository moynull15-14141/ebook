import {restoreCart} from './cart.mjs';
const KEY = 'js-mastery-ch12-cart-v1';
export function loadCart() {
  try { return restoreCart(localStorage.getItem(KEY)); } catch { return []; }
}
export function saveCart(cart) {
  try { localStorage.setItem(KEY, JSON.stringify(cart)); return true; }
  catch { return false; }
}
