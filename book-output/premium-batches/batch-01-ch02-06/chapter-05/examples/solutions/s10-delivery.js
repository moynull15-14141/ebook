const FREE_DELIVERY_FROM = 300000;

function totalWithDelivery(total, deliveryFee = 6000) {
  return total >= FREE_DELIVERY_FROM ? total : total + deliveryFee;
}

console.log(totalWithDelivery(138112));
console.log(totalWithDelivery(138112, 12000));
console.log(totalWithDelivery(300000));
