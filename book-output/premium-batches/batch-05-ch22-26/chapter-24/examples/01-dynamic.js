function totalPrice(price, quantity) {
  return price * quantity;
}

function addFee(total, fee) {
  return total + fee;
}

const quantityFromForm = '2';
const total = totalPrice(1500, quantityFromForm);
console.log(total, addFee(total, '50'));
