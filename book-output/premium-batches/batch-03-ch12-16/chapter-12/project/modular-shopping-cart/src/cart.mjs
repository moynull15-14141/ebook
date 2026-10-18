import { findProduct } from './catalog.mjs';

export const MAX_QUANTITY = 10;
export const DELIVERY_FEE = 60;
export const FREE_DELIVERY_FROM = 2000;
const COUPONS = Object.freeze({ STUDENT10: 10, EID15: 15 });

export class CartError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CartError';
  }
}

// কার্ট: { items: [{ id, quantity }], coupon }; প্রতিটি Function নতুন কার্ট ফেরত দেয়।
export const emptyCart = () => ({ items: [], coupon: null });

export const isCoupon = (code) => Object.hasOwn(COUPONS, code);

export function setQuantity(cart, productId, quantity) {
  if (!findProduct(productId)) {
    throw new CartError(`অজানা পণ্য: ${productId}`);
  }
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_QUANTITY) {
    throw new CartError(`পরিমাণ 0 থেকে ${MAX_QUANTITY}-এর মধ্যে পূর্ণসংখ্যা হতে হবে।`);
  }

  const others = cart.items.filter((item) => item.id !== productId);
  if (quantity === 0) {
    return { ...cart, items: others };
  }

  const exists = others.length < cart.items.length;
  const items = exists
    ? cart.items.map((item) =>
      (item.id === productId ? { ...item, quantity } : item))
    : [...cart.items, { id: productId, quantity }];
  return { ...cart, items };
}

export function addItem(cart, productId, quantity = 1) {
  const current = cart.items.find((item) => item.id === productId)?.quantity ?? 0;
  return setQuantity(cart, productId, current + quantity);
}

export const removeItem = (cart, productId) => setQuantity(cart, productId, 0);

export function applyCoupon(cart, code) {
  const normalized = String(code).trim().toUpperCase();

  if (!isCoupon(normalized)) {
    throw new CartError(`Coupon "${String(code).trim()}" সঠিক নয়।`);
  }
  return { ...cart, coupon: normalized };
}

// কার্টের প্রতিটি সারি, পণ্যের নাম ও দামসহ।
export function cartLines(cart) {
  return cart.items.map(({ id, quantity }) => {
    const { name, price } = findProduct(id);
    return { id, name, price, quantity, lineTotal: price * quantity };
  });
}

export function cartTotals(cart) {
  const subtotal = cartLines(cart).reduce((sum, line) => sum + line.lineTotal, 0);
  const percent = isCoupon(cart.coupon) ? COUPONS[cart.coupon] : 0;
  const discount = Math.round((subtotal * percent) / 100);
  const afterDiscount = subtotal - discount;
  const isFree = subtotal === 0 || afterDiscount >= FREE_DELIVERY_FROM;
  const delivery = isFree ? 0 : DELIVERY_FEE;

  return { subtotal, discount, delivery, total: afterDiscount + delivery };
}
