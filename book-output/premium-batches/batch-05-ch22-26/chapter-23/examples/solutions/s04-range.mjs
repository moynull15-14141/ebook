import { visibleRange } from '../../project/travel-search/src/virtual.mjs';

const range = visibleRange({
  scrollTop: 1_000, viewport: 600, rowHeight: 40, total: 500, overscan: 3,
});
console.log(range, range.end - range.start);
