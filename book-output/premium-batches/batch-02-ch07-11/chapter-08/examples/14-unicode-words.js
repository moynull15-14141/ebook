const sentence = 'JavaScript শিখুন, প্রতিদিন ১০ মিনিট!';

console.log(sentence.match(/\w+/g));
console.log(sentence.match(/[\p{L}\p{M}\p{N}]+/gu));
