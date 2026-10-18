const cases = [
  () => undefined.x,
  () => missingName,
  () => new Array(-1),
  () => JSON.parse(''),
];

for (const run of cases) {
  try {
    run();
  } catch (error) {
    console.log(error.name);
  }
}
