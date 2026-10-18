import {
  filtersToSearch, readFilters,
} from '../../project/bookmark-vault/src/url-state.mjs';

const cases = [
  { query: 'node & npm', tag: 'docs', favoritesOnly: true },
  { query: '', tag: '', favoritesOnly: false },
  { query: 'বাংলা', tag: '', favoritesOnly: false },
];

for (const filters of cases) {
  const search = filtersToSearch(filters);
  const back = readFilters(search);
  console.log(JSON.stringify(back) === JSON.stringify(filters), search || '(ফাঁকা)');
}
