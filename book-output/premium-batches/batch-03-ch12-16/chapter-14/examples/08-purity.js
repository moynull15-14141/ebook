let taxPercent = 15;
const impureTotal = (price) => (price * (100 + taxPercent)) / 100;
const pureTotal = (price, percent) => (price * (100 + percent)) / 100;

console.log(impureTotal(100));
taxPercent = 20;
console.log(impureTotal(100), pureTotal(100, 15));

const addTag = (product, tag) => ({ ...product, tags: [...product.tags, tag] });

const pen = Object.freeze({ name: 'Pen', tags: Object.freeze(['stationery']) });
const tagged = addTag(pen, 'sale');
console.log(pen.tags.join(','), '|', tagged.tags.join(','));
