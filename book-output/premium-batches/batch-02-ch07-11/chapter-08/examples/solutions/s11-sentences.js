function countSentences(text) {
  return text
    .split(/[।?!]/)
    .filter((part) => part.trim() !== '').length;
}

console.log(countSentences('আমি শিখছি। আপনি? খুব ভালো!'));
console.log(countSentences(''));
