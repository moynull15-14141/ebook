const segmenter = new Intl.Segmenter('bn', { granularity: 'grapheme' });
const text = 'ক্ষমা';
const letters = [...segmenter.segment(text)].map((part) => part.segment);

console.log(letters.length);
console.log(letters.join(' | '));
