function shippingMessage(amount) {
  if (amount >= 5000) {
    return 'Delivery ফ্রি';
  } else if (amount >= 2000) {
    return 'Delivery-তে অর্ধেক ছাড়';
  } else {
    return 'সাধারণ Delivery';
  }
}

console.log(shippingMessage(6000));
console.log(shippingMessage(2500));
console.log(shippingMessage(500));
