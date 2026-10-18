console.log(Number(''), Number('  '), Number('1e3'), Number('0x10'));
console.log(Number('12abc'), parseInt('12abc', 10), parseFloat('2.5kg'));

const strictInteger = (text) =>
  (/^[1-9]\d*$/.test(text.trim()) ? Number(text) : null);

console.log(strictInteger('12'), strictInteger(''), strictInteger('1e3'));
