const BULK_THRESHOLD = 2000;
const BULK_DISCOUNT_RATE = 0.05;
const DELIVERY_FEE = 60;

const lineTotal = (item) => item.price * item.quantity;

function orderTotal(order) {
  if (!order || order.items.length === 0) {
    return 0;
  }

  const subtotal = order.items.reduce((sum, item) => sum + lineTotal(item), 0);

  if (subtotal > BULK_THRESHOLD) {
    return subtotal * (1 - BULK_DISCOUNT_RATE);
  }
  return subtotal + DELIVERY_FEE;
}

const bigOrder = {
  items: [{ price: 250, quantity: 4 }, { price: 1850, quantity: 1 }],
};
console.log(orderTotal(bigOrder));
console.log(orderTotal({ items: [{ price: 120, quantity: 2 }] }));
