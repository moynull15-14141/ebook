const a = Array.from({ length: 100 }, (_, i) => i);
const b = Array.from({ length: 100 }, (_, i) => i + 50);

let nestedSteps = 0;
for (const x of a) {
  for (const y of b) {
    nestedSteps += 1;
    if (x === y) {
      break;
    }
  }
}

const lookup = new Set(b);
let setSteps = b.length;
for (const x of a) {
  setSteps += 1;
  lookup.has(x);
}
console.log(nestedSteps, setSteps);
