function runStep(input) {
  try {
    console.log('১. চেষ্টা');
    if (input < 0) {
      throw new RangeError('ঋণাত্মক');
    }
    return 'সফল';
  } catch (error) {
    console.log(`২. ধরা পড়েছে: ${error.message}`);
    return 'ব্যর্থ';
  } finally {
    console.log('৩. finally সব সময়');
  }
}

console.log(runStep(5));
console.log(runStep(-1));
