const rate = 5;

function outer() {
  const rate = 10;

  function inner() {
    return rate;
  }

  return inner();
}

console.log(outer());
console.log(rate);
