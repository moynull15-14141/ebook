const huge = 'x'.repeat(11 * 1024 * 1024);

try {
  localStorage.setItem('huge', huge);
  console.log('সংরক্ষিত');
} catch (error) {
  console.log(`ব্যর্থ: ${error.name}`);
}
console.log(localStorage.getItem('huge'));
