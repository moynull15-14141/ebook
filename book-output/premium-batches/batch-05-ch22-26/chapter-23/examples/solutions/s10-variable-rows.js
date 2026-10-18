function createVariableList(heights) {
  const tops = [0];
  for (const h of heights) {
    tops.push(tops.at(-1) + h);
  }
  // যে সারির শুরু y-এর ঠিক আগে বা y-এ, তার Index (Binary Search)।
  const rowAt = (y) => {
    let low = 0;
    let high = heights.length - 1;
    while (low < high) {
      const middle = (low + high + 1) >>> 1;
      if (tops[middle] <= y) {
        low = middle;
      } else {
        high = middle - 1;
      }
    }
    return low;
  };
  return {
    totalHeight: tops.at(-1),
    range: (scrollTop, viewport) =>
      ({ start: rowAt(scrollTop), end: rowAt(scrollTop + viewport - 1) + 1 }),
    offsetOf: (index) => tops[index],
  };
}

const list = createVariableList([40, 80, 40, 120, 40, 40, 200, 40]);
const range = JSON.stringify(list.range(100, 150));
console.log(list.totalHeight, range, list.offsetOf(3));
