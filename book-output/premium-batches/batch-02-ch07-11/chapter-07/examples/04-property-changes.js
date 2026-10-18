const book = { title: 'JavaScript', price: 500 };

book.author = 'Moynul';
book.price = 450;
console.log(book);

delete book.author;
console.log(book);
console.log(book.author);
