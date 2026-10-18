const DISCOUNT_RATES = { EID10: 10, NEW5: 5 };

// ভুল: সব ত্রুটি চাপা পড়ে, এমনকি Code-এর বানান ভুলও।
function discountFor(code) {
  try {
    return DISCOUNT_RATE[code.toUpperCase()] ?? 0;
  } catch {
    return 0;
  }
}

// সঠিক: প্রত্যাশিত ক্ষেত্র নিজে যাচাই; বাকি সব ত্রুটি দৃশ্যমান থাকে।
function discountForFixed(code) {
  if (typeof code !== 'string') {
    return 0;
  }
  return DISCOUNT_RATES[code.toUpperCase()] ?? 0;
}

console.log(discountFor('eid10'));
console.log(discountForFixed('eid10'));
console.log(discountForFixed(undefined));
