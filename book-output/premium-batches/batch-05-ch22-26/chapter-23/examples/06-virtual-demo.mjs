import { visibleRange } from '../project/travel-search/src/virtual.mjs';

const list = { viewport: 480, rowHeight: 48, total: 12_000 };
for (const scrollTop of [0, 24, 48_000, 575_520]) {
  const { start, end } = visibleRange({ ...list, scrollTop });
  console.log(`scrollTop ${scrollTop}: সারি ${start} থেকে ${end - 1}, মোট ${end - start}`);
}
