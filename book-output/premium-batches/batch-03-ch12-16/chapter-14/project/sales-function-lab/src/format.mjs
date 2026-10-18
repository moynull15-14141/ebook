import { memoize } from './fp.mjs';

// Intl.NumberFormat তৈরি তুলনামূলক ব্যয়বহুল; প্রতিটি দশমিক-সংখ্যার জন্য একবারই।
export const formatterFor = memoize((decimals) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }));

export const formatTaka = (amount, decimals = 0) =>
  `${formatterFor(decimals).format(amount)} টাকা`;
