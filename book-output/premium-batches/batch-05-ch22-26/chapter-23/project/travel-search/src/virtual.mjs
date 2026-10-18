// Virtual Scrolling-এর হিসাব: কোন সারিগুলো আঁকতে হবে। বিশুদ্ধ Function, তাই
// Browser ছাড়াই Test করা যায়।
export function visibleRange(options) {
  const { scrollTop, viewport, rowHeight, total, overscan = 5 } = options;
  if (total === 0) {
    return { start: 0, end: 0 };
  }
  const first = Math.floor(Math.max(0, scrollTop) / rowHeight);
  const last = Math.ceil((Math.max(0, scrollTop) + viewport) / rowHeight);
  return {
    start: Math.max(0, first - overscan),
    end: Math.min(total, last + overscan),
  };
}

export const offsetOf = (index, rowHeight) => index * rowHeight;
