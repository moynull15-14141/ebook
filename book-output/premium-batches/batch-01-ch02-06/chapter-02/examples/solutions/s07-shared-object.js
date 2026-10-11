const book = { title: 'JavaScript Mastery' };
const sameBook = book;

sameBook.title = 'JS Mastery';
console.log(book.title);

const separateBook = { ...book };
separateBook.title = 'অন্য বই';
console.log(book.title);
