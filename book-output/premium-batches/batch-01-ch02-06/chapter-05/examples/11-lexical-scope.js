const currency = 'টাকা';

function format(amount) {
  return `${amount} ${currency}`;
}

function report() {
  const currency = 'ডলার';
  return format(100);
}

console.log(report());
