import { findProduct } from './catalog.mjs';
import { emptyCart, isCoupon, MAX_QUANTITY } from './cart.mjs';

const STORAGE_KEY = 'jsm-ch12-cart';

const isItem = (item) =>
  findProduct(item?.id) !== null &&
  Number.isInteger(item.quantity) &&
  item.quantity >= 1 && item.quantity <= MAX_QUANTITY;

const isCart = (value) =>
  Array.isArray(value?.items) && value.items.every(isItem) &&
  (value.coupon === null || isCoupon(value.coupon));

// storage Inject করা যায়: Browser-এ localStorage, Test-এ একটি নকল Object।
export function createCartStore(
  storage = globalThis.localStorage,
  key = STORAGE_KEY,
) {
  return {
    load() {
      try {
        const data = JSON.parse(storage.getItem(key) ?? 'null');
        return isCart(data) ? data : emptyCart();
      } catch {
        return emptyCart();
      }
    },
    save(cart) {
      try {
        storage.setItem(key, JSON.stringify(cart));
        return true;
      } catch {
        return false;
      }
    },
  };
}
