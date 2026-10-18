// প্রতিটি কাজের দুটি সংস্করণ: সরল (ধীর) এবং দ্রুত। ফল হুবহু এক হতে হবে।

export const uniqueNested = (items) =>
  items.filter((item, index) => items.indexOf(item) === index);

export const uniqueSet = (items) => [...new Set(items)];

export const commonNested = (a, b) => a.filter((x) => b.includes(x));

export function commonSet(a, b) {
  const lookup = new Set(b);
  return a.filter((x) => lookup.has(x));
}

export const indexOfLinear = (sorted, target) => sorted.indexOf(target);

// সাজানো তালিকায় প্রথম মিলের Index, বা -1। O(log n)।
export function indexOfBinary(sorted, target) {
  let low = 0;
  let high = sorted.length - 1;
  let found = -1;
  while (low <= high) {
    const middle = (low + high) >>> 1;
    if (sorted[middle] < target) {
      low = middle + 1;
    } else {
      if (sorted[middle] === target) {
        found = middle;
      }
      high = middle - 1;
    }
  }
  return found;
}
