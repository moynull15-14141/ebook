const VAT_RATE = 0.15;

function vatFor(price) {
  return price * VAT_RATE;
}

console.log(vatFor(1000));
