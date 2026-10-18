function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

const search = debounce((text) => console.log(`খোঁজা হলো: ${text}`), 300);

// ব্যবহারকারী দ্রুত লিখছেন: প্রতি 100 ms-এ একটি নতুন অক্ষর।
['J', 'Ja', 'Jav', 'Java'].forEach((text, index) => {
  setTimeout(() => search(text), index * 100);
});
setTimeout(() => search('JavaScript'), 900);
