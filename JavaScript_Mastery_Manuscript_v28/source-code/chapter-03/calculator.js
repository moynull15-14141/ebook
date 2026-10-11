'use strict';

function calculateOrder({ price, quantity, coupon = '', isMember = false }) {
  if (!Number.isSafeInteger(price) || price < 0) {
    throw new RangeError('Price must be a non-negative integer (BDT).');
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    throw new RangeError('Quantity must be an integer from 1 to 100.');
  }
  if (typeof coupon !== 'string' || typeof isMember !== 'boolean') {
    throw new TypeError('Invalid coupon or membership value.');
  }

  const subtotal = price * quantity;
  if (!Number.isSafeInteger(subtotal)) {
    throw new RangeError('Subtotal exceeds safe integer range.');
  }

  const code = coupon.trim().toUpperCase();
  let couponRate = 0;
  switch (code) {
    case '': break;
    case 'SAVE10': couponRate = 0.10; break;
    case 'SAVE20':
      if (subtotal < 5000) throw new RangeError('SAVE20 requires BDT 5,000 subtotal.');
      couponRate = 0.20;
      break;
    default: throw new RangeError('Unknown coupon code.');
  }

  const couponDiscount = Math.round(subtotal * couponRate);
  const afterCoupon = subtotal - couponDiscount;
  const memberDiscount = isMember ? Math.round(afterCoupon * 0.05) : 0;
  const discountedTotal = afterCoupon - memberDiscount;
  const deliveryFee = discountedTotal >= 3000 ? 0 : 120;
  const grandTotal = discountedTotal + deliveryFee;

  return { subtotal, couponDiscount, memberDiscount, discountedTotal, deliveryFee, grandTotal };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculateOrder };
}
