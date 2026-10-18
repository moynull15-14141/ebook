const toAsciiDigits = (text) =>
  text.replace(/[০-৯]/g, (digit) => String(digit.charCodeAt(0) - 0x09e6));

const price = Number(toAsciiDigits('৳১,২৫০').replace(/[^\d]/g, ''));
console.log(price + 1);
