const learnerName = 'Nusrat';
let completedLessons = 0;

console.log(learnerName);
console.log(completedLessons);

completedLessons = 1;
console.log(completedLessons);

function createWelcome(name) {
  return `স্বাগতম, ${name}!`;
}

console.log(createWelcome(learnerName));
console.log(createWelcome('Tanvir'));
