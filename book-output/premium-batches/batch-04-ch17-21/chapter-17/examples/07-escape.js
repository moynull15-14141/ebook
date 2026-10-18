const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const query = 'c++ (basic)';
const titles = ['c++ (basic) guide', 'c (basic)', 'cc (basic)'];

try {
  new RegExp(query);
} catch (error) {
  console.log(error.name);
}

const safe = new RegExp(escapeRegExp(query), 'i');
console.log(escapeRegExp(query));
console.log(titles.filter((title) => safe.test(title)).length);
