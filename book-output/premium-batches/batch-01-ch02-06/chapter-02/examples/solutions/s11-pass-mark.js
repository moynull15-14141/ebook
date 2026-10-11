const PASS_MARK = 40;

function isPassed(mark) {
  if (mark >= PASS_MARK) {
    return true;
  }

  return false;
}

console.log(isPassed(35));
console.log(isPassed(40));
