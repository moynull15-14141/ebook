export function readFilters(search) {
  const params = new URLSearchParams(search);
  return {
    query: params.get('q') ?? '',
    tag: params.get('tag') ?? '',
    favoritesOnly: params.get('fav') === '1',
  };
}

export function filtersToSearch({ query, tag, favoritesOnly }) {
  const params = new URLSearchParams();
  if (query.trim() !== '') {
    params.set('q', query.trim());
  }
  if (tag !== '') {
    params.set('tag', tag);
  }
  if (favoritesOnly) {
    params.set('fav', '1');
  }
  const text = params.toString();
  return text === '' ? '' : `?${text}`;
}
