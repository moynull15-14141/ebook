function throttle(fn, ms) {
  let last = -Infinity;

  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...args);
    }
  };
}

let runs = 0;
const onScroll = throttle(() => {
  runs += 1;
}, 180);

for (let t = 0; t < 500; t += 50) {
  setTimeout(onScroll, t);
}
setTimeout(() => console.log(`10টি ঘটনা, কাজ হলো ${runs} বার`), 600);
