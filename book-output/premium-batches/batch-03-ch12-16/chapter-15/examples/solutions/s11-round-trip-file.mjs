import {
  createBookmark, exportData, importData,
} from '../../project/bookmark-vault/src/bookmarks.mjs';

const clock = { now: () => new Date('2026-10-15T09:00:00Z'), makeId: () => 'b1' };
const input = { title: 'MDN', url: 'https://developer.mozilla.org/' };
const bookmark = createBookmark(input, clock);

const file = exportData([bookmark], new Date('2026-10-15T10:00:00Z'));
const first = importData(file, []);
const second = importData(file, first.list);

console.log(first.added, first.skipped, first.list[0].title);
console.log(second.added, second.skipped, second.list.length);
