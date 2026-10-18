const makeGreeting = (greeting) => (name) => `${greeting}, ${name}!`;

const welcome = makeGreeting('স্বাগতম');
const morning = makeGreeting('শুভ সকাল');

console.log(welcome('Sara'));
console.log(morning('Rafi'));
