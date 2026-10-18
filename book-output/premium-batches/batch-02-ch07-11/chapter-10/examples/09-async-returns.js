async function getAnswer() {
  return 42;
}

const result = getAnswer();
console.log(result);
console.log(result instanceof Promise);
result.then((value) => console.log(value));
