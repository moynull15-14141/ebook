// দুটি খোঁজ: সরল (প্রতিবার সব Record স্ক্যান) এবং Index-ভিত্তিক।
// দুটির ফল হুবহু এক হতে হবে; Test তা যাচাই করে।
const words = (text) => text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
const textOf = (r) => `${r.title} ${r.place} ${r.kind}`;

const SORTS = {
  relevance: (a, b) => a.id - b.id,
  price: (a, b) => a.price - b.price || a.id - b.id,
  rating: (a, b) => b.rating - a.rating || a.id - b.id,
};

function finish(records, { maxPrice = Infinity, sort = 'relevance' }) {
  return records.filter((r) => r.price <= maxPrice).sort(SORTS[sort]);
}

// প্রতিটি প্রশ্নের শব্দ কোনো Record-এর কোনো শব্দের শুরু হতে হবে।
export function naiveSearch(records, query, options = {}) {
  const terms = words(query);
  const hits = records.filter((r) => {
    const own = words(textOf(r));
    return terms.every((t) => own.some((w) => w.startsWith(t)));
  });
  return finish(hits, options);
}

// Index: সাজানো শব্দের তালিকা এবং প্রতিটি শব্দের Record-গুলো।
export function buildIndex(records) {
  const postings = new Map();
  for (const r of records) {
    for (const w of new Set(words(textOf(r)))) {
      if (!postings.has(w)) {
        postings.set(w, []);
      }
      postings.get(w).push(r);
    }
  }
  return { records, postings, sorted: [...postings.keys()].sort() };
}

// একটি Prefix-এর সব শব্দ: সাজানো তালিকায় Binary Search, তারপর পরপর।
function wordsWithPrefix(sorted, prefix) {
  let low = 0;
  let high = sorted.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (sorted[middle] < prefix) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  const found = [];
  for (let i = low; i < sorted.length && sorted[i].startsWith(prefix); i += 1) {
    found.push(sorted[i]);
  }
  return found;
}

export function indexedSearch(index, query, options = {}) {
  let result = null;
  for (const term of words(query)) {
    const matches = new Set();
    for (const word of wordsWithPrefix(index.sorted, term)) {
      index.postings.get(word).forEach((r) => matches.add(r));
    }
    result = result === null
      ? matches
      : new Set([...result].filter((r) => matches.has(r)));
  }
  return finish(result === null ? index.records : [...result], options);
}
