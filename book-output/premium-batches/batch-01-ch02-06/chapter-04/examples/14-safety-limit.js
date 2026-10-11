const MAX_STEPS = 1000;
let i = 0;
let steps = 0;

while (i !== 10) {
  i += 3;
  steps++;

  if (steps >= MAX_STEPS) {
    console.log('থামানো হলো: শর্তটি মিথ্যা হচ্ছে না');
    break;
  }
}

console.log(`মোট ধাপ: ${steps}`);
