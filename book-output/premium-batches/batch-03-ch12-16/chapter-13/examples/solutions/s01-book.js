class Book {
  constructor(title, author, pages) {
    this.title = title;
    this.author = author;
    this.pages = pages;
  }

  summary() {
    return `${this.title} — ${this.author} (${this.pages} পৃষ্ঠা)`;
  }
}

console.log(new Book('পথের পাঁচালী', 'বিভূতিভূষণ', 320).summary());
