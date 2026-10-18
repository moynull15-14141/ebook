const fail = (ms, message) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));

try {
  await Promise.any([fail(10, 'Server A বন্ধ'), fail(20, 'Server B বন্ধ')]);
} catch (error) {
  console.log(error.name, error.errors.length);
  console.log(error.errors.map((item) => item.message).join(' | '));
}
