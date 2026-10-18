// প্রতিটি Pattern Anchor-সহ, কোনো g Flag নেই, কোনো Nested Quantifier নেই।
export const PATTERNS = Object.freeze({
  // 01, তারপর 3-9-এর একটি অঙ্ক, তারপর ঠিক 8টি অঙ্ক: 01712345678
  BD_MOBILE: /^01[3-9]\d{8}$/,
  // @-এর দুই পাশে ফাঁকা জায়গা ও @ ছাড়া কিছু, পরে একটি ডট।
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // ইংরেজি ছোট হাতের অক্ষরে শুরু, তারপর 2-19টি অক্ষর, অঙ্ক বা _
  USERNAME: /^[a-z][a-z0-9_]{2,19}$/,
  // YYYY-MM-DD, অর্থগত যাচাই আলাদা (rules.mjs)
  ISO_DATE: /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/,
  // অক্ষর, কার-চিহ্ন, ফাঁকা জায়গা, ডট, অ্যাপোস্ট্রফি, হাইফেন
  PERSON_NAME: /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u,
});

export const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
