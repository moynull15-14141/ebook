// Chapter 8: Search-Friendly Content Tool — pure, testable helpers
const TextTools = (() => {
  const normalize = (value) => String(value ?? '').normalize('NFC').trim();
  const words = (value) => normalize(value).match(/[\p{L}\p{M}\p{N}]+(?:['’][\p{L}\p{M}\p{N}]+)*/gu) ?? [];
  const wordCount = (value) => words(value).length;
  const characterCount = (value) => Array.from(normalize(value)).length; // code points, not graphemes
  const graphemeCount = (value) => {
    const text = normalize(value);
    if (typeof Intl.Segmenter !== 'function') return Array.from(text).length;
    return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].length;
  };
  const slugify = (value) => normalize(value).toLocaleLowerCase('en').replace(/[^\p{L}\p{M}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');
  const excerpt = (value, max = 160) => {
    if (!Number.isInteger(max) || max < 1) throw new RangeError('max must be positive integer');
    const arr = Array.from(normalize(value));
    return arr.length <= max ? arr.join('') : arr.slice(0, max).join('').trimEnd() + '…';
  };
  const frequency = (value) => {
    const result = new Map();
    for (const word of words(value)) {
      const key = word.toLocaleLowerCase();
      result.set(key, (result.get(key) ?? 0) + 1);
    }
    return [...result].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  };
  const search = (value, query) => {
    const source = normalize(value); const needle = normalize(query);
    if (!needle) return [];
    const lowerSource = source.toLocaleLowerCase();
    const lowerNeedle = needle.toLocaleLowerCase();
    const matches = []; let start = 0;
    while (start <= lowerSource.length - lowerNeedle.length) {
      const index = lowerSource.indexOf(lowerNeedle, start);
      if (index === -1) break;
      matches.push({ index, text: source.slice(index, index + needle.length) });
      start = index + Math.max(needle.length, 1);
    }
    return matches;
  };
  const analyze = (value, query = '') => ({
    wordCount: wordCount(value), characterCount: characterCount(value),
    graphemeCount: graphemeCount(value), slug: slugify(value),
    excerpt: excerpt(value), frequency: frequency(value).slice(0, 8),
    matches: search(value, query)
  });
  return { normalize, words, wordCount, characterCount, graphemeCount, slugify, excerpt, frequency, search, analyze };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = TextTools;
