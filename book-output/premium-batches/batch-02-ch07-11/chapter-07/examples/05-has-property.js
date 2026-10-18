const book = { title: 'JavaScript', discount: undefined };

console.log(book.discount === undefined);
console.log(book.author === undefined);

console.log(Object.hasOwn(book, 'discount'));
console.log(Object.hasOwn(book, 'author'));

console.log('toString' in book);
console.log(Object.hasOwn(book, 'toString'));
