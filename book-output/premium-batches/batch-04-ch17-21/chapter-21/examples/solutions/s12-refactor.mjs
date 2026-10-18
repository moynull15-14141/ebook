// Domain: বিশুদ্ধ, Browser ছাড়াই Test করা যায়।
export function groupFee(travelers) {
  if (!Number.isInteger(travelers) || travelers < 1) {
    throw new RangeError('যাত্রী একটি ধনাত্মক পূর্ণসংখ্যা');
  }
  return travelers * (travelers > 3 ? 2800 : 3000);
}

// UI ও Storage: পাতলা আবরণ, নির্ভরতা Parameter-এ।
export function onSubmit({ read, save, show }) {
  const fee = groupFee(Number(read('#n')));
  save('fee', fee);
  show('#out', fee);
}

const shown = [];
const show = (_, value) => shown.push(value);
onSubmit({ read: () => '4', save: () => {}, show });
console.log([1, 3, 4].map(groupFee), shown);
