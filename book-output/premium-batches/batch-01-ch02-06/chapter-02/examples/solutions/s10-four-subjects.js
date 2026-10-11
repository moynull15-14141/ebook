function summarize(bangla, english, math, science) {
  const total = bangla + english + math + science;
  const average = total / 4;

  return `মোট ${total}, গড় ${average.toFixed(2)}`;
}

console.log(summarize(80, 90, 70, 85));
