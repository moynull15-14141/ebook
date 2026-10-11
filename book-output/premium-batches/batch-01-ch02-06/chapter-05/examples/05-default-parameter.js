function greet(name = 'অতিথি') {
  return `স্বাগতম, ${name}!`;
}

console.log(greet('Sara'));
console.log(greet());
console.log(greet(undefined));
console.log(greet(null));
