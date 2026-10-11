function showTotal(price, quantity) {
  console.log(price * quantity);
}

function getTotal(price, quantity) {
  return price * quantity;
}

const shown = showTotal(120, 3);
const returned = getTotal(120, 3);

console.log(shown);
console.log(returned);
console.log(getTotal(120, 3) + 50);
