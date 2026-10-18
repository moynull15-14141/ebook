const calcTax = (percent, amount) => (amount * percent) / 100;
const vat15 = calcTax.bind(null, 15);

console.log(vat15(1000), vat15(240));
