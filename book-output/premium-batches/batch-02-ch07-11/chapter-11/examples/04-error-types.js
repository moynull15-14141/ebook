const attempts = [
  () => null.length,
  () => notDeclared + 1,
  () => (12.5).toFixed(500),
  () => JSON.parse('{bad'),
  () => decodeURIComponent('%'),
];

for (const attempt of attempts) {
  try {
    attempt();
  } catch (error) {
    console.log(`${error.name}, Error-ও? ${error instanceof Error}`);
  }
}
