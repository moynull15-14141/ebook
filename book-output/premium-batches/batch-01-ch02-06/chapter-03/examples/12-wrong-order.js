function wrongMessage(amount) {
  if (amount >= 2000) {
    return 'Delivery-তে অর্ধেক ছাড়';
  } else if (amount >= 5000) {
    return 'Delivery ফ্রি';
  } else {
    return 'সাধারণ Delivery';
  }
}

console.log(wrongMessage(6000));
