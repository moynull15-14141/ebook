// পুরোনো CommonJS File: module.exports দিয়ে দেয়।
const RATE = 0.05;

function sourceTax(amount) {
  return amount * RATE;
}

module.exports = { RATE, sourceTax };
