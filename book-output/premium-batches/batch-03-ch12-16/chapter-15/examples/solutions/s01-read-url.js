const url = new URL('https://example.com/search?q=dom&page=4');
const page = Number(url.searchParams.get('page'));

console.log(url.hostname, url.searchParams.get('q'), page + 1);
