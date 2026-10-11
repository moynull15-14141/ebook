function paymentLabel(method) {
  switch (method) {
    case 'card':
      return 'Card-এ পরিশোধ';
    case 'cash':
      return 'পণ্য হাতে পেয়ে পরিশোধ';
    case 'mobile':
      return 'Mobile Banking';
    default:
      return 'অজানা পদ্ধতি';
  }
}

console.log(paymentLabel('cash'));
console.log(paymentLabel('cheque'));
