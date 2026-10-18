const toAsciiDigits = (text) =>
  text.replace(/[০-৯]/g, (digit) => String(digit.charCodeAt(0) - 0x09e6));

function normalizePhone(raw) {
  const digits = toAsciiDigits(raw.normalize('NFC')).replace(/[\s\-().]/g, '');
  return digits.replace(/^(?:\+?880)/, '0');
}

const BD_MOBILE = /^01[3-9]\d{8}$/;

for (const raw of ['+880 1712-345678', '০১৭১২ ৩৪৫৬৭৮', '8801512345678', '01212345678']) {
  const phone = normalizePhone(raw);
  console.log(phone, BD_MOBILE.test(phone));
}
