function loadProfile(id, callback) {
  setTimeout(() => {
    if (id <= 0) {
      callback(new Error('ভুল ID'));
      return;
    }
    callback(null, { id, name: 'Sara' });
  }, 100);
}

loadProfile(7, (error, profile) => {
  if (error) {
    console.log(`ব্যর্থ: ${error.message}`);
    return;
  }
  console.log(`পাওয়া গেল: ${profile.name}`);
});

loadProfile(0, (error) => {
  console.log(`ব্যর্থ: ${error.message}`);
});

console.log('অপেক্ষা চলছে...');
