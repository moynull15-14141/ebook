const params = new URLSearchParams({ q: 'js & dom', sort: 'new' });
console.log(params.toString());

for (const [key, value] of params) {
  console.log(`${key} = ${value}`);
}

const fromAddress = new URLSearchParams('?page=abc&size=20');
const page = Number(fromAddress.get('page'));
console.log(Number.isInteger(page) ? page : 1, fromAddress.get('missing'));
