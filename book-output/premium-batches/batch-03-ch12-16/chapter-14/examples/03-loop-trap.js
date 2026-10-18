const withVar = [];
for (var i = 0; i < 3; i++) {
  withVar.push(() => i);
}

const withLet = [];
for (let j = 0; j < 3; j++) {
  withLet.push(() => j);
}

console.log(withVar.map((fn) => fn()).join(', '));
console.log(withLet.map((fn) => fn()).join(', '));
