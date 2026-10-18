function readPage(search) {
  const page = Number(new URLSearchParams(search).get('page'));
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

console.log(readPage('?page=3'), readPage('?page=0'), readPage('?page=2.5'));
console.log(readPage('?page=abc'), readPage(''));
