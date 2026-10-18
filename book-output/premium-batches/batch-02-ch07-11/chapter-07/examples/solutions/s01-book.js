const book = { title: 'JavaScript', author: 'Moynul', price: 500 };
const discounted = { ...book, price: book.price - book.price * 10 / 100 };

console.log(discounted.price);
console.log(book.price);
