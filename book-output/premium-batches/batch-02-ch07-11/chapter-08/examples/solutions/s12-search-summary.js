function findAll(text, query) {
  const haystack = text.normalize('NFC').toLowerCase();
  const needle = query.normalize('NFC').toLowerCase().trim();
  const positions = [];
  let index = needle === '' ? -1 : haystack.indexOf(needle);

  while (index !== -1) {
    positions.push(index);
    index = haystack.indexOf(needle, index + needle.length);
  }

  return positions;
}

function searchSummary(text, query) {
  const positions = findAll(text, query);

  if (positions.length === 0) {
    return 'পাওয়া যায়নি';
  }

  const start = Math.max(0, positions[0] - 10);
  const around = text.slice(start, positions[0] + query.length + 10);

  return `${positions.length} বার পাওয়া গেছে: "...${around}..."`;
}

console.log(searchSummary('Node.js দিয়ে Server চালান, Node.js শিখুন', 'node'));
console.log(searchSummary('কিছু লেখা', 'JavaScript'));
