const isEligible = (age) => Number.isInteger(age) && age >= 18 && age <= 60;

const boundaries = [17, 18, 60, 61];
console.log(boundaries.map((age) => `${age}:${isEligible(age)}`).join(' '));
