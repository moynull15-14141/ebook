function safeSave(key, value) {
  try {
    localStorage.setItem(key, value);
    return 'সংরক্ষিত';
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      return 'জায়গা শেষ; পুরোনো তথ্য মুছে আবার চেষ্টা করুন।';
    }
    return 'সংরক্ষণ করা যায়নি।';
  }
}

console.log(safeSave('small', 'ok'));
console.log(safeSave('big', 'x'.repeat(11 * 1024 * 1024)));
localStorage.removeItem('small');
