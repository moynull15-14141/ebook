const address =
  'https://shop.example.com:8080/products/list?category=books&page=2#top';
const url = new URL(address);

console.log(url.hostname, url.port, url.pathname);
const { searchParams } = url;
console.log(searchParams.get('category'), searchParams.get('page'), url.hash);

url.searchParams.set('page', '3');
url.searchParams.append('tag', 'বই');
console.log(url.search);

const relative = new URL('../about', 'https://example.com/docs/intro/');
console.log(relative.href);

try {
  new URL('not a url');
} catch (error) {
  console.log(error.name);
}
