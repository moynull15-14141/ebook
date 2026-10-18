function wait(ms, value) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

function failAfter(ms, message) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

wait(100, 'Sara')
  .then((name) => name.toUpperCase())
  .then((upper) => console.log(`ফল: ${upper}`))
  .catch((error) => console.log(`ত্রুটি: ${error.message}`))
  .finally(() => console.log('প্রথম কাজ শেষ'));

failAfter(200, 'Server বন্ধ')
  .then(() => console.log('এটি চলবে না'))
  .catch((error) => console.log(`ত্রুটি: ${error.message}`))
  .finally(() => console.log('দ্বিতীয় কাজ শেষ'));
