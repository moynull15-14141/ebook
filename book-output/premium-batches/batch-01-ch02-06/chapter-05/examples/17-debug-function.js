function applyDiscount(amount, percent) {
  console.log('পেয়েছে:', amount, percent, typeof amount);

  const result = amount - Math.round(amount * percent / 100);

  console.log('ফেরত দিচ্ছে:', result);
  return result;
}

applyDiscount('1000', 10);
