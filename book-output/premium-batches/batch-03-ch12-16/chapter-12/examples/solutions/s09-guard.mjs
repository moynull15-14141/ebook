function shippingLabel(order) {
  if (!order) {
    return 'Order নেই';
  }
  if (!order.paid) {
    return 'পরিশোধের অপেক্ষায়';
  }
  if (!order.address) {
    return 'ঠিকানা নেই';
  }
  return `পাঠানো হবে: ${order.address}`;
}

console.log(shippingLabel({ paid: true, address: 'Bogura' }));
console.log(shippingLabel({ paid: false }));
