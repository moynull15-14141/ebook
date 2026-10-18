function greet(name) {
  return `স্বাগতম, ${name}`;
}

const actions = { greet, shout: (text) => text.toUpperCase() };
console.log(actions.greet('Sara'), actions.shout('ok'));
console.log(greet.name, greet.length, typeof greet);

function multiplier(factor) {
  return (value) => value * factor;
}

const double = multiplier(2);
const triple = multiplier(3);
console.log(double(21), triple(7));
