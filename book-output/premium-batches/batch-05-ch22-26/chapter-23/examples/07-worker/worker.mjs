addEventListener('message', ({ data: limit }) => {
  let sum = 0;
  for (let n = 1; n <= limit; n += 1) {
    sum += n;
  }
  postMessage(sum);
});
