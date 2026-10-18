const vat = (price) => Math.round(price * 1.15);

const total1 = vat(1000) + vat(1000);
const once = vat(1000);
const total2 = once + once;
console.log(total1 === total2);

let counter = 0;
const nextId = () => {
  counter += 1;
  return counter;
};

const ids1 = [nextId(), nextId()];
const single = nextId();
const ids2 = [single, single];
console.log(ids1.join(','), ids2.join(','));
