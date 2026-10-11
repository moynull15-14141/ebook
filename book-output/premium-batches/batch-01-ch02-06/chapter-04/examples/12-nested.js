for (let row = 1; row <= 3; row++) {
  let line = '';

  for (let column = 1; column <= 4; column++) {
    line += `${row * column} `;
  }

  console.log(line);
}
