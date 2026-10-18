function checkStock(product) {
  return product.stock > 0;
}

function addToCart(cart, product) {
  if (checkStock(product)) {
    cart.push(product);
  }
}

addToCart([], undefined);
