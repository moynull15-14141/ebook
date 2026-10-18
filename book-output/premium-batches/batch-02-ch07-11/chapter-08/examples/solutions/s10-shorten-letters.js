function shortenByLetters(text, count) {
  const segmenter = new Intl.Segmenter('bn', { granularity: 'grapheme' });
  const letters = [...segmenter.segment(text)].map((part) => part.segment);

  if (letters.length <= count) {
    return text;
  }

  return `${letters.slice(0, count).join('')}...`;
}

console.log(shortenByLetters('ক্ষমা চাই', 2));
console.log('ক্ষমা চাই'.slice(0, 2));
