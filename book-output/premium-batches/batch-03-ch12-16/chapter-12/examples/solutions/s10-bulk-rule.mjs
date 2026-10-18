import {
  cartLines, addItem, emptyCart,
} from '../../project/modular-shopping-cart/src/cart.mjs';

const BULK_ITEM = 'notebook';
const BULK_MIN = 6;
const BULK_OFF_EACH = 10;

export function bulkDiscount(cart) {
  const line = cartLines(cart).find((item) => item.id === BULK_ITEM);
  return line && line.quantity >= BULK_MIN ? line.quantity * BULK_OFF_EACH : 0;
}

console.log(bulkDiscount(addItem(emptyCart(), 'notebook', 5)));
console.log(bulkDiscount(addItem(emptyCart(), 'notebook', 7)));
