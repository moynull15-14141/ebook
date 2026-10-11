const marks = [72, 28, 45, 91, 60];

const result = marks
  .filter((mark) => mark >= 33)
  .map((mark) => mark + 5);

console.log(result);
