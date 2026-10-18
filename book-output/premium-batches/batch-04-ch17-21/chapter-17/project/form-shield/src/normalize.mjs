// বাংলা অঙ্ক (০-৯) থেকে ইংরেজি অঙ্ক।
export const toAsciiDigits = (text) =>
  text.replace(/[০-৯]/g, (digit) => String(digit.charCodeAt(0) - 0x09e6));

// NFC, আগে-পরে ফাঁকা জায়গা বাদ, মাঝের ফাঁকা জায়গা একটিতে।
export const cleanText = (value) =>
  String(value ?? '').normalize('NFC').replace(/\s+/g, ' ').trim();

export function normalizePhone(value) {
  const digits = toAsciiDigits(cleanText(value)).replace(/[\s\-().]/g, '');
  return digits.replace(/^\+?880/, '0');
}

export const normalizeEmail = (value) => cleanText(value).toLowerCase();
