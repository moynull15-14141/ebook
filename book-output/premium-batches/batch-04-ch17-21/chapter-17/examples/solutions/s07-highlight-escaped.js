const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const query = '1+1=2';
const pattern = new RegExp(escapeRegExp(query), 'g');

console.log('প্রমাণ: 1+1=2, আর 11=2 নয়'.replace(pattern, (match) => `[${match}]`));
