'use strict';

const DELIVERY_FEE = 120;
const FREE_DELIVERY_FROM = 3000;
const MEMBER_PERCENT = 5;
const SAVE20_MINIMUM = 5000;

// Text থেকে শূন্য বা তার বেশি পূর্ণসংখ্যা তৈরি করে; না পারলে null।
function toWholeNumber(text) {
  const clean = text.trim();

  if (clean === '') {
    return null;
  }

  const value = Number(clean);

  if (!Number.isInteger(value) || value < 0) {
    return null;
  }

  return value;
}

// Coupon Code থেকে ছাড়ের শতাংশ দেয়; অচেনা Code হলে null।
function getCouponPercent(code) {
  switch (code) {
    case '':
      return 0;
    case 'SAVE10':
      return 10;
    case 'SAVE20':
      return 20;
    default:
      return null;
  }
}

// দাম, পরিমাণ, Coupon ও সদস্যপদ থেকে হিসাবের একটি বাক্য তৈরি করে।
function calculateOrder(priceText, quantityText, couponText, isMember) {
  const price = toWholeNumber(priceText);
  const quantity = toWholeNumber(quantityText);

  if (price === null) {
    return 'দাম সঠিক নয়।';
  }

  if (quantity === null || quantity < 1 || quantity > 100) {
    return 'পরিমাণ ১ থেকে ১০০-এর মধ্যে হতে হবে।';
  }

  const subtotal = price * quantity;
  const code = couponText.trim().toUpperCase();
  const couponPercent = getCouponPercent(code);

  if (couponPercent === null) {
    return 'Coupon Code সঠিক নয়।';
  }

  if (code === 'SAVE20' && subtotal < SAVE20_MINIMUM) {
    return 'SAVE20-এর জন্য কমপক্ষে 5000 টাকার কেনাকাটা প্রয়োজন।';
  }

  const couponDiscount = Math.round(subtotal * couponPercent / 100);
  const afterCoupon = subtotal - couponDiscount;
  const memberPercent = isMember ? MEMBER_PERCENT : 0;
  const memberDiscount = Math.round(afterCoupon * memberPercent / 100);
  const payable = afterCoupon - memberDiscount;
  const delivery = payable >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
  const discount = couponDiscount + memberDiscount;
  const total = payable + delivery;

  return `মোট ${subtotal}, ছাড় ${discount}, Delivery ${delivery}, দিতে হবে ${total}`;
}

console.log(calculateOrder('1500', '2', 'SAVE10', false));
console.log(calculateOrder('2500', '3', ' save20 ', true));
console.log(calculateOrder('850', '1', '', true));
console.log(calculateOrder('1200', '2', 'SAVE20', false));
console.log(calculateOrder('1200', '0', '', false));
console.log(calculateOrder('1200', '2', 'FREE50', false));
